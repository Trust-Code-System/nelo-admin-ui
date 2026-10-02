# NELO Admin UI

Interactive frontend for NELO Atelier operations: overview, calendar, appointments, commissions, production, measurements, assets, orders, customers, catalogue, and operator profile.

Live site: https://nelo-atelier-admin-ui.vercel.app

## Run locally

Requires Node.js 22 or later. There are no runtime dependencies or credentials to configure.

```sh
git clone https://github.com/Trust-Code-System/nelo-admin-ui.git
cd nelo-admin-ui
npm run dev
```

Open http://localhost:4312. Set `PORT` if that port is already occupied.

## Build and preview

```sh
npm run build
npm run preview
```

The build copies the self-contained `index.html` into `dist/`. Styles, scripts, icons, and the NELO logo are embedded in the HTML; Google Fonts supplies the typography.

## Deployment

The existing Vercel project is `nelo-atelier-admin-ui`. Its production branch is `main`. Vercel reads `vercel.json`, runs `npm run build`, and serves `dist/`. Pushes to `main` deploy the production site; other branches receive previews when supported by the project's settings.

## Data and integration status

This is the interactive design preview. Records and operator identity are demonstration fixtures. Actions illustrate frontend interactions; they do not read or update the Vendure Admin API. Backend integration belongs to the separate `nelo-commerce` project.

## Source provenance

The initial UI was extracted unchanged from `admin-preview/index.html` at `nelo-commerce` commit `6cd9026` (`feat/atelier-admin-finish`). That source matched the production site when this repository was prepared.
