"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authClient } from "@/client-lib/auth-client";
import { toast } from "sonner";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$499/mo",
    description: "For small teams",
    features: ["Up to 5 projects", "Basic AI analysis", "Email support"],
  },
  {
    id: "professional",
    name: "Professional",
    price: "$1,299/mo",
    description: "Most popular",
    features: ["Unlimited projects", "Advanced AI analysis", "Priority support", "Custom integrations"],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: ["Everything in Pro", "Dedicated support", "On-premise option", "Custom training"],
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    phone: "",
    role: "",
    plan: "professional",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (process.env.NODE_ENV === "development") {
        // Simulate registration in development
        toast.success("Account created successfully! Redirecting...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        await authClient.signUp.email({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          callbackURL: "/dashboard",
        });
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Plan Selection */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              LeanBuild<span className="text-blue-200">AI</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-white mb-2">Choose your plan</h2>
          <p className="text-blue-200 mb-8">Select the plan that fits your needs. You can always upgrade later.</p>

          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => handleInputChange("plan", plan.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  formData.plan === plan.id
                    ? "bg-white text-gray-900 shadow-xl scale-[1.02]"
                    : "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{plan.name}</span>
                      {plan.popular && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Popular</span>
                      )}
                    </div>
                    <span className={`text-sm ${formData.plan === plan.id ? "text-gray-500" : "text-blue-200"}`}>
                      {plan.description}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{plan.price}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {plan.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-1 rounded-full ${
                        formData.plan === plan.id ? "bg-blue-100 text-blue-700" : "bg-white/10 text-blue-100"
                      }`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-blue-200 text-sm">
          © {new Date().getFullYear()} LeanBuild AI. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">
              LeanBuild<span className="text-blue-600">AI</span>
            </span>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription>
                {step === 1 ? "Enter your details to get started" : "Tell us about your company"}
              </CardDescription>
              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-2 pt-4">
                <div className={`w-8 h-1 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-gray-200"}`}></div>
                <div className={`w-8 h-1 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Smith"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formData.password && (
                        <div className="space-y-1">
                          <div className="flex gap-1">
                            {[0, 1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full ${
                                  i < passwordStrength() ? strengthColors[passwordStrength() - 1] : "bg-gray-200"
                                }`}
                              ></div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Password strength: {strengthLabels[passwordStrength() - 1] || "Too weak"}
                          </p>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        if (formData.name && formData.email && formData.password) {
                          setStep(2);
                        } else {
                          toast.error("Please fill in all fields");
                        }
                      }}
                    >
                      Continue <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="company"
                          type="text"
                          placeholder="Acme Construction"
                          value={formData.company}
                          onChange={(e) => handleInputChange("company", e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Your Role</Label>
                      <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="project_manager">Project Manager</SelectItem>
                          <SelectItem value="field_engineer">Field Engineer</SelectItem>
                          <SelectItem value="superintendent">Superintendent</SelectItem>
                          <SelectItem value="estimator">Estimator</SelectItem>
                          <SelectItem value="executive">Executive / Owner</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Mobile Plan Selection */}
                    <div className="lg:hidden space-y-2">
                      <Label>Selected Plan</Label>
                      <Select value={formData.plan} onValueChange={(value) => handleInputChange("plan", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name} - {plan.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Creating...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Create account <Check className="h-4 w-4" />
                          </div>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
