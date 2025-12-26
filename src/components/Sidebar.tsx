"use client";

import { 
  ExternalLink, 
  Home, 
  Building2, 
  AlertTriangle, 
  Lightbulb, 
  Target, 
  BarChart3,
  Zap,
  TrendingUp,
  Settings,
  FileText,
  Users,
  Brain,
  Bot,
  Plug,
  HardHat
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient, getAuthActiveOrganization, getAuthClient } from "@/client-lib/auth-client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar as SidebarPrimitive,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/projects", label: "Projects", icon: Building2 },
  { href: "/dashboard/waste-incidents", label: "Waste Incidents", icon: AlertTriangle },
  { href: "/dashboard/recommendations", label: "Recommendations", icon: Lightbulb },
];

const aiToolsItems = [
  { href: "/dashboard/ai-assistant", label: "AI Assistant", icon: Bot },
  { href: "/dashboard/ai-analysis", label: "AI Analysis Engine", icon: Brain },
];

const leanToolsItems = [
  { href: "/dashboard/value-stream", label: "Value Stream Mapping", icon: Target },
  { href: "/dashboard/last-planner", label: "Last Planner System", icon: BarChart3 },
  { href: "/dashboard/5s-assessments", label: "5S Assessments", icon: Zap },
  { href: "/dashboard/kaizen", label: "Kaizen Events", icon: TrendingUp },
];

const managementItems = [
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/subcontractors", label: "Subcontractors", icon: HardHat },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const { data: session } = getAuthClient();
  const { data: activeOrganization } = getAuthActiveOrganization();
  const { state } = useSidebar();
  const pathname = usePathname();
  
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <SidebarPrimitive collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between px-[2px] py-2 gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <SidebarTrigger className="shrink-0" />
            {state === "expanded" && (
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="p-1.5 bg-blue-600 rounded-md">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-sidebar-foreground">
                  LeanBuild<span className="text-blue-600">AI</span>
                </span>
              </Link>
            )}
          </div>
          {state === "expanded" && <ThemeToggle />}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>AI Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiToolsItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Lean Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>Lean Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {leanToolsItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      {session && (
        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="w-full outline-none">
                  <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image ?? undefined} />
                      <AvatarFallback className="text-xs bg-sidebar-accent text-sidebar-accent-foreground">
                        {session.user.name?.[0]?.toUpperCase() ?? session.user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left text-sm">
                      <span className="font-medium">{session.user.name ?? "User"}</span>
                      <span className="text-xs text-sidebar-foreground/70">{session.user.email}</span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="right" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Organization</p>
                    <p className="text-sm">{activeOrganization?.name ?? "No organization selected"}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => window.open("https://vybe.build/organizations", "_blank")}
                  >
                    Manage organizations <ExternalLink className="ml-auto w-4 h-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => window.open("https://vybe.build/apps", "_blank")}
                  >
                    Manage apps <ExternalLink className="ml-auto w-4 h-4" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                    <span className="text-destructive font-semibold">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </SidebarPrimitive>
  );
}