-- Loans and debts (#47). People and lenders are accounts of type 'counterparty' (their opening
-- balance is always 0); money lent, borrowed or repaid moves as transfers, and a debt no money
-- of the book moved for is a 'receivable' or 'payable' transaction on the counterparty
-- (transactions_debt_account_fk, through the generated debt_account_type). Expand only: the
-- type checks widen, the new column is generated and the new constraints hold for every
-- existing row. The previous version doesn't know the new types; only rows added with them
-- would reach it.
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_type_check";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_type_check";--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "debt_account_type" text GENERATED ALWAYS AS (case when "transactions"."type" in ('receivable', 'payable') then 'counterparty' end) STORED;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_id_type_unique" UNIQUE("id","type");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_debt_account_fk" FOREIGN KEY ("account_id","debt_account_type") REFERENCES "public"."accounts"("id","type") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_counterparty_opening_check" CHECK ("accounts"."type" <> 'counterparty' or "accounts"."opening_balance" = 0);--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_type_check" CHECK ("accounts"."type" in ('bank', 'cash', 'other', 'counterparty'));--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_type_check" CHECK ("transactions"."type" in ('expense', 'income', 'transfer', 'receivable', 'payable'));
