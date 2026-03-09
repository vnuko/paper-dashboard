import { GET } from '../../app/api/icons/route';
import { NextRequest } from 'next/server';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    iconIndex: {
      findMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

import { PrismaClient } from '@prisma/client';

const mockPrisma = new (PrismaClient as any)();

describe('API Icons Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/icons', () => {
    const mockIcons = [
      {
        id: '1',
        name: 'arrow',
        path: '/icons/arrow.svg',
        createdAt: new Date(),
      },
      {
        id: '2',
        name: 'cloud',
        path: '/icons/cloud.svg',
        createdAt: new Date(),
      },
      {
        id: '3',
        name: 'folder',
        path: '/icons/folder.svg',
        createdAt: new Date(),
      },
      { id: '4', name: 'home', path: '/icons/home.svg', createdAt: new Date() },
      { id: '5', name: 'user', path: '/icons/user.svg', createdAt: new Date() },
      {
        id: '6',
        name: 'settings',
        path: '/icons/settings.svg',
        createdAt: new Date(),
      },
    ];

    it('should return first 5 icons ordered by name', async () => {
      mockPrisma.iconIndex.findMany.mockResolvedValue(mockIcons.slice(0, 5));

      const request = new NextRequest('http://localhost/api/icons', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(5);
      expect(mockPrisma.iconIndex.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
        take: 5,
      });
    });

    it('should return 404 when no icons exist', async () => {
      mockPrisma.iconIndex.findMany.mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/icons', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        message: 'No icons found. Please run: npm run index:icons',
      });
    });

    it('should return 500 when database query fails', async () => {
      mockPrisma.iconIndex.findMany.mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest('http://localhost/api/icons', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ message: 'Failed to load icons' });
    });
  });

  describe('GET /api/icons?q=search', () => {
    const mockArrowIcons = [
      {
        id: '1',
        name: 'arrow-up',
        path: '/icons/arrow-up.svg',
        createdAt: new Date(),
      },
      {
        id: '2',
        name: 'arrow-down',
        path: '/icons/arrow-down.svg',
        createdAt: new Date(),
      },
    ];

    const mockStorageIcons = [
      {
        id: '3',
        name: 'cloud-storage',
        path: '/icons/cloud-storage.svg',
        createdAt: new Date(),
      },
    ];

    it('should return icons matching search query in name', async () => {
      mockPrisma.iconIndex.findMany.mockResolvedValue(mockArrowIcons);

      const request = new NextRequest('http://localhost/api/icons?q=arrow', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(mockPrisma.iconIndex.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'arrow' } },
            { path: { contains: 'arrow' } },
          ],
        },
        orderBy: { name: 'asc' },
        take: 5,
      });
    });

    it('should return icons matching search query in path', async () => {
      mockPrisma.iconIndex.findMany.mockResolvedValue(mockStorageIcons);

      const request = new NextRequest('http://localhost/api/icons?q=storage', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(mockPrisma.iconIndex.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'storage' } },
            { path: { contains: 'storage' } },
          ],
        },
        orderBy: { name: 'asc' },
        take: 5,
      });
    });

    it('should return 404 when search returns no results', async () => {
      mockPrisma.iconIndex.findMany.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost/api/icons?q=nonexistent',
        {
          method: 'GET',
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        message: 'No icons found. Please run: npm run index:icons',
      });
    });

    it('should limit search results to 5 icons', async () => {
      const manyIcons = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        name: `icon-${i}`,
        path: `/icons/icon-${i}.svg`,
        createdAt: new Date(),
      }));

      mockPrisma.iconIndex.findMany.mockResolvedValue(manyIcons.slice(0, 5));

      const request = new NextRequest('http://localhost/api/icons?q=icon', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.length).toBeLessThanOrEqual(5);
      expect(mockPrisma.iconIndex.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      );
    });

    it('should return 500 when search query fails', async () => {
      mockPrisma.iconIndex.findMany.mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest('http://localhost/api/icons?q=test', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ message: 'Failed to load icons' });
    });
  });
});
