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
exports.up = function(knex) {
  return knex.schema.createTable('order_items', table => {
    table.increments('id').primary();
    table
      .integer('order_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE');
    table.string('product_name').notNullable();
    table.integer('quantity').notNullable();
    table.decimal('unit_price', 14, 2).notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('order_items');
};
