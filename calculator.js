/* calculator.js */

import { operation } from "./operations.js"

// OPERATORS object: Holds symbol and actual functional symbol assignment
// ALL UI USES SYMBOLS: ALL FUNCTION CALLS PARSE SYNTAX VALS
const operatorSymbol = {
    "÷": "/",
    "×": "*",
    "+": "+",
    "-": "-"
};

/**
 * Container which holds the current equation shown in the display
 * @type {string[]}
 */
const displayEquation = [];
const display = document.querySelector("#display-container");

/** Decimal entered flag. Resets after each operator entered */
let decimalEntered = false;
let prevResult = null;

/**
 * Helper Function: Verifies if a character is a digit or not. Uses regex
 * @return true if digit, otherwise false
 */
function isDigit(char) {
    return /^\d$/.test(char);
}

/**
 * Helper Function: Verifies if a character is an operator syntax symbol, not ui symbol.
 * All BACKEND functions should be using this to check for an operator.
 * @return true if operator, otherwise false
 */
function isOperator(char) {
    return Object.values(operatorSymbol).includes(char);
}

/**
 * Helper function: verifies if a character is a unary operator
 * @param prev character token preceding the one to be checked
 * @return true if unary, otherwise false
 */
function isUnary(prev) {
    return prev === undefined || // start of expression
        prev === '(' ||
        (prev in operatorSymbol); // previous token was an operator
}

/**
 * Registers a button click, pulls the symbol associated with that button and
 * Adds it to the calculation function
 * @param {string} symbol retrieved from button's text content.
 */
function addSymbol(symbol) {
    if (symbol === null) return;
    let actualSymbol = symbol;

    // Check first if previous entry is non-digit
    let prevDigit = false;
    if (displayEquation.length > 0) {
        const lastEntered = displayEquation[displayEquation.length - 1];
        if (isDigit(lastEntered) || lastEntered === ".") {
            prevDigit = true;
        }
    }

    // Handle decimal case,
    // decimal is identically a digit but can only be entered once between each operator
    if (actualSymbol === ".") {
        if (decimalEntered) {
            return;
        } else {
            decimalEntered = true;
            displayEquation.push(".");
            return;
        }
    }

    // Check and assign for symbols OTHER THAN DIGITS!
    if (!isDigit(symbol)) {
        actualSymbol = operatorSymbol[symbol] ?? symbol;

        /* OPERATOR BRANCH: Consecutive operation symbols cannot be entered. */
        // This is a simple check against the KEY for the object, not the actual parsing symbol.
        if (symbol in operatorSymbol) {
            decimalEntered = false; // Operators separate numbers, we can enter a new decimal
            if (!prevDigit) {
                // Newest operation will overwrite prev if exists
                displayEquation[displayEquation.length - 1] = actualSymbol;
                return;
            }
        }
    }

    // Finally push the symbol onto array otherwise
    displayEquation.push(actualSymbol);
}
/**

 * Deletes the symbol at the current tail of the display array.
 *
 */
function clearEntry() {
    if (displayEquation.length === 0) return;

    displayEquation.pop();
}

/**
 * Resets the entire calculator to a blank state. Clears both previous result and the current
 * equation on the display.
 */
function allClear() {
    prevResult = null;
    while (displayEquation.length > 0) {
        displayEquation.pop();
    }
}

/**
 * Helper function: Converts and parses an equation array into a single string
 * @param {string[]} arr
 * @return {string} the equation as a string with no spaces
 */
function equationToString(arr) {
    let equation = "";
    for (let symbol of arr) {
        // ui purposes use the actual symbols for display
        if (symbol === "/") {
            equation += "÷";
            continue;
        } else if (symbol === "*") {
            equation += "×";
            continue;
        }
        equation += symbol;
    }

    return equation;
}


/**
 * Calculates an equation presented in reverse postfix form.
 * Operators are processed with two operands at a time
 * @param {char|number[]} postfixQueue an equation array containing numbers as operands and operator characters.
 * @return {number} the result of the subsequent equation.
 */
function evalEquation(postfixQueue) {
    let resultStack = [];

    for (let symbol of postfixQueue) {
        if (isOperator(symbol)) {
            // Operator encountered, process most recent 2 operands of the stack with it.
            // b is popped first due to the nature of the stack
            let b = resultStack.pop();
            let a = resultStack.pop();
            if (b === undefined || a === undefined) {
                console.log("evalEquation: operand undefined");
                continue;
            }

            // Operation calls the function associated with this particular symbol
            let result = operation[symbol](a, b);

            // Needs to go back in the stack for subsequent calculations with other operators
            resultStack.push(result);
        } else {
            // Operand or digit, accumulate operands in stack
            resultStack.push(symbol);
        }
    }

    return resultStack.pop(); // Should be a singular number
}

