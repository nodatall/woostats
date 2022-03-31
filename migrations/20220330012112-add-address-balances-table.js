exports.up = db => {
  return db.runSql(
    `
      CREATE TABLE address_balances (
        date text NOT NULL,
        address text NOT NULL,
        tokens jsonb DEFAULT '[]'::json,
        in_protocols jsonb DEFAULT '[]'::json,
        UNIQUE (date, address)
      );
    `
  )
}

exports.down = db => {
  return db.runSql('DROP TABLE address_balances;')
}
