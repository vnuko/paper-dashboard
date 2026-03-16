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
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

import { PrismaClient } from '@prisma/client';

const mockedPrisma = new PrismaClient() as jest.Mocked<any>;

describe('Link Helpers', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listLinks', () => {
    it('should return links ordered by position in ascending order', async () => {
      const mockLinks = [
        { id: '1', title: 'Link A', position: 0 },
        { id: '2', title: 'Link B', position: 1 },
        { id: '3', title: 'Link C', position: 2 },
      ];

      mockedPrisma.link.findMany.mockResolvedValue(mockLinks);

      const result = await listLinks();

      expect(result).toEqual(mockLinks);
      expect(mockedPrisma.link.findMany).toHaveBeenCalledWith({
        orderBy: { position: 'asc' },
      });
    });

    it('should limit results when limit parameter is provided', async () => {
      const mockLinks = [{ id: '1', title: 'Link A', position: 0 }];

      mockedPrisma.link.findMany.mockResolvedValue(mockLinks);

      const result = await listLinks(1);

      expect(result).toEqual(mockLinks);
      expect(mockedPrisma.link.findMany).toHaveBeenCalledWith({
        orderBy: { position: 'asc' },
        take: 1,
      });
    });

    it('should throw LinkStoreError if listLinks fails', async () => {
      const mockError = new Error('Database error');
      mockedPrisma.link.findMany.mockRejectedValue(mockError);

      await expect(listLinks()).rejects.toThrow(LinkStoreError);
      await expect(listLinks()).rejects.toMatchObject({
        code: 'LIST_LINKS_ERROR',
        message: expect.stringContaining('Failed to list links'),
      });
    });
  });

  describe('getLink', () => {
    it('should return a single link by ID', async () => {
      const mockLink = { id: '1', title: 'Link A', position: 0 };

      mockedPrisma.link.findUnique.mockResolvedValue(mockLink);

      const result = await getLink('1');

      expect(result).toEqual(mockLink);
      expect(mockedPrisma.link.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw LinkStoreError if getLink fails', async () => {
      const mockError = new Error('Database error');
      mockedPrisma.link.findUnique.mockRejectedValue(mockError);

      await expect(getLink('1')).rejects.toThrow(LinkStoreError);
      await expect(getLink('1')).rejects.toMatchObject({
        code: 'GET_LINK_ERROR',
        message: expect.stringContaining('Failed to get link'),
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
    };

    it('should create a new link with valid data', async () => {
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

    it('should throw LinkStoreError if createLink fails', async () => {
      const mockError = new Error('Database error');
      mockedPrisma.link.create.mockRejectedValue(mockError);

      await expect(createLink(validLinkData)).rejects.toThrow(LinkStoreError);
      await expect(createLink(validLinkData)).rejects.toMatchObject({
        code: 'CREATE_LINK_ERROR',
        message: expect.stringContaining('Failed to create link'),
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

    it('should throw LinkStoreError if updateLink fails', async () => {
      const mockError = new Error('Database error');
      mockedPrisma.link.update.mockRejectedValue(mockError);

      await expect(updateLink('1', updateData)).rejects.toThrow(LinkStoreError);
      await expect(updateLink('1', updateData)).rejects.toMatchObject({
        code: 'UPDATE_LINK_ERROR',
        message: expect.stringContaining('Failed to update link'),
      });
    });
  });

  describe('deleteLink', () => {
    it('should delete a link by ID', async () => {
      mockedPrisma.link.delete.mockResolvedValue({
        id: '1',
        title: 'Deleted Link',
        position: 0,
      });

      const result = await deleteLink('1');

      expect(result).toBe(true);
      expect(mockedPrisma.link.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw LinkStoreError if deleteLink fails', async () => {
      const mockError = new Error('Database error');
      mockedPrisma.link.delete.mockRejectedValue(mockError);

      await expect(deleteLink('1')).rejects.toThrow(LinkStoreError);
      await expect(deleteLink('1')).rejects.toMatchObject({
        code: 'DELETE_LINK_ERROR',
        message: expect.stringContaining('Failed to delete link'),
      });
    });
  });
});
