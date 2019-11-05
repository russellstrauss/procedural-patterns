module.exports = function() {
	
	var renderer, scene, camera, controls, floor;
	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();
	var wireframeMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: new THREE.Color('black'), opacity: 0.25, transparent: true });
	var translucentMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color('#69D2E7'), opacity: 0.01, transparent: true });
	var blackMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color('black') }), whiteMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color('white') });
	var materials = [blackMaterial, whiteMaterial]
	var distinctColors = [new THREE.Color('#e6194b'), new THREE.Color('#3cb44b'), new THREE.Color('#ffe119'), new THREE.Color('#4363d8'), new THREE.Color('#f58231'), new THREE.Color('#911eb4'), new THREE.Color('#46f0f0'), new THREE.Color('#f032e6'), new THREE.Color('#bcf60c'), new THREE.Color('#fabebe'), new THREE.Color('#008080'), new THREE.Color('#e6beff'), new THREE.Color('#9a6324'), new THREE.Color('#fffac8'), new THREE.Color('#800000'), new THREE.Color('#aaffc3'), new THREE.Color('#808000'), new THREE.Color('#ffd8b1'), new THREE.Color('#000075'), new THREE.Color('#808080'), new THREE.Color('#ffffff'), new THREE.Color('#000000')];
	
	var black = new THREE.Color('black');
	var targetList = [];
	var frameCount = 0;
	var dot, logDot, circleDot;
	var curvePoints = [], logCurve = [], circleCurve = [];
	var boxes = [];
	var cameraDirection = 1;
	var curves = false, cameraAnimate = false;
	
	return {
		
		settings: {
			zBufferOffset: 1,
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
			let button = document.querySelector('#curves');
			if (button) button.addEventListener('click', function() {
				curves = true;
				self.begin();
				document.querySelector('#curveControls').style.display = 'block';
			});
			button = document.querySelector('#interpolation');
			if (button) button.addEventListener('click', function() {
				self.begin();
				self.vectorInterpolation();
				document.querySelector('#interpolationControls').style.display = 'block';
			});
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
			floor = gfx.addFloor(this.settings.floorSize, this.settings.colors.worldColor, this.settings.colors.gridColor);
			
			//self.pointCloud();
			
			if (curves) self.addGeometries();
			
			var position;
			var animate = function() {

				requestAnimationFrame(animate);
				renderer.render(scene, camera);
				if (controls) controls.update();
				
				if (curves) {
					
					let speed = 5;
					position = curvePoints[(frameCount * speed) % curvePoints.length]; // 10 is the speed
					dot.position.set(position.x, position.y, 0);
					if (cameraAnimate === 'sin') camera.position.set(position.x, position.y, 0);
					position = logCurve[(frameCount * speed) % logCurve.length]; // 10 is the speed
					logDot.position.set(position.x, position.y, 10);
					if (cameraAnimate === 'log') camera.position.set(position.x, position.y, 10);
					
					position = circleCurve[(frameCount * speed) % circleCurve.length];
					circleDot.position.set(position.x, 0, position.y);
					if (cameraAnimate === 'circle') camera.position.set(position.x, position.y, 10);
				}
				
				frameCount++;
			};
			
			animate();
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
		
		addGeometries: function() {
			
			let self = this;
			
			gfx.setCameraLocation(camera, new THREE.Vector3(0, 30, 30));
			
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
			
	
			for (let i = 1; i < (pointCount * curveSteps) + 1; i += curveSteps) {

				circleCurve.push(new THREE.Vector3(5 * Math.cos(i) - 20, 5 * Math.sin(i), 0));
			}
			var circleSplineCurve = new THREE.SplineCurve(circleCurve);
			points = circleSplineCurve.getPoints(pointCount);
			geometry = new THREE.BufferGeometry().setFromPoints(points);
			var circleSpline = new THREE.Line(geometry, material);
			scene.add(circleSpline);
			circleSpline.rotation.x += Math.PI / 2;
			circleDot = dot.clone();
			scene.add(circleDot);
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
			
			self.hideButtons();
			
			
			document.addEventListener('keyup', function(event) {
				
				let c = 67;
				let s = 83;
				let l = 76;

				
				if (event.keyCode === c) {
					cameraAnimate = 'circle';
				}
				if (event.keyCode === s) {
					cameraAnimate = 'sin';
				}
				if (event.keyCode === l) {
					cameraAnimate = 'log';
				}
			});
			
		},
		
		loadAssets: function() {
			
			let self = this;
			let loader = new THREE.FontLoader();
			let fontPath = '';
			fontPath = 'assets/vendors/js/three.js/examples/fonts/helvetiker_regular.typeface.json';

			loader.load(fontPath, function(font) { // success event
				
				gfx.appSettings.font.fontStyle.font = font;
			},
			function(event) { // in progress event.
			},
			function(event) { // error event
				gfx.appSettings.font.enable = false;
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
		},
		
		hideButtons: function() {
			let buttons = document.querySelectorAll('.modes');
			buttons.forEach(function(button) {
				button.style.display = 'none';
			});
		}
	};
};