'use strict';


//VARIABLE DECLARATIONS

var camera, cameraBox, scene, renderer, arrowImage, finishImage,  pause = true, currentTime = 0, geometry, gndMaterial,  gndMesh, endLight, timeElement, keyEvents = {
	'up': false,
	'down': false,
	'right': false,
	'left' : false
};
var PI2 = 2 * Math.PI,
	movementAmount = 25,
	ctx, scale = 1, maze;
var mazeSize = 11000;    
var lastUpdate = ( new Date() ).getTime();
var	mouseDown = false, mouseDownX;
		
var angle;
var movX, movZ;
var movXRL, movZRL;
var cameraRotationChanged = true;
var movementVec = new THREE.Vector3( 0, 0, 0 );
var movementVecRL = new THREE.Vector3( 0, 0, 0 );


//INITIALIZATION

function createPreview() {
	var canvas = document.querySelector( '#canvas2d' );
	var w = 200, h = 200;
	
	canvas.width = w;
	canvas.height = h;

	scale = w / mazeSize; 	

	ctx = canvas.getContext( '2d' );
	
	ctx.lineJoin= 'bevel' /* You can use 'round', 'bevel', 'miter' */ ;
	ctx.lineCap= 'butt' /* You can use 'butt', 'round', 'square' */ ;
	ctx.lineWidth= 2.0 ;			
}

function createScene(){
	var sceneTemp = new THREE.Scene();

	keyEvents = {
		'up': false,
		'down': false,
		'right': false,
		'left' : false
	   };

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z =  -mazeSize / 2 + 500;
    camera.position.x =  -mazeSize / 2 + 500;
    camera.rotation.y = Math.PI;
    sceneTemp.add( camera );

	var cameraBoxGeo = new THREE.CubeGeometry( 10, 10, 10 );
	var cameraBoxMat = new THREE.MeshBasicMaterial( { wireframe: true, color: 0x0f0 } );

	currentTime = 0;
	cameraBox = new THREE.Mesh( cameraBoxGeo, cameraBoxMat );
	
	//Start						
	var startLight = new THREE.PointLight( 0xFFFFFF, 1, 2500 );
	startLight.position.x = -mazeSize / 2 + 500 ;
	startLight.position.z = -mazeSize / 2 + 500 ;
	startLight.position.y = 600;
	sceneTemp.add(startLight);	

	//End
	endLight = new THREE.PointLight( 0xD52F78, 1, 2500 );
	endLight.position.x = mazeSize / 2 - 500 ;
	endLight.position.z = mazeSize / 2 - 500 ;
	endLight.position.y = 600;
	sceneTemp.add(endLight );
	
	//Sky
    var skygeo = new THREE.CubeGeometry(  mazeSize, 1, mazeSize );
   	var skyTexture = THREE.ImageUtils.loadTexture( "https://raw.githubusercontent.com/ece462maze/ece462maze.github.io/master/sky.jpg" ); //sky
	skyTexture.wrapS = skyTexture.wrapT = THREE.RepeatWrapping;
	var skyMaterial = new THREE.MeshPhongMaterial( { map: skyTexture, color: 0xffffff, ambient: 0xF0EFEF, specular: 0x999999, shininess: 15, shading: THREE.SmoothShading } );
    var skyMesh = new THREE.Mesh( skygeo, skyMaterial );
    sceneTemp.add( skyMesh );
	skyMesh.rotation.x +=  Math.PI;
	skyMesh.position.y += 1003;
	
	
	// Ground
    geometry = new  THREE.CubeGeometry(mazeSize, 1, mazeSize );
   	var gndTexture = THREE.ImageUtils.loadTexture( "https://raw.githubusercontent.com/ece462maze/ece462maze.github.io/master/ground.png" ); //ground
	gndTexture.repeat.set( 50, 50 );
	gndTexture.wrapS = gndTexture.wrapT = THREE.RepeatWrapping;
	gndMaterial = new THREE.MeshPhongMaterial( { map: gndTexture, color: 0xffffff, ambient: 0xF0EFEF, specular: 0x999999, shininess: 15, shading: THREE.SmoothShading } );
    gndMesh = new THREE.Mesh( geometry, gndMaterial );
    sceneTemp.add( gndMesh );

	camera.position.y += 600;
	
	var light = new THREE.AmbientLight( 0xFFFFFF );
	sceneTemp.add( light );

	return sceneTemp;
}

