const { client } = require('../database')

module.exports = async function({ cacheName, cache }) {
  if (!cacheName) throw new Error('cacheName is required')
  if (!cache) throw new Error('cache is required')

  await client.query(
    `
      INSERT INTO caches (name, cache)
      VALUES ($1, $2)
      ON CONFLICT (name) DO UPDATE
      SET cache = EXCLUDED.cache
    `,
    [
      cacheName,
      JSON.stringify(cache),
    ]
  )
}
