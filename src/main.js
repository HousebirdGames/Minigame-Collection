/*The Minigame Collection was created and published by Felix T. Vogel in 2023*/
import Save from './modules/save.js?v=2.8.1.1';
import PopupManager from './modules/popupManager.js?v=2.8.1.1';
import Music from './modules/music.js?v=2.8.1.1';
import { updateNotesData } from './updateNotes.js?v=2.8.1.1';

const save = new Save();

let popupManager;

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        updatePointsText();
        initializeGameButtons();
    }
});

window.addEventListener("popstate", () => {
    updatePointsText();
    initializeGameButtons();
});

document.addEventListener("DOMContentLoaded", () => {

    initializeGameButtons();

    const headerElement = document.getElementById("header");
    if (headerElement) {
        headerElement.innerHTML = `
    <header>
    <a href="/minigame-collection" id='title'><h1 class="title">Minigame Collection</h1></a>
    <div class="buttonListHorizontal">
    <button id="installButton" class="headerButton">Download</button>
    <div class="audio-controls">
            <button id="playButton" class="headerButton">Music</button>
            <div class="volume-slider-container">
                <input type="range" id="volumeSlider" min="0" max="1" step="0.01" value="0.5">
            </div>
            </div>
        <button id="menuButton" class="headerButton">Menu</button>
    </div>
    </header>
    <div id="permissionNote"><p>Please not that this app needs your permission to save data to you local browser storage to provide full functionality.</p><br><button class="openAcknolegmentPopupButton">Manage Cookies & Storage</button></div>
    `;
    }

    let deferredPrompt;

    const installButton = document.getElementById('installButton');

    if (installButton) {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            installButton.style.display = 'block';
        });

        installButton.addEventListener('click', (e) => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    alertPopup("With the local installation you can now play offline as well. Have fun!")
                }
            });
        });
        installButton.addEventListener('animationend', () => {
            installButton.style.animation = '';
        });

        window.addEventListener('appinstalled', () => {
            console.log("App installed");
            installButton.style.display = 'none';
            deferredPrompt = null;
        });
    }

    const baseContent = document.getElementById("baseContent");
    if (baseContent) {
        baseContent.innerHTML = `
        <div class="bottomRow">
        <button id="fullscreenButton" class="fullscreen-button">Toggle Fullscreen</button>
        
        <div id="pointsContainer">
            <p id="points"></p>
            <p id="addedPoints"></p>
        </div>

        <div id="rulesPopup" class="popup">
		<div class="popup-content big">
			<h2>Rules</h2>
			<br>
			<div id="rules"></div>
			<br>
			<button class="closePopup">Close</button>
		</div>
	</div>

	<div id="menu" class="popup">
		<div class="menuList">
			<a href="https://housebird.games"><img id="logo" alt="Housebird Games" src="/minigame-collection/img/Housebird Games Logo Round With Name.png"></></a>
			<br>
			<button class="closePopup menu">Close Menu</button>
			<br>
			<button id="downloadSaveButton" class="menu">Download Save</button>
			<button id="uploadSaveButton" class="menu">Upload Save</button>
            <button id="resetPopupButton" class="menu">Reset Points & unlocked Games</button>
			<br>
            <button id="updateNotesButton" class="menu">Show Update Notes</button>
			<button class="menu openAcknolegmentPopupButton">Manage Cookies & Storage</button>
			<a href="https://stubenvogel.com/impressum/">
				<button class="menu">Imprint</button>
			</a>
			<a href="https://housebird.games/privacy-policy/">
				<button class="menu">Privacy Policy</button>
			</a>
			<a href="https://housebird.games">
				<button class="menu">Visit housebird.games</button>
			</a>
            <a href="/minigame-collection" class="backButton">
				<button class="menu">Back to Game Selection</button>
			</a>
		</div>
	</div>

	<div id="resetSavePopup" class="popup">
		<div class="popup-content big">
			<h2>Are you sure? All of your progress will be deleted.</h2>
			<br>
			<button id="resetButton" class="menu">Confirm</button>
			<button class="closePopup menu">Cancel</button>
		</div>
	</div>

	<div id="updatePopup" class="popup">
		<div class="popup-content big">
            <div id="updateNotesButtonsContainer"></div>
            <br>
			<h2>Update Notes</h2>
			<br>
			<div id="updateContent"></div>
			<br>
			<p><strong>Important Note:</strong> Please read what cookies & data will be stored. You will find the
				information by clicking the button below. There you can delete the data this site stores.</p>
			<br>
			<button class="menu openAcknolegmentPopupButton">Cookies & Storage</button>
			<button id="updateConfirm" class="menu">Confirm</button>
		</div>
	</div>

	<div id="storageAcknowledgementMinigameCollectionPopup" class="popup">
		<div class="popup-content big">
            <h1>Welcome!</h1>
            <br>
			<p>This website saves your unlocked games and points inside of your browsers local storage.
				The page also saves a cookie as soon as you press "I understand and agree" to hide this message the next
				time you visit or reload this page. Another cookie is used to remember on which version of the site you
				clicked "Confirm" on the Update Notes so that they are not shown on every page load. All of this is done
				to provide the functionality of this site. If
				you close this popup without clicking "I understand and agree", nothing will be stored. Additionally the
				site saves to your browsers session storage if the splash screen was already shown. The session storage
				will be deleted once you close the site.</p>
			<br>
			<p>Please also note that this game is experimental and will likely change and is not guaranteed to stay
				online or to even work in the way you expect. You may need to delete your cache for future updates to
				take effect.</p>
			<br>
            <button id="clearButton" class="menu">Delete cookies set by this site & the savegame from local
				storage</button>
			<button id="storageAcknowledgementMinigameCollectionButton" class="closePopup menu">I understand and agree</button>
		</div>
	</div>

	<div id="alertPopup" class="popup">
		<div class="popup-content">
			<h2 id="alertPopupText"></h2>
            <div id="alertPopupContent"></div>
			<button class="closePopup">Alright</button>
		</div>
	</div>
        `;
    }

    updatePointsText();

    assignMenuButton();

    const closePopupButtons = document.querySelectorAll(".closePopup");
    closePopupButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const parentPopup = button.closest(".popup");
            if (parentPopup) {
                popupManager.closePopup(parentPopup.id);
            }
        });
    });

    const resetButton = document.querySelector("button#resetButton");
    if (resetButton) {
        resetButton.addEventListener("click", () => {
            reset();
        });
    }

    const downloadSaveButton = document.querySelector("button#downloadSaveButton");
    if (downloadSaveButton) {
        downloadSaveButton.addEventListener("click", () => {
            downloadSave();
        });
    }

    const uploadSaveButton = document.querySelector("button#uploadSaveButton");
    if (uploadSaveButton) {
        uploadSaveButton.addEventListener("click", () => {
            uploadSave();
        });
    }

    const rulesButton = document.querySelector("button#rulesButton");
    if (rulesButton) {
        rulesButton.addEventListener("click", () => {
            popupManager.openPopup("rulesPopup");
        });
    }

    const clearButton = document.getElementById("clearButton");
    if (clearButton) {
        clearButton.addEventListener("click", () => {
            const localStorageEntriesToDelete = ['unlockedGames', 'points'];
            deleteSpecificLocalStorageEntries(localStorageEntriesToDelete);
            const cookiesToDelete = ['storageAcknowledgementMinigameCollection', 'lastUpdateNoteMinigameCollection'];
            deleteSpecificCookies(cookiesToDelete);
            location.reload()
        });
    }

    const openAcknolegmentPopupButtons = document.querySelectorAll(".openAcknolegmentPopupButton");
    if (openAcknolegmentPopupButtons) {
        openAcknolegmentPopupButtons.forEach(openAcknolegmentPopupButton => {
            openAcknolegmentPopupButton.addEventListener("click", () => {
                popupManager.openPopup("storageAcknowledgementMinigameCollectionPopup");
            });
        });
    }

    const storageAcknowledgementMinigameCollectionButton = document.getElementById("storageAcknowledgementMinigameCollectionButton");
    if (storageAcknowledgementMinigameCollectionButton) {
        storageAcknowledgementMinigameCollectionButton.addEventListener("click", () => {
            const wasTrue = getCookie("storageAcknowledgementMinigameCollection") === 'true';
            setCookie("storageAcknowledgementMinigameCollection", true, 365);
            popupManager.closePopup("storageAcknowledgementMinigameCollectionPopup");
            if (!wasTrue) {
                location.reload();
            }
        });
    }

    const music = new Music();
    music.init();

    popupManager = new PopupManager();

    window.addEventListener("click", (event) => {
        popupManager.popups.forEach((popup) => {
            if (popup.classList.contains("keepOpen")) {
                return;
            }

            if (event.target === popup) {
                popupManager.closePopup(popup.id);
            }
        });
    });

    const resetPopupButton = document.getElementById("resetPopupButton");
    if (resetPopupButton) {
        resetPopupButton.addEventListener('click', () => {
            popupManager.openPopup("resetSavePopup");
        });
    }

    if (getCookie("storageAcknowledgementMinigameCollection") === 'true') {
        popupManager.closePopup("storageAcknowledgementMinigameCollectionPopup");
    }

    if (getCookie("storageAcknowledgementMinigameCollection") != 'true' || !getCookie("storageAcknowledgementMinigameCollection")) {
        popupManager.openPopup("storageAcknowledgementMinigameCollectionPopup");
        const permissionNote = document.getElementById("permissionNote");
        if (permissionNote) {
            permissionNote.style.display = "block";
        }
    }

    const updateNotesButton = document.getElementById("updateNotesButton");
    if (updateNotesButton) {
        updateNotesButton.addEventListener('click', () => {
            showUpdateNotes(true);
        });
    }

    function showUpdateNotes(force = false) {
        const latestPatch = updateNotesData[0];

        if (getCookie("lastUpdateNoteMinigameCollection") !== latestPatch.version || force) {
            const updatePopup = document.getElementById("updatePopup");
            const updateContent = document.getElementById("updateContent");
            const updateNotesButtonsContainer = document.getElementById("updateNotesButtonsContainer");

            if (updatePopup && updateContent && updateNotesButtonsContainer) {
                updateContent.innerHTML = `
                  <p>Version ${latestPatch.version}</p>
                  <ul id="updateNotesList">
                    ${latestPatch.notes.map((note) => `<li>${note}</li>`).join('')}
                  </ul>
                `;

                updateNotesButtonsContainer.innerHTML = '';
                //const reversedupdateNotes = [...updateNotesData].reverse();
                updateNotesData.forEach((patch, index) => {
                    const button = document.createElement("button");
                    button.classList.add('updateVersionButton');
                    button.textContent = `Version ${patch.version}`;

                    if (patch.version === latestPatch.version) {
                        button.classList.add('active');
                    }

                    button.addEventListener("click", () => {
                        updateContent.querySelector("p").textContent = `Version ${patch.version}`;
                        document.getElementById("updateNotesList").innerHTML = patch.notes
                            .map((note) => `<li>${note}</li>`)
                            .join("");

                        // Remove the active class from all buttons
                        updateNotesButtonsContainer.querySelectorAll('.updateVersionButton').forEach(btn => {
                            btn.classList.remove('active');
                        });

                        // Add the active class to the clicked button
                        button.classList.add('active');
                    });
                    updateNotesButtonsContainer.appendChild(button);
                });

                popupManager.openPopup("updatePopup");
                const updateConfirm = document.getElementById("updateConfirm");
                if (updateConfirm) {
                    updateConfirm.addEventListener("click", (event) => {
                        if (getCookie("storageAcknowledgementMinigameCollection") === "true") {
                            setCookie("lastUpdateNoteMinigameCollection", latestPatch.version, 365);
                        }
                        popupManager.closePopup("updatePopup");
                    });
                }
            }
        }
    }

    if (getCookie("storageAcknowledgementMinigameCollection") == 'true') {
        showUpdateNotes();
    }

    const fullscreenButton = document.getElementById('fullscreenButton');
    if (fullscreenButton) {
        if (window.matchMedia('(display-mode: fullscreen)').matches || window.navigator.standalone === true) {
            fullscreenButton.innerText = "Back";
            fullscreenButton.style.paddingLeft = "2rem";
            document.getElementById("points").style.paddingRight = "1rem";
            fullscreenButton.addEventListener('click', () => {
                window.location.href = '/minigame-collection/';
            });
        }
        else {
            fullscreenButton.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    }
                }
            });
        }
    }

    window.onload = function () {
        var element = document.getElementById('gamesContainer');
        element.style.margin = 'auto';
    };
});

