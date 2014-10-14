(function($) {
	var d3 = require('d3');

	// create a new SVG element
	module.exports = function(parent, opts) {
		opts = opts || {};

		// setup
		if (!parent) {
			console.log("You must supply d3 base a parent");
			return null;
		}

		var base = {};
	    base.width = opts.width || $(parent).width();

	    if (opts.height) {
	    	base.height = opts.height;
	    	opts.aspect = base.height / base.width;
	    } else {
		    opts.aspect = opts.aspect || 0.618;
			base.height = base.width * opts.aspect;
	    }

	    base.svg = d3.select(parent).append("svg");

	    base.svg
			.attr("width", base.width)
			.attr("height", base.height);
		
		function resize() { 
			base.width = $(parent).width();
		    base.height = base.width * opts.aspect;

		    base.svg
				.attr("width",  base.width)
				.attr("height", base.height);

			// optional callback
			if (opts.onresize) {
				opts.onresize(base.width, base.height);
			}
		}

		if (!opts.dontresize) {
			var resizeTimer;

			$(window).resize(function() { 
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(function() {
					resize();
				}, 100);
			});
		}
		
		return base;
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
			.on("mouseover", function(d, i, j) { 
				var html = typeof over === "function" ? over(d, i, this, j) : over;
				tooltip.html(html); 
				if (html && html !== "") {
					tooltip.style("visibility", "visible");
				} else {
					tooltip.style("visibility", "hidden");
				}
			})
			.on("mousemove", function() { 
				return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
			})
			.on("mouseout", function(d, i) { 			
				if (out) {
					out(d, i, this);
				}
				return tooltip.style("visibility", "hidden");
			});
		return this;
	};

}(window.jQuery));