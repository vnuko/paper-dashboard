import { GET as GETLinks, POST as POSTLink } from '../../app/api/links/route';
import {
  GET as GETLinkById,
  PATCH as PATCHLink,
  DELETE as DELETELink,
} from '../../app/api/links/[id]/route';
import { NextRequest } from 'next/server';
import {
  listLinks,
  getLink,
  createLink,
  updateLink,
  deleteLink,
} from '../../lib/links';

jest.mock('../../lib/links');

const mockedListLinks = listLinks as jest.MockedFunction<typeof listLinks>;
const mockedGetLink = getLink as jest.MockedFunction<typeof getLink>;
const mockedCreateLink = createLink as jest.MockedFunction<typeof createLink>;
const mockedUpdateLink = updateLink as jest.MockedFunction<typeof updateLink>;
const mockedDeleteLink = deleteLink as jest.MockedFunction<typeof deleteLink>;

const mockDashboardId = 'dashboard-1';

describe('API Links Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/links', () => {
    it('should return links with no-cache headers', async () => {
      const mockLinks = [
        {
          id: '1',
          title: 'Test Link 1',
          url: 'http://test1.com',
          position: 0,
          description: null,
          iconKey: null,
          badge: null,
          dashboardId: mockDashboardId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Test Link 2',
          url: 'http://test2.com',
          position: 1,
          description: null,
          iconKey: null,
          badge: null,
          dashboardId: mockDashboardId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockedListLinks.mockResolvedValue(mockLinks);

      const request = new NextRequest('http://localhost/api/links', {
        method: 'GET',
      });

      const response = await GETLinks(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockLinks);
      expect(response.headers.get('Cache-Control')).toContain('no-store');
    });

    it('should filter by dashboardId query param', async () => {
      const mockLinks = [
        {
          id: '1',
          title: 'Test Link 1',
          url: 'http://test1.com',
          position: 0,
          description: null,
          iconKey: null,
          badge: null,
          dashboardId: mockDashboardId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockedListLinks.mockResolvedValue(mockLinks);

      const request = new NextRequest(
        `http://localhost/api/links?dashboardId=${mockDashboardId}`,
        {
          method: 'GET',
        }
      );

      const response = await GETLinks(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockLinks);
      expect(mockedListLinks).toHaveBeenCalledWith(mockDashboardId);
    });
  });

  describe('POST /api/links', () => {
    it('should create a new link with valid input', async () => {
      const mockRequestBody = {
        title: 'New Link',
        url: 'http://newlink.com',
        description: 'A new link',
        position: 2,
        iconKey: 'icon.svg',
        dashboardId: mockDashboardId,
      };

      const mockNewLink = {
        id: 'test-id',
        ...mockRequestBody,
        badge: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedListLinks.mockResolvedValue([]);
      mockedCreateLink.mockResolvedValue(mockNewLink);

      const request = new NextRequest('http://localhost/api/links', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POSTLink(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockNewLink);
      expect(response.headers.get('Location')).toContain('/api/links/test-id');
    });

    it('should return 400 when dashboardId is missing', async () => {
      const mockRequestBody = {
        title: 'New Link',
        url: 'http://newlink.com',
      };

      const request = new NextRequest('http://localhost/api/links', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POSTLink(request);

      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        message: 'Dashboard ID is required and must be a string',
      });
    });

    it('should return 400 when title is missing', async () => {
      const mockRequestBody = {
        url: 'http://newlink.com',
        dashboardId: mockDashboardId,
      };

      const request = new NextRequest('http://localhost/api/links', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POSTLink(request);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        message: 'Title is required and must be a string',
        errors: { title: 'Title is required and must be a string' },
      });
    });
  });

  describe('GET /api/links/[id]', () => {
    it('should return a link by ID', async () => {
      const mockLink = {
        id: 'test-id',
        title: 'Test Link',
        url: 'http://test.com',
        position: 2,
        description: null,
        iconKey: null,
        badge: null,
        dashboardId: mockDashboardId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedGetLink.mockResolvedValue(mockLink);

      const request = new NextRequest('http://localhost/api/links/test-id', {
        method: 'GET',
      });

      const response = await GETLinkById(request, {
        params: Promise.resolve({ id: 'test-id' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockLink);
      expect(mockedGetLink).toHaveBeenCalledWith('test-id');
    });

    it('should return 404 when link is not found', async () => {
      mockedGetLink.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/links/nonexistent-id',
        { method: 'GET' }
      );

      const response = await GETLinkById(request, {
        params: Promise.resolve({ id: 'nonexistent-id' }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/links/[id]', () => {
    it('should update a link with valid input', async () => {
      const existingLink = {
        id: 'test-id',
        title: 'Old Title',
        url: 'http://oldurl.com',
        position: 2,
        description: null,
        iconKey: null,
        badge: null,
        dashboardId: mockDashboardId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateData = {
        title: 'Updated Title',
        url: 'http://newurl.com',
      };

      const updatedLink = {
        ...existingLink,
        ...updateData,
      };

      mockedGetLink.mockResolvedValue(existingLink);
      mockedUpdateLink.mockResolvedValue(updatedLink);

      const request = new NextRequest('http://localhost/api/links/test-id', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PATCHLink(request, {
        params: Promise.resolve({ id: 'test-id' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedLink);
    });

    it('should return 404 when link to update is not found', async () => {
      mockedGetLink.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/links/nonexistent-id',
        {
          method: 'PATCH',
          body: JSON.stringify({ title: 'New Title' }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await PATCHLink(request, {
        params: Promise.resolve({ id: 'nonexistent-id' }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/links/[id]', () => {
    it('should delete a link successfully', async () => {
      const existingLink = {
        id: 'test-id',
        title: 'Old Title',
        url: 'http://oldurl.com',
        position: 2,
        description: null,
        iconKey: null,
        badge: null,
        dashboardId: mockDashboardId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedGetLink.mockResolvedValue(existingLink);
      mockedDeleteLink.mockResolvedValue(true);

      const request = new NextRequest('http://localhost/api/links/test-id', {
        method: 'DELETE',
      });

      const response = await DELETELink(request, {
        params: Promise.resolve({ id: 'test-id' }),
      });

      expect(response.status).toBe(204);
    });

    it('should return 404 when link to delete is not found', async () => {
      mockedGetLink.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/links/nonexistent-id',
        { method: 'DELETE' }
      );

      const response = await DELETELink(request, {
        params: Promise.resolve({ id: 'nonexistent-id' }),
      });

      expect(response.status).toBe(404);
    });
  });
});
