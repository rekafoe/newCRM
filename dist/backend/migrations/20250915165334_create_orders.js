"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    return knex.schema.createTable('orders', (table) => {
        table.increments('id').primary();
        table.string('customer_name').notNullable();
        table.decimal('total_amount', 14, 2).defaultTo(0);
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
}
async function down(knex) {
    return knex.schema.dropTableIfExists('orders');
}
