(function() {
    var root = this;

	// check if we're in a Node (browserify) environment. If not, you need to load d3.
    var d3 = typeof module !== "undefined" ? require("d3") : window.d3;

    if (!d3) {
        console.log("d3-base requires that you include d3 first.");
        return;
    }
    // Width/height for tooltips
    var width = 0,
    	height = 0;
	// create a new SVG element
	var d3base = function(parent, opts) {
		opts = opts || {};

		// setup
		if (!parent) {
			console.log("You must supply d3-base a parent as the first argument");
			return null;
		}

		var base = {
			width: typeof opts.width !== "undefined" ? opts.width : parseInt(d3.select(parent).style("width"), 10),
			scale: 1,
			uid: s5() // needed for namespacing the resize event
		};

		var original_width = base.width;

	    if (typeof opts.height !== "undefined") {
	    	// For tooltips
	    	height = opts.height;
	    	width = base.width;
	    	
	    	base.height = opts.height;
	    	opts.aspect = base.height / base.width;
	    } else {
		    opts.aspect = typeof opts.aspect !== "undefined" ? opts.aspect : 0.618;
			base.height = base.width * opts.aspect;
			
			// For tooltips
			height = base.width * opts.aspect;
			width = base.width;
	    }

	    base.svg = d3.select(parent).append("svg");

	    base.svg
			.attr("width", base.width)
			.attr("height", base.height);

	    if (opts.resize && opts.resize == "auto") {
	    	base.svg.attr("viewBox", "0 0 " + base.width + " " + base.height);
	    }
		
		function resize() { 
			base.width = parseInt(d3.select(parent).style("width"), 10);
		    base.height = base.width * opts.aspect;
		    base.scale = base.width / original_width;

		    base.svg
				.attr("width",  base.width)
				.attr("height", base.height);

			// Update width/height for tooltips
			width = base.width;
	    	height = base.width;
			// optional callback
			if (opts.onResize) {
				opts.onResize(base.width, base.height, base.scale);
			}
		}

		var resizeTimer;

		// http://stackoverflow.com/questions/3339825/what-is-the-best-practise-to-not-to-override-other-bound-functions-to-window-onr
		function addResizeEvent(func, dur) {
			var resizeTimer;

			d3.select(window).on("resize." + base.uid, function() {
				clearTimeout(resizeTimer);

		        if (typeof oldResize === 'function') {
		            oldResize();
		        }

				resizeTimer = setTimeout(function() {
					func();
				}, dur || 250);
			});
		}

		addResizeEvent(resize, 250);

		if (opts.resize && opts.resize === "auto") {
			resize(); // call this on load since sometimes the initial conditions are wider than container
		}

		base.setResize = function(f) {
			opts.onResize = f;
		}

		return base;
	}

	// support various modular environments
	if (typeof define === "function" && define.amd) { // RequireJS
	    define(d3base);
	} else if (typeof module === "object" && module.exports) { // browserify
	    module.exports = d3base;
	} else {
	    root.d3base = d3base; // directly included
	}

	// some d3 extensions
	d3.selection.prototype.toFront = function() {
		return this.each(function(){
			this.parentNode.appendChild(this);
		});
	};

	var tooltip = d3.select("body").append("div").classed("d3tooltip", true);

	d3.selection.prototype.tooltip = function(over, out, click) {		
		this //.on("click", function(d) { tooltip.html(typeof f === "function" ? f(d) : f); tooltip.classed("clicked", "true"); tooltip.style("visibility", "visible"); })
			.on("mouseover.d3tooltip", function(d, i, j) { 
				var html = typeof over === "function" ? over(d, i, this, j) : over;
				tooltip.html(html); 
				if (html && html !== "") {
					tooltip.style("visibility", "visible");
				} else {
					tooltip.style("visibility", "hidden");
				}
			})
			.on("mousemove.d3tooltip", function() {
				if (d3.event.pageY < height/2){
					return d3.event.pageX < (width/2) ? tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px") : tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX - tooltip[0][0].clientWidth - 10)+"px");
				} else {
					return d3.event.pageX < (width/2) ? tooltip.style("top", (d3.event.pageY- tooltip[0][0].clientHeight + 10)+"px").style("left",(d3.event.pageX+10)+"px") : tooltip.style("top", (d3.event.pageY- tooltip[0][0].clientHeight + 10)+"px").style("left",(d3.event.pageX - tooltip[0][0].clientWidth - 10)+"px");
				}
			})
			.on("mouseout.d3tooltip", function(d, i) { 			
				if (out) {
					out(d, i, this);
				}
				return tooltip.style("visibility", "hidden");
			});
		return this;
	};

	function s5() {
	    return Math.floor((1 + Math.random()) * 0x100000)
			.toString(16)
			.substring(1);
	}

}());