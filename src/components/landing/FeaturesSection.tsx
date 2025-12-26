"use client";

import {
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Target,
  Zap,
  Shield,
  Brain,
  LineChart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: AlertTriangle,
    title: "DOWNTIME Waste Detection",
    description:
      "Automatically identify all 8 types of construction waste: Defects, Overproduction, Waiting, Non-utilized talent, Transportation, Inventory, Motion, and Extra processing.",
    color: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  },
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description:
      "Advanced machine learning models analyze your project data in real-time, providing intelligent insights and predictions for proactive decision-making.",
    color:
      "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
  },
  {
    icon: Lightbulb,
    title: "Smart Recommendations",
    description:
      "Receive actionable improvement suggestions with estimated ROI, prioritized by impact and ease of implementation.",
    color:
      "bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400",
  },
  {
    icon: BarChart3,
    title: "Last Planner System",
    description:
      "Digital implementation of the Last Planner System with automated scheduling, constraint analysis, and PPC tracking.",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  },
  {
    icon: Target,
    title: "Value Stream Mapping",
    description:
      "Automated process flow analysis with visual maps showing value-add and non-value-add activities across your projects.",
    color: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
  },
  {
    icon: Zap,
    title: "5S Compliance Tracking",
    description:
      "Monitor workplace organization with automated 5S assessments: Sort, Set in order, Shine, Standardize, and Sustain.",
    color:
      "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
  },
  {
    icon: LineChart,
    title: "Predictive Analytics",
    description:
      "Forecast potential delays, cost overruns, and quality issues before they occur with advanced predictive models.",
    color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400",
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description:
      "Continuous quality monitoring with automated defect detection and root cause analysis for zero-defect delivery.",
    color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need for
            <span className="text-blue-600"> Lean Excellence</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Comprehensive tools and AI capabilities to transform your
            construction operations and achieve continuous improvement.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md"
            >
              <CardContent className="p-6">
                <div
                  className={`p-3 rounded-xl w-fit mb-4 ${feature.color} group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
