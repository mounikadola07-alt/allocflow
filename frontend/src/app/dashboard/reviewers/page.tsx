"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  Tag,
  ShieldAlert,
} from "lucide-react";
import { Card3D } from "@/components/ui/Card3D";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { Tooltip, InfoTooltip } from "@/components/ui/Tooltip";

export default function ReviewersRosterPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: reviewers, isLoading } = useQuery({
    queryKey: ["reviewers"],
    queryFn: () => api.getReviewers(),
    enabled: user?.role !== "AUTHOR",
  });

  if (isAuthLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-black border-t-transparent" />
          <p className="text-xs text-ink-black/80 font-mono">Verifying double-blind credentials...</p>
        </div>
      </div>
    );
  }

  if (user?.role === "AUTHOR") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 rounded-2xl border border-ink-black/10 bg-white shadow-xl text-center space-y-4">
        <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-ink-black">Double-Blind Review Integrity Protected</h2>
        <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
          In accordance with ICDCS double-blind peer review protocols, manuscript authors are restricted from viewing Program Committee reviewer rosters, assigned workloads, or institutional affiliations during the active evaluation cycle.
        </p>
        <Link
          href="/dashboard/manuscripts"
          className="liquid-glass rounded-xl px-5 py-2.5 text-xs font-semibold text-ink-black inline-flex items-center gap-2"
        >
          <span>View Your Manuscripts</span>
        </Link>
      </div>
    );
  }

  const filteredReviewers = (reviewers || []).filter((r) => {
    const matchesSearch =
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.topics.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6 select-none text-ink-black">
      {/* Header */}
      <div className="bg-white shadow-2xl rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 border border-ink-black/10">
        <div>
          <h1
            className="text-3xl tracking-tight text-ink-black"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Program Committee Reviewer Roster
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Reviewer capacities, research subject domain overlap, and active load saturation
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by reviewer name, email, topic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-ink-black/15 bg-white py-2.5 pl-9 pr-4 text-xs text-ink-black placeholder:text-muted-foreground focus:border-ink-black/40 focus:outline-none"
        />
      </div>

      {/* Reviewer Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-xs text-muted-foreground">
            Loading reviewer roster...
          </div>
        ) : filteredReviewers.length > 0 ? (
          filteredReviewers.map((r) => {
            const utilizationPct =
              ((r.currentWorkload ?? 0) / (r.maxCapacity || 1)) * 100;
            return (
              <Card3D
                key={r.id}
                glowColor={r.active && r.available ? "emerald" : "none"}
                className="p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-ink-black">{r.userName}</h3>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Building2 className="h-3 w-3" />
                      {r.affiliation || "Independent Scholar"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip content={r.active && r.available ? "Active and accepting manuscript review assignments" : "Unavailable or capacity saturated"}>
                      {r.active && r.available ? (
                        <span className="cursor-help flex items-center gap-1 rounded bg-emerald-100 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-semibold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" /> Available
                        </span>
                      ) : (
                        <span className="cursor-help flex items-center gap-1 rounded bg-rose-100 border border-rose-500/40 px-2 py-0.5 text-[9px] font-semibold text-rose-800">
                          <XCircle className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </Tooltip>
                  </div>
                </div>

                {/* Capacity & Workload Bar */}
                <Tooltip content={`Reviewer currently assigned ${r.currentWorkload} manuscripts out of ${r.maxCapacity} max capacity`} position="bottom" className="w-full">
                  <div className="w-full space-y-1.5 text-xs cursor-help">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Workload Saturation:</span>
                      <span className="font-mono font-bold text-ink-black">
                        {r.currentWorkload} / {r.maxCapacity} slots ({utilizationPct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white shadow-md overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          utilizationPct >= 100
                            ? "bg-rose-500"
                            : utilizationPct >= 50
                            ? "bg-amber-500"
                            : "bg-emerald-400"
                        }`}
                        style={{ width: `${Math.min(100, utilizationPct)}%` }}
                      />
                    </div>
                  </div>
                </Tooltip>

                {/* Topic Expertise Badges */}
                <div className="space-y-1.5 pt-2 border-t border-ink-black/10 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                      Topic Expertise:
                    </span>
                    <InfoTooltip content="Primary research topics used for edge compatibility scoring and conflict checks" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.topics.map((t, idx) => (
                      <span
                        key={idx}
                        className="rounded bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 text-[10px] font-medium text-purple-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Email Footer */}
                <div className="pt-2 border-t border-ink-black/10 text-[10px] text-muted-foreground truncate">
                  {r.userEmail}
                </div>
              </Card3D>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-xs text-muted-foreground">
            No reviewers found matching &quot;{searchTerm}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