export function addPointsAndUpdate(points) {
    save.addPoints(points);
    addedPointsIndicator(points)
    updatePointsText();
}

let currentPointsIndicatorNumber = 0;

async function addedPointsIndicator(points) {
    const addedPoints = document.getElementById("addedPoints");
    if (!addedPoints) {
        return;
    }

    if (currentPointsIndicatorNumber == 0) {
        currentPointsIndicatorNumber = points;
        addedPoints.classList.remove('fade-out-fast');
        addedPoints.classList.remove('fade-in');
        await new Promise(resolve => setTimeout(resolve, 100));
        addedPoints.textContent = "+" + currentPointsIndicatorNumber;
        addedPoints.classList.add('points-pop-in');
        await new Promise(resolve => setTimeout(resolve, 5000));
        addedPoints.classList.remove('points-pop-in');
        addedPoints.classList.add('fade-out-fast');
        await new Promise(resolve => setTimeout(resolve, 200));
        addedPoints.textContent = "";
        currentPointsIndicatorNumber = 0;
    }
    else {
        currentPointsIndicatorNumber += points;
        addedPoints.textContent = "+" + currentPointsIndicatorNumber;
    }
}

function updatePointsText() {
    const pointsText = document.getElementById("points");
    if (pointsText) {
        pointsText.textContent = save.getPoints() + " Points";
    }
}

