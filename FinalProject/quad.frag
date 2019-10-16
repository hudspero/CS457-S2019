#version 330 compatibility

flat in vec3 vNf;
     in vec3 vNs;
flat in vec3 vLf;
     in vec3 vLs;
flat in vec3 vEf;
     in vec3 vEs;
	 in vec3 vMCposition;
	 in vec2 vST;

uniform float uKa, uKd, uKs;
uniform vec4  uSpecularColor;
uniform float uShininess;
uniform sampler2D uFlagImage, uNormalImage;

void main( ) {
	//IMAGE PLACEMENT
	vec4 flagSample = texture2D(uFlagImage, vST);
		
	//SAMPLING THE NORMAL MAP & APPLYING ANGLED ROTATION PER SAMPLE
	float pitch = acos(dot(vNs, vec3(0, 0, 1)));
	float yaw = atan(vNs.x, vNs.y);
	vec4 normalSample = texture2D(uNormalImage, vST);
	
	//APPLYING PITCH ROTATION PER SAMPLE 
	vec3 pitchNormal;
	pitchNormal.z = cos(pitch)*normalSample.z - sin(pitch)*normalSample.x;
	pitchNormal.x = sin(pitch)*normalSample.z + cos(pitch)*normalSample.x;
	pitchNormal.y = normalSample.y;
	
	//APPLYING YAW ROTATION PER SAMPLE
	vec3 yawNormal;
	yawNormal.z = pitchNormal.z;
	yawNormal.x = cos(yaw)*pitchNormal.x - sin(yaw)*pitchNormal.y;
	yawNormal.y = sin(yaw)*pitchNormal.x + cos(yaw)*pitchNormal.x;
	yawNormal *= gl_NormalMatrix;
	
	//ESTABLISHING LIGHTING PARAMETERS
	vec3 Normal = yawNormal;
	vec3 Light = normalize(vLs);
	vec3 Eye = normalize(vEs);
	
	//AMBIENT LIGHTING
	vec4 ambient = uKa * flagSample;

	//DIFFUSE LIGHTING
	float d = max(dot(Normal,Light), 0.);
	vec4 diffuse = uKd * d * flagSample;

	//SPECULAR LIGHTING
	float s = 0.;
	if(dot(Normal,Light) > 0.) { //only do specular if the light can see the point
		vec3 ref = normalize(2. * Normal * dot(Normal,Light) - Light); //use the reflection-vector
		s = pow(max(dot(Eye,ref),0.), uShininess);}
	vec4 specular = uKs * s * uSpecularColor;
	
	//OUTPUT
	gl_FragColor = vec4(ambient.rgb + diffuse.rgb + specular.rgb, 1.);
}