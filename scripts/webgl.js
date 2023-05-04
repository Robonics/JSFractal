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
	base_color: [ 0.0, 1.0, 0.5 ],
	color_strength: [ 1.0, 0.0, 0.0 ],
	grid: false
}

let selected_fractal = "Mandelbrot Set"; // Default

function toHSLVec3( hex ) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

	var r = parseInt(result[1], 16);
	var g = parseInt(result[2], 16);
	var b = parseInt(result[3], 16);

	r /= 255, g /= 255, b /= 255;
	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;

	if(max == min){
		h = s = 0; // achromatic
	} else {
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch(max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}

	return [ h, s, l ];
}

function splitDouble( number ) {
	let arr = new Float32Array([number]);
	let delta = number - arr[0];
	return [arr[0], delta]
}

function ParameterFrame( gl, prog ) {
	let list = document.getElementById("parameters");
	list.innerHTML = "";
	for( parameter in shader_dat.fractals[selected_fractal].parameters ) {
		let location = gl.getUniformLocation( prog, "uParameter_" + parameter );
		let def = shader_dat.fractals[selected_fractal].parameters[parameter].default;
		let para = shader_dat.fractals[selected_fractal].parameters[parameter];
		switch( shader_dat.fractals[selected_fractal].parameters[parameter].type ) {
			case "float":
				gl.uniform1f( location, def );
				list.innerHTML += `<label for="parameter_${parameter}">${para.symbol}</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}" step="0.05" value="${def}"></input>`
				break;
			case "int":
				gl.uniform1i( location, def );
				list.innerHTML += `<label for="parameter_${parameter}">${para.symbol}</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}" step="1" value="${def}"></input>`
				break;
			case "vec2":
				gl.uniform2f( location, def );
				list.innerHTML += `<label for="parameter_${parameter}_x">${para.symbol}.x</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}_x" step="1" value="${def}"></input>
				<label for="parameter_${parameter}_y">${para.symbol}.y</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}_y" step="1" value="${def}"></input>`
				break;
			case "vec3":
				gl.uniform3f( location, def );
				list.innerHTML += `<label for="parameter_${parameter}_x">${para.symbol}.x</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}_x" step="1" value="${def}"></input>
				<label for="parameter_${parameter}_y">${para.symbol}.y</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}_y" step="1" value="${def}"></input>
				<label for="parameter_${parameter}_z">${para.symbol}.z</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}_z" step="1" value="${def}"></input>`
				break;
			case "vec4":
				gl.uniform4f( location, def );
				list.innerHTML += `<label for="parameter_${parameter}_x">${para.symbol}.x</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}_x" step="1" value="${def}"></input>
				<label for="parameter_${parameter}_y">${para.symbol}.y</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}_y" step="1" value="${def}"></input>
				<label for="parameter_${parameter}_z">${para.symbol}.z</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}_z" step="1" value="${def}"></input>
				<label for="parameter_${parameter}_w">${para.symbol}.w</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}_w" step="1" value="${def}"></input>`
				break;
			default:
				console.warn(`Parameter ${parameter} tried to invoke an invalid type of ${shader_dat.fractals[selected_fractal].parameters[parameter].type}, ignoring`);
		}
	}
}

/**
 * Assigns a 64-bit precision number to two 32-bit precision GLSL floats (float2). Calls {@link WebGL2RenderingContext.uniform2f gl.uniform2f()} internally
 * @param {WebGLUniformLocation} location 
 * @param {Number} value 
 */
WebGL2RenderingContext.prototype.uniform1d = function( location, value ) {
	let _v = new DataView( new ArrayBuffer(4) );
	_v.setFloat32(0, value);
	_v.setFloat32(1, value - _v.getFloat32(0) );

	this.uniform2f( location, _v.getFloat32(0), _v.getFloat32(1) );
}
/**
 * Assigns a 64-bit precision number to two 32-bit precision GLSL floats (float2). Calls {@link WebGLRenderingContext.uniform2f gl.uniform2f()} internally
 * @param {WebGLUniformLocation} location 
 * @param {Number} value 
 */
WebGLRenderingContext.prototype.uniform1d = function( location, value ) {
	let _v = new DataView( new ArrayBuffer(4) );
	_v.setFloat32(0, value);
	_v.setFloat32(1, value - _v.getFloat32(0) );

	this.uniform2f( location, _v.getFloat32(0), _v.getFloat32(1) );
}

