# Star Child Platform Stats Bar

Goal: Add a branded Star Child stats bar above the existing WOOFi volume summary without making the dashboard depend on the remote service being available.

Please review this before I start.
Tell me what is wrong, missing, or out of order.

Deliver implementation instruction:
When asked to implement this doc, load the `$deliver` skill, use this file as the approved execution plan, scan every checkbox, and continue through final review, archive movement, commit, and finalization before the final handoff.

## Context

- The home page currently starts with the 24-hour WOOFi volume card.
- The Star Child endpoint currently returns `agents_launched`, `human_queries`, `skills_available`, and `tokens_used_30d` as numeric counters.
- A valid response must contain all four counters as finite, non-negative integers.
- WooStats already stores current dashboard snapshots in the database-backed `caches` table, mirrors them in server memory, and sends them to browsers over Socket.IO. Star Child will use its own `starchild` cache row so high-frequency market updates cannot overwrite it; a dedicated SQL table is unnecessary unless historical Star Child data is added later.
- The server will refresh Star Child once at startup and every 60 seconds after that, with a five-second request timeout and no overlapping refreshes.
- A successful refresh will strictly persist the complete snapshot and its update time before replacing the in-memory copy and broadcasting both over the existing Socket.IO `send` event.
- An upstream, validation, or database-write failure will be logged without replacing the durable or in-memory last-good snapshot and without broadcasting. If no valid snapshot has ever been stored, the Star Child card will not render.
- The Star Child profile image will be stored as a local asset, with the X profile used only as its source.
- The card will use four equal columns at large desktop widths, two columns at intermediate widths, and one stacked column at the existing 600px mobile breakpoint.

Visual mockup: [ui-mockup-starchild-platform-stats.html](ui-mockup-starchild-platform-stats.html)

## Steps

### 1. Add the persisted Star Child refresh

- [x] Add a separate `starchild` cache namespace containing the snapshot and update time so the existing database table and socket bootstrap include it without sharing the high-frequency network cache row.
- [x] Add a strict cache-write path that updates server memory only after the `starchild` row is saved successfully, throws on persistence failure, and leaves existing non-strict cache callers unchanged.
- [x] Add a server-side refresh command that requests the four counters with a five-second timeout, enforces the accepted counter contract, and persists and broadcasts only complete valid snapshots.
- [x] Run the refresh once when the worker starts and every 60 seconds afterward, with a guard that prevents overlapping executions.
- [x] Keep the last good database and memory snapshot unchanged when the upstream request times out, fails, returns malformed data, or cannot be written to the database.
- [x] Use Node 22's built-in test runner for focused coverage of valid data, missing or malformed counters, timeout and network failures, strict persistence and broadcast on success, and no state change or broadcast after upstream, validation, or database-write failure.
- [x] Add deterministic scheduling tests for the immediate startup refresh, 60-second cadence, and overlap suppression.

### 2. Add the responsive stats bar

- [x] Add the approved Star Child profile image as a local optimized asset with a clear accessible label.
- [x] Render a compact Star Child card immediately above the WOOFi volume card, with the logo and `STARCHILD` at the top left.
- [x] Read the persisted Star Child snapshot from the existing app state so initial socket bootstrap and later `send` events update the card without browser polling.
- [x] Show Agents launched, Human queries, Skills available, and Tokens used (30d) as exact comma-formatted values spaced evenly across the large desktop card.
- [x] Use a two-column intermediate layout, then stack the four metrics vertically at the existing mobile breakpoint without clipping or horizontal overflow.
- [x] Render no Star Child card until a complete valid snapshot exists, and keep showing the last good snapshot through later refresh failures without blocking the existing dashboard.

### 3. Verify the completed dashboard

- [ ] Run the focused Node test command and the production frontend build.
- [ ] Inspect the home page at large desktop, intermediate, 601px, and mobile widths, confirming placement, branding, exact metric labels, equal desktop spacing, two-column flow, mobile stacking, and no overflow.
- [ ] Verify startup refresh and the 60-second schedule, persistence across a server restart, live socket updates after success, retention of the last good snapshot after upstream or database failure, and no card when the database has no valid Star Child snapshot.
- [ ] Confirm the existing WOOFi summary and charts still render when Star Child succeeds, fails with cached data, and fails without cached data.
