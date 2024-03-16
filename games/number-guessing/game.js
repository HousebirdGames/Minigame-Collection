/*The Minigame Collection was created and published by Felix T. Vogel in 2023*/

import { alertPopup, addPointsAndUpdate, displayBackButtons, redirectIfLocked, setRules, alertPopupClose } from '/minigame-collection/src/main.js?v=2.8.1.1';

document.addEventListener("DOMContentLoaded", () => {
    redirectIfLocked('number-guessing');
    displayBackButtons();

    setRules(`
    <p>Guess the secret number correctly to win the game. The secret number is randomly generated at the beginning of each round.</p>
<br>
<p>The number lies within a specified range (default is 1 to 10, but can be increased up to 30).</p>
<br>
<p>Select a number by clicking on it, and you will receive feedback indicating whether your guess is too low, too high, or the correct number.</p>
<br>
    <p><strong>Objective:</strong> Aim to guess the correct number with the fewest attempts to maximize your points. Have fun!</p>
`);

    let randomNumber;
    let numbers = 10;
    let tries = 0;
    let checkingGuess = false;
    const grid = document.getElementById('grid');
    const feedback = document.getElementById('feedback');

    const lowerButton = document.getElementById('lowerButton');
    const higherButton = document.getElementById('higherButton');

    if (lowerButton) {
        lowerButton.addEventListener('click', () => {
            if (numbers > 10) {
                numbers -= 5;
                createButtons();
                restart();

                checkHigherLowerButtons();
            }
        });
    }

    if (higherButton) {
        higherButton.addEventListener('click', () => {
            if (numbers < 30) {
                numbers += 5;
                createButtons();
                restart();

                checkHigherLowerButtons();
            }
        });
    }

    function checkHigherLowerButtons() {
        if (lowerButton && higherButton) {
            if (numbers <= 10) {
                lowerButton.disabled = true;
            }
            else {
                lowerButton.disabled = false;
            }

            if (numbers >= 30) {
                higherButton.disabled = true;
            }
            else {
                higherButton.disabled = false;
            }
        }
    }

    checkHigherLowerButtons();
    addRestartButtonListeners();
    restart();
    createButtons();

    async function restart() {
        feedback.classList.remove('fade-in-text');
        feedback.classList.add('fade-out-text');
        await new Promise(resolve => setTimeout(resolve, 500));
        feedback.textContent = 'Which number are we looking for?';
        randomNumber = Math.floor(Math.random() * numbers) + 1;
        tries = 0;
        feedback.classList.remove('fade-out-text');
        feedback.classList.add('fade-in-text');
        await new Promise(resolve => setTimeout(resolve, 600));
        enableButtons();
    }

    function createButtons() {
        grid.innerHTML = '';
        for (let i = 1; i <= numbers; i++) {
            const button = document.createElement('button');
            button.classList.add('number');
            button.textContent = i;
            button.addEventListener('click', () => {
                checkGuess(i, button);
            });
            grid.appendChild(button);
        }
    }

    async function checkGuess(guess, button) {
        if (checkingGuess) {
            return;
        }

        checkingGuess = true;
        tries++;
        feedback.classList.remove('fade-in-text');
        feedback.classList.add('fade-out-text');
        await new Promise(resolve => setTimeout(resolve, 500));
        let win = false;
        if (guess === randomNumber) {
            button.classList.add('right');
            feedback.textContent = `${guess} is correct!`;
            win = true;
        } else if (guess < randomNumber) {
            button.disabled = true;
            feedback.textContent = 'To low';
        } else {
            button.disabled = true;
            feedback.textContent = 'Too high';
        }
        feedback.classList.remove('fade-out-text');
        feedback.classList.add('fade-in-text');
        await new Promise(resolve => setTimeout(resolve, 600));

        if (win) {
            disableButtons();
            const points = numbers - tries * numbers * 0.1;
            await new Promise(resolve => setTimeout(resolve, 500));
            alertPopup(`Congratulations, you guessed the correct number! You receive ${points} Points.`,
                `
            <br>
            <button class="restartButton">Restart</button>
            `, 'gameFinished');
            addPointsAndUpdate(points);
            addRestartButtonListeners();
        }
        button.classList.remove('right');
        checkingGuess = false;
    }

    function disableButtons() {
        const buttons = grid.getElementsByTagName('button');
        for (const button of buttons) {
            button.disabled = true;
        }
    }

    function enableButtons() {
        const buttons = grid.getElementsByTagName('button');
        for (const button of buttons) {
            button.disabled = false;
        }
    }

    function addRestartButtonListeners() {
        const restartButtons = document.querySelectorAll('.restartButton');
        restartButtons.forEach(restartButton => {
            restartButton.addEventListener('click', restart);
            restartButton.addEventListener('click', () => {
                alertPopupClose('gameFinished');
            });
        });
    }
});