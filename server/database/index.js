require('../../environment.js')

const pgp = require('pg-promise')

const options = { connectionString: process.env.DATABASE_URL }

if (process.env.NODE_ENV === 'production') {
  options.ssl = {
    rejectUnauthorized: false,
  }
}

const db = pgp()
const client = db(options)
module.exports = client
