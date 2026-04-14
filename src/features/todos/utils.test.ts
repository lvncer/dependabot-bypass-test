import { describe, expect, it } from "vitest";

import {
  addTodo,
  createTodo,
  getTodoCounts,
  getVisibleTodos,
  parseTodos,
  removeTodo,
  serializeTodos,
  toggleTodo,
} from "@/features/todos/utils";

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

describe("todo utilities", () => {
  it("creates a normalized todo item", () => {
    const todo = createTodo("  Ship CI  ");

    expect(todo.id).toHaveLength(10);
    expect(todo.title).toBe("Ship CI");
    expect(todo.completed).toBe(false);
    expect(todo.createdAt).toMatch(/Z$/);
  });

  it("adds a new todo to the front of the list", () => {
    const nextTodos = addTodo(sampleTodos, "Newest task");

    expect(nextTodos).toHaveLength(3);
    expect(nextTodos[0]?.title).toBe("Newest task");
  });

  it("toggles and removes items", () => {
    const toggled = toggleTodo(sampleTodos, "alpha");
    const withoutBeta = removeTodo(toggled, "beta");

    expect(toggled[0]?.completed).toBe(true);
    expect(withoutBeta).toHaveLength(1);
    expect(withoutBeta[0]?.id).toBe("alpha");
  });

  it("filters and counts todos", () => {
    expect(getVisibleTodos(sampleTodos, "active")).toHaveLength(1);
    expect(getVisibleTodos(sampleTodos, "completed")).toHaveLength(1);
    expect(getTodoCounts(sampleTodos)).toEqual({
      all: 2,
      active: 1,
      completed: 1,
    });
  });

  it("serializes and parses stored todos safely", () => {
    expect(parseTodos(serializeTodos(sampleTodos))).toEqual(sampleTodos);
    expect(parseTodos("definitely not json")).toEqual([]);
  });
});
