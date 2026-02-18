import LandingPageView from "@/app/components/landing/LandingPageView";
import { landingPages } from "@/lib/landing-page-config";

import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const content = landingPages["home"];
  return {
    title: `${content.headline} | VibeCoder`,
    description: content.subheadline,
    openGraph: {
      title: content.headline,
      description: content.subheadline,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: content.headline,
      description: content.subheadline,
    },
  };
}

export default function Page() {
  const content = landingPages["home"];
  return <LandingPageView content={content} />;
}
