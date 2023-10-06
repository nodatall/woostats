exports.up = db => {
  return db.runSql(
    `
      CREATE TABLE exchange_volume_24hr (
        exchange text NOT NULL UNIQUE,
        volume decimal NOT NULL
      );
    `
  )
}

exports.down = db => {
  return db.runSql('DROP TABLE exchange_volume_24hr;')
}
