#version 330 compatibility

in vec3  vMCposition;
in float vLightIntensity;
in vec2  vST;
in vec4  vColor;

uniform float uAd;
uniform float uBd;
uniform float uTol;
uniform bool  uSmooth;
uniform float uNoiseAmp;
uniform float uNoiseFreq;
uniform sampler3D Noise3;

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
	float c = a + b; //Combination of Radius 1 and Radius 2
	
	//ESTABLISH NOISE VARIABLES
	vec4 nv  = texture3D( Noise3, uNoiseFreq*vMCposition );
	float n = nv.r + nv.g + nv.b + nv.a;
	n = (n - 2.);
	float noiseMag = n * uNoiseAmp;
	float s_nc = float(numin_s) * uAd  +  Ar;
	float ds = s - s_nc;                   // wrt ellipse center
	float t_nc = float(numin_t) * uBd  +  Br;
	float dt = t - t_nc;                   // wrt ellipse center
	float oldDist = sqrt(ds*ds + dt*dt);
	float newDist = noiseMag + oldDist;
	float scale = newDist / oldDist;        // this could be < 1., = 1., or > 1.
	
	ds *= scale;                            // scale by noise factor
	ds /= Ar;                               // ellipse equation

	dt *= scale;                            // scale by noise factor
	dt /= Br;                               // ellipse equation
	
	//ESTABLISH TOLERANCE/BLENDING VARIABLES
	float d = ds*ds + dt*dt;
	float tl = smoothstep(1. - uTol, 1. + uTol, d);
		
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