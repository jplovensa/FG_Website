/* Depth-aware ambient contact shading and antialiasing, computed from the live WebGL scene. */
(() => {
'use strict';const T=globalThis.THREE;if(!T)return;
function create(renderer){
 if(!renderer.capabilities.isWebGL2&&(!renderer.extensions.has('WEBGL_depth_texture')||!renderer.extensions.has('OES_standard_derivatives')))return null;
 const target=new T.WebGLRenderTarget(1,1,{minFilter:T.LinearFilter,magFilter:T.LinearFilter,depthBuffer:true});target.samples=renderer.capabilities.isWebGL2?2:0;target.depthTexture=new T.DepthTexture(1,1,T.UnsignedIntType);
 const uniforms={colorMap:{value:target.texture},depthMap:{value:target.depthTexture},inverseProjection:{value:new T.Matrix4()},projectionScale:{value:1},resolution:{value:new T.Vector2(1,1)},exposure:{value:1},strength:{value:.62}};
 const material=new T.ShaderMaterial({uniforms,depthTest:false,depthWrite:false,toneMapped:false,extensions:{derivatives:true},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
 varying vec2 vUv;uniform sampler2D colorMap,depthMap;uniform mat4 inverseProjection;uniform vec2 resolution;uniform float projectionScale,exposure,strength;
 vec3 viewPos(vec2 uv){float d=texture2D(depthMap,uv).x;vec4 p=inverseProjection*vec4(uv*2.-1.,d*2.-1.,1.);return p.xyz/p.w;}
 vec3 displayColor(vec3 x){x*=exposure;x=clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);return mix(x*12.92,1.055*pow(x,vec3(1./2.4))-.055,step(vec3(.0031308),x));}
 void main(){vec3 color=texture2D(colorMap,vUv).rgb;float depth=texture2D(depthMap,vUv).x;float ao=0.;
 if(depth<.9999){vec3 p=viewPos(vUv),n=normalize(cross(dFdx(p),dFdy(p)));if(n.z<0.)n=-n;float radius=clamp(.7*projectionScale*resolution.y/max(-p.z,.1),2.,36.);
 for(int i=0;i<12;i++){float fi=float(i),angle=fi*2.399963;vec2 offset=vec2(cos(angle),sin(angle))*radius*(.25+.75*(fi+1.)/12.)/resolution;vec2 uv=clamp(vUv+offset,vec2(.001),vec2(.999));vec3 delta=viewPos(uv)-p;float len=length(delta);ao+=max(dot(n,delta/max(len,.0001))-.12,0.)*(1.-smoothstep(.05,1.4,len));}
 color*=1.-clamp(ao/12.*2.7,0.,.6)*strength;}
 vec2 t=1./resolution;vec3 a=texture2D(colorMap,vUv+vec2(t.x,0.)).rgb,b=texture2D(colorMap,vUv-vec2(t.x,0.)).rgb,c=texture2D(colorMap,vUv+vec2(0.,t.y)).rgb,d=texture2D(colorMap,vUv-vec2(0.,t.y)).rgb;float edge=length(a-b)+length(c-d);color=mix(color,(color*4.+a+b+c+d)/8.,smoothstep(.2,1.5,edge)*.18);gl_FragColor=vec4(displayColor(color),1.);}`});
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,0,1);scene.add(new T.Mesh(new T.PlaneGeometry(2,2),material));let failed=false,sceneTriangles=0;
 function draw(world,view){if(failed){renderer.render(world,view);return;}const size=renderer.getDrawingBufferSize(new T.Vector2());if(size.x!==target.width||size.y!==target.height){target.setSize(size.x,size.y);uniforms.resolution.value.copy(size);}uniforms.inverseProjection.value.copy(view.projectionMatrixInverse);uniforms.projectionScale.value=view.projectionMatrix.elements[5];uniforms.exposure.value=renderer.toneMappingExposure;try{renderer.setRenderTarget(target);renderer.render(world,view);sceneTriangles=renderer.info.render.triangles;renderer.setRenderTarget(null);renderer.render(scene,camera);}catch{renderer.setRenderTarget(null);failed=true;renderer.render(world,view);}}
 return {draw,setQuality:quality=>{const samples=renderer.capabilities.isWebGL2?(quality==='render'?4:2):0;if(target.samples!==samples){target.samples=samples;target.dispose();}},info:()=>({contactShading:!failed,multisamples:target.samples,triangles:sceneTriangles,renderWidth:target.width,renderHeight:target.height})};
}
globalThis.GreenShiftPost=Object.freeze({create});
})();
