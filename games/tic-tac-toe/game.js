/*The Minigame Collection was created and published by Felix T. Vogel in 2023*/

import { alertPopup, addPointsAndUpdate, displayBackButtons, redirectIfLocked, setRules, alertPopupClose } from '/minigame-collection/src/main.js?v=2.8.1.1';

document.addEventListener("DOMContentLoaded", () => {
    redirectIfLocked('tic-tac-toe');
    displayBackButtons();

    setRules(`
    <p>The game board consists of a 3x3 grid.</p>
    <br>
    <p>Two players take turns placing their respective symbols (X or O) in an empty cell on the grid.</p>
    <br>
    <p>The first player to get three of their symbols in a row (horizontally, vertically, or diagonally) wins the game.</p>
    <br>
    <p>If all cells are filled and no player has achieved a winning combination, the game ends in a draw.</p>
    <br>
    <p><strong>Objective:</strong> Be the first player to align three of your symbols in a row to win the game. Have fun!</p>
`);

    // Add the game modes
    const GameMode = {
        LOCAL_MULTIPLAYER: 'local-multiplayer',
        EASY: 'easy',
        MEDIUM: 'medium',
        HARD: 'hard'
    };

    let gameMode = GameMode.EASY;

    const difficultyButtons = document.querySelectorAll('.difficulty-button');
    difficultyButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const difficulty = event.target.getAttribute('data-difficulty');
            if (difficulty === '') {
                gameMode = GameMode.LOCAL_MULTIPLAYER;
                playerMark = 'o';
            } else {
                gameMode = difficulty;
            }
            updateGameModeText();
            resetGame();
        });
    });

    const cells = document.querySelectorAll('.cell');
    const boardElement = document.querySelector('.board');
    let aiTurnInProgress = false;
    let blockPlayer = false;

    addRestartButtonListeners();
    updateGameModeText();

    function addRestartButtonListeners() {
        const restartButtons = document.querySelectorAll('.restartButton');
        restartButtons.forEach(restartButton => {
            restartButton.addEventListener('click', resetGame);
            restartButton.addEventListener('click', () => {
                alertPopupClose('gameFinished');
            });
        });
    }

    let board = [];
    let playerMark = 'o';
    let aiMark = 'x';

    async function resetGame(spinEffect = true) {
        blockPlayer = true;
        board = ['', '', '', '', '', '', '', '', ''];
        if (boardElement && spinEffect) {
            boardElement.classList.remove('spin');
            await new Promise(resolve => setTimeout(resolve, 100));
            boardElement.classList.add('spin');
        }
        cells.forEach(cell => {
            const mark = cell.querySelector('.mark');
            mark.classList.remove('pop-in');
            mark.textContent = '';
            cell.removeAttribute('data-mark');
            cell.classList.remove('click');
            cell.style.opacity = 1;
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (gameMode === GameMode.LOCAL_MULTIPLAYER) {
            blockPlayer = false;
        } else {
            if (Math.random() < 0.5) {
                aiMark = 'o';
                playerMark = 'x';
                aiMove(false);
            } else {
                aiMark = 'x';
                playerMark = 'o';
                blockPlayer = false;
            }
        }
    }

    function updateGameModeText() {
        const gameSelection = document.getElementById("gameSelection");
        if (gameSelection) {
            if (gameMode === GameMode.LOCAL_MULTIPLAYER) {
                gameSelection.textContent = 'Local Multiplayer';
            }
            else {
                gameSelection.textContent = 'You are playing against ' + gameMode + ' AI';
            }
        }
    }

    function gameOver() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return false;
    }

    async function aiMove(wait = true) {
        if (aiTurnInProgress) {
            return;
        }
        aiTurnInProgress = true;
        if (wait) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (!checkWinner()) {
            let index;
            if (gameMode === GameMode.EASY) {
                index = getRandomMove();
            } else if (gameMode === GameMode.MEDIUM) {
                if (Math.random() < 0.3) {
                    index = getRandomMove();
                } else {
                    index = findBestMove();
                }
            } else {
                index = findBestMove();
            }

            board[index] = aiMark;
            const mark = cells[index].querySelector('.mark');
            mark.textContent = aiMark;
            mark.classList.add('pop-in');
            cells[index].classList.add('click');
            cells[index].setAttribute('data-mark', aiMark);
            checkWinner();
        }
        aiTurnInProgress = false;
        blockPlayer = false
    }

    function getRandomMove() {
        const availableIndices = board.reduce((acc, value, idx) => {
            if (value === '') {
                acc.push(idx);
            }
            return acc;
        }, []);
        return availableIndices[Math.floor(Math.random() * availableIndices.length)];
    }

    function isDraw() {
        return board.every(cell => cell !== '');
    }

    function findBestMove() {
        let bestScore = -Infinity;
        let bestMove;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = aiMark;
                const score = minimax(board, 0, false);
                board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    }

    function minimax(board, depth, isMaximizing) {
        const winner = gameOver();
        if (winner) {
            if (winner === aiMark) {
                return 1;
            } else if (winner === playerMark) {
                return -1;
            }
        } else if (isDraw()) {
            return 0;
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = aiMark;
                    const score = minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = playerMark;
                    const score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }


    cells.forEach(cell => {
        cell.addEventListener('click', async () => {
            if (cell.getAttribute('data-mark') || gameOver() || aiTurnInProgress || blockPlayer) return;
            const index = cell.getAttribute('data-index');
            board[index] = playerMark;
            const mark = cell.querySelector('.mark');
            mark.textContent = playerMark;
            mark.classList.add('pop-in');
            cell.classList.add('click');
            cell.setAttribute('data-mark', playerMark);

            if (gameMode === GameMode.LOCAL_MULTIPLAYER) {
                if (!checkWinner()) {
                    playerMark = playerMark === 'x' ? 'o' : 'x';
                }
            } else {
                if (!checkWinner()) {
                    await aiMove();
                }
            }
        });
    });

    function checkWinner() {
        const winnerMark = gameOver();

        let points = 0;
        if (gameMode === GameMode.EASY) {
            points = 10;
        }
        else if (gameMode === GameMode.MEDIUM) {
            points = 20;
        }
        else if (gameMode === GameMode.HARD) {
            points = 40;
        }

        if (winnerMark) {
            if (gameMode === GameMode.LOCAL_MULTIPLAYER) {
                finishGame(winnerMark + "-Player wins!");
            }
            else {
                if (winnerMark === playerMark) {
                    finishGame(`You win and receive ${points} Points!`, points);
                }
                else if (winnerMark === aiMark) {
                    finishGame("Let's try again!");
                }
            }
            return true;
        }
        else if (isDraw()) {
            if (gameMode === GameMode.LOCAL_MULTIPLAYER) {
                finishGame("It's a draw.");
            }
            else {
                finishGame(`It's a draw. You receive ${points * 0.5} points`, points * 0.5);
            }
            return true;
        }
        return false;
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

    resetGame(false);
});