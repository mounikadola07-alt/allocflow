"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  GitMerge,
  Scale,
  Network,
  FlaskConical,
  ShieldAlert,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { Tooltip } from "@/components/ui/Tooltip";

export function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "CONFERENCE_ADMIN";
  const pathname = usePathname();

  const operationsNav = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard, tip: "High-level conference metrics and allocation health" },
    ...(isAdmin ? [{ label: "Conferences", href: "/dashboard/conferences", icon: Building2, tip: "Manage conference cycles and submission deadlines" }] : []),
    { label: "Manuscripts", href: "/dashboard/manuscripts", icon: FileText, tip: "Track submissions, topics, and review decisions" },
    ...(isAdmin ? [{ label: "Reviewers", href: "/dashboard/reviewers", icon: Users, tip: "Program Committee roster and reviewer workloads" }] : []),
    ...(isAdmin ? [{ label: "Audit Logs", href: "/dashboard/audit", icon: ShieldAlert, tip: "Cryptographically verifiable compliance log" }] : []),
  ];

  const researchNav = [
    ...(isAdmin ? [{ label: "Matching Cockpit", href: "/dashboard/matching", icon: GitMerge, badge: "Max-Flow", tip: "Simulate & commit optimal bipartite matching" }] : []),
    { label: "Algorithm Compare", href: "/dashboard/comparison", icon: Scale, badge: "Tri-Algo", tip: "Tri-algorithm benchmark: FF vs EK vs Dinic" },
    { label: "Graph Visualizer", href: "/dashboard/graph-view", icon: Network, badge: "Graph", tip: "Interactive S → P → R → T bipartite flow graph" },
    { label: "Scalability Lab", href: "/dashboard/experiments", icon: FlaskConical, badge: "Sweeps", tip: "Empirical runtime scaling curves & parameter sweeps" },
  ];

  return (
    <aside className="w-64 border-r border-ink-black/10 bg-beige-bg/80 backdrop-blur-md flex flex-col justify-between p-4 h-[calc(100vh-4rem)] sticky top-16 select-none font-sans text-ink-black">
      <div className="space-y-8 mt-2">
        {/* OPERATIONS SECTION */}
        <div>
          <div className="mb-4 flex items-center gap-2 font-space text-[10px] uppercase tracking-[0.2em] text-muted pl-2">
            <span className="h-[4px] w-[4px] bg-accent-orange"></span>
            <span>Operations Manifest</span>
          </div>
          <nav className="space-y-1">
            {operationsNav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Tooltip key={item.href} content={item.tip} position="right" className="w-full">
                  <Link
                    href={item.href}
                    className={`flex w-full items-center justify-between px-3 py-2 text-[11px] font-space tracking-wider uppercase transition-all ${
                      active
                        ? "bg-black/10 text-ink-black font-bold border-l-2 border-accent-orange"
                        : "text-muted hover:bg-ink-black/5 hover:text-ink-black border-l-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-3.5 w-3.5 ${active ? "text-accent-orange" : "text-muted"}`} />
                      <span>{item.label}</span>
                    </div>
                    {active && <span className="text-accent-orange opacity-70">{"<"}</span>}
                  </Link>
                </Tooltip>
              );
            })}
          </nav>
        </div>

        {/* RESEARCH LAB SECTION */}
        <div>
          <div className="mb-4 flex items-center justify-between pl-2">
            <div className="flex items-center gap-2 font-space text-[10px] uppercase tracking-[0.2em] text-accent-blue">
              <span className="h-[4px] w-[4px] bg-accent-blue shadow-[0_0_8px_rgba(2,84,236,0.6)]"></span>
              <span>Research Lab</span>
            </div>
            <span className="border border-accent-blue/30 bg-accent-blue/10 px-1 py-0.5 text-[8px] font-space font-bold text-accent-blue">
              DSA Suite
            </span>
          </div>
          <nav className="space-y-1">
            {researchNav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Tooltip key={item.href} content={item.tip} position="right" className="w-full">
                  <Link
                    href={item.href}
                    className={`flex w-full items-center justify-between px-3 py-2 text-[11px] font-space tracking-wider uppercase transition-all ${
                      active
                        ? "bg-accent-blue/10 text-ink-black font-bold border-l-2 border-accent-blue"
                        : "text-muted hover:bg-ink-black/5 hover:text-ink-black border-l-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-3.5 w-3.5 ${active ? "text-accent-blue" : "text-muted"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="border border-ink-black/10 bg-black/10 px-1 py-0.5 text-[8px] font-bold text-muted">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </Tooltip>
              );
            })}
          </nav>
        </div>
      </div>

      {/* System Invariant Status Footer */}
      <Tooltip
        content="Mathematical verification: Ford-Fulkerson, Edmonds-Karp, and Dinic yields identical maximum flow values under canonical capacity and COI constraints."
        position="top"
        className="w-full"
      >
        <div className="w-full border border-ink-black/10 bg-black/10 p-4 text-[11px] font-space cursor-help rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-muted uppercase tracking-wider text-[10px]">Graph Invariant</span>
            <span className="border border-green-500/30 bg-green-500/10 px-1.5 py-0.5 text-[8px] font-bold text-green-400 uppercase tracking-widest animate-pulse">
              Sys_Active
            </span>
          </div>
          <div className="bg-ink-black border border-white/5 p-2 mb-2 rounded">
            <p className="font-mono text-[9px] text-green-400">
              FF.flow == EK.flow
              <br />
              == Dinic.flow
            </p>
          </div>
          <p className="text-[9px] text-muted uppercase tracking-widest leading-relaxed">
            Capacity &amp; Zero-COI
            <br />strictly enforced.
          </p>
        </div>
      </Tooltip>
    </aside>
  );
}
