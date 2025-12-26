"use client";

import Link from "next/link";
import { ArrowRight, Play, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stats = [
  { value: "30%", label: "Waste Reduction" },
  { value: "25%", label: "Cost Savings" },
  { value: "40%", label: "Faster Delivery" },
  { value: "500+", label: "Projects Optimized" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80"
        >
          <source
            src="https://cdn.pixabay.com/video/2020/07/30/46026-446551868_large.mp4"
            type="video/mp4"
          />
        </video>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-600/20 text-blue-300 border-blue-500/30 px-4 py-2">
            <Brain className="w-4 h-4 mr-2" />
            AI-Powered Lean Construction Consultancy
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Build Smarter.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Eliminate Waste.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your construction projects with AI-powered Lean
            consulting. Identify waste, optimize workflows, and deliver projects
            on time and under budget.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 h-auto"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 h-auto"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
