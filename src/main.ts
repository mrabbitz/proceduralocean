import {vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Ocean from './geometry/Ocean';
import Cube from './geometry/Cube';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  'Load Scene': loadScene, // A function pointer, essentially
  Wireframe: false,
  'Sea State': 1,
  'Wind Direction': -30.0,
};

let time: number = 0.0;

let icosphere: Icosphere;
let square: Square;
let prevTesselations: number = 5;

let ocean: Ocean;

let cube: Cube;

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();

  ocean = new Ocean();
  ocean.create();

  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();

}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.add(controls, 'Load Scene');
  gui.add(controls, 'Wireframe');
  gui.add(controls, 'Sea State', 1, 6).step(1);
  gui.add(controls, 'Wind Direction', -180, 180);

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const oceanShaders = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/ocean-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/ocean-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    lambert.setTime(time);
    flat.setTime(time);
    oceanShaders.setTime(time++);
    if (controls.Wireframe)
    {
      oceanShaders.setWidthWireframe(0.006);
    }
    else
    {
      oceanShaders.setWidthWireframe(1.0);
    }
    oceanShaders.setSeaState(controls["Sea State"]);
    oceanShaders.setWindDirection(controls["Wind Direction"]);

    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    if(controls.tesselations != prevTesselations)
    {
      prevTesselations = controls.tesselations;
      icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, prevTesselations);
      icosphere.create();
    }
    // renderer.render(camera, lambert, [
    //   icosphere,
    //   // square,
    // ]);
    // renderer.render(camera, flat, [
    //   ocean
    // ]);
    //oceanShaders.setTextureMap(ocean.texture, ocean.texWidth, ocean.texHeight);
    gl.depthFunc(gl.LESS);  // use the default depth test
    oceanShaders.setCubeMap(cube);
    renderer.render(camera, oceanShaders, [
      ocean
    ]);

    // let our quad pass the depth test at 1.0
    gl.depthFunc(gl.LEQUAL);
    flat.setCubeMap(cube);
    renderer.render(camera, flat, [
      cube
    ]);

    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
