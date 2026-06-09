import { beforeEach } from 'vitest';
import { Window } from 'happy-dom';

// Initialize happy-dom window for localStorage
const window = new Window();
global.localStorage = window.localStorage;
global.window = window;
