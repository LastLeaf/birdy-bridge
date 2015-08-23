(function(){
	'use strict';

	window.game = {};
	game.TITLE = 'Birdy Bridge';

	createjs.Ticker.framerate = 60;

	var resources = [
		{id: 'lastleaf', src: 'image/lastleaf.png'},
		{id: 'title', src: 'image/title.png'},
		{id: 'background', src: 'image/background.png'},
		{id: 'backgroundTitle', src: 'image/background_title.png'},
		{id: 'girl', src: 'image/girl.png'},
		{id: 'badStar', src: 'image/bad_star.png'},
		{id: 'bird', src: 'image/bird.png'},
		{id: 'se1', src: 'audio/13.ogg'},
		{id: 'se2', src: 'audio/24.ogg'},
		{id: 'se3', src: 'audio/35.ogg'},
		{id: 'se4', src: 'audio/46.ogg'},
		{id: 'se5', src: 'audio/57.ogg'},
		{id: 'se6', src: 'audio/61.ogg'},
		{id: 'se7', src: 'audio/12153.ogg'},
		{id: 'audio1', src: 'audio/birdy_bridge.ogg'},
		{id: 'audio2', src: 'audio/birdy_bridge_danger.ogg'},
		{id: 'audio3', src: 'audio/birdy_bridge_battle.ogg'},
		{src: 'script/imgprocessor_algorithm.js'},
		{src: 'script/imgprocessor.js'},
		{src: 'script/sound.js'},
		{src: 'script/level.js'},
		{src: 'script/design.js'},
		{src: 'script/texts.js'},
		{src: 'script/main.js'}
	];

	var processImages = function(cb){
		var images = game.resources.images = {};
		images.bird = game.resources.getResult('bird');
		images.background = game.resources.getResult('background');
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
		pendingAdd();
		imgprocessor(images.bird).mirror(0).monochrome().mozaic(4).histogramEqualization().toCanvas(function(img){
			images.birdMonster = img;
			pendingEnd();
		});
		// background
		pendingAdd();
		imgprocessor(images.background).noiceGauss(50).toCanvas(function(img){
			images.background2 = img;
			pendingEnd();
		});
		pendingAdd();
		imgprocessor(images.background).noiceGauss(100).toCanvas(function(img){
			images.background3 = img;
			pendingEnd();
		});
		pendingAdd();
		imgprocessor(images.background).noiceGauss(100).noiceTwoValue(50).toCanvas(function(img){
			images.background4 = img;
			pendingEnd();
		});
		pendingAdd();
		imgprocessor(images.background).noiceGauss(100).noiceTwoValue(100).toCanvas(function(img){
			images.background5 = img;
			pendingEnd();
		});
		pendingAdd();
		imgprocessor(images.background).mozaic(10).noiceGauss(100).noiceTwoValue(100).toCanvas(function(img){
			images.background6 = img;
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

	// detect localStorage
	try {
		if(!localStorage['me.lastleaf.birdy-bridge']) {
			localStorage['me.lastleaf.birdy-bridge'] = "{}";
			if(localStorage['me.lastleaf.birdy-bridge.test'] !== "{}") throw new Error();
		}
	} catch(e) {
		progressText.text = 'Security policy prevented playing. Click here to play in new window.';
		game.stage.on('stagemouseup', function(){
			window.open(location.href, '_blank');
		});
		return;
	}

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
