// Setting Definition
// FIXME: Changing this values screw up the resolution
const MAGIC_X = 3.5;
const MAGIC_Y = 2;
let max_iteration = 100;
const escape_value = 1000; // The value at which point we give up on the render // TODO: Add as a render setting
// TODO: Organize Globals

let fractals = {
	"Burning Ship": function(sx, sy, max_iterations, should_calc_orbits ) { // FIXME: Optimize orbit calculation by not calculating it for points outside the set, as they will always go to infinity
		let zx = sx;
		let zy = sy;

		let iteration = 0;
		let prev_pts = [];
		while (zx*zx + zy*zy < escape_value && iteration < max_iterations) {
			var _x = zx*zx - zy*zy + sx 
			zy = Math.abs(2*zx*zy) + sy // abs returns the absolute value
			zx = _x
			iteration++
			if(should_calc_orbits)
				prev_pts.push(`(${zx},${zy})`);
		}
		return [iteration, prev_pts];
	},
	"Broken Burning Ship": function(sx, sy, max_iterations, should_calc_orbits ) { // FIXME: Optimize orbit calculation by not calculating it for points outside the set, as they will always go to infinity
		let zx = sy;
		let zy = sx;

		let iteration = 0;
		let prev_pts = [];
		while (zx*zx + zy*zy < escape_value && iteration < max_iterations) {
			var _x = zx*zx - zy*zy + sx 
			zy = Math.abs(2*zx*zy) + sy // abs returns the absolute value
			zx = _x
			iteration++
			if(should_calc_orbits)
				prev_pts.push(`(${zx},${zy})`);
		}
		return [iteration, prev_pts];
	},
	"Mandelbrot Set": function( sx, sy, max_iterations, should_calc_orbits ) { // TODO: Implement user controlled variables K
		let zx = 0;
		let zy = 0;

		let iteration = 0;
		let prev_pts = [];
		while (zx*zx + zy*zy <= escape_value && iteration < max_iterations) {
			var _x = zx*zx - zy*zy + sx;
			zy = 2*zx*zy + sy;
			zx = _x;
			iteration++;
			if(should_calc_orbits)
				prev_pts.push(`(${zx},${zy})`);
		}

		return [iteration, prev_pts];
	}
	,
	"Chirikov Map": function( sx, sy, max_iterations, should_calc_orbits ) {
		let zx = sx;
		let zy = sy;

		let iteration = 0;
		let prev_pts = [];
		while (zx*zx + zy*zy <= escape_value && iteration < max_iterations) {
			zy += sy * Math.sin( zx );
			zx += sx * zy;
			iteration++;
			if(should_calc_orbits)
				prev_pts.push(`(${zx},${zy})`);
		}

		return [iteration, prev_pts];
	},
	"Test": function( sx, sy, max_iterations, should_calc_orbits ) {
		let zx = 1;
		let zy = 1;

		let iteration = 0;
		let prev_pts = [];
		while( zx*zx + zy*zy <= escape_value && iteration < max_iterations ) {
			zy += sy * Math.sin( zx );
			zx += sx * zy;
			iteration++;
			if(should_calc_orbits)
				prev_pts.push(`(${zx},${zy})`);
		}

		return [iteration, prev_pts]
	}
}

let offsets = { // Offsets are in grid units, not pixels
	"Burning Ship": { x: 0, y: 0 },
	"Broken Burning Ship": { x: 0, y: 0 },
	"Mandelbrot Set": { x: 0.3, y: 0.45 },
	"Chirikov Map": { x: 0, y: 0 },
	"Test": { x: 0, y: 0 }
}

const canvas = document.querySelector('#main')
var ctx = canvas.getContext('2d')

const navcanv = document.querySelector("#nav")
var navctx = navcanv.getContext('2d')
const infinity_threshold = MAGIC_Y;

let resolution = 800;
let iteration_count = 800; // The number of points to render per frame
let aspect_ratio = MAGIC_X / MAGIC_Y; // X / Y for the Burning Ship fractal