function InitUniform( gl, program ) {
	gl.uniform1f( gl.getUniformLocation( program, "uResolutionY" ), resolution );
	gl.uniform1f( gl.getUniformLocation( program, "uAspectRatio" ), aspect_ratio );

	gl.uniform1i( gl.getUniformLocation( program, "uMaxIterations" ), settings.max_iterations );
	gl.uniform3f( gl.getUniformLocation( program, "uBaseColor" ), ...settings.base_color );

	switch( precision_type ) {
		case "single":
			gl.uniform1f( gl.getUniformLocation( program, "uTranslateX" ), viewport.translateX );
			gl.uniform1f( gl.getUniformLocation( program, "uTranslateY" ), viewport.translateY );
			break;
		case "simulated":
			break;
		case "double":
			gl.uniform1d( gl.getUniformLocation( program, "uTranslateX" ), viewport.translateX );
			gl.uniform1d( gl.getUniformLocation( program, "uTranslateY" ), viewport.translateY );
			break;
		default:
			console.error("Precision type unknown, probably due to a failed shader compile")
	}

	gl.uniform3f( gl.getUniformLocation( program, "uColorStrength" ), ...settings.color_strength );

	gl.uniform1f( gl.getUniformLocation( program, "uDrawGrid" ), settings.grid );
}

