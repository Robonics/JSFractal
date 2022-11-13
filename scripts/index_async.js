// Setting Definition
// FIXME: Changing this values screw up the resolution
const MAGIC_X = 3.5;
const MAGIC_Y = 2;
let max_iteration = 100;
const calc_fancy_render = true;
const escape_value = 1000; // The value at which point we give up on the render // TODO: Add as a render setting
// TODO: Organize Globals

class ComplexNumber {
	a;
	b;
	constructor(a, b) {
		if(typeof a != 'number' || typeof b != "number") {
			throw new TypeError("Parameters must be a number")
		}
		this.a = a;
		this.b = b;
	}
	add(  ) { // a + bi + c + di = a + c + bi + di
		let z = new ComplexNumber(this.a, this.b);
		for( var i = 0; i < arguments.length; i++ ) {
			if(arguments[i] instanceof ComplexNumber) {
				z.a += arguments[i].a;
				z.b += arguments[i].b;
			}else if( typeof arguments[i] == "number" ) {
				z.a += arguments[i]
			}else throw new TypeError("Type of argument " + i + " must either be a real or complex number")
		}
		return z;
	}
	multiply(  ) {
		let z = new ComplexNumber( this.a, this.b );
		for( var i = 0; i < arguments.length; i++ ) {
			if( arguments[i] instanceof ComplexNumber ) {
				var _a = z.a * arguments[i].a - z.b * arguments[i].b;
				z.b = (z.a * arguments[i].b + z.b * arguments[i].a)
				z.a = _a;
			}else if( typeof arguments[i] == "number" ) {
				z.a *= arguments[i];
				z.b *= arguments[i];
			}else throw new TypeError("Type of argument " + i + " must be a real or complex number")
		}
		return z;
	}
	divide( c ) {
		let z = new ComplexNumber(this.a, this.b);
		if( !(c instanceof ComplexNumber)) { throw new TypeError("Argument must be complex number") }

		z.a = ( this.a * c.a + this.b * c.b ) / ( c.a*c.a + c.b*c.b )
		z.b = ( this.b*c.a - this.a*c.b ) / ( c.a*c.a + c.b*c.b )

		return z;
	}
	pow( n ) {
		let z = new ComplexNumber( this.a, this.b )
		if( typeof n == "number" ) {
			// Complex number to power of real number
			if(n == 0) return new ComplexNumber(1, 0)
			let _z = [];
			for( var i = 0; i < n-1; i++ ) {
				_z.push( z );
			}
			z = z.multiply( ..._z )
		}else throw new TypeError( "Argument must be of type Number" );
		return z;
	}
	sin() {
		let z = new ComplexNumber( 0, 0 );
		z.a = Math.sin( this.a ) * Math.cosh( this.b )
		z.b = Math.cos( this.a ) * Math.sinh( this.b )
		return z
	}
	m() { return this.multiply(-1) } // Negative
}

