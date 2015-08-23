game.texts = function(prologue, cb){
	'use strict';

	var stage = game.stage;
	stage.removeAllChildren();
	stage.removeAllEventListeners('stagemousedown');
	stage.removeAllEventListeners('stagemousemove');
	stage.removeAllEventListeners('stagemouseup');
	stage.removeAllEventListeners('mouseout');
	createjs.Ticker.removeAllEventListeners();
	game.sound.init();
	game.sound.play(1, 50);

	var lastText = null;
	prologue.forEach(function(text, id){
		var hint = new createjs.Text(text, '20px "Noto Sans",sans', '#b0b0b0');
		lastText = hint;
		hint.x = 50;
		hint.y = 100 + id * 40;
		hint.textAlign = 'left';
		stage.addChild(hint);
		var alpha = -id;
		createjs.Ticker.on('tick', function(){
			alpha += 0.05;
			hint.alpha = alpha;
		});
	});

	createjs.Ticker.on('tick', function(){
		stage.update();
	});
	stage.on('stagemousedown', function(){
		if(lastText.alpha < 1) return;
		cb();
	});
};
