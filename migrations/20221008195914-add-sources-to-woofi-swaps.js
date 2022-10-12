exports.up = db => {
  return db.runSql(
    `
      DELETE FROM woofi_swaps;

      ALTER TABLE woofi_swaps
      ADD COLUMN source text;
    `
  )
}

exports.down = db => {
  return db.runSql(
    `
      ALTER TABLE woofi_swaps
      DROP COLUMN source;
    `
  )
}
