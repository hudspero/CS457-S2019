#version 330 compatibility

in vec3  vMCposition;
in float vLightIntensity;
in vec2  vST;
in vec4  vColor;

uniform float uAd;
uniform float uBd;
uniform float uTol;
uniform bool  uSmooth;

void main() {
	
	//ESTABLISH ELLIPSE VARIABLES
	float s = vST.s;
	float t = vST.t;
	float Ar = (uAd / 2);
	float Br = (uBd / 2);
	int numin_s = int(s / uAd);
	int numin_t = int(t / uBd);
	float s_c = numin_s * uAd + Ar;
	float t_c = numin_t * uBd + Br;
	float a = pow(((s - s_c) / Ar),2); //Radius 1 of Ellipse Equation
	float b = pow(((t - t_c) / Br),2); //Radius 2 of Ellipse Equation
	float c = a + b; //Combination for saving computer resources
	
	//ESTABLISH TOLERANCE/BLENDING VARIABLES
	float d_s = s - s_c;
	float d_t = t - t_c;
	float d_sA = d_s / Ar;
	float d_tB = d_t / Br;
	float d_final = (d_sA * d_sA) + (d_tB * d_tB);
	float tl = smoothstep(1. - uTol, 1. + uTol, c);
	
	if(uSmooth) { //IF SMOOTH ENABLED		
		vec3 rgb = vLightIntensity * mix(vec3(1., 0., 0.), vColor.rgb, tl);
		gl_FragColor = vec4(rgb, 1.);
	}
	else {
		if(c <= 1) { //FOR s,t VALUES WITHIN THE EQUATION OF AN ELLIPSE
			gl_FragColor = vec4((vLightIntensity * vec3(1., 0., 0.)), 1.);}
		else { //FOR s,t VALUES OUTSIDE OF THE ELLIPSE EQUATION
			gl_FragColor = vec4((vLightIntensity * vec3(1., 1., 1.)), 1.);}
	}
}