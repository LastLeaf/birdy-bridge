game.main = function(){
	'use strict';

	// prepare stage
	var stage = game.stage;
	stage.removeAllChildren();
	stage.removeAllEventListeners('stagemousedown');
	stage.removeAllEventListeners('stagemousemove');
	stage.removeAllEventListeners('stagemouseup');
	stage.removeAllEventListeners('mouseout');
	createjs.Ticker.removeAllEventListeners();
	stage.enableMouseOver(30);

	// read storage
	try {
		game.storage = JSON.parse( localStorage['me.lastleaf.birdy-bridge'] || "{}" );
	} catch(e) {
		game.storage = {};
	}
	game.storageSave = function(){
		try {
			localStorage['me.lastleaf.birdy-bridge'] = JSON.stringify(game.storage);
		} catch(e) {}
	};

	// background
	var bg = new createjs.Bitmap( game.resources.getResult('backgroundTitle') );
	bg.x = 200;
	bg.y = 0;
	bg.alpha = 0.7;
	stage.addChild(bg);

	// logo
	var logo = new createjs.Bitmap( game.resources.getResult('lastleaf') );
	logo.x = 10;
	logo.y = 400;
	logo.scaleX = 0.5;
	logo.scaleY = 0.5;
	stage.addChild(logo);

	// title
	var title = new createjs.Bitmap( game.resources.getResult('title') );
	title.x = 70;
	title.y = 60;
	title.scaleX = 0.8;
	title.scaleY = 0.8;
	stage.addChild(title);

	// description
	var desc0 = new createjs.Text('A Ludum Dare 33 Game', '16px "Noto Sans",sans', '#606060');
	desc0.x = 780;
	desc0.y = 410;
	desc0.textAlign = 'right';
	var desc1 = new createjs.Text('Inspired by Chinese folktale', '16px "Noto Sans",sans', '#808080');
	desc1.x = 295;
	desc1.y = 230;
	desc1.textAlign = 'right';
	var desc2 = new createjs.Text('The Weaver Girl and the Cowherd', 'italic 16px "Noto Sans",sans', '#808080');
	desc2.x = 300;
	desc2.y = 230;
	desc2.textAlign = 'left';
	desc2.on('mouseover', function(){
		desc2.color = '#b0b0b0';
	});
	desc2.on('mouseout', function(){
		desc2.color = '#808080';
	});
	desc2.on('click', function(){
		window.open('https://en.wikipedia.org/wiki/The_Weaver_Girl_and_the_Cowherd', '_blank');
	});
	stage.addChild(desc0, desc1, desc2);

	// levels
	var birdsLoc = [
		{x: 200, y: 390},
		{x: 290, y: 370},
		{x: 380, y: 355},
		{x: 470, y: 345},
		{x: 560, y: 338},
		{x: 650, y: 333},
		{x: 740, y: 330}
	];
	var girlSprite = new createjs.SpriteSheet({
		images: [game.resources.getResult('girl')],
		frames: { width: 30, height: 60 },
		animations: {
			right: 0,
			goRight: 1,
			goLeft: 2,
			left: 3
		}
	});
	var createGirl = function(x, y){
		var girl = new createjs.Container();
		var girlPic = new createjs.Sprite(girlSprite, 'right');
		girl.ani = girlPic;
		girlPic.x = 0;
		girlPic.y = -30;
		girlPic.regX = 15;
		girlPic.regY = 30;
		girl.addChild(girlPic);
		girl.x = x;
		girl.y = y;
		return girl;
	};
	var birdSprite = new createjs.SpriteSheet({
		images: [game.resources.images.bird],
		frames: { width: 80, height: 80 },
		animations: {
			stay: 0,
			fly: {
				frames: [0,1,2,3,4,5,6,7,6,5,4,3,2,1],
				speed: 0.4,
			}
		}
	});
	var birdMtSprite = new createjs.SpriteSheet({
		images: [game.resources.images.birdMonsterTitle],
		frames: { width: 80, height: 80 },
		animations: {
			stay: 0,
			fly: {
				frames: [0,1,2,3,4,5,6,7,6,5,4,3,2,1],
				speed: 0.4,
			}
		}
	});
	var createBird = function(x, y, monochrome){
		var bird = new createjs.Container();
		var img = birdSprite;
		if(monochrome) img = birdMtSprite;
		var birdPic = new createjs.Sprite(img);
		birdPic.x = -35;
		birdPic.y = -50;
		birdPic.gotoAndPlay('stay');
		birdPic.on('mouseover', function(){
			birdPic.gotoAndPlay('fly');
		});
		birdPic.on('mouseout', function(){
			birdPic.gotoAndPlay('stay');
		});
		bird.addChild(birdPic);
		bird.x = x;
		bird.y = y;
		return bird;
	};
	birdsLoc.forEach(function(pos, id){
		var bird = createBird(pos.x, pos.y, id === 6);
		if((game.storage.currentLevel || 0) === id) {
			stage.addChild( createGirl(pos.x, pos.y) );
		}
		if(id > (game.storage.reachedLevel || 0)) {
			bird.alpha = 0.2;
		}
		bird.on('click', function(){
			if(id > (game.storage.reachedLevel || 0)) {
				if(!confirm('This level is locked. Do you REALLY want to play it?')) return;
			}
			if(id) game.level(id);
			else game.texts(game.prologue, function(){
				game.level(0);
			});
		});
		stage.addChild(bird);
	});

	createjs.Ticker.on('tick', function(){
		stage.update();
	});
};
