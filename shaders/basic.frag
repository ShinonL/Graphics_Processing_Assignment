#version 410 core

in vec3 fPosition;
in vec3 fNormal;
in vec2 fTexCoords;
in vec4 fPosEye;

out vec4 fColor;

//matrices
uniform mat4 model;
uniform mat4 view;
uniform mat3 normalMatrix;
//lighting
uniform vec3 lightDir;
uniform vec3 lightColor;
// textures
uniform sampler2D diffuseTexture;
uniform sampler2D specularTexture;

uniform bool isPointLight;
uniform bool isFog;

//components
vec3 ambient;
float ambientStrength = 0.2f;
vec3 diffuse;
vec3 specular;
float specularStrength = 0.5f;
float shininess = 30.0f;

vec3 pointAmbient, pointDiffuse, pointSpecular;

float KC = 1.0f;
float KL = 0.0045f;
float KQ = 0.0075f;

void computeDirLight()
{
    //compute eye space coordinates
    vec4 fPosEye = view * model * vec4(fPosition, 1.0f);
    vec3 normalEye = normalize(normalMatrix * fNormal);

    //normalize light direction
    vec3 lightDirN = vec3(normalize(view * vec4(lightDir, 0.0f)));

    //compute view direction (in eye coordinates, the viewer is situated at the origin
    vec3 viewDir = normalize(- fPosEye.xyz);

    //compute ambient light
    ambient = ambientStrength * lightColor;

    //compute diffuse light
    diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor;

    //compute specular light
    vec3 reflectDir = reflect(-lightDirN, normalEye);
    float specCoeff = pow(max(dot(viewDir, reflectDir), 0.0f), 32);
    specular = specularStrength * specCoeff * lightColor;
}

void computePointLight(vec4 lightPos) {
    vec4 lightPosEye = view * lightPos;
    vec3 cameraPosEye = vec3(0.0f);
	vec3 normalEye = normalize(fNormal);	
    vec3 lightDirN = normalize(lightDir);
    vec3 viewDirN = normalize(cameraPosEye - fPosEye.xyz);

    float dist = length(lightPosEye.xyz - fPosEye.xyz);
    float attenuation = 1.0f / (KC + KL * dist + KQ * dist * dist);

    pointAmbient = attenuation * ambientStrength * lightColor;
    pointDiffuse = attenuation * max(dot(normalEye, lightDirN), 0.0f) * lightColor;

    vec3 refl = reflect(-lightDirN, normalEye);
    float specCoeff = pow(max(dot(viewDirN, refl), 0.0f), shininess);
    pointSpecular = attenuation * specularStrength * specCoeff * lightColor;
}

float computeFog() {
    float fogDensity = 0.005f;
    float fragmentDistance = length(fPosEye);
    float fogFactor = exp(-pow(fragmentDistance * fogDensity, 2));
    
    return clamp(fogFactor, 0.0f, 1.0f);
}


void main() 
{
    vec3 color;

    if (isPointLight) {
        color = vec3(0, 0, 0);
        vec4 lampPos[] = { vec4(-30, 10, -5, 1.0f), vec4(-35, 10, 0, 1.0f) };

        for (int i = 0; i < 2; i++) {
            computePointLight(lampPos[i]);
            color += min((pointAmbient + pointDiffuse) * texture(diffuseTexture, fTexCoords).rgb + pointSpecular * texture(specularTexture, fTexCoords).rgb, 1.0f);
        }
    } else {
        computeDirLight();

        //compute final vertex color
        color = min((ambient + diffuse) * texture(diffuseTexture, fTexCoords).rgb + specular * texture(specularTexture, fTexCoords).rgb, 1.0f);
    }

    if (isFog) {
        float fogFactor = computeFog();
        vec4 fogColor = vec4(0.5f, 0.5f, 0.5f, 1.0f);
        fColor = fogColor * (1 - fogFactor) + vec4(color, 1.0f) * fogFactor;
    } else fColor = vec4(color, 1.0f);
}
