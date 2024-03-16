/*The Minigame Collection was created and published by Felix T. Vogel in 2023*/

import { alertPopup, addPointsAndUpdate, displayBackButtons, redirectIfLocked, setRules, alertPopupClose } from '/minigame-collection/src/main.js?v=2.8.1.1';

let restarting = false;

document.addEventListener("DOMContentLoaded", () => {
    redirectIfLocked('ten-cards');
    displayBackButtons();

    setRules(`
    <p>In Ten Cards, two players take turns flipping one card at a time from a row containing cards numbered one
															                to five, arranged in random order. The number on each flipped card is added to the player's score.</p>
				<br>
				<p>The game concludes when all cards have been flipped, and the player with the highest score is declared
															                the winner.</p>
                                                                            <br>
    <p><strong>Objective:</strong> Gather a higher score than the other player. Have fun!</p>
`);

    window.cardsGame = new CardsGame('easy');

    const difficultyButtons = document.querySelectorAll('.difficulty-button');
    if (difficultyButtons) {
        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                restart(button.dataset.difficulty);
            });
        });
    }
})

class CardsGame {
    constructor(aiDifficulty = null) {
        this.playerTurn = true;
        this.playerPoints = 0;
        this.opponentPoints = 0;
        this.playerCards = this.generateCards();
        this.animationPlaying = false;
        this.opponentCards = this.generateCards();
        this.playerFlipped = Array(5).fill(false);
        this.opponentFlipped = Array(5).fill(false);
        this.cardsGame = document.getElementById("cardsGame");
        this.aiDifficulty = aiDifficulty;

        if (aiDifficulty) {
            this.ai = new AI(aiDifficulty);
        } else {
            this.ai = null;
        }

        this.difficultyMultiplier = 1;
        if (this.ai) {
            if (aiDifficulty === "easy") {
                this.difficultyMultiplier = 1;
            }
            else if (aiDifficulty === "medium") {
                this.difficultyMultiplier = 2;
            }
            else if (aiDifficulty === "hard") {
                this.difficultyMultiplier = 5;
            }
        }

        this.render();
        this.checkIfAIStarts();
    }

    checkIfAIStarts() {
        if (this.ai) {
            if (Math.random() < 0.5) {
                this.playerTurn = false;
                setTimeout(() => {
                    const { isPlayer, index } = this.ai.chooseCard(this.playerCards, this.playerFlipped, this.opponentCards, this.opponentFlipped);
                    this.flipCard(isPlayer, index);
                    this.addCardListeners();
                }, 600);
            }
        }
    }

