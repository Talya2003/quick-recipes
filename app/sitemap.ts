import type { MetadataRoute } from "next";
import { categories, recipes } from "@/data/recipes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quick-recipes.local";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/recipes",
    "/community",
    "/categories",
    "/search",
    "/submit",
    "/about",
    "/privacy",
    "/terms"
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7
  }));

  const recipeRoutes: MetadataRoute.Sitemap = recipes.map((recipe) => ({
    url: `${siteUrl}/recipes/${recipe.slug}`,
    lastModified: new Date(recipe.publishedAt),
    changeFrequency: "weekly",
    priority: 0.8
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/categories/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6
  }));

  return [...staticRoutes, ...categoryRoutes, ...recipeRoutes];
}
