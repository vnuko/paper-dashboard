import {
  listLinks,
  getLink,
  createLink,
  updateLink,
  deleteLink,
  LinkStoreError,
} from '../../lib/links';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    link: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
    },
    dashboard: {
      findUnique: jest.fn(),
    },
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

import { PrismaClient } from '@prisma/client';

const mockedPrisma = new PrismaClient() as jest.Mocked<any>;

describe('Link Helpers', () => {
  const mockDashboardId = 'dashboard-1';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listLinks', () => {
    it('should return links ordered by position in ascending order', async () => {
      const mockLinks = [
        { id: '1', title: 'Link A', position: 0, dashboardId: mockDashboardId },
        { id: '2', title: 'Link B', position: 1, dashboardId: mockDashboardId },
      ];

      mockedPrisma.link.findMany.mockResolvedValue(mockLinks);

      const result = await listLinks();

      expect(result).toEqual(mockLinks);
      expect(mockedPrisma.link.findMany).toHaveBeenCalledWith({
        orderBy: { position: 'asc' },
        where: undefined,
      });
    });

    it('should filter by dashboardId when provided', async () => {
      const mockLinks = [
        { id: '1', title: 'Link A', position: 0, dashboardId: mockDashboardId },
      ];

      mockedPrisma.link.findMany.mockResolvedValue(mockLinks);

      const result = await listLinks(mockDashboardId);

      expect(result).toEqual(mockLinks);
      expect(mockedPrisma.link.findMany).toHaveBeenCalledWith({
        orderBy: { position: 'asc' },
        where: { dashboardId: mockDashboardId },
      });
    });

    it('should throw LinkStoreError if listLinks fails', async () => {
      mockedPrisma.link.findMany.mockRejectedValue(new Error('Database error'));

      await expect(listLinks()).rejects.toThrow(LinkStoreError);
      await expect(listLinks()).rejects.toMatchObject({
        code: 'LIST_LINKS_ERROR',
        message: expect.stringContaining('Failed to list links'),
      });
    });
  });

  describe('getLink', () => {
    it('should return a single link by ID', async () => {
      const mockLink = {
        id: '1',
        title: 'Link A',
        position: 0,
        dashboardId: mockDashboardId,
      };

      mockedPrisma.link.findUnique.mockResolvedValue(mockLink);

      const result = await getLink('1');

      expect(result).toEqual(mockLink);
      expect(mockedPrisma.link.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('createLink', () => {
    const validLinkData = {
      title: 'New Link',
      description: 'New Link Description',
      url: 'http://example.com',
      position: 3,
      iconKey: 'example-icon.svg',
      dashboardId: mockDashboardId,
    };

    it('should create a new link with valid data', async () => {
      mockedPrisma.dashboard.findUnique.mockResolvedValue({
        id: mockDashboardId,
      });
      mockedPrisma.link.create.mockResolvedValue(validLinkData);

      const result = await createLink(validLinkData);

      expect(result).toEqual(validLinkData);
      expect(mockedPrisma.link.create).toHaveBeenCalledWith({
        data: validLinkData,
      });
    });

    it('should validate URL format properly', async () => {
      const invalidData = {
        ...validLinkData,
        url: 'not-a-url',
      };

      await expect(createLink(invalidData)).rejects.toThrow(LinkStoreError);
      await expect(createLink(invalidData)).rejects.toMatchObject({
        code: 'INVALID_URL',
        message: 'Invalid URL format',
      });
    });

    it('should throw error if dashboardId is missing', async () => {
      const invalidData = { ...validLinkData, dashboardId: '' };

      await expect(createLink(invalidData)).rejects.toThrow(LinkStoreError);
      await expect(createLink(invalidData)).rejects.toMatchObject({
        code: 'INVALID_DASHBOARD_ID',
      });
    });

    it('should throw error if dashboard not found', async () => {
      mockedPrisma.dashboard.findUnique.mockResolvedValue(null);

      await expect(createLink(validLinkData)).rejects.toThrow(LinkStoreError);
      await expect(createLink(validLinkData)).rejects.toMatchObject({
        code: 'DASHBOARD_NOT_FOUND',
      });
    });
  });

  describe('updateLink', () => {
    const updateData = {
      title: 'Updated Title',
      url: 'http://updated.com',
    };

    it('should update an existing link', async () => {
      const mockUpdatedLink = {
        id: '1',
        title: 'Updated Title',
        url: 'http://updated.com',
        position: 0,
        dashboardId: mockDashboardId,
      };

      mockedPrisma.link.update.mockResolvedValue(mockUpdatedLink);

      const result = await updateLink('1', updateData);

      expect(result).toEqual(mockUpdatedLink);
      expect(mockedPrisma.link.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
    });

    it('should validate URL format when updating', async () => {
      const invalidUpdateData = { url: 'not-a-url' };

      await expect(updateLink('1', invalidUpdateData)).rejects.toThrow(
        LinkStoreError
      );
      await expect(updateLink('1', invalidUpdateData)).rejects.toMatchObject({
        code: 'INVALID_URL',
        message: 'Invalid URL format',
      });
    });
  });

  describe('deleteLink', () => {
    it('should delete a link by ID', async () => {
      mockedPrisma.link.delete.mockResolvedValue({
        id: '1',
        title: 'Deleted Link',
        position: 0,
        dashboardId: mockDashboardId,
      });

      const result = await deleteLink('1');

      expect(result).toBe(true);
      expect(mockedPrisma.link.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
