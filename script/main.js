class Bullet extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, x, y)
    {
        super(scene, x, y, 'bullet');
    }

    fire (x, y)
    {
        this.body.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        this.setVelocityY(Math.sin(Phaser.Math.DegToRad(angle))*600);
        this.setVelocityX(Math.cos(Phaser.Math.DegToRad(angle))*600);
        }

    preUpdate (time, delta)
    {
        super.preUpdate(time, delta);

        if (this.y <= -32)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

class Bullets extends Phaser.Physics.Arcade.Group
{
    constructor (scene)
    {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: 10,
            key: 'bullet',
            active: false,
            visible: false,
            classType: Bullet
        });
    }

    fireBullet (x, y)
    {
        let bullet = this.getFirstDead(false);

        if (bullet)
        {
            bullet.fire(x, y);
        }
    }
}

class stage extends Phaser.Scene{
    constructor () {
        super();
        this.bullets;
    }

    preload ()
    {
        this.load.image('tiles', 'assets/tile_set.png');
        this.load.tilemapTiledJSON('map', 'assets/test.json');
        
        this.load.image('pumpkin-0', 'assets/pumpkin_00.png')
        this.load.image('pumpkin-1', 'assets/pumpkin_01.png');
        this.load.image('pumpkin-2', 'assets/pumpkin_02.png');
        this.load.image('pumpkin-3', 'assets/pumpkin_03.png');
        this.load.image('pumpkin-4', 'assets/pumpkin_04.png');
        this.load.image('pumpkin-5', 'assets/pumpkin_05.png');
        this.load.image('pumpkin-6', 'assets/pumpkin_06.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('bug', 'assets/fly.png');
        this.load.image('bounce', 'assets/pumpkin_04.png');
        this.load.image('background', 'assets/game_bg.png');
        
        this.load.spritesheet('skellig',
            'assets/skellig.png',
            {frameWidth: 139, frameHeight: 287});
        this.load.spritesheet('pumpkin',
            'assets/pumpkin.png',
            {frameWidth: 302, frameHeight: 202});

        this.load.audio('fire', '/assets/sound//DootShoot.ogg');
        this.load.audio('theme', '/assets/sound/LOOP_GameBackground.ogg');
        this.load.audio('shoot', '/assets/sound/DootShoot.ogg');
        this.load.audio('walk', '/assets/sound/footsteps.ogg');
        this.load.audio('buzz', '/assets/sound/FlyAttack1.ogg');
        this.load.audio('ultimate', '/assets/sound/buzzlord.ogg');
    }

    create ()
    {

        this.add.image(600, 400, 'background');
        //tileset
        const map = this.make.tilemap({key: 'map'});
        const tileset = map.addTilesetImage('floor', 'tiles');
        const ground = map.createStaticLayer('grond', tileset, 0, 0);

        //fertilize the patches
        patches.forEach( (item, index) => {
            item.pumpkin = this.add.sprite(item.x, pumpkinY, 'pumpkin-0').setScale(0.5);
        });

        //prepare fly ambush
        /*enemies.forEach((item, index)=>{
            item.obj = this.physics.add.sprite(item.x, item.y, 'bug');
            let ang = Phaser.Math.Angle.Between(item.x, item.y, patches[index].x, pumpkinY);

            item.obj.setVelocityY(Math.sin(ang)*400);
            item.obj.setVelocityX(Math.cos(ang)*400);
            console.log(ang);
            item.obj.setCollideWorldBounds(true);
        });*/

        ui = this.add.text(50, 50, 'Pumpkins collected: ' + collected, { font: '"Press Start 2P"' });
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.bullets = new Bullets(this);

        //let's get that audio boys
        theme = this.sound.add('theme');
        theme.setVolume(0.2);
        theme.setLoop(true);
        theme.play();

        zoom = this.sound.add('ultimate');
        zoom.setVolume(0.25);
        zoom.setLoop(true);

        var shoot = this.sound.add('shoot');
        shoot.setVolume(0.25);

        walk = this.sound.add('walk');
        walk.setVolume(0.3);
        walk.setLoop(true);

        buzz = this.sound.add('buzz');
        buzz.setVolume(0.25);
        buzz.setLoop(true);
        buzz.play();
        
        //init player
        player = this.physics.add.sprite(100, 585, 'skellig');
        player.setCollideWorldBounds(true);
        player.body.allowGravity = false;

        //bugman the dushman
        bugman = this.add.sprite(600, 500, 'bug');

        //pumpkin
        bounce = this.physics.add.sprite(200, 300, 'bounce');
        bounce.setCollideWorldBounds(true);
        bounce.setBounce(1);    

        //animations
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('skellig', {
                start: 0, end: 3
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('skellig',
                {start: 4, end: 7}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'pumpkin_0',
            frames: this.anims.generateFrameNumbers('pumpkin',
            {start: 0, end: 2}),
            frameRate: 0.5,
            repeat: 0
        });

        //angle between mouse and player
        this.input.on('pointermove', (pointer) => {
            angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(player.x, player.y, pointer.x, pointer.y));
            ui.setText('Pumpkins collected: ' + collected);
        });
        this.input.on('pointerdown', (pointer) =>{
            this.bullets.fireBullet(player.x, player.y);
            shoot.play();   
        });
        
    }



    update (){
        this.move();
        this.pumpkin_func();
        this.spinny();
    }
    move () {
        if (this.cursors.left.isDown) {
            player.setVelocityX(-300);
            player.anims.play('left', true);
            if (!flippity) {
                walk.play();
                flippity = true;
            }
        }
        else if (this.cursors.right.isDown)
        {
            player.setVelocityX(300);
            player.anims.play('right', true);
            if (!flippity) {
                walk.play();
                flippity = true;
            }
        }
        else
        {
            player.setVelocityX(0);
            player.anims.play('turn');
            walk.stop();
            flippity = false;
        }
    }
    pumpkin_func () {
        //plant
        if (this.cursors.space.isDown) {
            patches.forEach( (item, index) => {
                if (player.x - item.x < 50 && player.x - item.x > -50 && item.planted == false && !planting) {
                    item.planted = true;
                    item.pumpkin.anims.play('pumpkin_0');
                    item.pumpkin.on('animationcomplete', (animation, fram) => {
                        if(animation.key == 'pumpkin_0') {
                            item.pumpkin.setTexture('pumpkin-1');
                            item.matured = true;
                        }
                    }, this);
                }
                //pick up
                else if (player.x - item.x < 50 && player.x - item.x > -50 && item.matured == true && !planting) {
                    item.planted = false;
                    item.matured = false;
                    collected += 1;
                    item.pumpkin.setTexture('pumpkin-0');
                    ui.setText('Pumpkins collected: ' + collected);
                    if(collected >= 20) {
                        theme.stop();
                        this.scene.switch('end');
                        walk.stop();
                        buzz.stop();
                        zoom.stop();
                    }
                }
            });
            planting = true;
        }
        if (this.cursors.space.isUp) {
            planting = false;
        }
    }
    spinny () {
        bugman.x = Math.cos(flymeter)*100 + 400;
        bugman.y = Math.sin(flymeter)*100 + 400;
        flymeter*=1.001;
        if( flymeter > 400 && !coom) {
            theme.stop();
            zoom.play();
            coom = true ;
        }
    }
}

class start extends Phaser.Scene {
    constructor() {
        super();
    }

