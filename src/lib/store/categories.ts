import { allExperiences } from "./repo";

/**
 * The admin-managed category list, in the shape the Tour editor needs.
 *
 * Experiences are the single source of truth for tour categories; this helper
 * exists so the editor never has to carry its own copy of the list.
 */
export function categoryOptions(): { slug: string; name: string; status: string }[] {
  return [...allExperiences()]
    .sort((a, b) => a.priority - b.priority)
    .map((e) => ({ slug: e.slug, name: e.name, status: e.status }));
}
