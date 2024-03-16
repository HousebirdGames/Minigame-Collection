/*The Minigame Collection was created and published by Felix T. Vogel in 2023*/

import { alertPopup, addPointsAndUpdate, displayBackButtons, redirectIfLocked, setRules, alertPopupClose } from '/minigame-collection/src/main.js?v=2.8.1.1';

document.addEventListener("DOMContentLoaded", () => {
    redirectIfLocked('memory-match');
    displayBackButtons();

    setRules(`
    <p>In Memory Match, the player takes turns flipping over pairs of cards featuring numbers, aiming to find matching pairs. Once a matching pair is discovered, the cards stay flipped over. The game progresses until all pairs have been found.</p>
    <br>
    <p>You can increase or decrease the number of rows by clicking the buttons below. The number of rows determines the points you earn. The more rows, the higher the points.</p>
    <br>
    <p><strong>Objective:</strong> Find all matching pairs. Have fun!</p>
    `);

    let cardNumbers;
    let rowNumber = 2;

    addRestartButtonListeners();

    function addRestartButtonListeners() {
        const restartButtons = document.querySelectorAll('.restartButton');
        restartButtons.forEach(restartButton => {
            restartButton.addEventListener('click', async () => {
                alertPopupClose('gameFinished');
                const gameBoard = document.querySelector('.game-board');
                gameBoard.classList.remove('fade-in');
                gameBoard.classList.add('fade-out');
                await new Promise(resolve => setTimeout(resolve, 1200));
                restart();
            });
        });
    }

    restart();

    function restart() {
        clearGameBoard();
        cardNumbers = generateCardNumbers(rowNumber);
        const shuffledCards = shuffle(cardNumbers);
        createCards(shuffledCards);
    }

    function generateCardNumbers(numRows) {
        const numCards = numRows * 4;
        const pairs = numCards / 2;
        const cardNumbers = [];

        for (let i = 1; i <= pairs; i++) {
            cardNumbers.push(i, i);
        }

        return cardNumbers;
    }

    const addRowButton = document.querySelector('#add-row');
    addRowButton.addEventListener('click', async () => {
        if (rowNumber < 6) {
            rowNumber++;
            const gameBoard = document.querySelector('.game-board');
            gameBoard.classList.remove('fade-in');
            gameBoard.classList.add('fade-out');
            await new Promise(resolve => setTimeout(resolve, 1200));
            restart(rowNumber);
            checkRowButtons();
        }
    });

    const removeRowButton = document.querySelector('#remove-row');
    removeRowButton.addEventListener('click', async () => {
        if (rowNumber > 2) {
            rowNumber--;
            const gameBoard = document.querySelector('.game-board');
            gameBoard.classList.remove('fade-in');
            gameBoard.classList.add('fade-out');
            await new Promise(resolve => setTimeout(resolve, 1200));
            restart(rowNumber);
        }
        checkRowButtons();
    });

    checkRowButtons();

    function checkRowButtons() {
        const numRows = document.querySelectorAll('.cards-row').length;

        if (removeRowButton) {
            if (numRows > 2) {
                removeRowButton.disabled = false;
            }
            else {
                removeRowButton.disabled = true;
            }
        }

        if (addRowButton) {
            if (numRows < 6) {
                addRowButton.disabled = false;
            }
            else {
                addRowButton.disabled = true;
            }
        }
    }

    async function createCards(cards) {
        const gameBoard = document.querySelector('.game-board');
        const numRows = cards.length / 4;

        for (let i = 0; i < numRows; i++) {
            const cardsRow = document.createElement('div');
            cardsRow.classList.add('cards-row');
            gameBoard.appendChild(cardsRow);

            cardsRow.innerHTML = cards
                .slice(i * 4, i * 4 + 4)
                .map(
                    (number, index) =>
                        `<div class="card" data-index="${index + i * 4}">
                            <div class="card-face card-front">
                                <div class="card-number">${number}</div>
                            </div>
                            <div class="card-face card-back"></div>
                        </div>`
                )
                .join('');

            const cardElements = cardsRow.querySelectorAll('.card');
            cardElements.forEach((card) => {
                card.addEventListener('click', handleCardClick);
            });
        }
        gameBoard.classList.remove('fade-out');
        gameBoard.classList.add('fade-in');
    }

    function clearGameBoard() {
        const gameBoard = document.querySelector('.game-board');
        const rows = gameBoard.querySelectorAll('.cards-row');
        rows.forEach(row => row.remove());
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    let firstCard, secondCard;
    let isFlipping = false;

    function handleCardClick() {
        if (isFlipping) return;

        this.classList.add('flipped');
        this.classList.add('click');

        if (!firstCard) {
            firstCard = this;
        } else {
            secondCard = this;
            isFlipping = true;

            setTimeout(() => {
                checkMatch();
                this.classList.remove('click');
            }, 640);
        }
    }

    function checkMatch() {
        if (firstCard.querySelector('.card-number').textContent === secondCard.querySelector('.card-number').textContent) {
            firstCard.removeEventListener('click', handleCardClick);
            secondCard.removeEventListener('click', handleCardClick);
            firstCard.classList.add('right');
            secondCard.classList.add('right');
        } else {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
        }

        firstCard = null;
        secondCard = null;
        isFlipping = false;

        const allCards = document.querySelectorAll('.card');
        const flippedCards = document.querySelectorAll('.card.right');
        if (allCards.length === flippedCards.length) {
            const points = 5 * document.querySelectorAll('.cards-row').length;
            finishGame("Congratulations! You've earned " + points + " points.", points);
        }
    }

    async function finishGame(message, points) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alertPopup(message, `
            <br>
            <button class="restartButton">Restart</button>
            `, 'gameFinished');
        if (points) {
            addPointsAndUpdate(points);
        }
        addRestartButtonListeners();
    }
});