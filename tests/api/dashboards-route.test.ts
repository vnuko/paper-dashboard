import {
  GET as GETDashboards,
  POST as POSTDashboard,
} from '../../app/api/dashboards/route';
import {
  GET as GETDashboardById,
  PATCH as PATCHDashboard,
  DELETE as DELETEDashboard,
} from '../../app/api/dashboards/[id]/route';
import { NextRequest } from 'next/server';
import {
  listDashboards,
  getDashboard,
  createDashboard,
  updateDashboard,
  deleteDashboard,
} from '../../lib/dashboards';

jest.mock('../../lib/dashboards');

const mockedListDashboards = listDashboards as jest.MockedFunction<
  typeof listDashboards
>;
const mockedGetDashboard = getDashboard as jest.MockedFunction<
  typeof getDashboard
>;
const mockedCreateDashboard = createDashboard as jest.MockedFunction<
  typeof createDashboard
>;
const mockedUpdateDashboard = updateDashboard as jest.MockedFunction<
  typeof updateDashboard
>;
const mockedDeleteDashboard = deleteDashboard as jest.MockedFunction<
  typeof deleteDashboard
>;

describe('API Dashboards Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/dashboards', () => {
    it('should return dashboards', async () => {
      const mockDashboards = [
        {
          id: '1',
          title: 'Dashboard 1',
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Dashboard 2',
          description: 'Test',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockedListDashboards.mockResolvedValue(mockDashboards);

      const request = new NextRequest('http://localhost/api/dashboards', {
        method: 'GET',
      });
      const response = await GETDashboards();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockDashboards);
    });
  });

  describe('POST /api/dashboards', () => {
    it('should create a dashboard with valid input', async () => {
      const mockDashboard = {
        id: 'test-id',
        title: 'New Dashboard',
        description: 'Test description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedCreateDashboard.mockResolvedValue(mockDashboard);

      const request = new NextRequest('http://localhost/api/dashboards', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Dashboard',
          description: 'Test description',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POSTDashboard(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockDashboard);
    });

    it('should return 400 when title is missing', async () => {
      const request = new NextRequest('http://localhost/api/dashboards', {
        method: 'POST',
        body: JSON.stringify({ description: 'Test' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POSTDashboard(request);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/dashboards/[id]', () => {
    it('should return a dashboard by ID', async () => {
      const mockDashboard = {
        id: 'test-id',
        title: 'Test Dashboard',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedGetDashboard.mockResolvedValue(mockDashboard);

      const request = new NextRequest(
        'http://localhost/api/dashboards/test-id',
        { method: 'GET' }
      );
      const response = await GETDashboardById(request, {
        params: Promise.resolve({ id: 'test-id' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockDashboard);
    });

    it('should return 404 when dashboard not found', async () => {
      mockedGetDashboard.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/dashboards/nonexistent',
        { method: 'GET' }
      );
      const response = await GETDashboardById(request, {
        params: Promise.resolve({ id: 'nonexistent' }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/dashboards/[id]', () => {
    it('should update a dashboard', async () => {
      const mockUpdated = {
        id: 'test-id',
        title: 'Updated Title',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedGetDashboard.mockResolvedValue({
        id: 'test-id',
        title: 'Old',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockedUpdateDashboard.mockResolvedValue(mockUpdated);

      const request = new NextRequest(
        'http://localhost/api/dashboards/test-id',
        {
          method: 'PATCH',
          body: JSON.stringify({ title: 'Updated Title' }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await PATCHDashboard(request, {
        params: Promise.resolve({ id: 'test-id' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUpdated);
    });
  });

  describe('DELETE /api/dashboards/[id]', () => {
    it('should delete a dashboard', async () => {
      mockedGetDashboard.mockResolvedValue({
        id: 'test-id',
        title: 'Test',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockedDeleteDashboard.mockResolvedValue(true);

      const request = new NextRequest(
        'http://localhost/api/dashboards/test-id',
        { method: 'DELETE' }
      );
      const response = await DELETEDashboard(request, {
        params: Promise.resolve({ id: 'test-id' }),
      });

      expect(response.status).toBe(204);
    });

    it('should return 404 when dashboard not found', async () => {
      mockedGetDashboard.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/dashboards/nonexistent',
        { method: 'DELETE' }
      );
      const response = await DELETEDashboard(request, {
        params: Promise.resolve({ id: 'nonexistent' }),
      });

      expect(response.status).toBe(404);
    });
  });
});
