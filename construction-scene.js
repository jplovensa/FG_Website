// A small, self-contained WebGL scene. No engine, textures or external models.
const vertexShader = `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 uModel;
uniform mat4 uCamera;
varying vec3 vNormal;
void main(){vNormal=mat3(uModel)*aNormal;gl_Position=uCamera*uModel*vec4(aPosition,1.0);}`;
const fragmentShader = `
precision mediump float;
uniform vec3 uColor;
varying vec3 vNormal;
void main(){float light=.58+.42*max(dot(normalize(vNormal),normalize(vec3(-.5,1.,.8))),0.);gl_FragColor=vec4(uColor*light,1.);}`;
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
function camera(angle, aspect) {
  const eye = [Math.sin(angle) * 12, 8.8, Math.cos(angle) * 12],
    target = [0, 0.65, 0];
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
  const f = 1 / Math.tan(Math.PI / 8),
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
  return multiply(projection, view);
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
function triangles(faces) {
  const data = [];
  for (const face of faces) {
    for (let i = 1; i < face.length - 1; i++) {
      const tri = [face[0], face[i], face[i + 1]],
        a = tri[1].map((n, j) => n - tri[0][j]),
        b = tri[2].map((n, j) => n - tri[0][j]),
        normal = normalize(cross(a, b));
      for (const v of tri) data.push(...v, ...normal);
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
    lat = 10,
    lon = 14;
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
  { reducedMotion, onUnavailable = () => {} } = {},
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
    uColor = gl.getUniformLocation(program, "uColor");
  function mesh(faces) {
    const data = triangles(faces),
      buffer = gl.createBuffer();
    buffers.push(buffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return { buffer, count: data.length / 6 };
  }
  const cube = mesh(cubeFaces),
    sphere = mesh(sphereFaces()),
    roof = mesh(roofFaces);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.91, 0.93, 0.89, 1);
  let stage = 0,
    type = "home",
    angle = 0.65,
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
  const guide = document.querySelector("#scene-guide-text");
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
  function building(x, z, scale, elapsed) {
    const y = 0.1;
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
    if (stage >= 1) {
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
    if (stage >= 1) {
      const thickness = stage === 1 ? 0.022 : 0.075;
      const frameColor = stage === 1 ? colors.plan : colors.frame;
      for (const dx of [-1, 1])
        for (const dz of [-0.9, 0.9])
          box(
            x + dx * scale,
            0.75 * scale,
            z + dz * scale,
            thickness * scale,
            1.35 * scale,
            thickness * scale,
            frameColor,
          );
      for (const dz of [-0.9, 0.9])
        box(
          x,
          1.4 * scale,
          z + dz * scale,
          2.05 * scale,
          thickness * scale,
          thickness * scale,
          frameColor,
        );
    }
    if (stage >= 3) {
      const lift = reducedMotion.matches
        ? 0
        : Math.max(0, 1 - elapsed / 900) * 1.5;
      box(
        x,
        0.77 * scale + lift,
        z,
        2 * scale,
        1.3 * scale,
        1.8 * scale,
        colors.wall,
      );
      box(
        x - 0.6 * scale,
        0.83 * scale + lift,
        z + 0.906 * scale,
        0.48 * scale,
        0.52 * scale,
        0.025,
        colors.glass,
      );
      box(
        x + 0.55 * scale,
        0.67 * scale + lift,
        z + 0.907 * scale,
        0.42 * scale,
        0.99 * scale,
        0.025,
        colors.frame,
      );
      box(
        x + 1.006 * scale,
        0.85 * scale + lift,
        z,
        0.025,
        0.45 * scale,
        0.85 * scale,
        colors.glass,
      );
    }
    if (stage >= 4) {
      draw(
        roof,
        x,
        1.43 * scale,
        z,
        2.2 * scale,
        0.65 * scale,
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
    character = previousCharacter.map((n, i) => n + (target[i] - n) * ease);
    const walking = t < 1 && !paused && !reducedMotion.matches,
      phase = now / 160,
      bob = walking ? Math.abs(Math.sin(phase)) * 0.035 : 0;
    const rx = character[0],
      rz = character[1],
      face = angle,
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
    const stride = walking ? Math.sin(phase) * 0.08 : 0;
    part(-0.11, 0.26, stride, 0.13, 0.42, 0.16, colors.dark);
    part(0.11, 0.26, -stride, 0.13, 0.42, 0.16, colors.dark);
    part(0, 0.66, 0, 0.4, 0.46, 0.22, colors.jacket);
    part(0, 1.03, 0, 0.28, 0.29, 0.28, colors.skin, sphere);
    part(0, 1.17, 0, 0.34, 0.16, 0.34, colors.helmet, sphere);
    part(0, 1.12, 0.03, 0.36, 0.035, 0.34, colors.helmet);
    part(-0.28, 0.64, 0, 0.1, 0.37, 0.12, colors.jacket, cube, -0.12);
    part(-0.3, 0.43, 0, 0.1, 0.11, 0.12, colors.skin, sphere);
    const wave =
      stage === 0 && !paused && !reducedMotion.matches
        ? Math.sin(now / 550) * 0.15
        : 0;
    part(0.29, 0.8, 0, 0.1, 0.35, 0.12, colors.jacket, cube, -0.75 - wave);
    part(0.4, 0.89, 0, 0.1, 0.11, 0.12, colors.skin, sphere);
    part(-0.055, 1.05, 0.13, 0.025, 0.025, 0.02, colors.dark, sphere);
    part(0.055, 1.05, 0.13, 0.025, 0.025, 0.02, colors.dark, sphere);
  }
  function render(now = performance.now()) {
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
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.enableVertexAttribArray(position);
    gl.enableVertexAttribArray(normal);
    gl.uniformMatrix4fv(uCamera, false, camera(angle, width / height));
    box(0, -0.14, 0, 10, 0.25, 7, colors.ground);
    box(0, 0.005, 2.2, 8, 0.035, 0.65, colors.slab);
    for (let x = -4; x <= 4; x++)
      box(x, 0.003, -0.45, 0.013, 0.015, 5.5, colors.plan);
    const elapsed = Math.max(0, now - transitionStart),
      mass = ["housing", "workers", "modular"].includes(type);
    if (mass) {
      for (let i = 0; i < 6; i++)
        building(
          ((i % 3) - 1) * 2.45,
          -Math.floor(i / 3) * 1.95 + 0.3,
          0.7,
          elapsed + i * -90,
        );
    } else building(0, -0.5, type === "hospitality" ? 1.4 : 1, elapsed);
    if (stage >= 2 && stage < 4) {
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
    if (stage === 4) {
      for (const x of [-4, 4])
        for (const z of [-2.5, 2.5]) {
          box(x, 0.36, z, 0.1, 0.65, 0.1, colors.frame);
          draw(sphere, x, 0.95, z, 0.72, 1.05, 0.72, colors.tree);
        }
    }
    person(now, elapsed);
    canvas.dataset.rendered = "true";
    canvas.dataset.stage = String(stage);
    canvas.dataset.projectType = type;
  }
  function loop(now) {
    if (!active || lost) return;
    if (now - last > 33) {
      render(now);
      last = now;
    }
    // Stop drawing settled stages; only the greeting keeps an idle gesture.
    if (
      !paused &&
      !reducedMotion.matches &&
      (stage === 0 || now - transitionStart < 1500)
    )
      frame = requestAnimationFrame(loop);
  }
  function requestRender() {
    cancelAnimationFrame(frame);
    render();
    if (active && !paused && !reducedMotion.matches)
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
  visibility.observe(canvas);
  const resize = new ResizeObserver(requestRender);
  resize.observe(canvas);
  document.addEventListener("visibilitychange", () => {
    active =
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
      angle = 0.65;
      requestRender();
    },
    pause(value) {
      paused = value;
      requestRender();
    },
  };
}
