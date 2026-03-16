import { NextRequest, NextResponse } from 'next/server';
import {
  getDashboard,
  getDashboardWithLinks,
  updateDashboard,
  deleteDashboard,
  DashboardStoreError,
} from '@/lib/dashboards';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

function handleDashboardError(error: unknown, action: string) {
  console.error(`Error ${action}:`, error);

  if (error instanceof DashboardStoreError) {
    const status =
      error.code === 'DASHBOARD_NOT_EMPTY'
        ? 400
        : error.code.startsWith('INVALID')
          ? 400
          : 500;
    return NextResponse.json({ message: error.message }, { status });
  }

  return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeLinks = searchParams.get('includeLinks') === 'true';

    const dashboard = includeLinks
      ? await getDashboardWithLinks(id)
      : await getDashboard(id);

    if (!dashboard) {
      return NextResponse.json(
        { message: 'Dashboard not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(dashboard, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    return handleDashboardError(error, 'fetching dashboard');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existingDashboard = await getDashboard(id);

    if (!existingDashboard) {
      return NextResponse.json(
        { message: 'Dashboard not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updatedDashboard = await updateDashboard(id, {
      title: body.title,
      description: body.description,
    });

    return NextResponse.json(updatedDashboard);
  } catch (error) {
    return handleDashboardError(error, 'updating dashboard');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dashboard = await getDashboard(id);

    if (!dashboard) {
      return NextResponse.json(
        { message: 'Dashboard not found' },
        { status: 404 }
      );
    }

    await deleteDashboard(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleDashboardError(error, 'deleting dashboard');
  }
}
