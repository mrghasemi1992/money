DROP INDEX "transactions_date_index";--> statement-breakpoint
CREATE INDEX "transactions_list_index" ON "transactions" USING btree ("date","created_at","id");