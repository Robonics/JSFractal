const canvas = document.getElementById("main");
/**
 * @type CanvasRenderingContext2D
 */
const ctx = canvas.getContext('2d');

CanvasRenderingContext2D.prototype.clear = function( hex="#000000" ) {
	this.beginPath();
	this.fillStyle=hex;
	this.fillRect(0, 0, this.canvas.width, this.canvas.height);
}

canvas.width = 1600;
canvas.height = 900;

const SCALE_MIN = 0.001;
const SCALE_MAX = 45;
const SCROLL_COEFF = 85;

let pan_x = canvas.width/2;
let pan_y = canvas.height/2;
let scale = 10;
let renderMode = "primeHighlight";
let size = 4;
let drawGrid = false;
let modN = null;
let modC = 0;
let shouldShowNumbers = false;
let shouldDrawCoords = false;

let doZoom = false;
let zoom_target = 0.01; // Safer value than SCALE_MIN

function isPrime(n) {
	// Corner cases
    if(n <= 1) return false;
    if(n <= 3) return true;

    // This is checked so that we can skip
    // middle five numbers in below loop
    if(n % 2 == 0 || n % 3 == 0) return false;

    for(i = 5; i * i <= n; i += 6)
        if(n % i == 0 || n % (i + 2) == 0) return false;

    return true;
}

function distToFurthestBound( coord, bound ) {
	return Math.abs( bound/2 - coord ) + bound/2;
}
function distToFurthestCorner( offset_x, offset_y, bounds_x, bounds_y ) {
	return Math.sqrt( distToFurthestBound(offset_x,bounds_x)**2 + distToFurthestBound(offset_y,bounds_y)**2 );
}

function bestTick(largest, most) {
    minimum = largest / most
    magnitude = 10 ** Math.floor(Math.log(minimum, 10))
    residual = minimum / magnitude
    if( residual > 5 ) {
        tick = 10 * magnitude
	}else if( residual > 2 ) {
        tick = 5 * magnitude
	}else if( residual > 1 ) {
        tick = 2 * magnitude
	}else {
        tick = magnitude
	}
    return tick
}

function render( offset_x, offset_y, scale, filter_mode="primeHighlight", blockSize=4, draw_grid=false, viewOnlyN=null, viewOnlyC=0, showNumbers=true, drawCoords=false ) {
	let start = Date.now();
	ctx.clear();
	ctx.fillStyle = "#1a5aba"

	// Calculate how many points to render by finding the value n, at which any points rendered past n will not be within the bounds of the canvas
	// This can be done by finding the distance to the furthest corner, and letting ceil(dist) = n
	var max_n = distToFurthestCorner( offset_x, offset_y, canvas.width, canvas.height ) / scale;

	if( draw_grid ) {
		for( theta = 0; theta < 2*Math.PI; theta += Math.PI / 4 ) {
			ctx.beginPath();
			ctx.moveTo( offset_x, offset_y )
			ctx.lineTo( offset_x + Math.cos(theta) * max_n * scale, offset_y + Math.sin(theta) * max_n *scale );
			ctx.strokeStyle = "#900000";
			ctx.lineWidth = blockSize/2;
			ctx.stroke();
		}
	}

	let rendered = 0;
	for( n = 0; n < max_n; n++ ) {

		// Draw arc
		if( draw_grid && n % bestTick( max_n, 22 ) == 0 ) {
			ctx.beginPath();
			ctx.arc( offset_x, offset_y, n * scale, 0, 2*Math.PI );
			ctx.lineWidth = blockSize/2;
			ctx.strokeStyle = "#ae6e6e";
			ctx.stroke();
		}

		// Get (x, y)
		let x = Math.cos( n ) * n * scale + offset_x;
		let y = -Math.sin( n ) * n * scale + offset_y;

		if( x < 0 || x > canvas.width || y < 0 || y > canvas.height )
			continue; // Outside of bounds

		switch(filter_mode) {
			case "primeOnly":
				if( isPrime(n) ) { 
					rendered++;
					if( n % viewOnlyN == viewOnlyC || viewOnlyN == null )
						ctx.fillStyle = "#1a5aba";
					else
						ctx.fillStyle = "#1a5aba20";
					ctx.fillRect(x-(blockSize/2),y-(blockSize/2),blockSize,blockSize);

					if( scale > 0.4 && showNumbers ) {
						ctx.font = "bold 15px sans-serif";
						if( n % viewOnlyN == viewOnlyC || viewOnlyN == null )
							ctx.fillStyle = "#ffffff";
						else
							ctx.fillStyle = "#ffffff20";
						let size = ctx.measureText(n);
						ctx.fillText( n, x - (size.width/2), y - blockSize );
					}
				}
				break;
			case "primeHighlight":
				rendered++;
				if( isPrime(n) ) {
					if( n % viewOnlyN == viewOnlyC || viewOnlyN == null )
						ctx.fillStyle = "#f5e042";
					else
						ctx.fillStyle = "#f5e04220";
					ctx.fillRect(x-(blockSize/2),y-(blockSize/2),blockSize,blockSize);
				}else {
					if( n % viewOnlyN == viewOnlyC || viewOnlyN == null )
						ctx.fillStyle = "#1a5aba";
					else
						ctx.fillStyle = "#1a5aba20";
					ctx.fillRect(x-(blockSize/2),y-(blockSize/2),blockSize,blockSize);
				}
				if( scale > 0.4 && showNumbers ) {
					ctx.font = "bold 15px sans-serif";
					if( n % viewOnlyN == viewOnlyC || viewOnlyN == null )
						ctx.fillStyle = "#ffffff";
					else
						ctx.fillStyle = "#ffffff20";
					let size = ctx.measureText(n);
					ctx.fillText( n, x - (size.width/2), y - blockSize );
				}
				break;
			default:
				rendered++;
				if( n % viewOnlyN == viewOnlyC || viewOnlyN == null )
					ctx.fillStyle = "#1a5aba";
				else
					ctx.fillStyle = "#1a5aba20";
				ctx.fillRect(x-(blockSize/2),y-(blockSize/2),blockSize,blockSize);
				if( scale > 0.4 && showNumbers ) {
					ctx.font = "bold 15px sans-serif";
					if( n % viewOnlyN == viewOnlyC || viewOnlyN == null )
						ctx.fillStyle = "#ffffff";
					else
						ctx.fillStyle = "#ffffff20";
					let size = ctx.measureText(n);
					ctx.fillText( n, x - (size.width/2), y - blockSize );
				}
		}

	}
	if(drawCoords) {
		ctx.fillStyle="#ffffff";
		ctx.strokeStyle="#000000";
		ctx.font = "12pt sans-serif";
		ctx.lineWidth = 4;
		let str = `x: ${pan_x}, y: ${pan_y} pixels. Scale: ${(scale).toFixed(4)}. Considering up to ${Math.ceil(max_n)} points, actually rendered ${rendered}. Took ${Date.now() - start}ms`;
		ctx.strokeText( str,2,canvas.height-2);
		ctx.fillText( str,2,canvas.height-2);
	}
	return max_n;
}
function render_fromGlobal() {
	return render( pan_x, pan_y, scale, renderMode, size, drawGrid, modN, modC, shouldShowNumbers, shouldDrawCoords );
}

