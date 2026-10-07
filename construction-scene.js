// Self-contained architectural renderer: deterministic texture atlas and physical material lighting.
const vertexShader = `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 uModel;
uniform mat4 uCamera;
varying vec3 vNormal;
varying vec3 vWorld;
void main(){
  mat3 basis=mat3(uModel);
  vec3 scaleSquared=vec3(dot(basis[0],basis[0]),dot(basis[1],basis[1]),dot(basis[2],basis[2]));
  vNormal=basis*(aNormal/max(scaleSquared,vec3(.00001)));
  vec4 world=uModel*vec4(aPosition,1.0);
  vWorld=world.xyz;
  gl_Position=uCamera*world;
}`;
const fragmentShader = `
precision highp float;
uniform vec3 uColor;
uniform vec3 uEye;
uniform vec3 uAtmosphere;
uniform float uAlpha;
uniform float uMaterial;
uniform sampler2D uSurface;
uniform vec4 uOccluders[8];
uniform float uOccluderCount;
varying vec3 vNormal;
varying vec3 vWorld;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
vec3 sky(vec3 direction){float height=clamp(direction.y,0.,1.);vec3 tint=mix(vec3(.83,.87,.85),vec3(.42,.62,.75),pow(height,.45));float clouds=noise(direction*9.)*.65+noise(direction*22.)*.35;float cloud=smoothstep(.58,.76,clouds)*smoothstep(0.,.16,height);return mix(tint,vec3(.96,.94,.89),cloud*.55);}
vec3 tile(vec2 uv,float index){vec2 offset=vec2(mod(index,2.),floor(index/2.));return texture2D(uSurface,(offset+(fract(uv)*.984+.008))*.5).rgb;}
vec3 surface(vec3 position,vec3 normal,float index){vec3 w=pow(abs(normal),vec3(5.));w/=max(w.x+w.y+w.z,.0001);return tile(position.yz,index)*w.x+tile(position.xz,index)*w.y+tile(position.xy,index)*w.z;}
void main(){
 vec3 n=normalize(vNormal),view=normalize(uEye-vWorld);
 if(uMaterial>6.5 && uMaterial<7.5){gl_FragColor=vec4(sky(normalize(vWorld-uEye)),1.);return;}
 vec3 base=pow(uColor,vec3(2.2));float rough=.75;float grain=1.;
 if(uMaterial> .5 && uMaterial<3.5){float index=uMaterial-1.;vec3 tex=surface(vWorld*(uMaterial<1.5?1.5:.55),n,index);grain=tex.r;base*=mix(.77,1.15,grain);rough=uMaterial<1.5?.82:uMaterial<2.5?.56:.94;}
 if(uMaterial>2.5 && uMaterial<3.5)base*=.8+noise(vWorld*.7)*.32;
 if(uMaterial>5.5 && uMaterial<6.5){float fleck=noise(vWorld*9.);base*=.72+fleck*.48;rough=.94;}
 if(uMaterial>7.5){base*=mix(.7,1.05,surface(vWorld*1.6,n,3.).r);rough=.38;}
 // Stable world-space relief; surface detail never swims between frames.
 float relief=(uMaterial> .5 && uMaterial<3.5)?(grain-.5)*.028:0.;
 n=normalize(n+vec3(relief,relief*.35,-relief));
 if(uMaterial>4.5 && uMaterial<5.5){vec2 waves=vec2(sin(vWorld.x*.34+vWorld.z*.19),cos(vWorld.z*.29-vWorld.x*.12))*.018;n=normalize(n+vec3(waves.x,0.,waves.y));rough=.12;}
 bool glass=uMaterial>3.5 && uMaterial<4.5;if(glass)rough=.16;
 vec3 light=normalize(vec3(-.65,.85,.52)),halfway=normalize(light+view);
 float shade=1.;for(int i=0;i<8;i++){
  if(float(i)>=uOccluderCount)break;vec3 delta=uOccluders[i].xyz-vWorld;float r=uOccluders[i].w;float along=dot(delta,light);
  if(along>.02 && length(delta)>r*1.05){float spread=length(delta-light*along);shade=min(shade,mix(.42,1.,smoothstep(r*.72,r*1.2,spread)));}
 }
 float ndl=max(dot(n,light),0.),ndv=max(dot(n,view),.001),ndh=max(dot(n,halfway),0.),vdh=max(dot(view,halfway),0.);
 float a=rough*rough,a2=a*a;float den=ndh*ndh*(a2-1.)+1.;float distribution=a2/(3.14159*den*den+.0001);
 float k=(rough+1.)*(rough+1.)/8.;float visibility=(ndl/(ndl*(1.-k)+k))*(ndv/(ndv*(1.-k)+k));
 vec3 f0=vec3(glass?.075:.04);vec3 fresnel=f0+(1.-f0)*pow(1.-vdh,5.);
 vec3 spec=distribution*visibility*fresnel/max(4.*ndl*ndv,.001);
 float ambient=.34+.16*max(n.y,0.);vec3 bounce=vec3(.82,.89,.78)*(.08*max(-n.y,0.));
 vec3 lit=base*(ambient+bounce)+((1.-fresnel)*base/3.14159+spec)*vec3(2.4,2.13,1.82)*ndl*shade;
 if(glass || (uMaterial>4.5 && uMaterial<5.5)){
  vec3 reflected=sky(reflect(-view,n));float edge=pow(1.-ndv,4.);lit=mix(lit,reflected,glass?.34+edge*.5:.22+edge*.62);
  if(glass){float mullion=pow(.5+.5*sin(vWorld.x*1.4+vWorld.y*.45),18.);lit+=vec3(.075,.063,.042)*mullion;}
 }
 float contact=smoothstep(0.,.32,max(vWorld.y,0.));if(uMaterial<3.5)lit*=.8+.2*contact;
 lit=clamp((lit*(2.51*lit+.03))/(lit*(2.43*lit+.59)+.14),0.,1.);
 lit=pow(lit,vec3(1./2.2));float fog=smoothstep(20.,55.,distance(vWorld,uEye));
 gl_FragColor=vec4(mix(lit,uAtmosphere,fog*.78),uAlpha);
}`;
// Power-of-two, seeded surface maps stay local and add no image downloads.
function createSurfaceAtlas(gl) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d"),
    image = ctx.createImageData(512, 512);
  let seed = 48271;
  for (let y = 0; y < 512; y++)
    for (let x = 0; x < 512; x++) {
      seed = (seed * 16807) % 2147483647;
      const random = seed / 2147483647;
      const tile = Math.floor(x / 256) + Math.floor(y / 256) * 2;
      const px = x % 256,
        py = y % 256;
      let value =
        tile === 0
          ? 170 + random * 64
          : tile === 1
            ? 160 +
              Math.sin(px * 0.25 + Math.sin(py * 0.035) * 2) * 25 +
              random * 30
            : tile === 2
              ? 130 +
                random * 70 +
                Math.sin(px * 0.13) * Math.sin(py * 0.17) * 22
              : 180 + random * 35 + Math.sin(px * 0.8) * 12;
      const i = (y * 512 + x) * 4;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = value;
      image.data[i + 3] = 255;
    }
  ctx.putImageData(image, 0, 0);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR_MIPMAP_LINEAR,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
}
const colors = {
  ground: [0.79, 0.83, 0.76],
  slab: [0.9, 0.91, 0.85],
  wall: [0.91, 0.9, 0.82],
  roof: [0.25, 0.29, 0.28],
  frame: [0.31, 0.42, 0.35],
  glass: [0.17, 0.26, 0.28],
  skin: [0.78, 0.59, 0.43],
  jacket: [0.21, 0.43, 0.37],
  helmet: [0.9, 0.71, 0.35],
  dark: [0.2, 0.27, 0.24],
  tree: [0.44, 0.59, 0.41],
  truck: [0.59, 0.72, 0.64],
  plan: [0.52, 0.67, 0.6],
};
function multiply(a, b) {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
}
function normalize(v) {
  const l = Math.hypot(...v) || 1;
  return v.map((n) => n / l);
}
function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}
function dot(a, b) {
  return a.reduce((s, n, i) => s + n * b[i], 0);
}
function camera(angle, aspect, shot) {
  const distance = aspect < 1.2 ? 14 : 11.8;
  const eye = shot?.eye || [
      Math.sin(angle) * distance,
      4.8,
      Math.cos(angle) * distance,
    ],
    target = shot?.target || [0, 1.0, -0.3];
  const z = normalize(eye.map((n, i) => n - target[i])),
    x = normalize(cross([0, 1, 0], z)),
    y = cross(z, x);
  const view = new Float32Array([
    x[0],
    y[0],
    z[0],
    0,
    x[1],
    y[1],
    z[1],
    0,
    x[2],
    y[2],
    z[2],
    0,
    -dot(x, eye),
    -dot(y, eye),
    -dot(z, eye),
    1,
  ]);
  const f = 1 / Math.tan(((shot?.fov || 45) * Math.PI) / 360),
    near = 0.1,
    far = 60;
  const projection = new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) / (near - far),
    -1,
    0,
    0,
    (2 * far * near) / (near - far),
    0,
  ]);
  return { matrix: multiply(projection, view), eye };
}
function model(x, y, z, sx, sy, sz, ry = 0, rz = 0) {
  const cy = Math.cos(ry),
    syy = Math.sin(ry),
    cz = Math.cos(rz),
    szz = Math.sin(rz);
  const m = new Float32Array([
    cy * cz,
    szz,
    -syy * cz,
    0,
    -cy * szz,
    cz,
    syy * szz,
    0,
    syy,
    0,
    cy,
    0,
    x,
    y,
    z,
    1,
  ]);
  for (let i = 0; i < 3; i++) {
    m[i] *= sx;
    m[4 + i] *= sy;
    m[8 + i] *= sz;
  }
  return m;
}
function triangles(faces, smooth = false) {
  const data = [];
  for (const face of faces) {
    for (let i = 1; i < face.length - 1; i++) {
      const tri = [face[0], face[i], face[i + 1]],
        a = tri[1].map((n, j) => n - tri[0][j]),
        b = tri[2].map((n, j) => n - tri[0][j]),
        normal = normalize(cross(a, b));
      for (const v of tri) data.push(...v, ...(smooth ? normalize(v) : normal));
    }
  }
  return new Float32Array(data);
}
const cubeFaces = [
  [
    [-0.5, -0.5, 0.5],
    [0.5, -0.5, 0.5],
    [0.5, 0.5, 0.5],
    [-0.5, 0.5, 0.5],
  ],
  [
    [0.5, -0.5, -0.5],
    [-0.5, -0.5, -0.5],
    [-0.5, 0.5, -0.5],
    [0.5, 0.5, -0.5],
  ],
  [
    [0.5, -0.5, 0.5],
    [0.5, -0.5, -0.5],
    [0.5, 0.5, -0.5],
    [0.5, 0.5, 0.5],
  ],
  [
    [-0.5, -0.5, -0.5],
    [-0.5, -0.5, 0.5],
    [-0.5, 0.5, 0.5],
    [-0.5, 0.5, -0.5],
  ],
  [
    [-0.5, 0.5, 0.5],
    [0.5, 0.5, 0.5],
    [0.5, 0.5, -0.5],
    [-0.5, 0.5, -0.5],
  ],
  [
    [-0.5, -0.5, -0.5],
    [0.5, -0.5, -0.5],
    [0.5, -0.5, 0.5],
    [-0.5, -0.5, 0.5],
  ],
];
function sphereFaces() {
  const faces = [],
    lat = 18,
    lon = 24;
  const point = (i, j) => {
    const a = (i / lat) * Math.PI,
      b = (j / lon) * Math.PI * 2;
    return [
      Math.sin(a) * Math.cos(b) * 0.5,
      Math.cos(a) * 0.5,
      Math.sin(a) * Math.sin(b) * 0.5,
    ];
  };
  for (let i = 0; i < lat; i++)
    for (let j = 0; j < lon; j++)
      faces.push([
        point(i, j),
        point(i + 1, j),
        point(i + 1, j + 1),
        point(i, j + 1),
      ]);
  return faces;
}
function trunkFaces() {
  const faces = [];
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8,
      b = ((i + 1) * Math.PI) / 8;
    faces.push([
      [Math.cos(a) * 0.5, -0.5, Math.sin(a) * 0.5],
      [Math.cos(b) * 0.5, -0.5, Math.sin(b) * 0.5],
      [Math.cos(b) * 0.32, 0.5, Math.sin(b) * 0.32],
      [Math.cos(a) * 0.32, 0.5, Math.sin(a) * 0.32],
    ]);
  }
  return faces;
}
function canopyFaces(palm = false) {
  const faces = [];
  if (palm) {
    for (let arm = 0; arm < 9; arm++) {
      const theta = (arm * Math.PI * 2) / 9;
      for (let leaf = 0; leaf < 13; leaf++)
        for (const side of [-1, 1]) {
          const t = (leaf + 1) / 14,
            r = t * 0.96,
            y = 0.2 * Math.sin(t * Math.PI) - 0.3 * t * t;
          const base = [Math.sin(theta) * r, y, Math.cos(theta) * r];
          const width = (1 - t) * 0.32;
          const tip = [
            base[0] + Math.cos(theta) * side * width,
            base[1] - 0.08,
            base[2] - Math.sin(theta) * side * width,
          ];
          faces.push([
            base,
            [
              base[0] + Math.sin(theta) * 0.055,
              base[1] + 0.015,
              base[2] + Math.cos(theta) * 0.055,
            ],
            tip,
          ]);
        }
    }
  } else {
    for (let i = 0; i < 900; i++) {
      const theta = i * 2.399963,
        vertical = 1 - 2 * ((i + 0.5) / 900),
        depth = 0.62 + 0.38 * (0.5 + 0.5 * Math.sin(i * 11.31));
      const radius = Math.sqrt(1 - vertical * vertical) * 0.5 * depth;
      const center = [
        Math.cos(theta) * radius,
        vertical * 0.5 * depth,
        Math.sin(theta) * radius,
      ];
      const size = 0.038 + 0.025 * (0.5 + 0.5 * Math.sin(i * 3.2)),
        tilt = i * 1.71;
      const u = [
        Math.cos(theta) * size,
        Math.sin(tilt) * size * 0.75,
        Math.sin(theta) * size,
      ];
      const v = [
        -Math.sin(theta) * size * 0.55,
        Math.cos(tilt) * size * 0.65,
        Math.cos(theta) * size * 0.55,
      ];
      const point = (a, b) => center.map((n, j) => n + u[j] * a + v[j] * b);
      faces.push([point(-1, 0), point(0, -1), point(1, 0), point(0, 1)]);
    }
  }
  return faces;
}
const roofFaces = [
  [
    [-0.5, 0, 0.5],
    [0.5, 0, 0.5],
    [0, 0.6, 0.5],
  ],
  [
    [0.5, 0, -0.5],
    [-0.5, 0, -0.5],
    [0, 0.6, -0.5],
  ],
  [
    [-0.5, 0, -0.5],
    [-0.5, 0, 0.5],
    [0, 0.6, 0.5],
    [0, 0.6, -0.5],
  ],
  [
    [0, 0.6, -0.5],
    [0, 0.6, 0.5],
    [0.5, 0, 0.5],
    [0.5, 0, -0.5],
  ],
  [
    [-0.5, 0, -0.5],
    [0.5, 0, -0.5],
    [0.5, 0, 0.5],
    [-0.5, 0, 0.5],
  ],
];

