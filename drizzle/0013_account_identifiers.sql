-- A bank account can carry all three identifiers at once: account number, card number
-- and Sheba, each in its own column, instead of one `identifier` of a chosen `identifier_kind`.
-- Expand only: the columns are added and filled from the old pair, which stays (unread,
-- unwritten) until a later release drops it, so the previous version keeps working and a
-- rollback shows the identifiers saved before this one.
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_identifier_check";--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "account_number" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "card_number" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "sheba" text;--> statement-breakpoint
UPDATE "accounts" SET "account_number" = CASE WHEN "identifier_kind" = 'accountNumber' THEN "identifier" END, "card_number" = CASE WHEN "identifier_kind" = 'cardNumber' THEN "identifier" END, "sheba" = CASE WHEN "identifier_kind" = 'sheba' THEN "identifier" END WHERE "identifier" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_identifier_check" CHECK (("accounts"."type" = 'bank' or ("accounts"."account_number" is null and "accounts"."card_number" is null and "accounts"."sheba" is null)));
