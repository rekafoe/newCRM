/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
// backend/migrations/XXXXXX_create_daily_reports.js
exports.up = (knex) =>
  knex.schema.createTable('daily_reports', (table) => {
    table.increments('id').primary();
    table.date('report_date').notNullable().unique();
    table.integer('orders_count').notNullable();
    table.decimal('total_revenue', 12, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

exports.down = (knex) =>
  knex.schema.dropTableIfExists('daily_reports');
