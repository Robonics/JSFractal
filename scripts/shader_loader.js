let shaders = {};
let successfully_loaded_fractals = 0;
function successfully_loaded() {
	successfully_loaded_fractals++;
	var len = 0;
	for( f in shaders ) { len++; }
	if( len == successfully_loaded_fractals ) {
		console.log("Loaded all the fractals")
		let e = new Event("FractalLoad");
		window.dispatchEvent( e );
	}
}
function deleteShader( s ) {
	delete shaders[s];
}

class FractalShader {
	name;
	fragment;
	vertex;

	program;

	loaded = 0;
	valid = true;

	build( gl ) {
		this.program = gl.createProgram();
		
		let vert = gl.createShader( gl.VERTEX_SHADER );
		gl.shaderSource( vert, this.vertex );
		gl.compileShader( vert );
		gl.attachShader( this.program, vert );

		if (!gl.getShaderParameter(vert, gl.COMPILE_STATUS)) {
			console.warn("Failed to compile vertex shader\n" + (gl.getShaderInfoLog( vert )).replace(/^/gm, "\t") );
		}

		let frag = gl.createShader( gl.FRAGMENT_SHADER );
		gl.shaderSource( frag, this.fragment );
		gl.compileShader( frag );
		gl.attachShader( this.program, frag );

		if (!gl.getShaderParameter(frag, gl.COMPILE_STATUS))
			console.warn("Failed to compile fragment shader" + (gl.getShaderInfoLog( frag )).replace(/^/gm, "\t"));

		gl.linkProgram( this.program );
		return this.program;

		
	}

	constructor( n, vert, frag ) {
		this.name = n;
		this.vertex = fetch("/shaders/" + vert )
			.then( result => {
				if(!result.ok ) {
					console.error("Failed to load vertex shader, bad response code! error: " + result.status );
					deleteShader( this.name );
				}else
					result.text()
						.then( txt => {
							this.vertex = txt;
							this.loaded++; // Signify that a shader has loaded
							if( this.loaded >= 2 ) {
								successfully_loaded();
							}
						})
			} )
			.catch( err => {
				this.valid = false;
			})
		this.fragment = fetch( "/shaders/" + frag )
			.then( result => {
				if(!result.ok ) {
					console.error("Failed to load vertex shader, bad response code! error: " + result.status );
					deleteShader( this.name );
				}else
					result.text()
						.then( txt => {
							this.fragment = txt;
							this.loaded++; // Signify that a shader has loaded
							if( this.loaded >= 2 ) {
								successfully_loaded();
							}
						})
			} )
			.catch( err => {
				this.valid = false;
			} )
	}
}

const shader_list = fetch("/shaders/shader_map.json")
	.then( res => res.json() )
	.then( json => {
		// The shader list is loaded

		for( fractal in json ) {
			// Queue them to be fetched:
			try {
				shaders[fractal] = new FractalShader( fractal, json[fractal].vertex, json[fractal].fragment );
			}catch( e ) {
				console.error("An error occurred while trying to load the fractal shader \"" + fractal + "\"\n\t" + e );
			}
		}

		// Validate that all of the requests resolved after 10 seconds
		setTimeout(function() {
			for( fractal in shaders ) {
				if( shaders[fractal].loaded < 2 || !shaders[fractal].valid ) {
					// It hasn't fully loaded for some reason, or it is invalid
					console.error(fractal + " timed out and failed to load")
					deleteShader( fractal ); // So we delete it
				}
			}
			
			// Tell the main program we're done, even if fractals didn't load
			let e = new Event("FractalLoad");
			window.dispatchEvent( e );
		}, 10000)
	})
	.catch( err => {
		console.error( "Failed to load the shader map!\n\t" + err );
	})