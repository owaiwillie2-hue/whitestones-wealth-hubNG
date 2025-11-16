import { UserPlus, ListChecks, Wallet, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <UserPlus className="w-8 h-8" />,
    title: "Open Account",
    description: "Create your free account in minutes with our simple registration process",
  },
  {
    number: "02",
    icon: <ListChecks className="w-8 h-8" />,
    title: "Select Plan",
    description: "Choose an investment plan that matches your financial goals and risk appetite",
  },
  {
    number: "03",
    icon: <Wallet className="w-8 h-8" />,
    title: "Fund Account",
    description: "Securely deposit funds using your preferred payment method",
  },
  {
    number: "04",
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Start Earning",
    description: "Watch your investment grow with guaranteed returns",
  },
];

export const HowToJoin = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How To <span className="text-primary">Get Started</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of successful investors in just four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-medium transition-smooth text-center h-full">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {step.number}
                </div>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 mt-4 text-primary">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};