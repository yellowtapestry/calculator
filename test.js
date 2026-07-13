import { test } from 'node:test';
import assert from 'node:assert';
import { operation } from './operations.js';

test('operate produce correct normal', () =>{
    const equation = ['3','+','2','*','5','/','2'];

    operate();
})

test('tokenize decimal')