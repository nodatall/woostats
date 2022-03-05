exports.up = db => {
  return db.runSql(
    `
      CREATE TABLE woo_token_burns (
        month text NOT NULL,
        burned decimal NOT NULL,
        tx_hash text NOT NULL,
        UNIQUE (month)
      );
    `
  )
}

exports.down = db => {
  return db.runSql('DROP TABLE woo_token_burns;')
}
