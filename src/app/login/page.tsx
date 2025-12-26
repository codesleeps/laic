"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/client-lib/auth-client";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In production, this would use the actual auth client
      // For demo purposes, we'll simulate a login
      if (process.env.NODE_ENV === "development") {
        // Simulate login in development
        toast.success("Welcome back! Redirecting to dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        await authClient.signIn.email({
          email,
          password,
          callbackURL: "/dashboard",
        });
      }
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    toast.success("Logging in as demo user...");
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
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

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Build Smarter.<br />
            Eliminate Waste.<br />
            Maximize Value.
          </h1>
          <p className="text-blue-100 text-lg max-w-md">
            AI-powered Lean construction consultancy that operates 24/7, analyzing your project data 
            and providing continuous improvement recommendations.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-white">30%</div>
              <div className="text-blue-200 text-sm">Waste Reduction</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-blue-200 text-sm">AI Monitoring</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-blue-200 text-sm">Projects Optimized</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-white">$2.5M</div>
              <div className="text-blue-200 text-sm">Avg. Savings</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-blue-200 text-sm">
          © {new Date().getFullYear()} LeanBuild AI. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
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
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Sign in <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Continue with Demo Account
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-blue-600 hover:underline font-medium">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
