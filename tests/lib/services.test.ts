import {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
  ServiceStoreError,
} from '../../lib/services';

// Mock the Prisma client
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    dashboard: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

import { PrismaClient } from '@prisma/client';

const mockedPrisma = new PrismaClient() as jest.Mocked<any>;

describe('Service Helpers', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listServices', () => {
    it('should return services ordered by position in ascending order', async () => {
      const mockServices = [
        { id: '1', title: 'Service A', position: 0 },
        { id: '2', title: 'Service B', position: 1 },
        { id: '3', title: 'Service C', position: 2 },
      ];

      mockedPrisma.dashboard.findMany.mockResolvedValue(mockServices);

      const result = await listServices();

      expect(result).toEqual(mockServices);
      expect(mockedPrisma.dashboard.findMany).toHaveBeenCalledWith({
        orderBy: { position: 'asc' },
      });
    });

    it('should limit results when limit parameter is provided', async () => {
      const mockServices = [{ id: '1', title: 'Service A', position: 0 }];

      mockedPrisma.dashboard.findMany.mockResolvedValue(mockServices);

      const result = await listServices(1);

      expect(result).toEqual(mockServices);
      expect(mockedPrisma.dashboard.findMany).toHaveBeenCalledWith({
        orderBy: { position: 'asc' },
        take: 1,
      });
    });

    it('should throw ServiceStoreError if listServices fails', async () => {
      const mockError = new Error('Database error');
      mockedPrisma.dashboard.findMany.mockRejectedValue(mockError);

      await expect(listServices()).rejects.toThrow(ServiceStoreError);
      await expect(listServices()).rejects.toMatchObject({
        code: 'LIST_SERVICES_ERROR',
        message: expect.stringContaining('Failed to list services'),
      });
    });
  });

  describe('getService', () => {
    it('should return a single service by ID', async () => {
      const mockService = { id: '1', title: 'Service A', position: 0 };

      mockedPrisma.dashboard.findUnique.mockResolvedValue(mockService);

      const result = await getService('1');

      expect(result).toEqual(mockService);
      expect(mockedPrisma.dashboard.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw ServiceStoreError if getService fails', async () => {
      const mockError = new Error('Database error');
      mockedPrisma.dashboard.findUnique.mockRejectedValue(mockError);

      await expect(getService('1')).rejects.toThrow(ServiceStoreError);
      await expect(getService('1')).rejects.toMatchObject({
        code: 'GET_SERVICE_ERROR',
        message: expect.stringContaining('Failed to get service'),
      });
    });
  });

  describe('createService', () => {
    const validServiceData = {
      title: 'New Service',
      description: 'New Service Description',
      url: 'http://example.com',
      position: 3,
      iconKey: 'example-icon.svg',
    };

    it('should create a new service with valid data', async () => {
      mockedPrisma.dashboard.create.mockResolvedValue(validServiceData);

      const result = await createService(validServiceData);

      expect(result).toEqual(validServiceData);
      expect(mockedPrisma.dashboard.create).toHaveBeenCalledWith({
        data: validServiceData,
      });
    });

    it('should validate URL format properly', async () => {
      const invalidData = {
        ...validServiceData,
        url: 'not-a-url',
      };

      await expect(createService(invalidData)).rejects.toThrow(
        ServiceStoreError
      );
      await expect(createService(invalidData)).rejects.toMatchObject({
        code: 'INVALID_URL',
        message: 'Invalid URL format',
      });
    });

    it('should throw ServiceStoreError if createService fails', async () => {
      const mockError = new Error('Database error');
      mockedPrisma.dashboard.create.mockRejectedValue(mockError);

      await expect(createService(validServiceData)).rejects.toThrow(
        ServiceStoreError
      );
      await expect(createService(validServiceData)).rejects.toMatchObject({
        code: 'CREATE_SERVICE_ERROR',
        message: expect.stringContaining('Failed to create service'),
      });
    });
  });

  describe('updateService', () => {
    const updateData = {
      title: 'Updated Title',
      url: 'http://updated.com',
    };

    it('should update an existing service', async () => {
      const mockUpdatedService = {
        id: '1',
        title: 'Updated Title',
        url: 'http://updated.com',
        position: 0,
      };

      mockedPrisma.dashboard.update.mockResolvedValue(mockUpdatedService);

      const result = await updateService('1', updateData);

      expect(result).toEqual(mockUpdatedService);
      expect(mockedPrisma.dashboard.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
    });

    it('should validate URL format when updating', async () => {
      const invalidUpdateData = { url: 'not-a-url' };

      await expect(updateService('1', invalidUpdateData)).rejects.toThrow(
        ServiceStoreError
      );
      await expect(updateService('1', invalidUpdateData)).rejects.toMatchObject(
        {
          code: 'INVALID_URL',
          message: 'Invalid URL format',
        }
      );
    });

    it('should throw ServiceStoreError if updateService fails', async () => {
      const mockError = new Error('Database error');
      mockedPrisma.dashboard.update.mockRejectedValue(mockError);

      await expect(updateService('1', updateData)).rejects.toThrow(
        ServiceStoreError
      );
      await expect(updateService('1', updateData)).rejects.toMatchObject({
        code: 'UPDATE_SERVICE_ERROR',
        message: expect.stringContaining('Failed to update service'),
      });
    });
  });

  describe('deleteService', () => {
    it('should delete a service by ID', async () => {
      mockedPrisma.dashboard.delete.mockResolvedValue({
        id: '1',
        title: 'Deleted Service',
        position: 0,
      });

      const result = await deleteService('1');

      expect(result).toBe(true);
      expect(mockedPrisma.dashboard.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw ServiceStoreError if deleteService fails', async () => {
      const mockError = new Error('Database error');
      mockedPrisma.dashboard.delete.mockRejectedValue(mockError);

      await expect(deleteService('1')).rejects.toThrow(ServiceStoreError);
      await expect(deleteService('1')).rejects.toMatchObject({
        code: 'DELETE_SERVICE_ERROR',
        message: expect.stringContaining('Failed to delete service'),
      });
    });
  });
});
