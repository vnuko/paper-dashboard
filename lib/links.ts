import { prisma } from '@/lib/prisma';
import type { Link } from '@prisma/client';

export class LinkStoreError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'LinkStoreError';
  }
}

export type LinkData = {
  title: string;
  description?: string | null;
  url: string;
  position: number;
  iconKey?: string | null;
  badge?: string | null;
};

export type LinkUpdateInput = Partial<Omit<LinkData, 'url'>> & {
  url?: string;
};

const URL_REGEX = /^(https?):\/\/.+/i;

export function validateLinkUrl(url: unknown): string {
  if (!url || typeof url !== 'string' || !URL_REGEX.test(url)) {
    throw new LinkStoreError(
      'URL must be a valid URL with http or https scheme',
      'INVALID_URL'
    );
  }
  return url;
}

export function validateLinkUpdateInput(input: unknown): LinkUpdateInput {
  if (typeof input !== 'object' || input === null) {
    throw new LinkStoreError('Request body must be an object', 'INVALID_INPUT');
  }

  const body = input as Record<string, unknown>;
  const validated: LinkUpdateInput = {};

  if (body.title !== undefined) {
    if (typeof body.title !== 'string') {
      throw new LinkStoreError('Title must be a string', 'INVALID_TITLE');
    }
    validated.title = body.title;
  }

  if (body.url !== undefined) {
    validateLinkUrl(body.url);
    validated.url = body.url as string;
  }

  if (body.position !== undefined) {
    if (typeof body.position !== 'number') {
      throw new LinkStoreError('Position must be a number', 'INVALID_POSITION');
    }
    validated.position = body.position;
  }

  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== 'string') {
      throw new LinkStoreError(
        'Description must be a string',
        'INVALID_DESCRIPTION'
      );
    }
    validated.description = body.description;
  }

  if (body.iconKey !== undefined) {
    if (typeof body.iconKey !== 'string') {
      throw new LinkStoreError('Icon key must be a string', 'INVALID_ICON_KEY');
    }
    validated.iconKey = body.iconKey;
  }

  if (body.badge !== undefined) {
    if (body.badge !== null && typeof body.badge !== 'string') {
      throw new LinkStoreError('Badge must be a string', 'INVALID_BADGE');
    }
    validated.badge = body.badge;
  }

  return validated;
}

/**
 * List all links ordered by position
 */
export async function listLinks(limit?: number): Promise<Link[]> {
  try {
    const links = await prisma.link.findMany({
      orderBy: {
        position: 'asc',
      },
      ...(limit !== undefined ? { take: limit } : {}),
    });
    return links;
  } catch (error) {
    throw new LinkStoreError(
      `Failed to list links: ${(error as Error).message}`,
      'LIST_LINKS_ERROR'
    );
  }
}

/**
 * Get a specific link by ID
 */
export async function getLink(id: string): Promise<Link | null> {
  try {
    const link = await prisma.link.findUnique({
      where: { id },
    });
    return link;
  } catch (error) {
    throw new LinkStoreError(
      `Failed to get link: ${(error as Error).message}`,
      'GET_LINK_ERROR'
    );
  }
}

/**
 * Create a new link
 */
export async function createLink(data: LinkData): Promise<Link> {
  try {
    // Basic URL validation
    if (
      !data.url ||
      typeof data.url !== 'string' ||
      !/^(https?:\/\/)/i.test(data.url)
    ) {
      throw new LinkStoreError('Invalid URL format', 'INVALID_URL');
    }

    const link = await prisma.link.create({
      data,
    });
    return link;
  } catch (error) {
    if (error instanceof LinkStoreError) {
      throw error;
    }
    throw new LinkStoreError(
      `Failed to create link: ${(error as Error).message}`,
      'CREATE_LINK_ERROR'
    );
  }
}

/**
 * Update an existing link with position reordering
 */
export async function updateLink(
  id: string,
  data: LinkUpdateInput
): Promise<Link> {
  try {
    if (data.url) {
      validateLinkUrl(data.url);
    }

    if (data.position !== undefined) {
      await reorderLinks(id, data.position);
    }

    const link = await prisma.link.update({
      where: { id },
      data,
    });

    return link;
  } catch (error) {
    if (error instanceof LinkStoreError) {
      throw error;
    }
    throw new LinkStoreError(
      `Failed to update link: ${(error as Error).message}`,
      'UPDATE_LINK_ERROR'
    );
  }
}

/**
 * Reorder links when a link position changes
 */
async function reorderLinks(
  linkId: string,
  newPosition: number
): Promise<void> {
  const currentLink = await prisma.link.findUnique({
    where: { id: linkId },
  });

  if (!currentLink) {
    return;
  }

  const currentPos = currentLink.position;

  if (newPosition === currentPos) {
    return;
  }

  if (newPosition < currentPos) {
    await prisma.link.updateMany({
      where: {
        id: { not: linkId },
        position: { gte: newPosition, lt: currentPos },
      },
      data: { position: { increment: 1 } },
    });
  } else {
    await prisma.link.updateMany({
      where: {
        id: { not: linkId },
        position: { gt: currentPos, lte: newPosition },
      },
      data: { position: { decrement: 1 } },
    });
  }
}

/**
 * Delete a link by ID
 */
export async function deleteLink(id: string): Promise<boolean> {
  try {
    await prisma.link.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    throw new LinkStoreError(
      `Failed to delete link: ${(error as Error).message}`,
      'DELETE_LINK_ERROR'
    );
  }
}
