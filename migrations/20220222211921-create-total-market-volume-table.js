exports.up = db => {
  return db.runSql(
    `
      CREATE TABLE total_market_volume (
        date text NOT NULL,
        volume decimal NOT NULL,
        UNIQUE (date)
      );
    `
  )
}

exports.down = db => {
  return db.runSql('DROP TABLE total_market_volume;')
}