/**
 * Associated with equals button (=). Processes the current equation on the display.
 * This function assumes addSymbol has parsed VALID equations!
 * Uses the Shunting yard algorithm
 * @param {string[]} equationArr the equation stored as a string token array.
 * @return {number} result of the inputted equationArr, or NaN on failure
 */
function operate(equationArr) {
    console.log(equationArr);
    /* higher value means HIGHER PRECEDENCE ! */
    let precedence = {
        "+": 1,
        "-": 1,
        "/": 2,
        "*": 2
    };

    let outputQueue = [];
    let opStack = [];

    let curNumString = "";
    // TOKENIZE STEP: decimals need to be parsed as one to be cleanly read,
    for (let i = 0; i < equationArr.length; i++) {
        let token = equationArr[i];

        if (isDigit(token) || token === ".") {
            // Build the exact number.
            curNumString += token;

            // Operators and symbols deliminate the number, indicates when we finish building
            if (isOperator(equationArr[i + 1]) || i === equationArr.length - 1) {
                let curNum = Number(curNumString);
                if (isNaN(curNum)) {
                    // [DISPLAY-ERROR] insert Display error function here
                    console.log("ERROR. Number failed to process\n");
                    continue;
                }
                outputQueue.push(curNum);
                curNumString = ""; // Reset the number parse
            }
        } else {
            // NaN branch, push directly to operators. Here we EVALUATE PRECEDENCE
            /* Continue popping into output until the highest precedence op is at top of stack
            *  Each loop, the highest precedence op should always be at the top of the opStack.
            *  (precedence[opStack[opStack.length - 1]] >= precedence[token]) condition checks this */
            while (opStack.length > 0 &&
            precedence[opStack[opStack.length - 1]] >= precedence[token]) {
                outputQueue.push(opStack.pop());
            }

            opStack.push(token);
        }
    }

    console.log(outputQueue);
    console.log(opStack);
    // CLEANUP/ORDER STEP: add back remaining operators into the queue
    // After this, every operator immediately follows the two operands it applies to
    while (opStack.length > 0) {
        outputQueue.push(opStack.pop());
    }

    console.log(outputQueue);

    // EVALUATE STEP: process the output queue, as a postfix expression
    const result = evalEquation(outputQueue);

    if (isNaN(result)) {
        // TODO: handle error case, maybe display error function
    }   else {
        // Updating the display for result
        equationArr.length = 0;

        // match the format of the displayEquation arr or else it breaks subsequent calculations
        const resultString = String(result);
        for (const char of resultString) {
            equationArr.push(char);
        }

        // Store for subsequent calculations that may need it
        prevResult = result;
    }

    return result;
}

/**
 * Updates the display screen with the current input once.
 * @param displayElement the display element selected through DOM
 */
function drawDisplay(displayElement) {
    if (displayElement === null) return;

    displayElement.textContent = equationToString(displayEquation);
}

/**
 * Handles a button event
 */
function handleAction(action) {
    action();
    drawDisplay(display);
}

const keyAction = {
    "+": () => handleAction( () => addSymbol("+")),
    "-": () => handleAction( () => addSymbol("-")),
    "/": () => handleAction( () => addSymbol("÷")),
    "*": () => handleAction( () => addSymbol("×")),

    "Enter": () => handleAction(() => operate(displayEquation)),
    "Backspace": () => handleAction(clearEntry),
    "Escape": () => handleAction(allClear)
}

function main() {
    // Numpad buttons setup
    const numpadContainer = document.querySelectorAll("#numpad button");
    for (const button of numpadContainer) {
        if (button.textContent.trim() !== "=") {
            button.addEventListener("click", () => {
                addSymbol(button.textContent);
                drawDisplay(display);
            });
        } else {
            /** Equals Button, Evaluates an expression */
            button.addEventListener("click", () => {
                handleAction(() => operate(displayEquation))
            });
        }
    }

    // Functional buttons setup
    const acButton = document.querySelector("#ac");
    const ceButton = document.querySelector("#ce");
    acButton.addEventListener("click", () =>{
        allClear();
        drawDisplay(display);
    });
    ceButton.addEventListener("click", () =>{
        clearEntry();
        drawDisplay(display);
    });

    // Set up the operations keys
    const opContainer = document.querySelectorAll("#operations button");
    for (const opButton of opContainer) {
        opButton.addEventListener("click", () => {
                addSymbol(opButton.textContent);
                drawDisplay(display);
        });
    }

    /* Keyboard support for calculator */
    document.addEventListener("keydown", (e) => {
        console.log(e.type);

        if (isDigit(e.key)) {
            addSymbol(e.key);
            drawDisplay(display);
        } else {
            // Lookup table action
            keyAction[e.key]?.();
        }
    });
}

main();