navcanv.width *= aspect_ratio;

let resolution_x = resolution * aspect_ratio;
let resolution_y = resolution;

canvas.width = resolution_x;
canvas.height = resolution_y;

function hslToHex(h, s, l) {
	h = h % 360; // Make it loop around like a color wheel
	l /= 100;
	const a = s * Math.min(l, 1 - l) / 100;
	const f = n => {
		const k = (n + h / 30) % 12;
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
	};
	return `#${f(0)}${f(8)}${f(4)}`;
}

var rendered = 0;

let x = 0;
let y = 0;
let scale_factor_x = (MAGIC_X / resolution_x)
let translate_factor_x = -2.5

let scale_factor_y = (MAGIC_Y / resolution_y)
let translate_factor_y = -1.5;

let rendering = false;
let initial_rendering_time = new Date();
let __interval__;

let cached_result;
let last_render = new Image();
let hue_shift = 0;

// Fractal selector
let cur_fractal = "";
let dropdown = document.getElementById("fractals");
let i = 0;
for (var fractal in fractals) {
	var option = document.createElement("option");
	option.value = fractal;
	option.innerHTML = fractal;
	if(i == 0) {
		option.selected = true;
		cur_fractal = fractal;
	}
	dropdown.appendChild( option )
	i++;
}
dropdown.addEventListener("change", function() {
	cur_fractal = this.value;
	cached_result = null;
})

let calc_orbits = false;

function CalculateOrbits( pts, iteration ) {
	if(iteration >= max_iteration) {
		loop: for( var i1 = 0; i1 < pts.length; i1++ ) {
			for( var i2 = 0; i2 < i1; i2++) {
				if( pts[i1] == pts[i2] ) {
					return i1 - i2;
				}
			}
		}
	}
	return Infinity;
} 

function DoRender(tx, ty, z) {

	calc_orbits = document.getElementById("orbit").checked;

	hue_shift = document.getElementById("hue").value * 1;
	max_iteration = document.getElementById("itr2").value * 1;

	initial_rendering_time = new Date();

	rendering = true;
	x = 0;
	y = 0;
	rendered = 0;
	scale_factor_x = (MAGIC_X / resolution_x)
	translate_factor_x = -2.5

	scale_factor_y = (2 / resolution_y)
	translate_factor_y = -1.5;

	navctx.beginPath()
	navctx.fillStyle = "#000"
	navctx.fillRect(0, 0, navcanv.width, navcanv.height);
	if(cached_result) {
		if(cached_result.complete) {
			navctx.drawImage(cached_result, 0, 0, navcanv.width, navcanv.height);
		}
	}
	ctx.beginPath();
	navctx.strokeStyle = "#ffffff"
	navctx.lineWidth = 2
	navctx.rect((tx / MAGIC_X) * navcanv.width, (ty / MAGIC_Y) * navcanv.height, navcanv.width * z, navcanv.height * z)
	navctx.stroke();

	ctx.setTransform(1, 0, 0, 1, 0, 0);

	__interval__ = setInterval(function() {

		for(var i = 0; i < iteration_count; i++) {
			var sx = (x * scale_factor_x * z) + translate_factor_x + tx + offsets[cur_fractal].x;
			var sy = (y * scale_factor_y * z) + translate_factor_y + ty + offsets[cur_fractal].y;

			var results = fractals[cur_fractal](sx, sy, max_iteration, calc_orbits );
			let iteration = results[0];
			let pts = results[1];
			let orbit_period = Infinity;
			if(calc_orbits) {
				orbit_period = CalculateOrbits( pts, iteration );
			}

			ctx.beginPath()
			if( calc_orbits ) {
				if( iteration < max_iteration ) { // Outside the set
					ctx.fillStyle = hslToHex( 0, 0, 20 + (iteration / max_iteration) * 80);
				}else if( orbit_period >= max_iteration ) {
					ctx.fillStyle = "#000"
				}else {
					ctx.fillStyle = hslToHex(((orbit_period / 10) * 360) + hue_shift , 85, 60)
				}
			}else {
				if(iteration >= max_iteration) { // Belongs to the set
					ctx.fillStyle = "#000"
				}else {
					ctx.fillStyle = hslToHex(((iteration / max_iteration) * 360) + hue_shift , 85, 60)
				}
			}
			ctx.rect(x, y, 1, 1);
			ctx.fill();

			rendered++
			y++;
			if( y > resolution_y ) {
				y = 0;
				x++
			}
			if(x > resolution_x ) {
				window.clearInterval( __interval__ );
				rendering = false;
				var time = Date.now() - initial_rendering_time;
				console.log(`Rendered ${rendered} points in ${time / 1000} seconds`)

				if(!cached_result) {
					cached_result = new Image();
					cached_result.src = canvas.toDataURL('png');
				}
				last_render.src = canvas.toDataURL('png');
				last_render.scale = z;
				last_render.lx = tx;
				last_render.ly = ty;

				break;
			}
		}

	}, 0)
}

