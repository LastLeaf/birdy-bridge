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
		{src: 'script/imgprocessor_algorithm.js'},
		{src: 'script/imgprocessor.js'},
		{src: 'script/level.js'},
		{src: 'script/design.js'},
		{src: 'script/texts.js'},
		{src: 'script/main.js'}
	];

	var processImages = function(cb){
		var images = game.resources.images = {};
		images.bird = game.resources.getResult('bird');
		var pendingCount = 1;
		var pendingAdd = function(){
			pendingCount ++;
		};
		var pendingEnd = function(){
			if(--pendingCount) return;
			cb();
		};
		// monster bird
		pendingAdd();
		imgprocessor(images.bird).monochrome().toCanvas(function(img){
			images.birdMonsterTitle = img;
			pendingEnd();
		});
		imgprocessor(images.bird).mirror(0).monochrome().mozaic(4).histogramEqualization().toCanvas(function(img){
			images.birdMonster = img;
			pendingEnd();
		});
		pendingEnd();
	};

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
		progressText.text = document.title = 'Processing...';
		processImages(function(){
			document.title = game.TITLE;
			game.main();
		});
	});
	queue.loadManifest(resources);
})();
