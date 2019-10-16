#version 330 compatibility

flat in vec3 vNf;
     in vec3 vNs;
flat in vec3 vLf;
     in vec3 vLs;
flat in vec3 vEf;
     in vec3 vEs;
	 in vec3 vMCposition;

uniform float uKa, uKd, uKs;
uniform vec4  uColor, uSpecularColor;
uniform float uShininess;
uniform float uNoiseAmp, uNoiseFreq;
uniform sampler3D Noise3;

vec3 RotateNormal(float angx, float angy, vec3 n) {	
	float cx = cos(angx);
	float sx = sin(angx);
	float cy = cos(angy);
	float sy = sin(angy);
	
	// rotate about x:
	float yp = n.y*cx - n.z*sx;  //y'
	n.z = n.y*sx + n.z*cx; //z'
	n.y = yp;

	// rotate about y:
	float xp = n.x*cy + n.z*sy;   //x'
	n.z = -n.x*sy + n.z*cy; //z'
	n.x = xp;
	
	return normalize(n);
}

void main( ) {
	vec3 Normal = normalize(vNs);
	vec3 Light = normalize(vLs);
	vec3 Eye = normalize(vEs);

	vec4 nvx = texture(Noise3, uNoiseFreq*vMCposition);
	float angx = nvx.r + nvx.g + nvx.b + nvx.a - 2.;
	angx *= uNoiseAmp;
    vec4 nvy = texture( Noise3, uNoiseFreq*vec3(vMCposition.xy,vMCposition.z+0.5) );
	float angy = nvy.r + nvy.g + nvy.b + nvy.a - 2.;
	angy *= uNoiseAmp;
	
	vec3 mapping = RotateNormal(angx, angy, Normal);
	
	vec4 ambient = uKa * uColor;

	float d = max(dot(mapping,Light), 0.);
	vec4 diffuse = uKd * d * uColor;

	float s = 0.;
	if(dot(mapping,Light) > 0.) { // only do specular if the light can see the point
		vec3 ref = normalize(2. * mapping * dot(mapping,Light) - Light); //use the reflection-vector
		s = pow(max(dot(Eye,ref),0.), uShininess);
	}
	vec4 specular = uKs * s * uSpecularColor;
	
	gl_FragColor = vec4(ambient.rgb + diffuse.rgb + specular.rgb, 1.);
}