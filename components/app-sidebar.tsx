"use client";

// ==============================================
// ECHO - App Sidebar (Real Sections)
// ==============================================

import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Zap,
  Activity,
  MessageSquare,
  Table,
  Mail,
  Calendar,
  Settings,
  User,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-3">
          <Image 
            src="/Echo_logo.png" 
            alt="ECHO Logo" 
            width={40} 
            height={40}
            className="transition-transform hover:scale-110"
          />
          <div>
            <div className="font-bold text-lg">Echo</div>
            <div className="text-xs text-muted-foreground">Shadow Work Eliminator</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        {/* Main Navigation */}
<SidebarGroup>
  <SidebarGroupLabel>Main</SidebarGroupLabel>
  <SidebarGroupContent>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/dashboard">
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/manual-sync">
            <Zap className="h-4 w-4" />
            <span>Manual Sync</span>
            <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 border-0">
              New
            </Badge>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/dashboard/automations">
            <Zap className="h-4 w-4" />
            <span>Automations</span>
            <Badge className="ml-auto bg-purple-500">12</Badge>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/dashboard/activity">
            <Activity className="h-4 w-4" />
            <span>Activity Log</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroupContent>
</SidebarGroup>

        {/* Integrations */}
        <SidebarGroup>
          <SidebarGroupLabel>Connected Apps</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <MessageSquare className="h-4 w-4" />
                  <span>Slack</span>
                  <Badge
                    variant="outline"
                    className="ml-auto text-xs border-green-500/50 text-green-600"
                  >
                    ✓
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Table className="h-4 w-4" />
                  <span>Google Sheets</span>
                  <Badge
                    variant="outline"
                    className="ml-auto text-xs border-green-500/50 text-green-600"
                  >
                    ✓
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Mail className="h-4 w-4" />
                  <span>Gmail</span>
                  <Badge
                    variant="outline"
                    className="ml-auto text-xs border-green-500/50 text-green-600"
                  >
                    ✓
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Calendar className="h-4 w-4" />
                  <span>Google Calendar</span>
                  <Badge
                    variant="outline"
                    className="ml-auto text-xs border-green-500/50 text-green-600"
                  >
                    ✓
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User className="h-4 w-4" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Demo User</span>
                <span className="text-xs text-muted-foreground">demo@echo.app</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}