const { client } = require('../database')

module.exports = async function(cacheName) {
  const record = await client.oneOrNone(
    `
      SELECT cache
      FROM caches
      WHERE name = $1;
    `,
    [cacheName]
  )
  if (!record) return

  return record.cache
}
