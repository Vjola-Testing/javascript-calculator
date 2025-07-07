class Calculator {
    constructor() {
        this.operators = ["+", "-", "/", "*"];
        this.box = null;
        this.lastOperationHistory = null;
        this.operator = null;
        this.equalSign = null;
        this.dot = null;
        this.firstNum = true;
        this.numbers = [];
        this.operatorValue = null;
        this.lastButton = null;
        this.calcOperator = null;
        this.total = null;
        
        // Bind methods to this instance
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleKeyRelease = this.handleKeyRelease.bind(this);
        
        // Initialize calculator
        this.initialize();
    }
    
    initialize() {
        // Add event listeners
        document.addEventListener('keydown', this.handleKeyPress);
        document.addEventListener('keyup', this.handleKeyRelease);
        
        // Initialize display elements
        this.box = document.getElementById("box");
        this.lastOperationHistory = document.getElementById("last_operation_history");
        this.equalSign = document.getElementById("equal_sign").value;
        this.dot = document.getElementById("dot").value;
    }
    
    // Display handling
    updateDisplay(value) {
        this.box.innerText = value;
    }
    
    showError(message) {
        this.updateDisplay(message);
        this.firstNum = true;
    }
    
    // Number validation and formatting
    isValidNumber(num) {
        return !isNaN(num) && isFinite(num) && Math.abs(num) <= 1e15;
    }
    
    formatNumber(num) {
        if (!Number.isInteger(num)) {
            let rounded = parseFloat(num.toPrecision(12));
            return Math.abs(rounded - num) < 1e-10 ? rounded : num;
        }
        return num;
    }
    
    // Core calculator operations
    calculate(num1, num2, operator) {
        num1 = parseFloat(num1);
        num2 = parseFloat(num2);
        
        if (!this.isValidNumber(num1) || !this.isValidNumber(num2)) {
            this.showError("ERROR");
            return 0;
        }
        
        try {
            let result;
            switch (operator) {
                case "+":
                    result = num1 + num2;
                    break;
                case "-":
                    result = num1 - num2;
                    break;
                case "*":
                    result = num1 * num2;
                    break;
                case "/":
                    if (num2 === 0) {
                        this.showError("Cannot divide by zero");
                        return 0;
                    }
                    result = num1 / num2;
                    break;
                default:
                    return this.box.innerText;
            }
            
            if (!this.isValidNumber(result)) {
                this.showError("Overflow");
                return 0;
            }
            
            return this.formatNumber(result);
        } catch (error) {
            console.error("Calculation error:", error);
            this.showError("ERROR");
            return 0;
        }
    }
    
    // Button handlers
    handleNumber(button) {
        if (!this.operators.includes(button) && button !== this.equalSign) {
            if (this.firstNum) {
                this.updateDisplay(button === this.dot ? "0" + button : button);
                this.firstNum = false;
            } else {
                if (this.box.innerText.length === 1 && this.box.innerText === "0") {
                    if (button === this.dot) {
                        this.updateDisplay(this.box.innerText + button);
                    }
                    return;
                }
                if (this.box.innerText.includes(this.dot) && button === this.dot) {
                    return;
                }
                if (this.box.innerText.length === 20) {
                    return;
                }
                if (button === this.dot && this.box.innerText === "-") {
                    this.updateDisplay("-0" + button);
                } else {
                    this.updateDisplay(this.box.innerText + button);
                }
            }
        } else {
            this.handleOperator(button);
        }
    }
    
    handleOperator(button) {
        if (this.operatorValue != null && button === this.operatorValue) {
            return;
        }
        
        if (button === "-" && this.box.innerText === "0") {
            this.updateDisplay(button);
            this.firstNum = false;
            this.operatorValue = button;
            this.showSelectedOperator();
            return;
        }
        
        if (this.operators.includes(button)) {
            this.calcOperator = button;
            this.operatorValue = button;
            this.firstNum = true;
            this.showSelectedOperator();
        }
        
        this.processOperation(button);
    }
    
    processOperation(button) {
        if (this.numbers.length === 0) {
            this.numbers.push(this.box.innerText);
            this.updateHistory(this.box.innerText);
        } else {
            if (this.numbers.length === 1) {
                this.numbers[1] = this.box.innerText;
            }
            
            if (button === this.equalSign && this.calcOperator != null) {
                const result = this.calculate(this.numbers[0], this.numbers[1], this.calcOperator);
                this.updateDisplay(result);
                this.updateHistoryWithResult();
                this.numbers = [result];
                this.operatorValue = null;
                this.showSelectedOperator();
            } else if (this.calcOperator != null) {
                this.lastOperationHistory.innerText = this.box.innerText + " " + button;
                this.numbers = [this.box.innerText];
            }
        }
    }
    
    // UI updates
    showSelectedOperator() {
        const elements = document.getElementsByClassName("operator");
        Array.from(elements).forEach(el => el.style.backgroundColor = "#e68a00");
        
        const operatorMap = {
            "+": "plusOp",
            "-": "subOp",
            "*": "multiOp",
            "/": "divOp"
        };
        
        if (this.operatorValue in operatorMap) {
            document.getElementById(operatorMap[this.operatorValue]).style.backgroundColor = "#ffd11a";
        }
    }
    
    updateHistory(value) {
        if (this.calcOperator) {
            this.lastOperationHistory.innerText = value + " " + this.calcOperator;
        }
    }
    
    updateHistoryWithResult() {
        if (!this.lastOperationHistory.innerText.includes("=")) {
            this.lastOperationHistory.innerText += " " + this.numbers[1] + " =";
        }
    }
    
    // Special operations
    clearAll() {
        window.location.reload();
    }
    
    clearEntry() {
        this.updateDisplay("0");
        this.firstNum = true;
    }
    
    backspace() {
        let value = this.box.innerText;
        value = value.slice(0, -1);
        this.updateDisplay(value || "0");
        if (!value) {
            this.firstNum = true;
        }
    }
    
    // Event handlers
    handleKeyPress(e) {
        if (e.key === "Delete") {
            this.clearAll();
            return;
        }
        
        if (e.key === "Backspace") {
            this.backspace();
            return;
        }
        
        if ((e.key >= 0 && e.key <= 9) || this.operators.includes(e.key) || 
            e.key === "=" || e.key === "Enter" || e.key === ".") {
            this.handleNumber(e.key === "Enter" ? "=" : e.key);
        }
    }
    
    handleKeyRelease(e) {
        if (e.key === "Backspace") {
            document.getElementById("backspace_btn").style.backgroundColor = "#666666";
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new Calculator();
});