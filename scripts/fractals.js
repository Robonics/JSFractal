let fractals = {
	"Burning Ship": function(sx, sy, max_iterations) {
		let zx = sx;
		let zy = sy;

		let iteration = 0;
		while (zx*zx + zy*zy < 4 && iteration < max_iterations) {
			var _x = zx*zx - zy*zy + sx 
			zy = Math.abs(2*zx*zy) + sy // abs returns the absolute value
			zx = _x
			iteration++
		}
		return iteration;
	},
	"Mandelbrot Set": function( sx, sy, max_iterations ) {
		let zx = 0;
		let zy = 0;

		let iteration = 0;
		while (zx*zx + zy*zy <= 4 && iteration < max_iterations) {
			var _x = zx*zx - zy*zy + sx;
			zy = 2*zx*zy + sy;
			zx = _x;
			iteration++;
		}

		return iteration;
	}
	,
	"Chirikov Map": function( sx, sy, max_iterations ) {
		let zx = sx;
		let zy = sy;

		let iteration = 0;
		while (zx*zx + zy*zy <= 4 && iteration < max_iterations) {
			zy = zy + sy * Math.sin( zx );
			zx = zx + sx * zy;
			iteration++;
		}

		return iteration;
	},
	"Circle n = 2": function( sx, sy, max_iterations ) {
		let zx = sx;
		let zy = sy;

		let iteration = 0;
		while (zx*zx + zy*zy <= 4 && iteration < max_iterations) {
			zy = Math.pow( zy, 2) + sy + Math.sin(zx);
			zx = zx + sx * Math.cos(zy);
			zx /= sx * 2
			iteration++;
		}
		return iteration;
	},
	"Circle n = 13": function( sx, sy, max_iterations ) {
		let zx = sx;
		let zy = sy;

		let iteration = 0;
		while (zx*zx + zy*zy <= 4 && iteration < max_iterations) {
			zy = Math.pow( zy, 2) + sy + Math.sin(zx);
			zx = zx + sx * Math.cos(zy);
			zx /= sx * 13
			iteration++;
		}
		return iteration;
	},
	"Circle^2": function( sx, sy, max_iterations ) {
		let zx = sx;
		let zy = sy;

		let iteration = 0;
		while (zx*zx + zy*zy <= 4 && iteration < max_iterations) {
			zy = Math.pow( zy, 2) + sy + Math.sin(zx);
			zx = zx + sx * Math.cos(zy);
			zx /= sx * sx
			iteration++;
		}
		return iteration;
	}
}

let offsets = { // Offsets are in grid units, not pixels
	"Burning Ship": { x: 0, y: 0 },
	"Mandelbrot Set": { x: 0.3, y: 0.45 },
	"Chirikov Map": { x: 0, y: 0 },
	"Circle n = 2": { x: 0, y: 0 },
	"Circle n = 13": { x: 0, y: 0 },
	"Circle^2": { x: 0, y: 0 }
}

export default { fractals, offsets };