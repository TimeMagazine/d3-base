d3-base
=======

Create a responsive SVG that resizes to the container.

## Example

	var base = require("d3-base");

	var b = base("#container", {
		height: 400
	});

	var b = base("#container", {
		aspect: 0.5
	});

## Options
You must pass `base` a selector representing the parent element in width the SVG will be created. You can optionally pass an object as a second argument representing options. These are:

| property | description |
| -------- | ----------- |
| `width`  | The initial width of the SVG. Defaults to width of parent |
| `height` | The initial height of the SVG. Defaults to the aspect ratio. |
| `aspect` | The aspect ratio of the SVG. Defaults to 0.618, approximately the [golden ratio](http://en.wikipedia.org/wiki/Golden_ratio) |
| `resize` | Info about how the SVG should scale. Current options are: 
 + `auto`: Set the `viewBox` to the initial width and height, thus scaling automatically according to the SVG specification |
| `onResize` | callback function to fire whenever the SVG resizes. This function will receive three arguments: the (new) width, height, and scale, which is (current width) / (original width) |

## A callback example

	var base = require("d3-base");

	var b = base("#container", {
		onResize: function(w, h, s) {
			console.log("Scale is " + s);
		}
	});
