/* calculator.js */

import { operation } from "./operations.js"

// OPERATORS object: Holds symbol and actual functional symbol assignment
const operatorSymbol = {
    "÷": "/",
    "×": "*",
    "+": "+",
    "-": "-"
};

/** Stores the previous result. NO previous result is always null */
let prevResult = null;
/** Decimal entered flag. Resets after each operator entered */
let decimalEntered = false;

/**
 * Container which holds the current equation shown in the display
 * @type {string[]}
 */
const displayEquation = [];
const display = document.querySelector("#display-container");

/**
 * Helper Function: Verifies if a character is a digit or not
 * @return true if digit, otherwise false
 */
function isDigit(char) {
    return /^\d$/.test(char);
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
        equation += symbol;
    }

    return equation;
}

/**
 * Associated with equals button (=). Processes the current equation on the display.
 * This function assumes addSymbol has parsed VALID equations!
 * Check out the shunting yard algorithm (thanks Djikstra)
 */
function operate() {
    let outputQueue = "";
    let operatorStack = [];

    for (let i = 0; i < displayEquation.length; i++) {
        let curSymbol = displayEquation[i];
    }


}

/**
 * Updates the display screen with the current input once.
 * @param displayElement the display element selected through DOM
 */
function drawDisplay(displayElement) {
    if (displayElement === null) return;

    displayElement.textContent = equationToString(displayEquation);
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
            // The equals button performs the operate function.
            button.addEventListener("click", operate);
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
        })
    }
}

main();