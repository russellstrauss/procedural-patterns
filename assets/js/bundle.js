(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

module.exports = function () {
  var renderer, scene, camera, controls, floor;
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  var wireframeMaterial = new THREE.MeshBasicMaterial({
    wireframe: true,
    color: new THREE.Color('black'),
    opacity: 0.25,
    transparent: true
  });
  var translucentMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#69D2E7'),
    opacity: 0.01,
    transparent: true
  });
  var blackMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('black')
  }),
      whiteMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('white')
  });
  var materials = [blackMaterial, whiteMaterial];
  var distinctColors = [new THREE.Color('#e6194b'), new THREE.Color('#3cb44b'), new THREE.Color('#ffe119'), new THREE.Color('#4363d8'), new THREE.Color('#f58231'), new THREE.Color('#911eb4'), new THREE.Color('#46f0f0'), new THREE.Color('#f032e6'), new THREE.Color('#bcf60c'), new THREE.Color('#fabebe'), new THREE.Color('#008080'), new THREE.Color('#e6beff'), new THREE.Color('#9a6324'), new THREE.Color('#fffac8'), new THREE.Color('#800000'), new THREE.Color('#aaffc3'), new THREE.Color('#808000'), new THREE.Color('#ffd8b1'), new THREE.Color('#000075'), new THREE.Color('#808080'), new THREE.Color('#ffffff'), new THREE.Color('#000000')];
  var black = new THREE.Color('black');
  var targetList = [];
  var frameCount = 0;
  var dot, logDot, circleDot;
  var curvePoints = [],
      logCurve = [],
      circleCurve = [];
  var boxes = [];
  var cameraDirection = 1;
  var curves = false,
      cameraAnimate = false;
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
    init: function init() {
      var self = this;
      self.loadAssets();
      var button = document.querySelector('#curves');
      if (button) button.addEventListener('click', function () {
        curves = true;
        self.begin();
        document.querySelector('#curveControls').style.display = 'block';
      });
      button = document.querySelector('#interpolation');
      if (button) button.addEventListener('click', function () {
        self.begin();
        self.vectorInterpolation();
        document.querySelector('#interpolationControls').style.display = 'block';
      });
    },
    begin: function begin() {
      var self = this;
      scene = gfx.setUpScene();
      renderer = gfx.setUpRenderer(renderer);
      camera = gfx.setUpCamera(camera);
      controls = gfx.enableControls(controls, renderer, camera);
      gfx.resizeRendererOnWindowResize(renderer, camera);
      self.bindUIEvents();
      gfx.setUpLights();
      floor = gfx.addFloor(this.settings.floorSize, this.settings.colors.worldColor, this.settings.colors.gridColor); //self.pointCloud();

      if (curves) self.addGeometries();
      var position;

      var animate = function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        if (controls) controls.update();

        if (curves) {
          var speed = 5;
          position = curvePoints[frameCount * speed % curvePoints.length]; // 10 is the speed

          dot.position.set(position.x, position.y, 0);
          if (cameraAnimate === 'sin') camera.position.set(position.x, position.y, 0);
          position = logCurve[frameCount * speed % logCurve.length]; // 10 is the speed

          logDot.position.set(position.x, position.y, 10);
          if (cameraAnimate === 'log') camera.position.set(position.x, position.y, 10);
          position = circleCurve[frameCount * speed % circleCurve.length];
          circleDot.position.set(position.x, 0, position.y);
          if (cameraAnimate === 'circle') camera.position.set(position.x, position.y, 10);
        }

        frameCount++;
      };

      animate();
    },
    vectorInterpolation: function vectorInterpolation() {
      var start = new THREE.Vector3(-30, 0, -10);
      var end = new THREE.Vector3(10, 0, -15);
      var startOrigin = new THREE.Vector3(-40, 0, -15);
      var endOrigin = new THREE.Vector3(20, 0, -15);
      gfx.showVector(start, startOrigin);
      gfx.showVector(end, endOrigin);
      var center = new THREE.Geometry(); // get centroid for camera orientation

      center.vertices.push(startOrigin, endOrigin, gfx.movePoint(startOrigin, start), gfx.movePoint(endOrigin, end));
      center = gfx.getCentroid(center);
      controls.target.set(center.x, center.y, center.z);
      gfx.setCameraLocation(camera, gfx.movePoint(center, new THREE.Vector3(0, 50, 0)));
      controls.update();
      var A = startOrigin;
      var B = gfx.movePoint(startOrigin, start);
      var C = endOrigin;
      var D = gfx.movePoint(endOrigin, end);
      var BD = gfx.createVector(B, D);
      var AC = gfx.createVector(A, C);
      var Dprime = gfx.movePoint(startOrigin, gfx.createVector(endOrigin, gfx.movePoint(endOrigin, end)));
      var BDprime = gfx.createVector(B, Dprime);
      var ADprime = gfx.createVector(endOrigin, gfx.movePoint(endOrigin, end)); // gfx.showVector(BD, B, new THREE.Color('purple'));
      // gfx.showVector(AC, A, new THREE.Color('purple'));

      gfx.labelPoint(A, 'A');
      gfx.labelPoint(B, 'B');
      gfx.labelPoint(C, 'C');
      gfx.labelPoint(D, 'D');
      var beta = gfx.getAngleBetweenVectors(BD, BDprime);
      var rotationAxis = BD.clone().cross(BDprime.clone()).normalize();
      var BArotated = gfx.createVector(B, A).applyAxisAngle(rotationAxis, beta).multiplyScalar(BD.length() / BDprime.length());
      var F = gfx.movePoint(B, BArotated);
      gfx.showPoint(F, new THREE.Color('black'));
      gfx.labelPoint(new THREE.Vector3(F.x, F.y + .1, F.z), 'F', new THREE.Color('black'));
      var FA = gfx.createVector(F, A);
      var FC = gfx.createVector(F, C);
      var AFCnormal = FA.clone().cross(FC).normalize();
      gfx.showVector(FA, F, new THREE.Color('black'));
      gfx.showVector(FC, F, new THREE.Color('black'));
      var totalAngle = gfx.calculateAngle(A, C, F);
      var AB = gfx.createVector(A, B);
      var CD = gfx.createVector(C, D);
      var steps = 10;

      for (var i = 1; i < steps + 1; i++) {
        var currentAngle = totalAngle / steps * i;
        var a = gfx.getAngleBetweenVectors(AB, CD);
        var CA2 = a / steps * i;
        var m = CD.length() / AB.length();
        var mi = m / steps * i;
        var currentRatio = AB.clone().applyAxisAngle(rotationAxis, CA2).lerpVectors(AB, CD, i / steps);
        var currentLength = AB.length() + m / steps * (i - 1);
        rotationAxis = AFCnormal.clone();
        m = FC.length() / FA.length();
        mi = m / steps * i;
        currentLength = FA.length() + m / steps * (i - 1);
        console.log(m);
        var FstepVector = FA.clone().applyAxisAngle(rotationAxis, currentAngle).multiplyScalar(mi); //console.log((10 / 2) - i / 2);

        var max = steps / 2; //console.log('i: ', i, ' ' + ((i - 1 % max) / max));

        gfx.showVector(FstepVector, F, black);
        var startingPoint = gfx.movePoint(F, FstepVector);
        gfx.showPoint(startingPoint);
        gfx.showVector(currentRatio, startingPoint);
      }
    },
    addGeometries: function addGeometries() {
      var self = this;
      gfx.setCameraLocation(camera, new THREE.Vector3(0, 30, 30));
      var texture = new THREE.TextureLoader().load('assets/img/flower.jpg');
      texture.minFilter = THREE.LinearFilter;
      var material = new THREE.MeshBasicMaterial({
        map: texture
      });
      var geometry = new THREE.BoxGeometry(10, .01, 10);
      var cube = new THREE.Mesh(geometry, material); //scene.add(cube);

      var curveSteps = .01;
      var pointCount = 2000;
      var height = 4;

      for (var i = 0; i < pointCount * curveSteps; i += curveSteps) {
        curvePoints.push(new THREE.Vector3(i, height + height * Math.sin(i), 0));
      }

      var curve = new THREE.SplineCurve(curvePoints);
      var points = curve.getPoints(pointCount);
      geometry = new THREE.BufferGeometry().setFromPoints(points);
      material = new THREE.LineBasicMaterial({
        color: 0xff0000
      });
      var dotGeometry = new THREE.Geometry();
      dotGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
      var dotMaterial = new THREE.PointsMaterial({
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

      for (var _i = 1; _i < pointCount * curveSteps + 1; _i += curveSteps) {
        logCurve.push(new THREE.Vector3(_i, 2 * Math.log(_i), 0));
      }

      var logSplineCurve = new THREE.SplineCurve(logCurve);
      points = logSplineCurve.getPoints(pointCount);
      geometry = new THREE.BufferGeometry().setFromPoints(points);
      var logSpline = new THREE.Line(geometry, material);
      scene.add(logSpline);
      logSpline.translateOnAxis(new THREE.Vector3(0, 0, 1), 10);
      logDot = dot.clone();
      scene.add(logDot);

      for (var _i2 = 1; _i2 < pointCount * curveSteps + 1; _i2 += curveSteps) {
        circleCurve.push(new THREE.Vector3(5 * Math.cos(_i2) - 20, 5 * Math.sin(_i2), 0));
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
    pointCloud: function pointCloud() {
      var points = new THREE.Geometry();
      var size = 10;
      var spacing = 5;

      for (var i = 0; i < size + 1; i++) {
        for (var j = 0; j < size + 1; j++) {
          points.vertices.push(new THREE.Vector3(i * spacing, 0, j * spacing));
        }
      } //gfx.showPoints(points);


      for (var _i3 = 0; _i3 < size + 1; _i3++) {
        for (var _j = size; _j > 0; _j--) {
          if (points.vertices[_i3 * _j]) gfx.drawLine(points.vertices[_i3], points.vertices[_i3 * _j]), new THREE.Color('black');
        }
      }
    },
    bindUIEvents: function bindUIEvents() {
      var self = this;
      var message = document.getElementById('message');

      var onMouseMove = function onMouseMove(event) {
        mouse.x = (event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width * 2 - 1;
        mouse.y = -((event.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1;
      };

      window.addEventListener('mousemove', onMouseMove, false);
      document.querySelector('canvas').addEventListener('click', function (event) {
        self.intersects(event);
      });
      self.hideButtons();
      document.addEventListener('keyup', function (event) {
        var c = 67;
        var s = 83;
        var l = 76;

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
    loadAssets: function loadAssets() {
      var self = this;
      var loader = new THREE.FontLoader();
      var fontPath = '';
      fontPath = 'assets/vendors/js/three.js/examples/fonts/helvetiker_regular.typeface.json';
      loader.load(fontPath, function (font) {
        // success event
        gfx.appSettings.font.fontStyle.font = font;
      }, function (event) {// in progress event.
      }, function (event) {
        // error event
        gfx.appSettings.font.enable = false;
      });
    },
    resizeRendererOnWindowResize: function resizeRendererOnWindowResize() {
      window.addEventListener('resize', utils.debounce(function () {
        if (renderer) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
      }, 250));
    },
    hideButtons: function hideButtons() {
      var buttons = document.querySelectorAll('.modes');
      buttons.forEach(function (button) {
        button.style.display = 'none';
      });
    }
  };
};

},{}],2:[function(require,module,exports){
"use strict";

module.exports = function () {
  var renderer, scene, camera, controls, floor;
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  var wireframeMaterial = new THREE.MeshBasicMaterial({
    wireframe: true,
    color: new THREE.Color('black'),
    opacity: 0.25,
    transparent: true
  });
  var translucentMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#69D2E7'),
    opacity: 0.01,
    transparent: true
  });
  var blackMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('black')
  }),
      whiteMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('white')
  });
  var materials = [blackMaterial, whiteMaterial];
  var distinctColors = [new THREE.Color('#e6194b'), new THREE.Color('#3cb44b'), new THREE.Color('#ffe119'), new THREE.Color('#4363d8'), new THREE.Color('#f58231'), new THREE.Color('#911eb4'), new THREE.Color('#46f0f0'), new THREE.Color('#f032e6'), new THREE.Color('#bcf60c'), new THREE.Color('#fabebe'), new THREE.Color('#008080'), new THREE.Color('#e6beff'), new THREE.Color('#9a6324'), new THREE.Color('#fffac8'), new THREE.Color('#800000'), new THREE.Color('#aaffc3'), new THREE.Color('#808000'), new THREE.Color('#ffd8b1'), new THREE.Color('#000075'), new THREE.Color('#808080'), new THREE.Color('#ffffff'), new THREE.Color('#000000')];
  var black = new THREE.Color('black');
  var targetList = [];
  var frameCount = 0;
  var dot, logDot, circleDot;
  var curvePoints = [],
      logCurve = [],
      circleCurve = [];
  var boxes = [];
  var cameraDirection = 1;
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
    init: function init() {
      var self = this;
      self.loadAssets();
      var button = document.querySelector('#pattern');
      if (button) button.addEventListener('click', function () {
        self.begin();
      });
    },
    begin: function begin() {
      var self = this;
      scene = gfx.setUpScene();
      renderer = gfx.setUpRenderer(renderer);
      camera = gfx.setUpCamera(camera);
      controls = gfx.enableControls(controls, renderer, camera);
      gfx.resizeRendererOnWindowResize(renderer, camera);
      self.bindUIEvents();
      gfx.setUpLights();
      self.addGeometries(); //self.vectorInterpolation();
      //self.pointCloud();

      self.box();
      var position;

      var animate = function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera); //if (controls) controls.update();

        var speed = 5;
        position = curvePoints[frameCount * speed % curvePoints.length]; // 10 is the speed

        dot.position.set(position.x, position.y, 0);
        position = logCurve[frameCount * speed % logCurve.length]; // 10 is the speed

        logDot.position.set(position.x, position.y, 10);
        position = circleCurve[frameCount * speed % circleCurve.length];
        circleDot.position.set(position.x, frameCount % 100 / 100 * 10, position.y); // boxes.forEach(function(box) {
        // 	box.rotation.y += .001;
        // 	box.verticesNeedUpdate = true;
        // });

        camera.translateOnAxis(new THREE.Vector3(0, 0, 1), .4 * cameraDirection);
        camera.rotateOnAxis(new THREE.Vector3(0, 0, 1), .02);
        console.log(camera.position.z);
        if (camera.position.z > 0.0010197999984740977 || camera.position.z < 0) cameraDirection *= -1;
        frameCount++;
      };

      animate();
    },
    vectorInterpolation: function vectorInterpolation() {
      var start = new THREE.Vector3(-30, 0, -10);
      var end = new THREE.Vector3(10, 0, -15);
      var startOrigin = new THREE.Vector3(-40, 0, -15);
      var endOrigin = new THREE.Vector3(20, 0, -15);
      gfx.showVector(start, startOrigin);
      gfx.showVector(end, endOrigin);
      var center = new THREE.Geometry(); // get centroid for camera orientation

      center.vertices.push(startOrigin, endOrigin, gfx.movePoint(startOrigin, start), gfx.movePoint(endOrigin, end));
      center = gfx.getCentroid(center);
      controls.target.set(center.x, center.y, center.z);
      gfx.setCameraLocation(camera, gfx.movePoint(center, new THREE.Vector3(0, 50, 0)));
      controls.update();
      var A = startOrigin;
      var B = gfx.movePoint(startOrigin, start);
      var C = endOrigin;
      var D = gfx.movePoint(endOrigin, end);
      var BD = gfx.createVector(B, D);
      var AC = gfx.createVector(A, C);
      var Dprime = gfx.movePoint(startOrigin, gfx.createVector(endOrigin, gfx.movePoint(endOrigin, end)));
      var BDprime = gfx.createVector(B, Dprime);
      var ADprime = gfx.createVector(endOrigin, gfx.movePoint(endOrigin, end)); // gfx.showVector(BD, B, new THREE.Color('purple'));
      // gfx.showVector(AC, A, new THREE.Color('purple'));

      gfx.labelPoint(A, 'A');
      gfx.labelPoint(B, 'B');
      gfx.labelPoint(C, 'C');
      gfx.labelPoint(D, 'D');
      var beta = gfx.getAngleBetweenVectors(BD, BDprime);
      var rotationAxis = BD.clone().cross(BDprime.clone()).normalize();
      var BArotated = gfx.createVector(B, A).applyAxisAngle(rotationAxis, beta).multiplyScalar(BD.length() / BDprime.length());
      var F = gfx.movePoint(B, BArotated);
      gfx.showPoint(F, new THREE.Color('black'));
      gfx.labelPoint(new THREE.Vector3(F.x, F.y + .1, F.z), 'F', new THREE.Color('black'));
      var FA = gfx.createVector(F, A);
      var FC = gfx.createVector(F, C);
      var AFCnormal = FA.clone().cross(FC).normalize();
      gfx.showVector(FA, F, new THREE.Color('black'));
      gfx.showVector(FC, F, new THREE.Color('black'));
      var totalAngle = gfx.calculateAngle(A, C, F);
      var AB = gfx.createVector(A, B);
      var CD = gfx.createVector(C, D);
      var steps = 10;

      for (var i = 1; i < steps + 1; i++) {
        var currentAngle = totalAngle / steps * i;
        var a = gfx.getAngleBetweenVectors(AB, CD);
        var CA2 = a / steps * i;
        var m = CD.length() / AB.length();
        var mi = m / steps * i;
        var currentRatio = AB.clone().applyAxisAngle(rotationAxis, CA2).lerpVectors(AB, CD, i / steps);
        var currentLength = AB.length() + m / steps * (i - 1);
        rotationAxis = AFCnormal.clone();
        m = FC.length() / FA.length();
        mi = m / steps * i;
        currentLength = FA.length() + m / steps * (i - 1);
        console.log(m);
        var FstepVector = FA.clone().applyAxisAngle(rotationAxis, currentAngle).multiplyScalar(mi); //console.log((10 / 2) - i / 2);

        var max = steps / 2; //console.log('i: ', i, ' ' + ((i - 1 % max) / max));

        gfx.showVector(FstepVector, F, black);
        var startingPoint = gfx.movePoint(F, FstepVector);
        gfx.showPoint(startingPoint);
        gfx.showVector(currentRatio, startingPoint);
      }
    },
    createCurve: function createCurve() {},
    addGeometries: function addGeometries() {
      var self = this; //floor = gfx.addFloor(this.settings.floorSize, this.settings.colors.worldColor, this.settings.colors.gridColor);

      var texture = new THREE.TextureLoader().load('assets/img/flower.jpg');
      texture.minFilter = THREE.LinearFilter;
      var material = new THREE.MeshBasicMaterial({
        map: texture
      });
      var geometry = new THREE.BoxGeometry(10, .01, 10);
      var cube = new THREE.Mesh(geometry, material); //scene.add(cube);

      var curveSteps = .01;
      var pointCount = 2000;
      var height = 4;

      for (var i = 0; i < pointCount * curveSteps; i += curveSteps) {
        curvePoints.push(new THREE.Vector3(i, height + height * Math.sin(i), 0));
      }

      var curve = new THREE.SplineCurve(curvePoints);
      var points = curve.getPoints(pointCount);
      geometry = new THREE.BufferGeometry().setFromPoints(points);
      material = new THREE.LineBasicMaterial({
        color: 0xff0000
      });
      var dotGeometry = new THREE.Geometry();
      dotGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
      var dotMaterial = new THREE.PointsMaterial({
        size: 10,
        sizeAttenuation: false,
        color: 0x00ff00,
        opacity: 1,
        transparent: true
      });
      dot = new THREE.Points(dotGeometry, dotMaterial); //scene.add(dot);

      var splineObject = new THREE.Line(geometry, material); //scene.add(splineObject);			

      for (var _i = 1; _i < pointCount * curveSteps + 1; _i += curveSteps) {
        logCurve.push(new THREE.Vector3(_i, 2 * Math.log(_i), 0));
      }

      var logSplineCurve = new THREE.SplineCurve(logCurve);
      points = logSplineCurve.getPoints(pointCount);
      geometry = new THREE.BufferGeometry().setFromPoints(points);
      var logSpline = new THREE.Line(geometry, material); //scene.add(logSpline);

      logSpline.translateOnAxis(new THREE.Vector3(0, 0, 1), 10);
      logDot = dot.clone(); //scene.add(logDot);

      for (var _i2 = 1; _i2 < pointCount * curveSteps + 1; _i2 += curveSteps) {
        circleCurve.push(new THREE.Vector3(5 * Math.cos(_i2), 5 * Math.sin(_i2), 0));
      }

      var circleSplineCurve = new THREE.SplineCurve(circleCurve);
      points = circleSplineCurve.getPoints(pointCount);
      geometry = new THREE.BufferGeometry().setFromPoints(points);
      var circleSpline = new THREE.Line(geometry, material); //scene.add(circleSpline);

      circleSpline.rotation.x += Math.PI / 2;
      circleDot = dot.clone(); //scene.add(circleDot);
    },
    box: function box() {
      var self = this;
      var steps = 500;

      for (var i = steps; i > 0; i--) {
        var geometry = new THREE.BoxGeometry(10, .01, 10);
        geometry.scale(i, 1, i);
        var coloredMaterial = new THREE.MeshBasicMaterial({
          color: distinctColors[i % 10]
        });
        console.log(distinctColors[i % 10]);
        var box = new THREE.Mesh(geometry, materials[i % 2]); //geometry.rotateX(Math.log(2 * Math.PI / steps * i));

        geometry.rotateY(Math.log(2 * Math.PI / steps * i)); // gfx.drawLine(box.geometry.vertices[0], box.geometry.vertices[1], new THREE.Color('black'), .35);
        // gfx.drawLine(box.geometry.vertices[3], box.geometry.vertices[4], new THREE.Color('black'), .35);
        // gfx.drawLine(box.geometry.vertices[4], box.geometry.vertices[5], new THREE.Color('black'), .35);
        // gfx.drawLine(box.geometry.vertices[5], box.geometry.vertices[0], new THREE.Color('black'), .35);

        scene.add(box);
        boxes.push(box); //box.rotation.y += Math.log(2 * Math.PI / steps * i);

        box.translateOnAxis(new THREE.Vector3(0, 1, 0), -self.settings.zBufferOffset * i);
      }
    },
    pointCloud: function pointCloud() {
      var points = new THREE.Geometry();
      var size = 10;
      var spacing = 5;

      for (var i = 0; i < size + 1; i++) {
        for (var j = 0; j < size + 1; j++) {
          points.vertices.push(new THREE.Vector3(i * spacing, 0, j * spacing));
        }
      } //gfx.showPoints(points);


      for (var _i3 = 0; _i3 < size + 1; _i3++) {
        for (var _j = size; _j > 0; _j--) {
          if (points.vertices[_i3 * _j]) gfx.drawLine(points.vertices[_i3], points.vertices[_i3 * _j]), new THREE.Color('black');
        }
      }
    },
    bindUIEvents: function bindUIEvents() {
      var self = this;
      var message = document.getElementById('message');

      var onMouseMove = function onMouseMove(event) {
        mouse.x = (event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width * 2 - 1;
        mouse.y = -((event.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1;
      };

      window.addEventListener('mousemove', onMouseMove, false);
      document.querySelector('canvas').addEventListener('click', function (event) {
        self.intersects(event);
      });
      self.hideButtons();
    },
    intersects: function intersects(event) {
      var self = this;
      raycaster.setFromCamera(mouse, camera);
      var intersects = raycaster.intersectObjects(targetList);

      if (intersects.length > 0) {
        var faceIndex = intersects[0].faceIndex;
        self.setUpFaceClicks(faceIndex);
      }
    },
    loadAssets: function loadAssets() {
      var self = this;
      var loader = new THREE.FontLoader();
      var fontPath = '';
      fontPath = 'assets/vendors/js/three.js/examples/fonts/helvetiker_regular.typeface.json';
      loader.load(fontPath, function (font) {
        // success event
        gfx.appSettings.font.fontStyle.font = font;
      }, function (event) {// in progress event.
      }, function (event) {
        // error event
        gfx.appSettings.font.enable = false;
      });
    },
    resizeRendererOnWindowResize: function resizeRendererOnWindowResize() {
      window.addEventListener('resize', utils.debounce(function () {
        if (renderer) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
      }, 250));
    },
    hideButtons: function hideButtons() {
      var buttons = document.querySelectorAll('button');
      buttons.forEach(function (button) {
        button.style.display = 'none';
      });
    }
  };
};

},{}],3:[function(require,module,exports){
"use strict";

module.exports = function () {
  return {
    settings: {},
    init: function init() {
      this.setKeys();
    },
    setKeys: function setKeys() {
      document.addEventListener('keyup', function (event) {
        var space = 32;

        if (event.keyCode === space) {}
      });
    }
  };
};

},{}],4:[function(require,module,exports){
"use strict";

(function () {
  var appSettings;
  var scene;

  window.gfx = function () {
    return {
      appSettings: {
        activateLightHelpers: false,
        axesHelper: {
          activateAxesHelper: false,
          axisLength: 10
        },
        font: {
          enable: true,
          fontStyle: {
            font: null,
            size: 2,
            height: 0,
            curveSegments: 1
          }
        },
        errorLogging: false,
        camera: {
          position: {
            x: 0,
            y: 2,
            z: 0
          }
        }
      },
      activateAxesHelper: function activateAxesHelper() {
        var self = this;
        var axesHelper = new THREE.AxesHelper(gfx.appSettings.axesHelper.axisLength);
        scene.add(axesHelper);
      },
      activateLightHelpers: function activateLightHelpers(lights) {
        for (var i = 0; i < lights.length; i++) {
          var helper = new THREE.DirectionalLightHelper(lights[i], 5, 0x00000);
          scene.add(helper);
        }
      },
      addFloor: function addFloor(size, worldColor, gridColor) {
        var planeGeometry = new THREE.PlaneBufferGeometry(size, size);
        planeGeometry.rotateX(-Math.PI / 2);
        var planeMaterial = new THREE.ShadowMaterial();
        var plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.y = -1;
        plane.receiveShadow = true;
        scene.add(plane);
        var helper = new THREE.GridHelper(size, 20, gridColor, gridColor);
        helper.material.opacity = .1;
        helper.material.transparent = true;
        scene.add(helper);
        scene.background = worldColor; //scene.fog = new THREE.FogExp2(new THREE.Color('black'), 0.002);

        return plane;
      },
      createVector: function createVector(pt1, pt2) {
        return new THREE.Vector3(pt2.x - pt1.x, pt2.y - pt1.y, pt2.z - pt1.z);
      },
      addVectors: function addVectors(vector1, vector2) {
        return new THREE.Vector3(vector1.x + vector2.x, vector1.y + vector2.y, vector1.z + vector2.z);
      },
      getSharedVertices: function getSharedVertices(geometry1, geometry2) {
        var result = new THREE.Geometry();
        geometry1.vertices.forEach(function (geometry1Vertex) {
          geometry2.vertices.forEach(function (geometry2Vertex) {
            if (utils.roundHundreths(geometry1Vertex.x) === utils.roundHundreths(geometry2Vertex.x) && utils.roundHundreths(geometry1Vertex.y) === utils.roundHundreths(geometry2Vertex.y) && utils.roundHundreths(geometry1Vertex.z) === utils.roundHundreths(geometry2Vertex.z)) {
              result.vertices.push(geometry2Vertex);
            }
          });
        });
        return result;
      },
      getHighestVertex: function getHighestVertex(geometry) {
        var self = this;
        var highest = new THREE.Vector3();
        geometry.vertices.forEach(function (vertex) {
          if (vertex.y > highest.y) {
            highest = vertex;
          }
        });
        return new THREE.Vector3(highest.x, highest.y, highest.z);
      },
      sortVerticesClockwise: function sortVerticesClockwise(geometry) {
        var self = this;
        var midpoint = new THREE.Vector3(0, 0, 0);
        geometry.vertices.forEach(function (vertex) {
          midpoint.x += vertex.x - .001; // very slight offset for the case where polygon is a quadrilateral so that not all angles are equal

          midpoint.y += vertex.y;
          midpoint.z += vertex.z - .001;
        });
        midpoint.x /= geometry.vertices.length;
        midpoint.y /= geometry.vertices.length;
        midpoint.z /= geometry.vertices.length;
        var sorted = geometry.clone();
        sorted.vertices.forEach(function (vertex) {
          var vec = gfx.createVector(midpoint, vertex);
          var vecNext = gfx.createVector(midpoint, utils.next(sorted.vertices, vertex));
          var angle = gfx.getAngleBetweenVectors(vec, vecNext);
          vertex.angle = angle;
        });
        sorted.vertices.sort(function (a, b) {
          return a.angle - b.angle;
        });
        return sorted;
      },
      createLine: function createLine(pt1, pt2) {
        var geometry = new THREE.Geometry();
        geometry.vertices.push(pt1);
        geometry.vertices.push(pt2);
        return geometry;
      },
      intersection: function intersection(line1, line2) {
        var pt1 = line1.vertices[0];
        var pt2 = line1.vertices[1];
        var pt3 = line2.vertices[0];
        var pt4 = line2.vertices[1];
        var lerpLine1 = ((pt4.x - pt3.x) * (pt1.z - pt3.z) - (pt4.z - pt3.z) * (pt1.x - pt3.x)) / ((pt4.z - pt3.z) * (pt2.x - pt1.x) - (pt4.x - pt3.x) * (pt2.z - pt1.z));
        var lerpLine2 = ((pt2.x - pt1.x) * (pt1.z - pt3.z) - (pt2.z - pt1.z) * (pt1.x - pt3.x)) / ((pt4.z - pt3.z) * (pt2.x - pt1.x) - (pt4.x - pt3.x) * (pt2.z - pt1.z));
        var x = pt1.x + lerpLine1 * (pt2.x - pt1.x);
        var z = pt1.z + lerpLine1 * (pt2.z - pt1.z);
        return new THREE.Vector3(x, 0, z);
      },
      getMagnitude: function getMagnitude(vector) {
        var magnitude = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2) + Math.pow(vector.z, 2));
        return magnitude;
      },
      getMidpoint: function getMidpoint(pt1, pt2) {
        var midpoint = new THREE.Vector3();
        midpoint.x = (pt1.x + pt2.x) / 2;
        midpoint.y = (pt1.y + pt2.y) / 2;
        midpoint.z = (pt1.z + pt2.z) / 2;
        return midpoint;
      },
      isRightTurn: function isRightTurn(startingPoint, turningPoint, endingPoint) {
        // This might only work if vectors are flat on the ground since I am using y-component to determine sign
        var segment1 = gfx.createVector(startingPoint, turningPoint);
        var segment2 = gfx.createVector(turningPoint, endingPoint);
        var result = new THREE.Vector3();
        result.crossVectors(segment1, segment2);
        return result.y > 0;
      },
      rotatePointAboutLine: function rotatePointAboutLine(pt, axisPt1, axisPt2, angle) {
        var self = this;
        var u = new THREE.Vector3(0, 0, 0),
            rotation1 = new THREE.Vector3(0, 0, 0),
            rotation2 = new THREE.Vector3(0, 0, 0);
        var d = 0.0; // Move rotation axis to origin

        rotation1.x = pt.x - axisPt1.x;
        rotation1.y = pt.y - axisPt1.y;
        rotation1.z = pt.z - axisPt1.z; // Get unit vector equivalent to rotation axis

        u.x = axisPt2.x - axisPt1.x;
        u.y = axisPt2.y - axisPt1.y;
        u.z = axisPt2.z - axisPt1.z;
        u.normalize();
        d = Math.sqrt(u.y * u.y + u.z * u.z); // Rotation onto first plane

        if (d != 0) {
          rotation2.x = rotation1.x;
          rotation2.y = rotation1.y * u.z / d - rotation1.z * u.y / d;
          rotation2.z = rotation1.y * u.y / d + rotation1.z * u.z / d;
        } else {
          rotation2 = rotation1;
        } // Rotation rotation onto second plane


        rotation1.x = rotation2.x * d - rotation2.z * u.x;
        rotation1.y = rotation2.y;
        rotation1.z = rotation2.x * u.x + rotation2.z * d; // Oriented to axis, now perform original rotation

        rotation2.x = rotation1.x * Math.cos(angle) - rotation1.y * Math.sin(angle);
        rotation2.y = rotation1.x * Math.sin(angle) + rotation1.y * Math.cos(angle);
        rotation2.z = rotation1.z; // Undo rotation 1

        rotation1.x = rotation2.x * d + rotation2.z * u.x;
        rotation1.y = rotation2.y;
        rotation1.z = -rotation2.x * u.x + rotation2.z * d; // Undo rotation 2

        if (d != 0) {
          rotation2.x = rotation1.x;
          rotation2.y = rotation1.y * u.z / d + rotation1.z * u.y / d;
          rotation2.z = -rotation1.y * u.y / d + rotation1.z * u.z / d;
        } else {
          rotation2 = rotation1;
        } // Move back into place


        rotation1.x = rotation2.x + axisPt1.x;
        rotation1.y = rotation2.y + axisPt1.y;
        rotation1.z = rotation2.z + axisPt1.z;
        return rotation1;
      },
      rotateGeometryAboutLine: function rotateGeometryAboutLine(geometry, axisPt1, axisPt2, angle) {
        var self = this;

        for (var i = 0; i < geometry.vertices.length; i++) {
          geometry.vertices[i].set(gfx.rotatePointAboutLine(geometry.vertices[i], axisPt1, axisPt2, angle).x, gfx.rotatePointAboutLine(geometry.vertices[i], axisPt1, axisPt2, angle).y, gfx.rotatePointAboutLine(geometry.vertices[i], axisPt1, axisPt2, angle).z);
        }

        return geometry;
      },
      setUpScene: function setUpScene() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        if (gfx.appSettings.axesHelper.activateAxesHelper) {
          gfx.activateAxesHelper();
        }

        return scene;
      },
      setUpRenderer: function setUpRenderer(renderer) {
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        return renderer;
      },
      setUpCamera: function setUpCamera(camera) {
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        gfx.setCameraLocation(camera, this.appSettings.camera.position);
        return camera;
      },
      showPoints: function showPoints(geometry, color, opacity) {
        var self = this;

        for (var i = 0; i < geometry.vertices.length; i++) {
          gfx.showPoint(geometry.vertices[i], color, opacity);
        }
      },
      showPoint: function showPoint(pt, color, opacity) {
        color = color || 0xff0000;
        opacity = opacity || 1;
        var dotGeometry = new THREE.Geometry();
        dotGeometry.vertices.push(new THREE.Vector3(pt.x, pt.y, pt.z));
        var dotMaterial = new THREE.PointsMaterial({
          size: 10,
          sizeAttenuation: false,
          color: color,
          opacity: opacity,
          transparent: true
        });
        var dot = new THREE.Points(dotGeometry, dotMaterial);
        scene.add(dot);
        return dot;
      },
      showVector: function showVector(vector, origin, color) {
        color = color || 0xff0000;
        var arrowHelper = new THREE.ArrowHelper(vector, origin, vector.length(), color);
        scene.add(arrowHelper);
      },

      /* 	Inputs: pt - point in space to label, in the form of object with x, y, and z properties; label - text content for label; color - optional */
      labelPoint: function labelPoint(pt, label, color) {
        var self = this;

        if (gfx.appSettings.font.enable) {
          color = color || 0xff0000;
          var textGeometry = new THREE.TextGeometry(label, self.appSettings.font.fontStyle);
          var textMaterial = new THREE.MeshBasicMaterial({
            color: color
          });
          var mesh = new THREE.Mesh(textGeometry, textMaterial);
          textGeometry.rotateX(-Math.PI / 2);
          textGeometry.translate(pt.x, pt.y, pt.z);
          scene.add(mesh);
        }
      },
      drawLine: function drawLine(pt1, pt2, color, opacity) {
        color = color || 0x0000ff;
        opacity = opacity || 1;
        var material = new THREE.LineBasicMaterial({
          color: color,
          transparent: true,
          opacity: opacity
        });
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(pt1.x, pt1.y, pt1.z));
        geometry.vertices.push(new THREE.Vector3(pt2.x, pt2.y, pt2.z));
        var line = new THREE.Line(geometry, material);
        scene.add(line);
      },
      getDistance: function getDistance(pt1, pt2) {
        // create point class?
        var squirt = Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2) + Math.pow(pt2.z - pt1.z, 2);
        return Math.sqrt(squirt);
      },
      labelAxes: function labelAxes() {
        var self = this;

        if (gfx.appSettings.font.enable) {
          var textGeometry = new THREE.TextGeometry('Y', gfx.appSettings.font.fontStyle);
          var textMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00
          });
          var mesh = new THREE.Mesh(textGeometry, textMaterial);
          textGeometry.translate(0, gfx.appSettings.axesHelper.axisLength, 0);
          scene.add(mesh);
          textGeometry = new THREE.TextGeometry('X', gfx.appSettings.font.fontStyle);
          textMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000
          });
          mesh = new THREE.Mesh(textGeometry, textMaterial);
          textGeometry.translate(gfx.appSettings.axesHelper.axisLength, 0, 0);
          scene.add(mesh);
          textGeometry = new THREE.TextGeometry('Z', gfx.appSettings.font.fontStyle);
          textMaterial = new THREE.MeshBasicMaterial({
            color: 0x0000ff
          });
          mesh = new THREE.Mesh(textGeometry, textMaterial);
          textGeometry.translate(0, 0, gfx.appSettings.axesHelper.axisLength);
          scene.add(mesh);
        }
      },
      setCameraLocation: function setCameraLocation(camera, pt) {
        camera.position.x = pt.x;
        camera.position.y = pt.y;
        camera.position.z = pt.z;
      },
      resizeRendererOnWindowResize: function resizeRendererOnWindowResize(renderer, camera) {
        window.addEventListener('resize', utils.debounce(function () {
          if (renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
          }
        }, 250));
      },
      resetScene: function resetScene(scope) {
        scope.settings.stepCount = 0;

        for (var i = scene.children.length - 1; i >= 0; i--) {
          var obj = scene.children[i];
          scene.remove(obj);
        }

        gfx.addFloor();
        scope.addTetrahedron();
        gfx.setUpLights();
        gfx.setCameraLocation(camera, self.settings.defaultCameraLocation);
      },
      enableControls: function enableControls(controls, renderer, camera) {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0);
        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled

        controls.dampingFactor = 0.05;
        controls.zoomSpeed = 2;
        controls.enablePan = !utils.mobile();
        controls.panSpeed = 1.5;
        controls.minDistance = 10;
        controls.maxDistance = 800;
        controls.maxPolarAngle = Math.PI / 2;
        return controls;
      },
      enableStats: function enableStats(stats) {
        document.body.appendChild(stats.dom);
      },
      setUpLights: function setUpLights() {
        var self = this;
        var lights = [];
        var color = 0xFFFFFF;
        var intensity = 1;
        var light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
        lights.push(light);
        var light2 = new THREE.DirectionalLight(color, intensity);
        light2.position.set(0, 2, -8);
        scene.add(light2);
        lights.push(light2);

        if (gfx.appSettings.activateLightHelpers) {
          gfx.activateLightHelpers(lights);
        }
      },
      movePoint: function movePoint(pt, vec) {
        return new THREE.Vector3(pt.x + vec.x, pt.y + vec.y, pt.z + vec.z);
      },
      createTriangle: function createTriangle(pt1, pt2, pt3) {
        // return geometry
        var triangleGeometry = new THREE.Geometry();
        triangleGeometry.vertices.push(new THREE.Vector3(pt1.x, pt1.y, pt1.z));
        triangleGeometry.vertices.push(new THREE.Vector3(pt2.x, pt2.y, pt2.z));
        triangleGeometry.vertices.push(new THREE.Vector3(pt3.x, pt3.y, pt3.z));
        triangleGeometry.faces.push(new THREE.Face3(0, 1, 2));
        triangleGeometry.computeFaceNormals();
        return triangleGeometry;
      },
      getCentroid: function getCentroid(geometry) {
        // Calculating centroid of a tetrahedron: https://www.youtube.com/watch?v=Infxzuqd_F4
        var result = new THREE.Vector3();
        var x = 0,
            y = 0,
            z = 0;

        for (var i = 0; i < geometry.vertices.length; i++) {
          x += geometry.vertices[i].x;
          y += geometry.vertices[i].y;
          z += geometry.vertices[i].z;
        }

        result.x = x / 4;
        result.y = y / 4;
        result.z = z / 4;
        return result;
      },
      getAngleBetweenVectors: function getAngleBetweenVectors(vector1, vector2) {
        var dot = vector1.dot(vector2);
        var length1 = vector1.length();
        var length2 = vector2.length();
        var angle = 0;

        if (length1 * length2 === 0) {
          // divide by zero case
          angle = Math.acos(0);
        } else {
          angle = Math.acos(dot / (length1 * length2));
        }

        return angle;
      },
      calculateAngle: function calculateAngle(endpoint1, endpoint2, vertex) {
        var vector1 = new THREE.Vector3(endpoint1.x - vertex.x, endpoint1.y - vertex.y, endpoint1.z - vertex.z);
        var vector2 = new THREE.Vector3(endpoint2.x - vertex.x, endpoint2.y - vertex.y, endpoint2.z - vertex.z);
        var angle = vector1.angleTo(vector2);
        return angle;
      }
    };
  }();

  module.exports = window.gfx;
})();

},{}],5:[function(require,module,exports){
"use strict";

var Patterns = require('./components/patterns.js');

var Curves = require('./components/curves.js');

var UI = require('./components/ui.js');

var Utilities = require('./utils.js');

var Graphics = require('./graphics.js');

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    Patterns().init();
    Curves().init();
    UI().init();
  });
})();

},{"./components/curves.js":1,"./components/patterns.js":2,"./components/ui.js":3,"./graphics.js":4,"./utils.js":6}],6:[function(require,module,exports){
"use strict";

(function () {
  var appSettings;

  window.utils = function () {
    return {
      appSettings: {
        breakpoints: {
          mobileMax: 767,
          tabletMin: 768,
          tabletMax: 991,
          desktopMin: 992,
          desktopLargeMin: 1200
        }
      },
      mobile: function mobile() {
        return window.innerWidth < this.appSettings.breakpoints.tabletMin;
      },
      tablet: function tablet() {
        return window.innerWidth > this.appSettings.breakpoints.mobileMax && window.innerWidth < this.appSettings.breakpoints.desktopMin;
      },
      desktop: function desktop() {
        return window.innerWidth > this.appSettings.breakpoints.desktopMin;
      },
      getBreakpoint: function getBreakpoint() {
        if (window.innerWidth < this.appSettings.breakpoints.tabletMin) return 'mobile';else if (window.innerWidth < this.appSettings.breakpoints.desktopMin) return 'tablet';else return 'desktop';
      },
      debounce: function debounce(func, wait, immediate) {
        var timeout;
        return function () {
          var context = this,
              args = arguments;

          var later = function later() {
            timeout = null;
            if (!immediate) func.apply(context, args);
          };

          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow) func.apply(context, args);
        };
      },

      /* Purpose: Detect if any of the element is currently within the viewport */
      anyOnScreen: function anyOnScreen(element) {
        var win = $(window);
        var viewport = {
          top: win.scrollTop(),
          left: win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();
        var bounds = element.offset();
        bounds.right = bounds.left + element.outerWidth();
        bounds.bottom = bounds.top + element.outerHeight();
        return !(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom);
      },

      /* Purpose: Detect if an element is vertically on screen; if the top and bottom of the element are both within the viewport. */
      allOnScreen: function allOnScreen(element) {
        var win = $(window);
        var viewport = {
          top: win.scrollTop(),
          left: win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();
        var bounds = element.offset();
        bounds.right = bounds.left + element.outerWidth();
        bounds.bottom = bounds.top + element.outerHeight();
        return !(viewport.bottom < bounds.top && viewport.top > bounds.bottom);
      },
      secondsToMilliseconds: function secondsToMilliseconds(seconds) {
        return seconds * 1000;
      },

      /*
      * Purpose: This method allows you to temporarily disable an an element's transition so you can modify its proprties without having it animate those changing properties.
      * Params:
      * 	-element: The element you would like to modify.
      * 	-cssTransformation: The css transformation you would like to make, i.e. {'width': 0, 'height': 0} or 'border', '1px solid black'
      */
      getTransitionDuration: function getTransitionDuration(element) {
        var $element = $(element);
        return utils.secondsToMilliseconds(parseFloat(getComputedStyle($element[0]).transitionDuration));
      },
      isInteger: function isInteger(number) {
        return number % 1 === 0;
      },
      rotate: function rotate(array) {
        array.push(array.shift());
        return array;
      }
    };
  }();

  module.exports = window.utils;
})();

},{}]},{},[5]);
