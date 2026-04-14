import { TodoApp } from "@/features/todos/TodoApp";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <TodoApp />
    </main>
  );
}
