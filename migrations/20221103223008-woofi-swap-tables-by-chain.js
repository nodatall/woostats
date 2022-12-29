exports.up = db => {
  return db.runSql(
    `
      ALTER TABLE woofi_swaps
      RENAME TO woofi_swaps_bsc;
    `
  )
}

exports.down = db => {
  return db.runSql(
    `
      ALTER TABLE woofi_swaps_bsc
      RENAME TO woofi_swaps;
    `
  )
}
