exports.up = db => {
  return db.runSql(
    `
      CREATE TABLE treasury_balances (
        date text NOT NULL,
        identifier text NOT NULL,
        total_value decimal NOT NULL,
        tokens jsonb DEFAULT '[]'::json,
        in_protocols jsonb DEFAULT '[]'::json,
        UNIQUE (date, identifier)
      );
    `
  )
}

exports.down = db => {
  return db.runSql('DROP TABLE treasury_balances;')
}
