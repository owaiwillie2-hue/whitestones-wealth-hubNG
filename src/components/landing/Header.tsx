import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Investments", href: "#investments" },
    { name: "Cryptocurrencies", href: "#cryptocurrencies" },
    { name: "Real Estate", href: "#real-estate" },
    { name: "Oil and Gas", href: "#oil-gas" },
    { name: "NFT", href: "#nft" },
    { name: "Retirement", href: "#retirement" },
    { name: "Loan", href: "#loan" },
    { name: "Company", href: "#about" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-medium"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img src={logo} alt="Whitestones Markets" className="h-10" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-foreground/80 hover:text-primary transition-fast font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <Button asChild variant="outline">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild className="gradient-primary">
              <Link to="/signup">Open Free Account</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block text-foreground/80 hover:text-primary transition-fast font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="space-y-2 pt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="w-full gradient-primary">
                <Link to="/signup">Open Free Account</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};