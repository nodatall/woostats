exports.up = db => {
  return db.runSql(
    `
      CREATE TABLE woofi_pro_daily_volume_by_account (
        date text NOT NULL,
        account_id text NOT NULL,
        volume decimal NOT NULL,
        UNIQUE(account_id, date)
      );
    `
  )
}

exports.down = db => {
  return db.runSql('DROP TABLE woofi_pro_daily_volume_by_account;')
}
