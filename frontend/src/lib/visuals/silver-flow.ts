/** Graphite-sage caustics. Analytic normals preserve the flowing sheet's light and depth. */
export const silverFlow = `
precision highp float;
varying vec2 v_texcoord;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
float sheet(vec2 p, float t) {
  return sin(p.x*2.6+p.y*1.2+t*.19)*.34
       + sin(p.x*5.1-p.y*2.2-t*.14)*.13
       + cos(p.y*3.1+p.x*.8+t*.12)*.23;
}
void main() {
  vec2 uv=v_texcoord;
  vec2 p=(uv-.5)*vec2(u_resolution.x/u_resolution.y,1.)*2.4;
  p+=u_pointer*.07;
  p=mat2(.86,-.51,.51,.86)*p;
  float t=u_time;
  float h=sheet(p,t);
  float e=.012;
  vec3 normal=normalize(vec3((h-sheet(p+vec2(e,0.),t))/e,(h-sheet(p+vec2(0.,e),t))/e,1.));
  vec3 light=normalize(vec3(-.7,.9,1.15));
  vec3 view=normalize(vec3(p*.18,2.));
  vec3 halfDirection=normalize(light+view);
  float specular=pow(max(dot(normal,halfDirection),0.),26.);
  float soft=pow(max(dot(normal,halfDirection),0.),4.);
  float ray=pow(.5+.5*sin(p.x*2.6+p.y*1.1+h*2.1+t*.075),18.);
  float edge=pow(.5+.5*sin(p.x*3.4-p.y*.8+h+t*.1),44.);
  vec3 graphite=vec3(.145,.173,.149);
  vec3 sage=vec3(.412,.459,.396);
  vec3 highlight=vec3(.722,.761,.682);
  vec3 color=vec3(.025,.031,.025);
  color+=graphite*.60*soft;
  color+=highlight*.48*specular;
  color+=sage*.38*ray;
  color+=sage*.30*edge;
  float vignette=smoothstep(1.35,.15,length((uv-.5)*vec2(1.,.8)));
  color*=.72+.28*vignette;
  gl_FragColor=vec4(color,1.);
}`;
