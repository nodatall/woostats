# [woostats](https://woostats.io/)

Unofficial community site for the WOO Network & DAO

## Run locally

### .env file

Make a file called `.env` in the root directory.
The contents of the file should be:

```
DATABASE_URL=postgresql://localhost/woostats
PORT=1337
NODE_ENV=development
COINGECKO_APIKEY=<get from coingecko.com>
NOMICS_API_KEY=<get from nomics.com>
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
