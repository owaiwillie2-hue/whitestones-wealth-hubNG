import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

export const CryptoTicker = () => {
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([
    { symbol: "BTC", name: "Bitcoin", price: 42500, change: 2.34 },
    { symbol: "ETH", name: "Ethereum", price: 2250, change: 1.85 },
    { symbol: "BNB", name: "Binance", price: 320, change: -0.45 },
    { symbol: "SOL", name: "Solana", price: 98, change: 5.67 },
    { symbol: "XRP", name: "Ripple", price: 0.52, change: 3.21 },
    { symbol: "ADA", name: "Cardano", price: 0.48, change: -1.12 },
  ]);

  useEffect(() => {
    // Simulate price updates every 5 seconds
    const interval = setInterval(() => {
      setCryptoPrices((prev) =>
        prev.map((crypto) => ({
          ...crypto,
          price: crypto.price * (1 + (Math.random() - 0.5) * 0.02),
          change: (Math.random() - 0.5) * 10,
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-muted py-4 border-y border-border">
      <div className="container mx-auto px-4 overflow-hidden">
        <div className="flex animate-scroll">
          {[...cryptoPrices, ...cryptoPrices].map((crypto, index) => (
            <div
              key={`${crypto.symbol}-${index}`}
              className="flex items-center space-x-4 px-6 border-r border-border/50 min-w-max"
            >
              <div>
                <p className="font-semibold text-foreground">
                  {crypto.symbol}
                  <span className="text-muted-foreground text-sm ml-1">{crypto.name}</span>
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <p className="font-mono font-semibold">
                  ${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div
                  className={`flex items-center space-x-1 ${
                    crypto.change >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {crypto.change >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {crypto.change >= 0 ? "+" : ""}
                    {crypto.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};