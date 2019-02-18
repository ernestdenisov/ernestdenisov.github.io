const SCENE_WIDTH = 800;
const SCENE_HEIGHT = 800;
const gameConfigURL = './assets/configs/game-config.json';
const resultConfigURL = './assets/configs/result-config.json';
const localStorageName = 'banana_mania_best_score';
let isPlaying = false;
let backgroundMusic = null;

const game = new Phaser.Game(
	SCENE_WIDTH, 
	SCENE_HEIGHT, 
    Phaser.AUTO,
    'game-inner-container'
);

window.onload = function() {
    const gameScreen = new Game(gameConfigURL);
    const resultScreen = new Result(resultConfigURL);

    game.stage.backgroundColor = 0x383638;

    game.state.add('gameScreen', gameScreen);
    game.state.add('resultScreen', resultScreen);

    game.state.start('gameScreen');
};