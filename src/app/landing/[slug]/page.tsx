import { notFound } from "next/navigation";
import { landingPages } from "@/lib/landing-page-config";
import LandingPageView from "@/app/components/landing/LandingPageView";
import type { Metadata } from "next";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return Object.keys(landingPages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const content = landingPages[slug];
    if (!content) return {};
    return {
        title: `${content.headline} | VibeCoder`,
        description: content.subheadline,
        openGraph: {
            title: content.headline,
            description: content.subheadline,
            type: "website",
            // url would ideally be dynamic based on slug, but next.js handles canonicals often
        },
        twitter: {
            card: "summary_large_image",
            title: content.headline,
            description: content.subheadline,
        },
    };
}

export default async function LandingPage({ params }: Props) {
    const { slug } = await params;
    const content = landingPages[slug];

    if (!content) notFound();

    return <LandingPageView content={content} />;
}
