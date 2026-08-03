# Architecture

## Purpose

WooStats is a React and Node.js dashboard for current and historical WOO ecosystem statistics. This document records the repository's existing runtime boundaries and the dependency rules to follow when adding data sources, scheduled updates, or dashboard surfaces.

## Current System Shape

The application has a React client in `client/`, an Express and Socket.IO server in `server/`, shared constants in `shared/`, PostgreSQL migrations in `migrations/`, and operational entrypoints in `scripts/`. The server collects external and database-backed data, persists current snapshots, and sends state to the browser. The client renders that state and does not access the database or upstream data providers directly.

## Module Map

### Client application

- Path: `client/`
- Responsibility: Render routes, charts, controls, and current dashboard state.
- Public entrypoint: `client/index.js`, composed by `client/App.js`.
- May depend on: React, Material UI, client components, client state/hooks, and `shared/` constants that are browser-safe.
- Must not depend on: Server modules, database modules, credentials, or direct access to server-owned upstream integrations.

### Server composition and transport

- Path: `server/app.js`, `server/socket.js`, and `server/worker.js`
- Responsibility: Start HTTP and Socket.IO transports, register cache bootstrap behavior, and wire scheduled jobs and live feeds.
- Public entrypoint: `server/app.js`, started through `scripts/start`.
- May depend on: Commands, queries, server libraries, and database adapters.
- Must not contain: Provider-specific parsing or dashboard rendering logic.

### Commands and scheduled work

- Path: `server/commands/` and `server/worker.js`
- Responsibility: Fetch, validate, aggregate, persist, and broadcast data updates. `server/worker.js` is the scheduling composition root; provider behavior belongs in a command or provider-specific library.
- May depend on: `server/lib/`, `server/queries/`, the cache service, database adapters, and injected Socket.IO emitters.
- Must not depend on: Client components or browser state.

### External integration libraries

- Path: `server/lib/`
- Responsibility: Provider clients, connection lifecycles, cache coordination, logging, and reusable server-side integration behavior.
- May depend on: External SDKs, server environment variables, and database-facing commands or queries when the existing integration requires them.
- Must not depend on: Client code.

### Persistence

- Path: `server/database/`, `server/queries/`, `server/commands/updateCache.js`, and `migrations/`
- Responsibility: Own PostgreSQL connections, queries, schema changes, and durable current-state cache rows.
- Public cache contract: The `caches` table stores one JSONB snapshot per cache namespace; `server/lib/memoryCache.js` validates allowed keys and mirrors persisted snapshots in memory.
- Must not depend on: React or browser transport details.

### Shared code

- Path: `shared/`
- Responsibility: Small runtime-neutral constants and transformations needed by both client and server.
- Must not contain: Database access, provider credentials, server process state, React components, or transport lifecycle code.

## Dependency Rules

- The client receives server-owned data through the existing Socket.IO state flow; it does not call upstream providers directly.
- Provider payload validation and normalization happen on the server before persistence or broadcast.
- Current dashboard snapshots use an explicit cache namespace and allowed-key contract. High-frequency and unrelated integrations should not share a cache row when independent writes could overwrite one another.
- Scheduled jobs are wired in `server/worker.js`; their fetch and update behavior belongs in focused command or library modules with injectable test seams.
- A failed provider request or persistence write must not silently replace a durable last-good snapshot when a feature promises last-good behavior.

## Composition Roots And Runtime Entrypoints

- `scripts/start` loads the environment and starts the exported server.
- `server/app.js` creates Express, HTTP, and Socket.IO servers and starts sockets, workers, and live exchange connections.
- `server/worker.js` owns recurring schedules and connects commands to cache and Socket.IO dependencies.
- `client/index.js` mounts the React application; `client/App.js` owns route composition.

## Shared Code Rules

- Add code to `shared/` only when both runtimes need the same dependency-light behavior.
- Keep provider adapters and persistence coordination in `server/`.
- Keep reusable visual primitives in `client/components/` and page-specific UI in `client/pages/`.
- Prefer an explicit feature-owned module over adding unrelated behavior to a generic helper.

## Testing Boundaries

- Test provider validation and update commands through injected request, cache, clock, and socket dependencies.
- Test schedule startup, cadence, and overlap behavior without waiting on wall-clock cron execution.
- Test cache persistence semantics separately from provider failure semantics.
- Use the production frontend build as the baseline client integration check, then inspect changed layouts at their responsive breakpoints.
- Full server startup is an integration check, not a requirement for unit-testing a provider command.

## Architecture Checks

- Run focused Node tests for changed server modules.
- Run `npm run build` for client or shared-code changes.
- Review new cache keys against their namespace and Socket.IO bootstrap behavior.
- Review worker changes for bounded requests, overlap protection, and failure isolation.

## Accepted Deviations

- Several existing server libraries combine provider access, persistence, and live-connection behavior. New focused integrations should preserve test seams without requiring a broad refactor of those older modules.
- Existing non-strict cache updates may advance in-memory state after a database write failure. Features requiring strict last-good persistence must use an explicit strict path while legacy callers retain their current behavior until separately migrated.
