import process from "node:process";

interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
}

const ollamaHost = process.env.OLLAMA_HOST ?? "http://localhost:11434";
const model = process.env.OLLAMA_MODEL ?? "qwen2.5";
const userPrompt = process.argv.slice(2).join(" ") || "Who are you?";

async function callOllama(): Promise<string> {
  const response = await fetch(`${ollamaHost}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: userPrompt,
      stream: false,
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${errorBody}`);
  }

  const result = (await response.json()) as OllamaGenerateResponse;
  return result.response;
}

try {
  const answer = await callOllama();
  console.log(answer);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to call Ollama: ${message}`);
  process.exitCode = 1;
}
