import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    let icons;

    if (query) {
      icons = await prisma.iconIndex.findMany({
        where: {
          OR: [{ name: { contains: query } }, { path: { contains: query } }],
        },
        orderBy: { name: 'asc' },
        take: 5,
      });
    } else {
      icons = await prisma.iconIndex.findMany({
        orderBy: { name: 'asc' },
        take: 5,
      });
    }

    if (icons.length === 0) {
      return NextResponse.json(
        { message: 'No icons found. Please run: npm run index:icons' },
        { status: 404 }
      );
    }

    return NextResponse.json(icons);
  } catch (error) {
    console.error('Error loading icons:', error);
    return NextResponse.json(
      { message: 'Failed to load icons' },
      { status: 500 }
    );
  }
}
