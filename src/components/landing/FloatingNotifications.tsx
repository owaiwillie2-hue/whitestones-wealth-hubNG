import { useEffect, useState } from "react";
import { Check, TrendingUp, X } from "lucide-react";

interface Notification {
  id: number;
  type: "deposit" | "withdrawal";
  user: string;
  amount: number;
  country: string;
}

const countries = ["USA", "UK", "Germany", "France", "Australia", "Canada", "Japan", "Singapore"];
const firstNames = ["John", "Sarah", "Michael", "Emma", "David", "Lisa", "James", "Maria"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"];

const generateNotification = (id: number): Notification => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return {
    id,
    type: Math.random() > 0.5 ? "deposit" : "withdrawal",
    user: `${firstName} ${lastName[0]}.`,
    amount: Math.floor(Math.random() * 50000) + 1000,
    country: countries[Math.floor(Math.random() * countries.length)],
  };
};

export const FloatingNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nextId, setNextId] = useState(1);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if notifications were dismissed in this session
    const dismissed = sessionStorage.getItem('notificationsDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    const interval = setInterval(() => {
      const newNotification = generateNotification(nextId);
      setNotifications((prev) => [...prev.slice(-2), newNotification]);
      setNextId((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [nextId]);

  const handleDismiss = () => {
    sessionStorage.setItem('notificationsDismissed', 'true');
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2 max-w-sm">
      <button
        onClick={handleDismiss}
        className="absolute -top-2 -right-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-full p-1.5 shadow-md transition-colors z-10"
        aria-label="Dismiss notifications"
      >
        <X className="w-4 h-4" />
      </button>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="bg-card border border-border rounded-lg p-4 shadow-large animate-in slide-in-from-left duration-500"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-full ${
              notification.type === "deposit" ? "bg-success/10" : "bg-info/10"
            }`}>
              {notification.type === "deposit" ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <TrendingUp className="w-4 h-4 text-info" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {notification.type === "deposit" ? "New Deposit" : "Withdrawal Processed"}
              </p>
              <p className="text-xs text-muted-foreground">
                {notification.user} from {notification.country}
              </p>
              <p className="text-sm font-bold text-primary mt-1">
                ${notification.amount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};