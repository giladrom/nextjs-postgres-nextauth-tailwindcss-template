CREATE TABLE IF NOT EXISTS "campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"budget" numeric(10, 2) NOT NULL,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "campaign_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales" ADD CONSTRAINT "sales_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
