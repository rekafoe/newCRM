"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    return knex.schema.createTable('order_items', (table) => {
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
}
async function down(knex) {
    return knex.schema.dropTableIfExists('order_items');
}
