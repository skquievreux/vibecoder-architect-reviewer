import HeroSection from "./HeroSection";
import PainPointsSection from "./PainPointsSection";
import SolutionSection from "./SolutionSection";
import CTASection from "./CTASection";
import { LandingPageContent } from "@/lib/landing-page-config";

export default function LandingPageView({
    content,
}: {
    content: LandingPageContent;
}) {
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <HeroSection content={content} />
            <PainPointsSection content={content} />
            <SolutionSection content={content} />
            <CTASection content={content} />
        </div>
    );
}