let res_slider = document.getElementById("resolution")
res_slider.value = resolution;
let itr_slider = document.getElementById("iteration")
itr_slider.value = iteration_count;
let render_button = document.getElementById("rerender")

let res_label_x = document.getElementById("resx")
res_label_x.innerHTML = resolution_x;
let res_label_y = document.getElementById("resy")
res_label_y.innerHTML = resolution_y;
let itr_label = document.getElementById("iter")
itr_label.innerHTML = iteration_count;

let xcoord = document.getElementById("x-coord")
let ycoord = document.getElementById("y-coord")
let zoom = document.getElementById("zoom")

res_slider.addEventListener("change", function() {
	if(rendering) {
		this.value = resolution;
	}else {
		resolution = this.value;
		resolution_x = resolution * aspect_ratio;
		resolution_y = resolution;

		res_label_x.innerHTML = resolution_x;
		res_label_y.innerHTML = resolution_y;

		canvas.width = resolution_x;
		canvas.height = resolution_y;
	}
});
itr_slider.addEventListener("change", function() {
	iteration_count = this.value;
	itr_label.innerHTML = iteration_count;
})

let pan_x = 0;
let pan_y = 0;
let scale = 1;

render_button.addEventListener("click", function() {
	if(rendering) { return; }
	DoRender(pan_x, pan_y, scale)
})
navcanv.addEventListener("mousedown", function() {this.mouse = true})
canvas.addEventListener("mousedown", function() { this.mouse = true})
window.addEventListener("mouseup", function() {navcanv.mouse = false; canvas.mouse = false;})
navcanv.addEventListener("mousemove", function(e) {
	if(this.mouse) {
		if(rendering) { return; }
		if(this.last_drag) {
			var dx = e.screenX - this.last_drag.screenX
			var dy = e.screenY - this.last_drag.screenY
			
			pan_x += dx * (MAGIC_X / navcanv.width)
			pan_y += dy * (MAGIC_Y / navcanv.height)

			if(last_render.complete) {

				var lx = last_render.lx * ( canvas.width / scale / MAGIC_X ); // The x offset of the last render we did, in pixels
				var ly = last_render.ly * ( canvas.height / scale / MAGIC_Y ); // The y offset of the last render, in pixels

				var tx = pan_x * ( canvas.width / scale / MAGIC_X ); // The current preview offset, in pixels
				var ty = pan_y * ( canvas.height / scale / MAGIC_Y );

				var ndx = lx - tx; // The offset of the preview image
				var ndy = ly - ty;

				ctx.fillStyle = "#000"
				ctx.fillRect(0,0,canvas.width,canvas.height);
				ctx.drawImage( last_render, ndx, ndy, canvas.width * (last_render.scale / scale), canvas.height * (last_render.scale / scale) )
			}

			navctx.beginPath()
			navctx.fillStyle = "#000"
			navctx.fillRect(0, 0, navcanv.width, navcanv.height);
			if(cached_result) {
				if(cached_result.complete) {
					navctx.drawImage(cached_result, 0, 0, navcanv.width, navcanv.height);
				}
			}
			ctx.beginPath();
			navctx.strokeStyle = "#ffffff"
			navctx.lineWidth = 2
			navctx.rect((pan_x / MAGIC_X) * navcanv.width, (pan_y / MAGIC_Y) * navcanv.height, navcanv.width * scale, navcanv.height * scale)
			navctx.stroke();

			xcoord.value = pan_x;
			ycoord.value = pan_y;
			zoom.innerText = scale;
		}

		this.last_drag = e;
	}else {
		this.last_drag = null;
	}
});
navcanv.addEventListener("wheel", function(e) {
	if(rendering) { return; }
	let _scale = scale; // old scale for calculations
	scale += ( ( e.deltaY * scale ) / 250 ) // The zoom rate gets slower as scale gets smaller
	scale = Math.max(0, Math.min(5, scale)); // Clamp range to 0-5

	pan_x += (((navcanv.width * _scale) - (navcanv.width * scale)) / 2) * (MAGIC_X / navcanv.width);
	pan_y += (((navcanv.height * _scale) - (navcanv.height * scale)) / 2) * (MAGIC_Y / navcanv.height);

	if(last_render.complete) {

		var lx = last_render.lx * ( canvas.width / scale / MAGIC_X ); // The x offset of the last render we did, in pixels
		var ly = last_render.ly * ( canvas.height / scale / MAGIC_Y ); // The y offset of the last render, in pixels

		var tx = pan_x * ( canvas.width / scale / MAGIC_X ); // The current preview offset, in pixels
		var ty = pan_y * ( canvas.height / scale / MAGIC_Y );

		var dx = lx - tx; // The offset of the preview image
		var dy = ly - ty;

		ctx.fillStyle = "#000"
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.drawImage( last_render, dx, dy, canvas.width * (last_render.scale / scale), canvas.height * (last_render.scale / scale) ) // TODO: Fix zoom
	}

	navctx.beginPath()
	navctx.fillStyle = "#000"
	navctx.fillRect(0, 0, navcanv.width, navcanv.height);
	if(cached_result) {
		if(cached_result.complete) {
			navctx.drawImage(cached_result, 0, 0, navcanv.width, navcanv.height);
		}
	}
	ctx.beginPath();
	navctx.strokeStyle = "#ffffff"
	navctx.lineWidth = 2
	navctx.rect((pan_x / MAGIC_X) * navcanv.width, (pan_y / 2) * navcanv.height, navcanv.width * scale, navcanv.height * scale)
	navctx.stroke();

	xcoord.value = pan_x;
	ycoord.value = pan_y;
	zoom.innerText = scale;
})

