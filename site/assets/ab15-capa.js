/* AIBeck V15 — capa de entrada: horizonte azul ao anoitecer, logo oficial em metal líquido pousado no horizonte.
   WebGL puro (sem bibliotecas). Sem WebGL, fica a versão em CSS com o logo. */
(() => {
  'use strict';
  const sec = document.getElementById('capa');
  const cv = sec && sec.querySelector('.ab15-gl');
  if (!cv) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gl = cv.getContext('webgl', { antialias: true, alpha: false, premultipliedAlpha: false });
  if (!gl) { sec.classList.add('ab15-nogl'); return; }

  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `precision highp float;
  uniform vec2 uRes; uniform float uTime; uniform float uRise; uniform vec4 uRect; uniform float uHz; uniform vec2 uMouse;
  uniform sampler2D uLogo; uniform sampler2D uBlur; uniform vec2 uTex;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
  vec3 skyRamp(float t){ /* 0 = horizonte, 1 = topo */
    vec3 c0=vec3(.86,.99,1.), c1=vec3(.38,.91,.98), c2=vec3(.22,.55,.98), c3=vec3(.13,.3,.86), c4=vec3(.05,.1,.34), c5=vec3(.016,.03,.08);
    vec3 c=mix(c0,c1,smoothstep(0.,.05,t)); c=mix(c,c2,smoothstep(.05,.2,t)); c=mix(c,c3,smoothstep(.2,.42,t));
    c=mix(c,c4,smoothstep(.42,.7,t)); c=mix(c,c5,smoothstep(.7,1.,t)); return c; }
  vec3 chrome(float r){ /* faixas do cromo refletindo o céu */
    r=fract(r);
    vec3 a=vec3(.02,.05,.14), b=vec3(.16,.5,.98), c=vec3(.55,.96,1.), d=vec3(1.), e=vec3(.36,.32,.95);
    vec3 col=mix(a,b,smoothstep(0.,.22,r)); col=mix(col,c,smoothstep(.22,.38,r)); col=mix(col,d,smoothstep(.38,.46,r));
    col=mix(col,c,smoothstep(.46,.56,r)); col=mix(col,e,smoothstep(.56,.78,r)); col=mix(col,a,smoothstep(.78,1.,r)); return col; }
  void main(){
    vec2 fc=gl_FragCoord.xy; vec2 uv=fc/uRes; float hz=uHz*uRes.y; /* horizonte em px, de baixo */
    float t=uTime;
    vec3 col;
    float glowX=exp(-pow((uv.x-.5)*1.6,2.));
    if(fc.y>=hz){
      float s=(fc.y-hz)/(uRes.y-hz);
      col=skyRamp(s*(1.08-.08*uRise));
      /* aurora */
      float band=noise(vec2(uv.x*2.2+t*.03, s*3.-t*.02));
      float aur=smoothstep(.55,1.,band)*smoothstep(.15,.45,s)*smoothstep(.95,.5,s);
      col+=aur*mix(vec3(.15,.9,.95),vec3(.55,.35,1.),uv.x)*.28;
      /* estrelas */
      vec2 cs=fc/6.; vec2 g=floor(cs); float h=hash(g); float tw=.55+.45*sin(t*1.7+h*40.);
      float dd=length(fract(cs)-.5-vec2(hash(g+3.)-.5,hash(g+7.)-.5)*.5);
      col+=step(.978,h)*smoothstep(.26,0.,dd)*1.3*tw*smoothstep(.3,.85,s)*vec3(.8,.95,1.);
      /* brilho no horizonte */
      col+=vec3(.35,.85,1.)*glowX*exp(-s*9.)*.55*uRise;
    } else {
      float d=(hz-fc.y)/hz; /* 0 no horizonte, 1 embaixo */
      vec3 g0=vec3(.07,.22,.36), g1=vec3(.008,.02,.045);
      col=mix(g0,g1,smoothstep(0.,.55,d));
      /* chão: grade em perspectiva, em ciano */
      float z=1./max(d,.002); float x=(uv.x-.5)*z;
      float gx=abs(fract(x*1.3)-.5), gz=abs(fract(z*.9-t*.12)-.5);
      float line=(smoothstep(.03*z*.25+.012,0.,gx)+smoothstep(.02*z*.1+.01,0.,gz))*smoothstep(.0,.25,d)*smoothstep(1.,.3,d);
      col+=vec3(.3,.9,1.)*line*.16;
      /* reflexo do céu no chão */
      col+=vec3(.3,.8,1.)*glowX*exp(-d*14.)*.45*uRise;
    }
    /* ---------- monumento: logo em metal líquido ---------- */
    vec2 r0=uRect.xy, rs=uRect.zw;
    vec2 m=(fc-r0)/rs; /* 0..1 dentro da caixa do logo, y de baixo para cima */
    if(m.x>0.&&m.x<1.&&m.y>-1.&&m.y<1.){
      bool mirror=m.y<0.;
      vec2 mu=vec2(m.x, mirror? -m.y : m.y);
      vec2 tuv=vec2(mu.x, 1.-mu.y);
      vec4 lg=texture2D(uLogo,tuv);
      float a=lg.a;
      if(a>.002){
        vec2 e=1./uTex*2.5;
        float bx=texture2D(uBlur,tuv+vec2(e.x,0.)).a-texture2D(uBlur,tuv-vec2(e.x,0.)).a;
        float by=texture2D(uBlur,tuv-vec2(0.,e.y)).a-texture2D(uBlur,tuv+vec2(0.,e.y)).a;
        vec3 n=normalize(vec3(-bx*3.2,-by*3.2,1.));
        float flow=.18*sin(mu.x*7.+t*.55+n.x*2.)+.12*noise(mu*vec2(6.,3.)+t*.15);
        float r=n.y*.55+mu.y*.9+flow+t*.035;
        vec3 ch=vec3(chrome(r*1.9+.02).r, chrome(r*1.9).g, chrome(r*1.9-.02).b);
        vec2 L=normalize(vec2(uMouse.x-.5, .6));
        float spec=pow(max(dot(n,normalize(vec3(L*0.9,1.))),0.),48.);
        vec3 brand=lg.rgb/max(lg.a,.001);
        vec3 metal=mix(brand,ch,.62)+spec*.9+vec3(.2,.6,1.)*pow(1.-n.z,2.)*.5;
        float rise=smoothstep(0.,1.,uRise);
        float yv=mu.y-(1.-rise)*.55; /* sobe da névoa */
        float base=smoothstep(.02,.24,yv)*step(0.,yv);
        float fade=mirror? a*.16*smoothstep(.7,0.,mu.y)*rise : a*base;
        col=mix(col, mirror? metal*.55+col*.2 : metal, clamp(fade,0.,1.));
      }
    }
    /* névoa na frente */
    float dy=(fc.y-hz)/uRes.y;
    float mist=exp(-pow(dy*24.,2.))*exp(-pow((uv.x-.5)*1.25,2.));
    col=mix(col, vec3(.55,.88,1.), mist*.55);
    col+=vec3(.2,.6,.9)*exp(-pow(dy*9.,2.))*.08;
    /* vinheta + grão */
    col*=1.-.45*pow(length((uv-.5)*vec2(1.,1.3)),2.2);
    col+=(hash(fc+fract(t)*91.)-.5)*.035;
    gl_FragColor=vec4(col,1.);
  }`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  let pr;
  try { pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr); }
  catch (e) { sec.classList.add('ab15-nogl'); return; }
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(pr, n);
  const u = { res: U('uRes'), time: U('uTime'), rise: U('uRise'), rect: U('uRect'), hz: U('uHz'), mouse: U('uMouse'), logo: U('uLogo'), blur: U('uBlur'), tex: U('uTex') };

  function texture(unit, source) {
    const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  let aspect = 889 / 240, ready = false, start = 0, mouse = [.5, .5], visible = true, raf = 0;
  const img = new Image();
  img.decoding = 'async';
  img.src = sec.dataset.logo;
  img.onload = () => {
    const bb = { x: 17, y: 28, w: 889, h: 240 }; /* área útil do logo oficial (940 × 313) */
    const pad = 24, W = bb.w + pad * 2, H = bb.h + pad * 2;
    const c1 = document.createElement('canvas'); c1.width = W; c1.height = H;
    c1.getContext('2d').drawImage(img, bb.x, bb.y, bb.w, bb.h, pad, pad, bb.w, bb.h);
    const c2 = document.createElement('canvas'); c2.width = W; c2.height = H;
    const x2 = c2.getContext('2d'); x2.filter = 'blur(7px)'; x2.drawImage(c1, 0, 0);
    aspect = W / H; layout();
    texture(0, c1); texture(1, c2);
    gl.uniform1i(u.logo, 0); gl.uniform1i(u.blur, 1); gl.uniform2f(u.tex, W, H);
    ready = true; start = performance.now(); sec.classList.add('ab15-ready');
    frame(performance.now());
  };

  function layout() {
    const dpr = Math.min(devicePixelRatio || 1, 1.6);
    const w = sec.clientWidth, h = sec.clientHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    gl.viewport(0, 0, cv.width, cv.height);
    const mobile = w < 760;
    const hz = mobile ? .5 : .44; /* horizonte medido de baixo (fração da altura) */
    const lw = Math.min(w * (mobile ? .9 : .62), 1040) * dpr, lh = lw / aspect;
    const sink = lh * .16; /* a base afunda um pouco no horizonte */
    gl.uniform2f(u.res, cv.width, cv.height);
    gl.uniform1f(u.hz, hz);
    gl.uniform4f(u.rect, (cv.width - lw) / 2, cv.height * hz - sink, lw, lh);
    sec.style.setProperty('--ab15-hz', (1 - hz) * 100 + '%');
  }
  function frame(now) {
    if (!ready) return;
    const t = (now - start) / 1000;
    const rise = reduced ? 1 : Math.min(1, t / 2.4);
    gl.uniform1f(u.time, reduced ? 4 : t + 4);
    gl.uniform1f(u.rise, rise);
    gl.uniform2f(u.mouse, mouse[0], mouse[1]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!reduced && visible) raf = requestAnimationFrame(frame);
  }
  aspect = (889 + 48) / (240 + 48); layout();
  addEventListener('resize', () => { layout(); if (reduced || !visible) frame(performance.now()); });
  sec.addEventListener('pointermove', e => { const r = sec.getBoundingClientRect(); mouse = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; });
  new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was && ready && !reduced) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); } }).observe(sec);

  /* "Entrar" leva para a entrada atual */
  sec.querySelector('.ab15-enter')?.addEventListener('click', e => { e.preventDefault(); document.getElementById('inicio')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); });
})();
