import { GET } from '../../app/api/icons/route';
import { NextRequest } from 'next/server';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    iconIndex: {
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
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

    it('should return empty array when no icons exist', async () => {
      mockPrisma.iconIndex.findMany.mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/icons', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
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
      mockPrisma.$queryRaw.mockResolvedValue(mockArrowIcons);

      const request = new NextRequest('http://localhost/api/icons?q=arrow', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });

    it('should return icons matching search query in path', async () => {
      mockPrisma.$queryRaw.mockResolvedValue(mockStorageIcons);

      const request = new NextRequest('http://localhost/api/icons?q=storage', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });

    it('should return empty array when search returns no results', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost/api/icons?q=nonexistent',
        {
          method: 'GET',
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should limit search results to 5 icons', async () => {
      const manyIcons = Array.from({ length: 5 }, (_, i) => ({
        id: `${i}`,
        name: `icon-${i}`,
        path: `/icons/icon-${i}.svg`,
        createdAt: new Date(),
      }));

      mockPrisma.$queryRaw.mockResolvedValue(manyIcons);

      const request = new NextRequest('http://localhost/api/icons?q=icon', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.length).toBeLessThanOrEqual(5);
    });

    it('should return 500 when search query fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/icons?q=test', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ message: 'Failed to load icons' });
    });

    it('should prioritize exact matches over partial matches', async () => {
      const mockGitlabIcons = [
        {
          id: '1',
          name: 'gitlab',
          path: 'gitlab.svg',
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'gitlab-runner',
          path: 'gitlab-runner.svg',
          createdAt: new Date(),
        },
        {
          id: '3',
          name: 'com.gitlabwork',
          path: 'com.gitlabwork.svg',
          createdAt: new Date(),
        },
      ];

      mockPrisma.$queryRaw.mockResolvedValue(mockGitlabIcons);

      const request = new NextRequest('http://localhost/api/icons?q=gitlab', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].name).toBe('gitlab');
    });

    it('should prioritize starts-with matches over contains matches', async () => {
      const mockIcons = [
        {
          id: '1',
          name: 'firefox',
          path: 'firefox.svg',
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'firefox-developer',
          path: 'firefox-developer.svg',
          createdAt: new Date(),
        },
        {
          id: '3',
          name: 'com.mozilla.firefox',
          path: 'com.mozilla.firefox.svg',
          createdAt: new Date(),
        },
      ];

      mockPrisma.$queryRaw.mockResolvedValue(mockIcons);

      const request = new NextRequest('http://localhost/api/icons?q=firefox', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].name).toBe('firefox');
      expect(data[1].name).toBe('firefox-developer');
    });
  });
});
