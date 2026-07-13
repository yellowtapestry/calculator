/* operations.js */

function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function divide(a, b) {
    return a / b;
}

function multiply(a, b) {
    return a * b;
}

export const operation = {
    "/": divide,
    "*": multiply,
    "+": add,
    "-": subtract
}
