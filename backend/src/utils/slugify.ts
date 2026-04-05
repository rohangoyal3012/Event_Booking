export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function uniqueSlug(title: string): string {
  const base = slugify(title);
  const suffix = Date.now().toString(36);
  return `${base}-${suffix}`;
}
