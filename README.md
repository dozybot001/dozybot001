# Zeng Deyang

**AI Agent Platform Engineer**

I build agent systems that survive contact with real workflows: operable, auditable, recoverable, and bounded by explicit permissions.

> 我关注的不只是 Agent 能否完成一次任务，而是它能否被安全地创建、授权、协作、恢复并长期运营。

[Resume](https://resume.tenon.asia/) · [AgentHub live instance](https://agenthub.tenon.asia/) · [Email](mailto:deyang4910@163.com)

## What I build

My work sits between AI agents, backend platforms, and product engineering. I care about the less glamorous layers that turn model capability into a dependable system: identity, authorization, state ownership, human-in-the-loop operations, delivery, observability, and failure recovery.

### Production systems

The production figures below use a **2026-07-30** evidence snapshot.

**AgentHub — enterprise Agent Control Plane**<br>
Built an enterprise control plane from zero to one during my internship, covering agent identity, ownership, token-first authorization, sessions, A2A collaboration, deployment, upgrades, and retirement. The production platform managed **83 agents for 52 owners** and exposed **99 governed operations** at the recorded snapshot. The [public instance](https://agenthub.tenon.asia/) is an independently rebuilt deployment for demonstration, not the company production environment.

**SimReadyGen — AI 3D asset generation SaaS**<br>
Led the productization of the customer Web app, Task Center, and central backend in a 22-day delivery window. The system connected payment, task orchestration, automated providers, human annotation and quality control, recovery, and asset delivery; it supported a SIGGRAPH 2026 Los Angeles launch and had recorded **175 external accounts, 29 paying users, and 66 completed deliveries**.

**BatchRefresh — production data reprocessing platform**<br>
Turned high-risk manual scripts into a controlled workflow with preview, confirmation, pause/resume, bounded concurrency, recovery, and audit trails. It processed **771 batches and 7.639 million task records**; on a production sample, submission startup throughput increased from roughly **200 to 2,562 operations per minute**.

Detailed scope, evidence dates, and metric definitions are kept in my [versioned resume](https://resume.tenon.asia/).

## Open products

### [Intent](https://github.com/dozybot001/Intent) — semantic history above Git

Git preserves code changes, but not the goal, reasoning, and durable decisions behind an agent-driven project. Intent adds three explicit objects—Intent, Snap, and Decision—plus a low-interruption record/recovery protocol. It is designed to make project continuation useful without turning every conversation into permanent noise. [Showcase](https://dozybot001.github.io/Intent/)

### [MAARS](https://github.com/dozybot001/MAARS) — recoverable multi-agent research

MAARS turns an open-ended research request into a persistent Research Run: refine the question, execute isolated research tasks, preserve artifacts, verify outputs, and produce a reviewable paper. The open-source core and the [hosted product](https://maars.tenon.asia/) explore how long-running agent work can become recoverable and deliverable instead of remaining a one-off chat session.

### [WeSaid](https://github.com/dozybot001/WeSaid) — safety through product mechanics

An iPhone-first, one-to-one secret exchange product built around equality rather than unilateral disclosure. Private wish pools, mutual matching, dual acceptance, transactional reveal, revocation windows, and encrypted final snapshots make the safety model part of the interaction itself. The [Web product](https://wesaid.tenon.asia/) is live; the iOS client and Apple-based identity flow are implemented, with App Store distribution in progress.

### [AI Cultivation](https://github.com/dozybot001/ai-cultivation) — from assistant to accountable proxy

A practical framework for cultivating AI from a temporary helper into a reusable, auditable, and explicitly authorized personal proxy. It connects methods, skills, trust boundaries, and real-world delegation under one deliberately opinionated system.

## Engineering principles

- **Capability is only the beginning.** Identity, permissions, state, and recovery determine whether an agent can enter a real workflow.
- **One truth, explicit boundaries.** Ownership and lifecycle state belong on the server; projections and clients must not silently redefine them.
- **Human intervention is a product path.** HITL work needs queues, claim/release semantics, quality control, escalation, and a route back into automation.
- **A release should be reproducible.** I prefer commit-exact builds, immutable artifacts, candidate slots, public acceptance, and rollback over production-side improvisation.
- **Safety can be interaction design.** The strongest guardrail is often a mechanism users can understand, not another paragraph in a policy page.

## Background

- M.Sc. candidate in Signal Processing and Machine Learning, Nanyang Technological University · expected Dec 2026
- B.Eng. in Electrical Engineering, Shanghai Jiao Tong University
- Based in Singapore · Open to AI Agent Platform / AI Infrastructure / Backend Platform roles in China

If you want to discuss agent platforms, durable agent workflows, or product systems with unusual constraints, reach me at [deyang4910@163.com](mailto:deyang4910@163.com).