export function redirectIfLocked(gameName, lockedPageURL) {
    const isUnlocked = save.isGameUnlocked(gameName);

    if (!isUnlocked) {
        window.location.href = "/minigame-collection";
    }
}

export function setRules(innerHTML) {
    const rules = document.getElementById("rules");
    if (rules) {
        rules.innerHTML = innerHTML;
    }
}

function initializeGameButtons() {
    const gameButtons = document.getElementsByClassName('gameButton');
    const gameSelectionText = document.getElementById('gameSelectionText');
    let allGamesUnlocked = true;

    for (const button of gameButtons) {
        const gameID = button.id;
        const isUnlocked = save.isGameUnlocked(gameID);
        const img = `<img class="banner" src="img/banner/${button.id}.jpg">`;

        button.innerHTML = `${button.dataset.title}` + img;

        if (isUnlocked) {
            button.onclick = () => {
                window.location.href = `games/${gameID}/`;
            };
        } else {
            allGamesUnlocked = false;
            const pointsRequired = parseInt(button.dataset.points);

            const lockOverlay = document.createElement("div");
            lockOverlay.classList.add("lock-overlay");
            button.appendChild(lockOverlay);

            if (pointsRequired > save.getPoints()) {
                button.disabled = true;
                lockOverlay.innerHTML = `Requires ${button.dataset.points} Points to unlock`;
            }
            else {
                lockOverlay.classList.add("available");
                lockOverlay.innerHTML = `Unlock for ${button.dataset.points} Points`;
                button.onclick = () => {
                    const unlocked = save.unlock(gameID, pointsRequired);
                    button.classList.add('wiggle');

                    if (unlocked) {
                        updatePointsText();
                        button.style.pointerEvents = 'auto';
                        lockOverlay.remove();
                        button.onclick = () => {
                            window.location.href = `games/${gameID}`;
                        };
                    }
                    initializeGameButtons();
                };
            }
        }
    }

    if (allGamesUnlocked && gameSelectionText) {
        gameSelectionText.textContent = "Congratulations! You have unlocked all games.";
    }
}

