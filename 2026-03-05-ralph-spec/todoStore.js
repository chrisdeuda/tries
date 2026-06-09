/**
 * Todo Store - Pure functions for state management
 */

const STORAGE_KEY = 'todo-app-tasks';

/**
 * Load tasks from localStorage
 * @returns {Array} Array of task objects
 */
export function loadTasks() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

/**
 * Save tasks to localStorage
 * @param {Array} tasks - Array of task objects
 */
export function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/**
 * Generate unique ID for new tasks
 * @returns {string} Unique ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Add a new task to the list
 * @param {Array} tasks - Current tasks
 * @param {string} text - Task text
 * @returns {Array} Updated tasks
 */
export function addTaskToList(tasks, text) {
    const trimmed = text.trim();
    if (!trimmed) {
        return tasks;
    }
    return [...tasks, {
        id: generateId(),
        text: trimmed,
        completed: false
    }];
}

/**
 * Toggle task completion status
 * @param {Array} tasks - Current tasks
 * @param {string} id - Task ID
 * @returns {Array} Updated tasks
 */
export function toggleTaskInList(tasks, id) {
    return tasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
    );
}

/**
 * Delete a task from the list
 * @param {Array} tasks - Current tasks
 * @param {string} id - Task ID
 * @returns {Array} Updated tasks
 */
export function deleteTaskFromList(tasks, id) {
    return tasks.filter(t => t.id !== id);
}
