import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Ocean extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;

  constructor() {
    super(); // Call the constructor of the super class. This is required.
  }

  create() {

  this.indices = new Uint32Array([0, 1, 2,
                                  0, 2, 3]);
  this.positions = new Float32Array([-1, -1, 0, 1,
                                     1, -1, 0, 1,
                                     1, 1, 0, 1,
                                     -1, 1, 0, 1]);

  this.colors = new Float32Array([1, 0, 0, 1,
                                  1, 0, 0, 1,
                                  1, 0, 0, 1,
                                  1, 0, 0, 1]);

    this.generateIdx();
    this.generatePos();
    this.generateCol();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

    console.log(`Created ocean`);
  }
};

export default Ocean;
