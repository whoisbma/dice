// OK replace gl_fragcolor first call with adding a color
// OK center in window
// add antialiasing
// try raymarching?
// get positions into correct shapes
// lerp positions on js side


// https://www.shadertoy.com/view/MtKXRt

precision highp float;

#define PI 3.14159265358979

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

uniform float u_blend;

const int NUM_METABALLS = 6;
uniform vec3 u_metaballs[NUM_METABALLS];

float metaball(vec3 mb, vec2 uv, int index) {
    float rnd = float(10 + index + 1)*(PI*2. + .5453);
    vec2 osc = vec2(sin(u_time*2.5 + rnd*3.11)*0.5, cos(u_time*2. + rnd*5.73)*0.4) * rnd*5.;
    mb.xy += vec2(osc * u_blend);
    vec2 p = vec2(mb.xy - uv.xy);
    return mb.z*mb.z/(p.x*p.x + p.y*p.y);
    //return r/(dot(p, p) + 0.0001);
}

void main() {
    // vec2 p = (gl_FragCoord.xy - u_resolution*0.5) / u_resolution.y;

    float oscillatingTime = sin(u_time) * 0.2 + 0.2;
    vec2 normCoord = (gl_FragCoord.xy/u_resolution) * 0.4;
    vec2 normMouse = (u_mouse/u_resolution) * 0.4;

    vec3 color = vec3(0.0505, 0.051, 0.05);

    float x = gl_FragCoord.x;
    float y = gl_FragCoord.y;
    float sum = 0.0;
    for (int i = 0; i < NUM_METABALLS; i++) {
        float tot = metaball(u_metaballs[i], gl_FragCoord.xy, i);
        color += vec3(tot * 0.9, tot * 0.66, tot * 0.5);
        sum += tot;
    }
    float thresh = sum > 1. ? 1. : 0.;

    // float fwDe = fwidth(1.0);
    // float d1 = smoothstep(0., fwDe, sum - 1.);

    color += vec3(pow(sum,2.)-0.999) * thresh; 
    color.r *= 0.9;
    color.b *= 0.89;
    color.g *= 0.95;
    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(sqrt(clamp(col, 0., 1.)), 1);
}