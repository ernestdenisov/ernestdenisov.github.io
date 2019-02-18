function createImage(config, asset) {
    const img = this.createGameObject(config, asset, 'image');
    return img;
}

function createButton(config, asset) {
    const button = this.createGameObject(config, asset, 'button');
    return button;
}

function createGameObject(config, asset, type) {
    const {position, anchor, scale, angle, alpha} = config;
    const obj = game.add[type](position.x, position.y, asset);

    anchor ? obj.anchor.setTo(anchor.x, anchor.y) : obj.anchor.setTo(0.5, 0.5);
    scale ? obj.scale.setTo(scale.x, scale.y) : obj.scale.setTo(1, 1);
    obj.angle = angle ? angle : 0;
    obj.alpha = alpha ? alpha : 1;

    return obj;
}

function loadJSON(callback, url) {
    const xobj = new XMLHttpRequest();
    xobj.overrideMimeType('application/json');
    xobj.open('GET', url, false); 
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == '200') {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);  
}

function loadingProgress() {
    let counter = 1;
    let maxCounter = 1000000;
    const text = 'Loading';
    const loadingText = game.add.text(
        SCENE_WIDTH / 3,
        SCENE_HEIGHT / 2,
        text,
        {
            fontFamily: 'Arial',
            fontSize: 60,
            fontWeight: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
        }
    );

    loadingText.anchor.set(0, 0.5);

    const interval = setInterval(() => {
        loadingText.text = text + '.'.repeat(++counter % 4);
        if (counter >= maxCounter) clearInterval(interval);
    }, 200);
}