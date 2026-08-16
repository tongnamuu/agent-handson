---
name: start-dev-env
description: "Start and verify this repository's local Ollama qwen3:8b development environment. Use when the user says 개발환경 기동해줘, 개발 환경 시작해줘, Ollama 켜줘, asks to start or prepare the local development environment, or explicitly invokes $start-dev-env. Do not use when the user only wants setup instructions or for production deployments."
---

# Start Development Environment

Prepare the repository with one deterministic script.

1. Run `bash .agents/skills/start-dev-env/scripts/start.sh` from the repository root.
2. Wait for the script to finish. A first-time `qwen3:8b` download can take several minutes.
3. If local-network or process access is blocked by the sandbox, rerun the same script with the required approval.
4. Treat the script output as the source of truth. Do not repeat individual setup commands after it succeeds.
5. Report the Node.js version, Ollama server, model, dependencies, and TypeScript validation status.

Do not launch the interactive `src/main.ts` chat process unless the user also asks to run the application. Do not modify source files, commit, or push as part of environment startup.

To stop a server started by this skill, run `bash .agents/skills/start-dev-env/scripts/stop.sh`. This also requests immediate memory release for `qwen3:8b`.
