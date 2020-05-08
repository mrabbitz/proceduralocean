#version 300 es
precision highp float;

uniform float u_WidthWireframe;
uniform float u_SkyboxIntensity;
uniform vec3 u_Eye;
uniform samplerCube u_CubeMap;
uniform int u_ShadingMode;
uniform float u_FogIntensity;
uniform float u_FogSight;

in vec3 fs_BcCoord;
in vec3 fs_LightVec;
in vec3 fs_worldPosition;
in vec3 fs_worldNormal;
in float fs_Amplitude;

out vec4 out_Col;


vec3 waterDeepColor = vec3(0.0, 0.4, 0.6);
vec3 waterScatterColor = vec3(0.0, 0.7, 0.6);
vec2 waterIntensity = vec2(0.2, 0.1);

struct SurfaceAttributes {
   vec3 eyeDir;
   vec3 normal;
};

float saturate(float x)
{
  return max(0.0, min(1.0, x));
}

vec3 applyFog( in vec3  rgb,      // original color of the pixel
               in float distance, // camera to point distance
               in vec3  rayDir,   // camera to point vector
               in vec3  sunDir )  // sun light direction
{
    float fogAmount = 1.0 - exp( -distance*.04 * u_FogIntensity * 4. );
    float sunAmount = max( dot( rayDir, sunDir ), 0.0 );
    vec3  fogColor  = u_SkyboxIntensity*mix( vec3(0.5,0.6,0.7), // bluish
                           vec3(1.0,0.9,0.7), // yellowish
                           pow(sunAmount,8.0) );
    return mix( rgb, fogColor, fogAmount );
}

void main()
{
    if(any(lessThan(fs_BcCoord, vec3(u_WidthWireframe)))) {
		
		vec3 worldNormal = normalize(fs_worldNormal);
		vec3 eyeToSurfaceDir = normalize(fs_worldPosition - u_Eye);
		
		SurfaceAttributes surface_attributes = SurfaceAttributes(-eyeToSurfaceDir, worldNormal);

	    float fresnel;
	    float diffuse;
	    float scatter;

	    vec3 fragToLightVec = normalize(fs_LightVec);
	    vec3 fragToEyeVec = surface_attributes.eyeDir;
	    vec3 reflectedEyeToFragVec = reflect(-surface_attributes.eyeDir, surface_attributes.normal);

	    // scattering/double refraction approximation with scatter term
	
	    // more scattered light = the closer to the crest
	    scatter = 1.0 * max(0.0, fs_worldPosition.y / fs_Amplitude);

		// more scattered light = the more in line the fragment-to-camera and fragment-to-light vectors are
	    // we project onto the x-z water plane and take the dot product
	    scatter *= pow(max(0.0, dot(normalize(vec3(fragToLightVec.x, 0.0, fragToLightVec.z)), -fragToEyeVec)), 2.0);
	
		// more scattered light = the less the normal aligns with the light direction
		// Equivalent to the light coming from light source, going through other side of wave, and then coming through the closer side of the wave (that has its normal pointed away from light source)
	    scatter *= pow(max(0.0, 0.5 - 0.5 * dot(fragToLightVec, surface_attributes.normal)), 3.0);
	
	
	    // more scattered light under the crests
	    scatter += 2.0 * waterIntensity.y * max(0.0, fs_worldPosition.y / fs_Amplitude) *
			// more scattered light = the more the normal aligns with the viewing direction
		    max(0.0, dot(fragToEyeVec, surface_attributes.normal));

	
	    // fresnel
	    float fresnelBias = (1.0 - 1.13) * (1.0 - 1.13) / (1.0 + 1.13);
	    fresnel = fresnelBias + (1.0 - fresnelBias) * pow(saturate(1.0 - dot(surface_attributes.normal, fragToEyeVec)), 4.0);

	    // diffuse
	    diffuse = waterIntensity.x + waterIntensity.y * max(0.0, dot(fragToLightVec, surface_attributes.normal));

	    vec3 refraction_color = diffuse * waterDeepColor;

	    // adding scatter
	    refraction_color += waterScatterColor * scatter;

	    // reflection
	    vec3 reflection_color = mix(texture(u_CubeMap, reflectedEyeToFragVec).xyz, waterDeepColor, 0.5) * u_SkyboxIntensity;

	    // fading reflection color to deep water color as reflected vector points below water surface
	    reflection_color.rgb *= mix(reflection_color, waterDeepColor, max(0.0, min(1.0, -reflectedEyeToFragVec.y * 4.0)));
	
	    vec3 water_color;
		if (u_ShadingMode == 1) {			// fresnel law
			water_color = mix(refraction_color, reflection_color, fresnel);
		} else if (u_ShadingMode == 2) {	// refraction
			water_color = refraction_color;
		} else if (u_ShadingMode == 3) {	// reflection
			water_color = reflection_color;
		} else {							// fresnel law
			water_color = mix(refraction_color, reflection_color, fresnel);
		}

		// FOG ON SURFACE
		water_color = applyFog( water_color,		// original color of the pixel
               distance(fs_worldPosition, u_Eye),	// camera to point distance
               eyeToSurfaceDir,						// camera to point vector
               fragToLightVec);						// sun light direction

		// DISTANCE OF SIGHT ON SURFACE
		water_color = mix(water_color,
						  mix(	vec3(0.5,0.6,0.7), // bluish
                        		vec3(1.0,0.9,0.7), // yellowish
                        		0.5
							 ) * u_SkyboxIntensity,
						  clamp(0., 1., distance(fs_worldPosition, u_Eye) * u_FogIntensity / pow(u_FogSight, 2.5)));

        out_Col = vec4(water_color, 1.0);
    }
    else {
       discard;
    }
}