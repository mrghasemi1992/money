ALTER TABLE "accounts" ADD COLUMN "type" text DEFAULT 'card' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_name_unique" ON "accounts" USING btree (lower("name"));--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_type_check" CHECK ("accounts"."type" in ('card', 'cash', 'other'));