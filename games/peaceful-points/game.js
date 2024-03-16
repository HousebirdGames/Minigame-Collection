/*The Minigame Collection was created and published by Felix T. Vogel in 2023*/

import { alertPopup, addPointsAndUpdate, displayBackButtons, redirectIfLocked, setRules } from '/minigame-collection/src/main.js?v=2.8.1.1';

document.addEventListener("DOMContentLoaded", () => {
    redirectIfLocked('peaceful-points');
    displayBackButtons();

    setRules(`
    <p>In Peaceful Points, you'll see colorful points floating upwards from the bottom of the game window.</p>
    <br>
    <p>Click on the floating points to earn points as they move towards the top of the screen.</p>
    <br>
    <p>If a point reaches the top of the screen without being clicked, it will disappear.</p>
    <br>
    <p><strong>Objective:</strong> Click on the floating points to accumulate points and challenge yourself to improve your accuracy and reaction time. Have fun!</p>
    `);

    const game = document.getElementById('game');
    const pointPool = [];
    const targetFrameRate = 1000 / 60;

    const maxPoolSize = 1;

    initializePoints();

    function initializePoints() {
        for (let index = 0; index < maxPoolSize; index++) {
            createPoint();
        }
    }

    function createPoint() {
        let point;
        if (pointPool.length >= maxPoolSize) {
            return;
        }
        else {
            point = document.createElement("div");
            point.classList.add("point");
            point.style.display = 'none';
            pointPool.push(point);
            game.appendChild(point);
            movePoint(point);
            point.addEventListener("click", () => {
                if (!point.classList.contains('point-hit') && parseFloat(point.style.bottom) < game.clientHeight) {
                    playPointAnimation(point);
                    addPointsAndUpdate(1);
                    setTimeout(() => {
                        point.style.display = 'none';
                        point.prevTimestamp = null;
                    }, 1200);
                }
            });
        }
    }

    function spawnPoint() {
        pointPool.some(point => {
            if (point.style.display == 'none') {
                point.classList.remove('fade-out');
                point.classList.add('fade-in');
                point.style.backgroundColor = getRandomColor();
                point.prevTimestamp = null;

                const minLeftMargin = 20;
                const maxLeftMargin = game.clientWidth - 50 - 20;
                point.style.left = `${minLeftMargin + Math.random() * (maxLeftMargin - minLeftMargin)}px`;

                point.style.bottom = "-50px";
                point.style.display = 'block';
                return true;
            }
            return false;
        });
    }

    function getRandomColor() {
        const colors = ["rgb(212, 126, 214)", "rgb(84, 200, 148)", "rgb(208, 178, 80)", "var(--background-secondary)"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function movePoint(point) {
        if (!point.classList.contains('point-hit')) {
            point.prevTimestamp = null;
            point.update = function (deltaTime) {
                if (point.prevTimestamp === null) {
                    point.prevTimestamp = deltaTime;
                }

                const currentBottom = parseFloat(point.style.bottom);
                const newBottom = currentBottom + 1.5 * (deltaTime - point.prevTimestamp) / targetFrameRate;
                point.style.bottom = `${newBottom}px`;

                if (newBottom > game.clientHeight && !point.classList.contains('fade-out') && !point.classList.contains('point-hit')) {
                    point.classList.remove('fade-in');
                    point.classList.add('fade-out');
                    setTimeout(() => {
                        point.style.display = 'none';
                        point.classList.remove('fade-out');
                    }, 1200);
                } else {
                    point.prevTimestamp = deltaTime;
                }
            };
        }
    }

    let lastSpawnTime = null;
    const minSpawnInterval = 500;
    const maxSpawnInterval = 2000;
    let nextSpawnInterval = Math.random() * (maxSpawnInterval - minSpawnInterval) + minSpawnInterval;

    function update(timestamp) {
        for (const point of pointPool) {
            if (point.style.display !== 'none') {
                point.update(timestamp);
            }
        }

        if (lastSpawnTime === null || (timestamp - lastSpawnTime) > nextSpawnInterval) {
            spawnPoint();
            lastSpawnTime = timestamp;
            nextSpawnInterval = Math.random() * (maxSpawnInterval - minSpawnInterval) + minSpawnInterval;
        }

        requestAnimationFrame(update);
    }

    requestAnimationFrame(update);

    function playPointAnimation(point) {
        point.classList.remove('fade-out');
        point.classList.remove('fade-in');
        point.classList.add('point-hit');

        setTimeout(() => {
            point.classList.remove('point-hit');
        }, 1200);
    }
});