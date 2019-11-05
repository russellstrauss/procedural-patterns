var Patterns = require('./components/patterns.js');
var Curves = require('./components/curves.js');
var UI = require('./components/ui.js');
var Utilities = require('./utils.js');
var Graphics = require('./graphics.js');

(function () {
	
	document.addEventListener('DOMContentLoaded',function(){

		Patterns().init();
		Curves().init();
		UI().init();
	});
})();