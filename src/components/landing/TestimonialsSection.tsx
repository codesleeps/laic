"use client";

import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "LeanBuild AI has transformed how we manage our projects. We've reduced waste by 35% and saved over $1.2M in the first year alone.",
    author: "Michael Chen",
    title: "VP of Operations",
    company: "Turner Construction",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    rating: 5,
  },
  {
    quote:
      "The AI recommendations are incredibly accurate. It's like having a Lean expert on call 24/7. Our project delivery times have improved by 40%.",
    author: "Sarah Johnson",
    title: "Project Director",
    company: "Skanska USA",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 5,
  },
  {
    quote:
      "Integration with our existing tools was seamless. The platform pulled data from Procore and started providing insights within hours.",
    author: "David Martinez",
    title: "Chief Technology Officer",
    company: "Kiewit Corporation",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 5,
  },
];

const trustedCompanies = ["Turner", "Skanska", "Kiewit", "Bechtel", "Fluor"];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Testimonials
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Trusted by
            <span className="text-blue-600"> Industry Leaders</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            See what construction professionals are saying about LeanBuild AI.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.author} className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">
                      {testimonial.title}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 mb-6">
            Trusted by leading construction companies worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            {trustedCompanies.map((company) => (
              <span key={company} className="text-2xl font-bold text-gray-400">
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
