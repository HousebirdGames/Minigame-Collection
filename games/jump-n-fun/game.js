/*The Minigame Collection was created and published by Felix T. Vogel in 2023*/

import { alertPopup, addPointsAndUpdate, displayBackButtons, redirectIfLocked, setRules } from '/minigame-collection/src/main.js?v=2.8.1.1';

document.addEventListener("DOMContentLoaded", () => {
    redirectIfLocked('jump-n-fun');
    displayBackButtons();

    setRules(`
    <p>In Jump 'n' Fun, you control a character that must jump over obstacles and collect coins.</p>
    <br>
    <p>Click anywhere on the game window to make the character jump.</p>
    <br>
    <p>Collecting points while jumping over the obstacles.</p>
    <br>
    <p>Continue to navigate the character through the endless obstacle course, accumulating points along the way.</p>
    <br>
    <p>If the character collides with an obstacle, the game ends.</p>
    <br>
    <p><strong>Objective:</strong> Jump over obstacles and collect points. Have fun!</p>
    `);

    const character = document.getElementById('character');
    const game = document.getElementById('game');
    let isJumping = false;
    let velocityY = 0;
    let prevTimestamp = null;
    let deltaTime = 0;
    let isRunning = false;
    const targetFrameRate = 100;
    const frameDuration = 1000 / targetFrameRate;
    const jumpForce = 800;
    const gravity = -1500;
    let lastFrameTime = 0;
    const frameDebounce = 1000 / targetFrameRate;

    const restartButton = document.querySelector('.restartButton');
    if (restartButton) {
        restartButton.addEventListener("click", () => {
            restart();
        });
    }

    game.addEventListener('click', (event) => {
        if (!isRunning) {
            restart();
        }
        else {
            jump();
        }
    });

    function restart() {
        if (restartButton) {
            restartButton.textContent = "Restart";
        }
        isRunning = true;
        character.style.bottom = '0';
        isJumping = false;
        prevTimestamp = null;
        obstaclePool.forEach(obstacle => {
            obstacle.style.display = 'none';
            obstacle.style.right = '-30px';
            obstacle.prevTimestamp = null;
        });
        coinPool.forEach(coin => {
            coin.style.display = 'none';
            coin.style.right = '-20px';
            coin.classList.remove('coin-hit');
            coin.prevTimestamp = null;
        });
        requestAnimationFrame(update);
        spawnObstacles();
        characterAnimator.start();
    }

    function jump() {
        if (isJumping) return;
        isJumping = true;
        velocityY = jumpForce;
        update(performance.now());
    }

    function update(timestamp) {
        if (timestamp - lastFrameTime < frameDebounce) {
            requestAnimationFrame(update);
            return;
        }
        lastFrameTime = timestamp;

        if (prevTimestamp === null) {
            prevTimestamp = timestamp;
        }
        deltaTime = (timestamp - prevTimestamp) / 1000;
        prevTimestamp = timestamp;

        velocityY += gravity * deltaTime;
        const deltaY = velocityY * deltaTime;
        const currentBottom = parseInt(window.getComputedStyle(character).bottom);
        const newBottom = Math.max(currentBottom + deltaY, 0);

        character.style.bottom = `${newBottom}px`;

        if (newBottom === 0) {
            isJumping = false;
            characterAnimator.resume();
        }
        else if (isJumping) {
            characterAnimator.pause();
        }

        if (isRunning) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);

    const characterAnimator = new SpriteAnimator(character, {
        frameCount: 8,
        frameDuration: 40,
        orientation: 'horizontal',
        jumpingFrame: 0,
        firstFrame: 4,
        requestAnimationFrameCallback: (fn) => {
            requestAnimationFrame(() => {
                if (!isRunning) return;
                fn();
            });
        },
    });

    function gameOver() {
        isRunning = false;
        characterAnimator.stop();
        removeAllCoins();
        clearTimeouts();
        alertPopup("Game over");
    }

    function clearTimeouts() {
        let id = setTimeout(() => { }, 0);
        while (id--) {
            clearTimeout(id);
        }
    }

    function spawnObstacles() {
        if (!isRunning) return;

        const interval = Math.random() * 3000 + 1000;
        setTimeout(() => {
            createObstacle();
            createCoin();
            spawnObstacles();
        }, interval);
    }

    const obstaclePool = [];
    const poolSize = 4;
    const obstacleMinHeight = 30;
    const obstacleMaxHeight = 100;
    const obstacleSpeed = 300;

    initObstaclePool();

    function initObstaclePool() {
        for (let i = 0; i < poolSize; i++) {
            const obstacle = document.createElement('div');
            obstacle.classList.add('obstacle');
            obstacle.style.display = 'none';
            game.appendChild(obstacle);
            obstaclePool.push(obstacle);
        }
    }

    const coinPool = [];
    initCoinPool();

    function initCoinPool() {
        for (let i = 0; i < poolSize; i++) {
            const coin = document.createElement('div');
            coin.classList.add('coin');
            coin.style.display = 'none';
            game.appendChild(coin);
            coinPool.push(coin);
        }
    }

    function createObstacle() {
        const obstacle = obstaclePool.find(o => o.style.display === 'none');
        if (!obstacle) return;

        const height = Math.random() * (obstacleMaxHeight - obstacleMinHeight) + obstacleMinHeight;
        obstacle.style.height = `${height}px`;
        obstacle.style.right = `-30px`;
        obstacle.style.display = 'block';

        moveObstacle(obstacle);
    }

    function moveObstacle(obstacle) {
        const move = (timestamp) => {
            if (!isRunning) {
                obstacle.prevTimestamp = null;
                return;
            }

            if (!obstacle.prevTimestamp) {
                obstacle.prevTimestamp = timestamp;
            }

            const deltaTime = (timestamp - obstacle.prevTimestamp) / 1000;
            obstacle.prevTimestamp = timestamp;

            const currentRight = parseInt(window.getComputedStyle(obstacle).right);
            const newRight = currentRight + obstacleSpeed * deltaTime;

            if (newRight > game.clientWidth + obstacle.clientWidth) {
                obstacle.style.display = 'none';
                obstacle.prevTimestamp = null;
                return;
            }

            obstacle.style.right = `${newRight}px`;

            if (checkCollision(obstacle)) {
                gameOver();
                return;
            }

            requestAnimationFrame(move);
        };

        requestAnimationFrame(move);
    }

    function checkCollision(obstacle) {
        const characterRect = character.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();
        return (
            characterRect.left < obstacleRect.right &&
            characterRect.right - 10 > obstacleRect.left &&
            characterRect.top < obstacleRect.bottom &&
            characterRect.bottom - 10 > obstacleRect.top
        );
    }

    function createCoin() {
        const coin = coinPool.find(c => c.style.display === 'none');
        if (!coin) return;

        const minHeight = 130;
        const maxHeight = 160;
        const height = Math.random() * (maxHeight - minHeight) + minHeight;
        coin.style.bottom = `${height}px`;
        coin.style.right = `-24px`;
        coin.style.display = 'block';

        moveCoin(coin);
    }

    function moveCoin(coin) {
        const move = (timestamp) => {
            if (!isRunning) {
                coin.prevTimestamp = null;
                return;
            }

            if (!coin.prevTimestamp) {
                coin.prevTimestamp = timestamp;
            }

            const deltaTime = (timestamp - coin.prevTimestamp) / 1000;
            coin.prevTimestamp = timestamp;

            const currentRight = parseInt(window.getComputedStyle(coin).right);
            const newRight = currentRight + obstacleSpeed * deltaTime;

            if (newRight > game.clientWidth + coin.clientWidth) {
                coin.style.display = 'none';
                coin.prevTimestamp = null;
                return;
            }

            coin.style.right = `${newRight}px`;

            if (checkCoinCollision(coin)) {
                addPointsAndUpdate(1);
                playCoinAnimation(coin);
                return;
            }

            requestAnimationFrame(move);
        };

        requestAnimationFrame(move);
    }

    function removeAllCoins() {
        coinPool.forEach(coin => {
            coin.style.display = 'none';
            coin.prevTimestamp = null;
        });
    }

    function checkCoinCollision(coin) {
        const characterRect = character.getBoundingClientRect();
        const coinRect = coin.getBoundingClientRect();
        return (
            characterRect.left < coinRect.right &&
            characterRect.right > coinRect.left &&
            characterRect.top < coinRect.bottom &&
            characterRect.bottom > coinRect.top
        );
    }

    function playCoinAnimation(coin) {
        coin.classList.add('coin-hit');

        setTimeout(() => {
            coin.classList.remove('coin-hit');
            coin.style.display = 'none';
            coin.prevTimestamp = null;
        }, 1100);
    }
});

