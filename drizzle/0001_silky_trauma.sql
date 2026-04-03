ALTER TABLE "queue_entries" ADD COLUMN "customer_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");