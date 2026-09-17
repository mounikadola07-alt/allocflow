"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ShieldAlert, Search, RefreshCw, Clock, Filter } from "lucide-react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

export default function AuditLogsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "CONFERENCE_ADMIN";
  const [searchTerm, setSearchTerm] = useState("");

  const { data: auditData, isLoading, refetch } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => api.getAuditLogs(0, 50),
    enabled: isAdmin,
  });

  if (user && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 rounded-2xl border border-ink-black/10 bg-white shadow-xl text-center space-y-4">
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-ink-black">Administrative Access Required</h2>
        <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
          The cryptographic compliance audit trail and immutable system event logs are restricted to Conference Chairs and System Administrators.
        </p>
        <Link
          href="/dashboard"
          className="liquid-glass rounded-xl px-5 py-2.5 text-xs font-semibold text-ink-black inline-flex items-center gap-2"
        >
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const logs = auditData?.content || [];

  const filteredLogs = logs.filter((log) => {
    return (
      (log.actorEmail && log.actorEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
    );
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
            Immutable Audit Trail
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Verifiable compliance log for reviewer assignments, overrides, and security events
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="btn-3d flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-ink-black transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter by actor, action, or details..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-ink-black/10 bg-white shadow-2xl rounded-2xl py-2.5 pl-9 pr-4 text-xs text-ink-black placeholder:text-muted-foreground focus:border-ink-black/30 focus:outline-none"
        />
      </div>

      {/* Audit Log Table */}
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-ink-black/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-ink-black/10 bg-white shadow-xl text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground font-sans">
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white shadow-xl transition-colors">
                    <td className="py-3 px-4 text-muted-foreground text-[11px]">
                      {new Date(log.timestamp).toISOString().replace("T", " ").substring(0, 19)}
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-ink-black">
                      {log.actorEmail || "ANONYMOUS"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-md bg-white shadow-md border border-ink-black/15 px-2 py-0.5 text-[10px] font-bold text-ink-black">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-[11px]">
                      {log.entityType}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-[11px]">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                    <td className="py-3 px-4 font-sans text-muted-foreground text-[11px] max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground font-sans">
                    No audit records found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
