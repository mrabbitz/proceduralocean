#version 300 es
precision highp float;

in vec4 fs_Col;
out vec4 out_Col;

in vec2 fs_UV;


uniform samplerCube u_CubeMap;

in vec3 v_normal;

in vec4 fs_Pos;


uniform mat4 u_ViewProjInv;

void main() {
  out_Col = fs_Col;
  out_Col = texture(u_CubeMap, normalize(v_normal));

  vec4 t = u_ViewProjInv * fs_Pos;
  out_Col = texture(u_CubeMap, normalize(t.xyz / t.w));
}