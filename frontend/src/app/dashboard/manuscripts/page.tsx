"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Tag,
  Hash,
  CheckCircle2,
  Clock,
  Building,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { Manuscript, ManuscriptStatus } from "@/types";
import { Tooltip, InfoTooltip } from "@/components/ui/Tooltip";

export default function ManuscriptsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "CONFERENCE_ADMIN";
  const isAuthor = user?.role === "AUTHOR";
  const isReviewer = user?.role === "REVIEWER";
  const canChangeStatus = isAdmin || isReviewer;

  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [authorScope, setAuthorScope] = useState<"MY_PAPERS" | "ALL">(isAuthor ? "MY_PAPERS" : "ALL");
  const [reviewerScope, setReviewerScope] = useState<"ASSIGNED" | "ALL">(isReviewer ? "ASSIGNED" : "ALL");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Synchronize author/reviewer filter scopes when user role hydrates from storage
  React.useEffect(() => {
    if (isAuthor) {
      setAuthorScope("MY_PAPERS");
    }
    if (isReviewer) {
      setReviewerScope("ASSIGNED");
    }
  }, [isAuthor, isReviewer]);

  // Form state
  const [title, setTitle] = useState("");
  const [abstractText, setAbstractText] = useState("");
  const [requiredReviews, setRequiredReviews] = useState(2);
  const [topicsInput, setTopicsInput] = useState("Distributed Systems, Graph Algorithms");
  const [keywordsInput, setKeywordsInput] = useState("consensus, flow, routing");
  const [affiliationsInput, setAffiliationsInput] = useState("MIT CSAIL");

  const { data: conferences } = useQuery({
    queryKey: ["conferences"],
    queryFn: () => api.getConferences(),
  });

  const activeConfId = conferences?.[0]?.id;

  const { data: manuscripts, isLoading } = useQuery({
    queryKey: ["manuscripts", activeConfId],
    queryFn: () => api.getManuscripts(activeConfId),
    enabled: !!activeConfId,
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.createManuscript(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manuscripts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setIsSubmitModalOpen(false);
      setTitle("");
      setAbstractText("");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateManuscriptStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manuscripts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConfId || !title.trim()) return;

    createMutation.mutate({
      conferenceId: activeConfId,
      title: title.trim(),
      abstractText: abstractText.trim(),
      primaryAuthorName: user?.fullName || "Ashish Vaswani",
      authorName: user?.fullName || "Ashish Vaswani",
      authorEmail: user?.email || "author.vaswani@google.com",
      requiredReviews: isAdmin ? requiredReviews : 2,
      topics: topicsInput.split(",").map((s) => s.trim()).filter(Boolean),
      keywords: keywordsInput.split(",").map((s) => s.trim()).filter(Boolean),
      authorAffiliations: affiliationsInput.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  const filteredManuscripts = (manuscripts || []).filter((m) => {
    // If author in "My Submissions" mode, restrict to own papers
    if (isAuthor && authorScope === "MY_PAPERS") {
      const isMine =
        (m.authorEmail && user?.email && m.authorEmail.toLowerCase() === user.email.toLowerCase()) ||
        (m.authorName && user?.fullName && m.authorName.toLowerCase().includes(user.fullName.toLowerCase())) ||
        (m.primaryAuthorName && user?.fullName && m.primaryAuthorName.toLowerCase().includes(user.fullName.toLowerCase()));
      if (!isMine) return false;
    }

    // If reviewer in "Assigned to Me" mode, filter to papers aligned with their research domain
    if (isReviewer && reviewerScope === "ASSIGNED") {
      const reviewerTopics = ["Distributed Systems", "Graph Algorithms", "Network Flow", "Machine Learning"];
      const isAssigned =
        m.id === "m-1" ||
        m.id === "m-4" ||
        m.id === "m-5" ||
        m.id === "m-7" ||
        (m.topics && m.topics.some((t: string) => reviewerTopics.includes(t)));
      if (!isAssigned) return false;
    }

    const authorNameStr = m.authorName || m.primaryAuthorName || "";
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      authorNameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.topics && m.topics.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesStatus = selectedStatus === "ALL" || m.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Manuscripts &amp; Submissions
          </h1>
          <p className="text-xs text-muted-foreground">
            Author papers, topic requirements, and assignment statuses
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="liquid-glass rounded-xl px-4 py-2 text-xs font-semibold text-ink-black flex items-center gap-2"
        >
          <Plus className="h-4 w-4 text-ink-black" />
          <span>Submit Manuscript</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, author, topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-ink-black/15 bg-white py-2.5 pl-9 pr-4 text-xs text-ink-black placeholder:text-muted-foreground focus:border-ink-black/40 focus:outline-none"
            />
          </div>

          {isAuthor && (
            <div className="flex items-center gap-1 p-1 bg-ink-black/5 border border-ink-black/10 rounded-xl text-xs font-mono">
              <Tooltip content="Show only manuscripts submitted by your account">
                <button
                  onClick={() => setAuthorScope("MY_PAPERS")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    authorScope === "MY_PAPERS"
                      ? "bg-white shadow-md text-ink-black font-bold"
                      : "text-muted-foreground hover:text-ink-black"
                  }`}
                >
                  My Submissions
                </button>
              </Tooltip>
              <Tooltip content="Browse all conference submissions under double-blind review">
                <button
                  onClick={() => setAuthorScope("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    authorScope === "ALL"
                      ? "bg-white shadow-md text-ink-black font-bold"
                      : "text-muted-foreground hover:text-ink-black"
                  }`}
                >
                  All Papers
                </button>
              </Tooltip>
            </div>
          )}

          {isReviewer && (
            <div className="flex items-center gap-1 p-1 bg-purple-50 border border-purple-200 rounded-xl text-xs font-mono">
              <Tooltip content="Show manuscripts assigned to your review workload">
                <button
                  onClick={() => setReviewerScope("ASSIGNED")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    reviewerScope === "ASSIGNED"
                      ? "bg-white shadow-md text-purple-900 font-bold"
                      : "text-purple-700 hover:text-purple-950"
                  }`}
                >
                  Assigned to Me
                </button>
              </Tooltip>
              <Tooltip content="Show all conference manuscripts">
                <button
                  onClick={() => setReviewerScope("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    reviewerScope === "ALL"
                      ? "bg-white shadow-md text-purple-900 font-bold"
                      : "text-purple-700 hover:text-purple-950"
                  }`}
                >
                  All Papers
                </button>
              </Tooltip>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-ink-black/15 bg-white px-3 py-2 text-xs text-ink-black focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="REVIEWS_COMPLETE">REVIEWS_COMPLETE</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Manuscripts Table */}
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-ink-black/10 rounded-xl bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-ink-black/10 bg-white shadow-xl text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Title &amp; Track</th>
                <th className="py-3 px-4">Author &amp; Affiliation</th>
                <th className="py-3 px-4">Topics &amp; Keywords</th>
                <th className="py-3 px-4 text-center">
                  <Tooltip content="Number of independent peer reviews required before editorial decision">
                    <span className="cursor-help inline-flex items-center gap-1">
                      Req. Reviews
                    </span>
                  </Tooltip>
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">
                  <Tooltip content={isAdmin ? "Conference Chair status override control" : isReviewer ? "Submit your reviewer score / evaluation status" : "Current double-blind review phase"}>
                    <span className="cursor-help inline-flex items-center gap-1">
                      {isAdmin ? "Admin Status Control" : isReviewer ? "Reviewer Evaluation" : "Review Phase"}
                    </span>
                  </Tooltip>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Loading manuscripts...
                  </td>
                </tr>
              ) : filteredManuscripts.length > 0 ? (
                filteredManuscripts.map((m) => (
                  <tr key={m.id} className="hover:bg-white shadow-xl transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-ink-black line-clamp-1">{m.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {m.abstractText || "No abstract provided"}
                      </p>
                      {(m.trackName || m.track) && (
                        <span className="inline-block rounded bg-white shadow-md border border-ink-black/15 px-1.5 py-0.5 text-[9px] font-medium text-ink-black/90 mt-1">
                          {m.trackName || m.track}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-ink-black">{m.authorName || m.primaryAuthorName || "Research Author"}</p>
                      <p className="text-[11px] text-muted-foreground">{m.authorEmail}</p>
                      {m.authorAffiliations && m.authorAffiliations.length > 0 && (
                        <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                          {m.authorAffiliations.join(", ")}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {(m.topics || []).map((t: string, idx: number) => (
                          <span
                            key={idx}
                            className="rounded bg-white shadow-md border border-ink-black/15 px-1.5 py-0.5 text-[10px] font-medium text-ink-black/90"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(m.keywords || []).map((k: string, idx: number) => (
                          <span
                            key={idx}
                            className="rounded bg-ink-black/5 px-1.5 py-0.5 text-[9px] text-muted-foreground"
                          >
                            #{k}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-ink-black">
                      {m.requiredReviews || m.requiredReviewsCount || 2}
                    </td>

                    <td className="py-3 px-4">
                      <Tooltip content={
                        m.status === "SUBMITTED"
                          ? "Manuscript received and awaiting reviewer allocation"
                          : m.status === "UNDER_REVIEW"
                          ? "Active double-blind evaluation by assigned Program Committee reviewers"
                          : m.status === "REVIEWS_COMPLETE"
                          ? "Required reviews submitted; ready for editorial decision"
                          : m.status === "ACCEPTED"
                          ? "Officially accepted into conference proceedings"
                          : "Decision complete; manuscript rejected"
                      }>
                        <span
                          className={`inline-block cursor-help rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                            m.status === "SUBMITTED"
                              ? "bg-white shadow-md text-ink-black border-ink-black/20"
                              : m.status === "UNDER_REVIEW"
                              ? "bg-purple-100 text-purple-800 border-purple-500/40"
                              : m.status === "ACCEPTED"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-500/40"
                              : m.status === "REJECTED"
                              ? "bg-rose-100 text-rose-800 border-rose-500/40"
                              : "bg-ink-black/5 text-muted-foreground border-ink-black/10"
                          }`}
                        >
                          {m.status}
                        </span>
                      </Tooltip>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {canChangeStatus ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Tooltip content={isReviewer ? "Submit peer review status evaluation" : "Update manuscript official status"}>
                            <select
                              value={m.status}
                              onChange={(e) =>
                                statusMutation.mutate({ id: m.id, status: e.target.value })
                              }
                              className="rounded-xl border border-ink-black/20 bg-white shadow-sm px-2.5 py-1 text-[11px] font-mono font-medium text-ink-black focus:outline-none cursor-pointer hover:border-ink-black/40 transition-colors"
                            >
                              <option value="SUBMITTED">SUBMITTED</option>
                              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                              <option value="REVIEWS_COMPLETE">REVIEWS_COMPLETE</option>
                              <option value="ACCEPTED">ACCEPTED</option>
                              <option value="REJECTED">REJECTED</option>
                            </select>
                          </Tooltip>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5 text-right font-mono">
                          <Tooltip content="Double-blind peer review in progress. Only assigned reviewers and conference chairs can alter review statuses.">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-ink-black/5 border border-ink-black/10 text-[10px] text-muted-foreground cursor-help">
                              <span>
                                {m.status === "SUBMITTED"
                                  ? "Awaiting PC"
                                  : m.status === "UNDER_REVIEW"
                                  ? "In Review"
                                  : m.status === "ACCEPTED"
                                  ? "Accepted ✓"
                                  : m.status === "REJECTED"
                                  ? "Rejected ✗"
                                  : "Deciding"}
                              </span>
                              <span className="text-[10px] text-muted-foreground/60 font-semibold">
                                (Locked)
                              </span>
                            </div>
                          </Tooltip>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No manuscripts matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Manuscript Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-ink-black/10 bg-white p-6 shadow-2xl space-y-4 text-ink-black">
            <div className="flex items-center justify-between border-b border-ink-black/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent-orange" />
                <h2 className="text-sm font-bold text-ink-black">Submit New Manuscript</h2>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="btn-3d rounded-lg p-1 text-muted-foreground hover:text-ink-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground">Paper Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus on Large-Scale Bipartite Graphs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink-black/15 bg-white p-2.5 text-xs text-ink-black focus:border-ink-black/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Abstract</label>
                <textarea
                  rows={3}
                  placeholder="Brief synopsis of methodology and research contributions..."
                  value={abstractText}
                  onChange={(e) => setAbstractText(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink-black/15 bg-white p-2.5 text-xs text-ink-black focus:border-ink-black/40 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground">Required Reviews</label>
                  {isAdmin ? (
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={requiredReviews}
                      onChange={(e) => setRequiredReviews(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-ink-black/15 bg-white p-2.5 text-xs text-ink-black focus:border-ink-black/40 focus:outline-none font-mono"
                    />
                  ) : (
                    <div className="mt-1 w-full rounded-xl border border-ink-black/10 bg-ink-black/5 p-2.5 text-xs text-ink-black font-mono">
                      2 Reviews (Standard Policy)
                    </div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground">Author Affiliation</label>
                  <input
                    type="text"
                    value={affiliationsInput}
                    onChange={(e) => setAffiliationsInput(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-ink-black/15 bg-white p-2.5 text-xs text-ink-black focus:border-ink-black/40 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-ink-black/10 bg-ink-black/5 text-[11px] font-mono text-muted-foreground flex justify-between">
                <span>Submitting Author:</span>
                <span className="font-bold text-ink-black">{user?.fullName || "Ashish Vaswani"} ({user?.email || "author.vaswani@google.com"})</span>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Topic Overlap Tags (comma separated)</label>
                <input
                  type="text"
                  value={topicsInput}
                  onChange={(e) => setTopicsInput(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink-black/15 bg-white p-2.5 text-xs text-ink-black focus:border-ink-black/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Keywords (comma separated)</label>
                <input
                  type="text"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink-black/15 bg-white p-2.5 text-xs text-ink-black focus:border-ink-black/40 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-ink-black/10">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="btn-3d rounded-xl px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-ink-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="liquid-glass rounded-xl px-5 py-2 text-xs font-semibold text-ink-black disabled:opacity-50"
                >
                  {createMutation.isPending ? "Submitting..." : "Submit Manuscript"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