function mazeInit(){

	var maze2DSize = mazeSize / 1000;
	maze = new Maze( maze2DSize, maze2DSize, 1000 );
	maze.paint2D( ctx, scale );
	maze.paint();
}

function init() {
	
	createPreview();
    scene = createScene();
	mazeInit();
    pause = false;
    timeElement = document.querySelector( '#time' );
		        
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.className = 'canvas3d';

    document.body.appendChild(renderer.domElement);
}


//RENDERING

function animate() {
	requestAnimationFrame( animate );
	render();

	if (keyEvents.up || keyEvents.down || keyEvents.right || keyEvents.left) {			
		if (cameraRotationChanged) {
		    angle = Math.PI / 2 + camera.rotation.y;
			
			movX = -movementAmount * Math.cos( angle );
			movZ = movementAmount * Math.sin( angle );
				
			movXRL = -movementAmount * Math.cos( camera.rotation.y ); 
			movZRL = movementAmount * Math.sin( camera.rotation.y );
			
			cameraRotationChanged = false;
		}
		
		var collisions;

		if (keyEvents.up) {
			movementVec.x = -movX;
			movementVec.z = -movZ;
		}

		if (keyEvents.down) {
			movementVec.x = movX;
			movementVec.z = movZ;
		}

		if (keyEvents.left) {
			movementVecRL.x = movXRL;
			movementVecRL.z = movZRL;
		}

		if (keyEvents.right) {
			movementVecRL.x = -movXRL;
			movementVecRL.z = -movZRL;
		}

		collisions = maze.checkIntersections( movementVec, movementVecRL );			
		
		if (keyEvents.up && !collisions.up ) {
			camera.position.x -= movX;
			camera.position.z -= movZ;
		}	

		if (keyEvents.down && !collisions.down ) {
			camera.position.x += movX;
			camera.position.z += movZ;
		}

		if (keyEvents.right && !collisions.right) {
			camera.position.x -= movXRL;
			camera.position.z -= movZRL;
		}

		if (keyEvents.left && !collisions.left) {
			camera.position.x += movXRL;
			camera.position.z += movZRL;
		}
		
		maze.paint2D( ctx, scale );	
	}	

	var endDif = endLight.position.distanceTo( camera.position );

	if (endDif < 300){
		pause = true;
		newGame();
	}

	cameraBox.position.x = camera.position.x;
	cameraBox.position.y = camera.position.y;
	cameraBox.position.z = camera.position.z;

	cameraBox.rotation.x = camera.rotation.x;
	cameraBox.rotation.y = camera.rotation.y;
	cameraBox.rotation.z = camera.rotation.z;
}

function pad (val) { return val > 9 ? val : "0" + val; }
function render() {
	if(!pause) {				
	    renderer.render( scene, camera );
	    var now = ( new Date() ).getTime();
	    if( now - lastUpdate >= 1000 ){
	    	currentTime += 1;
	    	lastUpdate = now;
	    	var date = new Date(1000*currentTime);
			var minutes = pad(date.getMinutes());
			var seconds = pad(date.getSeconds());
	    	timeElement.textContent = minutes + ":" + seconds;
    	}
	}
}

function newGame(){
	cameraRotationChanged = true;
	scene = createScene();
	mazeInit();
	pause = false;
}


//EVENT LISTENERS

window.addEventListener( 'keydown', function(event) {
	var key = event.keyCode || event.which;
		
	if (pause) {
		return;
	}

	switch (key) {
		case 38: 				//up and W
		case 87:
			keyEvents.up = true;
		break;
		
		case 40: 				//down and S
		case 83:
			keyEvents.down = true;
		break;
		
		case 39: 				//right and D
		case 68:
			keyEvents.right = true;
		break;
		
		case 37: 				//left and A
		case 65:
			keyEvents.left = true;
		break;
	}	    	
}, false);

window.addEventListener( 'keyup', function(event) {
	var key = event.keyCode || event.which;
	switch (key) {
		case 38: 				//up and W
		case 87:
			keyEvents.up = false;
		break;
		
		case 40: 				//down and S
		case 83:
			keyEvents.down = false;
		break;
		
		case 39: 				//right and D
		case 68:
			keyEvents.right = false;
		break;
		
		case 37: 				//left and A
		case 65:
			keyEvents.left = false;
		break;

		case 78:				// N key
			newGame();
		break;
	}
}, false);

