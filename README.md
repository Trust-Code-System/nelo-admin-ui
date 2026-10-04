# NELO Administration

React and TypeScript administration for commerce and Atelier, using the Vendure Admin API. Every active screen reads backend records. Missing configuration shows a setup message; there is no demonstration-data fallback. Old design-preview components remain as source references but are not imported by the running application.

## Local setup

Requires Node.js 22.12 or later and a running NELO backend.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Set `VITE_ADMIN_API_URL` to `http://localhost:3000/admin-api` for local development, or the intended deployed backend's HTTPS `/admin-api` URL. Open http://127.0.0.1:4312. Restart Vite after changing environment variables.

Sign in with an existing Vendure administrator and select an authorized channel. Backend permissions remain authoritative. Tokens are held in memory, never local/session storage; reloading requires signing in again. Logout invalidates the backend session and clears local state even if invalidation fails. No administrator credentials or secret keys belong in `VITE_` variables.

## Connected operations

| Screen                  | Live operations                                                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview                | Channel-scoped record counts; no invented revenue metrics                                                                                                                              |
| Calendar / appointments | Appointment schedule, pagination, status filtering, details, confirmation, rescheduling, cancellation, completion, no-show                                                             |
| Commissions             | Customer selection, create commission with first item, notes/deadlines, lifecycle transitions, additional items, appointment/order-line association, measurement snapshot confirmation |
| Production              | Real commission items and permitted production transitions                                                                                                                             |
| Measurements            | Customer profile reads and recording measurements through the Measurement Module                                                                                                       |
| Catalogue               | Product and variant creation/editing, prices, stock at real locations, inventory settings, images; collection creation/editing and explicit product membership                         |
| Customers               | Paginated search, creation and contact-detail updates                                                                                                                                  |
| Orders                  | Order/payment/refund details, manual fulfillment creation, shipment/delivery transitions returned by the backend                                                                       |
| Assets                  | Real asset library and multipart uploads                                                                                                                                               |
| Profile                 | Active administrator identity and name updates                                                                                                                                         |

**Products and collections are different.** A product is an item for sale; its variants carry SKU, price and stock. A collection groups products. Use **Catalogue → Collections → New collection** to create one.

The custom admin covers these daily operations. Advanced option groups, collection filter rules, shipping/tax/payment configuration, staff/roles, retention/privacy administration and money-moving refunds/reconciliation remain in Vendure. The **Open Vendure** button opens the backend's dashboard. Staff appointment creation is unavailable because the backend exposes customer booking instead. The calendar retains the original time-grid design with Week, Day, Month and List views. It loads all appointment pages for the selected channel/status. Calendar axes use the operator browser timezone; appointment details retain the recorded timezone. Measurement CSV imports and pretend security/notification controls have been removed.

Lists are paginated. Asset/product membership and related-order selectors currently load up to 100 records (appointments: 50). Commission customer selection supports email search to narrow matches. Larger catalogues will need dedicated searchable selectors before relying on those pickers for every record.

All mutations use existing backend APIs and rules; resolvers own authorization, versions and lifecycle invariants. Prices are converted to integer minor units without floating-point multiplication. Stock accepts non-negative whole numbers. Measurement input is converted by the backend; stored values display in canonical millimetres. Appointment rescheduling uses the operator browser's local timezone and sends UTC.

Writes are not automatically retried. A network, incomplete response or server failure can mean the write succeeded: refresh and inspect the saved record before attempting another action. Forms block resubmission in that situation. Existing records and details clear when changing channel.

## Verification

```sh
npm test
npm run build
npm run format:check
```

Tests cover bearer/session transport, channel headers, partial GraphQL failures, union business errors, no automatic retries, exact price conversion, inventory validation and commission IDs/version guards. Build checks strict TypeScript before bundling. CI runs tests, build and formatting.

Local verification on 4 October 2026: all operational read queries and mutation documents checked against the running Admin API schema; authenticated reads and all 11 browser views passed. Desktop/mobile layout checked. These checks do not prove every lifecycle transition or payment/refund action; test authorized writes on disposable local records before promoting to production.

## Deployment

The existing Vercel project is linked to `Trust-Code-System/nelo-admin-ui`. Set the public Admin API endpoint in the intended Vercel environment. Add the exact admin website origin to backend `CORS_ORIGINS`, preserving existing storefront origins, and ensure bearer-token response headers are exposed. Never add secret keys to this browser application. Changes to this branch do not deploy until pushed and promoted through the team's review process.

The backend and customer storefront live in separate repositories; this integration does not change backend roles or domain modules.
