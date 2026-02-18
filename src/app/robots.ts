import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/private/", "/api/auth/"],
        },
        sitemap: "https://vibecoder.quievreux.de/sitemap.xml",
    };
}
