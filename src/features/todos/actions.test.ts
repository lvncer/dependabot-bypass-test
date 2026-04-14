import { describe, expect, it } from "vitest";

import { updateTodosAction } from "@/features/todos/actions";
import { initialTodoActionState, serializeTodos } from "@/features/todos/utils";

const sampleTodos = [
  {
    id: "alpha",
    title: "First task",
    completed: false,
    createdAt: "2026-04-14T00:00:00.000Z",
  },
  {
    id: "beta",
    title: "Second task",
    completed: true,
    createdAt: "2026-04-14T00:05:00.000Z",
  },
];

function createFormData(
  entries: Record<string, string>,
  todos = serializeTodos(sampleTodos),
) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  formData.set("todos", todos);

  return formData;
}

describe("updateTodosAction", () => {
  it("adds a todo from valid input", async () => {
    const result = await updateTodosAction(
      initialTodoActionState,
      createFormData({
        intent: "add",
        title: "Write action tests",
      }),
    );

    expect(result.error).toBeNull();
    expect(result.todos).toHaveLength(3);
    expect(result.todos[0]?.title).toBe("Write action tests");
  });

  it("toggles an existing todo", async () => {
    const result = await updateTodosAction(
      initialTodoActionState,
      createFormData({
        intent: "toggle",
        todoId: "alpha",
      }),
    );

    expect(result.todos[0]?.completed).toBe(true);
  });

  it("deletes an existing todo", async () => {
    const result = await updateTodosAction(
      initialTodoActionState,
      createFormData({
        intent: "delete",
        todoId: "beta",
      }),
    );

    expect(result.todos).toHaveLength(1);
    expect(result.todos[0]?.id).toBe("alpha");
  });

  it("returns an error for invalid payloads", async () => {
    const result = await updateTodosAction(
      initialTodoActionState,
      createFormData({
        intent: "add",
        title: "   ",
      }),
    );

    expect(result.error).toBe("That action payload was invalid.");
    expect(result.todos).toEqual(sampleTodos);
  });
});
