import type { ToolCall, ToolSchema } from "../tools";

const TOOL_NAME = "get_current_date";
const DEFAULT_TIME_ZONE = "Asia/Seoul";

export const currentDateTool: ToolSchema = {
  type: "function",
  function: {
    name: TOOL_NAME,
    description:
      "현재 날짜를 확인해야 할 때 반드시 사용하는 도구입니다. 지정한 시간대의 실제 날짜를 반환합니다.",
    parameters: {
      type: "object",
      required: [],
      properties: {
        timeZone: {
          type: "string",
          description:
            "날짜를 확인할 IANA 시간대입니다. 생략하면 Asia/Seoul을 사용합니다. 예: Asia/Seoul, America/New_York",
        },
      },
    },
  },
};

export interface CurrentDateResult {
  date: string;
  timeZone: string;
}

export function getCurrentDate(
  timeZone = DEFAULT_TIME_ZONE,
  now = new Date(),
): CurrentDateResult {
  let parts: Intl.DateTimeFormatPart[];

  try {
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
  } catch {
    throw new Error(`올바르지 않은 시간대입니다: ${timeZone}`);
  }

  const getPart = (type: Intl.DateTimeFormatPartTypes): string => {
    const value = parts.find((part) => part.type === type)?.value;
    if (!value) {
      throw new Error(`날짜의 ${type} 값을 확인할 수 없습니다.`);
    }
    return value;
  };

  const year = getPart("year");
  const month = getPart("month");
  const day = getPart("day");

  return {
    date: `${year}-${month}-${day}`,
    timeZone,
  };
}

export function executeCurrentDateTool(toolCall: ToolCall): string {
  if (toolCall.function.name !== TOOL_NAME) {
    throw new Error(`알 수 없는 도구입니다: ${toolCall.function.name}`);
  }

  const { timeZone } = toolCall.function.arguments;
  if (timeZone !== undefined && typeof timeZone !== "string") {
    throw new Error("timeZone 인자는 문자열이어야 합니다.");
  }

  return JSON.stringify(getCurrentDate(timeZone));
}
