import HeroSection from "./HeroSection";
import PainPointsSection from "./PainPointsSection";
import SolutionSection from "./SolutionSection";
import CTASection from "./CTASection";
import ScreenshotBanner from "./ScreenshotBanner";
import { LandingPageContent } from "@/lib/landing-page-config";

export default function LandingPageView({
    content,
}: {
    content: LandingPageContent;
}) {
    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-violet-500/30">
            <HeroSection content={content} />
            <ScreenshotBanner />
            <PainPointsSection content={content} />
            <SolutionSection content={content} />
            <CTASection content={content} />
        </div>
    );
}
