# NELO Admin UI

React and TypeScript frontend for NELO Atelier operations. The original visual design is preserved across overview, calendar, appointments, commissions, production, measurements, assets, orders, customers, catalogue, and operator profile.

Production site: https://nelo-atelier-admin-ui.vercel.app

## Run locally

Requires Node.js 22.12 or later.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4312. Vite serves the application and updates it as source files change. To use another port, run `npm run dev -- --port 4313`.

## Verify and build

```sh
npm test
npm run build
npm run format:check
npm run preview
```

The build first checks TypeScript in strict mode, then bundles the React application into `dist/`. Preview serves that production build. GitHub Actions runs the same tests, build and formatting checks on pull requests.

## Source layout

- `src/App.tsx`: application shell and screen composition.
- `src/pages/`: React screen components.
- `src/components/`: navigation, charts, menus, dialogs, date picker and file staging.
- `src/hooks/`: React state, navigation, actions and keyboard focus management.
- `src/data/fixtures.ts`: demonstration data and form definitions.
- `src/lib/`: record filtering and CSV export, with regression tests.
- `src/styles/atelier.css`: original responsive styles and design tokens.
- `public/nelo-logo.png`: original NELO artwork.

`index.html` is the small Vite entry document. Application markup and behavior are React/TypeScript source; there is no embedded application script or HTML-string rendering. Screen navigation uses hash routes such as `/#appointments` and supports refresh and browser Back/Forward.

## Deployment

The existing Vercel project `nelo-atelier-admin-ui` is connected to `Trust-Code-System/nelo-admin-ui`. Its production branch is `main`. Vercel uses `npm run build` and serves `dist/` using the existing `vercel.json` routing and response headers. Branches receive preview deployments when permitted by the project's settings.

Review and merge the migration pull request to update the existing production URL. No additional Vercel project is required.

## Data and integration status

This remains a design preview. Records, operator identity, dates, permissions and account security indicators are demonstration fixtures. No real administrator authentication or Vendure Admin API connection is configured. Changing a preview preference does not change a real account or send notifications.

Created records appear under **Added in this session** on their corresponding screen. They are held in React memory and disappear when the page reloads. Uploaded files and measurement CSVs are read or staged locally; they are not transmitted to a backend or persisted. CSV imports validate required headers only and do not create measurement profiles.

The actual backend and Vendure Dashboard extension live in the separate `nelo-commerce` project. This migration does not change their authentication, APIs or data models.

## Source provenance

The original design was extracted from `admin-preview/index.html` at `nelo-commerce` commit `6cd9026` (`feat/atelier-admin-finish`). The React migration preserves its typography, layout, icons, artwork and responsive styling while replacing imperative DOM rendering with React components and state.
