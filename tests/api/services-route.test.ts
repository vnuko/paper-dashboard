import {
  GET as GETServices,
  POST as POSTService,
} from '../../app/api/services/route';
import {
  GET as GETServiceById,
  PATCH as PATCHService,
  DELETE as DELETEService,
} from '../../app/api/services/[id]/route';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} from '../../lib/services';

// Mock the service functions to control their behavior during tests
jest.mock('../../lib/services');

const mockedListServices = listServices as jest.MockedFunction<
  typeof listServices
>;
const mockedGetService = getService as jest.MockedFunction<typeof getService>;
const mockedCreateService = createService as jest.MockedFunction<
  typeof createService
>;
const mockedUpdateService = updateService as jest.MockedFunction<
  typeof updateService
>;
const mockedDeleteService = deleteService as jest.MockedFunction<
  typeof deleteService
>;

describe('API Services Routes', () => {
  afterEach(() => {
    // Reset mocks after each test
    jest.clearAllMocks();
  });

  describe('GET /api/services', () => {
    it('should return services with no-cache headers', async () => {
      const mockServices = [
        {
          id: '1',
          title: 'Test Service 1',
          url: 'http://test1.com',
          position: 0,
        },
        {
          id: '2',
          title: 'Test Service 2',
          url: 'http://test2.com',
          position: 1,
        },
      ];

      mockedListServices.mockResolvedValue(mockServices);

      const request = new NextRequest('http://localhost/api/services', {
        method: 'GET',
      });

      const response = await GETServices(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockServices);
      expect(response.headers.get('Cache-Control')).toContain('no-store');
      expect(mockedListServices).toHaveBeenCalled();
    });

    it('should return 500 when listServices throws an error', async () => {
      mockedListServices.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/services', {
        method: 'GET',
      });

      const response = await GETServices(request);

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ message: 'Unexpected error' });
    });
  });

  describe('POST /api/services', () => {
    it('should create a new service with valid input', async () => {
      const mockRequestBody = {
        title: 'New Service',
        url: 'http://newservice.com',
        description: 'A new service',
        position: 2,
        iconKey: 'icon.svg',
      };

      const mockNewService = {
        id: 'test-id',
        ...mockRequestBody,
      };

      mockedCreateService.mockResolvedValue(mockNewService);

      const request = new NextRequest('http://localhost/api/services', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POSTService(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockNewService);
      expect(response.headers.get('Location')).toContain(
        '/api/services/test-id'
      );
      expect(mockedCreateService).toHaveBeenCalledWith({
        title: 'New Service',
        url: 'http://newservice.com',
        description: 'A new service',
        position: 2,
        iconKey: 'icon.svg',
      });
    });

    it('should return 400 when title is missing', async () => {
      const mockRequestBody = {
        url: 'http://newservice.com',
      };

      const request = new NextRequest('http://localhost/api/services', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POSTService(request);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        message: 'Title is required and must be a string',
        errors: { title: 'Title is required and must be a string' },
      });
    });

    it('should return 400 when URL is missing', async () => {
      const mockRequestBody = {
        title: 'New Service',
      };

      const request = new NextRequest('http://localhost/api/services', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POSTService(request);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        message:
          'URL is required and must be a valid URL with http or https scheme',
        errors: {
          url: 'URL is required and must be a valid URL with http or https scheme',
        },
      });
    });

    it('should return 400 when URL format is invalid', async () => {
      const mockRequestBody = {
        title: 'New Service',
        url: 'not-a-valid-url',
      };

      const request = new NextRequest('http://localhost/api/services', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POSTService(request);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        message:
          'URL is required and must be a valid URL with http or https scheme',
        errors: {
          url: 'URL is required and must be a valid URL with http or https scheme',
        },
      });
    });

    it('should return 500 when createService throws an error', async () => {
      const mockRequestBody = {
        title: 'New Service',
        url: 'http://newservice.com',
      };

      mockedCreateService.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/services', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POSTService(request);

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ message: 'Unexpected error' });
    });
  });

  describe('GET /api/services/[id]', () => {
    it('should return a service by ID', async () => {
      const mockService = {
        id: 'test-id',
        title: 'Test Service',
        url: 'http://test.com',
        position: 2,
      };

      mockedGetService.mockResolvedValue(mockService);

      const request = new NextRequest('http://localhost/api/services/test-id', {
        method: 'GET',
      });

      const response = await GETServiceById(request, {
        params: { id: 'test-id' },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockService);
      expect(mockedGetService).toHaveBeenCalledWith('test-id');
      expect(response.headers.get('Cache-Control')).toContain('no-store');
    });

    it('should return 404 when service is not found', async () => {
      mockedGetService.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/services/nonexistent-id',
        {
          method: 'GET',
        }
      );

      const response = await GETServiceById(request, {
        params: { id: 'nonexistent-id' },
      });

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ message: 'Service not found' });
    });

    it('should return 500 when getService throws an error', async () => {
      mockedGetService.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/services/test-id', {
        method: 'GET',
      });

      const response = await GETServiceById(request, {
        params: { id: 'test-id' },
      });

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ message: 'Unexpected error' });
    });
  });

  describe('PATCH /api/services/[id]', () => {
    it('should update a service with valid input', async () => {
      const existingService = {
        id: 'test-id',
        title: 'Old Title',
        url: 'http://oldurl.com',
        position: 2,
      };

      const updateData = {
        title: 'Updated Title',
        url: 'http://newurl.com',
      };

      const updatedService = {
        id: 'test-id',
        title: 'Updated Title',
        url: 'http://newurl.com',
        position: 2,
      };

      mockedGetService.mockResolvedValue(existingService);
      mockedUpdateService.mockResolvedValue(updatedService);

      const request = new NextRequest('http://localhost/api/services/test-id', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PATCHService(request, {
        params: { id: 'test-id' },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedService);
      expect(mockedUpdateService).toHaveBeenCalledWith('test-id', updateData);
    });

    it('should return 404 when service to update is not found', async () => {
      mockedGetService.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/services/nonexistent-id',
        {
          method: 'PATCH',
          body: JSON.stringify({ title: 'New Title' }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await PATCHService(request, {
        params: { id: 'nonexistent-id' },
      });

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ message: 'Service not found' });
    });

    it('should return 400 when position is not a number', async () => {
      const existingService = {
        id: 'test-id',
        title: 'Old Title',
        url: 'http://oldurl.com',
        position: 2,
      };

      mockedGetService.mockResolvedValue(existingService);

      const request = new NextRequest('http://localhost/api/services/test-id', {
        method: 'PATCH',
        body: JSON.stringify({ position: 'invalid-position' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PATCHService(request, {
        params: { id: 'test-id' },
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        message: 'Position must be a number when provided',
        errors: { position: 'Position must be a number when provided' },
      });
    });

    it('should return 500 when updateService throws an error', async () => {
      const existingService = {
        id: 'test-id',
        title: 'Old Title',
        url: 'http://oldurl.com',
        position: 2,
      };

      mockedGetService.mockResolvedValue(existingService);
      mockedUpdateService.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/services/test-id', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated Title' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PATCHService(request, {
        params: { id: 'test-id' },
      });

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ message: 'Unexpected error' });
    });
  });

  describe('DELETE /api/services/[id]', () => {
    it('should delete a service successfully', async () => {
      const existingService = {
        id: 'test-id',
        title: 'Old Title',
        url: 'http://oldurl.com',
        position: 2,
      };

      mockedGetService.mockResolvedValue(existingService);
      mockedDeleteService.mockResolvedValue(true);

      const request = new NextRequest('http://localhost/api/services/test-id', {
        method: 'DELETE',
      });

      const response = await DELETEService(request, {
        params: { id: 'test-id' },
      });

      expect(response.status).toBe(204); // No Content
      expect(await response.text()).toBe(''); // Ensure response body is empty for 204
    });

    it('should return 404 when service to delete is not found', async () => {
      mockedGetService.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/services/nonexistent-id',
        {
          method: 'DELETE',
        }
      );

      const response = await DELETEService(request, {
        params: { id: 'nonexistent-id' },
      });

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ message: 'Service not found' });
    });

    it('should return 500 when deleteService throws an error', async () => {
      const existingService = {
        id: 'test-id',
        title: 'Old Title',
        url: 'http://oldurl.com',
        position: 2,
      };

      mockedGetService.mockResolvedValue(existingService);
      mockedDeleteService.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/services/test-id', {
        method: 'DELETE',
      });

      const response = await DELETEService(request, {
        params: { id: 'test-id' },
      });

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ message: 'Unexpected error' });
    });
  });
});
