const SHADER_WAVE_C = `
  #define tau 6.28318530718

float sin01(float x) {
	return (sin(x*tau)+1.)/2.;
}
float cos01(float x) {
	return (cos(x*tau)+1.)/2.;
}

//cos between m and 1
float cosm1(float x, float m) {
    float c = 1. - m;
	float y = cos(x*tau/2.)*c+(1.-c);
    return y/2. + .5;
}

float smoothFract(float x, float blurLevel) {
	return pow(cos01(x), 1./blurLevel);
}

float euclDist(vec2 from, vec2 to) {
	return length(from - to);
}

float circ(vec2 uv, vec2 pos, float radius) {
    float dist = euclDist(uv, pos);
    return smoothstep(radius, 0., dist);
}

vec2 rot(vec2 v, float angle) {
    mat2 m;
    m[0] = vec2(cos(angle), sin(angle));
    m[1] = vec2(-sin(angle), cos(angle));
    return m * v;
}

vec3 vignette (vec2 uv, vec3 col, float amt) {
    float len = clamp(0.,1.,length(uv));
    return col * smoothstep(1., 0., len * amt);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Pixel coordinates centered at 0,0
    vec2 uv = (fragCoord-iResolution.xy/2.)/iResolution.xy;
    float aspectRatio = iResolution.x / iResolution.y;
	uv.x *= aspectRatio;

    float t = iTime * .2;
    
	// Distort uv coordinates
    float amplitude = .2;
    float turbulence = 1.3;
    uv.xy += sin01(uv.x*turbulence + t) * amplitude;
    uv.xy -= sin01(uv.y*turbulence + t) * amplitude;
    
    // Rotate grid as time goes by
    uv.xy = rot(uv.xy, t / 2.);
    
    //uv.xy = shear(uv.xy, t);
    
    // Create grid
    float gridSize = 4.;
    
    // Define lines
    float bright = 0.;
    float blurAmount = 0.2;
    float linesX = smoothFract(uv.y * gridSize, blurAmount);
    bright = linesX;
    
    float linesY = smoothFract(uv.x * gridSize, blurAmount);
    bright += linesY;
    
    // Convert lines to color
    vec3 linesColor = vec3(.42,.8,1.);
    vec3 col = linesColor*bright;
    
    // Background color
    vec3 backgroundColor = vec3(0.2,.6,.9);
    col += backgroundColor*(1.-bright);
    
    // Apply vignette
    col = vignette(uv, col, .4);
    
    // Output to screen
    fragColor = vec4(col,1.0);
}`;
const SHADER_SIDE_MOVING = `
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    //smooth time-based 0-1 values
    float i = cos(iTime);
    float j = sin(iTime);
    float k = (i + j) / 2.;
    //smooth position-based 0-1 values
    float l = cos(uv.x);
    float m = sin(uv.y);
    float n = (l + m) / 2.;

    float amplitude = 1. - (.5 / cos((n + k) / 2.));

    //RGB colors
    float r = pow(l, i) * amplitude;
    float g = pow(m, j) * amplitude;
    float b = pow(n, k) * amplitude;

    //output
    fragColor = vec4(r, g, b, 1.0);
}`;
const SHADER_CENTER_GRADIENT = `
  // cosine based palette, 4 vec3 params
vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    float time = iTime*0.2;

    // Calculate two points on screen.

    vec2 c1 = vec2(sin(time)*0.5, cos(iTime)*0.7);
    vec2 c2 = vec2(sin(time*0.7)*0.9, cos(iTime*0.65)*0.6);

    //Determine length to point 1 & calculate color.
    float d1 = length( uv - c1);
    vec3 col1 = palette( d1+time,vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.10,0.20));

    //Determine length to point 2 & calculate color.
    float d2 = length( uv - c2);
    vec3 col2 = palette( d2+time,vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.10,0.20));


    // Output to screen
    fragColor = vec4( (col1+col2) / 2.0 ,1.0);
}

  `;

const SHADER_COLOR_CIRCLE = `
  mat2 rotate2d(float angle){
    return mat2(cos(angle),-sin(angle),
                sin(angle),cos(angle));
}

float variation(vec2 v1, vec2 v2, float strength, float speed) {
	return sin(
        dot(normalize(v1), normalize(v2)) * strength + iTime * speed
    ) / 100.0;
}

vec3 paintCircle (vec2 uv, vec2 center, float rad, float width) {

    vec2 diff = center-uv;
    float len = length(diff);

    len += variation(diff, vec2(0.0, 1.0), 5.0, 2.0);
    len -= variation(diff, vec2(1.0, 0.0), 5.0, 2.0);

    float circle = smoothstep(rad-width, rad, len) - smoothstep(rad, rad+width, len);
    return vec3(circle);
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
    uv.x *= 1.5;
    uv.x -= 0.25;

    vec3 color;
    float radius = 0.35;
    vec2 center = vec2(0.5);


    //paint color circle
    color = paintCircle(uv, center, radius, 0.1);

    //color with gradient
    vec2 v = rotate2d(iTime) * uv;
    color *= vec3(v.x, v.y, 0.7-v.y*v.x);

    //paint white circle
    color += paintCircle(uv, center, radius, 0.01);


	fragColor = vec4(color, 1.0);
}
`;
const WAVES = {
  SHADER_WAVE_C,
  SHADER_CENTER_GRADIENT,
  SHADER_COLOR_CIRCLE,
  SHADER_SIDE_MOVING,
}
export default WAVES;
