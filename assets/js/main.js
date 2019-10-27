var Patterns = require('./components/patterns.js');
var UI = require('./components/ui.js');
var Utilities = require('./utils.js');
var Graphics = require('./graphics.js');

(function () {
	
	document.addEventListener('DOMContentLoaded',function(){

		Patterns().init();
		UI().init();
	});
})();