export function roundToHalf(value) {
    return Math.round(value * 2) / 2;
}

export function roundToFull(value) {
    return Math.round(value);
}

export function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = days ? `; expires=${date.toUTCString()}` : '';
    document.cookie = `${name}=${value}${expires}; path=/`;
}

export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const deleteAllCookies = () => {
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
};

const deleteSpecificCookies = (cookieNames) => {
    for (const name of cookieNames) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
};

const deleteSpecificLocalStorageEntries = (keys) => {
    for (const key of keys) {
        localStorage.removeItem(key);
    }
};

export function alertPopup(text = '', content = '', addedClass = null) {
    const alertPopup = document.getElementById("alertPopup");
    if (addedClass) {
        alertPopup.classList.add(addedClass);
    }
    const alertPopupText = document.getElementById("alertPopupText");
    const alertPopupContent = document.getElementById("alertPopupContent");
    if (alertPopupContent && alertPopup) {
        popupManager.openPopup("alertPopup");
        alertPopupText.innerHTML = text;
        alertPopupContent.innerHTML = content;
    }
    else {
        alert(content);
    }
}

export function alertPopupClose(addedClass = null) {
    const alertPopup = document.getElementById("alertPopup");
    if (alertPopup) {
        if (!addedClass || alertPopup.classList.contains(addedClass)) {
            if (addedClass) {
                alertPopup.classList.remove(addedClass);
            }
            popupManager.closePopup("alertPopup");
        }
    }
}

