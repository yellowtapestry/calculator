import { test } from 'node:test';
import assert from 'node:assert';
import { operate } from './calculator.js';

test('operate produces correct result', () => {
    const equation = ['3', '+', '2', '*', '5', '/', '2'];
    const result = operate(equation);
    assert.strictEqual(result, 8); // 2*5=10, 10/2=5, 3+5=8 (standard precedence)
});

test('tokenize decimal', () => {
    const equation = ['3', '.', '3'];
    const result = operate(equation);
    assert.strictEqual(result, 3.3);
});