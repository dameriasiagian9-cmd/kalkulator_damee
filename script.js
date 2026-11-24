
const result = document.getElementById("result");
const expression = document.getElementById("expression");

const buttons = document.querySelector(".buttons");

let current = "0";
let stored = null;
let operator = null;
let resetNext = false;
let memory = 0;
let lastCalculation = null;

// FORMAT ANGKA
function format(value) {
    if (!Number.isFinite(value)) return "Error";

    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 10
    }).format(value);
}

// UPDATE DISPLAY
function updateDisplay() {
    result.textContent = current === "Error"
        ? "Error"
        : format(Number(current));
}

// RESET
function clearAll() {
    current = "0";
    stored = null;
    operator = null;
    resetNext = false;
    lastCalculation = null;

    expression.textContent = "Ready to calculate";

    updateDisplay();
}

// CLEAR ENTRY
function clearEntry() {
    current = "0";
    resetNext = false;
    updateDisplay();
}

// INPUT NUMBER
function inputNumber(number) {

    if (current === "Error") clearAll();

    if (resetNext) {
        current = number;
        resetNext = false;
    } else if (current.replace("-", "").replace(".", "").length < 14) {
        current = current === "0"
            ? number
            : current + number;
    }

    updateDisplay();
}

// DECIMAL
function decimal() {

    if (resetNext) {
        current = "0.";
        resetNext = false;
    } else if (!current.includes(".")) {
        current += ".";
    }

    updateDisplay();
}

// CALCULATION
function calculate(a, b, op) {

    switch (op) {

        case "+":
            return a + b;

        case "-":
            return a - b;

        case "*":
            return a * b;

        case "/":
            return b === 0 ? NaN : a / b;

        case "^":
            return Math.pow(a, b);

        default:
            return b;
    }
}

// CLEAN RESULT
function clean(value) {
    if (!Number.isFinite(value)) return "Error";

    return String(Number(value.toPrecision(12)));
}

// SELECT OPERATOR
function chooseOperator(op) {

    if (current === "Error") return;

    const value = Number(current);

    if (operator && !resetNext) {

        const answer = calculate(stored, value, operator);

        current = clean(answer);

        if (current === "Error") {
            stored = null;
            operator = null;
            updateDisplay();
            return;
        }

        stored = Number(current);

    } else {
        stored = value;
    }

    operator = op;
    resetNext = true;

    expression.textContent =
        format(stored) + " " + symbol(op);

    updateDisplay();
}

// OPERATOR SYMBOL
function symbol(op) {
    return {
        "*": "×",
        "/": "÷",
        "^": "^"
    }[op] || op;
}

// EQUAL
function equals() {

    if (operator === null || stored === null) {

        if (lastCalculation) {
            const answer = calculate(
                Number(current),
                lastCalculation.value,
                lastCalculation.operator
            );

            expression.textContent =
                format(Number(current)) + " " +
                symbol(lastCalculation.operator) + " " +
                format(lastCalculation.value) + " =";

            current = clean(answer);
            resetNext = true;
            updateDisplay();
        }

        return;
    }

    const first = stored;
    const second = Number(current);
    const op = operator;

    const answer = calculate(first, second, op);

    expression.textContent =
        format(first) + " " +
        symbol(op) + " " +
        format(second) + " =";

    current = clean(answer);

    lastCalculation = {
        operator: op,
        value: second
    };

    stored = null;
    operator = null;
    resetNext = true;

    updateDisplay();
}

// PERCENT
function percent() {
    if (current === "Error") return;

    current = clean(Number(current) / 100);
    resetNext = true;
    updateDisplay();
}

// BACKSPACE
function backspace() {

    if (current === "Error" || resetNext) {
        current = "0";
        resetNext = false;
    } else {
        current = current.slice(0, -1);

        if (current === "" || current === "-") {
            current = "0";
        }
    }

    updateDisplay();
}

// POWER
function power() {
    chooseOperator("^");
}

// PI SQUARE
function piSquare() {

    current = clean(Math.PI * Math.PI);

    expression.textContent = "π² =";

    resetNext = true;

    updateDisplay();
}

// MEMORY RECALL
function memoryRecall() {

    current = clean(memory);

    expression.textContent = "Memory recalled";

    resetNext = true;

    updateDisplay();
}

// MEMORY ADD
function memoryAdd() {

    if (current === "Error") return;

    memory += Number(current);

    expression.textContent = "Memory: " + format(memory);

    updateDisplay();
}

// EVENT BUTTON
buttons.addEventListener("click", function(event) {

    const button = event.target.closest("button");

    if (!button) return;

    if (button.dataset.number !== undefined) {
        inputNumber(button.dataset.number);
    }

    else if (button.dataset.operator) {
        chooseOperator(button.dataset.operator);
    }

    else {
        switch (button.dataset.action) {

            case "clear":
                clearAll();
                break;

            case "clear-entry":
                clearEntry();
                break;

            case "equals":
                equals();
                break;

            case "decimal":
                decimal();
                break;

            case "percent":
                percent();
                break;

            case "backspace":
                backspace();
                break;

            case "power":
                power();
                break;

            case "pi":
                piSquare();
                break;

            case "memory":
                memoryRecall();
                break;

            case "memory-add":
                memoryAdd();
                break;
        }
    }

});

// KEYBOARD
document.addEventListener("keydown", function(event) {

    const key = event.key;

    if (/^[0-9]$/.test(key)) {
        inputNumber(key);
    }

    else if (key === ".") {
        decimal();
    }

    else if (["+", "-", "*", "/"].includes(key)) {
        chooseOperator(key);
    }

    else if (key === "Enter" || key === "=") {
        event.preventDefault();
        equals();
    }

    else if (key === "Backspace") {
        backspace();
    }

    else if (key === "Escape") {
        clearAll();
    }

    else if (key === "%") {
        percent();
    }

    else if (key === "^") {
        power();
    }

});

// INITIAL DISPLAY
updateDisplay();