window.addEventListener( 'mousemove', function(event) {
	if (mouseDown) {	
		var diff = event.pageX - mouseDownX;
		var theta = ( diff * Math.PI * 2 ) / window.innerWidth;

		camera.rotation.y -= theta;
		mouseDownX = event.pageX;
		cameraRotationChanged = true;
		maze.paint2D( ctx, scale );	
	}
}, false);

window.addEventListener( 'mousedown' , function(event) {
	mouseDownX = event.pageX;
	mouseDown = true;
}, false);

window.addEventListener( 'mouseup' , function(event) {	    
	mouseDown = false;
}, false);

window.onload = function() {
	arrowImage = new Image();
	finishImage = new Image();
    arrowImage.src = "resources/arrow.png";
    finishImage.src = "resources/finish.png";
    init();
    animate();
};

//STACK

function Stack(){
	this.els = [];
}

Stack.prototype = {
	push: function(el){
		this.els.push(el);
	},
	
	peek: function(){
		if (this.els.length > 0) {
			return this.els[ this.els.length - 1 ];
		} else{
			return null;
		}
	},
	
	pop: function(){
		var el = this.els[ this.els.length - 1 ];
		this.els = this.els.slice(0, this.els.length - 1);
		return el;
	},
	
	size: function() {
		return this.els.length;
	}
};
	
function Cell(i, j, size) {
	this.i = i;
	this.j = j;
	this.visited = false;
	this.size = size;
	this.east = true;
	this.west = true;
	this.north = true;
	this.south = true;
	this.PI2 = 2 * Math.PI;
	this.mesh = {};
	this.collide = {
		'east': false,
		'west': false,
		'north': false,
		'south': false
	};
}	


//CELL

Cell.prototype = {
	paint: function() {
		var x, y;
		if (this.east) {
			x = this.j * this.size;
			y = this.i * this.size;
			this.drawWall (x + this.size, y, x + this.size, y + this.size, 'east');
		}

		 if (this.west) {
			x = this.j * this.size;
			y = this.i * this.size;
			this.drawWall(x, y, x, y + this.size, 'west');
		}

		if (this.north) {
			x = this.j * this.size;
			y = this.i * this.size;
			this.drawWall(x, y, x + this.size, y, 'north');
		}

		if (this.south) {
			x = this.j * this.size;
			y = this.i * this.size;
			this.drawWall(x, y + this.size, x + this.size, y + this.size, 'south');
		}
	},
		
		
	paint2D: function(g, scale){
		var camX = camera.position.x * scale + 100, 
			camY = camera.position.z * scale + 100,
			angle = -camera.rotation.y - Math.PI / 2,
			amount = 10;

		g.save();
		g.translate(camX, camY);
		g.rotate(angle - Math.PI / 2);
		g.drawImage(arrowImage, -arrowImage.width / 2, -arrowImage.height / 2);
		g.rotate(-angle + Math.PI / 2);
		g.translate(-camX, -camY);	
		g.restore();

		var x, y;

		if (this.east) {
			x = this.j * this.size;
			y = this.i * this.size;
			this.drawWall2D(g, scale,  x + this.size, y, x + this.size, y + this.size, 'east');
		}

		 if (this.west) {
			x = this.j * this.size;
			y = this.i * this.size;
			this.drawWall2D(g, scale, x, y, x, y + this.size, 'west');
		}

		if (this.north) {
			x = this.j * this.size;
			y = this.i * this.size;
			this.drawWall2D(g, scale, x, y, x + this.size, y, 'north');
		}

		if (this.south) {
			x = this.j * this.size;
			y = this.i * this.size;
			this.drawWall2D(g, scale, x, y + this.size, x + this.size, y + this.size, 'south');
		}
				
		var endX = endLight.position.x * scale + 100, 
			endY = endLight.position.z * scale + 100;		

		g.save();
		g.translate(endX, endY);
		g.drawImage(finishImage, -finishImage.width / 2, -finishImage.height / 2);
		g.translate(-endX, -endY);	
		g.restore();
	},
	
	
	drawWall: function(x, y, x2, y2, dir){					
		var w = this.size;
		var angle = Math.atan2(y2 - y, x2 - x);
		var imgTexture = THREE.ImageUtils.loadTexture("https://raw.githubusercontent.com/ece462maze/ece462maze.github.io/master/hedge.jpg"); 
		imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping;
		
		var wallH = 1024;	
		var wallGeo = new THREE.CubeGeometry(w, wallH, 400);
		var wallMaterial = new THREE.MeshPhongMaterial({ map: imgTexture, color: 0x222222, ambient: 0xFFFFFF, specular: 0x999999, shininess: 15, perPixel: true, shading: THREE.SmoothShading });
        var wallMesh = new THREE.Mesh(wallGeo, wallMaterial);
		
		wallMesh.rotation.y = -angle;
		wallMesh.position.x = x - Math.abs(w / 2  * Math.sin(angle))  - mazeSize / 2 + w / 2 ;
		wallMesh.position.z = y - Math.abs(w / 2 * Math.cos(angle)) - mazeSize / 2  + w / 2;
		wallMesh.position.y += wallH / 2;	
		
		this.mesh[ dir ] = wallMesh;
        scene.add(wallMesh);		
	},
	
	getDistance: function(x1, y1, x2, y2, x3, y3){
		var p2p1D = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
		var u = ((x3 - x1) * (x2 - x1) + (y3 - y1) * (y2 - y1)) / p2p1D;
		
		var x = x1 + u * (x2 - x1), 
			y = y1 + u * (y2 - y1);
		
		if (u < 0) {
			x = x1;
			y = y1;
		} else if (u > 1) {
			x = x2;
			y = y2;
		}
		
		var distance = Math.sqrt(Math.pow(x3 - x, 2) + Math.pow(y3 - y, 2));
		return distance;
	},
	
	drawWall2D: function(g, scale, x, y, x2, y2, direction){				
		var xp1 = x * scale,
			yp1 = y * scale,
			xp2 = x2 * scale,
			yp2 = y2 * scale;
					
		g.beginPath();
		g.moveTo(xp1, yp1);
		g.lineTo(xp2, yp2);
		g.strokeStyle = '#00BC38';			
		g.stroke();
		g.closePath();	
	}	
};


