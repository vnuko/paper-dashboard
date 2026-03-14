import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { listServices } from '@/lib/services';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const services = await listServices();
    return NextResponse.json(
      services.map(s => ({ id: s.id, position: s.position, title: s.title })),
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
    console.error('Error fetching services order:', error);
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

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

    await prisma.$executeRaw`UPDATE Dashboard SET position = CASE id ${Prisma.raw(tempCaseClauses)} END WHERE id IN (${Prisma.raw(idList)})`;

    await prisma.$executeRaw`UPDATE Dashboard SET position = CASE id ${Prisma.raw(finalCaseClauses)} END WHERE id IN (${Prisma.raw(idList)})`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering services:', error);
    return NextResponse.json(
      { message: 'Unexpected error', error: String(error) },
      { status: 500 }
    );
  }
}
