import { FormEvent, useEffect, useMemo, useState } from 'react';

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

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

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const remainingCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos],
  );

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

        {todos.length === 0 ? (
          <div className="empty-state" role="status">
            <strong>Your list is empty.</strong>
            <span>Add a task to get started.</span>
          </div>
        ) : (
          <ul className="todo-list" aria-label="Todo items">
            {todos.map((todo) => (
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
