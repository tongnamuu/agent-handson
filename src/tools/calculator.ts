import type { ToolCall, ToolSchema } from "../tools";

const TOOL_NAME = "calculate_expression";

export const calculatorTool: ToolSchema = {
  type: "function",
  function: {
    name: TOOL_NAME,
    description:
      "괄호와 덧셈, 뺄셈, 곱셈, 나눗셈 수식을 계산할 때 반드시 사용하는 도구입니다.",
    parameters: {
      type: "object",
      required: ["expression"],
      properties: {
        expression: {
          type: "string",
          description:
            "사용자가 입력한 형태를 수정하지 않고 그대로 전달한 계산식입니다. 예: (1+2)*3/2*10",
        },
      },
    },
  },
};

class ExpressionParser {
  private position = 0;

  constructor(private readonly expression: string) {}

  parse(): number {
    const result = this.parseExpression();
    this.skipWhitespace();

    if (this.position !== this.expression.length) {
      if (this.expression[this.position] === ")") {
        throw new Error("여는 괄호가 없는 닫는 괄호가 있습니다.");
      }
      throw new Error(`허용되지 않은 문자: ${this.expression[this.position]}`);
    }

    if (!Number.isFinite(result)) {
      throw new Error("계산 결과가 유효한 숫자가 아닙니다.");
    }

    return result;
  }

  private parseExpression(): number {
    let result = this.parseTerm();

    while (true) {
      if (this.consume("+")) {
        result += this.parseTerm();
      } else if (this.consume("-")) {
        result -= this.parseTerm();
      } else {
        return result;
      }
    }
  }

  private parseTerm(): number {
    let result = this.parseUnary();

    while (true) {
      if (this.consume("*")) {
        result *= this.parseUnary();
      } else if (this.consume("/")) {
        const divisor = this.parseUnary();
        if (divisor === 0) {
          throw new Error("0으로 나눌 수 없습니다.");
        }
        result /= divisor;
      } else {
        return result;
      }
    }
  }

  private parseUnary(): number {
    if (this.consume("+")) {
      return this.parseUnary();
    }

    if (this.consume("-")) {
      return -this.parseUnary();
    }

    return this.parsePrimary();
  }

  private parsePrimary(): number {
    if (this.consume("(")) {
      const result = this.parseExpression();
      if (!this.consume(")")) {
        throw new Error("닫는 괄호가 필요합니다.");
      }
      return result;
    }

    return this.parseNumber();
  }

  private parseNumber(): number {
    this.skipWhitespace();
    const remaining = this.expression.slice(this.position);
    const match = remaining.match(/^(?:\d+(?:\.\d*)?|\.\d+)/);

    if (!match) {
      throw new Error(`숫자가 필요합니다: ${remaining || "수식 끝"}`);
    }

    this.position += match[0].length;
    return Number(match[0]);
  }

  private consume(character: string): boolean {
    this.skipWhitespace();
    if (this.expression[this.position] !== character) {
      return false;
    }

    this.position += 1;
    return true;
  }

  private skipWhitespace(): void {
    while (/\s/.test(this.expression[this.position] ?? "")) {
      this.position += 1;
    }
  }
}

export function calculateExpression(expression: string): number {
  if (!expression.trim()) {
    throw new Error("계산할 수식이 비어 있습니다.");
  }

  validateParentheses(expression);
  return new ExpressionParser(expression).parse();
}

export function validateParentheses(expression: string): void {
  let depth = 0;

  for (const character of expression) {
    if (character === "(") {
      depth += 1;
    } else if (character === ")") {
      depth -= 1;
      if (depth < 0) {
        throw new Error("여는 괄호가 없는 닫는 괄호가 있습니다.");
      }
    }
  }

  if (depth > 0) {
    throw new Error("닫는 괄호가 필요합니다.");
  }
}

export function validateCalculatorInput(input: string): void {
  const looksLikeArithmetic = /\d/.test(input) && /[+\-*/]/.test(input);
  if (looksLikeArithmetic) {
    validateParentheses(input);
  }
}

export function executeCalculatorTool(toolCall: ToolCall): string {
  if (toolCall.function.name !== TOOL_NAME) {
    throw new Error(`알 수 없는 도구입니다: ${toolCall.function.name}`);
  }

  const expression = toolCall.function.arguments.expression;
  if (typeof expression !== "string") {
    throw new Error("expression 인자는 문자열이어야 합니다.");
  }

  return String(calculateExpression(expression));
}