class SpriteAnimator {
    constructor(element, options) {
        this.element = element;
        this.firstFrame = options.firstFrame || 0;
        this.frameCount = options.frameCount || 1;
        this.frameDuration = options.frameDuration || 100;
        this.orientation = options.orientation || 'horizontal';
        this.jumpingFrame = options.jumpingFrame || 0;
        this.currentFrame = this.firstFrame;
        this.paused = false;
        this.shouldPause = false;
        this.stopped = false;

        this.updateBackgroundPosition();
    }

    updateBackgroundPosition() {
        const frameSize = parseInt(
            window.getComputedStyle(this.element)[
            this.orientation === 'horizontal' ? 'width' : 'height'
            ]
        );

        const newPosition = -(this.currentFrame * frameSize);
        this.element.style.backgroundPosition =
            this.orientation === 'horizontal'
                ? `${newPosition}px 0`
                : `0 ${newPosition}px`;
    }

    start() {
        this.stopped = false;
        this.animateSprite();
    }

    animateSprite() {
        if (this.stopped) {
            return;
        }

        if (!this.paused) {
            this.updateBackgroundPosition();

            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
            if (this.shouldPause && this.currentFrame == this.jumpingFrame) {
                this.paused = true;
            }
        }

        setTimeout(() => {
            requestAnimationFrame(this.animateSprite.bind(this));
        }, this.frameDuration);
    }

    pause() {
        this.shouldPause = true;
    }

    stop() {
        this.stopped = true;
    }

    resume() {
        this.paused = false;
        this.shouldPause = false;
    }
}
