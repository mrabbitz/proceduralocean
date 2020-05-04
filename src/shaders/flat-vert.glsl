#version 300 es

uniform mat4 u_Model;       // The matrix that defines the transformation of the
                            // object we're rendering. In this assignment,
                            // this will be the result of traversing your scene graph.

uniform mat4 u_ViewProj;    // The matrix that defines the camera's transformation.
                            // We've written a static matrix for you to use for HW2,
                            // but in HW3 you'll have to generate one yourself

in vec4 vs_Pos;             // The array of vertex positions passed to the shader
in vec4 vs_Col;             // The array of vertex colors passed to the shader.

out vec4 fs_Col;            // The color of each vertex. This is implicitly passed to the fragment shader.


in vec2 vs_UV;
out vec2 fs_UV;

out vec3 v_normal;


out vec4 fs_Pos;


void main()
{
    vec4 vsPos = vec4(vec3(vs_Pos.xyz * 100.0), vs_Pos.w);
    v_normal = normalize(vsPos.xyz);
    fs_UV = vs_UV;
    fs_Col = vs_Col;                         // Pass the vertex colors to the fragment shader for interpolation

    vec4 modelposition = u_Model * vsPos;   // Temporarily store the transformed vertex positions for use below

    gl_Position = u_ViewProj * modelposition;// gl_Position is a built-in variable of OpenGL which is
                                             // used to render the final positions of the geometry's vertices

    fs_Pos = vs_Pos;
    gl_Position = vs_Pos;
    gl_Position.z = 1.0;
    
}
