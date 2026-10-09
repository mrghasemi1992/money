ALTER TABLE "accounts" DROP CONSTRAINT "accounts_type_check";--> statement-breakpoint
-- Existing bank cards become bank accounts.
UPDATE "accounts" SET "type" = 'bank' WHERE "type" = 'card';--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "type" SET DEFAULT 'bank';--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "identifier_kind" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "identifier" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_identifier_check" CHECK (("accounts"."identifier_kind" is null and "accounts"."identifier" is null) or ("accounts"."type" = 'bank' and "accounts"."identifier" is not null and "accounts"."identifier_kind" in ('accountNumber', 'cardNumber', 'sheba')));--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_type_check" CHECK ("accounts"."type" in ('bank', 'cash', 'other'));