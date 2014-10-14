d3-base
=======

Create a responsive SVG that resizes to the container.

## Example

	var base = require("d3-base");

	var b = base("#container", {
		height: 400
	});

## Options
You must pass `base` a selector representing the parent element in width the SVG will be created

+ width: The initial width of the SVG. Defaults to width of parent

+ height: The height. Defaults to the aspect ratio.

+ aspect: The aspect ratio of the SVG. Defaults to 0.618, an approximation of the golden ratio

+ dontresize: Self-explanatory