-- Loans and debts (#47): people and lenders are accounts of type 'counterparty', and money lent,
-- borrowed or repaid moves between them and the book's accounts as transfers. Expand only: the
-- type check widens and the optional opening date is a new nullable column. The previous
-- version doesn't know the type; only an account added with it would reach that version.
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_type_check";--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "opening_date" date;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_type_check" CHECK ("accounts"."type" in ('bank', 'cash', 'other', 'counterparty'));