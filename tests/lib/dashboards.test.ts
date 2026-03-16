import {
  listDashboards,
  getDashboard,
  getDashboardWithLinks,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  DashboardStoreError,
  getMaxDashboards,
} from '../../lib/dashboards';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    dashboard: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    link: {
      count: jest.fn(),
    },
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

import { PrismaClient } from '@prisma/client';

const mockedPrisma = new PrismaClient() as jest.Mocked<any>;

describe('Dashboard Helpers', () => {
  beforeEach(() => {
    process.env.MAX_DASHBOARDS = '3';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMaxDashboards', () => {
    it('should return the configured max dashboards value', () => {
      expect(getMaxDashboards()).toBe(3);
    });

    it('should return default value of 3 when env not set', () => {
      delete process.env.MAX_DASHBOARDS;
      expect(getMaxDashboards()).toBe(3);
      process.env.MAX_DASHBOARDS = '3';
    });
  });

  describe('listDashboards', () => {
    it('should return dashboards ordered by createdAt ascending', async () => {
      const mockDashboards = [
        { id: '1', title: 'Dashboard A', createdAt: new Date('2024-01-01') },
        { id: '2', title: 'Dashboard B', createdAt: new Date('2024-01-02') },
      ];

      mockedPrisma.dashboard.findMany.mockResolvedValue(mockDashboards);

      const result = await listDashboards();

      expect(result).toEqual(mockDashboards);
      expect(mockedPrisma.dashboard.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'asc' },
      });
    });

    it('should throw DashboardStoreError if listDashboards fails', async () => {
      mockedPrisma.dashboard.findMany.mockRejectedValue(
        new Error('Database error')
      );

      await expect(listDashboards()).rejects.toThrow(DashboardStoreError);
    });
  });

  describe('getDashboard', () => {
    it('should return a dashboard by ID', async () => {
      const mockDashboard = { id: '1', title: 'Test Dashboard' };
      mockedPrisma.dashboard.findUnique.mockResolvedValue(mockDashboard);

      const result = await getDashboard('1');

      expect(result).toEqual(mockDashboard);
      expect(mockedPrisma.dashboard.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if dashboard not found', async () => {
      mockedPrisma.dashboard.findUnique.mockResolvedValue(null);

      const result = await getDashboard('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createDashboard', () => {
    it('should create a dashboard with valid data', async () => {
      const mockDashboard = {
        id: '1',
        title: 'New Dashboard',
        description: 'Test',
      };
      mockedPrisma.dashboard.count.mockResolvedValue(0);
      mockedPrisma.dashboard.create.mockResolvedValue(mockDashboard);

      const result = await createDashboard({
        title: 'New Dashboard',
        description: 'Test',
      });

      expect(result).toEqual(mockDashboard);
    });

    it('should throw error when max dashboards reached', async () => {
      mockedPrisma.dashboard.count.mockResolvedValue(3);

      await expect(createDashboard({ title: 'New' })).rejects.toThrow(
        DashboardStoreError
      );
      await expect(createDashboard({ title: 'New' })).rejects.toMatchObject({
        code: 'MAX_DASHBOARDS_REACHED',
      });
    });

    it('should throw error for empty title', async () => {
      mockedPrisma.dashboard.count.mockResolvedValue(0);

      await expect(createDashboard({ title: '' })).rejects.toThrow(
        DashboardStoreError
      );
      await expect(createDashboard({ title: '' })).rejects.toMatchObject({
        code: 'INVALID_TITLE',
      });
    });
  });

  describe('updateDashboard', () => {
    it('should update a dashboard', async () => {
      const mockUpdated = { id: '1', title: 'Updated', description: null };
      mockedPrisma.dashboard.update.mockResolvedValue(mockUpdated);

      const result = await updateDashboard('1', { title: 'Updated' });

      expect(result).toEqual(mockUpdated);
    });

    it('should throw error for empty title', async () => {
      await expect(updateDashboard('1', { title: '' })).rejects.toThrow(
        DashboardStoreError
      );
    });
  });

  describe('deleteDashboard', () => {
    it('should delete a dashboard with no links', async () => {
      mockedPrisma.link.count.mockResolvedValue(0);
      mockedPrisma.dashboard.delete.mockResolvedValue({ id: '1' });

      const result = await deleteDashboard('1');

      expect(result).toBe(true);
    });

    it('should throw error when dashboard has links', async () => {
      mockedPrisma.link.count.mockResolvedValue(5);

      await expect(deleteDashboard('1')).rejects.toThrow(DashboardStoreError);
      await expect(deleteDashboard('1')).rejects.toMatchObject({
        code: 'DASHBOARD_NOT_EMPTY',
      });
    });
  });
});
