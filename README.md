# [woostats](https://woostats.io/)

Unofficial community site for WOO

## Run locally

### .env file

Make a file called `.env` in the root directory.
The contents of the file should be:

```
DATABASE_URL=postgresql://localhost/woostats
PORT=1337
NODE_ENV=development
COINGECKO_API_KEY=<get from coingecko.com>
NOMICS_API_KEY=<get from nomics.com>
ETHERSCAN_API_KEY=<get from etherscan.com>
DEBANK_API_KEY=<open.debank.com>
TWILIO_ACCOUNT_SID=<twilio.com>
TWILIO_AUTH_TOKEN=<twilio.com>
```

### Database
You must have postgresql installed and running. On Mac:

```
brew install postgresql
brew start postgresql
```

Set up the database with:

```
./scripts/db-setup
```

### Start server

```
npm run start:dev
```

Use a browser to navigate to `http://localhost:1337/`

## Deploy on Railway

Railway deploys are configured in `railway.json`:

- Runtime: Node 22.x
- Build command: `npm run build`
- Pre-deploy command: `npm run railway:predeploy`
- Start command: `npm run start`
- Health check: `/health`

Create one Railway app service from this repository and one PostgreSQL service. In
the app service variables, set:

```
NODE_ENV=production
DATABASE_URL=<Railway Postgres DATABASE_URL>
COINGECKO_API_KEY=<get from coingecko.com>
NOMICS_API_KEY=<get from nomics.com>
ETHERSCAN_API_KEY=<get from etherscan.com>
BSCSCAN_API_KEY=<get from bscscan.com>
SNOWTRACE_API_KEY=<get from snowtrace.io>
DEBANK_API_KEY=<open.debank.com>
MORALIS_API_KEY=<moralis.io>
ALCHEMY_ETH_URL=<alchemy rpc url>
NAKJI_API_KEY=<nakji.network>
DUNE_API_KEY=<dune.com>
ORDERLY_ACCOUNT_ID=<orderly account id>
ORDERLY_API_KEY=<orderly api key>
ORDERLY_API_SECRET=<orderly api secret>
TWILIO_ACCOUNT_SID=<twilio.com>
TWILIO_AUTH_TOKEN=<twilio.com>
FROM_PHONE=<twilio sender>
TO_PHONE=<alert recipient>
```

Railway provides `PORT` automatically. Copy existing Heroku config vars for the
API keys before cutting traffic over.

Typical CLI flow:

```
railway login
railway init
railway up
railway open
```

To migrate existing Heroku Postgres data, export from the current Heroku
database and restore into the Railway Postgres database before switching
`DATABASE_URL`:

```
pg_dump "$HEROKU_DATABASE_URL" --format=custom --no-owner --no-acl > woostats.dump
pg_restore --clean --if-exists --no-owner --no-acl --dbname "$RAILWAY_DATABASE_URL" woostats.dump
```

Use a Railway Postgres connection string that is reachable from where you run
the restore. After the Railway deploy is healthy, update DNS from the Heroku app
to the Railway domain/custom domain, then keep the Heroku app available until
the Railway database and background workers have been checked in production.
