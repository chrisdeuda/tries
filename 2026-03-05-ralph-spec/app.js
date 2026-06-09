/**
 * Todo App - Main Application
 */

import { loadTasks, saveTasks, generateId, addTaskToList, toggleTaskInList, deleteTaskFromList } from './todoStore.js';

// DOM Elements
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');

/**
 * Create a todo item element
 * @param {Object} task - Task object with id, text, completed
 * @returns {HTMLElement} LI element
 */
function createTodoElement(task) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = task.text;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);

    return li;
}

/**
 * Render all tasks to the list
 */
function renderTasks() {
    const tasks = loadTasks();
    list.innerHTML = '';
    tasks.forEach(task => {
        const element = createTodoElement(task);
        if (task.completed) {
            element.classList.add('completed');
        }
        list.appendChild(element);
    });
}

/**
 * Add a new task
 * @param {string} text - Task text
 */
function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) {
        input.focus();
        return;
    }

    const tasks = loadTasks();
    const updated = addTaskToList(tasks, trimmed);
    saveTasks(updated);
    renderTasks();
    input.value = '';
    input.focus();
}

/**
 * Toggle task completion status
 * @param {string} id - Task ID
 */
function toggleTask(id) {
    const tasks = loadTasks();
    const updated = toggleTaskInList(tasks, id);
    saveTasks(updated);
    renderTasks();
}

/**
 * Delete a task
 * @param {string} id - Task ID
 */
function deleteTask(id) {
    const tasks = loadTasks();
    const updated = deleteTaskFromList(tasks, id);
    saveTasks(updated);
    renderTasks();
}

// Event Listeners
form.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask(input.value);
});

// Initialize on page load
renderTasks();
