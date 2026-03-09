import { NextRequest, NextResponse } from 'next/server';
import {
  getService,
  updateService,
  deleteService,
  ServiceStoreError,
  validateServiceUpdateInput,
} from '@/lib/services';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

function handleServiceError(error: unknown, action: string) {
  console.error(`Error ${action}:`, error);

  if (error instanceof ServiceStoreError) {
    const status = error.code.startsWith('INVALID') ? 400 : 500;
    return NextResponse.json({ message: error.message }, { status });
  }

  return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await getService(id);

    if (!service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(service, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    return handleServiceError(error, 'fetching service');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existingService = await getService(id);

    if (!existingService) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = validateServiceUpdateInput(body);
    const updatedService = await updateService(id, validatedData);

    return NextResponse.json(updatedService);
  } catch (error) {
    return handleServiceError(error, 'updating service');
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await getService(id);

    if (!service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }

    await deleteService(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleServiceError(error, 'deleting service');
  }
}