render_fromGlobal()

canvas.addEventListener("mousedown", (e) => {
	if(e.button == 0) {
		canvas.clicked = true;
	}
});
window.addEventListener("mouseup", (e) => {
	if(e.button == 0) {
		canvas.clicked = false;
	}
});
window.addEventListener("mousemove", (e) => {
	if( canvas.clicked ) {
		pan_x += e.movementX;
		pan_y += e.movementY;
		render_fromGlobal()
	}
});
canvas.addEventListener("wheel", (e) => {
	doZoom = false;
	scale += (e.deltaY / SCROLL_COEFF) * (scale / SCROLL_COEFF);
	scale = Math.max( SCALE_MIN, Math.min(SCALE_MAX, scale) );
	render_fromGlobal()
	e.preventDefault()
})

document.getElementById("btn-center").addEventListener("click", (e) => {pan_x=canvas.width/2;pan_y=canvas.height/2;render_fromGlobal()})
document.getElementById("shouldOnlyN").addEventListener("change", function(e) {
	if( this.checked ) {
		modN = document.getElementById("onlyN").value * 1;
	}else {
		modN = null;
	}
	render_fromGlobal();
})
document.getElementById("onlyN").addEventListener("change", function(e) {
	if( document.getElementById("shouldOnlyN").checked ) {
		modN = this.value * 1;
		render_fromGlobal()
	}
})
document.getElementById("onlyC").addEventListener("change", function(e) {
	if( this.value*1 >= modN || this.value.charAt(0) == '-' ) {
		this.value = 0;
	}
	modC = this.value * 1;
	render_fromGlobal()
})
document.getElementById("draw-grid").addEventListener("change", function(e) {
	drawGrid = this.checked;
	render_fromGlobal();
})
document.getElementById("draw-numbers").addEventListener("change", function(e) {
	shouldShowNumbers = this.checked;
	render_fromGlobal();
})
document.getElementById("draw-coords").addEventListener("change", function(e) {
	shouldDrawCoords = this.checked;
	render_fromGlobal();
})
document.getElementById("filter-mode").addEventListener("change", function(e) {
	renderMode = this.value;
	render_fromGlobal();
})

document.getElementById("zoomTo").min = SCALE_MIN;
document.getElementById("zoomTo").max = SCALE_MAX;
document.getElementById("zoomTo").value = zoom_target;
document.getElementById("zoomTo").addEventListener("change", function(e){
	zoom_target = this.value*1;
})
function zoomOut() {
	scale /= 1.01;
	if( scale > zoom_target && doZoom ) {
		requestAnimationFrame( zoomOut )
	}else if(doZoom) {
		scale=zoom_target
		doZoom = false;
	}
	render_fromGlobal();
}
document.getElementById("btn-zoomout").addEventListener("click", function(e) {
	doZoom = true;
	zoomOut();
	e.preventDefault();
})
function zoomIn() {
	scale *= 1.01;
	if( scale < zoom_target && doZoom ) {
		requestAnimationFrame( zoomIn )
	}else if( doZoom ) {
		scale=zoom_target;
		doZoom = false;
	}
	render_fromGlobal();
}
document.getElementById("btn-zoomin").addEventListener("click", function(e) {
	doZoom = true;
	zoomIn();
	e.preventDefault();
})
document.addEventListener("keyup", (e) => {
	doZoom = false;
})