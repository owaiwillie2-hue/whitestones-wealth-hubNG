import { Bitcoin, Building2, Droplet, Image, PiggyBank, BadgeDollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const investmentOptions = [
  {
    id: "cryptocurrencies",
    icon: <Bitcoin className="w-8 h-8" />,
    title: "Cryptocurrency Trading",
    description: "Access the world's leading cryptocurrencies including Bitcoin, Ethereum, and emerging altcoins. Trade 24/7 with advanced tools and real-time market data.",
    features: ["24/7 Trading", "Low Fees", "Secure Wallets", "Real-time Analytics"],
  },
  {
    id: "real-estate",
    icon: <Building2 className="w-8 h-8" />,
    title: "Real Estate Investment",
    description: "Invest in premium commercial and residential properties across major global markets. Diversify your portfolio with tangible assets.",
    features: ["Global Properties", "High Returns", "Professional Management", "Regular Income"],
  },
  {
    id: "oil-gas",
    icon: <Droplet className="w-8 h-8" />,
    title: "Oil and Gas",
    description: "Participate in energy sector opportunities through carefully selected oil and gas ventures. Benefit from commodity market growth.",
    features: ["Energy Sector", "Commodity Trading", "Long-term Growth", "Dividend Income"],
  },
  {
    id: "nft",
    icon: <Image className="w-8 h-8" />,
    title: "NFT Marketplace",
    description: "Enter the digital asset revolution with exclusive NFT collections. Invest in rare digital art, collectibles, and virtual real estate.",
    features: ["Digital Art", "Exclusive Drops", "Secure Ownership", "Growing Market"],
  },
  {
    id: "retirement",
    icon: <PiggyBank className="w-8 h-8" />,
    title: "Retirement Planning",
    description: "Build a secure financial future with our comprehensive retirement investment plans. Professional guidance for long-term wealth building.",
    features: ["Tax Advantages", "Compound Growth", "Expert Advice", "Flexible Plans"],
  },
  {
    id: "loan",
    icon: <BadgeDollarSign className="w-8 h-8" />,
    title: "Investment Loans",
    description: "Access flexible financing options to maximize your investment potential. Competitive rates and personalized loan structures.",
    features: ["Low Interest", "Quick Approval", "Flexible Terms", "No Hidden Fees"],
  },
];

export const InvestmentOptions = () => {
  return (
    <section id="investments" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Diversified <span className="text-primary">Investment Options</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose from a wide range of investment opportunities tailored to your financial goals and risk tolerance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {investmentOptions.map((option) => (
            <Card key={option.id} className="shadow-soft hover:shadow-medium transition-smooth">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                  {option.icon}
                </div>
                <CardTitle className="text-2xl">{option.title}</CardTitle>
                <CardDescription className="text-base">{option.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};