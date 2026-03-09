import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    let icons;

    if (query) {
      // Use raw SQL for relevance-based search
      // Priority: exact match > starts with > contains
      icons = await prisma.$queryRaw<any[]>`
        SELECT id, name, path, createdAt
        FROM IconIndex
        WHERE name LIKE ${'%' + query + '%'} OR path LIKE ${'%' + query + '%'}
        ORDER BY
          CASE 
            WHEN name = ${query} THEN 0
            WHEN name LIKE ${query + '%'} THEN 1
            ELSE 2
          END ASC,
          name ASC
        LIMIT 5
      `;
    } else {
      icons = await prisma.iconIndex.findMany({
        orderBy: { name: 'asc' },
        take: 5,
      });
    }

    // Return empty array instead of 404 - no icons found is a valid state
    return NextResponse.json(icons);
  } catch (error) {
    console.error('Error loading icons:', error);
    return NextResponse.json(
      { message: 'Failed to load icons' },
      { status: 500 }
    );
  }
}
