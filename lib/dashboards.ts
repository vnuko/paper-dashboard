import { prisma } from '@/lib/prisma';
import type { Dashboard, Link } from '@prisma/client';

export class DashboardStoreError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'DashboardStoreError';
  }
}

export type DashboardData = {
  title: string;
  description?: string | null;
};

export type DashboardUpdateInput = Partial<DashboardData>;

export type DashboardWithLinks = Dashboard & {
  links: Link[];
};

const MAX_DASHBOARDS = parseInt(process.env.MAX_DASHBOARDS || '3', 10);

export function getMaxDashboards(): number {
  return MAX_DASHBOARDS;
}

export async function listDashboards(): Promise<Dashboard[]> {
  try {
    const dashboards = await prisma.dashboard.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
    return dashboards;
  } catch (error) {
    throw new DashboardStoreError(
      `Failed to list dashboards: ${(error as Error).message}`,
      'LIST_DASHBOARDS_ERROR'
    );
  }
}

export async function getDashboard(id: string): Promise<Dashboard | null> {
  try {
    const dashboard = await prisma.dashboard.findUnique({
      where: { id },
    });
    return dashboard;
  } catch (error) {
    throw new DashboardStoreError(
      `Failed to get dashboard: ${(error as Error).message}`,
      'GET_DASHBOARD_ERROR'
    );
  }
}

export async function getDashboardWithLinks(
  id: string
): Promise<DashboardWithLinks | null> {
  try {
    const dashboard = await prisma.dashboard.findUnique({
      where: { id },
      include: {
        links: {
          orderBy: { position: 'asc' },
        },
      },
    });
    return dashboard;
  } catch (error) {
    throw new DashboardStoreError(
      `Failed to get dashboard with links: ${(error as Error).message}`,
      'GET_DASHBOARD_ERROR'
    );
  }
}

export async function createDashboard(data: DashboardData): Promise<Dashboard> {
  try {
    const count = await prisma.dashboard.count();
    if (count >= MAX_DASHBOARDS) {
      throw new DashboardStoreError(
        `Maximum number of dashboards (${MAX_DASHBOARDS}) reached`,
        'MAX_DASHBOARDS_REACHED'
      );
    }

    if (
      !data.title ||
      typeof data.title !== 'string' ||
      data.title.trim() === ''
    ) {
      throw new DashboardStoreError('Title is required', 'INVALID_TITLE');
    }

    const dashboard = await prisma.dashboard.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
      },
    });
    return dashboard;
  } catch (error) {
    if (error instanceof DashboardStoreError) {
      throw error;
    }
    throw new DashboardStoreError(
      `Failed to create dashboard: ${(error as Error).message}`,
      'CREATE_DASHBOARD_ERROR'
    );
  }
}

export async function updateDashboard(
  id: string,
  data: DashboardUpdateInput
): Promise<Dashboard> {
  try {
    if (data.title !== undefined) {
      if (typeof data.title !== 'string' || data.title.trim() === '') {
        throw new DashboardStoreError(
          'Title must be a non-empty string',
          'INVALID_TITLE'
        );
      }
    }

    const updateData: DashboardUpdateInput = {};
    if (data.title !== undefined) {
      updateData.title = data.title.trim();
    }
    if (data.description !== undefined) {
      updateData.description = data.description?.trim() || null;
    }

    const dashboard = await prisma.dashboard.update({
      where: { id },
      data: updateData,
    });

    return dashboard;
  } catch (error) {
    if (error instanceof DashboardStoreError) {
      throw error;
    }
    throw new DashboardStoreError(
      `Failed to update dashboard: ${(error as Error).message}`,
      'UPDATE_DASHBOARD_ERROR'
    );
  }
}

export async function deleteDashboard(id: string): Promise<boolean> {
  try {
    const linkCount = await prisma.link.count({
      where: { dashboardId: id },
    });

    if (linkCount > 0) {
      throw new DashboardStoreError(
        `Cannot delete dashboard with ${linkCount} link(s). Delete links first.`,
        'DASHBOARD_NOT_EMPTY'
      );
    }

    await prisma.dashboard.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    if (error instanceof DashboardStoreError) {
      throw error;
    }
    throw new DashboardStoreError(
      `Failed to delete dashboard: ${(error as Error).message}`,
      'DELETE_DASHBOARD_ERROR'
    );
  }
}

export async function ensureDefaultDashboard(): Promise<Dashboard> {
  try {
    const count = await prisma.dashboard.count();
    if (count === 0) {
      const dashboard = await prisma.dashboard.create({
        data: {
          title: 'Default',
          description: 'This is the default dashboard.',
        },
      });
      return dashboard;
    }
    const first = await prisma.dashboard.findFirst({
      orderBy: { createdAt: 'asc' },
    });
    return first!;
  } catch (error) {
    throw new DashboardStoreError(
      `Failed to ensure default dashboard: ${(error as Error).message}`,
      'ENSURE_DEFAULT_DASHBOARD_ERROR'
    );
  }
}
