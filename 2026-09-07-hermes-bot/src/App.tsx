import { FormEvent, useEffect, useMemo, useState } from 'react';

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

type TodoFilter = 'all' | 'active' | 'completed';

const FILTERS: { label: string; value: TodoFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

const STORAGE_KEY = 'hermes-bot-todos';

function loadTodos(): Todo[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as Todo[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (todo): todo is Todo =>
        typeof todo?.id === 'string' &&
        typeof todo?.text === 'string' &&
        typeof todo?.completed === 'boolean',
    );
  } catch {
    return [];
  }
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState<TodoFilter>('all');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const remainingCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos],
  );

  const visibleTodos = useMemo(() => {
    if (filter === 'active') {
      return todos.filter((todo) => !todo.completed);
    }

    if (filter === 'completed') {
      return todos.filter((todo) => todo.completed);
    }

    return todos;
  }, [filter, todos]);

  const emptyMessage = useMemo(() => {
    if (todos.length === 0) {
      return {
        title: 'Your list is empty.',
        detail: 'Add a task to get started.',
      };
    }

    if (filter === 'active') {
      return {
        title: 'No active tasks.',
        detail: 'Completed tasks are hidden by this filter.',
      };
    }

    return {
      title: 'No completed tasks.',
      detail: 'Finish a task to see it here.',
    };
  }, [filter, todos.length]);

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = newTodo.trim();

    if (!text) {
      return;
    }

    setTodos((currentTodos) => [
      ...currentTodos,
      {
        id: crypto.randomUUID(),
        text,
        completed: false,
      },
    ]);
    setNewTodo('');
  }

  function toggleTodo(id: string) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  function deleteTodo(id: string) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  }

  return (
    <main className="app-shell">
      <section className="todo-card" aria-labelledby="todo-title">
        <p className="eyebrow">In-browser MVP</p>
        <h1 id="todo-title">Todo List</h1>
        <p className="summary" aria-live="polite">
          {todos.length === 0
            ? 'No tasks yet.'
            : `${remainingCount} of ${todos.length} task${todos.length === 1 ? '' : 's'} remaining.`}
        </p>

        <form className="todo-form" onSubmit={addTodo} aria-label="Add a todo">
          <label className="sr-only" htmlFor="new-todo">
            New todo
          </label>
          <input
            id="new-todo"
            value={newTodo}
            onChange={(event) => setNewTodo(event.target.value)}
            placeholder="Add a task..."
            autoComplete="off"
          />
          <button type="submit">Add task</button>
        </form>

        <div className="filter-controls" aria-label="Filter todos">
          {FILTERS.map((todoFilter) => (
            <button
              type="button"
              key={todoFilter.value}
              aria-pressed={filter === todoFilter.value}
              onClick={() => setFilter(todoFilter.value)}
            >
              {todoFilter.label}
            </button>
          ))}
        </div>

        {visibleTodos.length === 0 ? (
          <div className="empty-state" role="status">
            <strong>{emptyMessage.title}</strong>
            <span>{emptyMessage.detail}</span>
          </div>
        ) : (
          <ul className="todo-list" aria-label="Todo items">
            {visibleTodos.map((todo) => (
              <li
                className={todo.completed ? 'todo-item completed' : 'todo-item'}
                key={todo.id}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    aria-label={`Mark ${todo.text} as ${todo.completed ? 'incomplete' : 'complete'}`}
                  />
                  <span>{todo.text}</span>
                </label>
                <button
                  className="delete-button"
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label={`Delete ${todo.text}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