canvas.addEventListener("mousemove", function(e) {
	if(this.mouse) {
		if(rendering) { return; }
		if(this.last_drag) {
			var dx = e.screenX - this.last_drag.screenX
			var dy = e.screenY - this.last_drag.screenY
			
			pan_x -= dx * (MAGIC_X / canvas.width) * scale * 2
			pan_y -= dy * (MAGIC_Y / canvas.height) * scale * 2

			if(last_render.complete) {

				var lx = last_render.lx * ( canvas.width / scale / MAGIC_X ); // The x offset of the last render we did, in pixels
				var ly = last_render.ly * ( canvas.height / scale / MAGIC_Y ); // The y offset of the last render, in pixels

				var tx = pan_x * ( canvas.width / scale / MAGIC_X ); // The current preview offset, in pixels
				var ty = pan_y * ( canvas.height / scale / MAGIC_Y );

				var ndx = lx - tx; // The offset of the preview image
				var ndy = ly - ty;

				ctx.fillStyle = "#000"
				ctx.fillRect(0,0,canvas.width,canvas.height);
				ctx.drawImage( last_render, ndx, ndy, canvas.width * (last_render.scale / scale), canvas.height * (last_render.scale / scale) )
			}

			navctx.beginPath()
			navctx.fillStyle = "#000"
			navctx.fillRect(0, 0, navcanv.width, navcanv.height);
			if(cached_result) {
				if(cached_result.complete) {
					navctx.drawImage(cached_result, 0, 0, navcanv.width, navcanv.height);
				}
			}
			ctx.beginPath();
			navctx.strokeStyle = "#ffffff"
			navctx.lineWidth = 2
			navctx.rect((pan_x / MAGIC_X) * navcanv.width, (pan_y / MAGIC_Y) * navcanv.height, navcanv.width * scale, navcanv.height * scale)
			navctx.stroke();

			xcoord.value = pan_x;
			ycoord.value = pan_y;
			zoom.innerText = scale;
		}

		this.last_drag = e;
	}else {
		this.last_drag = null;
	}
});
canvas.addEventListener("wheel", function(e) {
	if(rendering) { return; }
	let _scale = scale; // old scale for calculations
	scale += ( ( e.deltaY * scale ) / 250 ) // The zoom rate gets slower as scale gets smaller
	scale = Math.max(0, Math.min(5, scale)); // Clamp range to 0-5

	pan_x += (((canvas.width * _scale) - (canvas.width * scale)) / 2) * (MAGIC_X / canvas.width);
	pan_y += (((canvas.height * _scale) - (canvas.height * scale)) / 2) * (MAGIC_Y / canvas.height);

	if(last_render.complete) {

		var lx = last_render.lx * ( canvas.width / scale / MAGIC_X ); // The x offset of the last render we did, in pixels
		var ly = last_render.ly * ( canvas.height / scale / MAGIC_Y ); // The y offset of the last render, in pixels

		var tx = pan_x * ( canvas.width / scale / MAGIC_X ); // The current preview offset, in pixels
		var ty = pan_y * ( canvas.height / scale / MAGIC_Y );

		var dx = lx - tx; // The offset of the preview image
		var dy = ly - ty;

		ctx.fillStyle = "#000"
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.drawImage( last_render, dx, dy, canvas.width * (last_render.scale / scale), canvas.height * (last_render.scale / scale) ) // TODO: Fix zoom
	}

	navctx.beginPath()
	navctx.fillStyle = "#000"
	navctx.fillRect(0, 0, navcanv.width, navcanv.height);
	if(cached_result) {
		if(cached_result.complete) {
			navctx.drawImage(cached_result, 0, 0, navcanv.width, navcanv.height);
		}
	}
	ctx.beginPath();
	navctx.strokeStyle = "#ffffff"
	navctx.lineWidth = 2
	navctx.rect((pan_x / MAGIC_X) * navcanv.width, (pan_y / 2) * navcanv.height, navcanv.width * scale, navcanv.height * scale)
	navctx.stroke();

	xcoord.value = pan_x;
	ycoord.value = pan_y;
	zoom.innerText = scale;
})

