"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { CheckCircle2, Circle, ListTodo, Plus, Trash2 } from "lucide-react";
import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";

import { updateTodosAction } from "@/features/todos/actions";
import type { TodoFilter } from "@/features/todos/types";
import {
  addTodoFormSchema,
  formatTodoTimestamp,
  getTodoCounts,
  getVisibleTodos,
  initialTodoActionState,
  parseTodos,
  serializeTodos,
} from "@/features/todos/utils";

const filterOptions: TodoFilter[] = ["all", "active", "completed"];
const storageKey = "dependabot-bypass-test.todos";

type AddTodoFields = {
  title: string;
};

export function TodoApp() {
  const [serverState, dispatchTodoAction, isServerPending] = useActionState(
    updateTodosAction,
    initialTodoActionState,
  );
  const [todos, setTodos] = useState(initialTodoActionState.todos);
  const [error, setError] = useState<string | null>(
    initialTodoActionState.error,
  );
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isTransitionPending, startTransition] = useTransition();
  const isFirstServerState = useRef(true);

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<AddTodoFields>({
    defaultValues: {
      title: "",
    },
    resolver: zodResolver(addTodoFormSchema),
  });

  useEffect(() => {
    const storedTodos = window.localStorage.getItem(storageKey);

    if (storedTodos) {
      setTodos(parseTodos(storedTodos));
    }

    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (isFirstServerState.current) {
      isFirstServerState.current = false;
      return;
    }

    setTodos(serverState.todos);
    setError(serverState.error);
  }, [serverState]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.localStorage.setItem(storageKey, serializeTodos(todos));
  }, [hasHydrated, todos]);

  const counts = useMemo(() => getTodoCounts(todos), [todos]);
  const visibleTodos = useMemo(
    () => getVisibleTodos(todos, filter),
    [filter, todos],
  );
  const serializedTodos = useMemo(() => serializeTodos(todos), [todos]);
  const isPending = isServerPending || isTransitionPending;

  const onSubmit = handleSubmit(({ title }) => {
    const formData = new FormData();
    formData.set("intent", "add");
    formData.set("title", title);
    formData.set("todos", serializedTodos);

    startTransition(() => {
      dispatchTodoAction(formData);
    });

    reset();
  });

  function submitMutation(intent: "toggle" | "delete", todoId: string) {
    const formData = new FormData();
    formData.set("intent", intent);
    formData.set("todoId", todoId);
    formData.set("todos", serializedTodos);

    startTransition(() => {
      dispatchTodoAction(formData);
    });
  }

  return (
    <section className="w-full max-w-4xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur sm:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium tracking-wide text-cyan-200 uppercase">
              <ListTodo className="h-3.5 w-3.5" />
              Server action demo
            </span>
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Tiny TODOs, suspiciously polished
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Add tasks, flip them complete, and keep them around in local
                storage while server actions validate each mutation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
            <StatCard label="All" value={counts.all} />
            <StatCard label="Active" value={counts.active} />
            <StatCard label="Done" value={counts.completed} />
          </div>
        </div>

        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="todo-title">
            Add a task
          </label>
          <input
            {...register("title")}
            id="todo-title"
            autoComplete="off"
            className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/30"
            placeholder="Ship the old dependency chaos"
          />
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-400/60"
            disabled={isPending}
            type="submit"
          >
            <Plus className="h-4 w-4" />
            {isPending ? "Working..." : "Add task"}
          </button>
        </form>

        {errors.title ? (
          <p className="text-sm text-rose-300">{errors.title.message}</p>
        ) : null}

        {error ? <p className="text-sm text-amber-200">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option}
              className={clsx(
                "rounded-full px-4 py-2 text-sm font-medium capitalize transition",
                filter === option
                  ? "bg-white text-slate-950"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10",
              )}
              onClick={() => setFilter(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {visibleTodos.length > 0 ? (
            visibleTodos.map((todo) => (
              <article
                key={todo.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <button
                    aria-label={
                      todo.completed
                        ? "Mark task as active"
                        : "Mark task as completed"
                    }
                    className="mt-0.5 text-cyan-300 transition hover:text-cyan-200"
                    onClick={() => submitMutation("toggle", todo.id)}
                    type="button"
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>

                  <div className="min-w-0 space-y-1">
                    <p
                      className={clsx(
                        "break-words text-base text-white",
                        todo.completed && "text-slate-400 line-through",
                      )}
                    >
                      {todo.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      Added {formatTodoTimestamp(todo.createdAt)}
                    </p>
                  </div>
                </div>

                <button
                  className="inline-flex items-center gap-2 self-start rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-100 transition hover:bg-rose-400/20 sm:self-center"
                  onClick={() => submitMutation("delete", todo.id)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-5 py-12 text-center">
              <p className="text-base font-medium text-white">
                {hasHydrated
                  ? "Nothing here yet."
                  : "Loading your local tasks..."}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Add a task above and it will be filtered, validated, and saved
                in your browser.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-900/80 px-4 py-3">
      <p className="text-xs tracking-wide text-slate-400 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
