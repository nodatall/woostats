exports.up = db => {
  return db.runSql(
    `
      CREATE TABLE volume_by_exchange (
        date text NOT NULL,
        exchange text NOT NULL,
        volume decimal NOT NULL,
        UNIQUE (date, exchange)
      );
    `
  )
}

exports.down = db => {
  return db.runSql('DROP TABLE volume_by_exchange;')
}
