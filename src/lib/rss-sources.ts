export type RssSource = {
  slug: string;
  name: string;
  feedUrl: string;
  categorySlug: string;
  region: string;
};

export const RSS_SOURCES: RssSource[] = [
  {
    slug: "construction-enquirer",
    name: "Construction Enquirer",
    feedUrl: "https://www.constructionenquirer.com/feed/",
    categorySlug: "commercial",
    region: "National",
  },
  {
    slug: "build-news",
    name: "Build News",
    feedUrl: "https://www.buildnews.co.uk/feed/",
    categorySlug: "commercial",
    region: "National",
  },
  {
    slug: "new-civil-engineer",
    name: "New Civil Engineer",
    feedUrl: "https://www.newcivilengineer.com/feed/",
    categorySlug: "infrastructure",
    region: "National",
  },
  {
    slug: "construction-news",
    name: "Construction News",
    feedUrl: "https://www.constructionnews.co.uk/feed/",
    categorySlug: "commercial",
    region: "National",
  },
  {
    slug: "construction-index",
    name: "The Construction Index",
    feedUrl: "https://www.theconstructionindex.co.uk/feeds/news.xml",
    categorySlug: "commercial",
    region: "National",
  },
  {
    slug: "construction-manager",
    name: "Construction Manager",
    feedUrl: "https://www.constructionmanagermagazine.com/feed/",
    categorySlug: "commercial",
    region: "National",
  },
  {
    slug: "construction-management",
    name: "Construction Management",
    feedUrl: "https://constructionmanagement.co.uk/feed/",
    categorySlug: "commercial",
    region: "National",
  },
  {
    slug: "ground-engineering",
    name: "Ground Engineering",
    feedUrl: "https://www.geplus.co.uk/feed/",
    categorySlug: "infrastructure",
    region: "National",
  },
  {
    slug: "housebuilder",
    name: "Housebuilder",
    feedUrl: "https://www.house-builder.co.uk/rss/",
    categorySlug: "residential",
    region: "National",
  },
  {
    slug: "uk-construction-online",
    name: "UK Construction Online",
    feedUrl: "https://www.ukconstructionmedia.co.uk/feed/",
    categorySlug: "commercial",
    region: "National",
  },
  {
    slug: "pbc-today",
    name: "PBC Today",
    feedUrl: "https://www.pbctoday.co.uk/news/feed/",
    categorySlug: "materials-equipment",
    region: "National",
  },
];
