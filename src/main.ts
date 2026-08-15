import process from "node:process";
import { createInterface } from "node:readline/promises";

import { chatLLM, type OllamaMessage } from "./api";
import type { ToolCall } from "./tools";
import {
  calculatorTool,
  executeCalculatorTool,
  validateParentheses,
} from "./tools/calculator";

const MAX_TOOL_ROUNDS = 5;

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
      "괄호를 포함한 사칙연산은 직접 계산하지 말고 반드시 calculate_expression 도구를 사용하세요.",
      "수식이 잘못되어 보여도 임의로 고치거나 추측하지 말고 사용자가 입력한 수식을 그대로 도구에 전달하세요.",
    ].join(" "),
  },
];

function looksLikeArithmetic(input: string): boolean {
  return /\d/.test(input) && /[+\-*/]/.test(input);
}

function runTool(toolCall: ToolCall): string {
  try {
    return executeCalculatorTool(toolCall);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `도구 실행 오류: ${message}`;
  }
}

async function runAgent(): Promise<OllamaMessage> {
  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const responseMessage = await chatLLM(messages, [calculatorTool]);
    messages.push(responseMessage);

    const toolCalls = responseMessage.tool_calls ?? [];
    if (toolCalls.length === 0) {
      return responseMessage;
    }

    for (const toolCall of toolCalls) {
      const toolResult = runTool(toolCall);
      console.log(`Tool: ${toolCall.function.name} -> ${toolResult}`);

      messages.push({
        role: "tool",
        tool_name: toolCall.function.name,
        content: toolResult,
      });
    }
  }

  throw new Error("도구 호출 횟수 제한을 초과했습니다.");
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

    if (looksLikeArithmetic(input)) {
      try {
        validateParentheses(input);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`계산 오류: ${message}`);
        continue;
      }
    }

    messages.push({ role: "user", content: input });

    const responseMessage = await runAgent();

    console.log(`Assistant: ${responseMessage.content}`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to call Ollama: ${message}`);
  process.exitCode = 1;
} finally {
  readline.close();
}
