import LandingPageView from "@/app/components/landing/LandingPageView";
import { landingPages } from "@/lib/landing-page-config";

export default function Page() {
  const content = landingPages["home"];
  return <LandingPageView content={content} />;
}
