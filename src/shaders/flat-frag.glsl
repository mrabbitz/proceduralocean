#version 300 es
precision highp float;

uniform samplerCube u_CubeMap;
uniform mat4 u_ViewProjInv;
uniform float u_SkyboxIntensity;
uniform float u_FogIntensity;

in vec4 fs_Pos;

out vec4 out_Col;

void main() {

  vec4 t = u_ViewProjInv * fs_Pos;
  out_Col = texture(u_CubeMap, normalize(t.xyz / t.w));

  vec3  fogColor  = mix( vec3(0.5,0.6,0.7), // bluish
                           vec3(1.0,0.9,0.7), // yellowish
                           0.5 );

  out_Col.xyz = u_SkyboxIntensity * mix(fogColor, out_Col.xyz, smoothstep(0.0, u_FogIntensity*u_FogIntensity*4., abs(t.y)));
}