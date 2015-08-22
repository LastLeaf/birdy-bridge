// Copyright (c) 2013 LastLeaf, MIT License, https://github.com/LastLeaf/imgprocessor
'use strict';
(function(global){

// try web workers
var USE_WEB_WORKERS = false;
if(Worker) {
	// try using web workers
	var tags = document.getElementsByTagName('script');
	var workerSrc = '';
	for(var i=tags.length-1; i>=0; i--) {
		var tag = tags[i];
		if(typeof(tag.getAttribute('imgprocessor-worker')) === 'string')
			workerSrc = tag.src;
	}
	if(workerSrc) {
		var imgWorker = function(data, transfer, callback){
			var worker = new Worker(workerSrc);
			worker.onmessage = function(e){
				worker.terminate();
				callback(e.data);
			};
			worker.postMessage(data, transfer);
		};
		USE_WEB_WORKERS = true;
	}
}

// define prototype
var ImgProcessor = function(){};
var processor = ImgProcessor.prototype;
global.imgprocessor = function(image){
	var obj = new ImgProcessor();
	obj.pending = [];
	obj.working = [];
	obj.imgData = getImgData(obj, image);
	return obj;
};

// pending jobs management
var doJobs = function(proc){
	setTimeout(function(){
		proc.working[0].call(proc, function(){
			proc.working.shift();
			if(proc.working.length) doJobs(proc);
		});
	},0);
};
var doPending = function(proc){
	var waiting = !proc.working.length;
	while(proc.pending.length)
		proc.working.push(proc.pending.shift());
	if(waiting && proc.working.length) doJobs(proc);
};
var addPending = function(that, func){
	that.pending.push(func);
};

// get image data
var imgToImgData = function(img){
	var canvas = document.createElement('canvas');
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	var ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	return ctx.getImageData(0, 0, canvas.width, canvas.height);
};
var getImgData = function(obj, image){
	if(typeof(image) === 'string') {
		// load image from url
		addPending(obj, function(doneFunc){
			var img = document.createElement('img');
			var that = this;
			img.onload = function(){
				that.imgData = imgToImgData(this);
				doneFunc();
			};
			img.src = image;
		});
		return null;
	}
	if(image instanceof Uint8Array) {
		// copy image data
		var canvas = document.createElement('canvas');
		var imgData = canvas.getContext('2d').createImageData(image.width, image.height);
		var length = image.width * image.height * 4;
		for(var i=0; i<length; i++)
			imgData.data[i] = image.data[i];
		return imgData;
	}
	if(image.tagName === 'IMG') {
		// read data from <img>
		return imgToImgData(image);
	}
	if(image.tagName === 'CANVAS') {
		// read data from <canvas>
		var canvas = image;
		var ctx = canvas.getContext('2d');
		return ctx.getImageData(0, 0, canvas.width, canvas.height);
	}
	throw new Error();
};

// add algorithm to prototype
for(var k in imgprocessorAlgorithm) {
	processor[k] = (function(k){
		if(USE_WEB_WORKERS) {
			// post message to workers
			return function(){
				var args = [];
				for(var i=0; i<arguments.length; i++)
					args.push(arguments[i]);
				addPending(this, function(doneFunc){
					var that = this;
					imgWorker({func: k, args: args, data: this.imgData}, [this.imgData.data.buffer], function(data){
						that.imgData = data;
						doneFunc();
					});
				});
				return this;
			};
		}
		// using common function calls
		return function(){
			var args = [];
			for(var i=0; i<arguments.length; i++)
				args.push(arguments[i]);
			addPending(this, function(doneFunc){
				args.unshift(this.imgData);
				imgprocessorAlgorithm[k].apply(global, args);
				doneFunc();
			});
			return this;
		};
	})(k);
}

// exec jobs
processor.exec = function(callback){
	// add to pending jobs
	addPending(this, function(doneFunc){
		doneFunc();
		if(!callback) return;
		callback(this.imgData);
	});
	// do pending jobs
	doPending(this);
	return this;
};

// convert to canvas
var imgDataToCanvas = function(imgData){
	var canvas = document.createElement('canvas');
	canvas.width = imgData.width;
	canvas.height = imgData.height;
	var ctx = canvas.getContext('2d');
	ctx.putImageData(imgData, 0, 0);
	return canvas;
};
processor.toCanvas = function(callback){
	// add to pending jobs
	addPending(this, function(doneFunc){
		doneFunc();
		if(!callback) return;
		callback(imgDataToCanvas(this.imgData));
	});
	// do pending jobs
	doPending(this);
	return this;
};

// convert to image
var canvasToImage = function(canvas, callback){
	if(canvas.toBlob && URL && URL.createObjectURL) {
		// use blob to convert
		canvas.toBlob(function(blob){
			var url = URL.createObjectURL(blob);
			var img = document.createElement('img');
			img.onload = function(){
				img.onload = null;
				URL.revokeObjectURL(url);
				callback(img);
			};
			img.src = url;
		});
	} else {
		// fallback to use data url
		var url = canvas.toDataURL();
		var img = document.createElement('img');
		img.onload = function(){
			img.onload = null;
			callback(img);
		};
		img.src = url;
	}
};
processor.toImage = function(callback){
	// add to pending jobs
	addPending(this, function(doneFunc){
		if(!callback) {
			doneFunc();
			return;
		}
		var canvas = imgDataToCanvas(this.imgData);
		canvasToImage(canvas, function(img){
			doneFunc();
			callback(img);
		});
	});
	// do pending jobs
	doPending(this);
	return this;
};

})(this);
