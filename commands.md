```
npm init -y
```

```
npm pkg set type=module
```
- top level await 가능

```
npm i -D tsx typescript @types/node
```


```
ollama pull qwen3:4b
```

```
ollama run qwen3:4b "who are you?"
```

## 대화형 Tool Calling 실행

```bash
npx tsx src/main.ts
```

사칙연산을 입력하면 Ollama가 `calculate_expression` 도구를 호출한다.

```text
You: (1+2)*3/2*10 계산해줘
Tool: calculate_expression -> 45
Assistant: 식 (1+2)*3/2*10의 결과는 45입니다.
```

괄호가 올바르지 않은 수식은 계산하지 않고 오류로 처리한다.

```text
You: (1+2)*3/2*10) 계산해줘
계산 오류: 여는 괄호가 없는 닫는 괄호가 있습니다.
```

- [Ollama Tool Calling 문서](https://docs.ollama.com/capabilities/tool-calling)
