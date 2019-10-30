module.exports = function() {
	
	var renderer, scene, camera, controls, floor;
	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();
	var wireframeMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: new THREE.Color('black'), opacity: 0.25, transparent: true });
	
	var black = new THREE.Color('black');
	var targetList = [];
	var frameCount = 0;
	var dot, logDot;
	var curvePoints = [], logCurve = [];
	
	return {
		
		settings: {
			defaultCameraLocation: {
				x: 20,
				y: 20,
				z: -30
			},
			zBufferOffset: 0.01,
			colors: {
				worldColor: new THREE.Color('white'),
				gridColor: black,
				arrowColor: black
			},
			floorSize: 100
		},
		
		init: function() {

			let self = this;
			self.loadAssets();
		},
		
		begin: function() {
			
			let self = this;
			
			scene = gfx.setUpScene();
			renderer = gfx.setUpRenderer(renderer);
			camera = gfx.setUpCamera(camera);
			controls = gfx.enableControls(controls, renderer, camera);
			gfx.resizeRendererOnWindowResize(renderer, camera);
			self.bindUIEvents();
			gfx.setUpLights();
			gfx.setCameraLocation(camera, self.settings.defaultCameraLocation);
			
			self.addGeometries();
			self.vectorInterpolation();
			
			var position;
			var animate = function() {

				requestAnimationFrame(animate);
				renderer.render(scene, camera);
				if (controls) controls.update();
				
				let speed = 10;
				
				position = curvePoints[(frameCount * speed) % curvePoints.length]; // 10 is the speed
				dot.position.set(position.x, position.y, 0);
				//camera.position.set(position.x, position.y, 0); // must disable controls for it to work
				
				position = logCurve[(frameCount * speed) % logCurve.length]; // 10 is the speed
				logDot.position.set(position.x, position.y, 10);
				
				frameCount++;
			};
			
			animate();
		},
		
		vectorInterpolation: function() {
			
			let start = new THREE.Vector3(5, 1, 5);
			let end = new THREE.Vector3(10, 1, 5);
			
			let startOrigin = new THREE.Vector3(10, 0, -15);
			let endOrigin = new THREE.Vector3(20, 0, -15);
			
			gfx.showVector(start, startOrigin);
			gfx.showVector(end, endOrigin);
			
			let steps = 10;
			for (let i = 0; i < steps; i++) {
				
				//let interpolant = gfx.createVector()
			}
		},
		
		createCurve: function() {
			
		},
		
		addGeometries: function() {
			
			let self = this;
			
			floor = gfx.addFloor(this.settings.floorSize, this.settings.colors.worldColor, this.settings.colors.gridColor);
			
			var texture = new THREE.TextureLoader().load( 'assets/img/flower.jpg' );
			texture.minFilter = THREE.LinearFilter;
			var material = new THREE.MeshBasicMaterial( { map: texture } );
			
			var geometry = new THREE.BoxGeometry(10, .01, 10);
			var cube = new THREE.Mesh(geometry, material);
			//scene.add(cube);
			
			
			
			let curveSteps = .01;
			let pointCount = 2000;
			let height = 4;
			for (let i = 0; i < (pointCount * curveSteps); i += curveSteps) {
				curvePoints.push(new THREE.Vector3(i, height + height * Math.sin(i), 0));
			}
			
			var curve = new THREE.SplineCurve(curvePoints);
			var points = curve.getPoints(pointCount);
			geometry = new THREE.BufferGeometry().setFromPoints( points );
			material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
			
			let dotGeometry = new THREE.Geometry();
			dotGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
			let dotMaterial = new THREE.PointsMaterial({ 
				size: 10,
				sizeAttenuation: false,
				color: 0x00ff00,
				opacity: 1,
				transparent: true
			});
			dot = new THREE.Points(dotGeometry, dotMaterial);
			scene.add(dot);
			
			var splineObject = new THREE.Line(geometry, material);
			scene.add(splineObject);

			//dot.position.set(curve.getPoint(.5).x, splineObject.position.y, splineObject.position.z);
			
			
			for (let i = 1; i < (pointCount * curveSteps) + 1; i += curveSteps) {

				logCurve.push(new THREE.Vector3(i, 2 * Math.log(i), 0));
			}
			var logSplineCurve = new THREE.SplineCurve(logCurve);
			points = logSplineCurve.getPoints(pointCount);
			geometry = new THREE.BufferGeometry().setFromPoints( points );
			var logSpline = new THREE.Line(geometry, material);
			scene.add(logSpline);
			logSpline.translateOnAxis(new THREE.Vector3(0, 0, 1), 10);
			logDot = dot.clone();
			scene.add(logDot);
			logDot.position.set(logSplineCurve.getPoint(.5).x, logSpline.position.y, logSpline.position.z);
			
			// Affine transformations
			// let start =  new THREE.Geometry();
			// start.vertices.push(
			// 	new THREE.Vector3(0, 0, 0),
			// 	new THREE.Vector3(2, 0, -5),
			// 	new THREE.Vector3(2, 0, -10),
			// 	new THREE.Vector3(0, 0, -15)
			// );
			
			// //gfx.showPoints(start);
			
			// let end =  new THREE.Geometry();
			// end.vertices.push(
			// 	new THREE.Vector3(-30, 0, 0),
			// 	new THREE.Vector3(-20, 0, -5),
			// 	new THREE.Vector3(-15, 0, -10),
			// 	new THREE.Vector3(-30, 0, -15)
			// );
			
			// let steps = 10;
			// let interpolations = [];
			
			// start.vertices.forEach(function(item, index) {
				
			// 	let whole = gfx.createVector(start.vertices[index], end.vertices[index]);
				
			// 	for (let i = 0; i < steps; i++) {
					
			// 		// multiply whole by linear interpolation
			// 		let interpolation = whole.length() * (i/steps);
			// 		let result = gfx.movePoint(item, whole.clone().setLength(interpolation));
			// 		//gfx.showPoint(result);
			// 	}
				
			// });
			
			
			
			
			//gfx.showPoints(end);
		},

		enableControls: function() {
			controls = new THREE.OrbitControls(camera, renderer.domElement);
			controls.target.set(0, 0, 0);
			controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
			controls.dampingFactor = 0.05;
			controls.zoomSpeed = 6;
			controls.enablePan = !utils.mobile();
			controls.minDistance = 0;
			controls.maxDistance = 200;
			controls.maxPolarAngle = Math.PI / 2;
		},
		
		bindUIEvents: function() {
			
			let self = this;
			let message = document.getElementById('message');
			
			let onMouseMove = function(event) {
				mouse.x = ( (event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width ) * 2 - 1;
				mouse.y = -( (event.clientY - renderer.domElement.offsetTop) / renderer.domElement.height ) * 2 + 1;
			};
			
			window.addEventListener('mousemove', onMouseMove, false);
			
			document.querySelector('canvas').addEventListener('click', function(event) {
				
				self.intersects(event);
			});
		},
		
		intersects: function(event) {
			
			let self = this;
			raycaster.setFromCamera(mouse, camera);
			var intersects = raycaster.intersectObjects(targetList);
			
			if (intersects.length > 0) {
				
				let faceIndex = intersects[0].faceIndex;
				self.setUpFaceClicks(faceIndex);
			}
		},
		
		loadAssets: function() {
			
			let self = this;
			let loader = new THREE.FontLoader();
			let fontPath = '';
			fontPath = 'assets/vendors/js/three.js/examples/fonts/helvetiker_regular.typeface.json';

			loader.load(fontPath, function(font) { // success event
				
				gfx.appSettings.font.fontStyle.font = font;
				self.begin();
			},
			function(event) { // in progress event.
			},
			function(event) { // error event
				gfx.appSettings.font.enable = false;
				self.begin();
			});
		},
		
		resizeRendererOnWindowResize: function() {

			window.addEventListener('resize', utils.debounce(function() {
				
				if (renderer) {
	
					camera.aspect = window.innerWidth / window.innerHeight;
					camera.updateProjectionMatrix();
					renderer.setSize(window.innerWidth, window.innerHeight);
				}
			}, 250));
		}
	};
};