let inits = {
	"Burning Ship": function( sx, sy ) { return [ sx, sy ];},
	"Broken Burning Ship": function( sx, sy ) { return [ sy, sx ];},
	"Mandelbrot Set": function( sx, sy ) { return [ 0, 0 ];},
	"Chirikov Map": function( sx, sy ) { return [ sx, sy ];},
	"Henon": function( sx, sy ) { return [ sx, sy ];},
	"Tricorn": function( sx, sy ) { return [ sx, sy ];},
	"Mandelbox": function( sx, sy ) { return [ sx, sy ];},
	"Bogdanov Map": function( sx, sy ) { return [ sx, sy ];}
}
let fractals = {
	"Burning Ship": function(sx, sy, zx, zy, para ) {
			var _x = zx*zx - zy*zy + sx 
			zy = Math.abs(2*zx*zy) + sy
			zx = _x
			return [zx, zy];
	},
	"Broken Burning Ship": function(sx, sy, zx, zy, para ) {
		var _x = zx*zx - zy*zy + sx 
		zy = Math.abs(2*zx*zy) + sy
		zx = _x
		return [zx, zy];
	},
	"Mandelbrot Set": function( sx, sy, zx, zy, para ) {
		let d = para["d"]
		var _x = Math.pow(zx*zx+zy*zy, d/2) * Math.cos(d * Math.atan2(zy, zx)) + sx
		zy = Math.pow(zx*zx+zy*zy, d/2) * Math.sin(d * Math.atan2(zy, zx)) + sy
		zx = _x 
		return [zx, zy];

		// While this is simpler to understand, it is less efficient
		// let z = new ComplexNumber( zx, zy );
		// let c = new ComplexNumber( sx, sy );

		// z = z.pow(d).add(c)

		// return [zx, zy];
	},
	"Chirikov Map": function( sx, sy, zx, zy, arg ) {
		zy += sy * Math.sin( zx ) * arg["K"];
		zx += sx * zy;
		return [zx,zy]
	},
	"Henon": function( sx, sy, zx, zy, para ) {
		var _x = 1 - sx*zx*zx + zy;
		zy = sy * zx;
		zx = _x;
		return [zx, zy]
	},
	"Tricorn": function( sx, sy, zx, zy, para ) {
		var _x = zx*zx - zy*zy + sx
		zy = -2*zx*zy + sy
		zx = _x
		return [zx, zy]
	},
	"Mandelbox": function( sx, sy, zx, zy, para ) {

		const K = para["K"];
		// X
		if(zx > 1) {
			zx = 2 - zx
		}else if(zx < -1) {
			zx = -2 - zx
		}
		// Y
		if(zy > 1) {
			zy = 2 - zy
		}else if(zy < -1) {
			zy = -2 - zy
		}

		// Calculate Magnitude
		var mag = Math.sqrt( zx*zx + zy*zy )
		if( mag < 0.5 ) {
			zx *= 4;
			zy *= 4;
		}else if(mag < 1) {
			zx /= mag * mag;
			zy /= mag * mag;
		}

		zx = K * zx + sx;
		zy = K * zy + sy;

		return [ zx, zy ]
	},
	"Bogdanov Map": function( sx, sy, zx, zy, para ) {

		let epsilon = para["ε"];
		let kappa = para["k"];
		let mu = para["μ"];

		zy = zy + (epsilon * zy) + (kappa * zx) * (zx - 1) + ( mu * zx * zy );
		zx = zx + zy

		return [zx, zy]
	}
}

let offsets = { // Offsets are in grid units, not pixels
	"Burning Ship": { x: 0, y: 0, s: 1 },
	"Broken Burning Ship": { x: 0, y: 0, s: 1 },
	"Mandelbrot Set": { x: 0.3, y: 0.45, s: 1.1 },
	"Chirikov Map": { x: -7.125, y: -3.75, s: 5 },
	"Henon": { x: 0, y: 0, s: 1.5 },
	"Tricorn": { x: 0, y: 0, s: 1.2 },
	"Mandelbox": { x: -6.6, y: -3.3, s: 5 },
	"Bogdanov Map": { x: 1, y: 0.5, s: 1 }
}

let parameters = {
	"Mandelbrot Set": {
		"d": 2
	},
	"Chirikov Map": {
		"K": 1
	},
	"Mandelbox": {
		"K": 2.5
	},
	"Bogdanov Map": {
		ε: 0,
		k: 1.2,
		μ: 0
	}
}

const canvas = document.querySelector('#main')
var ctx = canvas.getContext('2d')

let resolution = 800;
let iteration_count = 800; // The number of points to render per frame
let aspect_ratio = MAGIC_X / MAGIC_Y; // X / Y for the Burning Ship fractal

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
let render_mode = 0;

// TODO: Remove
let ox = 0;
let oy = 0;

