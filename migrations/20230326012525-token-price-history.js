exports.up = db => {
  return db.runSql(
    `
      CREATE TABLE token_price_history (
        date text NOT NULL,
        token text NOT NULL,
        price decimal NOT NULL,
        UNIQUE (date, token)
      );
    `
  )
}

exports.down = db => {
  return db.runSql('DROP TABLE token_price_history;')
}
