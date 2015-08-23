game.prologue = [
	'The girl and the boy live in two ends of the sky.',
	'There is no road connecting them.',
	'However, lovers could meet each other on Qixi Festival.',
	'This day, birds gather together, building a path for the girl.',
	'',
	'Now you are the birds, guiding the girl to the boy.'
];

game.epilogue = [
	'The girl defeat the monster, but there are no birds now.',
	'She just live in the monster\'s palace, alone.',
	'...',
	'What about the boy? Who knows.'
];

game.levelDesign = [
	{
		hint: 'Place a bird. The girl would try jumping onto it. Try moving to the rightmost.',
		start: { x: 200, y: 300 },
		end: { x: 600, y: 150 },
		badStars: [],
		meteorShower: []
	},
	{
		hint: 'There are bad stars in the sky. The girl won\'t touch them.',
		start: { x: 50, y: 400 },
		end: { x: 750, y: 100 },
		badStars: [
			{ x: 400, y: 225, size: 200 },
			{ x: 50, y: 50, size: 100 },
			{ x: 750, y: 400, size: 100 },
		],
		meteorShower: []
	},
	{
		hint: 'Bad stars would fade for a while if holding with your mouse.',
		start: { x: 50, y: 400 },
		end: { x: 750, y: 100 },
		badStars: [
			{ x: 60, y: 60, size: 100 },
			{ x: 160, y: 160, size: 100 },
			{ x: 260, y: 260, size: 100 },
			{ x: 360, y: 360, size: 100 },
			{ x: 800 - 390, y: 60, size: 100 },
			{ x: 800 - 290, y: 170, size: 100 },
			{ x: 800 - 190, y: 280, size: 100 },
			{ x: 800 - 90, y: 390, size: 100 }
		],
		meteorShower: []
	},
	{
		hint: 'Meteor shower is beautiful, and deadful.',
		start: { x: 50, y: 400 },
		end: { x: 750, y: 100 },
		badStars: [],
		meteorShower: [
			{ x1: 0, y1: 0, x2: 1400, y2: 1450, size: 40, speed: 10 },
			{ x1: -200, y1: 0, x2: 1200, y2: 1450, size: 35, speed: 7 },
			{ x1: 400, y1: -400, x2: 600, y2: 800, size: 45, speed: 6 },
			{ x1: 900, y1: -100, x2: 400, y2: 800, size: 40, speed: 9 },
			{ x1: 500, y1: -600, x2: 150, y2: 800, size: 40, speed: 7 }
		]
	},
	{
		hint: 'Dangerous is everywhere. Nobody fears.',
		start: { x: 50, y: 350 },
		end: { x: 750, y: 150 },
		badStars: [
			{ x: 300, y: 100, size: 100 },
			{ x: 200, y: 300, size: 100 },
			{ x: 500, y: 350, size: 100 },
			{ x: 600, y: 200, size: 100 }
		],
		meteorShower: [
			{ x1: 0, y1: 0, x2: 1400, y2: 1450, size: 40, speed: 10 },
			{ x1: 400, y1: -400, x2: 600, y2: 800, size: 45, speed: 6 },
			{ x1: 500, y1: -600, x2: 150, y2: 800, size: 40, speed: 7 }
		]
	},
	{
		hint: 'But the girl wondered - the boy lives in this dangerous place?',
		start: { x: 50, y: 350 },
		end: { x: 750, y: 150 },
		badStars: [
			{ x: 60, y: 60, size: 100 },
			{ x: 170, y: 170, size: 100 },
			{ x: 280, y: 280, size: 100 },
			{ x: 800 - 280, y: 170, size: 100 },
			{ x: 800 - 170, y: 280, size: 100 },
			{ x: 800 - 60, y: 390, size: 100 }
		],
		meteorShower: [
			{ x1: 800 - 390 + 100, y1: 60 - 100, x2: 800 - 390 - 1000, y2: 60 + 1000, size: 50, speed: 5 },
			{ x1: 390 + 600, y1: 390 - 600, x2: 390 - 500, y2: 390 + 500, size: 50, speed: 5 },
			{ x1: 800 - 390 + 400 - 240, y1: 60 - 400, x2: 800 - 390 - 700 - 240, y2: 60 + 700, size: 40, speed: 5 },
			{ x1: 390 + 500 + 240, y1: 390 - 500, x2: 390 - 600 + 240, y2: 390 + 600, size: 40, speed: 5 },
			{ x1: 800 - 390 + 300 - 30, y1: 60 - 300, x2: 800 - 390 - 800 - 30, y2: 60 + 800, size: 30, speed: 5 },
			{ x1: 390 + 200 + 30, y1: 390 - 200, x2: 390 - 900 + 30, y2: 390 + 900, size: 30, speed: 5 },
		]
	},
	{
		hint: 'Ahhhhhhhh there is the bird monster!!!',
		start: { x: 50, y: 300 },
		end: { x: 750, y: 200, isMonster: true },
		badStars: [],
		meteorShower: [
			{ x1: 700, y1: 180, x2: null, y2: null, size: 40, speed: 5, minLen: 1200 }
		]
	}
];
