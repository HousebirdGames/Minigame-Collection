/*The Minigame Collection was created and published by Felix T. Vogel in 2023*/

export default class Music {
    constructor() {
        this.audioFiles = [
            '/minigame-collection/music/Chillofun.mp3',
            '/minigame-collection/music/Sleeping and dreaming.mp3',
        ];

        this.audio = new Audio();
        this.isPlaying = false;
    }

    init() {
        const volumeSlider = document.getElementById('volumeSlider');
        volumeSlider.addEventListener('input', (event) => {
            this.audio.volume = parseFloat(event.target.value);
        });

        const playButton = document.getElementById('playButton');
        playButton.addEventListener('click', () => {
            this.playRandomFile();
        });
    }

    playRandomFile() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            const randomIndex = Math.floor(Math.random() * this.audioFiles.length);
            this.audio.src = this.audioFiles[randomIndex];
            this.audio.play();
        }
        this.isPlaying = !this.isPlaying;
    }
}