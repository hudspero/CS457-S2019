#version 330 compatibility

uniform float uA, uB, uC;
uniform float uNoiseAmp, uNoiseFreq;
uniform float uLightX, uLightY, uLightZ;
uniform float Timer;
uniform sampler3D Noise3;

flat out vec3 vNf;
	 out vec3 vNs;
flat out vec3 vLf;
	 out vec3 vLs;
flat out vec3 vEf;
	 out vec3 vEs;
	 out vec3 vMCposition;
	 out vec2 vST;

vec3 eyeLightPosition = vec3( uLightX, uLightY, uLightZ );

void main( ){ 
	
	vST = gl_MultiTexCoord0.st;
	
	//NOISE & ANIMATION VALUES
	float t = sin(2*3.14*Timer);
	vec4 ECposition = gl_ModelViewMatrix * gl_Vertex; //EYE COORDINATE POSITION
	vec4 noise_vector = texture(Noise3, vec3(ECposition)*uNoiseFreq*t);
	
	//FLAG VERTICES TO BE MODIFIED BY NOISE VALUES
	vec4 dummy = gl_Vertex;
	dummy.x *= 1.5;
	bool animateFlag = true;
	if(animateFlag == true) {
		if(t > 0) {
			dummy.z += noise_vector.z + (t * (uA * (cos(2*3.14*uB*dummy.x+uC))));}
		else {
			dummy.z += noise_vector.x + (t * (uA * (cos(2*3.14*uB*dummy.x+uC))));}
		if(t == 1 || t == -1)
			animateFlag = !animateFlag;
	}
	else if (animateFlag == false) {
		if(t > 0) {
			dummy.z += noise_vector.x + (t * (uA * (cos(2*3.14*uB*dummy.x+uC))));}
		else {
			dummy.z += noise_vector.z + (t * (uA * (cos(2*3.14*uB*dummy.x+uC))));}
		if(t == 1 || t == -1)
			animateFlag = !animateFlag;
	}
	
	//FLAG WAVING
	float dzdx = uA * (-sin(2*3.14*uB*gl_Vertex.x+((t/2)*uC)) * 2*3.14*uB + cos(2*3.12*uB*gl_Vertex.x+(t/2)*uC));
	float dzdy = uA * (cos(2*3.14*uB*gl_Vertex.x+((t/2)*uC)));
	vec3 Tx = vec3(1., 0., dzdx );
	vec3 Ty = vec3(0., 1., dzdy );
	vec3 surf_normal = normalize(cross(Tx, Ty));
	
	vNf = normalize(gl_NormalMatrix * surf_normal);	//surface normal vector
	vNs = vNf;
	vLf = eyeLightPosition - ECposition.xyz; //vector from the point to the light position
	vLs = vLf;
	vEf = vec3(0., 0., 0.) - ECposition.xyz; //vector from the point to the eye position 
	vEs = vEf;

	vMCposition  = dummy.xyz;
	
	
	gl_Position = gl_ModelViewProjectionMatrix * dummy;
}