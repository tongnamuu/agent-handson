import process from "node:process";
import { createInterface } from "node:readline/promises";

import { chatLLM, type OllamaMessage } from "./api";

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});
const messages: OllamaMessage[] = [
  {
    role: "system",
    content: [
      "당신은 한국어 전용 AI 어시스턴트입니다.",
      "모든 답변은 반드시 자연스러운 한국어로만 작성하세요.",
      "중국어 문자, 중국어 단어, 영어를 답변에 절대 포함하지 마세요.",
      "질문이 모호하거나 정보가 부족하면 한국어로만 추가 설명을 요청하세요.",
    ].join(" "),
  },
];

console.log("Ollama chat started. Type 'exit' to quit.");

try {
  while (true) {
    const input = (await readline.question("You: ")).trim();

    if (input.toLowerCase() === "exit") {
      break;
    }

    if (!input) {
      continue;
    }

    messages.push({ role: "user", content: input });

    const responseMessage = await chatLLM(messages);
    messages.push(responseMessage);

    console.log(`Assistant: ${responseMessage.content}`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to call Ollama: ${message}`);
  process.exitCode = 1;
} finally {
  readline.close();
}
