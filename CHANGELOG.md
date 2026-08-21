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

