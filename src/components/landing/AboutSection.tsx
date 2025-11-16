import { Shield, Award, Users2, TrendingUp } from "lucide-react";

export const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="text-primary">Whitestones Markets</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Whitestones Markets is a leading global investment platform that combines cutting-edge technology with expert financial guidance. We empower investors worldwide to make smarter decisions and achieve their financial goals through diversified investment opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-card border border-border rounded-lg p-6 shadow-soft transition-smooth hover:shadow-medium">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure Platform</h3>
            <p className="text-muted-foreground">
              Bank-level security with advanced encryption protecting your investments 24/7
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-soft transition-smooth hover:shadow-medium">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Award Winning</h3>
            <p className="text-muted-foreground">
              Recognized globally for excellence in financial services and innovation
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-soft transition-smooth hover:shadow-medium">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Expert Team</h3>
            <p className="text-muted-foreground">
              Professional advisors with decades of combined experience in global markets
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-soft transition-smooth hover:shadow-medium">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Proven Results</h3>
            <p className="text-muted-foreground">
              Consistent returns and satisfied investors across multiple asset classes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};