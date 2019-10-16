#version 330 compatibility

uniform float uScenter, uTcenter, uR, uMagFactor, uRotAngle, uSharpFactor;
uniform sampler2D uImageUnit;
uniform vec2 mouse;

in vec2	vST;

void main() {
	vec2 vS_T = vST;
	float s_d = vST.s-uScenter;
    float t_d = vST.t-uTcenter;
    float s_calc = pow(s_d, 2.0);
    float t_calc = pow(t_d, 2.0);
    float uR_s = pow(uR, 2.0);
	
	if ((s_calc + t_calc) <= uR_s){
        vS_T.s -= uScenter;
        vS_T.t -= uTcenter;
        vS_T.s /= uMagFactor;
        vS_T.t /= uMagFactor;
        float x = vS_T.s;
        float y = vS_T.t;
		
		vS_T.s =  x*cos(uRotAngle) + y*sin(uRotAngle) + uScenter;
        vS_T.t = -x*sin(uRotAngle) + y*cos(uRotAngle) + uTcenter;
		
		//Code taken from Image Processing Slides: http://web.engr.oregonstate.edu/~mjb/cs557/Handouts/image.1pp.pdf
		ivec2 int_res = textureSize(uImageUnit, 0);
        float ResS = float(int_res.s);
        float ResT = float(int_res.t);
		
		vec2 stp0 = vec2(1./ResS, 0. );
        vec2 st0p = vec2(0. , 1./ResT);
        vec2 stpp = vec2(1./ResS, 1./ResT);
        vec2 stpm = vec2(1./ResS, -1./ResT);
        vec3 i00 = texture2D( uImageUnit, vS_T ).rgb;
        vec3 im1m1 = texture2D( uImageUnit, vS_T-stpp ).rgb;
        vec3 ip1p1 = texture2D( uImageUnit, vS_T+stpp ).rgb;
        vec3 im1p1 = texture2D( uImageUnit, vS_T-stpm ).rgb;
        vec3 ip1m1 = texture2D( uImageUnit, vS_T+stpm ).rgb;
        vec3 im10 = texture2D( uImageUnit, vS_T-stp0 ).rgb;
        vec3 ip10 = texture2D( uImageUnit, vS_T+stp0 ).rgb;
        vec3 i0m1 = texture2D( uImageUnit, vS_T-st0p ).rgb;
        vec3 i0p1 = texture2D( uImageUnit, vS_T+st0p ).rgb;
        vec3 target = vec3(0.,0.,0.);
        target += 1.*(im1m1+ip1m1+ip1p1+im1p1);
        target += 2.*(im10+ip10+i0m1+i0p1);
        target += 4.*(i00);
        target /= 16.;

        gl_FragColor = vec4(mix(target, texture2D(uImageUnit, vS_T).rgb, uSharpFactor),1.);
	}
	else {
		gl_FragColor = vec4(texture2D(uImageUnit, vS_T).rgb, 1.);
	}
}