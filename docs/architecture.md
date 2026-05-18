# Frontend Architecture

This project uses a feature-first frontend structure with a few shared domain folders. The goal is to make it obvious where code belongs before a file is created.

## Top-Level Responsibilities

```text
src/app
```

Application composition lives here: root app component, providers, and router wiring. Avoid putting product logic here.

```text
src/components
```

Reusable UI that has no product ownership. Keep primitives in `src/components/ui`; put only broadly shared composed widgets at the folder root.

```text
src/config
```

Static app configuration such as API endpoint constants.

```text
src/lib
```

Small shared utilities that do not belong to a single feature. Good examples are date formatting, API clients, image helpers, and class-name utilities.

```text
src/store
```

Global app state stores.

```text
src/features
```

Route-owned product areas. If a screen belongs to a dashboard or auth flow, it starts here.

```text
src/chat
src/channels
```

Shared product domains used by more than one feature. These are not generic components; they contain real domain behavior reused by admin and user workspaces.

## Where New Code Should Go

| Code type | Location |
| --- | --- |
| New admin dashboard page | `src/features/admin-dashboard/pages` |
| New user dashboard page | `src/features/user-dashboard/pages` |
| New super-admin page | `src/features/super-admin-dashboard/pages` |
| Shared meeting or call behavior | `src/features/meetings` |
| Shared DM chat behavior | `src/chat` |
| Shared channel behavior | `src/channels` |
| Button/input/dialog primitive | `src/components/ui` |
| Reusable helper with no React | `src/lib` |
| API endpoint constant | `src/config/api.js` |

## Folder Pattern

Use this shape for feature areas when they grow:

```text
feature-name/
  components/             Components used only by this feature
  hooks/                  Feature-specific hooks
  pages/                  Route-level pages
  utils/                  Feature-specific helpers
  routes.jsx              Route declarations, when needed
```

Use this shape for shared domains:

```text
domain-name/
  components/             Domain UI
  hooks/                  Domain data/interaction hooks
  pages/                  Shared page shells, if any
  utils/                  Domain normalization and helpers
```

## Import Guidelines

- Prefer `@/` absolute imports for source files.
- Feature code may import shared domains, shared UI, config, lib, and store.
- Shared domains should avoid importing dashboard-specific pages or layouts.
- `src/lib` should not import feature code.
- `src/components/ui` should not import product domains.

## Current Shared Domains

### Channels

`src/channels` owns channel messaging, member lists, channel sidebars, channel composers, and admin-specific channel composition.

### Chat

`src/chat` owns direct-message conversations, chat sidebars, message rendering, message details, and chat workspace state.

### Meetings

`src/features/meetings` owns shared meeting creation, call launchers, incoming call handling, meeting room pages, and meeting utility functions.

## Backend Boundary

Backend code lives in `Collabration_Teams_backend/`. Frontend files should talk to it only through `src/config/api.js` and `src/lib/client.js`.

When a frontend feature needs backend support, document the expected endpoint or payload in the frontend PR/task instead of adding backend logic inside `src`.
