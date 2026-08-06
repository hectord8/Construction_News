import { relations, sql, type SQL } from "drizzle-orm";
import {
  customType,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

export const articleStatusEnum = pgEnum("article_status", [
  "draft",
  "published",
]);

const tsvector = customType<{ data: string; driverData: string }>({
  dataType() {
    return "tsvector";
  },
});

export const categories = pgTable("categories", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  order: integer("order").default(0),
});

export const tags = pgTable("tags", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body").notNull(),
    coverImage: text("cover_image"),
    categorySlug: text("category_slug")
      .notNull()
      .references(() => categories.slug, { onDelete: "restrict" }),
    status: articleStatusEnum("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    leadStory: boolean("lead_story").notNull().default(false),
    region: text("region"),
    authorId: uuid("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    authorName: text("author_name").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    viewCount: integer("view_count").notNull().default(0),
    searchVector: tsvector("search_vector").generatedAlwaysAs(
      (): SQL => sql`to_tsvector('english', coalesce(${articles.title}, '') || ' ' || coalesce(${articles.excerpt}, '') || ' ' || coalesce(${articles.body}, ''))`,
    ),
  },
  (table) => [
    index("articles_category_idx").on(table.categorySlug),
    index("articles_status_idx").on(table.status),
    index("articles_published_idx").on(table.publishedAt),
    index("articles_search_idx")
      .using("gin", table.searchVector),
  ],
);

export const articleTags = pgTable(
  "article_tags",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagSlug: text("tag_slug")
      .notNull()
      .references(() => tags.slug, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("article_tags_pk").on(table.articleId, table.tagSlug),
  ],
);

export const savedArticles = pgTable(
  "saved_articles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("saved_articles_pk").on(table.userId, table.articleId),
    index("saved_articles_user_idx").on(table.userId),
  ],
);

export const followedCategories = pgTable(
  "followed_categories",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categorySlug: text("category_slug")
      .notNull()
      .references(() => categories.slug, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("followed_categories_pk").on(table.userId, table.categorySlug),
    index("followed_categories_user_idx").on(table.userId),
  ],
);

export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    token: text("token").notNull().unique(),
    status: text("status").notNull().default("subscribed"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("newsletter_email_idx").on(table.email)],
);

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  body: text("body").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
  followedCategories: many(followedCategories),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  category: one(categories, {
    fields: [articles.categorySlug],
    references: [categories.slug],
  }),
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  tags: many(articleTags),
  savedArticles: many(savedArticles),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articleTags.tagSlug],
    references: [tags.slug],
  }),
}));

export const savedArticlesRelations = relations(savedArticles, ({ one }) => ({
  user: one(users, {
    fields: [savedArticles.userId],
    references: [users.id],
  }),
  article: one(articles, {
    fields: [savedArticles.articleId],
    references: [articles.id],
  }),
}));

export const followedCategoriesRelations = relations(
  followedCategories,
  ({ one }) => ({
    user: one(users, {
      fields: [followedCategories.userId],
      references: [users.id],
    }),
    category: one(categories, {
      fields: [followedCategories.categorySlug],
      references: [categories.slug],
    }),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
  savedArticles: many(savedArticles),
  followedCategories: many(followedCategories),
}));
