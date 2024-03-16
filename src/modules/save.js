/*The Minigame Collection was created and published by Felix T. Vogel in 2023*/

import { getCookie } from "../main.js?v=2.8.1.1";

export default class Save {
    constructor() {
        this.initializeUnlockedGames();
    }

    addPoints(points) {
        if (!getCookie("storageAcknowledgementMinigameCollection") === 'true') {
            return;
        }
        localStorage.setItem('points', this.getPoints() + points);
    }

    removePoints(points) {
        if (!getCookie("storageAcknowledgementMinigameCollection") === 'true') {
            return;
        }
        localStorage.setItem('points', this.getPoints() - points);
    }

    enoughPoints(points) {
        if (!getCookie("storageAcknowledgementMinigameCollection") === 'true') {
            return false;
        }

        if (points <= this.getPoints()) {
            return true;
        }
        else {
            return false;
        }
    }

    usePoints(points) {
        if (!getCookie("storageAcknowledgementMinigameCollection") === 'true') {
            return false;
        }

        if (this.enoughPoints(points)) {
            this.removePoints(points);
            return true;
        }
        else {
            return false
        }
    }

    getPoints() {
        if (!getCookie("storageAcknowledgementMinigameCollection") === 'true') {
            return 0;
        }
        return parseInt(localStorage.getItem('points')) || 0;
    }

    unlock(gameName, pointsRequired) {
        if (!getCookie("storageAcknowledgementMinigameCollection") === 'true') {
            return false;
        }

        if (this.usePoints(pointsRequired)) {
            const unlockedGames = this.getUnlockedGames();
            unlockedGames.push(gameName);
            localStorage.setItem('unlockedGames', JSON.stringify(unlockedGames));
            return true;
        }
        else {
            return false;
        }
    }

    getUnlockedGames() {
        if (!getCookie("storageAcknowledgementMinigameCollection") === 'true') {
            return [];
        }

        const unlockedGames = localStorage.getItem('unlockedGames');
        if (unlockedGames) {
            return JSON.parse(unlockedGames);
        } else {
            return [];
        }
    }

    isGameUnlocked(gameName) {
        const unlockedGames = this.getUnlockedGames();
        return unlockedGames.includes(gameName);
    }

    initializeUnlockedGames() {
        if (!localStorage.getItem('unlockedGames') && getCookie("storageAcknowledgementMinigameCollection") === 'true') {
            const defaultUnlockedGames = [];
            localStorage.setItem('unlockedGames', JSON.stringify(defaultUnlockedGames));
            localStorage.setItem('points', 100);
        }
    }
}