// Deterministic design geometry is shared by the live study and rendered film.
export function getDesignForm(seconds) {
  const ease = (value) => {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  };
  return {
    curvature: ease((seconds - 3) / 8),
    glazing: ease((seconds - 9) / 4),
    detail: ease((seconds - 11) / 3),
  };
}
export function designPoint(x, z, curvature) {
  const arc = curvature * 2.1;
  if (arc < 0.00001) return [x, z - 0.65];
  const radius = 7.2 / arc,
    angle = (x / 7.2) * arc;
  return [
    (radius - z) * Math.sin(angle),
    radius * (1 - Math.cos(angle)) + z * Math.cos(angle) - 0.65,
  ];
}

export function createConstructionScene(
  canvas,
  {
    reducedMotion = matchMedia("(prefers-reduced-motion: reduce)"),
    onUnavailable = () => {},
    manual = false,
    guideElement,
  } = {},
) {
  let gl;
  try {
    gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch {
    onUnavailable();
    return null;
  }
  if (!gl) {
    onUnavailable();
    return null;
  }
  const shaders = [];
  const buffers = [];
  let program;
  try {
    function compile(kind, source) {
      const shader = gl.createShader(kind);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(shader));
      shaders.push(shader);
      return shader;
    }
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexShader));
    const precision = gl.getShaderPrecisionFormat(
      gl.FRAGMENT_SHADER,
      gl.HIGH_FLOAT,
    );
    gl.attachShader(
      program,
      compile(
        gl.FRAGMENT_SHADER,
        precision?.precision
          ? fragmentShader
          : fragmentShader.replace(
              "precision highp float;",
              "precision mediump float;",
            ),
      ),
    );
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(program));
  } catch {
    buffers.forEach((b) => gl.deleteBuffer(b));
    shaders.forEach((s) => gl.deleteShader(s));
    if (program) gl.deleteProgram(program);
    onUnavailable();
    return null;
  }
  const position = gl.getAttribLocation(program, "aPosition"),
    normal = gl.getAttribLocation(program, "aNormal");
  const uModel = gl.getUniformLocation(program, "uModel"),
    uCamera = gl.getUniformLocation(program, "uCamera"),
    uColor = gl.getUniformLocation(program, "uColor"),
    uEye = gl.getUniformLocation(program, "uEye"),
    uAtmosphere = gl.getUniformLocation(program, "uAtmosphere"),
    uAlpha = gl.getUniformLocation(program, "uAlpha"),
    uMaterial = gl.getUniformLocation(program, "uMaterial"),
    uSurface = gl.getUniformLocation(program, "uSurface"),
    uOccluders = gl.getUniformLocation(program, "uOccluders[0]"),
    uOccluderCount = gl.getUniformLocation(program, "uOccluderCount");
  const surfaceAtlas = createSurfaceAtlas(gl);
  function mesh(faces, smooth = false) {
    const data = triangles(faces, smooth),
      buffer = gl.createBuffer();
    buffers.push(buffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return { buffer, count: data.length / 6 };
  }
  const cube = mesh(cubeFaces),
    sphere = mesh(sphereFaces(), true),
    roof = mesh(roofFaces),
    trunk = mesh(trunkFaces()),
    canopy = mesh(canopyFaces()),
    palmCrown = mesh(canopyFaces(true)),
    hill = mesh(
      sphereFaces().map((face) =>
        face.map(([x, y, z]) => [
          x,
          y * (1 + 0.13 * Math.sin(x * 14 + z * 9)),
          z,
        ]),
      ),
      true,
    );
  const designMeshes = Array.from({ length: 9 }, () => mesh(cubeFaces));
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.91, 0.93, 0.89, 1);
  let stage = 0,
    type = "home",
    angle = 0.35,
    environment = "forest",
    touring = false,
    active = false,
    paused = false,
    lost = false,
    frame,
    last = 0,
    transitionStart = 0;
  let character = [-3.2, 2],
    previousCharacter = [...character];
  const stops = [
    [-3.2, 2],
    [-2.7, 0.6],
    [3.6, 2],
    [-3, 2.3],
    [0.3, 2.8],
  ];
  const guide =
    guideElement === undefined
      ? document.querySelector("#scene-guide-text")
      : guideElement;
  let shotCamera,
    shotElapsed = 1500,
    units = 6,
    shotTime = 0,
    vegetationTime = 0;
  const smooth = (value) => {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  };
  const messages = [
    "Let’s start with your site and the people who will use it.",
    "We coordinate your brief, design and engineering before building.",
    "Components are prepared off site, ready for the agreed delivery.",
    "Your delivery team assembles the structure, envelope and services.",
    "We review the spaces, completion checks and documentation together.",
  ];
  function draw(mesh, x, y, z, sx, sy, sz, color, ry = 0, rz = 0, material) {
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, 24, 12);
    gl.uniformMatrix4fv(uModel, false, model(x, y, z, sx, sy, sz, ry, rz));
    gl.uniform3fv(uColor, color);
    const type =
      material ??
      (color === colors.wall || color === colors.slab
        ? 1
        : color === colors.glass
          ? 4
          : color === colors.roof
            ? 8
            : color !== colors.skin &&
                color[0] > color[1] * 1.1 &&
                color[1] > color[2] * 1.15
              ? 2
              : color[1] > color[0] * 1.3 && color[1] > color[2] * 1.25
                ? 6
                : 0);
    gl.uniform1f(uMaterial, type);
    gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
  }
  function box(x, y, z, sx, sy, sz, color, ry = 0, rz = 0, material) {
    draw(cube, x, y, z, sx, sy, sz, color, ry, rz, material);
  }
  const landscapes = {
    forest: {
      sky: [0.76, 0.83, 0.78],
      ground: [0.43, 0.54, 0.37],
      hills: [0.26, 0.4, 0.31],
    },
    mountain: {
      sky: [0.74, 0.82, 0.87],
      ground: [0.62, 0.66, 0.48],
      hills: [0.38, 0.49, 0.47],
    },
    beach: {
      sky: [0.78, 0.86, 0.88],
      ground: [0.88, 0.81, 0.64],
      hills: [0.41, 0.57, 0.44],
    },
  };
  function shadow(x, z, sx, sz) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    for (let i = 11; i >= 0; i--) {
      gl.uniform1f(uAlpha, 0.008 + (11 - i) * 0.001);
      draw(
        sphere,
        x + 0.16,
        0.027 + i * 0.001,
        z + 0.1,
        sx * (1 + i * 0.035),
        0.012,
        sz * (1 + i * 0.035),
        [0.12, 0.16, 0.14],
      );
    }
    gl.uniform1f(uAlpha, 1);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
  }
  function tree(x, z, size = 1, palm = false) {
    shadow(x, z, 1.7 * size, 1.3 * size);
    draw(
      trunk,
      x,
      1.1 * size,
      z,
      0.2 * size,
      2.2 * size,
      0.2 * size,
      [0.37, 0.29, 0.19],
      0,
      palm ? -0.09 : 0,
      2,
    );
    const breeze = !reducedMotion.matches
      ? Math.sin(vegetationTime / 2400 + x * 0.35 + z * 0.2) * 0.025
      : 0;
    if (palm)
      draw(
        palmCrown,
        x + breeze,
        2.2 * size,
        z,
        2.35 * size,
        1.6 * size,
        2.35 * size,
        [0.24, 0.39, 0.18],
        0.2,
        0,
        6,
      );
    else
      draw(
        canopy,
        x + breeze,
        2.25 * size,
        z,
        2.15 * size,
        2.2 * size,
        2.15 * size,
        [0.29, 0.39, 0.21],
        x * 0.7,
        0,
        6,
      );
  }
  function landscape(now) {
    const mood = landscapes[environment];
    // Dry land and sea meet at z=-6; their top faces never overlap.
    if (environment === "beach")
      box(0, -0.18, 24.5, 110, 0.3, 61, mood.ground, 0, 0, 3);
    else box(0, -0.18, 0, 110, 0.3, 110, mood.ground, 0, 0, 3);
    // Low rolling land dissolves into the atmospheric horizon.
    for (let i = 0; i < 9; i++) {
      const a = (i * Math.PI * 2) / 9;
      const tall =
        environment === "mountain" ? 12 + (i % 3) * 4 : 7 + (i % 3) * 2;
      draw(
        hill,
        Math.sin(a) * 34,
        -1.4,
        Math.cos(a) * 34,
        20,
        tall,
        18,
        mood.hills,
        0,
        0,
        3,
      );
    }
    if (environment === "mountain") {
      for (let i = 0; i < 4; i++) {
        draw(
          roof,
          -18 + i * 12,
          1,
          -28,
          16,
          14 + i * 2,
          13,
          [0.36 + i * 0.025, 0.43 + i * 0.02, 0.4 + i * 0.015],
          0.2,
        );
        draw(
          roof,
          -18 + i * 12,
          7.3 + i * 0.9,
          -28,
          3.9,
          4,
          3.2,
          [0.82, 0.84, 0.79],
          0.2,
        );
      }
    }
    if (environment === "beach") {
      // One calm surface, below the shore. No coplanar foam strips or ground.
      box(0, -0.24, -30.5, 110, 0.35, 49, [0.18, 0.43, 0.47], 0, 0, 5);
    }
    const spots = [
      [-6, -3],
      [6, -3],
      [-7, 4],
      [7, 5],
      [-10, -8],
      [10, -8],
      [-14, 0],
      [14, 1],
      [-5, -10],
      [5, -12],
    ];
    spots.forEach(([x, z], i) =>
      tree(
        x,
        environment === "beach" ? Math.max(-4, z) : z,
        0.75 + (i % 3) * 0.2,
        environment === "beach",
      ),
    );
    // A real site sits in the landscape, with a path and planted edges.
    const community = manual && type === "housing";
    const rows = community ? 3 : Math.ceil(units / 4);
    box(
      0,
      -0.01,
      community ? 0.3 - ((rows - 1) * 1.95) / 2 : 0,
      community ? 10 : 9,
      0.045,
      community ? rows * 1.95 + 2 : 6.3,
      environment === "beach" ? [0.84, 0.77, 0.6] : [0.62, 0.66, 0.52],
    );
    box(0, 0.005, 2.2, 8, 0.035, 0.65, colors.slab);
    if (!manual && stage < 2) {
      for (const x of [-4.2, 4.2])
        for (const z of [-2.7, 2.7]) {
          box(x, 0.28, z, 0.035, 0.55, 0.035, colors.helmet);
          box(x, 0.56, z, 0.16, 0.1, 0.035, colors.jacket);
        }
    }
  }
  function designStudy(seconds) {
    const form = getDesignForm(seconds);
    canvas.dataset.designCurvature = String(form.curvature);
    canvas.dataset.designGlazing = String(form.glazing);
    box(0, 0.015, 0.2, 8.8, 0.06, 5.8, colors.slab);
    // A single topology bends each box into the same continuous architectural ribbon.
    function ribbon(index, x0, x1, z0, z1, y0, y1, color, wave = 0) {
      const faces = [],
        segments = 32;
      const point = (x, z, y) => {
        const [px, pz] = designPoint(x, z, form.curvature);
        return [
          px,
          y +
            (index % 3 === 0 && y === y0
              ? 0
              : wave * form.curvature * Math.cos(((x / 3.8) * Math.PI) / 2)),
          pz,
        ];
      };
      for (let i = 0; i < segments; i++) {
        const a = x0 + ((x1 - x0) * i) / segments,
          b = x0 + ((x1 - x0) * (i + 1)) / segments;
        faces.push(
          [
            point(a, z1, y0),
            point(b, z1, y0),
            point(b, z1, y1),
            point(a, z1, y1),
          ],
          [
            point(b, z0, y0),
            point(a, z0, y0),
            point(a, z0, y1),
            point(b, z0, y1),
          ],
          [
            point(a, z0, y1),
            point(a, z1, y1),
            point(b, z1, y1),
            point(b, z0, y1),
          ],
          [
            point(a, z1, y0),
            point(a, z0, y0),
            point(b, z0, y0),
            point(b, z1, y0),
          ],
        );
      }
      faces.push(
        [
          point(x0, z0, y0),
          point(x0, z1, y0),
          point(x0, z1, y1),
          point(x0, z0, y1),
        ],
        [
          point(x1, z1, y0),
          point(x1, z0, y0),
          point(x1, z0, y1),
          point(x1, z1, y1),
        ],
      );
      const geometry = designMeshes[index],
        data = triangles(faces);
      gl.bindBuffer(gl.ARRAY_BUFFER, geometry.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
      geometry.count = data.length / 6;
      draw(geometry, 0, 0, 0, 1, 1, 1, color);
    }
    for (let i = -1; i <= 1; i++) {
      const center = i * (2.6 - 0.2 * form.curvature),
        half = 1.15 + 0.04 * form.curvature;
      const a = center - half,
        b = center + half;
      shadow(center, 0.1, 2.9, 2.6);
      ribbon((i + 1) * 3, a, b, -1.05, 1.05, 0.05, 1.8, colors.wall, 0.23);
      const overhang = 0.05 + 0.18 * form.detail;
      ribbon(
        (i + 1) * 3 + 1,
        a,
        b,
        -1.05 - overhang,
        1.05 + overhang,
        1.805,
        1.91,
        colors.slab,
        0.23,
      );
      if (form.glazing > 0) {
        const glassHeight = 1.25 * form.glazing;
        ribbon(
          (i + 1) * 3 + 2,
          a + 0.1,
          b - 0.1,
          1.066,
          1.088,
          0.82 - glassHeight / 2,
          0.82 + glassHeight / 2,
          colors.glass,
        );
        for (let j = 0; j <= 6; j++) {
          const x = a + 0.1 + ((b - a - 0.2) * j) / 6,
            [px, pz] = designPoint(x, 1.115, form.curvature);
          box(
            px,
            0.82,
            pz,
            0.025,
            glassHeight,
            0.032,
            [0.55, 0.47, 0.35],
            (-x / 7.2) * form.curvature * 2.1,
          );
        }
      }
    }
    // The designer's table establishes an architectural study rather than a building site.
    box(-4.45, 0.72, 1.45, 1.25, 0.055, 0.65, [0.64, 0.57, 0.45]);
    for (const dx of [-0.48, 0.48])
      box(-4.45 + dx, 0.36, 1.45, 0.045, 0.72, 0.045, colors.frame);
    box(-4.45, 0.756, 1.45, 0.8, 0.012, 0.45, [0.97, 0.97, 0.94]);
    for (let i = 0; i < 3; i++)
      box(-4.65 + i * 0.2, 0.8, 1.45, 0.13, 0.075, 0.12, colors.wall);
  }
  const liftForSlats = (amount, scale) =>
    manual ? -(1 - amount) * 0.65 * scale : 0;
  function building(x, z, scale, elapsed, buildTime = shotTime / 1000) {
    const y = 0.1;
    const framing = manual ? smooth((buildTime - 2) / 3) : stage >= 1 ? 1 : 0;
    const envelope = manual
      ? smooth((buildTime - 6) / 3.5)
      : stage >= 3
        ? 1
        : 0;
    const roofing = manual
      ? smooth((buildTime - 10) / 2.5)
      : stage >= 4
        ? 1
        : 0;
    shadow(x, z, 2.9 * scale, 2.6 * scale);
    box(x, y, z, 2.35 * scale, 0.15, 2.1 * scale, colors.slab);
    // A retrofit starts with retained fabric rather than an empty site.
    if (type === "retrofit" && stage < 3) {
      box(
        x,
        0.77 * scale,
        z,
        2 * scale,
        1.3 * scale,
        1.8 * scale,
        [0.65, 0.68, 0.61],
      );
      box(
        x - 0.55 * scale,
        0.85 * scale,
        z + 0.91 * scale,
        0.5 * scale,
        0.5 * scale,
        0.025,
        colors.dark,
      );
      box(
        x + 0.55 * scale,
        0.65 * scale,
        z + 0.91 * scale,
        0.4 * scale,
        1 * scale,
        0.025,
        colors.dark,
      );
    }
    if (framing > 0) {
      for (const dx of [-1, 1])
        for (const dz of [-0.9, 0.9])
          box(
            x + dx * scale,
            0.12,
            z + dz * scale,
            0.07 * scale,
            0.045,
            0.07 * scale,
            colors.plan,
          );
      for (const dz of [-0.9, 0.9])
        box(x, 0.13, z + dz * scale, 2 * scale, 0.045, 0.04, colors.plan);
    }
    if (framing > 0) {
      const thickness = !manual && stage === 1 ? 0.022 : 0.075;
      const frameColor = !manual && stage === 1 ? colors.plan : colors.frame;
      for (const dx of [-1, 1])
        for (const dz of [-0.9, 0.9])
          box(
            x + dx * scale,
            (0.1 + 0.65 * framing) * scale,
            z + dz * scale,
            thickness * scale,
            1.35 * scale * framing,
            thickness * scale,
            frameColor,
          );
      for (const dz of [-0.9, 0.9])
        box(
          x,
          (0.1 + 1.3 * framing) * scale,
          z + dz * scale,
          2.05 * scale,
          thickness * scale,
          thickness * scale,
          frameColor,
        );
    }
    if (envelope > 0) {
      const lift = manual
        ? -(1 - envelope) * 0.65 * scale
        : reducedMotion.matches
          ? 0
          : Math.max(0, 1 - elapsed / 900) * 1.5;
      box(
        x,
        0.77 * scale + lift,
        z,
        2 * scale,
        1.3 * scale * envelope,
        1.8 * scale,
        colors.wall,
      );
      box(
        x - 0.6 * scale,
        (manual ? 0.12 + 0.71 * envelope : 0.83) * scale + (manual ? 0 : lift),
        z + 0.906 * scale,
        0.48 * scale,
        0.52 * scale * (manual ? envelope : 1),
        0.025,
        colors.glass,
      );
      box(
        x + 0.55 * scale,
        (manual ? 0.12 + 0.55 * envelope : 0.67) * scale + (manual ? 0 : lift),
        z + 0.907 * scale,
        0.42 * scale,
        0.99 * scale * (manual ? envelope : 1),
        0.025,
        colors.frame,
      );
      box(
        x + 1.006 * scale,
        (manual ? 0.12 + 0.73 * envelope : 0.85) * scale + (manual ? 0 : lift),
        z,
        0.025,
        0.45 * scale * (manual ? envelope : 1),
        0.85 * scale,
        colors.glass,
      );
    }
    if (envelope > 0) {
      for (let i = 0; i < 10; i++)
        box(
          x - 0.98 * scale + i * 0.09 * scale,
          0.77 * scale + liftForSlats(envelope, scale),
          z + 0.93 * scale,
          0.028 * scale,
          1.23 * scale * envelope,
          0.023,
          [0.58, 0.49, 0.36],
        );
    }
    if (roofing > 0) {
      draw(
        roof,
        x,
        1.43 * scale,
        z,
        2.2 * scale,
        0.65 * scale * roofing,
        2 * scale,
        colors.roof,
      );
      box(
        x + 0.55 * scale,
        0.17,
        z + 1.08 * scale,
        0.65 * scale,
        0.1,
        0.35 * scale,
        colors.slab,
      );
    }
  }
  function person(now, elapsed) {
    const target = stops[stage],
      t = reducedMotion.matches ? 1 : Math.min(1, elapsed / 1100),
      ease = t * t * (3 - 2 * t);
    if (manual) {
      const travel = smooth((now / 1000 - 1) / 12);
      character = [-4.2 + travel * 1.3, 2.5 - travel * 0.35];
    } else
      character = previousCharacter.map((n, i) => n + (target[i] - n) * ease);
    const walking = manual
        ? now > 1000 && now < 13000 && !reducedMotion.matches
        : t < 1 && !paused && !reducedMotion.matches,
      phase = now / (manual ? 360 : 160),
      bob = walking
        ? Math.abs(Math.sin(phase)) * 0.016
        : !reducedMotion.matches
          ? Math.sin(now / 1200) * 0.005
          : 0;
    shadow(character[0], character[1], 0.6, 0.4);
    const rx = character[0],
      rz = character[1],
      face = manual ? 0.8 + Math.sin(now / 4500) * 0.05 : angle,
      cos = Math.cos(face),
      sin = Math.sin(face);
    function part(dx, dy, dz, sx, sy, sz, color, shape = sphere, tilt = 0) {
      draw(
        shape,
        rx + dx * cos + dz * sin,
        dy + bob,
        rz - dx * sin + dz * cos,
        sx,
        sy,
        sz,
        color,
        face,
        tilt,
      );
    }
    const stride = walking ? Math.sin(phase) * 0.055 : 0;
    part(
      -0.11,
      0.26,
      stride,
      0.13,
      0.42,
      0.16,
      colors.dark,
      cube,
      walking ? Math.sin(phase) * 0.12 : 0,
    );
    part(
      0.11,
      0.26,
      -stride,
      0.13,
      0.42,
      0.16,
      colors.dark,
      cube,
      walking ? -Math.sin(phase) * 0.12 : 0,
    );
    part(0, 0.66, 0, 0.4, 0.46, 0.22, colors.jacket);
    part(0, 1.03, 0, 0.28, 0.29, 0.28, colors.skin, sphere);
    if (manual && type === "greenshift") {
      part(0, 1.13, -0.015, 0.29, 0.13, 0.28, colors.dark, sphere);
      part(0.08, 0.62, 0.2, 0.28, 0.2, 0.025, colors.dark, cube, -0.12);
    } else {
      part(0, 1.17, 0, 0.34, 0.16, 0.34, colors.helmet, sphere);
      part(0, 1.12, 0.03, 0.36, 0.035, 0.34, colors.helmet);
    }
    part(
      -0.28,
      0.64,
      0,
      0.1,
      0.37,
      0.12,
      colors.jacket,
      cube,
      -0.12 + (walking ? Math.sin(phase) * 0.12 : 0),
    );
    part(-0.3, 0.43, 0, 0.1, 0.11, 0.12, colors.skin, sphere);
    const wave =
      (manual || stage === 0) && !paused && !reducedMotion.matches
        ? Math.sin(now / 550) * 0.15
        : 0;
    part(
      0.29,
      manual ? 0.64 : 0.8,
      0,
      0.1,
      0.35,
      0.12,
      colors.jacket,
      cube,
      manual ? 0.12 - (walking ? Math.sin(phase) * 0.12 : 0) : -0.75 - wave,
    );
    part(
      manual ? 0.3 : 0.4,
      manual ? 0.43 : 0.89,
      0,
      0.1,
      0.11,
      0.12,
      colors.skin,
      sphere,
    );
    part(-0.055, 1.05, 0.13, 0.025, 0.025, 0.02, colors.dark, sphere);
    part(0.055, 1.05, 0.13, 0.025, 0.025, 0.02, colors.dark, sphere);
  }
  function render(now = manual ? shotTime : performance.now()) {
    if (lost) return;
    vegetationTime = now;
    const rect = canvas.getBoundingClientRect(),
      ratio = Math.min(devicePixelRatio || 1, 1.75),
      width = Math.max(1, Math.round(rect.width * ratio)),
      height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    const sky = landscapes[environment].sky;
    gl.clearColor(...sky, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.enableVertexAttribArray(position);
    gl.enableVertexAttribArray(normal);
    const view = camera(angle, width / height, shotCamera);
    gl.uniformMatrix4fv(uCamera, false, view.matrix);
    gl.uniform3fv(uEye, view.eye);
    gl.uniform3fv(uAtmosphere, sky);
    gl.uniform1f(uAlpha, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, surfaceAtlas);
    gl.uniform1i(uSurface, 0);
    const occluders = [];
    if (type === "greenshift" && manual) {
      const form = getDesignForm(shotTime / 1000);
      for (let i = -1; i <= 1; i++) {
        const [x, z] = designPoint(
          i * (2.6 - 0.2 * form.curvature),
          0,
          form.curvature,
        );
        occluders.push(x, 0.9, z, 1.05);
      }
    } else if (manual && ["housing", "workers", "modular"].includes(type)) {
      [5, 6, 1, 2, 4, 7, 0, 3].forEach((cell, i) => {
        const age =
          i === 0
            ? shotTime / 500
            : (shotTime / 1000 - (6 + (i - 1) * 0.45)) * 3;
        const envelope = smooth((age - 6) / 3.5);
        if (envelope > 0)
          occluders.push(
            ((cell % 4) - 1.5) * 2.45,
            0.58 * envelope,
            -Math.floor(cell / 4) * 1.95 + 0.3,
            0.67 * envelope,
          );
      });
    } else if (stage >= 3) {
      if (["housing", "workers", "modular"].includes(type)) {
        const columns = manual ? 4 : units > 6 ? 4 : Math.min(3, units);
        for (let i = 0; i < Math.min(units, 8); i++)
          occluders.push(
            ((i % columns) - (columns - 1) / 2) * 2.45,
            0.58,
            -Math.floor(i / columns) * 1.95 + 0.3,
            0.67,
          );
      } else occluders.push(0, 0.8, -0.5, 0.95);
    }
    const shadowData = new Float32Array(32);
    shadowData.set(occluders);
    gl.uniform4fv(uOccluders, shadowData);
    gl.uniform1f(uOccluderCount, occluders.length / 4);
    gl.depthMask(false);
    draw(sphere, ...view.eye, 86, 86, 86, sky, 0, 0, 7);
    gl.depthMask(true);
    landscape(now);
    const elapsed = manual
        ? shotElapsed
        : paused
          ? 1500
          : Math.max(0, now - transitionStart),
      mass = ["housing", "workers", "modular"].includes(type);
    if (mass && manual) {
      const order = [5, 6, 1, 2, 4, 7, 0, 3, 8, 9, 10, 11];
      order.forEach((cell, i) => {
        const age =
          i === 0 ? (now / 1000) * 2 : (now / 1000 - (6 + (i - 1) * 0.45)) * 3;
        const appear = smooth(age / 0.9);
        if (appear > 0)
          building(
            ((cell % 4) - 1.5) * 2.45,
            -Math.floor(cell / 4) * 1.95 + 0.3,
            0.7 * appear,
            elapsed,
            age,
          );
      });
    } else if (mass) {
      const columns = units > 6 ? 4 : Math.min(3, units);
      for (let i = 0; i < units; i++)
        building(
          ((i % columns) - (columns - 1) / 2) * 2.45,
          -Math.floor(i / columns) * 1.95 + 0.3,
          0.7,
          elapsed + i * -90,
        );
    } else if (type === "greenshift" && manual) {
      designStudy(now / 1000);
    } else if (type === "greenshift") {
      box(-0.6, 0.015, -0.5, 7, 0.06, 4, colors.slab);
      building(0, -0.3, 1.3, elapsed);
      building(-2.5, -1.1, 0.85, elapsed - 120);
      if (manual || stage >= 4) {
        box(3, 0.05, -1, 2, 0.08, 3, [0.4, 0.7, 0.69]);
        box(3, 0.106, -1, 1.65, 0.015, 2.65, [0.31, 0.64, 0.65]);
      }
    } else building(0, -0.5, type === "hospitality" ? 1.4 : 1, elapsed);
    if (!manual && stage >= 2 && stage < 4) {
      const move = reducedMotion.matches ? 0 : Math.min(1, elapsed / 1200);
      const tx = 3.9 - move * 0.35;
      box(tx, 0.4, 1.5, 0.72, 0.45, 1.25, colors.truck);
      box(tx, 0.7, 1.9, 0.72, 0.65, 0.48, colors.jacket);
      for (const dz of [1.05, 1.98])
        for (const dx of [-0.4, 0.4])
          draw(sphere, tx + dx, 0.19, dz, 0.2, 0.3, 0.3, colors.dark);
      for (let i = 0; i < 3; i++)
        box(tx, 0.7 + i * 0.08, 1.3, 0.63, 0.07, 0.8, colors.wall);
    }
    if (manual || stage === 4) {
      for (const x of [-4, 4])
        for (const z of [-2.5, 2.5])
          tree(
            manual && type === "greenshift" && x === -4 && z === 2.5 ? -5.5 : x,
            z,
            0.45,
            environment === "beach",
          );
    }
    person(now, elapsed);
    canvas.dataset.rendered = "true";
    canvas.dataset.materials = "plaster,timber,terrain,glass,water,metal";
    canvas.dataset.environment = environment;
    canvas.dataset.stage = String(stage);
    canvas.dataset.projectType = type;
  }
  function loop(now) {
    if (!active || lost) return;
    if (now - last > 33) {
      if (touring && !paused && !reducedMotion.matches)
        angle += Math.min(now - last, 66) * 0.000035;
      render(now);
      last = now;
    }
    // Stop drawing settled stages; only the greeting keeps an idle gesture.
    if (
      !paused &&
      !reducedMotion.matches &&
      (touring || stage === 0 || now - transitionStart < 1500)
    )
      frame = requestAnimationFrame(loop);
  }
  function requestRender() {
    cancelAnimationFrame(frame);
    render();
    if (!manual && active && !paused && !reducedMotion.matches)
      frame = requestAnimationFrame(loop);
  }
  function updateStage(value) {
    previousCharacter = [...character];
    stage = value;
    transitionStart = performance.now();
    if (guide) guide.textContent = messages[stage];
    requestRender();
  }
  let drag;
  canvas.addEventListener("pointerdown", (event) => {
    drag = { id: event.pointerId, x: event.clientX, start: angle };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (drag && drag.id === event.pointerId) {
      angle = drag.start + (event.clientX - drag.x) * 0.009;
      requestRender();
    }
  });
  canvas.addEventListener("pointerup", () => {
    drag = undefined;
  });
  canvas.addEventListener("pointercancel", () => {
    drag = undefined;
  });
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    onUnavailable();
  });
  const visibility = new IntersectionObserver(
    (entries) => {
      active = entries[0].isIntersecting && !document.hidden;
      requestRender();
    },
    { threshold: 0.08 },
  );
  if (!manual) visibility.observe(canvas);
  const resize = new ResizeObserver(requestRender);
  resize.observe(canvas);
  document.addEventListener("visibilitychange", () => {
    active =
      !manual &&
      !document.hidden &&
      canvas.getBoundingClientRect().bottom > 0 &&
      canvas.getBoundingClientRect().top < innerHeight;
    requestRender();
  });
  reducedMotion.addEventListener("change", requestRender);
  canvas.hidden = false;
  canvas.dataset.renderer = "webgl";
  requestRender();
  return {
    // A deterministic frame API lets trailer playback and video rendering share geometry.
    renderShot(shot) {
      stage = Math.max(0, Math.min(4, shot.stage));
      type = shot.type;
      environment = shot.environment;
      units = Math.max(1, Math.min(24, shot.units || 6));
      shotCamera = { eye: shot.eye, target: shot.target, fov: shot.fov || 45 };
      shotElapsed = shot.elapsed ?? 1500;
      previousCharacter = [...stops[stage]];
      angle = Math.atan2(shot.eye[0], shot.eye[2]);
      shotTime = shot.time || 0;
      render(shotTime);
    },
    setStage: updateStage,
    setType(value) {
      type = value;
      requestRender();
    },
    rotate(delta) {
      angle += delta;
      requestRender();
    },
    reset() {
      angle = 0.35;
      requestRender();
    },
    setEnvironment(value) {
      if (!landscapes[value]) return;
      environment = value;
      requestRender();
    },
    tour(value) {
      touring = value;
      last = performance.now();
      requestRender();
    },
    pause(value) {
      paused = value;
      requestRender();
    },
  };
}
