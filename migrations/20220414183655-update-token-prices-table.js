exports.up = db => {
  return db.runSql(
    `
      ALTER TABLE token_prices
      RENAME TO token_tickers;

      ALTER TABLE token_tickers
      ADD COLUMN logo_url text;
    `
  )
}

exports.down = db => {
  return db.runSql(
    `
      ALTER TABLE token_tickers
      RENAME TO token_prices;

      ALTER TABLE token_prices
      DROP COLUMN logo_url;
    `
  )
}
