
    window.onload = function() {
        var anchors = document.getElementsByClassName('date-button');
        for(var i = 0; i < anchors.length; i++) {
            var anchor = anchors[i];
            anchor.onclick = function() {
                var element = document.querySelector("#scroll-to");

			// smooth scroll to element and align it at the bottom
				element.scrollIntoView({ behavior: 'smooth', block: 'end'});

            }
        }
    }
