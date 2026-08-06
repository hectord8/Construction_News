CREATE TYPE "public"."article_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "article_tags" (
	"article_id" uuid NOT NULL,
	"tag_slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text NOT NULL,
	"body" text NOT NULL,
	"cover_image" text,
	"category_slug" text NOT NULL,
	"status" "article_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"lead_story" boolean DEFAULT false NOT NULL,
	"region" text,
	"author_id" uuid,
	"author_name" text NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', coalesce("articles"."title", '') || ' ' || coalesce("articles"."excerpt", '') || ' ' || coalesce("articles"."body", ''))) STORED,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text,
	"body" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "followed_categories" (
	"user_id" uuid NOT NULL,
	"category_slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"status" text DEFAULT 'subscribed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email"),
	CONSTRAINT "newsletter_subscribers_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "saved_articles" (
	"user_id" uuid NOT NULL,
	"article_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_tag_slug_tags_slug_fk" FOREIGN KEY ("tag_slug") REFERENCES "public"."tags"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_slug_categories_slug_fk" FOREIGN KEY ("category_slug") REFERENCES "public"."categories"("slug") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followed_categories" ADD CONSTRAINT "followed_categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followed_categories" ADD CONSTRAINT "followed_categories_category_slug_categories_slug_fk" FOREIGN KEY ("category_slug") REFERENCES "public"."categories"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_articles" ADD CONSTRAINT "saved_articles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_articles" ADD CONSTRAINT "saved_articles_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "article_tags_pk" ON "article_tags" USING btree ("article_id","tag_slug");--> statement-breakpoint
CREATE INDEX "articles_category_idx" ON "articles" USING btree ("category_slug");--> statement-breakpoint
CREATE INDEX "articles_status_idx" ON "articles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "articles_published_idx" ON "articles" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "articles_search_idx" ON "articles" USING gin ("search_vector");--> statement-breakpoint
CREATE UNIQUE INDEX "followed_categories_pk" ON "followed_categories" USING btree ("user_id","category_slug");--> statement-breakpoint
CREATE INDEX "followed_categories_user_idx" ON "followed_categories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "newsletter_email_idx" ON "newsletter_subscribers" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_articles_pk" ON "saved_articles" USING btree ("user_id","article_id");--> statement-breakpoint
CREATE INDEX "saved_articles_user_idx" ON "saved_articles" USING btree ("user_id");