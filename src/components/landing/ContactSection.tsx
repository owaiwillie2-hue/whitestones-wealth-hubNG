import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin } from "lucide-react";

export const ContactSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    telephone: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", telephone: "", email: "", message: "" });
  };

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Get In <span className="text-primary">Touch</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Have questions? Our team is here to help you get started
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div>
            <h3 className="text-2xl font-bold mb-6">Request a Callback</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                type="tel"
                placeholder="Telephone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                required
              />
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Textarea
                placeholder="Your Message (Optional)"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Email</h4>
                <p className="text-muted-foreground">whitestonesmarkets@gmail.com</p>
                <p className="text-muted-foreground">support@whitestonesmarkets.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Phone</h4>
                <p className="text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Address</h4>
                <p className="text-muted-foreground">
                  123 Financial District<br />
                  New York, NY 10004<br />
                  United States
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};