//MAZE

function Maze(w, h, size) {
	this.cells = [];
	this.w = w;
	this.h = h;
	this.size = size;
	this.init();
	this.makeMaze();
}
	
Maze.prototype = {
	init: function(){
		var i = 0, j = 0;
		for (; i < this.h; i += 1) {
				this.cells.push([]);
			for (j = 0; j < this.w; j += 1) {
				this.cells[i][j] = new Cell(i, j, this.size);
			}
		}
	},
	
	paint: function() {
		var i = 0, j = 0;
		for (; i < this.h; i += 1){
			for (j = 0; j < this.w; j += 1) {
				this.cells[i][j].paint();
			}
		}
	},
	
	paint2D: function(g, scale ) {
		g.clearRect(0, 0, 200, 200);
		var i = 0, j = 0;
		for (; i < this.h; i += 1) {
			for (j = 0; j < this.w; j += 1) {
				this.cells[i][j].paint2D(g, scale);
			}
		}			
	},
	
	collide: function(box1, box2) {
		var wMargin = 150;

		var cXmax = box1.max.x,  
			cXmin = box1.min.x,
			cYmax = box1.max.y, 
			cYmin = box1.min.y,
			cZmax = box1.max.z,
			cZmin = box1.min.z;

		var wXmax = box2.max.x + wMargin,  
				wXmin = box2.min.x - wMargin,
				wYmax = box2.max.y, 
				wYmin = box2.min.y,
				wZmax = box2.max.z + wMargin,
				wZmin = box2.min.z - wMargin;

		var xB = wXmin < cXmax && wXmax > cXmin,
			yB = wYmin < cYmax && wYmax > cYmin,
			zB = wZmin < cZmax && wZmax > cZmin; 

		return xB && yB && zB;
	},

	checkIntersections: function(movementUD, movementRL) {
		var angle = camera.rotation.y;
		var i = 0, j = 0;

		var collision = {
			'right': false,
			'left': false,
			'up': false,
			'down': false
		};

		cameraBox.geometry.computeBoundingBox();

		var cbox = cameraBox.geometry.boundingBox;
		
		cbox.max.addSelf(cameraBox.position);
		cbox.min.addSelf(cameraBox.position);
		cbox.max.addSelf(movementUD);
		cbox.min.addSelf(movementUD);

		cameraBox.geometry.boundingBox = false;
		cameraBox.geometry.computeBoundingBox();

		var cboxRL = cameraBox.geometry.boundingBox;
		
		cboxRL.max.addSelf(cameraBox.position);
		cboxRL.min.addSelf(cameraBox.position);

		cboxRL.max.addSelf(movementRL);
		cboxRL.min.addSelf(movementRL);	
		
		for (; i < this.h; i += 1) {
			for (j = 0; j < this.w; j += 1) {
				var walls = this.cells[i][j].mesh;
				for (var dir in  walls) {
					if (walls.hasOwnProperty(dir)) {
						var wall = walls[ dir ];
						wall.geometry.computeBoundingBox();

						var angle = wall.rotation.y;
						var box = wall.geometry.boundingBox;

						if (wall.rotation.y !== 0) {
							var temp = box.max.z;
							box.max.z = box.max.x;
							box.max.x = temp;

					   		temp = box.min.z;
							box.min.z = box.min.x;
							box.min.x = temp;
						}

						box.max.addSelf(wall.position);
						box.min.addSelf(wall.position);
				
						if(this.collide(cbox, box)) {
							collision.up = true;
							collision.down = true;
						}

						if (this.collide(cboxRL, box)) {
							collision.left = true;
							collision.right = true;
						}
					}
				} 	
			}
		}
		return collision;
	},
	
	makeMaze: function() {
		var stack = new Stack();
		var total = this.w * this.h;
		var currentI =  ~~(Math.random() * this.h);
		var currentJ =	~~(Math.random() * this.w);
		var visited = 1;	
		var nC = 0;
		
		while (visited < total) {
			nC = this.getUnvisitedNeighborCount(currentI, currentJ);

			if (nC >= 1) {	
				var neighbors = this.getUnvisitedNeighbors(currentI, currentJ);
				var selected = neighbors[ ~~(Math.random() * neighbors.length) ];
				
				this.removeWallBetween(currentI, currentJ, selected);
				stack.push(this.cells[ currentI ][ currentJ ]);
				this.cells[ currentI ][ currentJ ].visited = true;
				selected.visited = true;
				
				currentI = selected.i;
				currentJ = selected.j;
				
				visited += 1;
			} else {
				var el = stack.pop();
				currentI = el.i;
				currentJ = el.j;
			}
		}
	},
	
	removeWallBetween: function(i, j ,neighbor) {

		if (i > 0){
			if (this.cells[ i - 1 ][ j ] === neighbor) {
				this.cells[ i ][ j ].north = false;
				neighbor.south = false;
			}
		}
		
		if (i < this.h - 1){
			if (this.cells[ i + 1 ][ j ]  === neighbor) {
				this.cells[ i ][ j ].south = false;
				neighbor.north = false;
			}
		}
		
		if (j > 0) {
			if (this.cells[ i ][ j - 1 ] === neighbor) {
				this.cells[ i ][ j ].west = false;
				neighbor.east = false;
			}
		}
		
		if (j < this.w - 1) {
			if (this.cells[ i ][ j + 1 ] === neighbor) {
				this.cells[ i ][ j ].east = false;
				neighbor.west = false;
			}
		}
	},
	
	getUnvisitedNeighborCount: function(i, j) {
		var c = 0;
		
		if (i > 0) {
			if (!this.cells[ i - 1 ][ j ].visited) {
				c += 1;
			}
		}
		
		if (i < this.h - 1) {
			if (!this.cells[ i + 1 ][ j ].visited) {
				c += 1;
			}
		}
		
		if (j > 0) {
			if (!this.cells[ i ][ j - 1 ].visited) {
				c += 1;
			}
		}
		
		if (j < this.w - 1) {
			if (!this.cells[ i ][ j + 1 ].visited) {
				c += 1;
			}
		}
		return c;		
	},
	
	
	getUnvisitedNeighbors: function(i, j) {
		var neighbors = [];
		
		if (i > 0) {
			if (!this.cells[ i - 1 ][ j ].visited) {
				neighbors.push(this.cells[ i - 1 ][ j ]);
			}
		}
		
		if (i < this.h - 1) {
			if (!this.cells[ i + 1 ][ j ].visited) {
				neighbors.push(this.cells[ i + 1 ][ j ]);
			}
		}
		
		if (j > 0) {
			if (!this.cells[ i ][ j - 1 ].visited) {
				neighbors.push(this.cells[ i ][ j - 1 ]);
			}
		}
		
		if (j < this.w - 1) {
			if (!this.cells[ i ][ j + 1 ].visited) {
				neighbors.push(this.cells[ i ][ j + 1 ]);
			}
		}
		
		return neighbors;		
	}
};
