# AllocFlow Changelog

All notable changes, milestone implementations, algorithm specifications, and platform enhancements are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Architecture
- Outlined zero-dependency pure Java 21 architecture for `dsa-engine`.
- Decoupled algorithmic core from Spring Boot and persistence layers.

### Added - Flow Core
- Designed `FlowEdge` with directed residual capacity and reverse edge pointer.
- Designed `FlowNetwork` adjacency list representation for directed residual networks.

### Specifications
- Documented invariant $\sum_{v} f(u, v) = 0$ (flow conservation) for intermediate nodes.
- Added residual capacity equation: $c_f(u, v) = c(u, v) - f(u, v)$.

### Added - Algorithms
- Implemented `FordFulkersonAlgorithm` using depth-first search for augmenting path discovery.
- Documented worst-case time complexity $O(E \cdot |f|)$.

### Testing
- Defined baseline test scenarios: disconnected graphs, zero-capacity bottlenecks, and cyclic residuals.

### Added - Algorithms
- Implemented `EdmondsKarpAlgorithm` using breadth-first search (BFS) on residual network.
- Guaranteed polynomial runtime $O(V \cdot E^2)$ independent of capacity magnitudes.

### Benchmarks - DSA
- Recorded empirical observations comparing DFS path lengths versus BFS shortest path counts.

### Added - Algorithms
- Implemented `DinicAlgorithm` incorporating BFS level-graph construction and DFS blocking flow decomposition.
- Achieved $O(V^2 E)$ general network complexity, reducing to $O(E \sqrt{V})$ on unit bipartite networks.

### Optimizations
- Introduced dynamic `work[]` pointer array to prune dead-end vertices during Dinic DFS blocking flow traversal.


---

## [0.1.0-alpha] - 2026-08-23

### Milestone Summary
- Complete pure Java 21 Max-Flow engine with Ford-Fulkerson, Edmonds-Karp, and Dinic implementations.
- Zero external runtime dependencies in `dsa-engine` module.

### Added - Allocation Core
- Added `BipartiteGraphBuilder` transforming conference submissions and reviewers into an $S \to P \to R \to T$ flow network.
- Configured source-to-paper edges with required review count capacity $k$.

### Features - Allocation
- Added reviewer sink capacities enforcing maximum workload limits per reviewer.
- Enabled uneven reviewer quota distribution.

### Added - Matching
- Designed `CompatibilityCalculator` combining primary topic matching and keyword Jaccard overlap.
- Applied thresholding filters to discard weak candidate edges before residual network construction.

### Security & Integrity
- Formulated zero-COI (Conflict of Interest) guarantees.
- Pruned paper-reviewer edges where co-authorship or institutional affiliation overlaps occur.

### Verification
- Implemented `GraphFingerprint` generating SHA-256 hashes of sorted canonical adjacency structures.
- Verified input graph immutability across sequential algorithm executions.

### Testing - Invariants
- Added `TriAlgorithmEquivalenceTest` verifying:
  $$\text{MaxFlow}_{\text{FF}}(G) = \text{MaxFlow}_{\text{EK}}(G) = \text{MaxFlow}_{\text{Dinic}}(G)$$
  on 500+ randomized synthetic graph instances.

### Added - Tooling
- Implemented `SyntheticDatasetGenerator` parameterizing conference scale: $N$ papers, $M$ reviewers, density $p$, and topic distributions.

### Analytics - Benchmarking
- Configured metrics collector tracking elapsed CPU nanoseconds, total augmenting path iterations, and residual edge traversals.

