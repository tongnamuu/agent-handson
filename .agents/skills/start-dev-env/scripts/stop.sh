#!/usr/bin/env bash

set -euo pipefail

OLLAMA_MODEL_NAME="qwen3:8b"
OLLAMA_API_URL="${OLLAMA_HOST:-http://127.0.0.1:11434}"
DEV_RUNTIME_DIR="${TMPDIR:-/tmp}/agent-handson-ollama"
OLLAMA_PID_FILE="${DEV_RUNTIME_DIR}/server.pid"

if [[ "${OLLAMA_API_URL}" != http://* && "${OLLAMA_API_URL}" != https://* ]]; then
  OLLAMA_API_URL="http://${OLLAMA_API_URL}"
fi

if curl --fail --silent --show-error "${OLLAMA_API_URL}/api/tags" >/dev/null 2>&1; then
  ollama stop "${OLLAMA_MODEL_NAME}" >/dev/null 2>&1 || true
  echo "Ollama 모델: ${OLLAMA_MODEL_NAME} 메모리 해제 요청 완료"
fi

if [[ ! -f "${OLLAMA_PID_FILE}" ]]; then
  echo "Ollama 서버: 이 스킬이 시작한 서버가 없습니다."
  exit 0
fi

OLLAMA_SERVER_PID="$(<"${OLLAMA_PID_FILE}")"
if [[ ! "${OLLAMA_SERVER_PID}" =~ ^[0-9]+$ ]]; then
  echo "오류: Ollama PID 파일의 값이 올바르지 않습니다."
  exit 1
fi

OLLAMA_SERVER_COMMAND="$(ps -p "${OLLAMA_SERVER_PID}" -o command= 2>/dev/null || true)"
if [[ "${OLLAMA_SERVER_COMMAND}" == *"ollama serve"* ]]; then
  kill "${OLLAMA_SERVER_PID}"
  echo "Ollama 서버: 종료 완료 (PID ${OLLAMA_SERVER_PID})"
else
  echo "Ollama 서버: 스킬이 시작한 프로세스가 이미 종료되었습니다."
fi

rm -f "${OLLAMA_PID_FILE}"
