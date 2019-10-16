#version 330 compatibility
#extension GL_EXT_gpu_shader4: enable
#extension GL_EXT_geometry_shader4: enable

layout(triangles) in;
layout(triangle_strip, max_vertices=200) out;

in vec3	vNormal[3];
in vec2 vST[3];

uniform float uQuantize;
uniform bool  uModelCoords;
uniform int   uLevel;

out float gLightIntensity;

const vec3 LightPos = vec3(5., 15., 5.);

vec3 V0, V01, V02;
vec3 N0, N01, N02;

float Quantize(float f) {
	f *= uQuantize;
	f += .5;		// round-off
	int fi = int(f);
	f = float(fi) / uQuantize;
	return f;
}

vec3 QuantizeVec3(vec3 v) {
	vec3 vv;
	vv.x = Quantize(v.x);
	vv.y = Quantize(v.y);
	vv.z = Quantize(v.z);
	return vv;
}

void ProduceVertex(float s, float t) {
	vec3 v = V0 + s*V01 + t*V02;
	vec4 ECposition, MCposition;
	
	if(uModelCoords) {		
		vec3 n = N0 + s*N01 + t*N02;
		vec3 tnorm = gl_NormalMatrix * n; // the transformed normal
		MCposition = vec4(v, 1.);
		MCposition.xyz = QuantizeVec3(MCposition.xyz);
		ECposition = gl_ModelViewMatrix * MCposition;
		gLightIntensity = abs(dot(normalize(LightPos - ECposition.xyz), tnorm));
		gl_Position = gl_ProjectionMatrix * ECposition;
	}
	else {
		vec3 n = N0 + s*N01 + t*N02;
		vec3 tnorm = gl_NormalMatrix * n; // the transformed normal
		ECposition = gl_ModelViewMatrix * vec4(v, 1.);
		ECposition.xyz = QuantizeVec3(ECposition.xyz);
		gLightIntensity = abs(dot(normalize(LightPos - ECposition.xyz), tnorm));
		gl_Position = gl_ProjectionMatrix * ECposition;
	}
	
	EmitVertex();
}

void main() {
	V01 = (gl_PositionIn[1] - gl_PositionIn[0]).xyz;
	V02 = (gl_PositionIn[2] - gl_PositionIn[0]).xyz;
	V0  =  gl_PositionIn[0].xyz;

	N01 = (vNormal[1] - vNormal[0]);
	N02 = (vNormal[2] - vNormal[0]);
	N0  = (vNormal[0]);
	
	int layers = 1 << uLevel;
	float dt = 1. / float(layers);
	float t_top = 1.;
	
	for(int t=0; t<layers; t++) {
		float t_bot = t_top - dt;
		float smax_top = 1. - t_top;
		float smax_bot = 1. - t_bot;

		int num_s = t + 1;
		float ds_top = smax_top / float( num_s - 1 );
		float ds_bot = smax_bot / float( num_s );

		float s_top = 0.;
		float s_bot = 0.;
		
		for(int s=0; s<num_s; s++) {
			ProduceVertex( s_bot, t_bot );
			ProduceVertex( s_top, t_top );
			s_top += ds_top;
			s_bot += ds_bot;
		}
		
		ProduceVertex( s_bot, t_bot );
		EndPrimitive();
		t_top = t_bot;
		t_bot -= dt;
	}
}