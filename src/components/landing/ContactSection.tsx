"use client";

import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@leanbuildai.com",
    href: "mailto:hello@leanbuildai.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (888) LEAN-BUILD",
    href: "tel:+1-888-532-6284",
  },
];

export function ContactSection() {
  return (
    <section id="contact" className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Contact Us
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform
              <span className="text-blue-600"> Your Projects?</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Get in touch with our team to schedule a demo or discuss how
              LeanBuild AI can help optimize your construction operations.
            </p>

            <div className="space-y-6">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
                    <item.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <a
                      href={item.href}
                      className="text-blue-600 hover:underline"
                    >
                      {item.value}
                    </a>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Office</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    123 Construction Way, Suite 500
                    <br />
                    San Francisco, CA 94105
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
              <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      First Name
                    </label>
                    <Input placeholder="John" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Last Name
                    </label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Email
                  </label>
                  <Input type="email" placeholder="john@company.com" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Company
                  </label>
                  <Input placeholder="Your construction company" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Message
                  </label>
                  <Textarea
                    placeholder="Tell us about your project and how we can help..."
                    rows={4}
                  />
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Send Message
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
