ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_account_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_to_account_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_category_fk";
--> statement-breakpoint
ALTER TABLE "budgets" DROP CONSTRAINT "budgets_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "budgets" DROP CONSTRAINT "budgets_category_fk";
--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_id_user_id_unique";--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_id_user_id_type_unique";--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_id_user_id_type_top_level_unique";--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_name_unique";--> statement-breakpoint
ALTER TABLE "budgets" DROP CONSTRAINT "budgets_user_id_category_id_unique";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_role_check";--> statement-breakpoint
DROP INDEX "accounts_user_id_index";--> statement-breakpoint
DROP INDEX "transactions_user_id_date_index";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'viewer';--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "created_by" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "updated_by" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_id_type_unique" UNIQUE("id","type");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_id_type_top_level_unique" UNIQUE("id","type","is_top_level");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_name_unique" UNIQUE NULLS NOT DISTINCT("type","parent_id","name");--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_unique" UNIQUE("category_id");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_fk" FOREIGN KEY ("parent_id","type","has_parent") REFERENCES "public"."categories"("id","type","is_top_level") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_to_account_id_accounts_id_fk" FOREIGN KEY ("to_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_fk" FOREIGN KEY ("category_id","type") REFERENCES "public"."categories"("id","type") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_fk" FOREIGN KEY ("category_id","category_type","category_is_top_level") REFERENCES "public"."categories"("id","type","is_top_level") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transactions_date_index" ON "transactions" USING btree ("date");--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "budgets" DROP COLUMN "user_id";--> statement-breakpoint
-- The role "user" no longer exists. Anyone who still has it gets the least access.
UPDATE "user" SET "role" = 'viewer' WHERE "role" NOT IN ('admin', 'editor', 'viewer');--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_role_check" CHECK ("user"."role" in ('admin', 'editor', 'viewer'));