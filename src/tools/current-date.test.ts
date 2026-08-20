import assert from "node:assert/strict";
import test from "node:test";

import { executeCurrentDateTool, getCurrentDate } from "./current-date";

const fixedNow = new Date("2026-08-16T17:38:00Z");

test("서울 시간의 현재 날짜와 요일을 반환한다", () => {
  assert.deepEqual(getCurrentDate("Asia/Seoul", 0, fixedNow), {
    date: "2026-08-17",
    dayOfWeek: "월요일",
    timeZone: "Asia/Seoul",
    offsetDays: 0,
  });
});

test("offsetDays를 적용한 날짜와 요일을 반환한다", () => {
  assert.deepEqual(getCurrentDate("Asia/Seoul", 1, fixedNow), {
    date: "2026-08-18",
    dayOfWeek: "화요일",
    timeZone: "Asia/Seoul",
    offsetDays: 1,
  });
});

test("offsetDays가 정수가 아니면 도구 실행을 거부한다", () => {
  assert.throws(
    () =>
      executeCurrentDateTool({
        function: {
          name: "get_current_date",
          arguments: { offsetDays: 1.5 },
        },
      }),
    /offsetDays 인자는 -36500부터 36500 사이의 정수여야 합니다/,
  );
});
