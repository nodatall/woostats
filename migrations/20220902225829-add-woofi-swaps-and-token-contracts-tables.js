exports.up = db => {
  return db.runSql(
    `
      CREATE TABLE token_contracts (
        address text NOT NULL,
        symbol text NOT NULL,
        chain text NOT NULL,
        logo_url text,
        decimals integer NOT NULL,
        UNIQUE (address, chain)
      );

      CREATE TABLE woofi_swaps (
        created_at timestamp NOT NULL,
        chain text NOT NULL,
        block_number integer NOT NULL,
        index integer NOT NULL,
        tx_hash text NOT NULL,
        from_token text NOT NULL,
        to_token text NOT NULL,
        from_amount decimal NOT NULL,
        to_amount decimal NOT NULL,
        from_address text NOT NULL,
        to_address text NOT NULL,
        rebate_to text,
        usd_volume decimal NOT NULL,
        UNIQUE (tx_hash, to_token, from_token, usd_volume)
      );

      CREATE INDEX idx_chain ON woofi_swaps(chain);
      CREATE INDEX idx_date ON woofi_swaps(date);
      CREATE INDEX idx_from_token ON woofi_swaps(from_token);
      CREATE INDEX idx_to_token ON woofi_swaps(to_token);
      CREATE INDEX idx_to ON woofi_swaps(to_address);
      CREATE INDEX idx_from ON woofi_swaps(from_address);
      CREATE INDEX idx_usd_volume ON woofi_swaps(usd_volume);
    `
  )
}

exports.down = db => {
  return db.runSql(
    `
      DROP TABLE token_contracts;
      DROP TABLE woofi_swaps;
    `
  )
}