// FIXME: Update so that it uses the middle of the view instead of the top left
xcoord.addEventListener("change", function() {
	if(rendering) { this.value = pan_x; }
	pan_x = parseFloat(this.value)

	if(last_render.complete) {

		var lx = last_render.lx * ( canvas.width / scale / MAGIC_X ); // The x offset of the last render we did, in pixels
		var ly = last_render.ly * ( canvas.height / scale / MAGIC_Y ); // The y offset of the last render, in pixels

		var tx = pan_x * ( canvas.width / scale / MAGIC_X ); // The current preview offset, in pixels
		var ty = pan_y * ( canvas.height / scale / MAGIC_Y );

		var ndx = lx - tx; // The offset of the preview image
		var ndy = ly - ty;

		ctx.fillStyle = "#000"
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.drawImage( last_render, ndx, ndy, canvas.width * (last_render.scale / scale), canvas.height * (last_render.scale / scale) )
	}

	navctx.beginPath()
	navctx.fillStyle = "#000"
	navctx.fillRect(0, 0, navcanv.width, navcanv.height);
	if(cached_result) {
		if(cached_result.complete) {
			navctx.drawImage(cached_result, 0, 0, navcanv.width, navcanv.height);
		}
	}
	ctx.beginPath();
	navctx.strokeStyle = "#ffffff"
	navctx.lineWidth = 2
	navctx.rect((pan_x / MAGIC_X) * navcanv.width, (pan_y / MAGIC_Y) * navcanv.height, navcanv.width * scale, navcanv.height * scale)
	navctx.stroke();
})
ycoord.addEventListener("change", function() {
	if(rendering) { this.value = pan_y; }
	pan_y = parseFloat(this.value)

	if(last_render.complete) {

		var lx = last_render.lx * ( canvas.width / scale / MAGIC_X ); // The x offset of the last render we did, in pixels
		var ly = last_render.ly * ( canvas.height / scale / MAGIC_Y ); // The y offset of the last render, in pixels

		var tx = pan_x * ( canvas.width / scale / MAGIC_X ); // The current preview offset, in pixels
		var ty = pan_y * ( canvas.height / scale / MAGIC_Y );

		var ndx = lx - tx; // The offset of the preview image
		var ndy = ly - ty;

		ctx.fillStyle = "#000"
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.drawImage( last_render, ndx, ndy, canvas.width * (last_render.scale / scale), canvas.height * (last_render.scale / scale) )
	}

	navctx.beginPath()
	navctx.fillStyle = "#000"
	navctx.fillRect(0, 0, navcanv.width, navcanv.height);
	if(cached_result) {
		if(cached_result.complete) {
			navctx.drawImage(cached_result, 0, 0, navcanv.width, navcanv.height);
		}
	}
	ctx.beginPath();
	navctx.strokeStyle = "#ffffff"
	navctx.lineWidth = 2
	navctx.rect((pan_x / MAGIC_X) * navcanv.width, (pan_y / MAGIC_Y) * navcanv.height, navcanv.width * scale, navcanv.height * scale)
	navctx.stroke();
})

