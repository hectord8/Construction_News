export const REGIONS = [
  "National",
  "England",
  "Scotland",
  "Wales",
  "Northern Ireland",
  "London",
  "South East",
  "South West",
  "Midlands",
  "North West",
  "North East",
  "Yorkshire",
] as const;

export type Region = (typeof REGIONS)[number];
