import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import jamesImage from "@/assets/testimonial-james.jpeg";
import robertImage from "@/assets/testimonial-robert.jpeg";
import samanthaImage from "@/assets/testimonial-samantha.jpeg";

const testimonials = [
  {
    name: "James Whitaker",
    location: "London, United Kingdom",
    image: jamesImage,
    rating: 5,
    text: "Whitestones Markets has transformed my investment journey. The platform is intuitive, and the returns have exceeded my expectations. The customer support team is always responsive and helpful.",
  },
  {
    name: "Robert Hayes",
    location: "New York, USA",
    image: robertImage,
    rating: 5,
    text: "I've been investing with Whitestones Markets for over two years now. The professional guidance and diverse investment options have helped me build substantial wealth. Highly recommended!",
  },
  {
    name: "Samantha Rivera",
    location: "Los Angeles, USA",
    image: samanthaImage,
    rating: 5,
    text: "As a first-time investor, I was nervous about putting my money at risk. Whitestones Markets made the entire process seamless and transparent. The consistent returns speak for themselves.",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            What Our <span className="text-primary">Investors Say</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of satisfied investors who trust Whitestones Markets with their financial future
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="shadow-soft hover:shadow-medium transition-smooth">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex space-x-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">&ldquo;{testimonial.text}&rdquo;</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};