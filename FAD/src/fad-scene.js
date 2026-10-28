import * as THREE from 'three/webgpu';
const clamp=THREE.MathUtils.clamp;
const smooth=(a,b,v)=>{const x=clamp((v-a)/(b-a),0,1);return x*x*x*(x*(x*6-15)+10);};
// Deterministic material detail avoids flicker or random frame-to-frame changes.
function grain(base,repeat=1,wood=false){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=base;ctx.fillRect(0,0,256,256);let seed=17;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};for(let i=0;i<20000;i++){const v=rand();ctx.fillStyle=`rgba(${v>.5?255:0},${v>.5?255:0},${v>.5?255:0},${wood?.055:.028})`;ctx.fillRect(rand()*256,rand()*256,wood?1:2,wood?12:2);}if(wood){ctx.strokeStyle='#796d4c55';for(let x=0;x<256;x+=24){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,256);ctx.stroke();}}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=4;return t;}
export async function createFadScene(canvas,{forceWebGL=false,quality='high',cinematic=false}={}){
 const renderer=new THREE.WebGPURenderer({canvas,antialias:true,alpha:false,forceWebGL});await renderer.init();renderer.setPixelRatio(1);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=cinematic?1.05:.95;renderer.shadowMap.enabled=true;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.type=THREE.PCFShadowMap;
 const scene=new THREE.Scene();scene.background=new THREE.Color(cinematic?'#796968':'#c5dce6');scene.fog=new THREE.Fog(cinematic?'#796968':'#c5dce6',cinematic?65:90,200);const camera=new THREE.PerspectiveCamera(45,16/9,.2,500);
 scene.add(new THREE.HemisphereLight(cinematic?'#91a8c8':'#dbeaf3',cinematic?'#3f4135':'#74815b',cinematic?.85:1.5));const sun=new THREE.DirectionalLight(cinematic?'#ffbf7c':'#fff2d6',cinematic?4.5:3.4);sun.position.set(-30,cinematic?12:45,25);sun.castShadow=true;sun.shadow.autoUpdate=false;sun.shadow.mapSize.set(quality==='high'?2048:1024,quality==='high'?2048:1024);sun.shadow.camera.left=-55;sun.shadow.camera.right=55;sun.shadow.camera.top=55;sun.shadow.camera.bottom=-55;sun.shadow.camera.far=140;sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;scene.add(sun);scene.add(sun.target);
 const sky=document.createElement('canvas');sky.width=512;sky.height=256;const skyContext=sky.getContext('2d');const skyGradient=skyContext.createLinearGradient(0,0,0,256);skyGradient.addColorStop(0,cinematic?'#465578':'#8fb7d5');skyGradient.addColorStop(.5,cinematic?'#e5af83':'#e4e9de');skyGradient.addColorStop(.65,'#939b72');skyGradient.addColorStop(1,'#576449');skyContext.fillStyle=skyGradient;skyContext.fillRect(0,0,512,256);const environment=new THREE.CanvasTexture(sky);environment.mapping=THREE.EquirectangularReflectionMapping;environment.colorSpace=THREE.SRGBColorSpace;scene.environment=environment;scene.environmentIntensity=cinematic?.45:.3;if(cinematic){scene.background=environment;scene.backgroundBlurriness=.25;scene.backgroundIntensity=.75;}
 const materials={wall:new THREE.MeshStandardMaterial({map:grain('#edece2',2),roughness:.86}),green:new THREE.MeshStandardMaterial({map:grain('#577564',2),roughness:.8}),roof:new THREE.MeshStandardMaterial({color:'#ebe9de',roughness:.7}),concrete:new THREE.MeshStandardMaterial({map:grain('#acb1a5',4),roughness:.92}),wood:new THREE.MeshStandardMaterial({map:grain('#aa936a',2,true),roughness:.8}),frame:new THREE.MeshStandardMaterial({color:'#233e35',metalness:.25,roughness:.38}),glass:new THREE.MeshPhysicalMaterial({color:'#7b9b9d',metalness:.2,roughness:.07,transparent:true,opacity:.82,clearcoat:1}),grass:new THREE.MeshStandardMaterial({map:grain('#748962',90),roughness:1}),path:new THREE.MeshStandardMaterial({map:grain('#c3bca9',8),roughness:1}),bark:new THREE.MeshStandardMaterial({map:grain('#776344',2,true),roughness:1}),leaves:new THREE.MeshStandardMaterial({color:'#567d4b',roughness:1})};
 const boxGeometry=new THREE.BoxGeometry(1,1,1);const box=(group,x,y,z,w,h,d,mat)=>{const mesh=new THREE.Mesh(boxGeometry,materials[mat]);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=mat!=='glass';mesh.receiveShadow=true;group.add(mesh);return mesh;};
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(360,360),materials.grass);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
 const site=new THREE.Group();scene.add(site);box(site,0,.025,6,64,.05,3.8,'path');box(site,12,.025,10,3,.05,46,'path');box(site,-3,.026,22,52,.05,3,'path');
 function home(){const g=new THREE.Group();box(g,0,.15,0,6.5,.3,6.6,'concrete');box(g,0,1.65,-.72,6,3,4.55,'wall');box(g,0,3.2,0,6.8,.17,6.8,'roof');box(g,2.75,1.95,1.78,.24,3.9,1.5,'green');box(g,-2.7,1.68,2.35,.2,3,.2,'wall');box(g,0,.36,2.3,5.1,.13,1.7,'wood');box(g,0,.17,3.7,3,.18,.65,'concrete');
  function window(x,y,z,w,h,d,side=false){box(g,x,y,z,w+.14,h+.14,d+.03,'frame');const pane=box(g,x,y,z+(side?0:.025),w,h,d+.055,'glass');if(side)pane.position.x+=.025;}
  window(.8,1.45,1.575,.9,2.3,.035);window(-1.65,1.76,1.575,1.1,1.45,.035);window(3.025,1.75,-1,.035,1.45,1.1,true);window(-3.025,1.75,-1,.035,1.45,1.1,true);window(-1.5,1.75,-3.02,1.1,1.45,.035);window(1.5,1.75,-3.02,1.1,1.45,.035);box(g,-1.7,1.35,1.65,.06,2.6,.03,'wood');return g;}
 const homes=[];for(let row=0;row<2;row++)for(let col=0;col<5;col++){const g=home();g.position.set(-26+col*8,0,row*11);site.add(g);homes.push(g);box(site,g.position.x,.027,g.position.z+4.2,1.9,.05,2.4,'path');}
 // Hero home is the centre-left module. Facilities remain project-configured concepts.
 const hero=homes[1];
 function facility(x,z,count,type){const g=new THREE.Group();for(let i=0;i<count;i++){box(g,(i-(count-1)/2)*5.3,1.65,0,5.25,3.1,6,'wall');for(const wx of[-1.4,1.4]){box(g,(i-(count-1)/2)*5.3+wx,1.65,3.03,1.7,1.7,.12,'frame');box(g,(i-(count-1)/2)*5.3+wx,1.65,3.1,1.55,1.55,.04,'glass');}box(g,(i-(count-1)/2)*5.3,1.7,3.07,1,2.55,.12,'wood');}
  box(g,0,.12,.5,count*5.3+.6,.24,8.4,'concrete');box(g,0,3.3,.5,count*5.3+.9,.2,8.8,'roof');box(g,0,3.05,4.2,count*5.3+.9,.45,.4,'green');for(let i=0;i<=count;i++)box(g,(i-count/2)*5.3,1.65,4.35,.18,3.05,.18,'green');
  if(type==='health'){box(g,0,2.85,4.43,.2,.9,.12,'wall');box(g,0,2.85,4.43,.7,.2,.12,'wall');}g.position.set(x,0,z);site.add(g);return g;}
 const facilities=[facility(23,-5,3,'school'),facility(25,11,3,'workers'),facility(-3,29,4,'health')];
 // Geometric trees use authored meshes rather than photographic or generated textures.
 const treeGeometry=cinematic?new THREE.SphereGeometry(1,12,8):new THREE.IcosahedronGeometry(1,1);const trunkGeometry=new THREE.CylinderGeometry(.2,.3,4,6);
 const trees=[];
 for(let n=0;n<46;n++){const a=n/46*Math.PI*2,radius=42+(n%3)*5;const g=new THREE.Group();const trunk=new THREE.Mesh(trunkGeometry,materials.bark);trunk.position.y=2;trunk.castShadow=true;g.add(trunk);for(let i=0;i<3;i++){const leaf=new THREE.Mesh(treeGeometry,materials.leaves);leaf.position.set((i-1)*1.3,5+i%2,0);leaf.scale.set(2.3,2.7,2.3);leaf.castShadow=true;g.add(leaf);}g.position.set(Math.cos(a)*radius,0,Math.sin(a)*radius+8);g.scale.setScalar(.8+(n%4)*.15);scene.add(g);trees.push(g);}
 // Planting beds, shaded paths and facade details soften the repeatable plan.
 for(const g of homes){box(g,-2,.22,3.5,1.8,.4,.8,'concrete');box(g,-2,.55,3.5,1.7,.45,.7,'green');box(g,2.4,.22,3.3,.9,.4,.9,'concrete');box(g,2.4,.65,3.3,.8,.7,.8,'green');for(let i=0;i<5;i++)box(g,-2.7+i*.2,1.7,1.61,.05,2.7,.07,'wood');}
 const mountains=new THREE.Group();for(let n=0;n<12;n++){const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshStandardMaterial({color:'#789782',roughness:1}));mesh.position.set(Math.sin(n)*130,-5,Math.cos(n)*130);mesh.scale.set(40,12+n%3*5,40);mountains.add(mesh);}scene.add(mountains);
 // A person provides scale and a narrative for the authored opening film.
 let worker=null;const joints=[];const characterMaterials=[];const characterGeometry=[];
 if(cinematic){
  materials.glass.emissive=new THREE.Color('#ffb965');materials.glass.emissiveIntensity=1.25;materials.glass.color.set('#c2b08a');
  worker=new THREE.Group();scene.add(worker);
  const jacket=new THREE.MeshStandardMaterial({color:'#21473d',roughness:.9}),trousers=new THREE.MeshStandardMaterial({color:'#262d35',roughness:.95}),skin=new THREE.MeshStandardMaterial({color:'#b78e70',roughness:1}),hat=new THREE.MeshStandardMaterial({color:'#d9ad48',roughness:.75}),boots=new THREE.MeshStandardMaterial({color:'#302923',roughness:1});characterMaterials.push(jacket,trousers,skin,hat,boots);
  const capsule=(group,x,y,z,r,h,mat)=>{const geometry=new THREE.CapsuleGeometry(r,h,4,8);characterGeometry.push(geometry);const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;group.add(m);return m;};
  capsule(worker,0,1.23,0,.16,.35,jacket);capsule(worker,0,.9,0,.15,.08,trousers);capsule(worker,0,1.64,0,.12,.06,skin);capsule(worker,0,1.78,0,.14,.015,hat);
  for(const side of[-1,1]){const leg=new THREE.Group();leg.position.set(side*.09,.86,0);worker.add(leg);capsule(leg,0,-.21,0,.062,.3,trousers);capsule(leg,0,-.61,0,.055,.3,trousers);capsule(leg,0,-.82,.045,.06,.04,boots);const arm=new THREE.Group();arm.position.set(side*.21,1.43,0);worker.add(arm);capsule(arm,0,-.14,0,.047,.2,jacket);capsule(arm,0,-.38,0,.042,.2,skin);joints.push({leg,arm,side});}
  // Small warm lights complement sunset rather than lighting the entire site uniformly.
  for(const home of homes){const light=new THREE.PointLight('#ffc785',2.5,7,2);light.position.set(home.position.x,2,home.position.z+1);scene.add(light);}
 }
 // Continuous dolly-to-crane path, with a matching target spline. No full orbit,
 // camera cuts, handheld jitter, or frame-dependent animation.
 const cameraPath=new THREE.CatmullRomCurve3([
  new THREE.Vector3(-14.8,2.8,13),new THREE.Vector3(-10,7,23),
  new THREE.Vector3(16,21,48),new THREE.Vector3(51,40,69)
 ]);
 const focusPath=new THREE.CatmullRomCurve3([
  new THREE.Vector3(-18,1.5,1),new THREE.Vector3(-15,1.5,4),
  new THREE.Vector3(-5,1.5,9),new THREE.Vector3(0,2,12)
 ]);
 async function renderTrailer(progress){
  const p=clamp(progress,0,1),seconds=p*18;
  // Quintic easing brings the rig gently into motion and settles on the wide.
  const travel=smooth(0,1,p);
  camera.fov=camera.aspect<1?57:44;camera.updateProjectionMatrix();
  camera.position.copy(cameraPath.getPoint(travel));camera.lookAt(focusPath.getPoint(travel));
  // Modules settle into their plots as the camera reveals the development.
  for(let n=0;n<homes.length;n++){
   const g=homes[n],reveal=g===hero?1:smooth(.15+n*.018,.32+n*.018,p);
   g.visible=reveal>0;g.scale.y=1;g.position.y=-(1-reveal)*3.6;
  }
  facilities.forEach((g,n)=>{const reveal=smooth(.48+n*.045,.67+n*.045,p);g.visible=reveal>0;g.scale.y=1;g.position.y=-(1-reveal)*3.6;});
  // A very small breeze, offset per tree, gives the locked geometry natural life.
  trees.forEach((g,n)=>{g.rotation.z=Math.sin(seconds*.85+n*1.7)*.006;g.rotation.x=Math.sin(seconds*.6+n)*.003;});
  if(worker){
   const walking=smooth(0,5,seconds),stride=seconds*5.2,amplitude=1-smooth(4,5,seconds);
   worker.position.set(hero.position.x-1.9+walking*2.4,.02+Math.abs(Math.sin(stride))*.025*amplitude,4.4);worker.rotation.y=Math.PI/2;
   for(const {leg,arm,side}of joints){leg.rotation.x=Math.sin(stride)*.28*side*amplitude;arm.rotation.x=-Math.sin(stride)*.2*side*amplitude;}
  }
  renderer.shadowMap.needsUpdate=true;sun.shadow.needsUpdate=true;
  renderer.render(scene,camera);if(renderer.backend.isWebGPUBackend)await renderer.backend.device.queue.onSubmittedWorkDone();
 }
 let width=1280,height=720,lastShadowProgress=-1;
 function resize(w,h){width=Math.max(1,Math.round(w));height=Math.max(1,Math.round(h));renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
 function update(progress=0,angle=.65){const p=clamp(progress,0,1);if(Math.abs(p-lastShadowProgress)>.004){renderer.shadowMap.needsUpdate=true;sun.shadow.needsUpdate=true;lastShadowProgress=p;}for(let n=0;n<homes.length;n++){const g=homes[n];const reveal=g===hero?1:smooth(.2+n*.023,.38+n*.023,p);g.visible=reveal>.001;g.scale.y=Math.max(.001,reveal);}for(let n=0;n<facilities.length;n++){const reveal=smooth(.68+n*.05,.86+n*.05,p);facilities[n].visible=reveal>.001;facilities[n].scale.y=Math.max(.001,reveal);}
  const transition=smooth(.1,.78,p);const target=new THREE.Vector3().lerpVectors(new THREE.Vector3(hero.position.x,1.4,0),new THREE.Vector3(0,1.5,10),transition);const portrait=camera.aspect<1;const radius=THREE.MathUtils.lerp(portrait?24:17,portrait?100:68,transition);camera.position.set(target.x+Math.sin(angle)*radius,target.y+THREE.MathUtils.lerp(6,35,transition),target.z+Math.cos(angle)*radius);camera.lookAt(target);}
 async function render(progress,angle){update(progress,angle);renderer.render(scene,camera);if(renderer.backend.isWebGPUBackend)await renderer.backend.device.queue.onSubmittedWorkDone();}
 function dispose(){characterMaterials.forEach(m=>m.dispose());characterGeometry.forEach(g=>g.dispose());renderer.dispose();environment.dispose();boxGeometry.dispose();Object.values(materials).forEach(m=>{m.map?.dispose();m.dispose();});treeGeometry.dispose();trunkGeometry.dispose();mountains.children.forEach(m=>{m.geometry.dispose();m.material.dispose();});}
 resize(width,height);return{renderer,scene,camera,render,renderTrailer,resize,dispose,backend:renderer.backend.isWebGPUBackend?'webgpu':'webgl',device:renderer.backend.device};
}
