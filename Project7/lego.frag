#version 330 compatibility

in vec3 vMCposition;
in float gLightIntensity;

uniform int uLevel;

void main() {
	gl_FragColor = vec4( gLightIntensity * vec3(1., 1., 0.), 1. );
}