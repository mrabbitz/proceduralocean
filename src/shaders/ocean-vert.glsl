#version 300 es

uniform mat4 u_Model;
uniform mat4 u_ViewProj;
uniform sampler2D u_TextureMap;

in vec4 vs_Pos;

in vec3 vs_BcCoord;
out vec3 fs_BcCoord;

out vec2 fs_TexCoord;


void main() 
{
    fs_BcCoord = vs_BcCoord;

    // Get cylindircal represenatation of ocean
    vec4 cylPos = vs_Pos;

    // Flatten cylinder into a 2D disk representation of the ocean
    float maxOceanRadiusFt  = 54000.0;
    float nRings = 5.0;

    vec4 diskPos    = cylPos;
    float ringIndex = diskPos.y;
    float ringRatio = ringIndex / nRings;
    float factor    = ringRatio * ringRatio * ringRatio * ringRatio;      // pow(ringRatio, 4.0);
    //diskPos.xz      = diskPos.xz * factor;
    diskPos.xz      = diskPos.xz * ringIndex;  //uniform for now
    diskPos.y       = 0.0;

    fs_TexCoord = diskPos.xz;  // Texture coord for the repeated tile

    //diskPos.y = texture(u_TextureMap, fs_TexCoord).y;

    gl_Position = u_ViewProj * u_Model * diskPos;
} 