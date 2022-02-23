// some refreshers and inspiration from: https://www.shadertoy.com/view/MtKXRt

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
}

void main() {
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
    color += vec3(pow(sum,2.)-0.999) * thresh; 
    color.r *= 0.9;
    color.b *= 0.89;
    color.g *= 0.95;
    gl_FragColor = vec4(color, 1.0);
}