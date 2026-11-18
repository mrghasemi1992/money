-- A transaction's optional time (#128): local HH:MM as the bank printed it, so a day's rows
-- follow the bank's order. Expand only: the previous version doesn't read the column and
-- leaves it null. The list's index now orders a day by time, rows without one last.
DROP INDEX "transactions_list_index";--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "time" time;--> statement-breakpoint
CREATE INDEX "transactions_list_index" ON "transactions" USING btree ("date",("time" is not null),coalesce("time", '00:00'::time),"created_at","id");