# agent-handson

Ollama의 `qwen3:8b` 모델과 TypeScript로 구현한 콘솔 채팅 에이전트입니다. 사칙연산과 현재 날짜 조회를 도구 호출로 처리합니다.

## 개발 환경

- Node.js `v22.13.0`
- Ollama
- `qwen3:8b`

## 설치

프로젝트의 Node.js 버전을 적용합니다. NVM을 사용한다면 다음 명령으로 `.nvmrc`에 고정된 `v22.13.0`을 설치하고 선택할 수 있습니다.

```bash
nvm install
nvm use
```

Node.js 패키지를 설치합니다.

```bash
npm install
```

Ollama가 설치되어 있지 않다면 [Ollama 공식 사이트](https://ollama.com/download)에서 먼저 설치합니다. 이후 프로젝트에서 사용하는 모델을 내려받습니다.

```bash
ollama pull qwen3:8b
```

## Ollama 기동

터미널에서 Ollama 서버를 실행합니다.

```bash
ollama serve
```

이 명령은 포그라운드에서 실행되므로 터미널을 열어둡니다. macOS용 Ollama 앱이 이미 실행 중이라면 별도로 `ollama serve`를 실행하지 않아도 됩니다.

다른 터미널에서 채팅 프로그램을 실행합니다.

```bash
npx tsx src/main.ts
```

채팅을 끝내려면 `exit`를 입력합니다.

## Ollama 종료와 메모리 해제

현재 메모리에 로드된 모델을 확인합니다.

```bash
ollama ps
```

`qwen3:8b`가 사용하는 메모리만 즉시 해제하려면 다음 명령을 실행합니다.

```bash
ollama stop qwen3:8b
```

이 명령은 내려받은 모델 파일을 삭제하지 않습니다. 다음 채팅 요청이 들어오면 모델이 다시 로드됩니다.

`ollama serve`로 실행한 서버 자체를 종료하려면 서버가 실행 중인 터미널에서 `Ctrl+C`를 누릅니다. macOS용 Ollama 앱으로 실행했다면 메뉴 막대의 Ollama 아이콘에서 `Quit Ollama`를 선택합니다.

## 환경 변수

기본 모델과 Ollama 서버 주소는 환경 변수로 변경할 수 있습니다.

```bash
OLLAMA_MODEL=qwen3:8b OLLAMA_HOST=http://localhost:11434 npx tsx src/main.ts
```

환경 변수를 지정하지 않으면 `qwen3:8b`와 `http://localhost:11434`를 사용합니다.

## Codex 개발 환경 스킬

이 저장소에는 반복 가능한 개발 환경 준비 절차를 정의한 `start-dev-env` 스킬이 포함되어 있습니다. Codex 채팅에서 다음과 같이 요청하면 스킬이 실행됩니다.

```text
개발환경 기동해줘
```

명시적으로 실행하려면 스킬 이름을 함께 입력합니다.

```text
$start-dev-env를 사용해서 개발환경을 기동해줘
```

스킬은 다음 작업을 순서대로 수행합니다.

1. Ollama 서버 상태를 확인하고, 꺼져 있으면 백그라운드에서 실행합니다.
2. `qwen3:8b` 모델을 확인하고, 없으면 다운로드합니다.
3. Node.js가 `.nvmrc`의 `v22.13.0`과 일치하는지 확인합니다.
4. Node.js 의존성을 확인하고, 없으면 설치합니다.
5. TypeScript 검사를 실행합니다.

스킬로 실행한 개발 환경을 종료하려면 다음 명령을 사용합니다.

```bash
bash .agents/skills/start-dev-env/scripts/stop.sh
```

종료 스크립트는 `qwen3:8b` 모델의 메모리를 해제하고, 이 스킬이 직접 시작한 Ollama 서버만 종료합니다. 기존에 macOS 앱이나 다른 터미널에서 실행 중이던 Ollama 서버는 종료하지 않습니다.
