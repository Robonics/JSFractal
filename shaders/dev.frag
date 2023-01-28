#pragma optionNV(fastmath off)
#pragma optionNV(fastprecision off)
#ifdef GL_ES
	precision highp float;
#endif

uniform float uResolutionY;
uniform float uAspectRatio;

uniform float uScale;
uniform float uTranslateX;
uniform float uTranslateY;

uniform int uMaxIterations;
uniform float uHueShift;

uniform bool uDrawGrid;

const float LINE_THICKNESS = 0.005;

const float d = 2.0;
const float ESCAPE_THRESHOLD = 10000.0;

vec3 hsl2rgb( in vec3 c ) {
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );

    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

int mandelbrot( vec2 C ) {
	float realZ = 0.0;
	float imagZ = 0.0;

	int iterations = 0;
	for( int i = 0; i < 1000; ++i ) { // Here we automatically stop after 1000 iterations, no-matter what the uniform is set to
		float _x = pow(realZ*realZ+imagZ*imagZ, d/2.0) * cos(d * atan(imagZ, realZ)) + C.x;
		imagZ = pow(realZ*realZ+imagZ*imagZ, d/2.0) * sin(d * atan(imagZ, realZ)) + C.y;
		realZ = _x;
		
		iterations = i + 1;

		if( realZ*realZ + imagZ*imagZ > ESCAPE_THRESHOLD || iterations >= uMaxIterations) {
			break;
		}
	}

	return iterations;
}

int burning_ship( vec2 C ) {
	vec2  Z = C;

	int iterations = 0;
	for( int i = 0; i < 1000; ++i ) { // Here we automatically stop after 1000 iterations, no-matter what the uniform is set to
		float _x = (Z.x*Z.x) - (Z.y*Z.y) + C.x;
		Z.y = abs(2.0 * Z.x * Z.y) + C.y;
		Z.x = _x;
		
		iterations = i + 1;

		if( Z.x*Z.x + Z.y*Z.y > ESCAPE_THRESHOLD || iterations >= uMaxIterations) {
			break;
		}
	}

	return iterations;
}

int chirikov( vec2 C ) {
	vec2  Z = C;

	int iterations = 0;
	for( int i = 0; i < 1000; ++i ) { // Here we automatically stop after 1000 iterations, no-matter what the uniform is set to
		Z.y += C.y * sin( Z.x ) * 2.0;
		Z.x += C.x * Z.y;
		
		iterations = i + 1;

		if( Z.x*Z.x + Z.y*Z.y > ESCAPE_THRESHOLD || iterations >= uMaxIterations) {
			break;
		}
	}

	return iterations;
}

int mandelbox( vec2 C ) {
	vec2  Z = C;

	int iterations = 0;
	for( int i = 0; i < 1000; ++i ) { // Here we automatically stop after 1000 iterations, no-matter what the uniform is set to
		
		const float K = 2.5;
		// X
		if(Z.x > 1.0) {
			Z.x = 2.0 - Z.x;
		}else if(Z.x < -1.0) {
			Z.x = -2.0 - Z.x;
		}
		// Y
		if(Z.y > 1.0) {
			Z.y = 2.0 - Z.y;
		}else if(Z.y < -1.0) {
			Z.y = -2.0 - Z.y;
		}

		// Calculate Magnitude
		float mag = sqrt( Z.x*Z.x + Z.y*Z.y );
		if( mag < 0.5 ) {
			Z.x *= 4.0;
			Z.y *= 4.0;
		}else if(mag < 1.0) {
			Z.x /= mag * mag;
			Z.y /= mag * mag;
		}

		Z.x = K * Z.x + C.x;
		Z.y = K * Z.y + C.y;
		
		iterations = i + 1;

		if( Z.x*Z.x + Z.y*Z.y > ESCAPE_THRESHOLD || iterations >= uMaxIterations) {
			break;
		}
	}

	return iterations;
}

void main() {
	
	// We calculate C using the relative pixel coordinates
	float realC = uTranslateX + ((float(gl_FragCoord.x) - ((uResolutionY * uAspectRatio) / 2.0) ) / uResolutionY) * uScale;
	float imagC = uTranslateY - ((float(gl_FragCoord.y) - (uResolutionY / 2.0) ) / uResolutionY) * uScale;

	// This is a simple check to draw gridlines
	if( (realC - floor(realC) < (uScale * LINE_THICKNESS) || imagC - floor(imagC) < (uScale * LINE_THICKNESS )) && uDrawGrid ) {
		gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
	}else {
		int iterations = mandelbrot( vec2(realC, imagC) );

		if( iterations >= uMaxIterations ) {
			gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
		}else {
			gl_FragColor = vec4(hsl2rgb( vec3( (float(iterations) / 100.0) + uHueShift, 1.0, 0.5 ) ), 1.0);
		}  
	}

}