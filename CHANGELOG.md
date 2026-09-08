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


---

## [0.2.0-alpha] - 2026-08-28

### Milestone Summary
- Bipartite matching with compatibility scoring, COI filtering, and workload limits.
- SHA-256 canonical graph fingerprinting and mathematical equivalence test harness.

### Added - Backend
- Configured Maven parent multi-module structure binding `dsa-engine` into `api` Spring Boot 3 service.
- Set Java 21 LTS baseline with modern virtual thread readiness.

### Database - Schema
- Created Hibernate JPA entities: `Conference`, `Manuscript`, `Reviewer`, `Topic`, and `ReviewAssignment`.

### Database - Migrations
- Added Flyway migration `V1__init_schema.sql` establishing normalized relational tables, foreign keys, and indexes.

### Database - Performance
- Added B-tree indexes on `manuscripts(track_id, status)` and `users(email, role)`.

### Security - Authentication
- Configured stateless JWT token generation and validation filter.
- Integrated BCrypt hashing with configurable work factor for user credentials.

### Security - RBAC
- Enforced role hierarchy: `SUPER_ADMIN > CONFERENCE_ADMIN > REVIEWER > AUTHOR`.
- Secured API endpoints with method-level `@PreAuthorize` security checks.

### Added - Matching API
- Added `POST /api/v1/matching/simulate` running bipartite flow computation in memory without database mutation.
- Returned candidate assignments with explainability metrics.

### Added - Transactions
- Added `POST /api/v1/matching/commit/{runId}` transactionally persisting generated review assignments with isolation level checks.

### Features - Operations
- Added `POST /api/v1/matching/override` enabling conference chairs to manually reassign reviewers.
- Enforced hard COI check preventing manual assignment to conflicting reviewers.

### Audit & Compliance
- Added `AuditLog` entity capturing actor, target manuscript, old reviewer, new reviewer, and timestamp.


---

## [0.3.0-beta] - 2026-09-03

### Milestone Summary
- Spring Boot 3 REST API with PostgreSQL persistence and Flyway migrations.
- Stateless JWT authentication and comprehensive RBAC security.
- Simulation, transactional commit, and audited manual override workflows.

### Added - Explainability
- Created `GET /api/v1/matching/explain` breaking down topic overlap, matching score, reviewer capacity headroom, and COI clearance proof.

### Docs - Explainability
- Documented how flow path $S \to P_i \to R_j \to T$ is transformed into transparent proof tokens for conference chairs.

### Added - Benchmarks API
- Added `POST /api/v1/benchmarks/scalability` sweeping network sizes from $N=10$ to $N=500$.
- Computed median, p95 execution runtimes, and augmentation counts across algorithm triplets.

### Analytics - Curves
- Added theoretical complexity asymptotic fitting curves ($O(V \cdot E^2)$ and $O(V^2 E)$) against observed nanosecond distributions.

### Added - Analytics
- Added `GET /api/v1/analytics/dashboard` summarizing manuscript submission statuses, review coverage ratio, and reviewer saturation percentiles.

### Metrics - Workload
- Implemented workload Gini coefficient and saturation standard deviation metrics to quantify assignment fairness.

### Added - Frontend
- Initialized Next.js 14 modern frontend with App Router, TypeScript, and React Server Components.
- Configured Tailwind CSS utility styling and custom layout containers.

### UI/UX - Design System
- Established pastel brutalist aesthetic: solid pastel cards, subtle borders, high contrast typography, and interactive lift states.


---

## [0.4.0-beta] - 2026-09-08

### Milestone Summary
- Explainable matching proof endpoints and empirical benchmark laboratory.
- Operations analytics aggregations and Next.js 14 frontend scaffolding.

