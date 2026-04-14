import { formatDistanceToNow } from "date-fns";
import { nanoid } from "nanoid";
import { z } from "zod";

import type {
  TodoActionState,
  TodoFilter,
  TodoItem,
} from "@/features/todos/types";

export const todoTitleSchema = z
  .string()
  .trim()
  .min(1, "Please enter a task.")
  .max(80, "Keep each task under 80 characters.");

export const addTodoFormSchema = z.object({
  title: todoTitleSchema,
});

export const todoItemSchema = z.object({
  id: z.string().min(1),
  title: todoTitleSchema,
  completed: z.boolean(),
  createdAt: z.string().datetime(),
});

export const todoItemsSchema = z.array(todoItemSchema).max(100);

export const initialTodoActionState: TodoActionState = {
  todos: [],
  error: null,
};

export function createTodo(title: string): TodoItem {
  return {
    id: nanoid(10),
    title: todoTitleSchema.parse(title),
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

export function addTodo(todos: TodoItem[], title: string): TodoItem[] {
  return [createTodo(title), ...todos];
}

export function toggleTodo(todos: TodoItem[], todoId: string): TodoItem[] {
  return todos.map((todo) =>
    todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
  );
}

export function removeTodo(todos: TodoItem[], todoId: string): TodoItem[] {
  return todos.filter((todo) => todo.id !== todoId);
}

export function getVisibleTodos(
  todos: TodoItem[],
  filter: TodoFilter,
): TodoItem[] {
  if (filter === "active") {
    return todos.filter((todo) => !todo.completed);
  }

  if (filter === "completed") {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

export function getTodoCounts(todos: TodoItem[]) {
  const completed = todos.filter((todo) => todo.completed).length;

  return {
    all: todos.length,
    active: todos.length - completed,
    completed,
  };
}

export function serializeTodos(todos: TodoItem[]): string {
  return JSON.stringify(todos);
}

export function parseTodos(
  value: FormDataEntryValue | null | undefined,
): TodoItem[] {
  if (typeof value !== "string" || value.length === 0) {
    return [];
  }

  try {
    return todoItemsSchema.parse(JSON.parse(value));
  } catch {
    return [];
  }
}

export function formatTodoTimestamp(createdAt: string): string {
  return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
}
