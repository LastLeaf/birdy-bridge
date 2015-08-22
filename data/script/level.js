game.level = function(levelId){
	'use strict';

	var stage = game.stage;
	stage.removeAllChildren();
	stage.removeAllEventListeners('stagemousedown');
	stage.removeAllEventListeners('stagemousemove');
	stage.removeAllEventListeners('stagemouseup');
	stage.removeAllEventListeners('mouseout');
	createjs.Ticker.removeAllEventListeners();

	var design = game.levelDesign[levelId];
	if(!design) {
		game.texts(game.epilogue, function(){
			game.main();
		});
		return;
	}
	game.storage.currentLevel = levelId;
	if((game.storage.reachedLevel || 0) <= levelId) game.storage.reachedLevel = levelId;
	game.storageSave();

	var backgroundLayer = new createjs.Container();
	backgroundLayer.mouseEnabled = false;
	var objectsLayer = new createjs.Container();
	objectsLayer.mouseEnabled = false;
	var mouseLayer = new createjs.Container();
	var fadeInLayer = new createjs.Container();
	stage.addChild(backgroundLayer, objectsLayer, mouseLayer, fadeInLayer);

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
	var hintAlpha = 600;
	createjs.Ticker.on('tick', function(){
		if(hintAlpha < 0) return;
		hintAlpha--;
		hint.alpha = hintAlpha / 60;
		if(hintAlpha === 0) stage.removeChild(hint);
	});
	stage.addChild(hint);

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
		createjs.Ticker.on('tick', function(){
			if(curTick === loopTicks) {
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
	var createBird = function(x, y){
		var bird = new createjs.Container();
		var birdPic = new createjs.Bitmap(game.resources.getResult('bird'));
		birdPic.x = -35;
		birdPic.y = -50;
		bird.addChild(birdPic);
		bird.x = x;
		bird.y = y;
		return bird;
	};
	var girl = createGirl(design.start.x, design.start.y);
	var birdEnd = createBird(design.end.x, design.end.y);
	var birdsLayer = new createjs.Container();
	var badStarsLayer = new createjs.Container();
	objectsLayer.addChild(girl, birdsLayer, birdEnd, badStarsLayer);

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
	var walkTouchedStar = false;
	var walkSkipped = false;
	var walkFrom = null;
	var walkTo = null;
	var walkSkipFrom = 0;
	var GRAVITY = 0.2;
	var JUMP_SPEED = -5;
	var WALK_SPEED = 2;
	var walkToBird = function(fromBird, toBird){
		// set state
		walkFrom = fromBird;
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
			var min = (toBird.x - girl.x) * walkDir - 20;
			var max = min + 40;
			if(dxA >= min && dxA <= max) {
				walkSkipFrom = fromBird.x + walkDir * ((max + dxA) / 2 - dxA);
				return;
			}
		}
		var min = (toBird.x - girl.x) * walkDir - 20;
		var max = min + 40;
		if(dx < min) walkSkipFrom = fromBird.x + walkDir * 20;
		else if(dx > max) walkSkipFrom = girl.x;
		else walkSkipFrom = girl.x + walkDir * ((max + dx) / 2 - dx);
	};
	createjs.Ticker.on('tick', function(){
		// next position
		if(walkTouchedStar) {
			girl.sy += GRAVITY;
			girl.y += girl.sy;
			if(girl.y > 600) {
				endLevel(false);
			}
			return;
		}
		if(walkDir > 0) {
			if(girl.x < walkSkipFrom && girl.x < walkFrom.x + 20) {
				girl.x += WALK_SPEED;
			} else {
				girl.x += WALK_SPEED;
				if(!walkSkipped) {
					girl.sy = JUMP_SPEED - GRAVITY;
					walkSkipped = true;
				}
				girl.sy += GRAVITY;
				var newY = girl.y + girl.sy;
				if( Math.abs(girl.x - walkTo.x) <= 20 && (newY === walkTo.y || (newY - walkTo.y) * (girl.y - walkTo.y) < 0) ) {
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
					endLevel(false);
				}
			}
		} else if(walkDir < 0) {
			if(girl.x > walkSkipFrom && girl.x > walkFrom.x - 20) {
				girl.x -= WALK_SPEED;
			} else {
				girl.x -= WALK_SPEED;
				if(!walkSkipped) {
					girl.sy = JUMP_SPEED - GRAVITY;
					walkSkipped = true;
				}
				girl.sy += GRAVITY;
				var newY = girl.y + girl.sy;
				if( Math.abs(girl.x - walkTo.x) <= 20 && (newY === walkTo.y || (newY - walkTo.y) * (girl.y - walkTo.y) < 0) ) {
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
					endLevel(false);
				}
			}
		}
		// bad stars
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
			girl.sy = 0;
			girl.ani.gotoAndStop('left');
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
		if(isInit) return;
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
	birdPreview.alpha = 0.5;
	mouseLayer.addChild(birdPreview);
	var slowingStar = -1;
	stage.on('stagemousemove', function(e){
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
	var endLevel = function(passed){
		stage.removeAllEventListeners('stagemousedown');
		stage.removeAllEventListeners('stagemousemove');
		stage.removeAllEventListeners('stagemouseup');
		stage.removeAllEventListeners('mouseout');
		createjs.Ticker.on('tick', function(){
			fadeInLayer.alpha += 0.04;
			if(fadeInLayer.alpha >= 1) {
				if(passed) game.level(levelId+1);
				else game.level(levelId);
			}
		});
	};

	// update stage
	createjs.Ticker.on('tick', function(){
		stage.update();
	});
};
