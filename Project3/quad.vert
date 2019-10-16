#version 330 compatibility

uniform float uA, uB, uC, uD, uE;
uniform float uNoiseAmp, uNoiseFreq;
uniform float uLightX, uLightY, uLightZ;

flat out vec3 vNf;
	 out vec3 vNs;
flat out vec3 vLf;
	 out vec3 vLs;
flat out vec3 vEf;
	 out vec3 vEs;
	 out vec3 vMCposition;

vec3 eyeLightPosition = vec3( uLightX, uLightY, uLightZ );

void main( ){ 

	vec4 dummy_z = gl_Vertex;
	dummy_z.z += (uA * (cos(2*3.14*uB*gl_Vertex.x+uC) * exp(-uD*gl_Vertex.x)) * (exp(-uE*gl_Vertex.y)));
	
	vec4 ECposition = gl_ModelViewMatrix * gl_Vertex;

	float dzdx = uA * (-sin(2*3.14*uB*gl_Vertex.x+uC) * 2*3.14*uB*exp(-uD*gl_Vertex.x) + cos(2*3.12*uB*gl_Vertex.x+uC) * -uD*exp(-uD*gl_Vertex.x)) * (exp(-uE*gl_Vertex.y));
	float dzdy = uA * (cos(2*3.14*uB*gl_Vertex.x+uC) * exp(-uD*gl_Vertex.x)) * (-uE * exp(-uE*gl_Vertex.y));
	vec3 Tx = vec3(1., 0., dzdx );
	vec3 Ty = vec3(0., 1., dzdy );
	vec3 normal = normalize(cross(Tx, Ty));
	
	vNf = normalize(gl_NormalMatrix * normal);	//surface normal vector
	vNs = vNf;
	vLf = eyeLightPosition - ECposition.xyz; //vector from the point to the light position
	vLs = vLf;
	vEf = vec3(0., 0., 0.) - ECposition.xyz; //vector from the point to the eye position 
	vEs = vEf;

	vMCposition  = dummy_z.xyz;
	
	gl_Position = gl_ModelViewProjectionMatrix * dummy_z;
}