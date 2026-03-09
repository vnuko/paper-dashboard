import { NextRequest } from 'next/server';
import { listServices, createService, ServiceStoreError } from '@/lib/services';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const services = await listServices();
    return NextResponse.json(services, {
      headers: {
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation of required fields
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
      !body.url ||
      typeof body.url !== 'string' ||
      !/^(https?):\/\/.+/i.test(body.url)
    ) {
      return NextResponse.json(
        {
          message:
            'URL is required and must be a valid URL with http or https scheme',
          errors: {
            url: 'URL is required and must be a valid URL with http or https scheme',
          },
        },
        { status: 400 }
      );
    }

    // Additional basic validation for optional fields
    if (body.position !== undefined && typeof body.position !== 'number') {
      return NextResponse.json(
        {
          message: 'Position must be a number when provided',
          errors: { position: 'Position must be a number when provided' },
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

    if (body.iconKey !== undefined && typeof body.iconKey !== 'string') {
      return NextResponse.json(
        {
          message: 'Icon key must be a string when provided',
          errors: { iconKey: 'Icon key must be a string when provided' },
        },
        { status: 400 }
      );
    }

    // Create service with validated data
    const newService = await createService({
      title: body.title,
      url: body.url,
      description: body.description,
      position:
        body.position !== undefined
          ? body.position
          : // Determine the new position as the next available position
            (await listServices()).length,
      iconKey: body.iconKey,
    });

    // Return 201 Created with Location header
    const response = NextResponse.json(newService, { status: 201 });
    response.headers.set(
      'Location',
      `${request.nextUrl.origin}/api/services/${newService.id}`
    );
    return response;
  } catch (error) {
    if (error instanceof ServiceStoreError) {
      console.error('Service store error:', error);
      return NextResponse.json(
        { message: error.message },
        { status: error.code.startsWith('INVALID_URL') ? 400 : 500 }
      );
    }

    console.error('Error creating service:', error);
    return NextResponse.json(
      {
        message: 'Unexpected error',
      },
      { status: 500 }
    );
  }
}
