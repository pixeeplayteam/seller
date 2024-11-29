export const productCategories = [
  'Electronics',
  'Books',
  'Home & Kitchen',
  'Toys & Games',
  'Fashion',
  'Beauty & Personal Care',
  'Sports & Outdoors',
  'Automotive',
  'Health & Household',
  'Pet Supplies',
  'Office Products',
  'Tools & Home Improvement',
  'Garden & Outdoor',
  'Baby',
  'Grocery',
  'Industrial & Scientific',
  'Arts, Crafts & Sewing',
  'Musical Instruments',
  'Video Games',
  'Movies & TV',
] as const;

export type ProductCategory = typeof productCategories[number];