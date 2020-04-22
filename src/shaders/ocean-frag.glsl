#version 300 es
precision highp float;

uniform float u_WidthWireframe;
uniform sampler2D u_TextureMap;

in vec3 fs_BcCoord;
in vec2 fs_TexCoord;

out vec4 out_Col;

void main()
{
   // http://codeflow.org/entries/2012/aug/02/easy-wireframe-display-with-barycentric-coordinates/
    if(any(lessThan(fs_BcCoord, vec3(u_WidthWireframe)))){
       out_Col = vec4(0.0, 0.0, 0.8, 1.0) * texture(u_TextureMap, fs_TexCoord);
       out_Col = texture(u_TextureMap, fs_TexCoord);
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