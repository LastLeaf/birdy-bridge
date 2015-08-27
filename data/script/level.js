game.level = function(levelId){
	'use strict';

	var stage = game.stage;
	stage.removeAllChildren();
	stage.removeAllEventListeners('stagemousedown');
	stage.removeAllEventListeners('stagemousemove');
	stage.removeAllEventListeners('stagemouseup');
	stage.removeAllEventListeners('mouseout');
	createjs.Ticker.removeAllEventListeners();
	game.sound.init();

	var design = game.levelDesign[levelId];
	game.storage.currentLevel = levelId;
	if((game.storage.reachedLevel || 0) <= levelId) game.storage.reachedLevel = levelId;
	game.storageSave();
	if(!design) {
		game.texts(game.epilogue, function(){
			game.main();
		});
		return;
	}
	game.sound.play(design.audio, 50);

	var backgroundLayer = new createjs.Container();
	backgroundLayer.mouseEnabled = false;
	var objectsLayer = new createjs.Container();
	objectsLayer.mouseEnabled = false;
	var mouseLayer = new createjs.Container();
	var fadeInLayer = new createjs.Container();
	var hintLayer = new createjs.Container();
	stage.addChild(backgroundLayer, objectsLayer, mouseLayer, hintLayer, fadeInLayer);

	// buttons
	var createButton = function(text, x, y, cb){
		var menuButton = new createjs.Text(text, '12px "Noto Sans",sans', '#fff');
		menuButton.alpha = 0.5;
		menuButton.lineHeight = 20;
		menuButton.textBaseline = 'middle';
		menuButton.textAlign = 'center';
		var menuButtonWrapper = new createjs.Container();
		var menuButtonShape = new createjs.Shape();
		menuButtonShape.graphics.f('#000').r(-10,-10,20,20);
		menuButtonWrapper.x = x;
		menuButtonWrapper.y = y;
		menuButtonWrapper.addChild(menuButtonShape, menuButton);
		mouseLayer.addChild(menuButtonWrapper);
		menuButtonWrapper.on('mouseover', function(){
			menuButton.alpha = 1;
		});
		menuButtonWrapper.on('mouseout', function(){
			menuButton.alpha = 0.5;
		});
		menuButtonWrapper.on('click', cb);
		return menuButtonWrapper;
	};
	createButton('T', 20, 440, function(){
		if(ended) return;
		game.main();
	});
	createButton('R', 40, 440, function(){
		if(ended) return;
		endLevel(false);
	});
	createButton('M', 60, 440, function(){
		if(ended) return;
		game.sound.muteToggle();
	});

	// display hearts for easy mode
	var heartsLayer = new createjs.Container();
	heartsLayer.x = 790;
	heartsLayer.y = 10;
	var hearts = 3;
	mouseLayer.addChild(heartsLayer);
	var initHearts = function(){
		if(!game.easyMode) return;
		for(var i=0; i<hearts; i++) {
			var heart = new createjs.Bitmap( game.resources.getResult('heart') );
			heart.scaleX = 0.6;
			heart.scaleY = 0.6;
			heart.y = 0;
			heart.x = - 24*i - 24;
			heartsLayer.addChild(heart);
		}
	};
	var decreaseHeart = function(){
		if(!game.easyMode) return false;
		if(hearts <= 1) return false;
		var heart = heartsLayer.getChildAt(--hearts);
		createjs.Ticker.on('tick', function(){
			if(heart.alpha <= 0.2) return;
			heart.alpha -= 0.3;
		});
		return true;
	};
	initHearts();

	// fade in
	var fadeShape = new createjs.Shape();
	fadeShape.graphics.f('#000').r(0,0,800,450);
	fadeShape.cache(0,0,800,450);
	fadeInLayer.addChild(fadeShape);
	var fadeInFunc = function(){
		fadeInLayer.alpha -= 0.04;
		if(fadeInLayer.alpha <= 0) createjs.Ticker.off('tick', fadeInListerner);
	};
	var fadeInListerner = createjs.Ticker.on('tick', fadeInFunc);

	// show hint
	var hint = new createjs.Text(design.hint, 'italic 20px "Noto Sans",sans', '#b0b0b0');
	hint.x = 400;
	hint.y = 420;
	hint.textAlign = 'center';
	hintLayer.addChild(hint);

	// basic objects
	var badStarSprite = new createjs.SpriteSheet({
		images: [game.resources.getResult('badStar')],
		frames: { width: 200, height: 200 },
		animations: {
			rotate: {
				frames: [0,1,2,3,4],
				speed: 0.1
			}
		}
	});
	var createBadStar = function(x, y, size){
		var badStar = new createjs.Container();
		var badStarPic = new createjs.Sprite(badStarSprite, 'rotate');
		badStarPic.scaleX = size / 200;
		badStarPic.scaleY = size / 200;
		badStarPic.x = -size/2;
		badStarPic.y = -size/2;
		badStar.addChild(badStarPic);
		badStarPic.gotoAndPlay('rotate');
		badStar.x = x;
		badStar.y = y;
		return badStar;
	};
	var createMovingStar = function(x1, y1, x2, y2, size, speed, minLen){
		var badStar = new createjs.Container();
		var badStarPic = new createjs.Sprite(badStarSprite, 'rotate');
		badStarPic.scaleX = size / 200;
		badStarPic.scaleY = size / 200;
		badStarPic.x = -size/2;
		badStarPic.y = -size/2;
		badStar.addChild(badStarPic);
		badStarPic.gotoAndPlay('rotate');
		var dx = 0;
		var dy = 0;
		var len = minLen;
		var dynamicDx = true;
		if(x2 !== null) {
			var dynamicDx = false;
			dx = x2 - x1;
			dy = y2 - y1;
			len = Math.sqrt(dx*dx + dy*dy);
			if(len < minLen) len = minLen;
			dx = dx / len * speed;
			dy = dy / len * speed;
		}
		var loopTicks = Math.round(len / speed);
		var curTick = loopTicks;
		if(x2 === null) {
			badStar.x = -1000;
			badStar.y = -1000;
			curTick += 120;
		}
		createjs.Ticker.on('tick', function(){
			if(curTick > loopTicks) {
				curTick--;
				return;
			}
			if(curTick === loopTicks) {
				if(ended) return;
				curTick = 0;
				badStar.x = x1;
				badStar.y = y1;
				if(dynamicDx) {
					dx = girl.x - x1;
					dy = (girl.y - 30) - y1;
					var r = Math.sqrt(dx*dx + dy*dy);
					dx = dx / r * speed;
					dy = dy / r * speed;
				}
			} else {
				badStar.x += dx;
				badStar.y += dy;
			}
			curTick++;
		});
		return badStar;
	};
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

	// birds
	var birdSprite = new createjs.SpriteSheet({
		images: [game.resources.images.bird],
		frames: { width: 80, height: 80 },
		animations: {
			stay: 0,
			glow: 8,
			fly: {
				frames: [0,1,2,3,4,5,6,7,6,5,4,3,2,1],
				speed: 0.4,
			}
		}
	});
	var birdMonsterSprite = new createjs.SpriteSheet({
		images: [game.resources.images.birdMonster],
		frames: { width: 80, height: 80 },
		animations: {
			stay: 8,
			fly: {
				frames: [2,3,4,5,6,7,8,7,6,5,4,3,2,1],
				speed: 0.4,
			}
		}
	});
	var createBird = function(x, y, isMonster){
		var bird = new createjs.Container();
		var img = birdSprite;
		if(isMonster) img = birdMonsterSprite;
		var birdPic = new createjs.Sprite(img);
		birdPic.x = -35;
		if(isMonster) birdPic.x = -45;
		birdPic.y = -50;
		birdPic.gotoAndPlay('stay');
		bird.ani = birdPic;
		bird.addChild(birdPic);
		bird.x = x;
		bird.y = y;
		return bird;
	};
	var girl = createGirl(design.start.x, design.start.y);
	var birdEnd = createBird(design.end.x, design.end.y, design.end.isMonster);
	if(!design.end.isMonster) {
		birdEnd.alpha = 0.7;
	} else {
		birdEnd.scaleX = 1.1;
		birdEnd.scaleY = 1.1;
		birdEnd.ani.gotoAndPlay('fly');
		var monsterYMin = birdEnd.y - 60;
		var monsterYMax = birdEnd.y + 60;
		var monsterYDir = -1;
		createjs.Ticker.on('tick', function(){
			if(ended) return;
			if(birdEnd.y > monsterYMax) monsterYDir = -1;
			if(birdEnd.y < monsterYMin) monsterYDir = 1;
			birdEnd.y += monsterYDir;
		});
	}
	var birdsLayer = new createjs.Container();
	var badStarsLayer = new createjs.Container();
	objectsLayer.addChild(girl, birdsLayer, birdEnd, badStarsLayer);

	// background
	var bgImg = game.resources.images['background' + levelId] || game.resources.images.background;
	var bg = new createjs.Bitmap( bgImg );
	bg.x = girl.x / 8 + 50*levelId - 400;
	bg.y = 0;
	bg.alpha = 0.7;
	backgroundLayer.addChild(bg);
	createjs.Ticker.on('tick', function(){
		var targetX = girl.x / 8 + 50*levelId - 400;
		if(bg.x !== targetX) bg.x = bg.x * 0.97 + targetX * 0.03;
	});

	// draw bad stars
	var badStars = [];
	design.badStars.forEach(function(bs){
		var badStar = createBadStar(bs.x, bs.y, bs.size);
		badStarsLayer.addChild(badStar);
		badStars.push(badStar);
	});
	design.meteorShower.forEach(function(bs){
		var badStar = createMovingStar(bs.x1, bs.y1, bs.x2, bs.y2, bs.size, bs.speed, bs.minLen);
		badStar.moving = true;
		badStarsLayer.addChild(badStar);
		badStars.push(badStar);
	});
	var starPlaced = function(x, y){
		for(var i=0; i<badStars.length; i++) {
			var badStar = badStars[i];
			if(badStar.dimLeft) continue;
			var dx = badStar.x - x;
			var dy = badStar.y - y;
			var d = badStar.getChildAt(0).scaleX * 100 * 0.9;
			if(dx*dx + dy*dy < d*d) {
				return i;
			}
		}
		return -1;
	};

	// place bird
	var birds = [ birdEnd ];
	var walkDir = 0;
	var walkReviving = 0;
	var walkTouchedStar = false;
	var walkSkipped = false;
	var walkFrom = null;
	var walkFromX = 0;
	var walkFromY = 0;
	var walkTo = null;
	var walkSkipFrom = 0;
	var GRAVITY = 0.2;
	var JUMP_SPEED = -5;
	var WALK_SPEED = 2;
	var walkToBird = function(fromBird, toBird){
		// set state
		walkFrom = fromBird;
		walkFromX = girl.x;
		walkFromY = girl.y;
		walkTo = toBird;
		walkSkipped = false;
		walkDir = 1;
		girl.ani.gotoAndStop('goRight');
		if(fromBird.x > toBird.x) {
			walkDir = -1;
			girl.ani.gotoAndStop('goLeft');
		}
		// find path
		var dx1 = - JUMP_SPEED / GRAVITY * WALK_SPEED;
		var yTop = - 0.5 * JUMP_SPEED * JUMP_SPEED / GRAVITY + fromBird.y;
		var dy2 = toBird.y - yTop;
		var dx2 = 1000000;
		if(dy2 > 0) {
			var dt2 = Math.sqrt(2 * dy2 / GRAVITY);
			dx2 = dt2 * WALK_SPEED;
		}
		var dxA = dx1 - dx2;
		var dx = dx1 + dx2;
		if(dxA > 0) {
			var min = (toBird.x - girl.x) * walkDir - 23;
			var max = min + 40;
			if(dxA >= min && dxA <= max) {
				walkSkipFrom = fromBird.x + walkDir * ((max + dxA) / 2 - dxA);
				return;
			}
		}
		var min = (toBird.x - girl.x) * walkDir - 23;
		var max = min + 40;
		if(dx2 >= 1000000) dx = dx1;
		if(dx < min) walkSkipFrom = fromBird.x + walkDir * 23;
		else if(dx > max) walkSkipFrom = girl.x;
		else walkSkipFrom = girl.x + walkDir * ((max + dx) / 2 - dx);
	};
	var revive = function(){
		walkReviving = 300;
	};
	createjs.Ticker.on('tick', function(){
		if(walkDir) walkReviving = 0;
		if(!walkReviving) girl.alpha = 1;
		else {
			walkReviving--;
			var alpha = walkReviving % 30;
			if(alpha < 15) alpha = 30 - alpha;
			girl.alpha = (alpha * 4 - 20) / 100;
		}
	});
	var falling = function(){
		if(!decreaseHeart()) {
			endLevel(false);
			return;
		}
		walkTouchedStar = false;
		if(walkDir) {
			walkDir = 0;
			walkSkipped = false;
			walkFrom = null;
			walkTo = null;
			walkSkipFrom = 0;
			birdsLayer.removeChild(birds.pop());
			birds[birds.length - 1].alpha = 1;
		}
		girl.sy = 0;
		girl.ani.gotoAndStop('right');
		girl.ani.rotation = 0;
		girl.x = walkFromX;
		girl.y = walkFromY;
		revive();
	};
	createjs.Ticker.on('tick', function(){
		// next position
		if(walkTouchedStar) {
			girl.sy += GRAVITY;
			girl.y += girl.sy;
			if(girl.y > 600) {
				falling();
			}
			return;
		}
		if(walkDir > 0) {
			if(girl.x < walkSkipFrom && girl.x < walkFrom.x + 23) {
				girl.x += WALK_SPEED;
			} else {
				girl.x += WALK_SPEED;
				if(!walkSkipped) {
					walkFrom.ani.gotoAndPlay('stay');
					girl.sy = JUMP_SPEED - GRAVITY;
					walkSkipped = true;
				}
				girl.sy += GRAVITY;
				var newY = girl.y + girl.sy;
				if( Math.abs(girl.x - walkTo.x) <= 23 && (newY === walkTo.y || (newY - walkTo.y) * (girl.y - walkTo.y) < 0) ) {
					var seNum = Math.ceil((400 - walkTo.y) / 60);
					if(levelId === 0) seNum = Math.ceil((300 - walkTo.y) / 45);
					if(seNum < 1) seNum = 1;
					else if(seNum > 6) seNum = 6;
					if(walkTo === birdEnd) seNum = 7;
					game.sound.playSe(seNum, 75);
					walkTo.ani.gotoAndPlay('fly');
					newY = walkTo.y;
					girl.sy = 0;
					girl.ani.gotoAndStop('right');
					if(walkTo === birdEnd) {
						walkDir = 0;
						return endLevel(true);
					}
					else walkDir = 0;
				}
				girl.y = newY;
				if(girl.y > 600) {
					falling();
				}
			}
		} else if(walkDir < 0) {
			if(girl.x > walkSkipFrom && girl.x > walkFrom.x - 23) {
				girl.x -= WALK_SPEED;
			} else {
				girl.x -= WALK_SPEED;
				if(!walkSkipped) {
					walkFrom.ani.gotoAndPlay('stay');
					girl.sy = JUMP_SPEED - GRAVITY;
					walkSkipped = true;
				}
				girl.sy += GRAVITY;
				var newY = girl.y + girl.sy;
				if( Math.abs(girl.x - walkTo.x) <= 23 && (newY === walkTo.y || (newY - walkTo.y) * (girl.y - walkTo.y) < 0) ) {
					var seNum = Math.ceil((400 - walkTo.y) / 60);
					if(levelId === 0) seNum = Math.ceil((300 - walkTo.y) / 45);
					if(seNum < 1) seNum = 1;
					else if(seNum > 6) seNum = 6;
					if(walkTo === birdEnd) seNum = 7;
					game.sound.playSe(seNum, 75);
					walkTo.ani.gotoAndPlay('fly');
					newY = walkTo.y;
					girl.sy = 0;
					girl.ani.gotoAndStop('left');
					if(walkTo === birdEnd) {
						walkDir = 0;
						return endLevel(true);
					}
					walkDir = 0;
				}
				girl.y = newY;
				if(girl.y > 600) {
					falling();
				}
			}
		}
		// bad stars
		if(walkReviving) return;
		var touched = false;
		[ [girl.x, girl.y - 10], [girl.x, girl.y - 30], [girl.x, girl.y - 50] ].forEach(function(v){
			var x = v[0];
			var y = v[1];
			for(var i=0; i<badStars.length; i++) {
				var badStar = badStars[i];
				if(badStar.dimLeft) continue;
				var dx = badStar.x - x;
				var dy = badStar.y - y;
				var d = badStar.getChildAt(0).scaleX * 100;
				if(dx*dx + dy*dy < d*d) {
					touched = true;
					return false;
				}
			}
		});
		if(touched) {
			walkTouchedStar = true;
			if(!walkDir) {
				walkFromX = girl.x;
				walkFromY = girl.y;
			}
			girl.sy = 0;
			girl.ani.gotoAndStop('right');
			girl.ani.rotation = 270;
		}
	});
	var birdPlaced = function(x, y){
		if(walkTouchedStar || walkDir || x < 30 || x > 770 || y < 50 || y > 400) return -2;
		for(var i=0; i<birds.length; i++) {
			var bird = birds[i];
			var dx = bird.x - x;
			var dy = bird.y - y;
			if(dx*dx + dy*dy < 60*60) return i;
			if(i === birds.length - 1 && dx < 50 && dx > -50) return -2;
		}
		return -1;
	};
	var placeBird = function(x, y, isInit){
		var p = starPlaced(x, y);
		if(p >= 0) return;
		p = birdPlaced(x, y);
		if(p === 0) {
			if(isInit) return;
			walkToBird(birds[birds.length - 1], birdEnd);
		}
		if(p !== -1) return;
		var bird = createBird(x, y);
		birdsLayer.addChild(bird);
		birds.push(bird);
		if(isInit) {
			bird.ani.gotoAndPlay('fly');
			return;
		}
		walkToBird(birds[birds.length - 2], bird);
	};
	createjs.Ticker.on('tick', function(){
		for(var i=1; i < birds.length - 1; i++) {
			var bird = birds[i];
			if(bird.alpha > 0.3) {
				bird.alpha -= 0.01;
			}
		}
	});
	placeBird(design.start.x, design.start.y, true);

	// mouse events
	var birdPreview = createBird(-1000, -1000);
	birdPreview.ani.gotoAndStop('glow');
	birdPreview.alpha = 0.5;
	mouseLayer.addChild(birdPreview);
	var slowingStar = -1;
	stage.on('stagemousemove', function(e){
		if(!design.end.isMonster) {
			birdEnd.alpha = 0.7;
		}
		// on star
		var p = starPlaced(e.stageX, e.stageY);
		if(p >= 0) {
			birdPreview.visible = false;
			if(slowingStar === p || slowingStar === -1) return;
			badStars[slowingStar].getChildAt(0).play();
			slowingStar = -1;
			return;
		}
		if(slowingStar >= 0) {
			badStars[slowingStar].getChildAt(0).play();
			slowingStar = -1;
		}
		// bird
		p = birdPlaced(e.stageX, e.stageY);
		if(p === 0) {
			birdPreview.visible = false;
			if(!design.end.isMonster) {
				birdEnd.alpha = 1;
			}
		} else if(p === -1) {
			birdPreview.visible = true;
			birdPreview.x = e.stageX;
			birdPreview.y = e.stageY;
		} else {
			birdPreview.visible = false;
		}
	});
	stage.on('stagemousedown', function(e){
		birdPreview.visible = false;
		var p = starPlaced(e.stageX, e.stageY);
		if(p >= 0) {
			if(slowingStar === p || badStars[p].dimLeft) return;
			badStars[p].getChildAt(0).stop();
			slowingStar = p;
			return;
		}
		placeBird(e.stageX, e.stageY);
	});
	stage.on('mouseout', function(e){
		birdPreview.visible = false;
	});

	// dim star
	var STAR_HOLD_TIME = 60;
	var STAR_DIM_TIME = 300;
	var starDim = -1;
	var starDimTicks = 0;
	createjs.Ticker.on('tick', function(){
		// dimming
		for(var i=0; i<badStars.length; i++) {
			var star = badStars[i];
			if(!star.dimLeft) {
				star.alpha = 1;
				continue;
			}
			star.dimLeft--;
			if(star.dimLeft < 40) star.alpha = 1 - 0.02*star.dimLeft;
			else if(star.dimLeft > STAR_DIM_TIME - 40) star.alpha = 1 - 0.02*(STAR_DIM_TIME - star.dimLeft);
			else star.alpha = 0.2;
		}
		// check new dimming
		if(slowingStar !== starDim) starDimTicks = 0;
		if(slowingStar === -1) return;
		starDim = slowingStar;
		starDimTicks++;
		if(starDimTicks === STAR_HOLD_TIME) {
			var star = badStars[starDim];
			star.dimLeft = STAR_DIM_TIME;
			badStars[slowingStar].getChildAt(0).play();
			slowingStar = -1;
		}
	});

	// end level
	var ended = false;
	var endLevel = function(passed){
		ended = true;
		stage.removeAllEventListeners('stagemousedown');
		stage.removeAllEventListeners('stagemousemove');
		stage.removeAllEventListeners('stagemouseup');
		stage.removeAllEventListeners('mouseout');
		if(!design.end.isMonster || !passed) {
			createjs.Ticker.on('tick', function(){
				fadeInLayer.alpha += 0.04;
				if(fadeInLayer.alpha >= 1) {
					if(passed) game.level(levelId+1);
					else game.level(levelId);
				}
			});
		} else {
			birdEnd.sy = 0;
			createjs.Ticker.on('tick', function(){
				birdEnd.sy += GRAVITY;
				birdEnd.y += birdEnd.sy;
				girl.x += WALK_SPEED;
				girl.ani.gotoAndPlay('right');
				fadeInLayer.alpha += 0.005;
				if(fadeInLayer.alpha >= 1) {
					game.level(levelId+1);
				}
			});
		}
	};

	// update stage
	createjs.Ticker.on('tick', function(){
		stage.update();
	});
};
