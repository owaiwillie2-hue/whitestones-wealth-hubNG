import { useEffect, useRef, useState } from "react";
import { TrendingUp, Users, Calendar } from "lucide-react";

interface StatProps {
  icon: React.ReactNode;
  end: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

const StatCounter = ({ icon, end, label, prefix = "", suffix = "" }: StatProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const stepValue = end / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setCount(Math.min(currentStep * stepValue, end));

      if (currentStep >= steps) {
        clearInterval(timer);
        setCount(end);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, end]);

  return (
    <div ref={ref} className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 text-primary">
        {icon}
      </div>
      <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
        {prefix}
        {count >= 1000 ? (count / 1000).toFixed(1) : count.toFixed(0)}
        {count >= 1000 && "K"}
        {suffix}
      </p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
};

export const StatsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
          <StatCounter
            icon={<TrendingUp size={32} />}
            end={2.5}
            label="Assets Under Management"
            prefix="$"
            suffix="B+"
          />
          <StatCounter
            icon={<Users size={32} />}
            end={50}
            label="Active Investors"
            suffix="K+"
          />
          <StatCounter
            icon={<Calendar size={32} />}
            end={15}
            label="Years Experience"
            suffix="+"
          />
        </div>
      </div>
    </section>
  );
};