import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter Plan",
    minAmount: "$100",
    maxAmount: "$4,999",
    roi: "10%",
    duration: "7 days",
    description: "Perfect for beginners looking to start their investment journey",
    features: [
      "Minimum investment: $100",
      "10% ROI in 7 days",
      "24/7 customer support",
      "Secure transactions",
      "Easy withdrawal",
    ],
    popular: false,
  },
  {
    name: "Platinum Plan",
    minAmount: "$5,000",
    maxAmount: "$19,999",
    roi: "25%",
    duration: "14 days",
    description: "For investors ready to grow their portfolio significantly",
    features: [
      "Minimum investment: $5,000",
      "25% ROI in 14 days",
      "Priority support",
      "Advanced analytics",
      "Dedicated account manager",
    ],
    popular: true,
  },
  {
    name: "Executive Plan",
    minAmount: "$20,000",
    maxAmount: "$99,999",
    roi: "50%",
    duration: "21 days",
    description: "Premium plan for serious investors seeking substantial returns",
    features: [
      "Minimum investment: $20,000",
      "50% ROI in 21 days",
      "VIP support",
      "Premium market insights",
      "Personal investment advisor",
    ],
    popular: false,
  },
  {
    name: "Apex Plan",
    minAmount: "$100,000",
    maxAmount: "Unlimited",
    roi: "100%",
    duration: "30 days",
    description: "Elite tier for high-net-worth individuals seeking maximum growth",
    features: [
      "Minimum investment: $100,000",
      "100% ROI in 30 days",
      "Exclusive VIP treatment",
      "Custom investment strategy",
      "Direct access to executives",
    ],
    popular: false,
  },
];

export const InvestmentPlans = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Choose Your <span className="text-primary">Investment Plan</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Select the plan that best fits your investment goals and start earning today
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative shadow-soft hover:shadow-large transition-smooth ${
                plan.popular ? "border-primary border-2" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <p className="text-4xl font-bold text-primary">{plan.roi}</p>
                  <p className="text-sm text-muted-foreground mt-1">ROI in {plan.duration}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.minAmount} - {plan.maxAmount}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to="/signup">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};