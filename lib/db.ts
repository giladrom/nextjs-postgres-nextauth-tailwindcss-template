import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import {
  count,
  eq,
  ilike,
  relations,
  type InferSelectModel
} from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { products, sales, campaigns } from './schema';

import * as schema from './schema';

export const db = drizzle(neon(process.env.POSTGRES_URL!), { schema });

export type SelectProduct = InferSelectModel<typeof products> & {
  sales: InferSelectModel<typeof sales>[];
};
export const insertProductSchema = createInsertSchema(products);

export type SelectSales = typeof sales.$inferSelect;
export type SelectCampaign = typeof campaigns.$inferSelect;

export async function getProducts(
  search: string,
  offset: number
): Promise<{
  products: SelectProduct[];
  newOffset: number | null;
  totalProducts: number;
}> {
  // Always search the full table, not per page
  if (search) {
    return {
      products: await db.query.products.findMany({
        where: eq(products.name, search),
        with: {
          sales: true
        }
      }),

      newOffset: null,
      totalProducts: 0
    };
  }

  if (offset === null) {
    return { products: [], newOffset: null, totalProducts: 0 };
  }

  let totalProducts = await db.query.products.findMany({
    limit: 1000,
    with: { sales: true }
  });
  let moreProducts = await db.query.products.findMany({
    limit: 5,
    offset: offset,
    with: { sales: true }
  });
  let newOffset = moreProducts.length >= 5 ? offset + 5 : null;

  return {
    products: moreProducts,
    newOffset,
    totalProducts: totalProducts.length
  };
}

export async function deleteProductById(id: number) {
  await db.delete(products).where(eq(products.id, id));
}

export async function getAllProducts(): Promise<{
  products: SelectProduct[];
}> {
  return {
    products: await db.query.products.findMany({ with: { sales: true } })
  };
}

export async function getSales(): Promise<{
  sales: SelectSales[];
}> {
  // Always search the full table, not per page
  return {
    sales: await db.select().from(sales).orderBy(sales.campaignId)
  };
}

export async function getCampaigns(): Promise<{
  campaigns: SelectCampaign[];
}> {
  return {
    campaigns: await db.select().from(campaigns)
  };
}
