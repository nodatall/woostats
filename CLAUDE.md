# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WooStats is an unofficial community site for WOO that provides analytics and statistics for WOO ecosystem data. It's a full-stack web application with a React frontend and Node.js backend.

## Architecture

### Frontend (client/)
- **React 18** application with Material-UI components
- **React Router** for navigation between pages (Network, WooFi, DAO, Token)
- **Chart.js** for data visualization
- **Zustand** for state management
- **Socket.io** client for real-time updates
- Build output goes to `client/dist/`

### Backend (server/)
- **Express.js** server with Socket.io for real-time communication
- **PostgreSQL** database with Knex.js query builder
- **Background worker** system for data fetching and processing
- **WebSocket connections** to WOO and Orderly exchanges
- **Cron jobs** for scheduled data updates

### Key Components
- **Commands** (`server/commands/`): Background jobs for data fetching/processing
- **Queries** (`server/queries/`): Database query functions
- **Libs** (`server/lib/`): Utility functions and API clients
- **Migrations** (`migrations/`): Database schema changes
- **Shared** (`shared/`): Common utilities used by both client and server

## Development Commands

### Setup
```bash
# Install dependencies
npm install

# Set up database (requires PostgreSQL)
./scripts/db-setup

# Database migrations
./scripts/db-migrate
```

### Development
```bash
# Start development server with hot reload
npm run start:dev

# Build frontend only
npm run build

# Build frontend in watch mode
npm run build:dev

# Start production server
npm run start
```

### Database
```bash
# Run migrations
./scripts/db-migrate

# Create database
./scripts/db-create

# Drop database
./scripts/db-drop
```

## Environment Setup

Requires `.env` file in root with:
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default 1337)
- `NODE_ENV`: Environment (development/production)
- API keys for: CoinGecko, Nomics, Etherscan, DeBankAPI, Twilio

## Key Data Sources

The application aggregates data from:
- **WOO Exchange** (via WebSocket)
- **Orderly Network** (via WebSocket and API)
- **On-chain data** (via Etherscan, BSCScan, etc.)
- **Price data** (CoinGecko, Nomics)
- **DeFi positions** (DeBankAPI)

## Database Schema

Uses PostgreSQL with tables for:
- Token prices and historical data
- WooFi swap events and volume
- Exchange volume history
- Treasury balances
- Market data caches

## Real-time Features

- WebSocket connections maintain live data feeds
- Socket.io broadcasts updates to connected clients
- Background workers process and cache data
- Cron jobs run scheduled updates