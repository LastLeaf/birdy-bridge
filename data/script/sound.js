(function(){
	'use strict';

	createjs.Sound.volume = 0;
	var fadingOut = false;
	var curAudio = 0;
	var curVol = 100;
	var fadingFunc = function(){
		var vol = Math.round(createjs.Sound.volume * 100);
		if(!fadingOut) {
			if(vol === curVol) return;
			if(vol < curVol) vol++;
			else vol--;
		} else {
			if(vol === 0) {
				fadingOut = false;
				createjs.Sound.stop();
				createjs.Sound.play('audio' + curAudio, 'none', 0, 0, -1);
				vol++;
			} else {
				vol--;
			}
		}
		createjs.Sound.volume = vol/100;
	};

	game.sound = {
		init: function(){
			createjs.Ticker.on('tick', fadingFunc);
		},
		play: function(num, vol){
			if(vol >= 0) curVol = vol;
			if(curAudio === num) return;
			fadingOut = true;
			curAudio = num;
		}
	};
})();
