import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  name: text('name').notNull(),
  status: statusEnum('status').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull(),
  availableAt: timestamp('available_at').notNull()
});

export const productsRelations = relations(products, ({ many }) => ({
  sales: many(sales)
}));

export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  budget: numeric('budget', { precision: 10, scale: 2 }).notNull(),
  description: text('description')
});

export const sales = pgTable('sales', {
  id: uuid('id').defaultRandom().primaryKey(),
  //   productId: integer('product_id')
  //     .references(() => products.id)
  // .notNull(),
  productId: integer('product_id'),
  quantity: integer('quantity').notNull(),
  salePrice: numeric('sale_price', { precision: 10, scale: 2 }).notNull(),
  saleDate: timestamp('sale_date').defaultNow().notNull(),
  campaignId: integer('campaign_id')
});

export const salesRelations = relations(sales, ({ many, one }) => ({
  product: one(products, {
    fields: [sales.productId],
    references: [products.id]
  }),
  campaign: one(campaigns, {
    fields: [sales.campaignId],
    references: [campaigns.id]
  })
}));
