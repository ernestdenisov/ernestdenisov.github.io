class Game {
    constructor(configURL) {
        console.log('game');
        this.url = configURL;
    }

    init() {
		game.renderer.renderSession.roundPixels = true;
    	game.physics.startSystem(Phaser.Physics.ARCADE);
    }
    
    preload() {
        loadingProgress();

        loadJSON(response => {this.actual_JSON = JSON.parse(response)}, this.url);

        // GAME
		game.load.image('tree', './assets/images/tree.png');
		game.load.image('bg', './assets/images/background_jungle.png');
        game.load.image('leaf', './assets/images/leaf1.png');
        game.load.image('leaf_background', './assets/images/leaf_background.png');
        game.load.image('monkey1', './assets/images/monkey1.png');
        game.load.image('monkey2', './assets/images/monkey2.png');
        game.load.image('branch', './assets/images/branch.png');
        game.load.image('banana', './assets/images/banana.png');
        
        // UI
        game.load.image('arrow', './assets/images/arrow.png');

        // SOUNDS
        game.load.audio('background_music', './assets/sounds/african_background_music.mp3');
        game.load.audio('banana_sound', './assets/sounds/banana.mp3');
        game.load.audio('game_over_sound', './assets/sounds/game_over.mp3');
    }

    create() {
        this.trunks = [];
        this.treeContainer = null;
        this.gameContainer = null;
        this.UIContainer = null;
        this.blocks = [];
        this.scoreCounter = 0;
        this.scoreCounterTextBlock = 0;
        this.gameContainer = game.add.group();
        this.UIContainer = game.add.group();
        this.addTime = 10;
        this.isStart = true;
        this.progressDecreaseSpeed = 0.3;
        this.progressDecreaseSpeedDelta = 0.00005;
        isPlaying = true;

        this.monkeyFrames = {
            frames: ['monkey1', 'monkey2'],
            currentFrame: 0,
            next: function() {
                if (this.currentFrame >= this.frames.length) {
                    this.currentFrame = 0;
                }
                return this.frames[this.currentFrame++];
            }
        }

        //////////////////////////////////////////
        //////////////////////////////////////////
        ////                                  ////
        ////            GAME BLOCK            ////
        ////                                  ////
        //////////////////////////////////////////
        //////////////////////////////////////////


        // BACKGROUND MUSIC

        backgroundMusic = backgroundMusic || game.add.audio('background_music');
        game.sound.setDecodedCallback([backgroundMusic], this.startPlay, this);

        // GAME SOUNDS

        this.hitBananaSound = game.add.audio('banana_sound');
        this.hitBananaSound.volume = 0.3;
        this.gameOverSound = game.add.audio('game_over_sound');

        // STATIC BACKGROUND

        game.stage.backgroundColor = 0x383638;

        const {background} = this.actual_JSON.game;

        this.background = game.add.tileSprite(
            background.position.x,
            background.position.y,
            background.width,
            background.height,
            'bg'
        );

        this.gameContainer.add(this.background);

        // ANIMATED BACKGROUND

        const {leaves} = this.actual_JSON.game;

        leaves.children.forEach(leaf => {
            const forestLeaf = createImage(leaf, 'leaf');
            const tween = game.add.tween(forestLeaf)
                .to(
                    {angle: leaf.angleTo},
                    leaf.tweenTime,
                    leaf.animType,
                    leaf.autoStart,
                    leaf.tweenDelay,
                    leaf.repeat,leaf.yoyo
                );
        });
        
        // BACKGROUND LEAVES

        const {background_leaves} = this.actual_JSON.game;
        background_leaves.children.forEach(leaf => {
            createImage(leaf, 'leaf_background');
        });

        // TREE

        this.treeContainer = game.add.group();
        const {tree} = this.actual_JSON.game;

        tree.children.forEach(chunk => {
            const trunk = createImage(chunk, 'tree');
            this.treeContainer.add(trunk);
            this.trunks.push(trunk);
        });

        const {tree_mask} = this.actual_JSON.game;
        const treeMask = game.add.graphics(0, 0);
    	treeMask.beginFill(tree_mask.fill);
		treeMask.drawRect(tree_mask.position.x, tree_mask.position.y, tree_mask.width, tree_mask.height);
        this.treeContainer.mask = treeMask;
        
        // MONKEY

        const {monkey} = this.actual_JSON.game;
        this.monkey = createImage(monkey.right, this.monkeyFrames.next());
        this.monkey.state = 'right';

        // BLOCKS

        const {block} = this.actual_JSON.game;
        for (let i = 0; i < 5; i++) {
            this.blocks.push(new Block().createBlock(block, {x: block.position.x, y: i * -block.step + block.position.y}));
        }

        //////////////////////////////////////////
        //////////////////////////////////////////
        ////                                  ////
        ////              UI BLOCK            ////
        ////                                  ////
        //////////////////////////////////////////
        //////////////////////////////////////////

        // UI BACKGROUND

        const {ui_background} = this.actual_JSON.UI;
        const polyDots = ui_background.coords.map(dot => {
            return new Phaser.Point(dot.x, dot.y);
        });
        const poly = new Phaser.Polygon();
        poly.setTo(polyDots);

        const graphics = game.add.graphics(0, 0);
        graphics.beginFill(ui_background.fill);
        graphics.drawPolygon(poly.points);
        graphics.endFill();

        this.gameContainer.add(graphics);
        
        // UI BUTTONS

        const {arrows} = this.actual_JSON.UI;

        arrows.children.forEach(arrow => {
            const btn = createButton(arrow, 'arrow');
            btn.hitArea = new PIXI.Circle(0, 0, 150);
            btn.onInputDown.add(this[`move${arrow.action}`], this);
        });

        // KEY BOARD CONTROLL

        this.keyLeft = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.keyLeft.onDown.add(this.moveLeft, this);

        this.keyRight = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.keyRight.onDown.add(this.moveRight, this);

        // SCORE COUNTER

        const {banana_score_label, score_counter} = this.actual_JSON.UI;

        createImage(banana_score_label, 'banana');

        this.scoreCounterTextBlock = game.add.text(
            score_counter.position.x,
            score_counter.position.y,
            this.scoreCounter,
            score_counter.font_style
        );

        // PROGRESS BAR

        const {progress_bar} = this.actual_JSON.UI;
        const {bar_back, bar_mask, bar_progress} = progress_bar;

        const barBack = game.add.graphics(0, 0);
        barBack.lineStyle(
            bar_back.stroke.width,
            bar_back.stroke.color,
            bar_back.stroke.alpha
        );
        barBack.beginFill(bar_back.fill);
        barBack.drawRoundedRect(
            bar_back.rect.x,
            bar_back.rect.y,
            bar_back.rect.width,
            bar_back.rect.height,
            bar_back.rect.radius
        );

        const barContainer = game.add.group();
        const barMask = game.add.graphics(0, 0);
    	barMask.beginFill(bar_mask.fill);
		barMask.drawRoundedRect(
            bar_mask.rect.x,
            bar_mask.rect.y,
            bar_mask.rect.width,
            bar_mask.rect.height,
            bar_mask.rect.radius
        );
        barContainer.mask = barMask;

        this.progress = game.add.graphics(0, 0);
        this.progress.beginFill(bar_progress.fill);
        this.progress.drawRect(
            bar_progress.rect.x,
            bar_progress.rect.y,
            bar_progress.rect.width,
            bar_progress.rect.height,
        );

        barContainer.add(this.progress);
        
    }

    update() {
        if (!this.isStart) {
            this.progressDecreaseSpeed += this.progressDecreaseSpeedDelta;
            this.progress.x -= this.progressDecreaseSpeed;
        }

        if (this.progress.x <= -90) {
            this.gameOver();
        }

        if (!isPlaying) {
            this.startPlay();
            isPlaying = true;
        }
    }

    moveLeft() {
        this.makeStep('left');
    }

    moveRight() {
        this.makeStep('right');
    }

    makeStep(side) {
        if (this.isStart) isPlaying = false;
        this.isStart = false;
        this.moveMonkey(side);
        this.monkey.state = side;
        this.moveTree();
        this.moveBlock();
    }

    moveMonkey(side) {
        const {position, scale} = this.actual_JSON.game.monkey[side];
        this.monkey.position.setTo(position.x, position.y);
        this.monkey.scale.setTo(scale.x, scale.y);
        this.monkey.loadTexture(this.monkeyFrames.next());
    }

    moveTree() {
        this.trunks.forEach(trunk => {
            trunk.position.y += 100;
            this.checkTrunk(trunk);
        });
    }

    checkTrunk(trunk) {
        if (trunk.position.y >= 900) {
            trunk.position.y = -300;
        }
    }

    moveBlock() {
        this.blocks.forEach(block => {
            block.move('y', 100);
            this.checkBlock(block);
        });
    }

    checkBlock(block) {
        if (block.getPosition().y >= 400) {
            block.move('y', -(block.getPosition().y + 600));
            this.checkMonkey(block);
            block.updateBlock();
        }
    }

    checkMonkey(block) {
        console.log(block.state)
        if (this.monkey.state === block.state) {
            this.scoreCounterTextBlock.text = ++this.scoreCounter;
            this.hitBananaSound.play();
            if (this.progress.x < 100) {
                this.progress.x += this.addTime;
            }  
        } else {
            this.gameOver();
        }
    }

    gameOver() {
        game.state.start('resultScreen', true, false, this.scoreCounter);
        this.gameOverSound.play();
    }

    startPlay() {
        backgroundMusic.loopFull(0.6);
        backgroundMusic.onLoop.add(() => {}, this);			
        backgroundMusic.volume = 0.5;
    }
}