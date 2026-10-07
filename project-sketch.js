// Native WebGL architectural massing studies. Source imagery stays visible below.
// These schematic models illustrate form; they are not measured project surveys.
const vertex = `attribute vec3 aPosition;attribute vec3 aNormal;uniform mat4 uCamera;varying vec3 vNormal;varying vec3 vWorld;void main(){vNormal=aNormal;vWorld=aPosition;gl_Position=uCamera*vec4(aPosition,1.);}`;
const fragment = `precision highp float;uniform float uInk;varying vec3 vNormal;varying vec3 vWorld;void main(){if(uInk>.5){gl_FragColor=vec4(.19,.28,.24,.68);return;}vec3 n=normalize(vNormal);float light=max(dot(n,normalize(vec3(-.6,1.,.7))),0.);float hatch=smoothstep(.9,.99,.5+.5*sin((vWorld.x+vWorld.z+vWorld.y)*6.));vec3 paper=vec3(.94,.935,.895);vec3 shade=mix(vec3(.67,.72,.65),paper,.38+light*.62);shade-=hatch*(1.-light)*.02;gl_FragColor=vec4(shade,1.);}`;
const subtract = (a, b) => a.map((v, i) => v - b[i]);
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const normalize = (a) => {
  const d = Math.hypot(...a) || 1;
  return a.map((v) => v / d);
};
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
function camera(eye, target, aspect) {
  const z = normalize(subtract(eye, target)),
    x = normalize(cross([0, 1, 0], z)),
    y = cross(z, x);
  const view = [
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
  ];
  const f = 1 / Math.tan(Math.PI / 8),
    near = 0.1,
    far = 160;
  const projection = [
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
  ];
  return new Float32Array(
    Array.from({ length: 16 }, (_, i) => {
      const c = Math.floor(i / 4),
        r = i % 4;
      return [0, 1, 2, 3].reduce(
        (s, k) => s + projection[k * 4 + r] * view[c * 4 + k],
        0,
      );
    }),
  );
}
export function createProjectGeometry(slug) {
  const faces = [],
    lines = [];
  let radius = 10;
  const line = (a, b) => lines.push(...a, 0, 1, 0, ...b, 0, 1, 0);
  const face = (points) => {
    const normal = normalize(
      cross(subtract(points[1], points[0]), subtract(points[2], points[0])),
    );
    for (let i = 1; i < points.length - 1; i++)
      for (const p of [points[0], points[i], points[i + 1]])
        faces.push(...p, ...normal);
    for (let i = 0; i < points.length; i++)
      line(points[i], points[(i + 1) % points.length]);
  };
  const box = (x, y, z, w, h, d) => {
    const a = [x - w / 2, y, z - d / 2],
      b = [x + w / 2, y, z - d / 2],
      c = [x + w / 2, y, z + d / 2],
      e = [x - w / 2, y, z + d / 2];
    const top = (p) => [p[0], p[1] + h, p[2]];
    face([a, b, top(b), top(a)]);
    face([b, c, top(c), top(b)]);
    face([c, e, top(e), top(c)]);
    face([e, a, top(a), top(e)]);
    face([top(a), top(b), top(c), top(e)]);
  };
  const windows = (x, y, z, w, h, count = 3) => {
    for (let i = 0; i < count; i++) {
      const px = x - w / 2 + ((i + 0.5) * w) / count;
      box(px, y, z, 0.5, h, 0.045);
    }
  };
  const house = (x, z, size = 1) => {
    box(x, 0, z, 2.8 * size, 1.7 * size, 3.2 * size);
    box(x + 0.9 * size, 0, z + 1.1 * size, 0.17 * size, 2.4 * size, 1.5 * size);
    face([
      [x - 1.65 * size, 1.7 * size, z - 1.9 * size],
      [x + 1.65 * size, 1.7 * size, z - 1.9 * size],
      [x + 1.65 * size, 2.15 * size, z + 1.9 * size],
      [x - 1.65 * size, 2.15 * size, z + 1.9 * size],
    ]);
    windows(x, 0.5 * size, z + 1.61 * size, 2.3 * size, 0.8 * size, 2);
  };
  const pavilion = (x, z, w = 8, d = 5) => {
    box(x, 0.05, z, w, 0.2, d);
    for (const xx of [-1, 1])
      for (const zz of [-1, 1])
        box(x + xx * w * 0.4, 0.25, z + zz * d * 0.4, 0.12, 2.9, 0.12);
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2,
        b = ((i + 1) / 36) * Math.PI * 2;
      const p = (t) => [
        x + Math.cos(t) * w * 0.62,
        3.1 + 0.6 * Math.sin(t * 2),
        z + Math.sin(t) * d * 0.65,
      ];
      face([[x, 3.85, z], p(a), p(b)]);
    }
    windows(x, 0.5, z + d * 0.42, w * 0.7, 1.7, 7);
  };
  if (slug === "housing") {
    radius = 23;
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 5; col++) house((col - 2) * 4.3, (row - 1) * 5.3);
  } else if (slug === "nuanu") {
    radius = 12;
    for (let v = 0; v < 14; v++)
      for (let u = 0; u < 40; u++) {
        const p = (i, j) => {
          const a = (i / 40) * Math.PI * 2,
            b = ((j / 14) * Math.PI) / 2;
          return [
            Math.cos(a) * Math.cos(b) * 4,
            Math.sin(b) * 4,
            Math.sin(a) * Math.cos(b) * 4,
          ];
        };
        face([p(u, v), p(u + 1, v), p(u + 1, v + 1), p(u, v + 1)]);
      }
    box(0, 0, 0, 10, 0.15, 9);
  } else if (slug === "retrofit") {
    radius = 22;
    box(0, 0, 0, 7, 7, 6);
    for (let floor = 0; floor < 5; floor++) {
      box(0, floor * 1.35, 0, 7.4, 0.12, 6.4);
      windows(0, floor * 1.35 + 0.35, 3.05, 6, 0.7, 6);
    }
    face([
      [-4, 7, -3.5],
      [4, 7, -3.5],
      [0, 9.2, 0],
    ]);
    face([
      [-4, 7, 3.5],
      [4, 7, 3.5],
      [0, 9.2, 0],
    ]);
    box(0, 0, 4.1, 3, 0.3, 2.1);
  } else if (slug === "ulaman" || slug === "bamboo") {
    radius = 13;
    pavilion(0, 0, 8, 5);
    if (slug === "bamboo")
      for (let i = 0; i < 8; i++) box(-3.4 + i, 0, 0, 0.1, 3.4, 0.1);
  } else if (slug === "sport") {
    radius = 16;
    box(0, 0, 0, 10, 3.5, 6);
    face([
      [-5.6, 3.5, -3.5],
      [5.6, 3.5, -3.5],
      [0, 5, 0],
    ]);
    face([
      [-5.6, 3.5, 3.5],
      [5.6, 3.5, 3.5],
      [0, 5, 0],
    ]);
    windows(0, 1, 3.03, 9, 1.8, 7);
  } else if (slug === "pods") {
    radius = 12;
    for (let i = -1; i <= 1; i++) {
      box(i * 3.8, 0, 0, 3, 2, 4.5);
      box(i * 3.8, 2, 0, 3.4, 0.16, 4.9);
      windows(i * 3.8, 0.3, 2.26, 2.5, 1.5, 2);
    }
  } else if (slug === "lombok") {
    radius = 18;
    for (let i = 0; i < 3; i++) house((i - 1) * 5, 0, 1.3);
  } else {
    radius = 13;
    box(-1, 0, 0, 5, 2.6, 4);
    box(2, 0, 1, 3, 2.6, 4);
    box(0, 2.6, 0, 8, 0.17, 6);
    windows(0, 0.45, 3.02, 6, 1.6, 5);
    box(0, -0.05, 5, 7, 0.05, 2);
  }
  // Survey grid, base slab and stylised landscaping support the architectural study.
  box(0, -0.19, 0, radius * 1.3, 0.12, radius * 0.9);
  for (let i = -8; i <= 8; i++) {
    const v = (i * radius) / 9;
    line([v, -0.2, -radius], [v, -0.2, radius]);
    line([-radius, -0.2, v], [radius, -0.2, v]);
  }
  for (const [x, z] of [
    [-radius * 0.5, 0],
    [radius * 0.5, -radius * 0.28],
    [-radius * 0.35, radius * 0.3],
  ]) {
    box(x, 0, z, 0.08, 2, 0.08);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2,
        b = ((i + 1) / 12) * Math.PI * 2;
      face([
        [x, 3, z],
        [x + Math.cos(a) * 0.8, 1.5, z + Math.sin(a) * 0.8],
        [x + Math.cos(b) * 0.8, 1.5, z + Math.sin(b) * 0.8],
      ]);
    }
  }
  return {
    faces: new Float32Array(faces),
    lines: new Float32Array(lines),
    radius,
  };
}
export function initProjectSketch(frame) {
  const canvas = frame.querySelector("canvas"),
    controls = frame.querySelector(".sketch-controls"),
    button = frame.querySelector("[data-sketch-play]");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  if (navigator.connection?.saveData) return;
  let gl;
  try {
    gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch {
    return;
  }
  if (!gl) return;
  const program = gl.createProgram();
  const shaders = [];
  for (const [kind, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ]) {
    const s = gl.createShader(kind);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return;
    gl.attachShader(program, s);
    shaders.push(s);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  shaders.forEach((s) => gl.deleteShader(s));
  const geometry = createProjectGeometry(frame.dataset.projectSketch);
  const buffers = [geometry.faces, geometry.lines].map((data) => {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return b;
  });
  const position = gl.getAttribLocation(program, "aPosition"),
    normal = gl.getAttribLocation(program, "aNormal"),
    matrix = gl.getUniformLocation(program, "uCamera"),
    ink = gl.getUniformLocation(program, "uInk");
  gl.enableVertexAttribArray(position);
  gl.enableVertexAttribArray(normal);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  let angle = 0.62,
    playing = !reduced.matches,
    visible = false,
    lost = false,
    raf = 0,
    previous = 0,
    drag;
  const label = () => {
    button.textContent = playing ? "Pause camera" : "Play camera";
    button.setAttribute("aria-pressed", String(playing));
  };
  function draw(time = 0) {
    raf = 0;
    if (lost) return;
    const rect = canvas.getBoundingClientRect(),
      dpi = Math.min(devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(rect.width * dpi)),
      h = Math.max(1, Math.round(rect.height * dpi));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    if (playing && visible && !document.hidden) {
      if (previous) angle += Math.min(time - previous, 50) * 0.000055;
      previous = time;
    } else previous = 0;
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.945, 0.94, 0.91, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const r = geometry.radius * (rect.width < 500 ? 1.15 : 1);
    gl.uniformMatrix4fv(
      matrix,
      false,
      camera(
        [Math.sin(angle) * r, r * 0.52, Math.cos(angle) * r],
        [0, frame.dataset.projectSketch === "retrofit" ? 4 : 1, 0],
        w / h,
      ),
    );
    for (let i = 0; i < 2; i++) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i]);
      gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 24, 0);
      gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, 24, 12);
      gl.uniform1f(ink, i);
      if (i === 0) {
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1, 1);
        gl.drawArrays(gl.TRIANGLES, 0, geometry.faces.length / 6);
        gl.disable(gl.POLYGON_OFFSET_FILL);
      } else {
        gl.depthFunc(gl.LEQUAL);
        gl.drawArrays(gl.LINES, 0, geometry.lines.length / 6);
        gl.depthFunc(gl.LESS);
      }
    }
    if (playing && visible && !document.hidden)
      raf = requestAnimationFrame(draw);
  }
  const request = () => {
    if (!raf && !lost) raf = requestAnimationFrame(draw);
  };
  button.addEventListener("click", () => {
    playing = !playing;
    previous = 0;
    label();
    request();
  });
  frame.querySelector("[data-sketch-reset]").addEventListener("click", () => {
    angle = 0.62;
    request();
  });
  const rotate = (d) => {
    angle += d;
    playing = false;
    label();
    request();
  };
  for (const b of frame.querySelectorAll("[data-sketch-rotate]"))
    b.addEventListener("click", () => rotate(Number(b.dataset.sketchRotate)));
  canvas.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, y: e.clientY, angle, id: e.pointerId };
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x,
      dy = e.clientY - drag.y;
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
      drag = null;
      return;
    }
    if (Math.abs(dx) > 5) {
      angle = drag.angle + dx * 0.006;
      playing = false;
      label();
      request();
    }
  });
  for (const event of ["pointerup", "pointercancel", "pointerleave"])
    canvas.addEventListener(event, () => {
      drag = null;
    });
  canvas.addEventListener("keydown", (e) => {
    if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      rotate(e.key === "ArrowLeft" ? -0.16 : 0.16);
    }
  });
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    lost = true;
    cancelAnimationFrame(raf);
    frame.dataset.sketchReady = "false";
    controls.hidden = true;
  });
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      previous = 0;
      if (!visible) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else request();
    },
    { threshold: 0.05 },
  );
  observer.observe(canvas);
  new ResizeObserver(request).observe(canvas);
  document.addEventListener("visibilitychange", () => {
    previous = 0;
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (visible) request();
  });
  reduced.addEventListener("change", () => {
    if (reduced.matches) playing = false;
    label();
    request();
  });
  frame.dataset.sketchReady = "true";
  canvas.hidden = false;
  controls.hidden = false;
  canvas.dataset.renderer = "webgl";
  label();
  request();
}
