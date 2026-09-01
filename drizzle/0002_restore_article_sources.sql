ALTER TABLE "articles" ADD COLUMN "source_url" text;
--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "source_name" text;
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_source_url_unique" UNIQUE("source_url");
