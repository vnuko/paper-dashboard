import { prisma } from '@/lib/prisma';
import type { Dashboard } from '@prisma/client';

export class ServiceStoreError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'ServiceStoreError';
  }
}

export type ServiceData = {
  title: string;
  description?: string | null;
  url: string;
  position: number;
  iconKey?: string | null;
};

export type ServiceUpdateInput = Partial<Omit<ServiceData, 'url'>> & {
  url?: string;
};

const URL_REGEX = /^(https?):\/\/.+/i;

export function validateServiceUrl(url: unknown): string {
  if (!url || typeof url !== 'string' || !URL_REGEX.test(url)) {
    throw new ServiceStoreError(
      'URL must be a valid URL with http or https scheme',
      'INVALID_URL'
    );
  }
  return url;
}

export function validateServiceUpdateInput(input: unknown): ServiceUpdateInput {
  if (typeof input !== 'object' || input === null) {
    throw new ServiceStoreError(
      'Request body must be an object',
      'INVALID_INPUT'
    );
  }

  const body = input as Record<string, unknown>;
  const validated: ServiceUpdateInput = {};

  if (body.title !== undefined) {
    if (typeof body.title !== 'string') {
      throw new ServiceStoreError('Title must be a string', 'INVALID_TITLE');
    }
    validated.title = body.title;
  }

  if (body.url !== undefined) {
    validateServiceUrl(body.url);
    validated.url = body.url as string;
  }

  if (body.position !== undefined) {
    if (typeof body.position !== 'number') {
      throw new ServiceStoreError(
        'Position must be a number',
        'INVALID_POSITION'
      );
    }
    validated.position = body.position;
  }

  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== 'string') {
      throw new ServiceStoreError(
        'Description must be a string',
        'INVALID_DESCRIPTION'
      );
    }
    validated.description = body.description;
  }

  if (body.iconKey !== undefined) {
    if (typeof body.iconKey !== 'string') {
      throw new ServiceStoreError(
        'Icon key must be a string',
        'INVALID_ICON_KEY'
      );
    }
    validated.iconKey = body.iconKey;
  }

  return validated;
}

/**
 * List all services ordered by position
 */
export async function listServices(limit?: number): Promise<Dashboard[]> {
  try {
    const services = await prisma.dashboard.findMany({
      orderBy: {
        position: 'asc',
      },
      ...(limit !== undefined ? { take: limit } : {}),
    });
    return services;
  } catch (error) {
    throw new ServiceStoreError(
      `Failed to list services: ${(error as Error).message}`,
      'LIST_SERVICES_ERROR'
    );
  }
}

/**
 * Get a specific service by ID
 */
export async function getService(id: string): Promise<Dashboard | null> {
  try {
    const service = await prisma.dashboard.findUnique({
      where: { id },
    });
    return service;
  } catch (error) {
    throw new ServiceStoreError(
      `Failed to get service: ${(error as Error).message}`,
      'GET_SERVICE_ERROR'
    );
  }
}

/**
 * Create a new service
 */
export async function createService(data: ServiceData): Promise<Dashboard> {
  try {
    // Basic URL validation
    if (
      !data.url ||
      typeof data.url !== 'string' ||
      !/^(https?:\/\/)/i.test(data.url)
    ) {
      throw new ServiceStoreError('Invalid URL format', 'INVALID_URL');
    }

    const service = await prisma.dashboard.create({
      data,
    });
    return service;
  } catch (error) {
    if (error instanceof ServiceStoreError) {
      throw error;
    }
    throw new ServiceStoreError(
      `Failed to create service: ${(error as Error).message}`,
      'CREATE_SERVICE_ERROR'
    );
  }
}

/**
 * Update an existing service with position reordering
 */
export async function updateService(
  id: string,
  data: ServiceUpdateInput
): Promise<Dashboard> {
  try {
    if (data.url) {
      validateServiceUrl(data.url);
    }

    if (data.position !== undefined) {
      await reorderServices(id, data.position);
    }

    const service = await prisma.dashboard.update({
      where: { id },
      data,
    });

    return service;
  } catch (error) {
    if (error instanceof ServiceStoreError) {
      throw error;
    }
    throw new ServiceStoreError(
      `Failed to update service: ${(error as Error).message}`,
      'UPDATE_SERVICE_ERROR'
    );
  }
}

/**
 * Reorder services when a service position changes
 */
async function reorderServices(
  serviceId: string,
  newPosition: number
): Promise<void> {
  const currentService = await prisma.dashboard.findUnique({
    where: { id: serviceId },
  });

  if (!currentService) {
    return;
  }

  const currentPos = currentService.position;

  if (newPosition === currentPos) {
    return;
  }

  if (newPosition < currentPos) {
    await prisma.dashboard.updateMany({
      where: {
        id: { not: serviceId },
        position: { gte: newPosition, lt: currentPos },
      },
      data: { position: { increment: 1 } },
    });
  } else {
    await prisma.dashboard.updateMany({
      where: {
        id: { not: serviceId },
        position: { gt: currentPos, lte: newPosition },
      },
      data: { position: { decrement: 1 } },
    });
  }
}

/**
 * Delete a service by ID
 */
export async function deleteService(id: string): Promise<boolean> {
  try {
    await prisma.dashboard.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    throw new ServiceStoreError(
      `Failed to delete service: ${(error as Error).message}`,
      'DELETE_SERVICE_ERROR'
    );
  }
}