window.addEventListener("FractalLoad", function() {

	// Setup some of the UI
	let select = document.getElementById( "fractals" );
	for( fractal_name in shader_dat.fractals ) {
		let option = document.createElement("option");
		option.innerHTML = fractal_name;
		option.value = fractal_name;
		select.appendChild( option );
	}

	// All fractal handling methods go here:
	const canvas = document.getElementById("main");
	canvas.width = resolution * aspect_ratio;
	canvas.height = resolution;
	let gl = canvas.getContext('webgl2'); // Try to get a WebGL 2.0 context, but if it fails, fallback to the default
	if( !gl ) {
		console.warn("Failed to create a WebGL 2.0 Context, falling back to 1.0...");
		alert("Your browser doesn't support the latest version of WebGL, some features may not work properly")
		gl = canvas.getContext('webgl');
	}
	if(!gl) {
		alert("Your browser doesn't support WebGL, and therefore does not support the accelerated fractals");
		return;
	}

	let program = build_program( gl, selected_fractal );

	viewport.translateX = shader_dat.fractals[selected_fractal].start_posRe|| 0;
	viewport.translateY = shader_dat.fractals[selected_fractal].start_posIm || 0;
	viewport.scale = shader_dat.fractals[selected_fractal].start_scale || 1;
	viewport.target_scale = shader_dat.fractals[selected_fractal].start_scale || 1;

	select.addEventListener("change", function( e ) {
		selected_fractal = this.value;
		program = build_program( gl, selected_fractal );
		gl.useProgram( program );

		viewport.translateX = shader_dat.fractals[selected_fractal].start_posRe|| 0;
		viewport.translateY = shader_dat.fractals[selected_fractal].start_posIm || 0;
		viewport.scale = shader_dat.fractals[selected_fractal].start_scale || 1;
		viewport.target_scale = shader_dat.fractals[selected_fractal].start_scale || 1;

		InitUniform( gl, program );
		
		ParameterFrame( gl, program );
	})

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

			gl.uniform1f( gl.getUniformLocation( program, "uTranslateX" ), viewport.translateX );
			gl.uniform1f( gl.getUniformLocation( program, "uTranslateY" ), viewport.translateY );
		}
	})
	canvas.addEventListener("wheel", function(e) {

		viewport.target_scale += ( ( e.deltaY * viewport.target_scale ) / 250 )

		viewport.scale = Math.min(Math.max(1e-14, viewport.scale ), 12); // Clamp values
		viewport.target_scale = Math.min(Math.max(1e-14, viewport.target_scale ), 12); // Clamp values

		e.preventDefault();
	})

	document.getElementById("itr2").addEventListener("input", function(e) {
		settings.max_iterations = this.value * 1;	
		gl.uniform1i( gl.getUniformLocation( program, "uMaxIterations" ), settings.max_iterations );
	})
	document.getElementById("color").onchange = function(e) {
		settings.base_color = toHSLVec3(this.value);
		gl.uniform3f( gl.getUniformLocation( program, "uBaseColor" ), ...settings.base_color );
	}
	document.getElementById("grid").addEventListener("change", function(e) {
		settings.grid = this.checked;
		gl.uniform1f( gl.getUniformLocation( program, "uDrawGrid" ), settings.grid );
	})

	document.getElementById("coloring_hue").addEventListener("input", function() {
		settings.color_strength[0] = this.value * 1;
		gl.uniform3f( gl.getUniformLocation( program, "uColorStrength"), ...settings.color_strength );
	})
	document.getElementById("coloring_saturation").addEventListener("input", function() {
		settings.color_strength[2] = this.value * 1;
		gl.uniform3f( gl.getUniformLocation( program, "uColorStrength"), ...settings.color_strength );
	})
	document.getElementById("coloring_luminance").addEventListener("input", function() {
		settings.color_strength[2] = this.value * 1;
		gl.uniform3f( gl.getUniformLocation( program, "uColorStrength"), ...settings.color_strength );
	})

	let fps_counter = document.getElementById('fps-counter')
	let fps = 0;
	setInterval( function() {
		fps_counter.innerHTML = fps + "fps"
	}, 1000)

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

	// TODO: Maybe some kind of result caching so that only un-rendered areas are rendered anew
	
	// Initialize stuff that we won't ever change, or will change sparingly
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);

	positionLocation = gl.getAttribLocation(program, "a_position");
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	gl.useProgram( program );

	InitUniform( gl, program );

	ParameterFrame( gl, program );

	let last_time;
	(function render( time ) {

		if( time && last_time ) {
			fps = Math.trunc(1000 / (time - last_time));

			viewport.scale -= Math.min( viewport.scale - viewport.target_scale, viewport.target_scale ) * (( time - last_time ) / 50)
			gl.uniform1f( gl.getUniformLocation( program, "uScale" ), viewport.scale );
		}

		// Update the parameters
		for( parameter in shader_dat.fractals[selected_fractal].parameters ) {
		let location = gl.getUniformLocation( program, "uParameter_" + parameter );
		let def = shader_dat.fractals[selected_fractal].parameters[parameter].default;
		switch( shader_dat.fractals[selected_fractal].parameters[parameter].type ) {
			case "float":
				gl.uniform1f( location, (document.getElementById("parameter_" + parameter).value * 1) || def );
				break;
			case "int":
				gl.uniform1i( location, Math.trunc(document.getElementById("parameter_" + parameter).value * 1) || def );
				break;
			// case "vec2":
			// 	gl.uniform2f( location, def );
			// 	list.innerHTML += `<label for="parameter_${parameter}_x">${para.symbol}.x</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}_x" step="1" value="${def}"></input>
			// 	<label for="parameter_${parameter}_y">${para.symbol}.y</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}_y" step="1" value="${def}"></input>`
			// 	break;
			// case "vec3":
			// 	gl.uniform3f( location, def );
			// 	list.innerHTML += `<label for="parameter_${parameter}_x">${para.symbol}.x</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}_x" step="1" value="${def}"></input>
			// 	<label for="parameter_${parameter}_y">${para.symbol}.y</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}_y" step="1" value="${def}"></input>
			// 	<label for="parameter_${parameter}_z">${para.symbol}.z</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}_z" step="1" value="${def}"></input>`
			// 	break;
			// case "vec4":
			// 	gl.uniform4f( location, def );
			// 	list.innerHTML += `<label for="parameter_${parameter}_x">${para.symbol}.x</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}_x" step="1" value="${def}"></input>
			// 	<label for="parameter_${parameter}_y">${para.symbol}.y</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}_y" step="1" value="${def}"></input>
			// 	<label for="parameter_${parameter}_z">${para.symbol}.z</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}_z" step="1" value="${def}"></input>
			// 	<label for="parameter_${parameter}_w">${para.symbol}.w</label><input type="number" ${(para.min)? `min="${para.min}"` : ""} ${(para.max)? `max="${para.max}"` : ""} id="parameter_${parameter}_w" step="1" value="${def}"></input>`
			// 	break;
		}
	}

		gl.clear( gl.COLOR_BUFFER_BIT );
		
		gl.drawArrays(gl.TRIANGLES, 0, 6);

		requestAnimationFrame( render );
		last_time = time;
	})( 0 );
	// TODO: Basically everything
}, { once: true })