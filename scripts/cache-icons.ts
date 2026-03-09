import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const ICON_INDEX_PATH = process.env.ICON_INDEX_PATH || 'public/icons';
const ICONS_ROOT_PATH = path.join(process.cwd(), ICON_INDEX_PATH);

interface IconInfo {
  name: string;
  path: string;
}

/**
 * Recursively scan directory for SVG files
 */
function scanDirectory(dir: string, basePath: string = ''): IconInfo[] {
  const icons: IconInfo[] = [];

  if (!fs.existsSync(dir)) {
    return icons;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Skip size-based folders (e.g., 24x24@2x)
      if (/^\d+x\d+@?\d*$/.test(entry.name)) {
        continue;
      }

      const subPath = basePath ? `${basePath}/${entry.name}` : entry.name;
      icons.push(...scanDirectory(path.join(dir, entry.name), subPath));
    } else if (entry.isFile() && entry.name.endsWith('.svg')) {
      const iconPath = basePath ? `${basePath}/${entry.name}` : entry.name;
      const name = entry.name.replace('.svg', '');

      icons.push({
        name,
        path: iconPath,
      });
    }
  }

  return icons;
}

/**
 * Main function to scan and cache icons in database
 */
async function main() {
  try {
    console.log('Scanning icons directory...');

    const icons = scanDirectory(ICONS_ROOT_PATH);

    // Sort icons by name for better UX
    icons.sort((a, b) => a.name.localeCompare(b.name));

    console.log(`Found ${icons.length} icons. Updating database...`);

    // Clear existing icon index
    await prisma.iconIndex.deleteMany();

    // Insert all icons in batch
    await prisma.iconIndex.createMany({
      data: icons.map(icon => ({
        name: icon.name,
        path: icon.path,
      })),
    });

    console.log(`✓ Indexed ${icons.length} icons in database`);
  } catch (error) {
    console.error('Error indexing icons:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
