# Conectio

Conectio is a React + Vite collaboration platform with company administration, user workspaces, channels, chat, meetings, calls, files, settings, and super-admin controls.

## Quick Start

```bash
npm install
npm run dev
```

Useful scripts:

```bash
npm run build
npm run lint
```

## Folder Structure

```text
src/
  app/                    App shell, providers, and route composition
  components/             Shared reusable UI components
    ui/                   Primitive UI building blocks
  config/                 API endpoint constants and runtime config
  lib/                    Shared framework-agnostic helpers
  store/                  Global client state

  features/               Route-level product areas
    auth/                 User auth pages and forms
    admin-auth/           Admin auth and MFA
    super-admin-auth/     Super-admin auth
    admin-dashboard/      Company admin dashboard routes and layout
    super-admin-dashboard/Super-admin dashboard routes and layout
    user-dashboard/       User workspace routes and layout
    meetings/             Shared meeting, call, and LiveKit flows
    landing/              Public landing experience

  chat/                   Shared direct-message chat domain
    components/           Chat UI components
    hooks/                Chat data and interaction hooks
    pages/                Shared chat page wrappers
    utils/                Chat normalization and storage helpers

  channels/               Shared channel messaging domain
    components/           Channel UI components
    hooks/                Channel data hooks
    utils/                Channel normalization and schema helpers
    admin/                Admin-specific channel composition
```

## Architecture Rules

- Put route pages and layouts inside `src/features/<area>/`.
- Put shared product domains that are used by more than one feature at `src/<domain>/`, such as `src/chat` and `src/channels`.
- Put generic UI primitives in `src/components/ui`.
- Put app-wide helpers in `src/lib`; avoid importing React from this folder.
- Put API paths in `src/config/api.js`; do not hard-code endpoints in components.
- Keep backend code in `Collabration_Teams_backend/`; do not mix backend modules into `src`.

For more detail, see [docs/architecture.md](docs/architecture.md).
