# Dashboard → Link Rename Design

## Overview

Rename the `Dashboard` model to `Link` across the backend codebase. This includes the Prisma schema, API routes, service layer, and tests. Frontend changes are out of scope for this phase.

## Files to Rename

| Current Path                     | New Path                      |
| -------------------------------- | ----------------------------- |
| `lib/services.ts`                | `lib/links.ts`                |
| `app/api/services/route.ts`      | `app/api/links/route.ts`      |
| `app/api/services/[id]/route.ts` | `app/api/links/[id]/route.ts` |
| `tests/prisma/dashboard.test.ts` | `tests/prisma/link.test.ts`   |

## Schema Changes

**File:** `prisma/schema.prisma`

```prisma
# Before
model Dashboard {
  id          String   @id @default(uuid())
  title       String
  description String?
  url         String
  position    Int      @unique
  iconKey     String?
  badge       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

# After
model Link {
  id          String   @id @default(uuid())
  title       String
  description String?
  url         String
  position    Int      @unique
  iconKey     String?
  badge       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Note:** No migration needed - table will be dropped and recreated.

## Service Layer Changes

**File:** `lib/links.ts` (renamed from `lib/services.ts`)

### Type Renames

| Before                           | After             |
| -------------------------------- | ----------------- |
| `Dashboard` (Prisma type import) | `Link`            |
| `ServiceData`                    | `LinkData`        |
| `ServiceUpdateInput`             | `LinkUpdateInput` |
| `ServiceStoreError`              | `LinkStoreError`  |

### Function Renames

| Before                       | After                     |
| ---------------------------- | ------------------------- |
| `validateServiceUrl`         | `validateLinkUrl`         |
| `validateServiceUpdateInput` | `validateLinkUpdateInput` |
| `listServices`               | `listLinks`               |
| `getService`                 | `getLink`                 |
| `createService`              | `createLink`              |
| `updateService`              | `updateLink`              |
| `deleteService`              | `deleteLink`              |
| `reorderServices` (private)  | `reorderLinks`            |

### Prisma Client Method Updates

All `prisma.dashboard.*` calls become `prisma.link.*`:

- `prisma.dashboard.findMany()` → `prisma.link.findMany()`
- `prisma.dashboard.findUnique()` → `prisma.link.findUnique()`
- `prisma.dashboard.create()` → `prisma.link.create()`
- `prisma.dashboard.update()` → `prisma.link.update()`
- `prisma.dashboard.delete()` → `prisma.link.delete()`
- `prisma.dashboard.updateMany()` → `prisma.link.updateMany()`

## API Route Changes

### `app/api/links/route.ts`

- Update import: `from '@/lib/services'` → `from '@/lib/links'`
- Rename imported functions:
  - `listServices` → `listLinks`
  - `createService` → `createLink`
  - `ServiceStoreError` → `LinkStoreError`
- Update variable names: `services` → `links`, `newService` → `newLink`
- Update Location header: `/api/services/` → `/api/links/`
- Update error messages: "service" → "link"

### `app/api/links/[id]/route.ts`

- Update import: `from '@/lib/services'` → `from '@/lib/links'`
- Rename imported functions:
  - `getService` → `getLink`
  - `updateService` → `updateLink`
  - `deleteService` → `deleteLink`
  - `ServiceStoreError` → `LinkStoreError`
  - `validateServiceUpdateInput` → `validateLinkUpdateInput`
- Update variable names: `service` → `link`, `existingService` → `existingLink`, `updatedService` → `updatedLink`
- Update error messages: "Service not found" → "Link not found"
- Rename `handleServiceError` → `handleLinkError`

### `app/api/reorder/route.ts`

- Update raw SQL table name: `Dashboard` → `Link`

  ```sql
  -- Before
  UPDATE Dashboard SET position = CASE id ...

  -- After
  UPDATE Link SET position = CASE id ...
  ```

## Test Changes

**File:** `tests/prisma/link.test.ts` (renamed from `dashboard.test.ts`)

- Update describe block: `'Prisma Dashboard Model Tests'` → `'Prisma Link Model Tests'`
- Update all variable names: `dashboardEntries` → `linkEntries`
- Update Prisma calls: `prisma.dashboard.*` → `prisma.link.*`

## Out of Scope (Phase 2 - Frontend)

The following files reference `listServices` from the frontend but are **not** being changed in this phase:

- `app/page.tsx` - imports `listServices` from `@/lib/services`

After backend changes are complete, frontend will need:

1. Update import path: `@/lib/services` → `@/lib/links`
2. Update function call: `listServices` → `listLinks`
3. Update any UI text/labels referencing "service" to "link"

## Execution Order

1. Rename Prisma model `Dashboard` → `Link` in schema
2. Run `npx prisma generate` to update Prisma client types
3. Rename and update `lib/services.ts` → `lib/links.ts`
4. Rename and update `app/api/services/` → `app/api/links/`
5. Update `app/api/reorder/route.ts` raw SQL
6. Rename and update `tests/prisma/dashboard.test.ts` → `tests/prisma/link.test.ts`
7. Run tests to verify changes
8. Drop and recreate database table (manual operation)

## Risk Mitigation

- All changes are type-checked by TypeScript
- Tests will catch any missed renames
- No data migration needed (table will be dropped)
- API endpoint URLs change from `/api/services` to `/api/links` - frontend will break until Phase 2
