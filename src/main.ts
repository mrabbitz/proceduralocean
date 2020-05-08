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
  'Skybox Intensity': 1.0,
  'Sea State': 1,
  'Wave Speed': 1.0,
  'Wind Direction': 30.0,
  Rings: 300,
  RingPoints: 600,
  Wireframe: false,
  'Shading Mode' : 1,
  'Fog Intensity' : 0.05,
  'Sight Distance' : 5.0
};

let time: number = 0.0;

let prevSky: number = 1.0;
let prevState: number = 1;
let prevWave: number = 1.0;
let prevDir: number = 30.0;
let prevRings: number = 300;
let prevRingPoints: number = 600;
let prevWire: boolean = false;
let prevMode: number = 1;
let prevFog: number = 0.05;
let prevSight: number = 5.0;

let ocean: Ocean;

let cube: Cube;

function loadScene() {

  ocean = new Ocean(controls.Rings, controls.RingPoints);
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
  var f0 = gui.addFolder('Lighting');
  var f1 = gui.addFolder('Ocean');
  var f2 = gui.addFolder('Fog');
  var f3 = gui.addFolder('Mesh');
  f0.add(controls, 'Skybox Intensity', 0.01, 1.0);
  f1.add(controls, 'Sea State', 1, 6).step(1);
  f1.add(controls, 'Wave Speed', 0.01, 4.0);
  f1.add(controls, 'Wind Direction', -180, 180);
  f3.add(controls, 'Rings', 0, 1000).step(1);
  f3.add(controls, 'RingPoints', 0, 800).step(1);
  f3.add(controls, 'Wireframe');
  f1.add(controls, 'Shading Mode', 1, 3).step(1);
  f2.add(controls, 'Fog Intensity', 0.05, 1.0);
  f2.add(controls, 'Sight Distance', 3, 10).step(1);

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

  const camera = new Camera(vec3.fromValues(5, 2, -1), vec3.fromValues(0, 2, 0));

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

  oceanShaders.setSkyboxIntensity(controls["Skybox Intensity"]);
  oceanShaders.setSeaState(controls["Sea State"]);
  oceanShaders.setWaveSpeed(controls["Wave Speed"]);
  oceanShaders.setWindDirection(controls["Wind Direction"]);
  oceanShaders.setNumRings(controls.Rings);
  oceanShaders.setWidthWireframe(1.0);
  oceanShaders.setShadingMode(controls["Shading Mode"]);
  oceanShaders.setFogIntensity(controls["Fog Intensity"]);
  oceanShaders.setFogSight(controls["Sight Distance"]);
  oceanShaders.setCubeMap(cube);

  flat.setSkyboxIntensity(controls["Skybox Intensity"]);
  flat.setFogIntensity(controls["Fog Intensity"]);
  flat.setCubeMap(cube);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    oceanShaders.setTime(time++);

    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    if (controls["Skybox Intensity"] != prevSky) {
      prevSky = controls["Skybox Intensity"];
      oceanShaders.setSkyboxIntensity(prevSky);
      flat.setSkyboxIntensity(prevSky);
    }
    if (controls["Sea State"] != prevState) {
      prevState = controls["Sea State"];
      oceanShaders.setSeaState(prevState);
    }
    if (controls["Wave Speed"] != prevWave) {
      prevWave = controls["Wave Speed"];
      oceanShaders.setWaveSpeed(prevWave);
    }
    if (controls["Wind Direction"] != prevDir) {
      prevDir = controls["Wind Direction"];
      oceanShaders.setWindDirection(prevDir);
    }
    if((controls.Rings != prevRings) || (controls.RingPoints != prevRingPoints)) {
      prevRings = controls.Rings;
      prevRingPoints = controls.RingPoints;
      ocean = new Ocean(controls.Rings, controls.RingPoints);
      ocean.create();
      oceanShaders.setNumRings(prevRings);
    }
    if (controls.Wireframe != prevWire) {
      prevWire = controls.Wireframe;
      if (prevWire) {
        oceanShaders.setWidthWireframe(0.006);
      }
      else {
        oceanShaders.setWidthWireframe(1.0);
      }
    }
    if(controls["Shading Mode"] != prevMode) {
      prevMode = controls["Shading Mode"];
      oceanShaders.setShadingMode(prevMode);
    }
    if(controls["Fog Intensity"] != prevFog) {
      prevFog = controls["Fog Intensity"];
      oceanShaders.setFogIntensity(prevFog);
      flat.setFogIntensity(prevFog);
    }
    if(controls["Sight Distance"] != prevSight) {
      prevSight = controls["Sight Distance"];
      oceanShaders.setFogSight(prevSight);
    }

    gl.depthFunc(gl.LESS);  // use the default depth test
    renderer.render(camera, oceanShaders, [
      ocean
    ]);

    // let our quad pass the depth test at 1.0
    gl.depthFunc(gl.LEQUAL);
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
