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
			
			let start = new THREE.Vector3(0, 0, -10);
			let end = new THREE.Vector3(2, 0, -3);
			
			let startOrigin = new THREE.Vector3(10, 0, -15);
			let endOrigin = new THREE.Vector3(20, 0, -15);
			
			gfx.showVector(start, startOrigin);
			gfx.showVector(end, endOrigin);
			
			let center = new THREE.Geometry(); // get centroid for camera orientation
			center.vertices.push(startOrigin, endOrigin, gfx.movePoint(startOrigin, start), gfx.movePoint(endOrigin, end));
			center = gfx.getCentroid(center);
			
			controls.target.set(center.x, center.y, center.z);
			let newCameraPos = gfx.movePoint(center, new THREE.Vector3(0, 5, 0));
			camera.position.set(newCameraPos.x, newCameraPos.y, newCameraPos.z);
			controls.update();
			
			
			
			let A = startOrigin;
			let B = gfx.movePoint(startOrigin, start);
			let C = endOrigin;
			let D = gfx.movePoint(endOrigin, end);
			let BD = gfx.createVector(B, D);
			let AC = gfx.createVector(A, C);
			let Dprime = gfx.movePoint(startOrigin, gfx.createVector(endOrigin, gfx.movePoint(endOrigin, end)));
			let BDprime = gfx.createVector(B, Dprime);
			let ADprime = gfx.createVector(endOrigin, gfx.movePoint(endOrigin, end));
			
			gfx.showVector(ADprime, A, 0x00ff00);
			gfx.showVector(BDprime, B, 0x00ff00);
			gfx.showVector(BD, B, new THREE.Color('purple'));
			gfx.showVector(AC, A, new THREE.Color('purple'));
			
			gfx.labelPoint(A, 'A');
			gfx.labelPoint(B, 'B');
			gfx.labelPoint(C, 'C');
			gfx.labelPoint(D, 'D');
			gfx.labelPoint(Dprime, 'D\'', 0x00ff00);
			
			let beta = gfx.getAngleBetweenVectors(BD, BDprime);
			let rotationAxis = BD.clone().cross(BDprime.clone()).normalize();
			let BArotated = gfx.createVector(B, A).applyAxisAngle(rotationAxis, beta).setLength(BD.length()/BDprime.length());

			
			
			
			
			
			gfx.showVector(BArotated, B, new THREE.Color('orange'));
			
			let F = gfx.movePoint(B, BArotated);
			gfx.showPoint(F, new  THREE.Color('black'));
			gfx.labelPoint(new THREE.Vector3(F.x, F.y + .1, F.z), 'F', new THREE.Color('black'));
			
			let totalAngle = gfx.calculateAngle(A, F, C);
			
			gfx.showVector(gfx.createVector(F, A), F, new THREE.Color('black'));
			gfx.showVector(gfx.createVector(F, C), F, new THREE.Color('black'));
			
			
			
			
			
			
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
			//scene.add(dot);
			
			var splineObject = new THREE.Line(geometry, material);
			//scene.add(splineObject);

			//dot.position.set(curve.getPoint(.5).x, splineObject.position.y, splineObject.position.z);
			
			
			for (let i = 1; i < (pointCount * curveSteps) + 1; i += curveSteps) {

				logCurve.push(new THREE.Vector3(i, 2 * Math.log(i), 0));
			}
			var logSplineCurve = new THREE.SplineCurve(logCurve);
			points = logSplineCurve.getPoints(pointCount);
			geometry = new THREE.BufferGeometry().setFromPoints( points );
			var logSpline = new THREE.Line(geometry, material);
			//scene.add(logSpline);
			logSpline.translateOnAxis(new THREE.Vector3(0, 0, 1), 10);
			logDot = dot.clone();
			//scene.add(logDot);
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