let active_parameters = [];

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
	if( rendering ) {
		window.clearInterval(__interval__);
		rendering = false;
	}
	cur_fractal = this.value;
	cached_result = null;
	pan_x = 0;
	pan_y = 0;
	scale = offsets[cur_fractal].s;
	julia_render = false;

	// Setup parameter UI
	var el = document.getElementById("parameters");
	el.innerHTML = "";

	if(!parameters[cur_fractal]) return;

	for( var parameter in parameters[cur_fractal] ) {
		var l = document.createElement("label")
		var i = document.createElement("input")
		l.innerText = parameter + ": ";
		l.htmlFor = parameter;
		i.type = "number";
		i.name = parameter;
		i.value = parameters[cur_fractal][parameter];

		active_parameters.push(i);

		el.appendChild(l);
		el.appendChild(i);
	}
})

// Julia render variables
/**
 * Should we render a julia set
 * @global
*/
let julia_render = false;
/**
 * The real part of the constant C
 * @global
*/ 
let Cx = 0;
/**
 * The imaginary part of the constant C
 * @global
*/
let Cy = 0;

let time_span = document.getElementById("timer")

function DoRender(tx, ty, z) {

	render_button.style.removeProperty("--sub-color");

	hue_shift = document.getElementById("hue").value * 1;
	max_iteration = document.getElementById("itr2").value * 1;
	render_mode = document.getElementById("render-mode").value * 1;

	ox = document.getElementById("ox").value * 1;
	oy = document.getElementById("oy").value * -1;

	initial_rendering_time = new Date();

	rendering = true;
	x = 0;
	y = 0;
	rendered = 0;
	scale_factor_x = (MAGIC_X / resolution_x)
	translate_factor_x = -2.5

	scale_factor_y = (2 / resolution_y)
	translate_factor_y = -1.5;

	ctx.setTransform(1, 0, 0, 1, 0, 0);

	__interval__ = setInterval(function() {
		var time = Date.now() - initial_rendering_time;
		render_button.style.setProperty("--sub-width", `${(x / resolution_x) * 100}%`)
		time_span.innerText = `${(time / 1000).toFixed(2)}s elapsed`
		for(var i = 0; i < iteration_count; i++) {
			var sx = (x * scale_factor_x * z) + translate_factor_x + tx + offsets[cur_fractal].x;
			var sy = (y * scale_factor_y * z) + translate_factor_y + ty + offsets[cur_fractal].y;

			let arg = {};
			active_parameters.forEach( para => {
				arg[para.name] = parseFloat(para.value);
			})

			let init = inits[cur_fractal](sx, sy);
			let zx;
			let zy;
			if( julia_render ) {
				zx = sx;
				zy = sy;
			}else {
				zx = init[0];
				zy = init[1];
			}

			let iteration = 0;
			let min_distance = 1e15;
			let min_axis = 1e15;

			while (zx*zx + zy*zy < escape_value && iteration < max_iteration) {
				let results;
				if( julia_render ) {
					results = fractals[cur_fractal]( Cx, Cy, zx, zy, arg );
				}else {
					results = fractals[cur_fractal]( sx, sy, zx, zy, arg );
				}
				zx = results[0];
				zy = results[1];

				iteration++
				if(calc_fancy_render)
					min_distance = Math.min(min_distance, Math.sqrt( Math.pow(ox - zx, 2) + Math.pow(oy - zy, 2) ) );
					min_axis = Math.min(min_axis, Math.min( Math.abs(zx + ox), Math.abs(zy + oy)  )); // Implementation of pickover stalk
			}

			ctx.beginPath()
			switch( render_mode ) {
				case 1: // Orbit Render, point
					if( iteration < max_iteration ) { // Outside the set
						ctx.fillStyle = hslToHex( 0, 0, 20 + (iteration / max_iteration) * 80);
					}else if( min_distance >= max_iteration ) {
						ctx.fillStyle = "#000"
					}else {
						ctx.fillStyle = hslToHex(((min_distance * 2) * 360) + hue_shift , 85, 60)
					}
					break;
				case 2: // Orbit Render, Axis
					if(iteration < max_iteration) {
						ctx.fillStyle = hslToHex( hue_shift + 180, 90, (min_axis) * 100 )
					}else {
						ctx.fillStyle = hslToHex( hue_shift, 90, (min_axis) * 100 )
					}
					break;
				case 3: // Orbit Render, all points
					if( iteration < max_iteration ) {
						ctx.fillStyle = hslToHex(((min_distance * 2) * 360) + hue_shift , 75, 70)
					}else {
						ctx.fillStyle = hslToHex(((min_distance * 2) * 360) + hue_shift , 85, 60)
					}
					break;
				default:
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
				time_span.innerText = `Done in ${(time / 1000).toFixed(2)}s`
				render_button.style.setProperty("--sub-color", "rgb(78, 225, 149)");

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

function rerenderCanvas() {
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
}

function drawOrbitPath(e) {
	if(rendering) return;
	rerenderCanvas();
	// Computer cx, cy, which are pixel coordinates on the canvas rendering space
	var rect = e.target.getBoundingClientRect();
	var style = canvas.currentStyle || window.getComputedStyle(canvas)
	var cx = e.clientX - rect.left - parseFloat(style.borderLeftWidth) - parseFloat(style.paddingLeft); //x position within the element.
	var cy = e.clientY - rect.top - parseFloat(style.borderTopWidth) - parseFloat(style.paddingTop);  //y position within the element.

	var true_width = rect.right - rect.left - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth) - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
	var true_height = rect.bottom - rect.top - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth) - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)

	// Convert cx, cy to gx, gy which are grid points in the complex plane
	let scfx = (MAGIC_X / true_width);
	let scfy = (MAGIC_Y / true_height) ;
	var gx = (cx * scfx * scale) + translate_factor_x + pan_x + offsets[cur_fractal].x;
	var gy = (cy * scfy * scale) + translate_factor_y + pan_y + offsets[cur_fractal].y;

	let init = inits[cur_fractal]( gx, gy );
	let zx;
	let zy;
	if(julia_render) {
		zx = gx;
		zy = gy;
	}else {
		zx = init[0];
		zy = init[1];
	}

	let arg = {};
	active_parameters.forEach( para => {
		arg[para.name] = parseFloat(para.value);
	})

	if( ox != 0 || oy != 0 ) {
		ctx.beginPath();
		ctx.fillStyle = "#ffffff"
		var x0 = ( ox - translate_factor_x - pan_x - offsets[cur_fractal].x ) / ( (MAGIC_X / canvas.width) * scale )
		var y0 = ( oy - translate_factor_y - pan_y - offsets[cur_fractal].y) / ( (MAGIC_Y / canvas.height) * scale )
		ctx.arc(x0, y0, 3, 0, 2 * Math.PI); 
		ctx.fill();
		ctx.strokeStyle = "#ffffff"
		ctx.moveTo( x0 - 500, y0 );
		ctx.lineTo( x0 + 500, y0 );
		ctx.moveTo( x0, y0 - 500 );
		ctx.lineTo( x0, y0 + 500 );
		ctx.stroke()
		ctx.font = "italic 30px serif"
		if(oy != 0) ctx.fillText( "y = " + oy.toFixed(3), Math.max(x0 - 500, 0), y0 - 2 )
		if(ox != 0) ctx.fillText( "x = " + ox.toFixed(3), x0 + 2, Math.max(y0 - 485, 15) )
	}

	ctx.beginPath();
	ctx.fillStyle = "#ffffff"
	var x0 = ( -translate_factor_x - pan_x - offsets[cur_fractal].x ) / ( (MAGIC_X / canvas.width) * scale )
	var y0 = (-translate_factor_y - pan_y - offsets[cur_fractal].y) / ( (MAGIC_Y / canvas.height) * scale )
	ctx.arc(x0, y0, 3, 0, 2 * Math.PI); 
	ctx.fill();
	ctx.strokeStyle = "#ffffff"
	ctx.moveTo( x0 - 500, y0 );
	ctx.lineTo( x0 + 500, y0 );
	ctx.moveTo( x0, y0 - 500 );
	ctx.lineTo( x0, y0 + 500 );
	ctx.stroke()
	ctx.font = "italic 30px serif"
	ctx.fillText( 'x', Math.max(x0 - 500, 0), y0 - 2 )
	ctx.fillText( 'y', x0 - 15, Math.max(y0 - 485, 15) )

	ctx.beginPath();
	ctx.strokeStyle = "#ffffff"
	ctx.moveTo( (gx - translate_factor_x - pan_x - offsets[cur_fractal].x) / ( (MAGIC_X / canvas.width) * scale ) , (gy - translate_factor_y - pan_y - offsets[cur_fractal].y) / ( (MAGIC_Y / canvas.height) * scale ) )
	let min_dist = 1e15;
	let min_x = 1e15;
	let min_y = 1e15;
	for(var i = 0; i < max_iteration; i++) {
		let result;
		if( julia_render ) {
			result = fractals[cur_fractal]( Cx, Cy, zx, zy, arg );
		}else {
			result = fractals[cur_fractal]( gx, gy, zx, zy, arg );
		}
		zx = result[0];
		zy = result[1];
		if( zx*zx + zy*zy >= escape_value ) break;
		ctx.lineTo( (zx - translate_factor_x - pan_x - offsets[cur_fractal].x) / ( (MAGIC_X / canvas.width) * scale ) , (zy - translate_factor_y - pan_y - offsets[cur_fractal].y) / ( (MAGIC_Y / canvas.height) * scale ) )

		let dist = Math.sqrt( Math.pow(ox - zx, 2) + Math.pow(oy - zy, 2) );
		if( dist < min_dist ) {
			min_dist = dist;
			min_x = zx;
			min_y = zy;
		}
	}
	ctx.stroke();

	var px = ( min_x - translate_factor_x - pan_x - offsets[cur_fractal].x ) / ( (MAGIC_X / canvas.width) * scale )
	var py = ( min_y - translate_factor_y - pan_y - offsets[cur_fractal].y) / ( (MAGIC_Y / canvas.height) * scale )

	ctx.beginPath()
	ctx.fillStyle = "#ff0000"
	ctx.strokeStyle = "#ffffff"
	ctx.arc( px, py, 3, 0, 2 * Math.PI );
	ctx.fill()
	ctx.stroke()
	ctx.beginPath()
	ctx.strokeStyle = "#ffffff"
	ctx.moveTo( px, py );
	ctx.lineTo( ( ox - translate_factor_x - pan_x - offsets[cur_fractal].x ) / ( (MAGIC_X / canvas.width) * scale ), ( oy - translate_factor_y - pan_y - offsets[cur_fractal].y) / ( (MAGIC_Y / canvas.height) * scale ) );
	ctx.stroke();
}
function juliaHelpText(e) {
	if(rendering) return;
	rerenderCanvas();
	// Computer cx, cy, which are pixel coordinates on the canvas rendering space
	var rect = canvas.getBoundingClientRect();
	var style = canvas.currentStyle || window.getComputedStyle(canvas)
	var cx = e.clientX - rect.left - parseFloat(style.borderLeftWidth) - parseFloat(style.paddingLeft); //x position within the element.
	var cy = e.clientY - rect.top - parseFloat(style.borderTopWidth) - parseFloat(style.paddingTop);  //y position within the element.

	var true_width = rect.right - rect.left - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth) - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
	var true_height = rect.bottom - rect.top - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth) - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)

	// Convert cx, cy to gx, gy which are grid points in the complex plane
	let scfx = (MAGIC_X / true_width);
	let scfy = (MAGIC_Y / true_height) ;
	var gx = (cx * scfx * scale) + translate_factor_x + pan_x + offsets[cur_fractal].x;
	var gy = -((cy * scfy * scale) + translate_factor_y + pan_y + offsets[cur_fractal].y);

	let px = (gx - translate_factor_x - pan_x - offsets[cur_fractal].x) / ( (MAGIC_X / canvas.width) * scale );
	let py = ((-gy - translate_factor_y - pan_y - offsets[cur_fractal].y) / ( (MAGIC_Y / canvas.height) * scale ));

	ctx.beginPath()
	ctx.fillStyle = "#ffffff"
	ctx.font = "20px sans-serif"
	ctx.fillText( `Release to Draw Julia For`, px, py - 20 )
	ctx.fillText( `(${gx.toFixed(7)}, ${gy.toFixed(7)})`, px, py )

	return { x: gx, y: -gy }
}

