/*The Minigame Collection was created and published by Felix T. Vogel in 2023*/

import { alertPopup, addPointsAndUpdate, displayBackButtons, redirectIfLocked, setRules } from '/minigame-collection/src/main.js?v=2.8.1.1';

document.addEventListener("DOMContentLoaded", () => {
    redirectIfLocked('simon-says');
    displayBackButtons();

    setRules(`
    <p>The game starts with a single color flashing.</p>
    <br>
    <p>If the player repeats the sequence correctly by clicking on the colors in the correct order, the game adds another color to the sequence, making it longer.</p>
    <br>
    <p>The game ends when the player fails to repeat the sequence correctly.</p>
    <br>
    <p><strong>Objective:</strong>Repeat the color sequence. Have fun!</p>
`);

    const buttons = document.querySelectorAll(".simon-button");
    const startButton = document.getElementById("start");
    let sequence = [];
    let playerSequence = [];
    let simonShows = false;
    let clickEvent = false;

    function flashButton(button) {
        return new Promise(resolve => {
            button.classList.add("active");
            setTimeout(() => {
                button.classList.remove("active");
                setTimeout(resolve, 400);
            }, 400);
        });
    }

    async function playSequence() {
        simonShows = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        /*buttons.forEach(button => {
            button.classList.remove("hoverEffect");
        });*/
        for (const id of sequence) {
            const button = document.getElementById(id);
            await flashButton(button);
        }
        /*buttons.forEach(button => {
            button.classList.add("hoverEffect");
        });*/
        simonShows = false;
    }

    function addToSequence() {
        const colors = ["red", "green", "blue", "yellow"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        sequence.push(randomColor);
    }

    async function handleButtonClick(event) {
        event.target.classList.remove('right');
        event.target.classList.remove('wrong');
        await new Promise(resolve => setTimeout(resolve, 100));
        clickEvent = true;
        const color = event.target.id;
        playerSequence.push(color);

        if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
            event.target.classList.add('wrong');
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (sequence.length > 1) {
                const points = (sequence.length - 1) * 5;
                alertPopup("You made it to level " + sequence.length + " and earned " + points + " points!");
                addPointsAndUpdate(points);
            }
            else {
                alertPopup("Ups! Just try again.");
            }
            resetGame();
            return;
        }
        else {
            event.target.classList.add('right');
        }

        if (playerSequence.length === sequence.length) {
            if (sequence.length === 100) {
                alertPopup("Congratulations! You won the game by reaching level " + sequence.length + ". You receive 1000 points!");
                addPointsAndUpdate(1000);
                resetGame();
            } else {
                addToSequence();
                playerSequence = [];
                playSequence();
            }
        }
        clickEvent = false;
    }

    function resetGame() {
        sequence = [];
        playerSequence = [];
        buttons.forEach(button => button.removeEventListener("click", handleButtonClickWithEffect));
        startButton.disabled = false;
    }

    startButton.addEventListener("click", async () => {
        clickEvent = false;
        simonShows = false;
        startButton.disabled = true;
        await buttonsStartEffect();
        addToSequence();
        playSequence();
        buttons.forEach(button => button.removeEventListener("click", handleButtonClickWithEffect));
        buttons.forEach(button => button.addEventListener("click", handleButtonClickWithEffect));
    });

    async function handleButtonClickWithEffect(event) {
        if (!simonShows && !clickEvent) {
            event.target.classList.remove('click');
            await new Promise(resolve => setTimeout(resolve, 10));
            event.target.classList.add('click');
            await handleButtonClick(event);
        }
    }

    async function buttonsStartEffect() {
        for (let index = 0; index < buttons.length; index++) {
            const element = buttons[index];
            element.classList.remove("active");
            element.classList.remove("click");
            element.classList.remove("hoverEffect");
            element.classList.remove('start');
            await new Promise(resolve => setTimeout(resolve, 100));
            element.classList.add('start');
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
});