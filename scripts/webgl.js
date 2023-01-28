const resolution = 800;
const aspect_ratio = 16/9;

let viewport = {
	translateX: 0.0,
	translateY: 0.0,
	scale: 2.0,
	target_scale: 2.0
}

let settings = {
	max_iterations: 100,
	hue_shift: 0
}

window.addEventListener("FractalLoad", function() {
	// All fractal handling methods go here:
	const canvas = document.getElementById("main");
	canvas.width = resolution * aspect_ratio;
	canvas.height = resolution;
	let gl = canvas.getContext('webgl');
	if(!gl) {
		alert("Your browser doesn't support WebGL, and therefore does not support the accelerated fractals");
		return;
	}

	// Lets define some event listeners
	canvas.addEventListener("mousedown", function( e ) {
		this.dragging = true;
	})
	window.addEventListener("mouseup", function( e ) { // We target the window so the user can drag outside of the canvas
		canvas.dragging = false;
	})
	window.addEventListener("mousemove", function( e ) {
		// First lets get the size of the canvas in screen-space:
		let rect = canvas.getBoundingClientRect();
		if( canvas.dragging ) {
			viewport.translateX -= ( e.movementX / rect.width ) * viewport.scale * aspect_ratio;
			viewport.translateY -= ( e.movementY / rect.height ) * viewport.scale;

			gl.uniform1f( gl.getUniformLocation( shaders["Developer Shader"].program, "uTranslateX" ), viewport.translateX );
			gl.uniform1f( gl.getUniformLocation( shaders["Developer Shader"].program, "uTranslateY" ), viewport.translateY );
		}
	})
	canvas.addEventListener("wheel", function(e) {

		viewport.target_scale += ( ( e.deltaY * viewport.target_scale ) / 250 )

		viewport.scale = Math.min(Math.max(1e-14, viewport.scale ), 12); // Clamp values
		viewport.target_scale = Math.min(Math.max(1e-14, viewport.target_scale ), 12); // Clamp values

		e.preventDefault();
	})

	document.getElementById("itr2").addEventListener("change", function(e) {
		settings.max_iterations = this.value * 1;	
		gl.uniform1i( gl.getUniformLocation( shaders["Developer Shader"].program, "uMaxIterations" ), settings.max_iterations );
	})
	document.getElementById("hue").onchange = function(e) {
		settings.hue_shift = this.value * 1;	
		gl.uniform1f( gl.getUniformLocation( shaders["Developer Shader"].program, "uHueShift" ), (settings.hue_shift % 360) / 360 );
	}
	document.getElementById("grid").addEventListener("change", function(e) {
		gl.uniform1f( gl.getUniformLocation( shaders["Developer Shader"].program, "uDrawGrid" ), this.checked );
	})

	let fps_counter = document.getElementById('fps-counter')
	let fps = 0;
	setInterval( function() {
		fps_counter.innerHTML = fps + "fps"
	}, 1000)

	// All of the raw text for the shaders is loaded, compile them:
	for( f in shaders ) {
		shaders[f].build( gl ) // Turn the raw shader data into a program that can be run
	}

	buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(
		gl.ARRAY_BUFFER, 
		new Float32Array([
		-1.0, -1.0, 
		1.0, -1.0, 
		-1.0,  1.0, 
		-1.0,  1.0, 
		1.0, -1.0, 
		1.0,  1.0]), 
		gl.STATIC_DRAW
	);
	
	// Initialize stuff that we won't ever change, or will change sparingly
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);

	positionLocation = gl.getAttribLocation(shaders["Developer Shader"].program, "a_position");
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	gl.useProgram( shaders["Developer Shader"].program );

	gl.uniform1f( gl.getUniformLocation( shaders["Developer Shader"].program, "uResolutionY" ), resolution );
	gl.uniform1f( gl.getUniformLocation( shaders["Developer Shader"].program, "uAspectRatio" ), aspect_ratio );

	gl.uniform1i( gl.getUniformLocation( shaders["Developer Shader"].program, "uMaxIterations" ), settings.max_iterations );
	gl.uniform1f( gl.getUniformLocation( shaders["Developer Shader"].program, "uHueShift" ), settings.hue_shift );

	gl.uniform1f( gl.getUniformLocation( shaders["Developer Shader"].program, "uTranslateX" ), viewport.translateX );
	gl.uniform1f( gl.getUniformLocation( shaders["Developer Shader"].program, "uTranslateY" ), viewport.translateY );

	let last_time;
	(function render( time ) {

		if( time && last_time ) {
			fps = Math.trunc(1000 / (time - last_time));

			viewport.scale -= Math.min( viewport.scale - viewport.target_scale, viewport.target_scale ) * (( time - last_time ) / 50)
			gl.uniform1f( gl.getUniformLocation( shaders["Developer Shader"].program, "uScale" ), viewport.scale );
		}

		gl.clear( gl.COLOR_BUFFER_BIT );
		
		gl.drawArrays(gl.TRIANGLES, 0, 6);

		requestAnimationFrame( render );
		last_time = time;
	})( 0 );
	// TODO: Basically everything
}, { once: true })