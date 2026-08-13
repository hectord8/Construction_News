ALTER TABLE "articles" DROP CONSTRAINT "articles_source_url_unique";--> statement-breakpoint
ALTER TABLE "articles" DROP COLUMN "source_url";--> statement-breakpoint
ALTER TABLE "articles" DROP COLUMN "source_name";