var loader = {
	loaded: true,
	loadedCount: 0,
	totalCount: 0,
	loadingScreen: $('#loadingScreen'),
	loadingMessage: $('#loadingMessage'),

	init: function(){
		var mp3Support, oggSupport;
		var audio = document.createElement('audio');
		if(audio.canPlayType){
			mp3Support = '' != audio.canPlayType('audio/mpeg');
			oggSupport = '' != audio.canPlayType('audio/ogg; codecs="vorbis"');
		} else {
			mp3Support = false;
			oggSupport = false;
		}

		loader.soundFileExtn = oggSupport ? '.ogg' : mp3Support ? '.mp3' : undefined;
	},

	loadImage: function(url){
		this.totalCount ++;
		this.loaded = false;
		loader.loadingScreen.show();
		var img = new Image();
		img.onload = loader.itemLoaded;
		img.src = url;
		return img;
	},

	loadSound: function(url){
		this.totalCount ++;
		this.loaded = false;
		loader.loadingScreen.show();
		var audio = new Audio();
		audio.addEventListener('canplaythrough', loader.itemLoaded, false);
		audio.src = url + loader.soundFileExtn;
		return audio;
	},
	itemLoaded: function(){
		loader.loadedCount ++;
		loader.loadingMessage.html('Load ' + loader.loadedCount + ' of ' + loader.totalCount);
		if(loader.loadedCount === loader.totalCount){
			loader.loaded= true;
			loader.loadingScreen.hide();
			if(loader.onload){
				loader.onload();
				loader.onload = undefined;
			}
		}
	}
};
var maps = {
	singleplayer: [
		{
			name: 'Introduction',
			briefing: 'In this level you will learn how to pan across the map.\n\nDon\'t worry! We will be implementing more features soon.',

			mapImage: 'images/maps/level-one-debug-grid.png',
			startX: 4,
			startY: 4,

			requirements: {
				buildings: ['base', 'starport', 'harvester', 'ground-turret'],
				vehicles: ['transport', 'harvester', 'scout-tank', 'heavy-tank'],
				aircraft: ['chopper', 'wraith'],
				terrain: ['oilfield', 'bigrocks', 'smallrocks']
			},

			items: [
				{type: 'buildings', name: 'base', x: 11, y: 14, team: 'blue', action: 'construct'},
				{type: 'buildings', name: 'base', x: 12, y: 16, team: 'green'},
				{type: 'buildings', name: 'base', x: 15, y: 15, team: 'green', life: 50},

				{type: 'buildings', name: 'starport', x: 18, y: 14, team: 'blue'},
				{type: 'buildings', name: 'starport', x: 18, y: 10, team: 'blue', action: 'teleport'},
				{type: 'buildings', name: 'starport', x: 18, y: 6, team: 'green', action: 'open'},

				{type: 'buildings', name: 'harvester', x: 20, y: 10, team: 'blue'},
				{type: 'buildings', name: 'harvester', x: 22, y: 12, team: 'green', action: 'deploy'},

				{type: 'buildings', name: 'ground-turret', x: 14, y: 9, team: 'blue', direction: 3},
				{type: 'buildings', name: 'ground-turret', x: 14, y: 12, team: 'blue', action: 'teleport'},
				{type: 'buildings', name: 'ground-turret', x: 16, y: 10, team: 'green', direction: 1},


				{type: 'vehicles', name: 'transport', x: 26, y: 10, team: 'blue', direction: 2},
				{type: 'vehicles', name: 'harvester', x: 26, y: 12, team: 'blue', direction: 3},
				{type: 'vehicles', name: 'scout-tank', x: 26, y: 14, team: 'blue', direction: 4},
				{type: 'vehicles', name: 'heavy-tank', x: 26, y: 16, team: 'blue', direction: 5},

				{type: 'vehicles', name: 'transport', x: 30, y: 10, team: 'green', direction: 2},
				{type: 'vehicles', name: 'harvester', x: 30, y: 12, team: 'green', direction: 3},
				{type: 'vehicles', name: 'scout-tank', x: 30, y: 14, team: 'green', direction: 4},
				{type: 'vehicles', name: 'heavy-tank', x: 30, y: 16, team: 'green', direction: 5},

				{type: 'aircraft', name: 'chopper', x: 20, y: 22, team: 'blue', direction: 2},
				{type: 'aircraft', name: 'wraith', x: 23, y: 22, team: 'green', direction: 3},

				{type: 'terrain', name: 'oilfield', x: 5, y: 7},
				{type: 'terrain', name: 'oilfield', x: 8, y: 7, action: 'hint'},
				{type: 'terrain', name: 'bigrocks', x: 5, y: 3},
				{type: 'terrain', name: 'smallrocks', x: 8, y: 3}
			]
		}
	]
};
var singleplayer = {
	start: function(){
		$('.game-player').hide();

		singleplayer.currentLevel = 0;
		game.type = 'singleplayer';
		game.team = 'blue';
		
		singleplayer.startCurrentLevel();
	},
	exit: function(){
		$('.game-player').hide();

		$('#gameStartScreen').show();
	},
	startCurrentLevel: function(){
		var level = maps.singleplayer[singleplayer.currentLevel];

		$('#enterMission').attr('disabled', true);

		game.currentMapImage = loader.loadImage(level.mapImage);
		game.currentLevel = level;

		game.offsetX = level.startX * game.gridSize;
		game.offsetY = level.startY * game.gridSize;

		// load level requirements
		game.resetArrays();
		for(var type in level.requirements){
			var requirementArray = level.requirements[type]
			for(var i = 0; i < requirementArray.length; i ++){
				var name = requirementArray[i];
				if(window[type]){
					window[type].load(name);
				} else {
					console.log('Could not load type: ' + type);
				}
			}
		}

		for(var i = level.items.length - 1; i >= 0; i --){
			var itemDetails = level.items[i];
			game.add(itemDetails);
		}

		if(loader.loaded){
			$('#enterMission').removeAttr('disabled');
		} else {
			loader.onload = function(){
				$('#enterMission').removeAttr('disabled');
			};
		}

		$('#missionBriefing').html(level.briefing);
		$('#missionScreen').show();
	},
	play: function(){
		game.animationLoop();
		game.animationInterval = setInterval(game.animationLoop, game.animationTimeout);
		game.start();
	}
};
var mouse = {
	/* x,y coordinates of mouse relative to the top left corner of the canvas */
	x: 0,
	y: 0,

	/* x,y coordinates of mouse relative to the top left corner of the game map */
	gameX: 0,
	gameY: 0,

	/* game grid x,y coordinates of mouse */
	gridX: 0,
	gridY: 0,

	// left mouse is on pressed
	buttonPressed: false,
	// is dragging?
	dragSelect: false,
	insideCanvas: false,

	click: function(ev, rightClick){
		var clickedItem = this.itemUnderMouse();
		var shiftPressed = ev.shiftKey;

		if(!rightClick){
			if(clickedItem){
				if(!shiftPressed){
					game.clearSelection();
				}
				game.selectItem(clickedItem, shiftPressed);
			}
		} else {

		}
	},
	itemUnderMouse: function(){
		for(var i = game.items.length - 1; i >= 0; i --){
			var item = game.items[i];
			if(item.type == 'buildings' || item.type == 'terrain'){
				if(item.lifeCode != 'dead'
					&& item.x <= (mouse.gameX) / game.gridSize
					&& item.x >= (mouse.gameX - item.baseWidth) / game.gridSize
					&& item.y <= (mouse.gameY) / game.gridSize
					&& item.y >= (mouse.gameY - item.baseHeight) /game.gridSize){
					return item;
				}
			} else if(item.type == 'aircraft'){
				if(item.lifeCode != 'dead'
					&& Math.pow(item.x - mouse.gameX / game.gridSize, 2) + 
					Math.pow(item.y - mouse.gameY/game.gridSize, 2) <
					Math.pow(item.radius / game.gridSize, 2)){
					return item;
				}
			} else {
				if(item.lifeCode != 'dead'
					&& Math.pow(item.x - mouse.gameX / game.gridSize, 2) + 
					Math.pow(item.y - mouse.gameY/game.gridSize, 2) <
					Math.pow(item.radius / game.gridSize, 2)){
					return item;
				}
			}
		}
	},

	draw: function(){
		if(this.dragSelect){
			var x = Math.min(this.gameX, this.dragX);
			var y = Math.min(this.gameY, this.dragY);
			var width = Math.abs(this.gameX - this.dragX);
			var height = Math.abs(this.gameY - this.dragY);
			game.foregroundContext.strokeStyle = 'white';
			game.foregroundContext.strokeRect(x - game.offsetX, y - game.offsetY, width, height);
		}
	},

	calculateGameCoordinates: function(){
		mouse.gameX = mouse.x + game.offsetX;
		mouse.gameY = mouse.y + game.offsetY;

		mouse.gridX = Math.floor(mouse.gameX / game.gridSize);
		mouse.gridY = Math.floor(mouse.gameY / game.gridSize);
	},

	init: function(){
		var $mouseCanvas = $('#gameForegroundCanvas');
		$mouseCanvas.mousemove(function(ev){
			var offset = $mouseCanvas.offset();
			mouse.x = ev.pageX - offset.left;
			mouse.y = ev.pageY - offset.top;

			mouse.calculateGameCoordinates();

			if(mouse.buttonPressed){
				if((Math.abs(mouse.dragX - mouse.gameX) > 4) ||
					(Math.abs(mouse.dragY - mouse.gameY) > 4)){
					mouse.dragSelect = true;
				} else {
					mouse.dragSelect = false;
				}
			}
		});

		$mouseCanvas.click(function(ev){
			mouse.click(ev, false);
			mouse.dragSelect = false;
			return false;
		});

		$mouseCanvas.mousedown(function(ev){
			if(ev.which == 1){
				mouse.buttonPressed = true;
				mouse.dragX = mouse.gameX;
				mouse.dragY = mouse.gameY;
				ev.preventDefault();
			}
			return false;
		});

		$mouseCanvas.bind('contextmenu', function(ev){
			mouse.click(ev, true);
			return false;
		});

		$mouseCanvas.mouseup(function(ev){
			var shiftPressed = ev.shiftKey;
			if(ev.which == 1){

				if(mouse.dragSelect){
					if(!shiftPressed){
						game.clearSelection();
					}

					var x1 = Math.min(mouse.gameX, mouse.dragX) / game.gridSize;
					var y1 = Math.min(mouse.gameY, mouse.dragY) / game.gridSize;
					var x2 = Math.max(mouse.gameX, mouse.dragX) / game.gridSize;
					var y2 = Math.max(mouse.gameY, mouse.dragY) / game.gridSize;

					for(var i = game.items.length - 1; i >= 0; i --){
						var item = game.items[i];
						if(item.type != 'buildings'
							&& item.selectable && item.team == game.team 
							&& x1 <= item.x && x2 >= item.x){
							if(item.type == 'vehicles'
								&& y1 <= item.y && y2 >= item.y){
								game.selectItem(item);
								continue;
							}
							if(item.type == 'aircraft'
								&& y1 <= item.y
								&& y2 >= item.y){
								game.selectItem(item);
								continue;
							}
						}
					}
				}


				mouse.buttonPressed = false;
				mouse.dragSelect = false;
			}

			return false;
		});

		$mouseCanvas.mouseleave(function(ev){
			mouse.insideCanvas = false;
		});

		$mouseCanvas.mouseenter(function(ev){
			mouse.buttonPressed = false;
			mouse.insideCanvas = true;
		});
	}
};
var game = {
	gridSize: 20,
	backgroundChanged: true,
	animationTimeout: 100,
	offsetX: 0,
	offsetY: 0,
	panningThreshold: 60,
	panningSpeed: 10,

	selectionBorderColor: 'rgba(255,255,0,0.5)',
	selectionFillColor: 'rgba(255,215,0,0.2)',
	healthBarBorderColor: 'rgba(0,0,0,0.8)',
	healthBarHealthyFillColor: 'rgba(0,255,0,0.5)',
	healthBarDamagedFillColor: 'rgba(255,0,0,0.5)',
	lifeBarHeight: 5,

	clearSelection: function(){
		while(game.selectedItems.length > 0){
			game.selectedItems.pop().selected = false;
		}
	},

	selectItem: function(item, shiftPressed){
		if(shiftPressed && item.selected){
			item.selected = false;
			for(var i = game.selectedItems.length - 1; i >= 0; i --){
				game.selectedItems.splice(i, 1);
				break;
			}
			return;
		}

		if(item.selectable && !item.selected){
			item.selected = true;
			game.selectedItems.push(item);
		}
	},

	init: function(){
		loader.init();
		mouse.init();

		$('.game-player').hide();
		$('#gameStartScreen').show();

		game.backgroundCanvas = document.getElementById('gameBackgroundCanvas');
		game.backgroundContext = game.backgroundCanvas.getContext('2d');

		game.foregroundCanvas = document.getElementById('gameForegroundCanvas');
		game.foregroundContext = game.foregroundCanvas.getContext('2d');

		game.canvasWidth = game.backgroundCanvas.width;
		game.canvasHeight = game.backgroundCanvas.height;
	},

	start: function(){
		$('.game-player').hide();

		$('#gameInterfaceScreen').show();
		game.running = true;
		game.refreshBackground = true;

		game.drawingLoop();
	},
	resetArrays: function(){
		game.counter = 1;
		
		game.items = [];
		
		game.buildings = [];
		game.vehicles = [];
		game.aircraft = [];
		game.terrain = [];

		game.triggeredEvents = [];
		game.selectedItems = [];
		game.sortedItems = [];
	},
	add: function(itemDetails){
		if(!itemDetails.uid){
			itemDetails.uid = game.counter ++;
		}

		var item = window[itemDetails.type].add(itemDetails);
		game.items.push(item);
		game[item.type].push(item);

		return item;
	},
	remove: function(item){
		item.selectedItems = false;
		for(var i = game.selectedItems.length - 1; i >= 0; i --){
			if(game.selectedItems[i].uid == item.uid){
				game.selectedItems.splice(i, 1);
				break;
			}
		}

		for(var i = game.items.length - 1; i >= 0; i --){
			if(game.items[i].uid == item.uid){
				game.items.splice(i, 1);
				break;
			}
		}

		for(var i = game[item.type].length - 1; i >= 0; i --){
			if(game[item.type][i].uid == item.uid){
				game[item.type].splice(i, 1);
				break;
			}
		}
	},
	handlePanning: function() {
		if(!mouse.insideCanvas){
			return;
		}

		if(mouse.x <= game.panningThreshold){
			if(game.offsetX >= game.panningSpeed){
				game.refreshBackground = true;
				game.offsetX -= game.panningSpeed;
			}
		} else if(mouse.x >= game.canvasWidth - game.panningThreshold){
			if(game.offsetX + game.canvasWidth + game.panningSpeed <= game.currentMapImage.width){
				game.refreshBackground = true;
				game.offsetX += game.panningSpeed;
			}
		} else if(mouse.y <= game.panningThreshold){
			if(game.offsetY >= game.panningSpeed){
				game.refreshBackground = true;
				game.offsetY -= game.panningSpeed;
			}
		} else if(mouse.y >= game.canvasHeight - game.panningThreshold){
			if(game.offsetY + game.canvasHeight + game.panningSpeed <= game.currentMapImage.height){
				game.refreshBackground = true;
				game.offsetY += game.panningSpeed;
			}
		}

		if(game.refreshBackground){
			mouse.calculateGameCoordinates();
		}
	},
	animationLoop: function(){
		for(var i = game.items.length - 1; i >= 0; i --){
			game.items[i].animate();
		}

		game.sortedItems = $.extend([], game.items);
		game.sortedItems.sort(function(a,b){
			return b.y - a.y + ((b.y == a.y) ? (a.x - b.x) : 0);
		});
	},
	drawingLoop: function(){
		game.handlePanning();

		if(game.refreshBackground){
			game.backgroundContext.drawImage(game.currentMapImage, game.offsetX, game.offsetY,
				game.canvasWidth, game.canvasHeight, 0, 0, game.canvasWidth, game.canvasHeight);
			game.refreshBackground = false;
		}

		game.foregroundContext.clearRect(0,0,game.canvasWidth, game.canvasHeight);

		for(var i = game.sortedItems.length - 1; i >= 0; i --){
			game.sortedItems[i].draw();
		}

		mouse.draw();

		if(game.running){
			requestAnimationFrame(game.drawingLoop);
		}
	}
};

$(function(){
	game.init();
});