#version 300 es

uniform mat4 u_Model;
uniform mat4 u_ViewProj;
uniform float u_Time;
uniform int u_SeaState;
uniform float u_WindDirection;
uniform float u_NumRings;
uniform float u_WaveSpeed;

in vec4 vs_Pos;
in vec3 vs_BcCoord;

out vec3 fs_BcCoord;
out vec3 fs_LightVec;
out vec3 fs_worldPosition;
out vec3 fs_worldNormal;
out float fs_Amplitude;

const float TWO_PI = 6.283185307;
const float GRAVITY = 9.81;          // meters per secs^2
const float AMP_SCL = 0.1125;
const vec3 lightPos = vec3(-1000.0, 850.0, -850.0);

struct Wave
{
    float angle;
    float angFreq;
    float phaseAng;
};

float waveHeight[6] = float[](0.6096,1.2191,1.5240,2.1335,3.0480,4.5710);
float wavePeriod[6] = float[](3.0,5.0,8.0,11.0,13.0,16.0);

int numWvComp = 10;
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

void main() 
{
    fs_Amplitude = waveHeight[u_SeaState - 1] * 0.5;
    fs_BcCoord = vs_BcCoord;

    float windDir = u_WindDirection;
    int seaState = u_SeaState;
    float waveSpeed = u_WaveSpeed * 0.01;

    // Get cylindircal represenatation of ocean
    // Flatten cylinder into a 2D disk representation of the ocean
    float nRings = u_NumRings;

    // flatten with uniform ring displacement
    vec4 diskPos    = vs_Pos;
    float ringIndex = diskPos.y;
    diskPos.xz      = diskPos.xz * ringIndex;
    diskPos.y       = 0.0;

    // verying ring displacement
    float ringRatio = 2. * ringIndex / nRings;
    float factor    = pow(ringRatio, 4.0);
    diskPos.xz      = diskPos.xz * factor;

    vec3 Normal = vec3(0.0, 1.0, 0.0);

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
	    cosine = cos(k * d + (omega * w * u_Time * waveSpeed) + waves[n].phaseAng);
        diskPos.y += (AMP_SCL * waveHeight[seaState - 1] * cosine);

        sine = k * sin(k * d + (omega * w * u_Time * waveSpeed) + waves[n].phaseAng);

        Normal[0] += (-AMP_SCL * waveHeight[seaState - 1] * waveDir[0] * sine);
        Normal[2] += (-AMP_SCL * waveHeight[seaState - 1] * waveDir[1] * sine);
    }
    Normal = normalize(Normal);

    fs_LightVec = normalize(lightPos - diskPos.xyz);

    fs_worldPosition = (u_Model * diskPos).xyz;

    fs_worldNormal = mat3(u_Model) * Normal;

    gl_Position = u_ViewProj * u_Model * diskPos;
} 