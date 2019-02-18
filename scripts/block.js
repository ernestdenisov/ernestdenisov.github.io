class Block{
    constructor() {
        this.block = null;
    }

    createBlock(blockCongig, position) {
        this.block = game.add.group();
        const branch = createImage(blockCongig.branch, 'branch');
        const banana = createImage(blockCongig.banana, 'banana');
        this.block.add(branch);
        this.block.add(banana);
        this.block.position.setTo(position.x, position.y);
        this.block.scale.setTo(-1, 1);
        this.state = 'right';

        return this;
    }

    updateBlock() {
        this.state = Math.random() > 0.5 ? 'right' : 'left';
        this.block.scale.setTo(this.state === 'right' ? -1 : 1, 1);
    }

    move(coord, pixels) {
        this.block.position[coord] += pixels;
    }

    getPosition() {
        return this.block.position;
    }
}