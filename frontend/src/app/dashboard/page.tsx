"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  FileText,
  Users,
  GitMerge,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Sparkles,
  Zap,
  Activity,
  Layers,
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { useAuth } from "@/lib/auth";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "CONFERENCE_ADMIN";
  const isAuthor = user?.role === "AUTHOR";
  const isReviewer = user?.role === "REVIEWER";
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.getDashboardStats(),
  });

  const { data: auditLogs } = useQuery({
    queryKey: ["recent-audit-logs"],
    queryFn: () => api.getRecentAuditLogs(),
  });

  if (!mounted || isLoading || !stats) {
    return (
      <div className="flex h-96 items-center justify-center font-space">
        <div className="flex flex-col items-center gap-4 text-muted">
          <div className="h-6 w-6 animate-spin border-2 border-accent-orange border-t-transparent shadow-[0_0_15px_rgba(229,125,37,0.5)]" />
          <p className="text-[10px] uppercase tracking-widest text-accent-orange animate-pulse">Initializing Flow Graph...</p>
        </div>
      </div>
    );
  }

  // Format workload data for chart
  const workloadData = Object.entries(stats.reviewerWorkloadDistribution || {}).map(
    ([name, count]) => ({
      name: name.replace(/^(Dr\.|Prof\.)\s+/i, "").split(" ")[0] || name,
      count,
    })
  );

  // Format status data for pie chart
  const statusData = Object.entries(stats.manuscriptsByStatus || {}).map(
    ([status, count]) => ({
      name: status.replace("_", " "),
      value: count,
    })
  );

  const STATUS_COLORS = ["#f4f1e6", "#5B7553", "#7B6B8A", "#E57D25", "#888888"];

  return (
    <div className="space-y-6 select-none text-ink-black pb-12">
      {/* Header Banner */}
      <div className="border border-ink-black/10 bg-white shadow-2xl rounded-2xl p-6 flex flex-wrap items-end justify-between gap-6 backdrop-blur-sm">
        <div>
          <div className="mb-2 flex items-center gap-3 font-space text-[10px] text-muted tracking-widest uppercase">
            <span>[ SYSTEM OVERVIEW ]</span>
            <div className="h-px w-8 bg-divider"></div>
          </div>
          <div className="flex items-center gap-4">
            <h1
              className="text-4xl tracking-tight text-ink-black font-heading"
            >
              {isAuthor
                ? "Author Operations Portal"
                : isReviewer
                ? "Peer Reviewer Portal"
                : "Conference Operations"}
            </h1>
            <span className="border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[9px] font-space font-bold text-green-400 uppercase tracking-widest animate-pulse mt-2">
              {isAuthor ? "Active Submissions" : isReviewer ? "Evaluation Mode" : "Live Allocation"}
            </span>
          </div>
          <p className="mt-2 text-xs font-space text-muted uppercase tracking-wider">
            Target: {stats.activeConferenceName} ({stats.activeConferenceCode}) //{" "}
            {isAuthor
              ? "Submissions & Double-Blind Review Tracking"
              : isReviewer
              ? "Peer Evaluation & Feedback Verification"
              : "Max-Flow Engine Running"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <>
              <Link
                href="/dashboard/matching"
                className="group relative inline-flex h-10 items-center justify-center overflow-hidden border border-accent-orange bg-accent-orange/10 px-6 font-space text-[11px] font-bold text-accent-orange uppercase tracking-widest transition-all hover:bg-accent-orange hover:text-ink-black"
              >
                <GitMerge className="mr-2 h-4 w-4" />
                <span>Launch Cockpit</span>
              </Link>
              <Link
                href="/dashboard/comparison"
                className="group relative inline-flex h-10 items-center justify-center overflow-hidden border border-accent-blue bg-accent-blue/10 px-6 font-space text-[11px] font-bold text-accent-blue uppercase tracking-widest transition-all hover:bg-accent-blue hover:text-ink-black"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Tri-Algo Lab</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard/manuscripts"
                className="group relative inline-flex h-10 items-center justify-center overflow-hidden border border-accent-orange bg-accent-orange/10 px-6 font-space text-[11px] font-bold text-accent-orange uppercase tracking-widest transition-all hover:bg-accent-orange hover:text-ink-black"
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>{isAuthor ? "Submit Manuscript" : "Assigned Papers"}</span>
              </Link>
              <Link
                href="/dashboard/manuscripts"
                className="group relative inline-flex h-10 items-center justify-center overflow-hidden border border-ink-black/20 bg-ink-black/5 px-6 font-space text-[11px] font-bold text-ink-black uppercase tracking-widest transition-all hover:bg-ink-black hover:text-beige-bg"
              >
                <Clock className="mr-2 h-4 w-4" />
                <span>{isAuthor ? "My Submissions" : "Review Progress"}</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* TERMINAL KPI STATS GRID */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Manuscripts */}
        <div className="p-5 relative overflow-hidden group hover:opacity-90 transition-all duration-300 rounded-2xl shadow-2xl hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)] hover:-translate-y-1" style={{backgroundColor:"#C1847B", color:"#0F0F0F"}}>
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText className="h-20 w-20" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <p className="text-[10px] font-space font-bold text-muted uppercase tracking-widest">
              Total Manuscripts
            </p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl font-mono text-ink-black tracking-tighter">
                {stats.totalManuscripts}
              </span>
              <span className="text-[10px] font-space text-muted uppercase">Nodes</span>
            </div>
            <div className="mt-4 pt-3 border-t border-ink-black/10">
              <p className="text-[9px] font-space text-muted uppercase tracking-wider">
                Target Capacity: {stats.totalRequiredReviews} Reviews
              </p>
            </div>
          </div>
        </div>

        {/* Reviewer Roster */}
        <div className="p-5 relative overflow-hidden group hover:opacity-90 transition-all duration-300 rounded-2xl shadow-2xl hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)] hover:-translate-y-1" style={{backgroundColor:"#5D6D7E", color:"#0F0F0F"}}>
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="h-20 w-20 text-accent-blue" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <p className="text-[10px] font-space font-bold text-accent-blue uppercase tracking-widest">
              PC Reviewers
            </p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl font-mono text-ink-black tracking-tighter">
                {stats.totalReviewers}
              </span>
              <span className="text-[10px] font-space text-accent-blue uppercase">Sinks</span>
            </div>
            <div className="mt-4 pt-3 border-t border-ink-black/10">
              <p className="text-[9px] font-space text-muted uppercase tracking-wider">
                Max Flow Cap: {stats.totalReviewerCapacity} Slots
              </p>
            </div>
          </div>
        </div>

        {/* Allocated Pairs */}
        <div className="p-5 relative overflow-hidden group hover:opacity-90 transition-all duration-300 rounded-2xl shadow-2xl hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)] hover:-translate-y-1" style={{backgroundColor:"#7A9478", color:"#0F0F0F"}}>
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <GitMerge className="h-20 w-20 text-[#5B7553]" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <p className="text-[10px] font-space font-bold text-[#5B7553] uppercase tracking-widest">
              Computed Edges
            </p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl font-mono text-ink-black tracking-tighter">
                {stats.totalAssignments}
              </span>
              <span className="text-[10px] font-space text-[#5B7553] uppercase">Flows</span>
            </div>
            <div className="mt-4 pt-3 border-t border-ink-black/10">
              <p className="text-[9px] font-space text-muted uppercase tracking-wider">
                Saturation: {(stats.averageCoveragePercentage ?? 0).toFixed(1)}% Optimal
              </p>
            </div>
          </div>
        </div>

        {/* COI Safeguards */}
        <div className="p-5 relative overflow-hidden group hover:opacity-90 transition-all duration-300 rounded-2xl shadow-2xl hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)] hover:-translate-y-1" style={{backgroundColor:"#8B8589", color:"#0F0F0F"}}>
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck className="h-20 w-20 text-accent-orange" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <p className="text-[10px] font-space font-bold text-accent-orange uppercase tracking-widest">
              Zero-COI Policy
            </p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl font-mono text-ink-black tracking-tighter">
                {stats.totalConflicts}
              </span>
              <span className="text-[10px] font-space text-accent-orange uppercase">Blocked</span>
            </div>
            <div className="mt-4 pt-3 border-t border-ink-black/10 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-accent-orange animate-pulse"></div>
              <p className="text-[9px] font-space text-muted uppercase tracking-wider">
                Strict Constraints Enforced
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3D CHARTS SECTION */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Workload Saturation Bar Chart */}
        <div className="border border-ink-black/10 bg-white shadow-2xl rounded-2xl p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-heading text-accent-blue">Reviewer Saturation Array</h2>
              <p className="text-[10px] font-space text-muted uppercase tracking-widest mt-1">Allocated load vs Hard Capacity limit</p>
            </div>
            <span className="border border-ink-black/10 px-2 py-1 text-[9px] font-space font-bold text-muted uppercase">
              Cap: 4
            </span>
          </div>

          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={{ stroke: "rgba(0,0,0,0.1)", strokeWidth: 1 }}
                  tick={{ fontSize: 10, fill: "#444444", fontFamily: "'Space Mono', monospace" }}
                  dy={10}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(0,0,0,0.1)", strokeWidth: 1 }}
                  tick={{ fontSize: 10, fill: "#444444", fontFamily: "'Space Mono', monospace" }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  itemStyle={{ color: "#0F0F0F", fontWeight: "bold" }} labelStyle={{ color: "#8a8a8a", marginBottom: "4px" }} contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(0, 0, 0, 0.12)",
                    borderRadius: "0px",
                    color: "#0F0F0F",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                  }}
                />
                <Bar dataKey="count" fill="#E57D25" barSize={16} radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Distribution Pie */}
        <div className="border border-ink-black/10 bg-white shadow-2xl rounded-2xl p-6 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-heading text-accent-blue">Manuscript Topology</h2>
            <p className="text-[10px] font-space text-muted uppercase tracking-widest mt-1">Current state distribution</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  itemStyle={{ color: "#0F0F0F", fontWeight: "bold" }} labelStyle={{ color: "#8a8a8a", marginBottom: "4px" }} contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(0, 0, 0, 0.12)",
                    borderRadius: "0px",
                    color: "#0F0F0F",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-auto flex flex-col gap-2 pt-6 border-t border-ink-black/10">
            {statusData.map((entry, i) => (
              <div key={i} className="flex items-center justify-between text-[10px] font-space text-muted uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2"
                    style={{ backgroundColor: STATUS_COLORS[i % STATUS_COLORS.length] }}
                  />
                  <span>{entry.name}</span>
                </div>
                <strong className="text-ink-black font-mono text-xs">{entry.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT AUDIT TRAIL */}
      <div className="border border-ink-black/10 bg-white shadow-2xl rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="border border-ink-black/10 bg-white shadow-2xl rounded-2xl p-1.5">
              <Clock className="h-4 w-4 text-muted" />
            </div>
            <div>
              <h2 className="text-xl font-heading text-accent-blue">System Audit Log</h2>
              <p className="text-[10px] font-space text-muted uppercase tracking-widest mt-0.5">Cryptographic Action Trail</p>
            </div>
          </div>
          <Link
            href="/dashboard/audit"
            className="group flex items-center gap-1 border border-ink-black/10 px-3 py-1.5 text-[10px] font-space uppercase tracking-widest text-muted hover:bg-white shadow-md hover:text-ink-black transition-colors"
          >
            <span>View Full Log</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-ink-black/10">
                <th className="pb-3 text-[10px] font-space font-bold uppercase tracking-widest text-muted">Timestamp</th>
                <th className="pb-3 text-[10px] font-space font-bold uppercase tracking-widest text-muted">Operator</th>
                <th className="pb-3 text-[10px] font-space font-bold uppercase tracking-widest text-muted">Command</th>
                <th className="pb-3 text-[10px] font-space font-bold uppercase tracking-widest text-muted">Node Target</th>
                <th className="pb-3 text-[10px] font-space font-bold uppercase tracking-widest text-muted text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {(Array.isArray(auditLogs) ? auditLogs : []).slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-black/[0.02] transition-colors group">
                  <td className="py-3 text-[11px] font-mono text-muted">
                    {new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                  </td>
                  <td className="py-3 text-[11px] font-space text-ink-black">{log.actorEmail}</td>
                  <td className="py-3">
                    <span className="border border-black/10 bg-white shadow-2xl rounded-2xl px-1.5 py-0.5 text-[9px] font-mono text-ink-black uppercase">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 text-[11px] font-mono text-muted group-hover:text-ink-black transition-colors">
                    {log.entityType}_[{log.entityId ? log.entityId.substring(0, 6) : "SYS"}]
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-[10px] font-space font-bold text-[#5B7553] uppercase tracking-widest">
                      [ OK ]
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
