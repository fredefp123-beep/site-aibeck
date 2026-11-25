/* AIBeck V11 — linguagem "vidro térmico": gradiente atrás de vidro canelado, orbe de vidro e títulos que enchem de cor.
   Rampa nas cores da AIBeck (gelo → ciano → azul → índigo). Tudo decorativo: se o WebGL faltar, o CSS segura o visual. */
(() => {
  'use strict';
  const RAMP = ['#ffffff', '#eef7ff', '#c8ecff', '#8fdcff', '#62e8fb', '#38b6ff', '#398bf9', '#3d62f2', '#4a43e6'];
  const vec = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const RV = new Float32Array(RAMP.map(vec).flat());
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const RAMP_GLSL = `
  uniform vec3 uR[9];
  vec3 seg(vec3 a, vec3 b, float x0, float x1, float v){ return mix(a, b, smoothstep(x0, x1, v)); }
  vec3 ramp(float v){
    vec3 c = uR[0];
    c = seg(c, uR[1], 0.00, 0.10, v); c = seg(c, uR[2], 0.10, 0.24, v); c = seg(c, uR[3], 0.24, 0.38, v);
    c = seg(c, uR[4], 0.38, 0.50, v); c = seg(c, uR[5], 0.50, 0.63, v); c = seg(c, uR[6], 0.63, 0.79, v);
    c = seg(c, uR[7], 0.79, 0.91, v); c = seg(c, uR[8], 0.91, 1.00, v);
    return c;
  }`;
  const VS = 'attribute vec2 p; varying vec2 vUv; void main(){ vUv = vec2(p.x*.5+.5, .5-p.y*.5); gl_Position = vec4(p,0.,1.); }';
  function program(gl, fs) {
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const l = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(gl.getUniformLocation(pr, 'uR'), RV);
    return pr;
  }

  /* ---------- gradiente térmico atrás de vidro canelado ---------- */
  const THERMAL_FS = `precision highp float;
  uniform sampler2D uMask; uniform vec2 uSize; uniform vec3 uFlute; uniform float uTime;
  varying vec2 vUv;
  ${RAMP_GLSL}
  float hash(float n){ return fract(sin(n*127.1+311.7)*43758.5453); }
  void main(){
    vec2 px = vUv * uSize; vec2 sp = px; float shade = 0.0;
    float w = uFlute.x; float i = floor(px.x / w), f = fract(px.x / w);
    float off = (mod(i, 2.0) < 0.5 ? 1.0 : -1.0) * (0.5 + 0.5*hash(i*1.7+3.1)) * uFlute.y;
    float cc = (i + 0.5 + (f - 0.5) * uFlute.z) * w;
    sp = vec2(cc, px.y + off);
    shade = (1.0 - smoothstep(0.0, 2.5 / w, f)) * 0.10 - (f - 0.5) * 0.035;
    float v = texture2D(uMask, sp / uSize).r;
    float fl = 0.5 + 0.27*sin(sp.x*0.0031 + sp.y*0.0012 + uTime*0.9) + 0.23*sin(sp.y*0.0046 - sp.x*0.0019 - uTime*0.7);
    v = clamp(v * mix(1.0, 0.55 + 0.45*fl, 0.6), 0.0, 1.0);
    vec3 col = ramp(v) + shade * smoothstep(0.05, 0.3, v);
    float a = smoothstep(0.0, 0.08, v);
    gl_FragColor = vec4(col * a, a);
  }`;
  function thermal(cv) {
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) { cv.classList.add('ab11-nogl'); return null; }
    const pr = program(gl, THERMAL_FS);
    const U = n => gl.getUniformLocation(pr, n);
    const uSize = U('uSize'), uFlute = U('uFlute'), uTime = U('uTime');
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([a, b]) => gl.texParameteri(gl.TEXTURE_2D, a, b));
    const mask = document.createElement('canvas'), m = mask.getContext('2d');
    const shape = cv.dataset.ab11Thermal || 'blob';
    let W = 0, H = 0;
    const size = () => {
      const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 1.5);
      W = Math.max(2, Math.round(r.width)); H = Math.max(2, Math.round(r.height));
      cv.width = Math.round(W * d); cv.height = Math.round(H * d);
      mask.width = Math.max(2, Math.round(W / 2)); mask.height = Math.max(2, Math.round(H / 2));
    };
    const blob = (x, y, rx, ry, heat, blur) => { m.filter = `blur(${blur / 2}px)`; const g = Math.round(heat * 255); m.fillStyle = `rgb(${g},${g},${g})`; m.beginPath(); m.ellipse(x / 2, y / 2, rx / 2, ry / 2, 0, 0, 7); m.fill(); };
    function draw(t) {
      m.globalCompositeOperation = 'source-over'; m.filter = 'none'; m.fillStyle = '#000'; m.fillRect(0, 0, mask.width, mask.height);
      m.globalCompositeOperation = 'lighter';
      const s = Math.min(W, H), cx = W / 2, cy = H / 2;
      if (shape === 'wide') {
        blob(cx + Math.sin(t * .35) * W * .05, cy, W * .42, H * .30, .55, s * .22);
        blob(cx - W * .12 + Math.sin(t * .5) * W * .04, cy + Math.cos(t * .4) * H * .05, W * .22, H * .2, .5, s * .2);
        blob(cx + W * .14 + Math.cos(t * .45) * W * .04, cy - H * .03, W * .2, H * .16, .45, s * .18);
      } else {
        blob(cx + Math.sin(t * .4) * s * .05, cy + Math.cos(t * .33) * s * .04, s * .40, s * .36, .55, s * .16);
        blob(cx - s * .08 + Math.cos(t * .5) * s * .06, cy + s * .02, s * .24, s * .22, .5, s * .14);
        blob(cx + s * .1 + Math.sin(t * .6) * s * .05, cy - s * .06 + Math.cos(t * .5) * s * .04, s * .16, s * .14, .45, s * .1);
      }
      gl.viewport(0, 0, cv.width, cv.height);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, mask);
      gl.uniform2f(uSize, W, H);
      const fw = Math.max(34, Math.min(110, W / 14));
      gl.uniform3f(uFlute, fw, fw * .55, 2.2);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    size(); addEventListener('resize', () => { size(); draw(performance.now() / 1000); });
    return { draw, el: cv };
  }

  /* ---------- orbe de vidro (o mascote) ---------- */
  const ORB_FS = `precision highp float;
  uniform vec4 uA; uniform vec4 uB; uniform float uPx; uniform vec3 uRim1, uRim2;
  varying vec2 vUv;
  ${RAMP_GLSL}
  float caps(vec2 p, vec2 c, float hw, float hh){ vec2 q = p - c; q.y -= clamp(q.y, -(hh - hw), hh - hw); return length(q) - hw; }
  void main(){
    vec2 p = (vUv*2.0-1.0) * 1.03; float r = length(p);
    float alpha = clamp((1.0 - r) * uPx, 0.0, 1.0);
    if (alpha <= 0.0) { gl_FragColor = vec4(0.0); return; }
    float z = sqrt(max(0.0, 1.0 - r*r)); vec3 n = vec3(p, z);
    float cy = cos(uA.x), sy = sin(uA.x), cx = cos(uA.y), sx = sin(uA.y);
    vec3 q = vec3(n.x*cy + n.z*sy, n.y, -n.x*sy + n.z*cy); q = vec3(q.x, q.y*cx - q.z*sx, q.y*sx + q.z*cx);
    float t = uA.z;
    float a = q.y*2.1 + sin(q.x*2.2 + t*0.55)*0.75 + sin(q.z*1.8 - t*0.38)*0.55;
    float band = sin(a*1.55 + t*0.42)*0.5 + 0.5;
    float c2 = sin(q.x*2.7 + q.y*1.2 + t*0.62 + sin(q.z*3.1 + t*0.2)*0.8)*0.5 + 0.5;
    float hot = smoothstep(0.26, 0.88, band) * mix(0.74, 1.0, c2);
    float v = mix(0.40 + 0.10*c2, 0.99, hot);
    vec3 col = ramp(clamp(v, 0.0, 1.0));
    float fres = pow(1.0 - z, 2.4);
    float side = 0.5 + 0.5 * dot(normalize(p + 1e-4), normalize(vec2(0.75, 0.55)));
    col = mix(col, uRim1, fres * (0.34 + 0.50*side)); col = mix(col, uRim2, fres * 0.30 * (1.0 - side));
    float lit = dot(n, normalize(vec3(-0.45, -0.60, 0.66)));
    col *= 0.90 + 0.14 * lit;
    col += pow(max(0.0, lit), 18.0) * 0.50;
    col += pow(max(0.0, dot(n, normalize(vec3(-0.30, -0.45, 0.84)))), 90.0) * 0.55;
    if (uB.w > 0.001) {
      vec2 g = uB.xy; float spread = 0.205 * (1.0 - 0.45*abs(g.x));
      vec2 c0 = vec2(g.x*0.36, -0.04 + g.y*0.30); float hh = mix(0.175, 0.022, uB.z);
      float d = min(caps(p, c0 - vec2(spread, 0.0), 0.062, hh), caps(p, c0 + vec2(spread, 0.0), 0.062, hh));
      col = mix(col, vec3(0.03,0.06,0.14), (1.0 - smoothstep(-1.2/uPx, 1.2/uPx, d)) * uB.w);
      vec2 s0 = c0 + vec2(0.022, -0.085);
      float sd = min(length(p - (s0 - vec2(spread, 0.0))), length(p - (s0 + vec2(spread, 0.0)))) - 0.020;
      col = mix(col, vec3(1.0), (1.0 - smoothstep(-1.2/uPx, 1.2/uPx, sd)) * uB.w * (1.0 - uB.z) * 0.85);
    }
    gl_FragColor = vec4(clamp(col, 0.0, 1.0) * alpha, alpha);
  }`;
  let orbGL = null;
  function orbEngine() {
    if (orbGL !== null) return orbGL;
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const gl = c.getContext('webgl', { alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true });
    if (!gl) return (orbGL = false);
    const pr = program(gl, ORB_FS);
    gl.uniform3fv(gl.getUniformLocation(pr, 'uRim1'), vec('#2f5bff')); gl.uniform3fv(gl.getUniformLocation(pr, 'uRim2'), vec('#62e8fb'));
    gl.clearColor(0, 0, 0, 0);
    return (orbGL = { c, gl, uA: gl.getUniformLocation(pr, 'uA'), uB: gl.getUniformLocation(pr, 'uB'), uPx: gl.getUniformLocation(pr, 'uPx') });
  }
  const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  function orb(cv) {
    const E = orbEngine(); if (!E) { cv.classList.add('ab11-nogl'); return null; }
    const size = cv.getBoundingClientRect().width || 64, d = Math.min(devicePixelRatio || 1, 2), px = Math.min(512, Math.round(size * d));
    cv.width = cv.height = px; const ctx = cv.getContext('2d');
    const eyes = cv.dataset.ab11Orb !== 'glass';
    const seed = Math.random() * 10; let nextBlink = 1 + Math.random() * 3, gx = 0, gy = 0;
    function draw(t) {
      const r = cv.getBoundingClientRect();
      const tx = Math.max(-1, Math.min(1, (mouse.x - (r.left + r.width / 2)) / 500)), ty = Math.max(-1, Math.min(1, (mouse.y - (r.top + r.height / 2)) / 500));
      gx += (tx * .7 - gx) * .08; gy += (ty * .6 - gy) * .08;
      let blink = 0; const bt = t - nextBlink; if (bt > 0) { const x = bt / .16 - 1; blink = Math.max(0, 1 - x * x); if (bt > .32) nextBlink = t + 2.5 + Math.random() * 3; }
      const { gl } = E; gl.viewport(0, 0, px, px); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform4f(E.uA, gx * .5 + Math.sin(t * .3 + seed) * .15, gy * .35, t + seed, 1);
      gl.uniform4f(E.uB, gx, gy, blink, eyes ? 1 : 0); gl.uniform1f(E.uPx, px / 2);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      ctx.clearRect(0, 0, px, px); ctx.drawImage(E.c, 0, 512 - px, px, px, 0, 0, px, px);
    }
    return { draw, el: cv };
  }

  /* ---------- laço de animação: só desenha o que está na tela ---------- */
  const items = [];
  const io = new IntersectionObserver(es => es.forEach(e => { const it = items.find(i => i.el === e.target); if (it) it.on = e.isIntersecting; }), { rootMargin: '120px' });
  function add(it) { if (!it) return; it.on = true; items.push(it); io.observe(it.el); it.draw(0.5); }
  document.querySelectorAll('canvas[data-ab11-thermal]').forEach(c => { try { add(thermal(c)); } catch (e) { c.classList.add('ab11-nogl'); } });
  document.querySelectorAll('canvas[data-ab11-orb]').forEach(c => { try { add(orb(c)); } catch (e) { c.classList.add('ab11-nogl'); } });
  if (!reduced) {
    let last = 0;
    const loop = now => { requestAnimationFrame(loop); if (now - last < 33 || document.hidden) return; last = now; const t = now / 1000; items.forEach(i => i.on && i.draw(t)); };
    requestAnimationFrame(loop);
  }

  /* ---------- títulos nascem ocos e enchem de cor ---------- */
  const heads = document.querySelectorAll('.ab11-fill');
  if (reduced || !('IntersectionObserver' in window)) heads.forEach(h => h.classList.add('is-filled'));
  else {
    const ho = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-filled'); ho.unobserve(e.target); } }), { threshold: .35 });
    heads.forEach(h => ho.observe(h));
  }
})();
