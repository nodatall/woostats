exports.up = db => {
  return db.runSql(
    `
      CREATE TABLE woofi_staking_unstaking_events (
        date text NOT NULL,
        user_address text NOT NULL,
        amount decimal NOT NULL,
        event text NOT NULL,
        UNIQUE(user_address, date, event)
      );
    `
  )
}

exports.down = db => {
  return db.runSql('DROP TABLE woofi_staking_unstaking_events;')
}