    generateCards() {
        return Array.from({ length: 5 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    }

    flipCard(isPlayer, index) {
        if (this.animationPlaying) return;
        this.animationPlaying = true;

        if (this.playerTurn) {
            if (isPlayer) {
                this.playerPoints += this.playerCards[index];
            } else {
                this.playerPoints += this.opponentCards[index];
            }
        } else {
            if (isPlayer) {
                this.opponentPoints += this.playerCards[index];
            } else {
                this.opponentPoints += this.opponentCards[index];
            }
        }

        this.playerTurn = !this.playerTurn;

        const card = isPlayer
            ? document.querySelector(`.cards-row:nth-child(3) .card[data-index="${index}"]`)
            : document.querySelector(`.cards-row:nth-child(2) .card[data-index="${index}"]`);

        card.classList.add("flipped");

        if (isPlayer) {
            this.playerFlipped[index] = true;
        } else {
            this.opponentFlipped[index] = true;
        }

        setTimeout(() => {
            this.animationPlaying = false;
            if (this.playerFlipped.every(f => f) && this.opponentFlipped.every(f => f)) {
                this.render();
                this.endGame();
            } else {
                if (!this.playerTurn && this.ai && !restarting) {
                    this.render();
                    setTimeout(() => {
                        const { isPlayer, index } = this.ai.chooseCard(this.playerCards, this.playerFlipped, this.opponentCards, this.opponentFlipped);
                        this.flipCard(isPlayer, index);
                        this.addCardListeners();
                    }, 600);
                }
            }
            this.render();
        }, 600);

        this.addCardListeners();
    }

    endGame() {
        setTimeout(() => {
            let result;
            if (this.playerPoints > this.opponentPoints) {
                if (this.ai) {
                    const points = 20 * this.difficultyMultiplier;
                    addPointsAndUpdate(points);
                    result = "You won! You earned " + points + " points.";
                }
                else {
                    result = "Player One won!";
                }
            } else if (this.playerPoints < this.opponentPoints) {
                if (this.ai) {
                    result = "You lost!";
                }
                else {
                    result = "Player Two won!";
                }
            } else {
                result = "It's a tie!";
            }

            alertPopup(result, `
            <br>
            <button class="restartButton">Restart</button>
            `, 'gameFinished');
            this.addRestartListeners()
        }, 1000);
    }

    render() {
        if (restarting) {
            return;
        }
        const gameSelection = document.getElementById("gameSelection");
        if (gameSelection) {
            if (this.ai) {
                gameSelection.textContent = 'You are playing against ' + this.ai.difficulty + ' AI';
            }
            else {
                gameSelection.textContent = 'Local Multiplayer';
            }
        }

        if (this.ai) {
            this.cardsGame.innerHTML = `
            <p class="restartEffect">Opponents Score: ${this.opponentPoints}</p>
            <div class="cards-row restartEffect">
                ${this.opponentCards.map((card, i) => `<div class="noGlitch card${this.opponentFlipped[i] ? " flipped" : ""}" data-index="${i}" data-player="false"><div class="card-face card-back"></div><div class="card-face card-front"><span class="card-number">${card}</span></div></div>`).join('')}
            </div>
            <div class="cards-row restartEffect">
                ${this.playerCards.map((card, i) => `<div class="noGlitch card${this.playerFlipped[i] ? " flipped" : ""}" data-index="${i}" data-player="true"><div class="card-face card-back"></div><div class="card-face card-front"><span class="card-number">${card}</span></div></div>`).join('')}
            </div>
            <p class="restartEffect">Your Score: ${this.playerPoints}</p>
            <br>
        `;
        }
        else {
            this.cardsGame.innerHTML = `
            <p class="restartEffect">Player One Score: ${this.playerPoints}</p>
            <div class="cards-row restartEffect">
                ${this.opponentCards.map((card, i) => `<div class="noGlitch card${this.opponentFlipped[i] ? " flipped" : ""}" data-index="${i}" data-player="false"><div class="card-face card-back"></div><div class="card-face card-front"><span class="card-number">${card}</span></div></div>`).join('')}
            </div>
            <div class="cards-row restartEffect">
                ${this.playerCards.map((card, i) => `<div class="noGlitch card${this.playerFlipped[i] ? " flipped" : ""}" data-index="${i}" data-player="true"><div class="card-face card-back"></div><div class="card-face card-front"><span class="card-number">${card}</span></div></div>`).join('')}
            </div>
            <p class="restartEffect">Player Two Score: ${this.opponentPoints}</p>
            <br>
            `;
        }

        this.addRestartListeners();
        this.addCardListeners();
    }

    addRestartListeners() {
        const restartButtons = document.querySelectorAll('.restartButton');
        restartButtons.forEach(restartButton => {
            restartButton.addEventListener('click', () => {
                restart(this.aiDifficulty);
            });
        });
    }

    cardClickListener(e) {
        if (!this.playerTurn && this.ai) return;
        const cardElement = e.target.closest('.card');
        const isPlayer = cardElement.dataset.player === "true";
        const index = parseInt(cardElement.dataset.index, 10);

        if (isPlayer ? !this.playerFlipped[index] : !this.opponentFlipped[index]) {
            this.flipCard(isPlayer, index);
        }
    }

    addCardListeners() {
        const cards = document.querySelectorAll(".card");
        cards.forEach(card => {
            // Remove the existing event listener
            card.removeEventListener("click", this.cardClickListener.bind(this));

            // Add the new event listener
            card.addEventListener("click", this.cardClickListener.bind(this));
        });
    }
}

function restart(difficulty) {
    if (restarting) {
        return;
    }
    alertPopupClose('gameFinished');
    restarting = true;
    const restartEffectElements = document.querySelectorAll(".restartEffect");

    restartEffectElements.forEach(element => {
        element.classList.add("fade-out");
        element.classList.remove("fade-in");
    });

    setTimeout(() => {
        restarting = false;
        window.cardsGame = new CardsGame(difficulty);
        const restartEffectElements = document.querySelectorAll(".restartEffect");
        restartEffectElements.forEach(element => {
            element.classList.remove("fade-out");
            element.classList.add("fade-in");
        });
    }, 1000);
}

class AI {
    constructor(difficulty = 'easy') {
        this.difficulty = difficulty;
    }

    chooseCard(playerCards, playerFlipped, opponentCards, opponentFlipped) {
        if (this.difficulty === 'easy') {
            return this.chooseCardEasy(playerCards, playerFlipped, opponentCards, opponentFlipped);
        } else if (this.difficulty === 'hard') {
            return this.chooseCardHard(playerCards, playerFlipped, opponentCards, opponentFlipped);
        } else {
            const highestCard = this.chooseHighestCard(playerCards, playerFlipped, opponentCards, opponentFlipped);
            if (highestCard) {
                return highestCard;
            }
            return this.chooseCardRandom(playerCards, playerFlipped, opponentCards, opponentFlipped);
        }
    }

    chooseCardEasy(playerCards, playerFlipped, opponentCards, opponentFlipped) {
        if (Math.random() < 0.4) {
            return this.chooseCardRandom(playerCards, playerFlipped, opponentCards, opponentFlipped);
        }

        let min = Infinity;
        let index = -1;
        let isPlayer = false;

        playerCards.forEach((card, i) => {
            if (!playerFlipped[i] && card < min) {
                min = card;
                index = i;
                isPlayer = true;
            }
        });

        opponentCards.forEach((card, i) => {
            if (!opponentFlipped[i] && card < min) {
                min = card;
                index = i;
                isPlayer = false;
            }
        });

        if (index == -1) {
            return this.chooseCardRandom(playerCards, playerFlipped, opponentCards, opponentFlipped);
        }
        else {
            return { isPlayer, index };
        }
    }

    chooseCardHard(playerCards, playerFlipped, opponentCards, opponentFlipped) {
        const highestCard = this.chooseHighestCard(playerCards, playerFlipped, opponentCards, opponentFlipped);
        if (highestCard) {
            return highestCard;
        }

        if (Math.random() < 0.2) {
            return this.chooseCardRandom(playerCards, playerFlipped, opponentCards, opponentFlipped);
        }

        let max = -Infinity;
        let index = -1;
        let isPlayer = false;

        playerCards.forEach((card, i) => {
            if (!playerFlipped[i] && card > max) {
                max = card;
                index = i;
                isPlayer = true;
            }
        });

        opponentCards.forEach((card, i) => {
            if (!opponentFlipped[i] && card > max) {
                max = card;
                index = i;
                isPlayer = false;
            }
        });

        if (index == -1) {
            return this.chooseCardRandom(playerCards, playerFlipped, opponentCards, opponentFlipped);
        }
        else {
            return { isPlayer, index };
        }
    }

    chooseCardRandom(playerCards, playerFlipped, opponentCards, opponentFlipped) {
        const unflippedIndicesPlayer = playerCards.map((card, i) => !playerFlipped[i] ? i : -1).filter(i => i !== -1);
        const unflippedIndicesOpponent = opponentCards.map((card, i) => !opponentFlipped[i] ? i : -1).filter(i => i !== -1);

        const totalUnflipped = unflippedIndicesPlayer.length + unflippedIndicesOpponent.length;
        const randomIndex = Math.floor(Math.random() * totalUnflipped);

        if (randomIndex < unflippedIndicesPlayer.length) {
            return { isPlayer: true, index: unflippedIndicesPlayer[randomIndex] };
        } else {
            return { isPlayer: false, index: unflippedIndicesOpponent[randomIndex - unflippedIndicesPlayer.length] };
        }
    }

    chooseHighestCard(playerCards, playerFlipped, opponentCards, opponentFlipped) {
        let highestCardIndex = -1;
        let highestCardValue = -Infinity;
        let isPlayer = false;

        const allUnflippedCards = [
            ...playerCards.filter((card, i) => !playerFlipped[i]),
            ...opponentCards.filter((card, i) => !opponentFlipped[i])
        ];

        playerCards.forEach((card, i) => {
            if (!playerFlipped[i] && card > highestCardValue && card > Math.max(...allUnflippedCards)) {
                highestCardValue = card;
                highestCardIndex = i;
                isPlayer = true;
            }
        });

        opponentCards.forEach((card, i) => {
            if (!opponentFlipped[i] && card > highestCardValue && card > Math.max(...allUnflippedCards)) {
                highestCardValue = card;
                highestCardIndex = i;
                isPlayer = false;
            }
        });

        if (highestCardIndex !== -1) {
            return { isPlayer, index: highestCardIndex };
        }

        return null;
    }
}