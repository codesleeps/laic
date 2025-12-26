"use client";

import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const integrations = [
  {
    name: "Procore",
    description: "Full project management integration",
    logo: "https://logo.clearbit.com/procore.com",
    category: "Project Management",
  },
  {
    name: "Primavera P6",
    description: "Enterprise scheduling and planning",
    logo: "https://logo.clearbit.com/oracle.com",
    category: "Scheduling",
  },
  {
    name: "Autodesk",
    description: "BIM and construction cloud",
    logo: "https://logo.clearbit.com/autodesk.com",
    category: "BIM",
  },
  {
    name: "Microsoft Project",
    description: "Project planning and tracking",
    logo: "https://logo.clearbit.com/microsoft.com",
    category: "Scheduling",
  },
  {
    name: "Bluebeam",
    description: "Document management and markup",
    logo: "https://logo.clearbit.com/bluebeam.com",
    category: "Documents",
  },
  {
    name: "PlanGrid",
    description: "Field collaboration platform",
    logo: "https://logo.clearbit.com/plangrid.com",
    category: "Field",
  },
  {
    name: "SAP",
    description: "Enterprise resource planning",
    logo: "https://logo.clearbit.com/sap.com",
    category: "ERP",
  },
  {
    name: "Sage",
    description: "Construction accounting",
    logo: "https://logo.clearbit.com/sage.com",
    category: "Finance",
  },
];

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Integrations
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Connect Your
            <span className="text-blue-600"> Existing Tools</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Seamlessly integrate with the construction software you already use.
            Pull data automatically and get insights without changing your
            workflow.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {integrations.map((integration) => (
            <Card
              key={integration.name}
              className="group hover:shadow-lg transition-all cursor-pointer border border-gray-200 dark:border-gray-800"
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
                  <img
                    src={integration.logo}
                    alt={integration.name}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.innerHTML = `<span class="text-2xl font-bold text-gray-400">${integration.name[0]}</span>`;
                      }
                    }}
                  />
                </div>
                <h3 className="font-semibold mb-1">{integration.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {integration.description}
                </p>
                <Badge variant="secondary" className="mt-3 text-xs">
                  {integration.category}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Don&apos;t see your tool? We&apos;re constantly adding new
            integrations.
          </p>
          <Button variant="outline">
            Request Integration
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
