"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const plans = [
  {
    name: "Starter",
    price: "$499",
    period: "/month",
    description: "Perfect for small contractors and single projects",
    features: [
      "Up to 3 active projects",
      "Basic waste detection",
      "Weekly AI reports",
      "Email support",
      "5 team members",
      "Standard integrations",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "$1,299",
    period: "/month",
    description: "Ideal for growing construction companies",
    features: [
      "Up to 15 active projects",
      "Advanced waste detection",
      "Daily AI recommendations",
      "Priority support",
      "25 team members",
      "All integrations",
      "Custom dashboards",
      "API access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with complex needs",
    features: [
      "Unlimited projects",
      "Real-time AI analysis",
      "Dedicated success manager",
      "24/7 phone support",
      "Unlimited team members",
      "Custom integrations",
      "On-premise deployment",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent
            <span className="text-blue-600"> Pricing</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Choose the plan that fits your organization. All plans include a
            14-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? "border-2 border-blue-600 shadow-xl scale-105"
                  : "border border-gray-200 dark:border-gray-800"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.cta === "Contact Sales" ? "#contact" : "/register"}>
                  <Button
                    className={`w-full ${
                      plan.popular ? "bg-blue-600 hover:bg-blue-700" : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
