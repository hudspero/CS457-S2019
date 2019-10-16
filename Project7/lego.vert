#version 330 compatibility

out vec3 vNormal;
out vec2 vST;

void main() {
	vST = gl_MultiTexCoord0.st;
	vNormal = gl_Normal;
	gl_Position = gl_Vertex;
}