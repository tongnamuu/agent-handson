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