render_button.addEventListener("click", function() {
	if(rendering) { return; }
	DoRender(pan_x, pan_y, scale)
})
canvas.addEventListener("mousedown", function( e ) {
	if(e.button == 0) { 
		this.mouse = true;
	}else if(e.button == 1) {
		drawOrbitPath(e);
		this.mouse_middle = true
	}
})
window.addEventListener("mouseup", function( e ) {
	if(e.button == 0) {
		canvas.mouse = false;
	}else if(e.button == 1) {
		canvas.mouse_middle = false;
	}
})
window.addEventListener("keydown", function(e) {
	if(e.code == "KeyJ" && !canvas.keyj) {
		canvas.keyj = true;
		if(canvas.cx != undefined && canvas.cy != undefined && !rendering && !julia_render) {
			e.clientX = canvas.cx;
			e.clientY = canvas.cy;
			rerenderCanvas();
			this.proposed_julia = juliaHelpText(e)
		}
	}
})
window.addEventListener("keyup", function(e) {
	if(e.code == "KeyJ") {
		canvas.keyj = false;
		if(!rendering)
			if( !julia_render && this.proposed_julia != undefined ) {
				julia_render = true;
				Cx = this.proposed_julia.x
				Cy = this.proposed_julia.y

				pan_x = 0;
				pan_y = 0;
				scale = offsets[cur_fractal].s;

				DoRender( pan_x, pan_y, scale );
			}else if( julia_render ) {
				julia_render = false;

				pan_x = 0;
				pan_y = 0;
				scale = offsets[cur_fractal].s;

				DoRender( pan_x, pan_y, scale );
			}else {
				rerenderCanvas();
			}
	}
})

