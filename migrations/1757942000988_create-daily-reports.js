/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {};


// migrations/<timestamp>_create_daily_reports.js
exports.up = (pgm) => {
  pgm.createTable('daily_reports', {
    id: { type: 'serial', primaryKey: true },
    report_date: { type: 'date', notNull: true, unique: true },
    orders_count: { type: 'integer', notNull: true },
    total_revenue: { type: 'numeric(12,2)', notNull: true },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('daily_reports');
};