    preload() {
        this.load.image('bg', '/assets/title.png');
        this.load.image('button', '/assets/start.png');

        this.load.audio('music', '/assets/sound/LOOP_TitleTheme.ogg');
    }

    create() {
        this.add.image(600, 400, 'bg');
        var music = this.sound.add('music');
        music.setVolume(0.2);
        music.setLoop(true);
        music.play();

        var button = this.add.sprite(600, 400, 'button');
        button.setInteractive({useHandCursor: true});
        button.on('pointerdown', () => {
            this.scene.switch('game');
            music.stop();
        });
    }
}

class muerto extends Phaser.Scene {
    constructor() {
        super();
    }
    preload() {
        this.load.video('gg', '/assets/pepega/yessir.mp4');
    }
    create() {
        var meme = this.add.video(600, 400,'gg');
        meme.play(true);
    }
}

var config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 200},
            debug: false
        }
    }
};

var patches = [
    {x: 450, planted: false, matured: false, pumpkin: null, hp: 1},
    {x: 550, planted: false, matured: false, pumpkin: null, hp: 1},
    {x: 650, planted: false, matured: false, pumpkin: null, hp: 1},
    {x: 750, planted: false, matured: false, pumpkin: null, hp: 1},
    {x: 850, planted: false, matured: false, pumpkin: null, hp: 1}
];

var cursors;
var pumpkinY = config.height - 80;
var collected = 0;
var planting;
var player;
var angle;
var ui;
var walk;
var flippity = false;
var theme;
var flymeter = Math.PI;
var bugman;
var buzz;
var bounce;
var zoom;
var coom = false;

var game = new Phaser.Game(config);
game.scene.add('start', start);
game.scene.add('game', stage);
game.scene.add('end', muerto);

game.scene.start('start');
