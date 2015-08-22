(function(){
	'use strict';

	window.game = {};
	game.TITLE = 'Birdy Bridge';

	createjs.Ticker.framerate = 60;

	var resources = [
		{id: 'lastleaf', src: 'image/lastleaf.png'},
		{id: 'title', src: 'image/title.png'},
		{id: 'girl', src: 'image/girl.png'},
		{id: 'badStar', src: 'image/bad_star.png'},
		{id: 'bird', src: 'image/bird.png'},
		{id: 'level', src: 'script/level.js'},
		{id: 'levelDesign', src: 'script/design.js'},
		{id: 'texts', src: 'script/texts.js'},
		{id: 'main', src: 'script/main.js'}
	];

	game.stage = new createjs.Stage('stage');
	var progressText = new createjs.Text('Loading...', '20px "Noto Sans",sans', '#808080');
	progressText.textAlign = 'center';
	progressText.x = 400;
	progressText.y = 400;
	game.stage.addChild(progressText);
	createjs.Ticker.on('tick', function(){
		game.stage.update();
	});

	var queue = game.resources = new createjs.LoadQueue(true, 'data/');
	createjs.Sound.alternateExtensions = ['mp3'];
	queue.installPlugin(createjs.Sound);
	queue.on('progress', function(e){
		progressText.text = document.title = 'Loading... ' + Math.round(e.progress*100) + '%';
	});
	queue.on('complete', function(){
		document.title = game.TITLE;
		game.main();
	});
	queue.loadManifest(resources);
})();
