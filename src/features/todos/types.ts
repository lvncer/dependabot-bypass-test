export type TodoFilter = "all" | "active" | "completed";

export type TodoItem = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

export type TodoActionState = {
  todos: TodoItem[];
  error: string | null;
};