canvas.addEventListener("mousemove", function(e) {
	if(this.mouse) {
		if(rendering) { return; }
		if(this.last_drag) {
			var dx = e.screenX - this.last_drag.screenX
			var dy = e.screenY - this.last_drag.screenY
			
			pan_x -= dx * (MAGIC_X / canvas.width) * scale * 2
			pan_y -= dy * (MAGIC_Y / canvas.height) * scale * 2

			rerenderCanvas();
		}

		this.last_drag = e;
	}else {
		this.last_drag = null;
	}
	if( this.mouse_middle && !this.mouse ) {
		drawOrbitPath( e );
	}else if(this.keyj && !this.mouse && !julia_render) {
		window.proposed_julia = juliaHelpText( e );
	}
	this.cx = e.clientX;
	this.cy = e.clientY;
});
canvas.addEventListener("wheel", function(e) {
	if(rendering) { return; }
	let _scale = scale; // old scale for calculations
	scale += ( ( e.deltaY * scale ) / 250 ) // The zoom rate gets slower as scale gets smaller
	scale = Math.max(0, Math.min(5, scale)); // Clamp range to 0-5

	pan_x += (((canvas.width * _scale) - (canvas.width * scale)) / 2) * (MAGIC_X / canvas.width);
	pan_y += (((canvas.height * _scale) - (canvas.height * scale)) / 2) * (MAGIC_Y / canvas.height);

	rerenderCanvas();

	e.preventDefault();
})

DoRender(0, 0, 1);