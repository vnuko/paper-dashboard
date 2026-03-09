const { PrismaClient } = require('@prisma/client');

describe('Prisma Dashboard Model Tests', () => {
  let prisma: any;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should contain at least six rows after seeding', async () => {
    const dashboardEntries = await prisma.dashboard.findMany();

    expect(dashboardEntries).toHaveLength(6);
  });

  test('should have correctly seeded entry positions', async () => {
    const dashboardEntries = await prisma.dashboard.findMany({
      orderBy: { position: 'asc' },
    });

    const positions = dashboardEntries.map((entry: any) => entry.position);
    expect(positions).toEqual([0, 1, 2, 3, 4, 5]);
  });

  test('should have entries with titles and URLs', async () => {
    const dashboardEntries = await prisma.dashboard.findMany();

    for (const entry of dashboardEntries) {
      expect(entry.title).toBeTruthy();
      expect(entry.url).toBeTruthy();
    }
  });

  test('should have entries with expected iconKeys', async () => {
    const dashboardEntries = await prisma.dashboard.findMany();

    const expectedIcons = [
      'folder-server.svg',
      'multimedia-player.svg',
      'folder-cloud.svg',
      'lightbulb.svg',
      'drive.svg',
      'writer.svg',
    ];

    const iconKeys = dashboardEntries.map((entry: any) => entry.iconKey);
    expect(iconKeys).toEqual(expect.arrayContaining(expectedIcons));
  });
});

describe('Prisma IconIndex Model Tests', () => {
  let prisma: any;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should fetch first 5 icons ordered by name', async () => {
    const icons = await prisma.iconIndex.findMany({
      orderBy: { name: 'asc' },
      take: 5,
    });

    expect(icons.length).toBeLessThanOrEqual(5);
    expect(icons).toEqual(
      expect.arrayContaining(
        icons.map((icon: any) =>
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            path: expect.any(String),
            createdAt: expect.any(Date),
          })
        )
      )
    );
  });

  test('should search icons by name containing query', async () => {
    const query = 'test';
    const icons = await prisma.iconIndex.findMany({
      where: {
        OR: [{ name: { contains: query } }, { path: { contains: query } }],
      },
      orderBy: { name: 'asc' },
      take: 5,
    });

    icons.forEach((icon: any) => {
      expect(
        icon.name.toLowerCase().includes(query.toLowerCase()) ||
          icon.path.toLowerCase().includes(query.toLowerCase())
      ).toBe(true);
    });
    expect(icons.length).toBeLessThanOrEqual(5);
  });

  test('should search icons by path containing query', async () => {
    const query = 'folder';
    const icons = await prisma.iconIndex.findMany({
      where: {
        OR: [{ name: { contains: query } }, { path: { contains: query } }],
      },
      orderBy: { name: 'asc' },
      take: 5,
    });

    icons.forEach((icon: any) => {
      expect(
        icon.name.toLowerCase().includes(query.toLowerCase()) ||
          icon.path.toLowerCase().includes(query.toLowerCase())
      ).toBe(true);
    });
    expect(icons.length).toBeLessThanOrEqual(5);
  });

  test('should return empty array when no icons match query', async () => {
    const query = 'nonexistenticonxyz123';
    const icons = await prisma.iconIndex.findMany({
      where: {
        OR: [{ name: { contains: query } }, { path: { contains: query } }],
      },
      orderBy: { name: 'asc' },
      take: 5,
    });

    expect(icons).toHaveLength(0);
  });

  test('should have unique paths', async () => {
    const icons = await prisma.iconIndex.findMany();
    const paths = icons.map((icon: any) => icon.path);
    const uniquePaths = new Set(paths);

    expect(paths.length).toBe(uniquePaths.size);
  });
});
