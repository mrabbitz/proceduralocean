import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Cube extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  center: vec4;
  uvs: Float32Array;

  backImg : HTMLImageElement;
  frontImg : HTMLImageElement;
  leftImg : HTMLImageElement;
  rightImg : HTMLImageElement;
  botImg : HTMLImageElement;
  topImg : HTMLImageElement;

  constructor(center: vec3) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);

    this.backImg = <HTMLImageElement> document.getElementById("backImage");
    this.frontImg = <HTMLImageElement> document.getElementById("frontImage");
    this.leftImg = <HTMLImageElement> document.getElementById("leftImage");
    this.rightImg = <HTMLImageElement> document.getElementById("rightImage");
    this.botImg = <HTMLImageElement> document.getElementById("botImage");
    this.topImg = <HTMLImageElement> document.getElementById("topImage");
  }

  create() {

    //                                   bottom left         bottom right        top right           top left
    this.positions = new Float32Array([ -1, -1,  1, 1,       1, -1,  1, 1,       1,  1,  1, 1,      -1,  1,  1, 1, // front
                                         1, -1, -1, 1,      -1, -1, -1, 1,      -1,  1, -1, 1,       1,  1, -1, 1, // back
                                        -1,  1,  1, 1,       1,  1,  1, 1,       1,  1, -1, 1,      -1,  1, -1, 1, // top
                                        -1, -1, -1, 1,       1, -1, -1, 1,       1, -1,  1, 1,      -1, -1,  1, 1, // bottom
                                         1, -1,  1, 1,       1, -1, -1, 1,       1,  1, -1, 1,       1,  1,  1, 1, // right
                                        -1, -1, -1, 1,      -1, -1,  1, 1,      -1,  1,  1, 1,      -1,  1, -1, 1  // left
    ]);

    this.normals = new Float32Array([    0,  0,  1, 0,       0,  0,  1, 0,       0,  0,  1, 0,       0,  0,  1, 0, // front
                                         0,  0, -1, 0,       0,  0, -1, 0,       0,  0, -1, 0,       0,  0, -1, 0, // back
                                         0,  1,  0, 0,       0,  1,  0, 0,       0,  1,  0, 0,       0,  1,  0, 0, // top
                                         0, -1,  0, 0,       0, -1,  0, 0,       0, -1,  0, 0,       0, -1,  0, 0, // bottom
                                         1,  0,  0, 0,       1,  0,  0, 0,       1,  0,  0, 0,       1,  0,  0, 0, // right
                                        -1,  0,  0, 0,      -1,  0,  0, 0,      -1,  0,  0, 0,      -1,  0,  0, 0  // left
    ]);

    this.uvs = new Float32Array([        0, 0,               1, 0,               1, 1,               0, 1,
                                         0, 0,               1, 0,               1, 1,               0, 1,
                                         0, 0,               1, 0,               1, 1,               0, 1,
                                         0, 0,               1, 0,               1, 1,               0, 1,
                                         0, 0,               1, 0,               1, 1,               0, 1,
                                         0, 0,               1, 0,               1, 1,               0, 1
    ]);


    this.indices = new Uint32Array([    0,   1,  2,  0,  2,   3, // front
                                        4,   5,  6,  4,  6,   7, // back
                                        8,   9, 10,  8,  10, 11, // top
                                        12, 13, 14, 12,  14, 15, // bottom
                                        16, 17, 18, 16,  18, 19, // right
                                        20, 21, 22, 20,  22, 23  // left
    ]);

    this.generateIdx();
    this.generatePos();
    this.generateNor();
    this.generateUvCoord();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUvCoord);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);

    console.log(`Created cube`);
  }
};

export default Cube;
