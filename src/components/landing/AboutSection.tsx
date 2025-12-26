"use client";

import { TrendingUp, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const highlights = [
  { text: "Real-time waste detection" },
  { text: "AI-powered recommendations" },
  { text: "Automated reporting" },
  { text: "Continuous improvement" },
];

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              About LeanBuild AI
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              The Future of
              <span className="text-blue-600"> Lean Construction</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              LeanBuild AI combines decades of Lean construction expertise with
              cutting-edge artificial intelligence to provide 24/7 automated
              consulting for your projects.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Our platform continuously monitors your construction processes,
              identifies the 8 types of waste (DOWNTIME), and provides
              actionable recommendations to optimize workflows, reduce costs,
              and accelerate project delivery.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {highlights.map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80"
                alt="Construction site"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-8 -left-8 bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-xs">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-green-100 dark:bg-green-950 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">$2.4M</p>
                  <p className="text-sm text-gray-500">Saved this quarter</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "78%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
