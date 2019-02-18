class Result {
    constructor(configURL) {
        this.url = configURL;
    }

    init (roundScore) {
        this.roundScore = roundScore;
		game.renderer.renderSession.roundPixels = true;
    	game.physics.startSystem(Phaser.Physics.ARCADE);
    }

    preload() {
        loadingProgress();
        loadJSON(response => {this.actual_JSON = JSON.parse(response)}, this.url);

        game.load.image('background', './assets/images/background_result.jpg');
        game.load.image('restart', './assets/images/button_restart.png');
    }

    create() {
        this.scoreTextBlock = null;
        this.returnTextBlock = null;
        this.bestScoreTextBlock = null;

        // STATIC BACKGROUND

        const {background} = this.actual_JSON;

        createImage(background, 'background');

        // SCORE AND BEST SCORE TEXT BLOCK
        
        const {score, best_score} = this.actual_JSON;

        this.scoreTextBlock = game.add.text(
            score.position.x,
            score.position.y,
            ('SCORE: ' + this.roundScore),
            score.font_style
        );
        this.scoreTextBlock.anchor.setTo(0.5, 0.5);

        const bestScoreText = localStorage.getItem(localStorageName)
            ? localStorage.getItem(localStorageName)
            : 0;
        localStorage.setItem(localStorageName, Math.max(bestScoreText, this.roundScore));

        this.bestScoreTextBlock = game.add.text(
            best_score.position.x,
            best_score.position.y,
            `BEST SCORE: ${Math.max(bestScoreText, this.roundScore)}`,
            best_score.font_style
        );
        this.bestScoreTextBlock.anchor.setTo(0.5, 0.5);

        // RESTART BUTTON

        const {restart} = this.actual_JSON;
        const restartButton = createButton(restart, 'restart');
        restartButton.hitArea = new PIXI.Circle(0, 0, 150);
        restartButton.onInputDown.add(this.returnToGame, this);

        // KEY BOARD CONTROLL

        const keySpace = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        keySpace.onDown.add(this.returnToGame, this);
    }

    update() {

    }

    returnToGame() {
        game.state.start('gameScreen');
    }
}