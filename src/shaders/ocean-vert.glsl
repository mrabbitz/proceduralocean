#version 300 es

uniform mat4 u_Model;
uniform mat4 u_ViewProj;
uniform sampler2D u_TextureMap;
uniform float u_Time;

in vec4 vs_Pos;

in vec3 vs_BcCoord;
out vec3 fs_BcCoord;

out vec2 fs_TexCoord;

out vec3 fs_Normal;

const vec2 size = vec2(0.2,0.0);
const vec3 off = vec3(-.1,.0,.1);

const vec3 lightPos = vec3(0.0, 10.0, -100.0);

out vec3 fs_LightVec;

const float TWO_PI = 6.283185307;
const float GRAVITY = 9.81;          // meters per secs^2
const float AMP_SCL = 0.1125;

struct Wave
{
    float angle;
    float angFreq;
    float phaseAng;
};

float waveHeight[6] = float[](0.6096,1.2191,1.5240,2.1335,3.0480,4.5710);
float wavePeriod[6] = float[](3.0,5.0,8.0,11.0,13.0,16.0);

Wave waves[10] = Wave[](Wave(0.0,0.559,1.651),
                        Wave(0.57,0.861,2.942),
                        Wave(-0.86,0.936,4.818),
                        Wave(2.9,1.008,6.012),
                        Wave(0.31,1.083,1.930),
                        Wave(0.975,1.167,6.017),
                        Wave(-0.23,1.272,1.133),
                        Wave(-1.53,1.412,5.682),
                        Wave(2.36,1.635,4.791),
                        Wave(-1.94,2.193,2.319)
                       );

int numWvComp = 10;

// float windDir = -30.0; // dominant wave direction

// int seaState = 1;

uniform int u_SeaState;
uniform float u_WindDirection;
uniform vec3 u_Eye;

out vec3 fs_H;

out vec3 fs_worldPosition;
out vec3 fs_worldNormal;

out vec3 R;


void main() 
{
    float windDir = u_WindDirection;

    int seaState = u_SeaState;

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

    fs_Normal = vec3(0.0, 1.0, 0.0);

    vec2 waveDir = vec2(0.);
    float d, omega, w, k, cosine, sine;
    for (int n = 0; n < numWvComp; ++n)
    {
        waveDir.x = sin(radians(windDir) + waves[n].angle);
        waveDir.y = cos(radians(windDir) + waves[n].angle);

        d = waveDir.x * diskPos.x + waveDir.y * diskPos.z;

        omega = waves[n].angFreq;

        w = TWO_PI / wavePeriod[seaState - 1];
	    k = (omega * w) * (omega * w) / GRAVITY;
	    cosine = cos(k * d + (omega * w * u_Time / 100.) + waves[n].phaseAng);
        diskPos.y += (AMP_SCL * waveHeight[seaState - 1] * cosine);

        sine = k * sin(k * d + (omega * w * u_Time / 100.) + waves[n].phaseAng);

        fs_Normal[0] += (-AMP_SCL * waveHeight[seaState - 1] * waveDir[0] * sine);
        fs_Normal[2] += (-AMP_SCL * waveHeight[seaState - 1] * waveDir[1] * sine);
    }
    fs_Normal = normalize(fs_Normal);

    fs_LightVec = normalize(lightPos - diskPos.xyz);

    vec3 viewVec = normalize(u_Eye - diskPos.xyz);

    fs_H = normalize(fs_LightVec + viewVec) * 0.5;

    gl_Position = u_ViewProj * u_Model * diskPos;

    // send the view position to the fragment shader
    fs_worldPosition = (u_Model * diskPos).xyz;

    // orient the normals and pass to the fragment shader
    fs_worldNormal = mat3(u_Model) * fs_Normal;


    R = reflect(vec3(diskPos.xyz - u_Eye), fs_worldNormal);


    // // Flatten cylinder into a 2D disk representation of the ocean
    // float maxOceanRadiusFt  = 54000.0;
    // float nRings = 100.0;

    // vec4 diskPos    = cylPos;
    // float ringIndex = diskPos.y;
    // float ringRatio = ringIndex / nRings;
    // float factor    = ringRatio * ringRatio;      // pow(ringRatio, 4.0);
    // diskPos.xz      = diskPos.xz * factor;
    // diskPos.xz      = diskPos.xz * ringIndex;  //uniform for now
    // diskPos.y       = 0.0;

    // fs_TexCoord = diskPos.xz / 11.0;  // Texture coord for the repeated tile

    // float s01 = texture(u_TextureMap, fs_TexCoord+off.xy).x;
    // float s21 = texture(u_TextureMap, fs_TexCoord+off.zy).x;
    // float s10 = texture(u_TextureMap, fs_TexCoord+off.yx).x;
    // float s12 = texture(u_TextureMap, fs_TexCoord+off.yz).x;
    // vec3 va = normalize(vec3(size.xy,s21-s01));
    // vec3 vb = normalize(vec3(size.yx,s12-s10));

    // fs_Normal = cross(va,vb).rbg;

    // No abs value
    // dx and dz from s01 to s12, can uniformly scale them to increase or decrease intensity of normal displacement
    // y = sqrt(dx * dx + dz * dz - 1) for a normalized normal



    //fs_Normal = normalize(vec3(abs(s21-s01), 0.0, abs(s12-s10)));
    //fs_Normal = normalize(vec3(fs_Normal.x, 2., fs_Normal.z));

    

    //diskPos.y = (texture(u_TextureMap, fs_TexCoord).y - 0.5) * 0.8;
    //diskPos.y += sin(cos(u_Time * 0.03 * texture(u_TextureMap, fs_TexCoord).y)) * 0.04;

    // fs_LightVec = normalize(lightPos - diskPos.xyz);

    // gl_Position = u_ViewProj * u_Model * diskPos;
} 