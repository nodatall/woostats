exports.up = db => {
  return db.runSql(
    `
      DELETE FROM woofi_swaps_bsc;

      ALTER TABLE woofi_swaps_bsc
      ADD COLUMN contract_address text NOT NULL,
      ADD COLUMN receiver_address text NOT NULL,
      ADD COLUMN sender_address text NOT NULL;
    `
  )
}

exports.down = db => {
  return db.runSql(
    `
      ALTER TABLE woofi_swaps_bsc
      DROP COLUMN contract_address,
      DROP COLUMN receiver_address,
      DROP COLUMN sender_address;
    `
  )
}
