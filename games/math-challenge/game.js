/*The Minigame Collection was created and published by Felix T. Vogel in 2023*/

import { alertPopup, addPointsAndUpdate, displayBackButtons, redirectIfLocked, setRules } from '/minigame-collection/src/main.js?v=2.8.1.1';

document.addEventListener("DOMContentLoaded", () => {
    redirectIfLocked('math-challenge');
    displayBackButtons();

    setRules(`
    <p>Players are presented with math problems involving addition, subtraction, multiplication, or division.</p>
    <br>
    <p>For each correct answer, the player earns 5 points.</p>
    <br>
    <p>Solve as many math problems as you want.</p>
    <br>
    <p>If all cells are filled and no player has achieved a winning combination, the game ends in a draw.</p>
    <br>
    <p><strong>Objective:</strong> Accumulate as many points as possible by answering the math problems correctly. Have fun!</p>
    `);

    const questionElement = document.querySelector('.question');
    const answerInput = document.getElementById('answer');
    const answerInputWrapper = document.getElementById('answerInputWrapper');
    const answerForm = document.getElementById('answer-form');
    const submitButton = document.getElementById('submitButton');

    let currentQuestion = '';
    let currentAnswer = 0;
    let checkingAnswer = false;
    const lastHundredQuestions = [];
    let hundredQuestionsAlert = false;

    async function generateQuestion() {
        let newQuestion = '';
        let counter = 0;
        const maxIterations = 1000;

        do {
            const operators = ['+', '-', '*', '/'];
            const operator = operators[Math.floor(Math.random() * operators.length)];
            let num1, num2;

            if (operator === '/') {
                num2 = Math.floor(Math.random() * 9) + 1;
                const factor = Math.floor(Math.random() * 9) + 1;
                num1 = num2 * factor;
            } else {
                num1 = Math.floor(Math.random() * 10 + 1);
                num2 = Math.floor(Math.random() * 10 + 1);
            }

            if (operator === '-' && num1 < num2) {
                const temp = num1;
                num1 = num2;
                num2 = temp;
            }

            newQuestion = `${num1} ${operator} ${num2}`;

            counter++;

        } while (lastHundredQuestions.includes(newQuestion) && counter < maxIterations);

        questionElement.classList.remove('fade-in-text');
        questionElement.classList.add('fade-out-text');
        await new Promise(resolve => setTimeout(resolve, 500));
        currentQuestion = newQuestion;
        currentAnswer = Math.round(calculateExpression(currentQuestion));
        questionElement.textContent = currentQuestion + " = ";
        answerInput.value = '';
        questionElement.classList.remove('fade-out-text');
        questionElement.classList.add('fade-in-text');

        lastHundredQuestions.push(currentQuestion);

        if (lastHundredQuestions.length > 100) {
            lastHundredQuestions.shift();
            if (!hundredQuestionsAlert) {
                alertPopup("Congratiulations! You solved 100 math problems in a row. Here is your reward: 1000 points!");
                addPointsAndUpdate(1000);
                hundredQuestionsAlert = true;
            }
        }
    }

    async function checkAnswer() {
        checkingAnswer = true;
        submitButton.disabled = true;

        const userAnswer = parseInt(answerInput.value);
        if (userAnswer === currentAnswer) {
            answerInputWrapper.classList.add('right');
            await new Promise(resolve => setTimeout(resolve, 2000));
            answerInputWrapper.classList.remove('right');
            //alertPopup("Correct!\nYou've earned 5 Points.");
            addPointsAndUpdate(5);
            generateQuestion();
        } else {
            answerInputWrapper.classList.add('wrong');
            await new Promise(resolve => setTimeout(resolve, 1000));
            answerInputWrapper.classList.remove('wrong');
            //alertPopup('That was not correct.\nTry again!');
        }
        submitButton.disabled = false;
        checkingAnswer = false;
    }

    function calculateExpression(expression) {
        const parts = expression.split(' ');
        const num1 = parseInt(parts[0]);
        const operator = parts[1];
        const num2 = parseInt(parts[2]);

        switch (operator) {
            case '+':
                return num1 + num2;
            case '-':
                return num1 - num2;
            case '*':
                return num1 * num2;
            case '/':
                return num1 / num2;
            default:
                throw new Error(`Unsupported operator: ${operator}`);
        }
    }

    answerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!checkingAnswer) {
            checkAnswer();
        }
    });

    generateQuestion();
});