import { NextRequest } from 'next/server';
import { listLinks, createLink, LinkStoreError } from '@/lib/links';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const links = await listLinks();
    return NextResponse.json(links, {
      headers: {
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Error fetching links:', error);
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

    if (
      body.badge !== undefined &&
      body.badge !== null &&
      typeof body.badge !== 'string'
    ) {
      return NextResponse.json(
        {
          message: 'Badge must be a string when provided',
          errors: { badge: 'Badge must be a string when provided' },
        },
        { status: 400 }
      );
    }

    const newLink = await createLink({
      title: body.title,
      url: body.url,
      description: body.description,
      position:
        body.position !== undefined
          ? body.position
          : (await listLinks()).length,
      iconKey: body.iconKey,
      badge: body.badge,
    });

    const response = NextResponse.json(newLink, { status: 201 });
    response.headers.set(
      'Location',
      `${request.nextUrl.origin}/api/links/${newLink.id}`
    );
    return response;
  } catch (error) {
    if (error instanceof LinkStoreError) {
      console.error('Link store error:', error);
      return NextResponse.json(
        { message: error.message },
        { status: error.code.startsWith('INVALID_URL') ? 400 : 500 }
      );
    }

    console.error('Error creating link:', error);
    return NextResponse.json(
      {
        message: 'Unexpected error',
      },
      { status: 500 }
    );
  }
}
