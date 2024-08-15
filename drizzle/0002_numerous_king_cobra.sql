ALTER TABLE "sales" DROP CONSTRAINT "sales_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "sales" DROP CONSTRAINT "sales_campaign_id_campaigns_id_fk";
--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "product_id" DROP NOT NULL;