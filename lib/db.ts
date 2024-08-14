import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import { count, eq, ilike } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { products, sales, campaigns } from './schema';

export const db = drizzle(neon(process.env.POSTGRES_URL!));

export type SelectProduct = typeof products.$inferSelect;
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
      products: await db
        .select()
        .from(products)
        .where(ilike(products.name, `%${search}%`))
        .limit(1000),
      newOffset: null,
      totalProducts: 0
    };
  }

  if (offset === null) {
    return { products: [], newOffset: null, totalProducts: 0 };
  }

  let totalProducts = await db.select({ count: count() }).from(products);
  let moreProducts = await db.select().from(products).limit(5).offset(offset);
  let newOffset = moreProducts.length >= 5 ? offset + 5 : null;

  return {
    products: moreProducts,
    newOffset,
    totalProducts: totalProducts[0].count
  };
}

export async function deleteProductById(id: number) {
  await db.delete(products).where(eq(products.id, id));
}

export async function getSales(): Promise<{
  sales: SelectSales[];
}> {
  // Always search the full table, not per page
  return {
    sales: await db.select().from(sales).orderBy(sales.campaignId).limit(5000)
  };
}

export async function getCampaigns(): Promise<{
  campaigns: SelectCampaign[];
}> {
  return {
    campaigns: await db.select().from(campaigns)
  };
}
