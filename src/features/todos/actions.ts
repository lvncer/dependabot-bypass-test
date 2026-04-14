"use server";

import { z } from "zod";

import type { TodoActionState } from "@/features/todos/types";
import {
  addTodo,
  initialTodoActionState,
  parseTodos,
  removeTodo,
  todoTitleSchema,
  toggleTodo,
} from "@/features/todos/utils";

const todoMutationSchema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("add"),
    title: todoTitleSchema,
    todos: z.string().optional(),
  }),
  z.object({
    intent: z.literal("toggle"),
    todoId: z.string().min(1),
    todos: z.string().optional(),
  }),
  z.object({
    intent: z.literal("delete"),
    todoId: z.string().min(1),
    todos: z.string().optional(),
  }),
]);

export async function updateTodosAction(
  previousState: TodoActionState = initialTodoActionState,
  formData: FormData,
): Promise<TodoActionState> {
  const todos = parseTodos(formData.get("todos"));

  const parsed = todoMutationSchema.safeParse({
    intent: formData.get("intent"),
    title: formData.get("title"),
    todoId: formData.get("todoId"),
    todos: formData.get("todos"),
  });

  if (!parsed.success) {
    return {
      todos,
      error: "That action payload was invalid.",
    };
  }

  switch (parsed.data.intent) {
    case "add":
      return {
        todos: addTodo(todos, parsed.data.title),
        error: null,
      };

    case "toggle":
      return {
        todos: toggleTodo(todos, parsed.data.todoId),
        error: null,
      };

    case "delete":
      return {
        todos: removeTodo(todos, parsed.data.todoId),
        error: null,
      };

    default:
      return previousState;
  }
}
