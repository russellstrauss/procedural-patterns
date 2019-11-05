module.exports = function() {
	
	var renderer, scene, camera, controls, floor;
	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();
	var wireframeMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: new THREE.Color('black'), opacity: 0.25, transparent: true });
	
	var black = new THREE.Color('black');
	var targetList = [];
	var frameCount = 0;
	var dot, logDot, circleDot;
	var curvePoints = [], logCurve = [], circleCurve = [];
	var boxes = [];
	
	return {
		
		settings: {
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
			self.labelCoordinateAxes();
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
			
			gfx.labelPoint(new THREE.Vector3(-this.settings.floorSize/2 - 5, 0, 0), '-X', black);
			gfx.labelPoint(new THREE.Vector3(this.settings.floorSize/2 + 1.5, 0, 0), '+X', black);
			gfx.labelPoint(new THREE.Vector3(0, 0, -this.settings.floorSize/2 - 2), '-Z', black);
			gfx.labelPoint(new THREE.Vector3(0, 0, this.settings.floorSize/2 + 4.5), '+Z', black);
			
			self.addGeometries();
			//self.vectorInterpolation();
			//self.pointCloud();
			self.box();
			
			var position;
			var animate = function() {

				requestAnimationFrame(animate);
				renderer.render(scene, camera);
				if (controls) controls.update();
				
				let speed = 5;
				position = curvePoints[(frameCount * speed) % curvePoints.length]; // 10 is the speed
				dot.position.set(position.x, position.y, 0);
				position = logCurve[(frameCount * speed) % logCurve.length]; // 10 is the speed
				logDot.position.set(position.x, position.y, 10);
				
				position = circleCurve[(frameCount * speed) % circleCurve.length];
				circleDot.position.set(position.x, (frameCount % 100) / 100 * 10, position.y);
				
				// boxes.forEach(function(box) {
				// 	box.rotation.y += .001;
				// 	box.verticesNeedUpdate = true;
				// });
				
				frameCount++;
			};
			
			animate();
		},
		
		labelCoordinateAxes: function() {
			
			let self = this;
			
		},
		
		vectorInterpolation: function() {
			
			let start = new THREE.Vector3(-30, 0, -10);
			let end = new THREE.Vector3(10, 0, -15);
			
			let startOrigin = new THREE.Vector3(-40, 0, -15);
			let endOrigin = new THREE.Vector3(20, 0, -15);
			
			gfx.showVector(start, startOrigin);
			gfx.showVector(end, endOrigin);
			
			let center = new THREE.Geometry(); // get centroid for camera orientation
			center.vertices.push(startOrigin, endOrigin, gfx.movePoint(startOrigin, start), gfx.movePoint(endOrigin, end));
			center = gfx.getCentroid(center);
			
			controls.target.set(center.x, center.y, center.z);
			gfx.setCameraLocation(camera, gfx.movePoint(center, new THREE.Vector3(0, 50, 0)));
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

			// gfx.showVector(BD, B, new THREE.Color('purple'));
			// gfx.showVector(AC, A, new THREE.Color('purple'));
			
			gfx.labelPoint(A, 'A');
			gfx.labelPoint(B, 'B');
			gfx.labelPoint(C, 'C');
			gfx.labelPoint(D, 'D');
			
			let beta = gfx.getAngleBetweenVectors(BD, BDprime);
			let rotationAxis = BD.clone().cross(BDprime.clone()).normalize();
			let BArotated = gfx.createVector(B, A).applyAxisAngle(rotationAxis, beta).multiplyScalar(BD.length()/BDprime.length());

			
			
			
			let F = gfx.movePoint(B, BArotated);
			gfx.showPoint(F, new  THREE.Color('black'));
			gfx.labelPoint(new THREE.Vector3(F.x, F.y + .1, F.z), 'F', new THREE.Color('black'));
			
			
			
			let FA = gfx.createVector(F, A);
			let FC = gfx.createVector(F, C);
			let AFCnormal = FA.clone().cross(FC).normalize();
			gfx.showVector(FA, F, new THREE.Color('black'));
			gfx.showVector(FC, F, new THREE.Color('black'));
			
			
			
			let totalAngle = gfx.calculateAngle(A, C, F);
			
			let AB = gfx.createVector(A, B);
			let CD = gfx.createVector(C, D);
						
			let steps = 10;
			for (let i = 1; i < steps + 1; i++) {
				
				let currentAngle = (totalAngle / steps) * i;				
				
				let a = gfx.getAngleBetweenVectors(AB, CD);
				let CA2 = a / steps * i;
				
				let m = CD.length() / AB.length();
				let mi = m / steps * i;
				let currentRatio = AB.clone().applyAxisAngle(rotationAxis, CA2).lerpVectors(AB, CD, i/steps);
				let currentLength = AB.length() + ( m / steps ) * (i - 1);
				
				rotationAxis = AFCnormal.clone();
				m = FC.length() / FA.length();
				mi = m / steps * i;
				currentLength = FA.length() + (m / steps) * (i - 1);
				console.log(m);
				let FstepVector = FA.clone().applyAxisAngle(rotationAxis, currentAngle).multiplyScalar(mi);
				//console.log((10 / 2) - i / 2);
				
				let max = steps/2;
				
				//console.log('i: ', i, ' ' + ((i - 1 % max) / max));
				
				
				gfx.showVector(FstepVector, F, black);
				
				let startingPoint = gfx.movePoint(F, FstepVector);
				gfx.showPoint(startingPoint);
				
				
				gfx.showVector(currentRatio, startingPoint);
				
				
				
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
			
			
	
			for (let i = 1; i < (pointCount * curveSteps) + 1; i += curveSteps) {

				circleCurve.push(new THREE.Vector3(5 * Math.cos(i), 5 * Math.sin(i), 0));
			}
			var circleSplineCurve = new THREE.SplineCurve(circleCurve);
			points = circleSplineCurve.getPoints(pointCount);
			geometry = new THREE.BufferGeometry().setFromPoints(points);
			var circleSpline = new THREE.Line(geometry, material);
			//scene.add(circleSpline);
			circleSpline.rotation.x += Math.PI / 2;
			circleDot = dot.clone();
			//scene.add(circleDot);
		},
		
		box: function() {
			
			let steps = 100;
			for (let i = steps; i > 0; i--) {
				
				var geometry = new THREE.BoxGeometry(10, .01, 10);
				geometry.scale(i / 10, 1, i / 10);
				var box = new THREE.Mesh(geometry, wireframeMaterial);
				
				//geometry.rotateX(Math.log(2 * Math.PI / steps * i));
				geometry.rotateY(Math.log(2 * Math.PI / steps * i));
				
				gfx.drawLine(box.geometry.vertices[0], box.geometry.vertices[1], new THREE.Color('black'), .35);
				gfx.drawLine(box.geometry.vertices[3], box.geometry.vertices[4], new THREE.Color('black'), .35);
				gfx.drawLine(box.geometry.vertices[4], box.geometry.vertices[5], new THREE.Color('black'), .35);
				gfx.drawLine(box.geometry.vertices[5], box.geometry.vertices[0], new THREE.Color('black'), .35);
				
				//scene.add(box);
				boxes.push(box);
				box.rotation.y += Math.log(2 * Math.PI / steps * i);
			}
			
		},
		
		pointCloud: function() {
			
			let points = new THREE.Geometry();
			
			let size = 10;
			let spacing = 5;
			for (let i = 0; i < size + 1; i++) {
								
				for (let j = 0; j < size + 1; j++) {
					points.vertices.push(new THREE.Vector3(i * spacing, 0, j * spacing));
				}
			}
			
			//gfx.showPoints(points);
			
			for (let i = 0; i < size + 1; i++) {
												
				for (let j = size; j > 0; j--) {

					if (points.vertices[i * j]) gfx.drawLine(points.vertices[i], points.vertices[i * j]), new THREE.Color('black');
				}
			}
			
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