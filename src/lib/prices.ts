export type MaterialConfig = {
  slug: string;
  name: string;
  category: string;
  unit: string;
  description?: string;
  order: number;
  anchorPrice: number;
  anchorPeriod: string;
  sourceSeries?: string;
};

export const MATERIALS: MaterialConfig[] = [
  {
    slug: "ready-mixed-concrete",
    name: "Ready-mixed concrete",
    category: "Concrete",
    unit: "index (2015=100)",
    description: "Producer price index",
    order: 1,
    anchorPrice: 110,
    anchorPeriod: "2026-04",
    sourceSeries: "HMQ5",
  },
  {
    slug: "cement",
    name: "Cement",
    category: "Masonry",
    unit: "index (2015=100)",
    description: "Producer price index",
    order: 2,
    anchorPrice: 280,
    anchorPeriod: "2026-04",
    sourceSeries: "HMOJ",
  },
  {
    slug: "concrete-blocks-bricks",
    name: "Concrete blocks & bricks",
    category: "Masonry",
    unit: "index (2015=100)",
    description: "Precast concrete products index",
    order: 3,
    anchorPrice: 1.6,
    anchorPeriod: "2026-04",
    sourceSeries: "HMOP",
  },
  {
    slug: "steel-rebar",
    name: "Steel rebar",
    category: "Steelwork",
    unit: "index (2015=100)",
    description: "Concrete reinforcing bars index",
    order: 4,
    anchorPrice: 675,
    anchorPeriod: "2026-04",
    sourceSeries: "CRB",
  },
  {
    slug: "aggregates",
    name: "Aggregates (sand & gravel)",
    category: "Aggregates",
    unit: "index (2015=100)",
    description: "Gravel, sand, clays index",
    order: 5,
    anchorPrice: 50,
    anchorPeriod: "2026-04",
    sourceSeries: "EVNT",
  },
];
