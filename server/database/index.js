require('../../environment.js')

const pgp = require('pg-promise')

const options = { connectionString: process.env.DATABASE_URL }
const db = pgp()
const client = db(options)

module.exports = { client, db }
