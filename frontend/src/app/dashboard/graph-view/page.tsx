"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Network, RefreshCw, Layers, Sliders, Box } from "lucide-react";
import { BipartiteFlowGraph } from "@/components/graph/BipartiteFlowGraph";
import { ExplainDrawer } from "@/components/matching/ExplainDrawer";
import type { AlgorithmType, SimulationResponse, AssignmentExplanation } from "@/types";
import { Tooltip, InfoTooltip } from "@/components/ui/Tooltip";

export default function GraphViewPage() {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("DINIC");
  const [selectedExplanation, setSelectedExplanation] = useState<AssignmentExplanation | null>(null);
  const [isExplainOpen, setIsExplainOpen] = useState(false);

  const { data: conferences } = useQuery({
    queryKey: ["conferences"],
    queryFn: () => api.getConferences(),
  });

  const activeConfId = conferences?.[0]?.id;

  const { data: simulationResult, isLoading, refetch } = useQuery({
    queryKey: ["live-graph-simulation", activeConfId, algorithm],
    queryFn: () =>
      api.simulateMatching({
        conferenceId: activeConfId!,
        algorithm,
        requiredReviewsPerPaper: 2,
        defaultReviewerCapacity: 4,
        excludeConflicts: true,
      }),
    enabled: !!activeConfId,
  });

  const handleExplain = async (manuscriptId: string, reviewerId: string) => {
    try {
      const explanation = await api.explainAssignment(
        manuscriptId,
        reviewerId,
        simulationResult?.runId
      );
      setSelectedExplanation(explanation);
      setIsExplainOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 select-none text-ink-black">
      {/* Header */}
      <div className="bg-white shadow-2xl rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 border border-ink-black/10">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="text-3xl tracking-tight text-ink-black"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Bipartite Flow Network Visualizer
            </h1>
            <Tooltip content="4-layer canonical flow network: Source (S) → Papers (P) → Reviewers (R) → Sink (T)">
              <span className="cursor-help rounded-full bg-white shadow-md border border-ink-black/20 px-3 py-0.5 text-[11px] font-bold text-ink-black shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                Interactive S → P → R → T
              </span>
            </Tooltip>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Explore bipartite node partitions, residual flow capacities, and augmenting path iterations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Tooltip content="Select max-flow algorithm: Dinic (O(V²E) layered network), Edmonds-Karp (O(VE²) BFS augmenting paths), or Ford-Fulkerson (DFS paths)">
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as AlgorithmType)}
              className="rounded-xl border border-ink-black/10 bg-white shadow-inner px-3 py-2 text-xs text-ink-black focus:outline-none cursor-pointer"
            >
              <option value="DINIC">Dinic Algorithm (O(V²E))</option>
              <option value="EDMONDS_KARP">Edmonds-Karp Algorithm (O(VE²))</option>
              <option value="FORD_FULKERSON">Ford-Fulkerson Algorithm</option>
            </select>
          </Tooltip>

          <Tooltip content="Re-compute augmenting paths and residual capacities with selected algorithm">
            <button
              onClick={() => refetch()}
              className="btn-3d flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-ink-black transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Re-solve Network</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Main Visualizer Area */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-black border-t-transparent shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
            <p className="text-xs text-ink-black/80">Constructing canonical bipartite flow graph...</p>
          </div>
        </div>
      ) : simulationResult ? (
        <div className="space-y-4">
          <BipartiteFlowGraph
            data={simulationResult.graphVisualization}
            traces={simulationResult.executionTraceSummary}
            algorithmName={simulationResult.algorithmName}
            onEdgeClick={handleExplain}
          />
        </div>
      ) : null}

      <ExplainDrawer
        explanation={selectedExplanation}
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
      />
    </div>
  );
}
