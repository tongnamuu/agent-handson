import {
  calculatorTool,
  executeCalculatorTool,
  validateCalculatorInput,
} from "./tools/calculator";

export type ToolCall = {
    function: {
        name: string;
        arguments: Record<string, unknown>;
    }
}

export type ToolSchema = {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: object
    };
}

type RegisteredTool = {
  schema: ToolSchema;
  execute: (toolCall: ToolCall) => string;
  validateInput?: (input: string) => void;
};

const registeredTools: RegisteredTool[] = [
  {
    schema: calculatorTool,
    execute: executeCalculatorTool,
    validateInput: validateCalculatorInput,
  },
];

export const tools: ToolSchema[] = registeredTools.map(({ schema }) => schema);

export function executeTool(toolCall: ToolCall): string {
  const registeredTool = registeredTools.find(
    ({ schema }) => schema.function.name === toolCall.function.name,
  );

  if (!registeredTool) {
    throw new Error(`알 수 없는 도구입니다: ${toolCall.function.name}`);
  }

  return registeredTool.execute(toolCall);
}

export function validateToolInput(input: string): void {
  for (const registeredTool of registeredTools) {
    registeredTool.validateInput?.(input);
  }
}
