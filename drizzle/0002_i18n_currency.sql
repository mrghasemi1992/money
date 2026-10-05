CREATE TABLE "book" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"currency" text DEFAULT 'IRR' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "book_single_row_check" CHECK ("book"."id" = 1),
	CONSTRAINT "book_currency_check" CHECK ("book"."currency" in ('IRR', 'USD', 'EUR', 'GBP'))
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "locale" text DEFAULT 'fa' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "calendar" text DEFAULT 'jalali' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "rial_unit" text DEFAULT 'rial' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_locale_check" CHECK ("user"."locale" in ('fa', 'en'));--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_calendar_check" CHECK ("user"."calendar" in ('jalali', 'gregorian'));--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_rial_unit_check" CHECK ("user"."rial_unit" in ('rial', 'toman'));