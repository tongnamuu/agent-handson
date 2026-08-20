import type { ToolCall, ToolSchema } from "../tools";

const TOOL_NAME = "get_current_date";
const DEFAULT_TIME_ZONE = "Asia/Seoul";

export const currentDateTool: ToolSchema = {
  type: "function",
  function: {
    name: TOOL_NAME,
    description:
      "현재, 어제, 내일 등 상대 날짜나 요일을 확인할 때 반드시 사용하는 도구입니다. 지정한 시간대의 정확한 날짜와 요일을 반환합니다.",
    parameters: {
      type: "object",
      required: [],
      properties: {
        timeZone: {
          type: "string",
          description:
            "날짜를 확인할 IANA 시간대입니다. 생략하면 Asia/Seoul을 사용합니다. 예: Asia/Seoul, America/New_York",
        },
        offsetDays: {
          type: "integer",
          minimum: -36500,
          maximum: 36500,
          description:
            "오늘을 기준으로 이동할 날짜 수입니다. 오늘은 0, 내일은 1, 어제는 -1이며 생략하면 0입니다.",
        },
      },
    },
  },
};

export interface CurrentDateResult {
  date: string;
  dayOfWeek: string;
  timeZone: string;
  offsetDays: number;
}

export function getCurrentDate(
  timeZone = DEFAULT_TIME_ZONE,
  offsetDays = 0,
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
  const targetDate = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day) + offsetDays),
  );
  const targetYear = targetDate.getUTCFullYear();
  const targetMonth = String(targetDate.getUTCMonth() + 1).padStart(2, "0");
  const targetDay = String(targetDate.getUTCDate()).padStart(2, "0");
  const dayOfWeek = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "UTC",
    weekday: "long",
  }).format(targetDate);

  return {
    date: `${targetYear}-${targetMonth}-${targetDay}`,
    dayOfWeek,
    timeZone,
    offsetDays,
  };
}

export function executeCurrentDateTool(toolCall: ToolCall): string {
  if (toolCall.function.name !== TOOL_NAME) {
    throw new Error(`알 수 없는 도구입니다: ${toolCall.function.name}`);
  }

  const { timeZone, offsetDays } = toolCall.function.arguments;
  if (timeZone !== undefined && typeof timeZone !== "string") {
    throw new Error("timeZone 인자는 문자열이어야 합니다.");
  }

  if (
    offsetDays !== undefined &&
    (!Number.isInteger(offsetDays) ||
      Number(offsetDays) < -36500 ||
      Number(offsetDays) > 36500)
  ) {
    throw new Error("offsetDays 인자는 -36500부터 36500 사이의 정수여야 합니다.");
  }

  return JSON.stringify(getCurrentDate(timeZone, Number(offsetDays ?? 0)));
}
