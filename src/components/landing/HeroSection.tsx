import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-navy-light/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6">
            <TrendingUp className="w-4 h-4 text-cyan-light" />
            <span className="text-sm font-medium">Trusted by 50,000+ investors worldwide</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance">
            Smarter investors are here.
            <br />
            <span className="text-cyan-light">You should be here, too.</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto text-balance">
            Our professionals and industry-leading tools are united to do one thing: make you a smarter, more profitable investor.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-navy hover:bg-white/90 shadow-glow">
              <Link to="/signup">
                Open a Free Account <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/login">Login to Your Account</Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-cyan-light">$2.5B+</p>
              <p className="text-sm md:text-base text-white/80 mt-1">Assets Under Management</p>
            </div>
            <div className="text-center border-x border-white/20">
              <p className="text-3xl md:text-4xl font-bold text-cyan-light">50K+</p>
              <p className="text-sm md:text-base text-white/80 mt-1">Active Investors</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-cyan-light">15+</p>
              <p className="text-sm md:text-base text-white/80 mt-1">Years Experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};