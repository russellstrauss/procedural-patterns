(function () {
	
	var appSettings;
	
	window.utils = (function() {
		
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
			
			mobile: function() {
				return window.innerWidth < this.appSettings.breakpoints.tabletMin;
			},
			
			tablet: function() {
				return (window.innerWidth > this.appSettings.breakpoints.mobileMax && window.innerWidth < this.appSettings.breakpoints.desktopMin);
			},
			
			desktop: function() {
				return window.innerWidth > this.appSettings.breakpoints.desktopMin;
			},
			
			getBreakpoint: function() {
				if (window.innerWidth < this.appSettings.breakpoints.tabletMin) return 'mobile';
				else if (window.innerWidth < this.appSettings.breakpoints.desktopMin) return 'tablet';
				else return 'desktop';
			},
			
			debounce: function(func, wait, immediate) {
				var timeout;
				return function () {
					var context = this, args = arguments;
					var later = function () {
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
			anyOnScreen: function(element) {

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

				return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));

			},
			
			/* Purpose: Detect if an element is vertically on screen; if the top and bottom of the element are both within the viewport. */
			allOnScreen: function(element) {

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

				return (!(viewport.bottom < bounds.top && viewport.top > bounds.bottom));

			},
			
			secondsToMilliseconds: function(seconds) {
				return seconds * 1000;
			},
			
			/*
			* Purpose: This method allows you to temporarily disable an an element's transition so you can modify its proprties without having it animate those changing properties.
			* Params:
			* 	-element: The element you would like to modify.
			* 	-cssTransformation: The css transformation you would like to make, i.e. {'width': 0, 'height': 0} or 'border', '1px solid black'
			*/
			getTransitionDuration: function(element) {
				var $element = $(element);
				return utils.secondsToMilliseconds(parseFloat(getComputedStyle($element[0]).transitionDuration));
			},
			
			isInteger: function(number) {
				return number % 1 === 0;
			},
			
			rotate: function(array) {
				array.push(array.shift());
				return array;
			}
		};
	})();
	
	module.exports = window.utils;
})();