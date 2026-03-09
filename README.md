# Paper Dashboard

Do you have many local or remote services, tools, or websites you access regularly? Paper Dashboard provides dashboard interface where you can organize your favorite links in one place.
It works like a visual bookmark manager: each item appears as an icon that opens a website or service. You can easily add, edit, organize, or remove links to keep your dashboard clean and convenient.
You can also customize the look by using your preferred icon packs, making it easy to quickly recognize and access your most used services.

## Prerequisites

Before you start, make sure you have these installed:

- Node.js 18 or higher
- npm

## Getting Started

### Step 1: Add Your Icons

Paper Dashboard uses SVG icons to make your services look great. You can add any icon pack you like. We recommend the Papirus icon theme because it has tons of icons and looks really clean.

Download the Papirus icons from here: https://github.com/PapirusDevelopmentTeam/papirus-icon-theme/tree/master/Papirus/64x64

Then copy the icons you want into the `public/icons` folder. You can organize them in subfolders if you like. For example:

```
public/icons/
  apps/
    firefox.svg
    vscode.svg
  places/
    folder.svg
```

### Step 2: Install Dependencies

Clone the repository and install the dependencies:

```bash
npm install
```

### Step 3: Set Up the Database

Paper Dashboard uses SQLite, so there is no need to set up a separate database server. Just run the migration to create the database file:

```bash
npm run db:migrate
npm run db:generate
```

### Step 4: Index icons

We will index incond in the DB

```bash
npm run index:icons
```

### Step 5: Run the App

For development:

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

For production:

```bash
npm run build
npm start
```

## Usage

### Adding a Service

Click the plus button in the center of the screen (when empty) or open the menu and click Add Service. Fill in the title, description, URL, and pick an icon. Click Save and you are done.

### Editing a Service

Open the menu and click Edit Mode. Then click on any service you want to edit. Make your changes and save.

### Deleting a Service

Open the menu and click Delete Mode. Then click on any service you want to delete. Confirm the deletion and it will be removed.

### Searching for Icons

When adding or editing a service, you can search for icons by typing in the icon field. The search will filter through your icon collection and show matching results.

## Tech Stack

- Next.js 16 with App Router
- React 19
- Prisma with SQLite
- TypeScript

## Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| npm run dev         | Start development server             |
| npm run build       | Build for production                 |
| npm start           | Start production server              |
| npm run db:migrate  | Run database migrations              |
| npm run db:generate | Generate Prisma client               |
| npm run index:icons | Index icons from public/icons folder |
| npm run lint        | Run ESLint                           |
| npm run test        | Run tests                            |
| npm run format      | Format code with Prettier            |

## Environment Variables

Create a `.env` file in the root directory:

```
DATABASE_URL="file:./dev.db"
```

You can also change where the app looks for icons by setting:

```
ICON_INDEX_PATH="public/icons"
```

## Customization

### Changing Colors and Theme

The app uses CSS custom properties for theming. You can find them in `app/globals.css`. Look for the `:root` section and adjust the colors to your liking.

### Adding More Icons

Just drop more SVG files into `public/icons` and run `npm run index:icons` to index them. The app will automatically pick them up.

## Running Tests

### Unit Tests

```bash
npm run test
```

### End-to-End Tests

```bash
# First start the dev server in one terminal:
npm run dev

# Then run the e2e tests in another terminal:
npm run test:e2e
```

## Icon Attributions

This project uses icons from the Papirus Icon Theme licensed under the GNU LGPLv3.

## License

MIT
