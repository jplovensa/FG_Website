// A small, self-contained WebGL scene. No engine, textures or external models.
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
precision mediump float;
uniform vec3 uColor;
uniform vec3 uEye;
uniform vec3 uAtmosphere;
uniform float uAlpha;
varying vec3 vNormal;
varying vec3 vWorld;
void main(){
  vec3 n=normalize(vNormal);
  vec3 view=normalize(uEye-vWorld);
  vec3 key=normalize(vec3(-.55,1.,.65));
  float sun=max(dot(n,key),0.);
  float fill=max(dot(n,normalize(vec3(.8,.45,-.5))),0.);
  float rim=pow(1.-max(dot(n,view),0.),3.)*max(dot(n,normalize(vec3(.4,.8,-.8))),0.);
  vec3 lit=uColor*(.53+.11*n.y+sun*.48+fill*.12);
  lit+=vec3(.10,.085,.065)*sun+vec3(.09,.11,.12)*rim;
  float sheen=pow(max(dot(n,normalize(key+view)),0.),36.)*.045;
  lit+=vec3(sheen);
  lit=clamp((lit*(2.51*lit+.03))/(lit*(2.43*lit+.59)+.14),0.,1.);
  float fog=smoothstep(16.,48.,distance(vWorld,uEye));
  gl_FragColor=vec4(mix(lit,uAtmosphere,fog),uAlpha);
}`;
const colors = {
  ground: [0.79, 0.83, 0.76],
  slab: [0.9, 0.91, 0.85],
  wall: [0.91, 0.9, 0.82],
  roof: [0.32, 0.48, 0.4],
  frame: [0.31, 0.42, 0.35],
  glass: [0.29, 0.53, 0.5],
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
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentShader));
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
    uAlpha = gl.getUniformLocation(program, "uAlpha");
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
    roof = mesh(roofFaces);
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
    shotTime = 0;
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
  function draw(mesh, x, y, z, sx, sy, sz, color, ry = 0, rz = 0) {
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, 24, 12);
    gl.uniformMatrix4fv(uModel, false, model(x, y, z, sx, sy, sz, ry, rz));
    gl.uniform3fv(uColor, color);
    gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
  }
  function box(x, y, z, sx, sy, sz, color, ry = 0, rz = 0) {
    draw(cube, x, y, z, sx, sy, sz, color, ry, rz);
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
    box(
      x,
      1.1 * size,
      z,
      0.16 * size,
      2.2 * size,
      0.16 * size,
      [0.36, 0.3, 0.22],
      0,
      palm ? -0.1 : 0,
    );
    const breeze =
      manual && !reducedMotion.matches
        ? Math.sin(shotTime / 1900 + x * 0.35 + z * 0.2) * 0.035
        : 0;
    if (palm) {
      for (let i = 0; i < 7; i++) {
        const a = (i * Math.PI * 2) / 7;
        draw(
          sphere,
          x + Math.sin(a) * 0.65 * size + breeze,
          2.35 * size,
          z + Math.cos(a) * 0.65 * size,
          0.25 * size,
          0.11 * size,
          1.75 * size,
          [0.28, 0.46, 0.28],
          a,
          -0.16,
        );
      }
    } else {
      for (let i = 0; i < 3; i++)
        draw(
          sphere,
          x + (i - 1) * 0.32 * size + breeze,
          (2 + i * 0.28) * size,
          z + (i % 2) * 0.26 * size,
          1.65 * size,
          1.5 * size,
          1.55 * size,
          [0.27 + i * 0.035, 0.43 + i * 0.025, 0.28 + i * 0.02],
        );
    }
  }
  function landscape(now) {
    const mood = landscapes[environment];
    box(0, -0.18, 0, 110, 0.3, 110, mood.ground);
    // Low rolling land dissolves into the atmospheric horizon.
    for (let i = 0; i < 9; i++) {
      const a = (i * Math.PI * 2) / 9;
      const tall = environment === "mountain" ? 8 + (i % 3) * 3 : 2 + (i % 3);
      draw(
        sphere,
        Math.sin(a) * 25,
        -1,
        Math.cos(a) * 25,
        20,
        tall,
        18,
        mood.hills,
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
      box(0, -0.08, -18, 110, 0.1, 24, [0.28, 0.61, 0.63]);
      const wave =
        paused || reducedMotion.matches ? 0 : Math.sin(now / 2200) * 0.12;
      for (let i = 0; i < 5; i++)
        box(
          0,
          -0.018,
          -7.1 - i * 1.6 + wave,
          85,
          0.018,
          0.06 + i * 0.03,
          [0.67, 0.82, 0.77],
        );
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
      tree(x, z, 0.75 + (i % 3) * 0.2, environment === "beach"),
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
    function part(dx, dy, dz, sx, sy, sz, color, shape = cube, tilt = 0) {
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
    part(0, 1.17, 0, 0.34, 0.16, 0.34, colors.helmet, sphere);
    part(0, 1.12, 0.03, 0.36, 0.035, 0.34, colors.helmet);
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
    } else if (type === "greenshift") {
      box(-0.6, 0.015, -0.5, 7, 0.06, 4, colors.slab);
      building(0, -0.3, 1.3, elapsed);
      building(-2.5, -1.1, 0.85, elapsed - 120);
      if (manual || stage >= 4) {
        box(3, 0.05, -1, 2, 0.08, 3, [0.4, 0.7, 0.69]);
        box(3, 0.08, -1, 1.65, 0.015, 2.65, [0.31, 0.64, 0.65]);
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
        for (const z of [-2.5, 2.5]) tree(x, z, 0.45, environment === "beach");
    }
    person(now, elapsed);
    canvas.dataset.rendered = "true";
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
