import { NextRequest, NextResponse } from 'next/server';
import {
  listDashboards,
  createDashboard,
  DashboardStoreError,
} from '@/lib/dashboards';

export async function GET() {
  try {
    const dashboards = await listDashboards();
    return NextResponse.json(dashboards, {
      headers: {
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        {
          message: 'Title is required and must be a string',
          errors: { title: 'Title is required and must be a string' },
        },
        { status: 400 }
      );
    }

    if (
      body.description !== undefined &&
      body.description !== null &&
      typeof body.description !== 'string'
    ) {
      return NextResponse.json(
        {
          message: 'Description must be a string when provided',
          errors: { description: 'Description must be a string when provided' },
        },
        { status: 400 }
      );
    }

    const newDashboard = await createDashboard({
      title: body.title,
      description: body.description,
    });

    const response = NextResponse.json(newDashboard, { status: 201 });
    response.headers.set(
      'Location',
      `${request.nextUrl.origin}/api/dashboards/${newDashboard.id}`
    );
    return response;
  } catch (error) {
    if (error instanceof DashboardStoreError) {
      console.error('Dashboard store error:', error);
      const status = error.code === 'MAX_DASHBOARDS_REACHED' ? 400 : 500;
      return NextResponse.json({ message: error.message }, { status });
    }

    console.error('Error creating dashboard:', error);
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}
