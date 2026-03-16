import { NextRequest, NextResponse } from 'next/server';
import {
  getLink,
  updateLink,
  deleteLink,
  LinkStoreError,
  validateLinkUpdateInput,
} from '@/lib/links';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

function handleLinkError(error: unknown, action: string) {
  console.error(`Error ${action}:`, error);

  if (error instanceof LinkStoreError) {
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
    const link = await getLink(id);

    if (!link) {
      return NextResponse.json({ message: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json(link, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    return handleLinkError(error, 'fetching link');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existingLink = await getLink(id);

    if (!existingLink) {
      return NextResponse.json({ message: 'Link not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = validateLinkUpdateInput(body);
    const updatedLink = await updateLink(id, validatedData);

    return NextResponse.json(updatedLink);
  } catch (error) {
    return handleLinkError(error, 'updating link');
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const link = await getLink(id);

    if (!link) {
      return NextResponse.json({ message: 'Link not found' }, { status: 404 });
    }

    await deleteLink(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleLinkError(error, 'deleting link');
  }
}