function reset() {
    localStorage.removeItem("unlockedGames");
    localStorage.removeItem("points");
    setTimeout(() => {
        location.reload();
    }, 100);
}

function downloadSave() {
    const unlockedGames = localStorage.getItem("unlockedGames");
    const points = localStorage.getItem("points");
    const saveData = {
        unlockedGames: JSON.parse(unlockedGames),
        points: JSON.parse(points),
    };

    const saveJSON = JSON.stringify(saveData);
    const blob = new Blob([saveJSON], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "HousebirdGamesMinigameCollection.save";
    link.click();
    URL.revokeObjectURL(url);
}


function uploadSave() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".save";
    input.onchange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const loadedSave = JSON.parse(event.target.result);
                if (loadedSave.unlockedGames && loadedSave.points) {
                    localStorage.setItem("unlockedGames", JSON.stringify(loadedSave.unlockedGames));
                    localStorage.setItem("points", JSON.stringify(loadedSave.points));
                    alertPopup("Save game loaded successfully!");
                    location.reload();
                } else {
                    throw new Error("Save data is missing 'unlockedGames' or 'points'");
                }
            } catch (error) {
                alertPopup("Invalid save game file: " + error);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

export function assignMenuButton() {
    const menuButton = document.querySelector("button#menuButton");
    if (menuButton) {
        menuButton.addEventListener("click", () => {
            popupManager.openPopup("menu");
        });
    }
}

export function displayBackButtons() {
    const backButtons = document.querySelectorAll(".backButton");
    backButtons.forEach(backButton => {
        backButton.style.display = "block";
    });
}

const splashScreen = document.getElementById('splash-screen');
const splashImage = document.getElementById('splash-image');

if (splashScreen && splashImage) {
    function hideSplashScreen() {
        setTimeout(() => {
            splashScreen.classList.add("fade-out");
        }, 1000);
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 2000);
    }

    const firstLoad = sessionStorage.getItem('firstLoad');

    if (!firstLoad) {
        splashScreen.classList.add('fade-out-splash');
        setTimeout(hideSplashScreen, 4500);

        sessionStorage.setItem('firstLoad', 'true');
    } else {
        splashScreen.style.display = 'none';
    }
}
