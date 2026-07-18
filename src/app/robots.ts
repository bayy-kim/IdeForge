import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/plan", "/panduanpenggunaan"],
      disallow: ["/plans/", "/history", "/apikeys", "/api/"],
    },
    sitemap: "https://ide-forge.vercel.app/sitemap.xml",
  };
}
