import process from "node:process";
import { createInterface } from "node:readline/promises";

import { chatLLM, type OllamaMessage } from "./api";
import {
  executeTool,
  tools,
  type ToolCall,
  validateToolInput,
} from "./tools";

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
      "제공된 도구로 처리할 수 있는 요청은 직접 답하지 말고 반드시 해당 도구를 사용하세요.",
      "도구에 전달할 입력은 임의로 고치거나 추측하지 말고 사용자의 입력을 그대로 사용하세요.",
    ].join(" "),
  },
];

function runTool(toolCall: ToolCall): string {
  try {
    return executeTool(toolCall);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `도구 실행 오류: ${message}`;
  }
}

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

    try {
      validateToolInput(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`도구 입력 오류: ${message}`);
      continue;
    }

    messages.push({ role: "user", content: input });

    let responseMessage = await chatLLM(messages, tools);
    messages.push(responseMessage);

    const toolCalls = responseMessage.tool_calls ?? [];
    for (const toolCall of toolCalls) {
      const toolResult = runTool(toolCall);
      console.log(`Tool: ${toolCall.function.name} -> ${toolResult}`);

      messages.push({
        role: "tool",
        tool_name: toolCall.function.name,
        content: toolResult,
      });
    }

    if (toolCalls.length > 0) {
      responseMessage = await chatLLM(messages, tools);
      messages.push(responseMessage);
    }

    console.log(`Assistant: ${responseMessage.content}`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to call Ollama: ${message}`);
  process.exitCode = 1;
} finally {
  readline.close();
}
