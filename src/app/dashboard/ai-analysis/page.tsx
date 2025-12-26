"use client";

import { useState } from "react";
import {
  Brain,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  FileText,
  Download,
  RefreshCw,
  Zap,
  Target,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { generateObject, AI_PROVIDERS } from "@/client-lib/built-in-integrations/ai";
import { useProjects, useWasteIncidents, useRecommendations } from "@/client-lib/api-client";

type ModelProvider = "openai" | "google" | "openrouter";
type ReasoningEffort = "low" | "medium" | "high";

interface AnalysisResult {
  summary: string;
  wasteBreakdown: { category: string; percentage: number; cost: number }[];
  recommendations: { title: string; priority: string; savings: number; effort: string }[];
  riskFactors: { risk: string; probability: string; impact: string }[];
  kpis: { metric: string; current: number; target: number; trend: string }[];
}

const analysisTypes = [
  {
    id: "waste-analysis",
    name: "Waste Analysis",
    description: "Identify and quantify the 8 wastes across projects",
    icon: TrendingDown,
    color: "text-red-500",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  {
    id: "cost-forecast",
    name: "Cost Forecasting",
    description: "Predict budget trends and identify savings opportunities",
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  {
    id: "schedule-risk",
    name: "Schedule Risk",
    description: "Analyze schedule risks and predict potential delays",
    icon: Calendar,
    color: "text-orange-500",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    id: "performance",
    name: "Performance Analysis",
    description: "Evaluate project KPIs and team productivity",
    icon: BarChart3,
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
];

export default function AIAnalysisPage() {
  const { data: projects } = useProjects();
  const { data: wasteIncidents } = useWasteIncidents();
  const { data: recommendations } = useRecommendations();
  
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>("waste-analysis");
  const [selectedProvider, setSelectedProvider] = useState<ModelProvider>("google");
  const [selectedEffort, setSelectedEffort] = useState<ReasoningEffort>("medium");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<
    { id: string; type: string; date: Date; status: string; provider: string }[]
  >([]);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisResult(null);

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const projectContext = selectedProject !== "all"
        ? `Analyzing project: ${projects?.find(p => p.id === selectedProject)?.name}`
        : `Analyzing all ${projects?.length || 0} projects`;

      const wasteContext = wasteIncidents
        ? `Current waste incidents: ${wasteIncidents.length} total, including ${
            wasteIncidents.filter(w => w.severity === "critical").length
          } critical issues.`
        : "";

      const analysisPrompt = `You are a Lean construction AI analyst. ${projectContext}. ${wasteContext}

Generate a comprehensive ${selectedAnalysis} report with the following structure:
- A summary paragraph
- Waste breakdown by category with percentages and costs
- Top 5 recommendations with priority, savings potential, and effort level
- Key risk factors with probability and impact ratings
- Current KPIs with targets and trends

Base the analysis on Lean construction principles and the DOWNTIME waste framework.`;

      const schema = {
        type: "object" as const,
        properties: {
          summary: { type: "string" as const, description: "Executive summary of the analysis" },
          wasteBreakdown: {
            type: "array" as const,
            items: {
              type: "object" as const,
              properties: {
                category: { type: "string" as const },
                percentage: { type: "number" as const },
                cost: { type: "number" as const },
              },
              required: ["category", "percentage", "cost"],
            },
          },
          recommendations: {
            type: "array" as const,
            items: {
              type: "object" as const,
              properties: {
                title: { type: "string" as const },
                priority: { type: "string" as const },
                savings: { type: "number" as const },
                effort: { type: "string" as const },
              },
              required: ["title", "priority", "savings", "effort"],
            },
          },
          riskFactors: {
            type: "array" as const,
            items: {
              type: "object" as const,
              properties: {
                risk: { type: "string" as const },
                probability: { type: "string" as const },
                impact: { type: "string" as const },
              },
              required: ["risk", "probability", "impact"],
            },
          },
          kpis: {
            type: "array" as const,
            items: {
              type: "object" as const,
              properties: {
                metric: { type: "string" as const },
                current: { type: "number" as const },
                target: { type: "number" as const },
                trend: { type: "string" as const },
              },
              required: ["metric", "current", "target", "trend"],
            },
          },
        },
        required: ["summary", "wasteBreakdown", "recommendations", "riskFactors", "kpis"],
      };

      const result = await generateObject<AnalysisResult>(analysisPrompt, schema, selectedEffort, selectedProvider);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setAnalysisResult(result);
      
      // Add to history
      setAnalysisHistory((prev) => [
        {
          id: Date.now().toString(),
          type: selectedAnalysis,
          date: new Date(),
          status: "completed",
          provider: AI_PROVIDERS[selectedProvider].name,
        },
        ...prev.slice(0, 9),
      ]);

      toast.success(`Analysis completed using ${AI_PROVIDERS[selectedProvider].name}!`);
    } catch (error) {
      console.error("Analysis error:", error);
      clearInterval(progressInterval);
      setAnalysisProgress(0);
      toast.error(error instanceof Error ? error.message : "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend.toLowerCase().includes("up") || trend.toLowerCase().includes("improv")) {
      return <TrendingDown className="h-4 w-4 text-green-500 rotate-180" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI Analysis Engine
          </h1>
          <p className="text-muted-foreground">
            Advanced analytics powered by machine learning
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Provider Selection */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span className="font-medium">AI Provider</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedProvider} onValueChange={(v) => setSelectedProvider(v as ModelProvider)}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-gray-900">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">
                    <div className="flex items-center gap-2">
                      <span>🔷</span>
                      <span>Google Gemini</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="openai">
                    <div className="flex items-center gap-2">
                      <span>🟢</span>
                      <span>OpenAI</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="openrouter">
                    <div className="flex items-center gap-2">
                      <span>🔀</span>
                      <span>OpenRouter</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedEffort} onValueChange={(v) => setSelectedEffort(v as ReasoningEffort)}>
                <SelectTrigger className="w-[160px] bg-white dark:bg-gray-900">
                  <SelectValue placeholder="Model tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex flex-col">
                      <span>⚡ Fast</span>
                      <span className="text-xs text-muted-foreground">{AI_PROVIDERS[selectedProvider].models.low}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex flex-col">
                      <span>⚖️ Balanced</span>
                      <span className="text-xs text-muted-foreground">{AI_PROVIDERS[selectedProvider].models.medium}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex flex-col">
                      <span>🧠 Advanced</span>
                      <span className="text-xs text-muted-foreground">{AI_PROVIDERS[selectedProvider].models.high}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Badge variant="outline" className="bg-white dark:bg-gray-900">
                Using: {AI_PROVIDERS[selectedProvider].models[selectedEffort]}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analysisTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all ${
              selectedAnalysis === type.id
                ? "ring-2 ring-blue-500 border-blue-500"
                : "hover:border-blue-300"
            }`}
            onClick={() => setSelectedAnalysis(type.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${type.bgColor}`}>
                  <type.icon className={`h-5 w-5 ${type.color}`} />
                </div>
                <div>
                  <h3 className="font-medium">{type.name}</h3>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Run Analysis Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">
                {analysisTypes.find((t) => t.id === selectedAnalysis)?.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedProject === "all"
                  ? `Analyzing all ${projects?.length || 0} projects`
                  : `Analyzing: ${projects?.find((p) => p.id === selectedProject)?.name}`}
              </p>
            </div>
            <Button
              size="lg"
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
          {isAnalyzing && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing data...</span>
                <span>{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="waste">Waste</TabsTrigger>
            <TabsTrigger value="recommendations">Actions</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="kpis">KPIs</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Executive Summary
                </CardTitle>
                <CardDescription>
                  Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{analysisResult.summary}</p>
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Save Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waste">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  Waste Breakdown
                </CardTitle>
                <CardDescription>
                  Distribution of waste across DOWNTIME categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.wasteBreakdown.map((waste, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{waste.category}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            ${waste.cost.toLocaleString()}
                          </span>
                          <span className="font-semibold">{waste.percentage}%</span>
                        </div>
                      </div>
                      <Progress value={waste.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Recommended Actions
                </CardTitle>
                <CardDescription>
                  AI-generated improvement recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Zap className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{rec.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getPriorityColor(rec.priority)}>
                              {rec.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Effort: {rec.effort}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          ${rec.savings.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Potential savings</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Risk Factors
                </CardTitle>
                <CardDescription>
                  Identified risks and their potential impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisResult.riskFactors.map((risk, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{risk.risk}</h4>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Probability</p>
                          <Badge variant="outline">{risk.probability}</Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Impact</p>
                          <Badge
                            className={
                              risk.impact.toLowerCase() === "high"
                                ? "bg-red-100 text-red-700"
                                : risk.impact.toLowerCase() === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }
                          >
                            {risk.impact}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kpis">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Key Performance Indicators
                </CardTitle>
                <CardDescription>
                  Current performance vs targets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.kpis.map((kpi, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{kpi.metric}</span>
                        {getTrendIcon(kpi.trend)}
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-2xl font-bold">{kpi.current}</span>
                          <span className="text-sm text-muted-foreground ml-1">
                            / {kpi.target}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{kpi.trend}</span>
                      </div>
                      <Progress
                        value={Math.min((kpi.current / kpi.target) * 100, 100)}
                        className="h-1 mt-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Analysis History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysisHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No analyses run yet. Select an analysis type and click &quot;Run Analysis&quot; to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {analysisHistory.map((history) => (
                <div
                  key={history.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium text-sm">
                        {analysisTypes.find((t) => t.id === history.type)?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {history.date.toLocaleString()} • {history.provider}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    {history.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}