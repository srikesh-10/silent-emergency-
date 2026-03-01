import React, { useState } from 'react';

/**
 * Calculator.jsx — A fully functional calculator for stealth camouflage.
 * Provides basic arithmetic operations to look like a standard utility app.
 */
function Calculator() {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');
    const [isNewNumber, setIsNewNumber] = useState(true);

    const handleNumber = (num) => {
        if (isNewNumber) {
            setDisplay(num);
            setIsNewNumber(false);
        } else {
            setDisplay(prev => (prev === '0' ? num : prev + num));
        }
    };

    const handleOperator = (op) => {
        setEquation(display + ' ' + op + ' ');
        setIsNewNumber(true);
    };

    const handleClear = () => {
        setDisplay('0');
        setEquation('');
        setIsNewNumber(true);
    };

    const handleEqual = () => {
        try {
            // Simple arithmetic evaluation using Function (safer than eval)
            const result = new Function('return ' + equation + display)();
            setDisplay(String(result));
            setEquation('');
            setIsNewNumber(true);
        } catch (e) {
            setDisplay('Error');
            setEquation('');
            setIsNewNumber(true);
        }
    };

    const handleDecimal = () => {
        if (!display.includes('.')) {
            setDisplay(prev => prev + '.');
            setIsNewNumber(false);
        }
    };

    return (
        <div className="calculator-container">
            <div className="calculator-body">
                <div className="calc-header">
                    <span className="calc-title">Calculator</span>
                    <div className="calc-mac-dots">
                        <span className="dot red"></span>
                        <span className="dot yellow"></span>
                        <span className="dot green"></span>
                    </div>
                </div>

                <div className="calc-display-wrapper">
                    <div className="calc-equation">{equation}</div>
                    <div className="calc-display">{display}</div>
                </div>

                <div className="calc-grid">
                    <button onClick={handleClear} className="calc-btn utility">AC</button>
                    <button className="calc-btn utility">+/-</button>
                    <button className="calc-btn utility">%</button>
                    <button onClick={() => handleOperator('/')} className="calc-btn operator">÷</button>

                    <button onClick={() => handleNumber('7')} className="calc-btn">7</button>
                    <button onClick={() => handleNumber('8')} className="calc-btn">8</button>
                    <button onClick={() => handleNumber('9')} className="calc-btn">9</button>
                    <button onClick={() => handleOperator('*')} className="calc-btn operator">×</button>

                    <button onClick={() => handleNumber('4')} className="calc-btn">4</button>
                    <button onClick={() => handleNumber('5')} className="calc-btn">5</button>
                    <button onClick={() => handleNumber('6')} className="calc-btn">6</button>
                    <button onClick={() => handleOperator('-')} className="calc-btn operator">−</button>

                    <button onClick={() => handleNumber('1')} className="calc-btn">1</button>
                    <button onClick={() => handleNumber('2')} className="calc-btn">2</button>
                    <button onClick={() => handleNumber('3')} className="calc-btn">3</button>
                    <button onClick={() => handleOperator('+')} className="calc-btn operator">+</button>

                    <button onClick={() => handleNumber('0')} className="calc-btn zero">0</button>
                    <button onClick={handleDecimal} className="calc-btn">.</button>
                    <button onClick={handleEqual} className="calc-btn operator">=</button>
                </div>
            </div>

            <div className="camouflage-hint">
                Calculator mode active. Header controls remain available for quick exit.
            </div>
        </div>
    );
}

export default Calculator;
