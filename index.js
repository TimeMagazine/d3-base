(function($) {

var components = {};
module.exports.components = components;

// fail on IE lte 8 before attempting to load d3
function getInternetExplorerVersion() {
    var rv = -1; // Return value assumes failure.
    var ua = navigator.userAgent;
    var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null) {
        rv = parseFloat(RegExp.$1);
    }
    return rv;
}

var rv = getInternetExplorerVersion();

if (rv > -1 && rv < 9) {
	$("<div />", {
		html: "Your browser is not up to date. It may not display the features of this and other websites. Please consider <a href='http://browsehappy.com/'>upgrading your browser</a>."
	}).addClass("ie8_warning").appendTo(".time-interactive");

	module.exports = null;
	return
} 

var d3 = require('d3');

// create a new SVG element with a zoomable layer
module.exports = function(parent, opts) {
	opts = opts || {};
	// setup
	if (!parent) {
		console.log("You must supply a parent");
		return;
	}

	var components = {};
	var hght = opts.hght || 0.618;

	// specs
    components.width = opts.width || $(parent).width();
    // height can be a ratio or a fixed value
    components.height = hght <= 1 ? components.width * hght : hght;

	// if before, insert at top of parent    
    if (opts.before) {
    	components.svg = d3.select(parent)
	    	.insert("svg", ":first-child");
    } else {
    	components.svg = d3.select(parent)
    		.append("svg");
    }

    components.svg
		.attr("width", components.width)
		.attr("height", components.height);

	function redraw() {
		var t = d3.event.translate,
			s = d3.event.scale;

		console.log(s);

		if (s == 1) {
			$(".article-viewport").scrollTop($(".article-viewport").scrollTop() + 50);
		}

		var x_over = components.width * (s - 1);

		components.g.selectAll("path").each(function(d) {
			if (!d.original_stroke) {
				d.original_stroke = parseFloat(d3.select(this).style("stroke-width")) || 1;
			}
		});


		t[0] = Math.max(-components.width * (s - 1), Math.min(0, t[0]));
		t[1] = Math.max(-components.height * (s - 1), Math.min(0, t[1]));
		zoom.translate(t);
		components.g.attr("transform", "translate(" + t + ")scale(" + s + ")");		

		
		components.g.selectAll("path").style("stroke-width", function(d) {
			return d.original_stroke / s;
		});

		if (opts.onzoom) {
			opts.onzoom(t, s);
		}

	}

    // add zoom functionality unless specified as false
    // zoom should be a two-element array of floats for min and max zoom
    if (opts.zoom) {
    	if (typeof opts.zoom !== "object" || opts.zoom.length < 2) {
	    	opts.zoom = [1,6];
    	}

		var zoom = d3.behavior.zoom().scaleExtent([opts.zoom[0], opts.zoom[1]]);

	    // top-level layer to allow for zooming
	    components.g = components.svg
		    //.attr("pointer-events", "all")
			.call(zoom.on("zoom", redraw))
			.append("g")
	    	.attr("id", "zoom_layer");

    }
	
	function resize() { 
		if (opts.zoom) {
			zoom.scale(1);
		}
		if (opts.zoom) {
			components.g.style("stroke-width", 1).attr("transform", "translate(0,0)scale(1)");		
		}

		components.width = $(parent).width();
	    // height can be a ratio or a fixed value
	    components.height = hght < 1 ? components.width * hght : hght;
	    components.svg
			.attr("width", components.width)
			.attr("height", components.height);

		if (opts.onresize) {
			opts.onresize(components.width, components.height);
		}

	}

	var resizeTimer;

	$(window).resize(function() { 
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function() {
			resize();
		}, 100);
	});

	return components;
}

module.exports.makeSizeLegend = function(svg, title, vals, x, y, dir) {
	dir = dir || "vert";
	x = typeof x !== "undefined" ? x : 10;
	y = typeof y !== "undefined" ? y : 10;

	svg.select("#sizelegend").remove();

	svg.append("text")
		.attr("x", x)
		.attr("y", y)
		.text(title)
		.style("font-size", "12px")
		.style("fill", '#666')
		.attr("class", "subhead");

	var sizelegend = svg
		.append("g")
		.attr("id", "legend")
		.attr("transform", "translate(" + x + "," + (y + 16) + ")");

	var items = sizelegend.selectAll(".legend").data(vals).enter().append("g").attr("class", "legend");

	var box_width = vals[vals.length - 1].radius + 5;

	items.append("circle")
		.attr("cx", function(d, i) { return (dir[0] === "h") ? box_width * (2 * i + 1) : box_width; })
		.attr("cy", function(d, i) { return (dir[0] === "h") ? 0 : ((box_width) * (0.5 + i)); })
		.attr("id", function(d, i) { return "back-" + i; })
		.attr("r", function(d) { return d.radius; })
		.style("fill", function(d) { return d.color; });
	  
	items.append("text")
		.attr("class", "legend_label")    
		.attr("x", function(d, i) { return (dir[0] === "h") ? box_width * (2 * i + 1) : (box_width + 15); })
		.attr("y", function(d, i) { return (dir[0] === "h") ? (box_width + 5) : ((box_width + 5) * (i + 0.5)); })
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.style("font-size", box_width < 20 ? 10 : 12)
		.text(function(d) { return d.label; });
}

module.exports.makeLegend = function(title, parent, legend) {
	$("<div/>").addClass("legend").appendTo(parent);
	var leg = $(parent).find(".legend");
	if (title) {
		$("<div />").addClass("legend-title").html(title).appendTo(leg);
	}
	$("<ul />").appendTo(leg);

	d3.select(parent).select(".legend").select("ul")
		.selectAll("li")
		.data(legend)
		.enter()
		.append("li")
		.style("background-color", function(d) {
			return d.color;
		})
		.style("width", 99 / legend.length + "%")
		.style("color", function(d) {
			var hsl = d3.hsl(d.color);
			if (hsl.l > 0.70) {
				return "#000";
			}
			return "#FFF";
		}).html(function(d) {
			return "<div class='legend_label'>" + d.label + "</div>";
		});
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
		.on("mouseover", function(d, i) { 
			var html = typeof over === "function" ? over(d, i, this) : over;
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
		/*
		.on("click", function(d, i) { 
			console.log(d.imclicked);
			if (!d.hasOwnProperty("imclicked") || !d.imclicked) {
				d.imclicked = true;
				tooltip.html(typeof over === "function" ? over(d, i, this) : over); 
				tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
				tooltip.style("visibility", "visible");
			} else {
				d.imclicked = false;
				if (out) {
					out();
				}
				return tooltip.style("visibility", "hidden");
			}
		});  */          
};

function blockScroll() { 
	//d3.event.preventDefault();
}

}(window.jQuery));