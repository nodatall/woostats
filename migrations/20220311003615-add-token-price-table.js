exports.up = db => {
  return db.runSql(
    `
      CREATE TABLE token_prices (
        token text NOT NULL,
        price decimal NOT NULL,
        UNIQUE (token)
      );
    `
  )
}

exports.down = db => {
  return db.runSql('DROP TABLE token_prices;')
}
