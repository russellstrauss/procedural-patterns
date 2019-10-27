module.exports = function() {
	
	return {
		
		settings: {
		},
		
		init: function() {

			this.setKeys();
		},
		
		setKeys: function() {
			
			document.addEventListener('keyup', function(event) {
				
				let space = 32;
				
				if (event.keyCode === space) {
					
				}
			});
		}
	};
};