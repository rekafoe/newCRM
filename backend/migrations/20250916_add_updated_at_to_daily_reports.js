// backend/migrations/20250916_add_updated_at_to_daily_reports.js
exports.up = (knex) => {
  return knex.schema.alterTable('daily_reports', (table) => {
    table.timestamp('updated_at').nullable();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable('daily_reports', (table) => {
    table.dropColumn('updated_at');
  });
};
