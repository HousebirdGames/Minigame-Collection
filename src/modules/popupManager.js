/*The Minigame Collection was created and published by Felix T. Vogel in 2023*/

export default class PopupManager {
    constructor() {
        this.popups = document.querySelectorAll('.popup');
    }

    openPopup(popupId) {
        const popup = document.getElementById(popupId);
        if (popup) {
            popup.classList.remove('fade-in-fast');
            popup.classList.remove('fade-out-fast');
            popup.classList.add('fade-in-fast');
            popup.style.display = 'block';
        }
    }

    closePopup(popupId) {
        const popup = document.getElementById(popupId);
        if (popup) {
            popup.classList.remove('fade-out-fast');
            popup.classList.remove('fade-in-fast');
            popup.classList.add('fade-out-fast');
            setTimeout(() => {
                popup.style.display = 'none';
            }, 200);
        }
    }
}