document.getElementById("reset").onclick = function() {
	pan_x = 0;
	pan_y = 0;
	scale = 1;

	if(last_render.complete) {

		var lx = last_render.lx * ( canvas.width / scale / MAGIC_X ); // The x offset of the last render we did, in pixels
		var ly = last_render.ly * ( canvas.height / scale / MAGIC_Y ); // The y offset of the last render, in pixels

		var tx = pan_x * ( canvas.width / scale / MAGIC_X ); // The current preview offset, in pixels
		var ty = pan_y * ( canvas.height / scale / MAGIC_Y );

		var ndx = lx - tx; // The offset of the preview image
		var ndy = ly - ty;

		ctx.fillStyle = "#000"
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.drawImage( last_render, ndx, ndy, canvas.width * (last_render.scale / scale), canvas.height * (last_render.scale / scale) )
	}

	navctx.beginPath()
	navctx.fillStyle = "#000"
	navctx.fillRect(0, 0, navcanv.width, navcanv.height);
	if(cached_result) {
		if(cached_result.complete) {
			navctx.drawImage(cached_result, 0, 0, navcanv.width, navcanv.height);
		}
	}
	ctx.beginPath();
	navctx.strokeStyle = "#ffffff"
	navctx.lineWidth = 2
	navctx.rect((pan_x / MAGIC_X) * navcanv.width, (pan_y / MAGIC_Y) * navcanv.height, navcanv.width * scale, navcanv.height * scale)
	navctx.stroke();

	xcoord.value = 0;
	ycoord.value = 0;
	zoom.innerText = 1;
}

DoRender(0, 0, 1);