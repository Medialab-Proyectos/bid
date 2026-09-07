# Demo mode (no backend, no database, no Azure AD)

Runs the Fiduciary Interface completely offline with mock data. Nothing leaves
the browser: there is no database connection, no call to the fiduciary API and
no Azure AD B2C sign-in.

## Run it

```bash
nvm use 20.20.2          # Angular 16 does not support Node 22
npm install --legacy-peer-deps
npm run start:demo       # http://localhost:4200
```

`npm run build:demo` produces the same thing as a static bundle in
`dist/fiduciaryInterface`.

## What demo mode changes

Everything is driven by the `demoMode: true` flag in
`src/environments/environment.demo.ts`. It is `false` in every other
environment file, so no other configuration is affected.

| Concern | Normal build | Demo build |
| --- | --- | --- |
| Sign-in | Azure AD B2C redirect (MSAL) | Fixed local user, no redirect |
| API host | `apim-*.iadb.org` | `https://demo.local/fiduciary-api`, never reached |
| HTTP calls | Real network | Answered in-browser by `DemoBackendInterceptor` |
| Permissions | From the API | All permissions granted (`permissionsByPass`) |
| Datadog / Userpilot | Enabled | Disabled |
| Session timeout | 3 h | 8 h |

## How it works

`src/app/demo/`

- `demo-user.ts` — the fake signed-in account (`Demo User`, internal profile).
- `demo-msal.ts` — stand-ins for `MsalService`, `MsalBroadcastService` and the
  MSAL instance. `inProgress$` emits `None` immediately and
  `getActiveAccount()` always returns the demo account, so `InitService`,
  `PermissionService` and `SelectedProjectGuard` behave as if the user were
  already signed in. Wired up in `src/app/msal/msal.config.ts`.
- `demo-backend.interceptor.ts` — last HTTP interceptor in the chain. In demo
  mode it answers every request whose URL starts with the API host and never
  calls `next.handle`, so no request reaches the network. A 220 ms delay keeps
  the loaders and skeletons visible. Registered in `app.module.ts`; it is a
  no-op in every other environment.
- `demo-backend.routes.ts` — the route table: method + path pattern + handler.
- `data/` — the mock payloads.

## Data included

- 6 operations across Argentina, Brazil, Colombia, Ecuador, Mexico and Peru,
  two of them marked as favourites.
- Country facet for the dashboard filter, and the country/enumeration catalogues.
- Full permission set for every contract.
- Project sidebar with the nine entries of the live product, in the same order
  and with icons: general procurement notice, procurement management, payment
  schedule, payment record, financial management (expandable, with financial
  transactions and disbursement information), thresholds and UCS, workflow
  management, components structure and frequent questions. Five of them have
  no screen in this release and are marked `routeTo: 'null'`, which the sidebar
  component ignores on click — the menu looks complete and nothing navigates
  away. See the comment on `DEMO_SIDEBAR` for the fields the component needs
  (`icon` with the Kendo base classes, `index` for the highlight).
- One approved procurement plan per project with 6 procurement processes
  covering different categories, methods, statuses and milestones, each one
  openable as a process detail.
- 5 document packages per process (bidding documents through publication of
  contract award) with mixed statuses, plus the participant settings the
  Documents tab needs before it can render them.
- Contract enumerations for the contract forms.
- Workflow configuration assigning the demo user to step 0 — without it the
  Financial Transactions grid fails to build its row actions.
- 6 workflow activities for the Activities screen.
- Financial balances, 5 transactions, pending transactions, transaction types
  and the component breakdown of the Disbursement Information screen.
- Payment record: 4 commitments per project, 10 payments each seeded across the
  three states (2 already justified, 3 reported as paid, 5 still scheduled) and
  split between reimbursable and not, so both branches of the statement of
  expenditures have candidates; the loan components and outputs; the payment
  schedule offered by the "add payments" dialog; and the exchange rates. This is the only part of the demo backend that keeps mutable state:
  adding, editing and deleting payments persists for the session (see
  `data/demo-payment-record.ts`), so the whole flow of the screens can be
  shown. A page reload resets it. The spreadsheet import answers the first
  upload of a commitment with the validation report of the design (duplicates
  and blocking errors) and accepts the second one, so both paths are reachable
  without needing a real parser. Payment amounts are sized against what each
  contract holds in that currency, because the module now refuses entries that
  would push a currency past what was signed.

Screens verified end to end with no console errors: dashboard, activities,
projects, notifications, forms, procurement (plan, approved plans,
monitoring), financial transactions, disbursement information, GPN, workflow
management, and the process detail tabs (documents, participants, contracts,
comments).

## Adding data for a screen that is still empty

Unmapped endpoints answer `[]` (GET) or `{ success: true }` (other verbs), so
screens stay functional but empty, and the browser console logs each one once:

```
[demo] no mock defined for GET /api/... - returned empty payload
```

To fill one in: add the payload under `src/app/demo/data/` and register a route
in `demo-backend.routes.ts`. Keep the `/api/{enumType}` catch-all last — it
would otherwise swallow more specific paths.

A handler can also reject the request: returning `demoError(status, body)`
makes the interceptor answer with a failed response instead of a 200, which is
how the currency ceiling and other business rules are exercised end to end.

Handlers receive the request body already decoded. `EncodeInterceptor`
base64-encodes every POST and PUT body unless the caller opts out of
`REQUEST_IS_ENCODED`, so what reaches the demo backend is
`{ encode: '<base64>' }`; `DemoBackendInterceptor` unwraps it the way the real
API does.

Ids matter: values such as `category.id` or `advanceMilestone.currentMilestone.code`
are resolved against the enumerations served by the demo backend. When they do
not match, the screen renders empty. The ids shared between both sides live in
`data/demo-enums.ts` (`DEMO_CATEGORY_IDS`, `DEMO_PROCUREMENT_METHOD_IDS`,
`DEMO_MILESTONE_IDS`).
