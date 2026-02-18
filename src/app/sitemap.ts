import { MetadataRoute } from "next";
import { landingPages } from "@/lib/landing-page-config";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://vibecoder.quievreux.de";

    const staticRoutes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/impressum`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/datenschutz`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.5,
        },
        // Dashboard is authenticated, so we might exclude it or give it low priority
        // {
        //   url: `${baseUrl}/dashboard`,
        //   lastModified: new Date(),
        //   changeFrequency: "weekly" as const,
        //   priority: 0.8,
        // },
    ];

    const landingPageRoutes = Object.values(landingPages)
        .filter((page) => page.slug !== "home") // Home is already covered by staticRoutes
        .map((page) => ({
            url: `${baseUrl}/landing/${page.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.9,
        }));

    return [...staticRoutes, ...landingPageRoutes];
}
