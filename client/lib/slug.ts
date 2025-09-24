export function slugify(input: string) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
