const verbose = false;

let shader_dat = {}
let vertex_shader;
let shaders = {}
let precision_type = "unknown";

/**
 * Turns a snippet of GLSL code into javascript
 * @param {String} GLSL A GLSL string to be parsed
 * @returns {String} translated JS code
 */
function to_JS( GLSL ) {

	let JS = GLSL.replace(/(\W)(pow|sin|cos|tan)/g, "$1Math.$2"); // Convert math function
	JS = JS.replace(/(\W)atan\((.+\,.+)\)/g, "$1Math.atan2($2)"); // Convert atan2 function
	JS = JS.replace(/(\W)atan\((.+)\)/g, "$1Math.atan($2)"); // Convert atan function
	JS = JS.replace(/(float|int|vec\d[if]?)(\s)/g, "let$2"); // Convert atan function

	return JS;
}


/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl WebGL or WebGL2 context
 * @param {String} fractal_name The fractal we're trying to build
 * @returns {WebGLShader} The built shader, this shader is also cached to shaders[name]
 */
function build_double( gl, fractal_name ) {
	console.log("Attempting compilation of the hardware double variant of " + fractal_name);
	let source = shader_dat.hardware_double;
	source = source.replace( "// -- FRACTAL_CODE -- //", shader_dat.fractals[fractal_name].GLSL.replaceAll("float", "double") ); // Insert the fractal code, all temp vars should be made to be double
	source = source.replace( "// -- INIT -- //", shader_dat.fractals[fractal_name].init ); // Insert the init code
	let param_src = "";
	for( param in shader_dat.fractals[fractal_name].parameters ) {
		param_src += "uniform " + shader_dat.fractals[fractal_name].parameters[param].type + " uParameter_" + param + ';';
	}
	source = source.replace("// -- PARAMETER_CODE -- //", param_src)

	// Source should now be valid GLSL shader code

	let shader = gl.createShader( gl.FRAGMENT_SHADER );
	gl.shaderSource( shader, source );
	gl.compileShader( shader );

	// Validate the compilation:
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("Failed to compile the hardware double shader!\n" + (gl.getShaderInfoLog( shader )).replace(/^/gm, "\t") );
		if(!verbose) return;
		console.log("Tried to compile the following code:")
		let formatted = "";
		let lines = source.split('\n')
		for( var i = 0; i < lines.length; i++ ) {
			formatted += (i + 1).toString().padStart(Math.ceil(Math.log10(lines.length)), '0') + "| " + lines[i] + '\n'
		}
		console.log(`%c${formatted}`, "font-family: monospace;");
		return; // Return null
	}

	shaders[fractal_name] = shader;
	return shader;
}

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl WebGL or WebGL2 context
 * @param {String} fractal_name The fractal we're trying to build
 * @returns {WebGLShader} The built shader, this shader is also cached to shaders[name]
 */
function build_float( gl, fractal_name ) {
	console.log("Attempting compilation of the float variant of " + fractal_name);
	let source = shader_dat.float;
	source = source.replace( "// -- FRACTAL_CODE -- //", shader_dat.fractals[fractal_name].GLSL ); // Insert the fractal code
	source = source.replace( "// -- INIT -- //", shader_dat.fractals[fractal_name].init ); // Insert the init code
	let param_src = "";
	for( param in shader_dat.fractals[fractal_name].parameters ) {
		param_src += "uniform " + shader_dat.fractals[fractal_name].parameters[param].type + " uParameter_" + param + ';';
	}
	source = source.replace("// -- PARAMETER_CODE -- //", param_src)

	// Source should now be valid GLSL shader code

	let shader = gl.createShader( gl.FRAGMENT_SHADER );
	gl.shaderSource( shader, source );
	gl.compileShader( shader );

	// Validate the compilation:
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("Failed to compile the float shader!\n" + (gl.getShaderInfoLog( shader )).replace(/^/gm, "\t") );
		if(!verbose) return;
		console.log("Tried to compile the following code:")
		let formatted = "";
		let lines = source.split('\n')
		for( var i = 0; i < lines.length; i++ ) {
			formatted += (i + 1).toString().padStart(Math.ceil(Math.log10(lines.length)), '0') + "| " + lines[i] + '\n'
		}
		console.log(`%c${formatted}`, "font-family: monospace;");
		return;
	}

	shaders[fractal_name] = shader;
	return shader;
}

/**
 * 
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl WebGL or WebGL2 context
 * @param {String} fractal_name The name of the fractal to build the program for
 * @param {boolean} force_rebuild Forcibly rebuild the shader, even if it is already cached to the shaders object
 * @returns {WebGLProgram} The built program, this is not cached anywhere
 */
function build_program( gl, fractal_name, force_rebuild=false ) {
	if(!vertex_shader || !gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS)) {
		console.log( "Building vertex shader" );

		vertex_shader = gl.createShader( gl.VERTEX_SHADER );
		gl.shaderSource( vertex_shader, shader_dat.vertex );
		gl.compileShader( vertex_shader );
		if (!gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS)) {
			console.error("Failed to compile the vertex shader shader! Aborting!\n" + (gl.getShaderInfoLog( shader )).replace(/^/gm, "\t") );
			return;
		}
	}

	let fShader = shaders[fractal_name];
	// Check to see if our shader is already built, if so this makes our job much easier
	if( !fShader || force_rebuild ) {
		// We don't have it already built, we need to rebuild it
		// TODO: Implement hardware and simulated double
		// TODO: Implement different rendering modes, this should be injected like the fractal code, as it is unlikely to change between versions
		fShader = build_double( gl, fractal_name )
		precision_type = "double"
		if(!fShader) { // Hardware double failed
			fShader = build_float( gl, fractal_name );
			precision_type = "single"
		}
	}else {
		console.log(`Shader ${fractal_name} already built, using previous result`);
	}
	if( !gl.getShaderParameter(fShader, gl.COMPILE_STATUS) ) {
		// We don't have it already built, we need to rebuild it
		// TODO: Implement hardware and simulated double
		fShader = build_double( gl, fractal_name )
		if(!fShader) { // Hardware double failed
			fShader = build_float( gl, fractal_name );
		}
	}

	// Ok, build the program
	let program = gl.createProgram();
	gl.attachShader( program, vertex_shader );
	gl.attachShader( program, fShader );

	gl.linkProgram( program );
	return program;
}

fetch("/shader.json") // Fetch the shader info
	.then( res => {
		if( !res.ok ) {
			console.error("Bad status code on shader.json\s\tstatus " + res.status);
			return;
		}
		res.json()
			.then( json => {
				shader_dat = json;

				let e = new Event("FractalLoad");
				window.dispatchEvent(e);
			})
	})
	.catch( err => {
		console.error("Something went wrong when loading the shader.json")
	})