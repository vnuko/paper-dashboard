import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { listLinks } from '@/lib/links';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dashboardId = searchParams.get('dashboardId') ?? undefined;

    const links = await listLinks(dashboardId);
    return NextResponse.json(
      links.map(l => ({
        id: l.id,
        position: l.position,
        title: l.title,
        dashboardId: l.dashboardId,
      })),
      {
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching links order:', error);
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.dashboardId || typeof body.dashboardId !== 'string') {
      return NextResponse.json(
        {
          message: 'dashboardId is required and must be a string',
          errors: {
            dashboardId: 'dashboardId is required and must be a string',
          },
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.orders)) {
      return NextResponse.json(
        {
          message: 'orders must be an array',
          errors: { orders: 'orders must be an array' },
        },
        { status: 400 }
      );
    }

    for (const item of body.orders) {
      if (
        !item ||
        typeof item !== 'object' ||
        typeof item.id !== 'string' ||
        typeof item.position !== 'number'
      ) {
        return NextResponse.json(
          {
            message:
              'Each order item must have id (string) and position (number)',
            errors: {
              orders:
                'Each order item must have id (string) and position (number)',
            },
          },
          { status: 400 }
        );
      }
    }

    const offset = 10000;

    const tempCaseClauses = body.orders
      .map(
        (item: { id: string; position: number }, index: number) =>
          `WHEN '${item.id}' THEN ${offset + index}`
      )
      .join(' ');

    const finalCaseClauses = body.orders
      .map(
        (item: { id: string; position: number }) =>
          `WHEN '${item.id}' THEN ${item.position}`
      )
      .join(' ');

    const idList = body.orders
      .map((item: { id: string; position: number }) => `'${item.id}'`)
      .join(',');

    await prisma.$executeRaw`UPDATE Link SET position = CASE id ${Prisma.raw(tempCaseClauses)} END WHERE id IN (${Prisma.raw(idList)}) AND dashboardId = ${body.dashboardId}`;

    await prisma.$executeRaw`UPDATE Link SET position = CASE id ${Prisma.raw(finalCaseClauses)} END WHERE id IN (${Prisma.raw(idList)}) AND dashboardId = ${body.dashboardId}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering links:', error);
    return NextResponse.json(
      { message: 'Unexpected error', error: String(error) },
      { status: 500 }
    );
  }
}
