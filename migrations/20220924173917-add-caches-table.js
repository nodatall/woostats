exports.up = db => {
  return db.runSql(
    `
      CREATE TABLE caches (
        name text UNIQUE NOT NULL,
        cache jsonb NOT NULL
      );
    `
  )
}

exports.down = db => {
  return db.runSql('DROP TABLE caches;')
}
