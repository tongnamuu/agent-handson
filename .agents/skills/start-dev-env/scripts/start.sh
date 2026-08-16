#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(git rev-parse --show-toplevel)"
EXPECTED_NODE_VERSION="$(<"${PROJECT_ROOT}/.nvmrc")"
OLLAMA_MODEL_NAME="qwen3:8b"
OLLAMA_API_URL="${OLLAMA_HOST:-http://127.0.0.1:11434}"
DEV_RUNTIME_DIR="${TMPDIR:-/tmp}/agent-handson-ollama"
OLLAMA_PID_FILE="${DEV_RUNTIME_DIR}/server.pid"
OLLAMA_LOG_FILE="${DEV_RUNTIME_DIR}/server.log"

if ! command -v node >/dev/null 2>&1; then
  echo "오류: Node.js가 설치되어 있지 않습니다."
  exit 1
fi

ACTUAL_NODE_VERSION="$(node --version)"
if [[ "${ACTUAL_NODE_VERSION}" != "${EXPECTED_NODE_VERSION}" ]]; then
  echo "오류: Node.js 버전이 일치하지 않습니다."
  echo "필요 버전: ${EXPECTED_NODE_VERSION}"
  echo "현재 버전: ${ACTUAL_NODE_VERSION}"
  echo "nvm install && nvm use 명령으로 프로젝트 버전을 적용하세요."
  exit 1
fi

echo "Node.js 버전: ${ACTUAL_NODE_VERSION}"

if [[ "${OLLAMA_API_URL}" != http://* && "${OLLAMA_API_URL}" != https://* ]]; then
  OLLAMA_API_URL="http://${OLLAMA_API_URL}"
fi

if ! command -v ollama >/dev/null 2>&1; then
  echo "오류: Ollama가 설치되어 있지 않습니다."
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "오류: curl을 찾을 수 없습니다."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "오류: npm을 찾을 수 없습니다."
  exit 1
fi

cd "${PROJECT_ROOT}"

if curl --fail --silent --show-error "${OLLAMA_API_URL}/api/tags" >/dev/null 2>&1; then
  echo "Ollama 서버: 이미 실행 중"
else
  mkdir -p "${DEV_RUNTIME_DIR}"
  nohup ollama serve >"${OLLAMA_LOG_FILE}" 2>&1 &
  OLLAMA_SERVER_PID=$!
  printf '%s\n' "${OLLAMA_SERVER_PID}" >"${OLLAMA_PID_FILE}"

  for _ in {1..30}; do
    if curl --fail --silent --show-error "${OLLAMA_API_URL}/api/tags" >/dev/null 2>&1; then
      echo "Ollama 서버: 기동 완료 (PID ${OLLAMA_SERVER_PID})"
      break
    fi

    if ! kill -0 "${OLLAMA_SERVER_PID}" >/dev/null 2>&1; then
      echo "오류: Ollama 서버가 기동 중 종료되었습니다."
      tail -n 20 "${OLLAMA_LOG_FILE}" || true
      exit 1
    fi

    sleep 1
  done

  if ! curl --fail --silent --show-error "${OLLAMA_API_URL}/api/tags" >/dev/null 2>&1; then
    echo "오류: Ollama 서버가 30초 안에 준비되지 않았습니다."
    exit 1
  fi
fi

if ollama show "${OLLAMA_MODEL_NAME}" >/dev/null 2>&1; then
  echo "Ollama 모델: ${OLLAMA_MODEL_NAME} 준비됨"
else
  echo "Ollama 모델: ${OLLAMA_MODEL_NAME} 다운로드 시작"
  ollama pull "${OLLAMA_MODEL_NAME}"
  echo "Ollama 모델: ${OLLAMA_MODEL_NAME} 다운로드 완료"
fi

if [[ ! -x node_modules/.bin/tsx || ! -x node_modules/.bin/tsc ]]; then
  echo "Node.js 의존성: 설치 시작"
  npm install
else
  echo "Node.js 의존성: 준비됨"
fi

npx tsc --noEmit
echo "TypeScript 검사: 통과"
echo "개발 환경: 기동 완료"
