#version 300 es
precision highp float;

uniform float u_WidthWireframe;
uniform sampler2D u_TextureMap;

in vec3 fs_BcCoord;
in vec2 fs_TexCoord;
in vec3 fs_Normal;

out vec4 out_Col;

in vec3 fs_LightVec;

in vec3 fs_H;

in vec3 fs_worldPosition;
in vec3 fs_worldNormal;

uniform vec3 u_Eye;

uniform samplerCube u_CubeMap;

in vec3 R;

void main()
{
   float shininess = 32.0;

   vec3 kAmbient = vec3(0.0, 0.0, 0.2);
   vec3 kDiffuse = vec3(0.0, 0.0, 0.7);
   vec3 kSpecular = vec3(0.7, 0.7, 0.7);

   vec3 unitNorm = normalize(fs_Normal);
   vec3 unitLight = normalize(fs_LightVec);
   vec3 unitHalf = normalize(fs_H);

   // Calculate the diffuse term for Lambert shading
   float diffuseTerm = dot(unitNorm, unitLight);
   // Avoid negative lighting values
   diffuseTerm = clamp(diffuseTerm, 0., 1.);

   float specularTerm = pow(max(dot(unitHalf, unitNorm), 0.0), shininess);

   vec3 kD = kDiffuse * diffuseTerm;

   vec3 kA = kAmbient * vec3(1.0, 1.0, 1.0); // ambient term times light color

   vec3 kS = kSpecular * specularTerm;


   
   // http://codeflow.org/entries/2012/aug/02/easy-wireframe-display-with-barycentric-coordinates/
    if(any(lessThan(fs_BcCoord, vec3(u_WidthWireframe)))){
       //out_Col = vec4(0.0, 0.0, 0.8, 1.0) * texture(u_TextureMap, fs_TexCoord);
       //out_Col = texture(u_TextureMap, fs_TexCoord);
       //out_Col = vec4(fs_Normal, 1.0);
       //out_Col = vec4(0.0, 0.0, 0.8, 1.0) * (dot(fs_Normal, fs_LightVec) + 0.2);
       out_Col = vec4(vec3(kD + kA + kS), 1.0);


   vec3 worldNormal = normalize(fs_worldNormal);
   vec3 eyeToSurfaceDir = normalize(fs_worldPosition - u_Eye);
   vec3 direction = reflect(eyeToSurfaceDir,worldNormal);

         out_Col = texture(u_CubeMap, direction);
         //out_Col.xyz = direction;
    }
    else{
       discard;
    }

   // if (u_WidthWireframe > 0.1)
   // {
   //    out_Col = vec4(0.0, 0.0, 0.8, 1.0);
   // }
   // else
   // {
   //    out_Col = vec4(1.0, 0.0, 0.8, 1.0);
   // }
}