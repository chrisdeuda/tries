/**
 * Unit tests for todoStore module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    loadTasks,
    saveTasks,
    generateId,
    addTaskToList,
    toggleTaskInList,
    deleteTaskFromList
} from '../todoStore.js';

describe('todoStore', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('loadTasks', () => {
        it('should return empty array when no tasks stored', () => {
            expect(loadTasks()).toEqual([]);
        });

        it('should load tasks from localStorage', () => {
            const tasks = [
                { id: '1', text: 'Test task', completed: false }
            ];
            localStorage.setItem('todo-app-tasks', JSON.stringify(tasks));
            expect(loadTasks()).toEqual(tasks);
        });

        it('should handle invalid JSON gracefully', () => {
            localStorage.setItem('todo-app-tasks', 'invalid-json');
            expect(() => loadTasks()).not.toThrow();
        });
    });

    describe('saveTasks', () => {
        it('should save tasks to localStorage', () => {
            const tasks = [
                { id: '1', text: 'Test task', completed: false }
            ];
            saveTasks(tasks);
            expect(localStorage.getItem('todo-app-tasks')).toBe(JSON.stringify(tasks));
        });

        it('should save empty array', () => {
            saveTasks([]);
            expect(localStorage.getItem('todo-app-tasks')).toBe('[]');
        });
    });

    describe('generateId', () => {
        it('should generate unique IDs', () => {
            const id1 = generateId();
            const id2 = generateId();
            expect(id1).not.toBe(id2);
        });

        it('should generate string IDs', () => {
            const id = generateId();
            expect(typeof id).toBe('string');
            expect(id.length).toBeGreaterThan(0);
        });
    });

    describe('addTaskToList', () => {
        it('should add task to empty list', () => {
            const result = addTaskToList([], 'New task');
            expect(result).toHaveLength(1);
            expect(result[0].text).toBe('New task');
            expect(result[0].completed).toBe(false);
            expect(result[0].id).toBeDefined();
        });

        it('should add task to existing list', () => {
            const existing = [{ id: '1', text: 'Old task', completed: false }];
            const result = addTaskToList(existing, 'New task');
            expect(result).toHaveLength(2);
            expect(result[1].text).toBe('New task');
        });

        it('should trim whitespace from task text', () => {
            const result = addTaskToList([], '  Task with spaces  ');
            expect(result[0].text).toBe('Task with spaces');
        });

        it('should not add empty task', () => {
            const result = addTaskToList([], '');
            expect(result).toEqual([]);
        });

        it('should not add whitespace-only task', () => {
            const result = addTaskToList([], '   ');
            expect(result).toEqual([]);
        });

        it('should not mutate original array', () => {
            const original = [{ id: '1', text: 'Task', completed: false }];
            const result = addTaskToList(original, 'New task');
            expect(original).toHaveLength(1);
            expect(result).toHaveLength(2);
        });
    });

    describe('toggleTaskInList', () => {
        it('should toggle incomplete task to complete', () => {
            const tasks = [{ id: '1', text: 'Task', completed: false }];
            const result = toggleTaskInList(tasks, '1');
            expect(result[0].completed).toBe(true);
        });

        it('should toggle complete task to incomplete', () => {
            const tasks = [{ id: '1', text: 'Task', completed: true }];
            const result = toggleTaskInList(tasks, '1');
            expect(result[0].completed).toBe(false);
        });

        it('should not affect other tasks', () => {
            const tasks = [
                { id: '1', text: 'Task 1', completed: false },
                { id: '2', text: 'Task 2', completed: false }
            ];
            const result = toggleTaskInList(tasks, '1');
            expect(result[0].completed).toBe(true);
            expect(result[1].completed).toBe(false);
        });

        it('should return unchanged array if task not found', () => {
            const tasks = [{ id: '1', text: 'Task', completed: false }];
            const result = toggleTaskInList(tasks, 'nonexistent');
            expect(result).toEqual(tasks);
        });

        it('should not mutate original array', () => {
            const original = [{ id: '1', text: 'Task', completed: false }];
            const result = toggleTaskInList(original, '1');
            expect(original[0].completed).toBe(false);
            expect(result[0].completed).toBe(true);
        });
    });

    describe('deleteTaskFromList', () => {
        it('should delete task by ID', () => {
            const tasks = [
                { id: '1', text: 'Task 1', completed: false },
                { id: '2', text: 'Task 2', completed: false }
            ];
            const result = deleteTaskFromList(tasks, '1');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('2');
        });

        it('should return empty array when deleting last task', () => {
            const tasks = [{ id: '1', text: 'Task', completed: false }];
            const result = deleteTaskFromList(tasks, '1');
            expect(result).toEqual([]);
        });

        it('should return unchanged array if task not found', () => {
            const tasks = [{ id: '1', text: 'Task', completed: false }];
            const result = deleteTaskFromList(tasks, 'nonexistent');
            expect(result).toEqual(tasks);
        });

        it('should not mutate original array', () => {
            const original = [{ id: '1', text: 'Task', completed: false }];
            const result = deleteTaskFromList(original, '1');
            expect(original).toHaveLength(1);
            expect(result).toHaveLength(0);
        });
    });
});
