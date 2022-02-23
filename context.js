const NUM_METABALLS = 6;

const loadShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const resize = (canvas, gl) => {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
}

const getUniformLocations = (gl, program) => {
  return {
    resolution: gl.getUniformLocation(program, "u_resolution"),
    time: gl.getUniformLocation(program, "u_time"),
    mouse: gl.getUniformLocation(program, "u_mouse"),
    metaballs: gl.getUniformLocation(program, "u_metaballs"),
    blend: gl.getUniformLocation(program, "u_blend"),
  }
}

const setPositionBuffer = (gl, program, pos) => {
  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);

  const vertexPosAttrLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(vertexPosAttrLocation);
  gl.vertexAttribPointer(vertexPosAttrLocation, 2, gl.FLOAT, false, 0, 0);
  return pos;
};

const setMouse = (canvas) => {
  const mouse = {x: 0, y: 0};
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = rect.height - (e.clientY - rect.top) - 1;
  });
  return mouse;
};

const setMetaballs = () => {
  const metaballs = [];
  for (let i = 0; i < NUM_METABALLS; i++) {
    metaballs.push({
      x: Math.random() * 3 - 1.5,
      y: Math.random() * 3 - 1.5,
      tx: 0,
      ty: 0,
      r: 10.,
      tr: 10,
    });
  }
  // console.log(metaballs)
  return metaballs;
};

const getProgram = (gl, vertexShader, fragmentShader) => {
  const program = gl.createProgram();
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(`Unable to initialize the shader program: ${gl.getProgramInfoLog(program)}`);
    return null;
  }
  return program;
};

const main = async () => {
  let t = 1;

  const canvas = document.getElementById('canvas');
  const gl = canvas.getContext('webgl');
  const vertexSource = await fetch('./vertex.glsl').then((res) => res.text());
  const fragmentSource = await fetch('./fragment.glsl').then((res) => res.text());
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = getProgram(gl, vertexShader, fragmentShader);
  if (program === null) return;

  resize(canvas, gl);

  const positionBuffer = setPositionBuffer(gl, program, [
    -1.0, 1.0, 
    1.0, 1.0,
    -1.0, -1.0,
    1.0, -1.0,
  ]);
  const mouse = setMouse(canvas);
  const metaballs = setMetaballs();
  const locations = getUniformLocations(gl, program);

  const update = () => {
    if (t > 0) t-=0.005;
    else t = 0;

    for (let i = 0; i < NUM_METABALLS; i++) {
      const mb = metaballs[i];
      mb.x += (1-t) * (mb.tx - mb.x);
      mb.y += (1-t) * (mb.ty - mb.y);
      mb.r += (1-t) * (mb.tr - mb.r);
    }
  };

  const renderGl = (time) => {
    const mbData = new Float32Array(3 * metaballs.length);
    const shortSide = Math.min(canvas.width, canvas.height);
    metaballs.forEach((mb, i) => {
      const index = 3 * i;
      mbData[index + 0] = mb.x * shortSide + canvas.width*0.5;
      mbData[index + 1] = mb.y * shortSide + canvas.height*0.5;
      mbData[index + 2] = mb.r * shortSide * 0.07;
    });

    gl.uniform2f(locations.resolution, canvas.width, canvas.height);
    gl.uniform1f(locations.time, time * 0.001);
    gl.uniform2f(locations.mouse, mouse.x, mouse.y);
    gl.uniform3fv(locations.metaballs, mbData);
    gl.uniform1f(locations.blend, Math.sin(t*t*Math.PI));

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, positionBuffer.length/2);
  };

  const render = (time) => {
    update();
    renderGl(time);
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);

  const roll = (metaballs) => {
    const cta = document.querySelector('.cta');
    cta.style.opacity = 0;
    const r = Math.floor(Math.random() * 6);
    t = 1.0;

    switch (r) {
      case 0:
        metaballs.forEach((mb) => {
          mb.tx = 0;
          mb.ty = 0;
          mb.tr = 0.5;
        });
        break;
      case 1:
        metaballs.forEach((mb, i) => {
          mb.tr = 0.7;
          if (i < 3) {
            mb.tx = -.25;
            mb.ty = -.25;
          } else {
            mb.tx = .25;
            mb.ty = .25;
          }
        });
        break;
      case 2:
        metaballs.forEach((mb, i) => {
          mb.tr = 0.68;
          if (i < 2) {
            mb.tx = -.25;
            mb.ty = -.25;
          } else if (i < 4) {
            mb.tx = .25;
            mb.ty = .25;
          } else {
            mb.tx = 0;
            mb.ty = 0;
          }
        });
        break;
      case 3:
        metaballs[0].tx = -.25;
        metaballs[0].ty = -.25;
        metaballs[0].tr = 1;
        metaballs[1].tx = -.25;
        metaballs[1].ty = .25;
        metaballs[1].tr = 1;
        metaballs[2].tx = .25;
        metaballs[2].ty = -.25;
        metaballs[2].tr = 1;
        metaballs[3].tx = .25;
        metaballs[3].ty = .25;
        metaballs[3].tr = 1;
        metaballs[4].tr = 0;
        metaballs[5].tr = 0;
        break;
      case 4:
        metaballs[0].tx = -.25;
        metaballs[0].ty = -.25;
        metaballs[0].tr = 1;
        metaballs[1].tx = -.25;
        metaballs[1].ty = .25;
        metaballs[1].tr = 1;
        metaballs[2].tx = .25;
        metaballs[2].ty = -.25;
        metaballs[2].tr = 1;
        metaballs[3].tx = .25;
        metaballs[3].ty = .25;
        metaballs[3].tr = 1;
        metaballs[4].tx = 0;
        metaballs[4].ty = 0;
        metaballs[4].tr = 1;
        metaballs[5].tr = 0;
        break;
      case 5:
        metaballs.forEach((mb, i) => {
          mb.tx = (0.25 + 0.5 * (i%2)) - 0.5;
          mb.ty = (0.25 + 0.5 * (Math.floor(i/2) * 0.5)) - 0.5;
          mb.tr = 1.;
        });
        break;
      default:
        break;
    }
  };

  addEventListener('resize', (e) => {
    resize(canvas, gl);
  });
  addEventListener('click', (e) => {
    roll(metaballs);
  });
  addEventListener('keypress', (e) => {
    roll(metaballs);
  });
};

window.onload = main;