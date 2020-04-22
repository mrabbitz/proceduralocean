import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Ocean extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
  barycentricCoords: Float32Array;

  numVertices: number;
  nRings: number;
  nRingPnts: number;
  nTris: number;
  nVerts: number;

  texture: Uint8Array;
  texWidth: number;
  texHeight: number;

  constructor() {
    super(); // Call the constructor of the super class. This is required.

    this.numVertices = 36;
    this.nRings = 30;
    this.nRingPnts = 8;
    this.nTris = (this.nRings - 1) * this.nRingPnts * 2;
    this.nVerts = this.nTris * 3;
  }

  create() {

    let positionsArray = [];
    let BC_Array = [];

    // https://stackoverflow.com/questions/24839857/wireframe-shader-issue-with-barycentric-coordinates-when-using-shared-vertices
    let barycentricTiles = [[1,0,0],[0,1,0],[0,0,1]];

    for (let j = 0; j < this.nRings; j++) {
      for (let i = 0; i < this.nRingPnts; i++) {
          let A = (i * Math.PI * 2.0) / this.nRingPnts; // angle in radians
          let dX = Math.cos(A), dZ = Math.sin(A);
//           console.log(dX + " " + j+1 + " " + dZ);
          //this.positions.push(vec3(dX, j+1, dZ));  //  m_pVB[j*384+i] = SiPoint3(R0*dX, R0*dY,  j);
          positionsArray.push(dX);
          positionsArray.push(j+1);
          positionsArray.push(dZ);
          positionsArray.push(1.0);

          BC_Array.push(barycentricTiles[(i+j)%3][0]);
          BC_Array.push(barycentricTiles[(i+j)%3][1]);
          BC_Array.push(barycentricTiles[(i+j)%3][2]);
      }
    }

    let indexArray = [];

    for (let i = 0; i < this.nRingPnts; i++)
    { 
        for (let j = 0; j < this.nRings - 1; j++)
        {
            let i0 = j * this.nRingPnts + (i % this.nRingPnts);
            let i1 = (j + 1) * this.nRingPnts + (i % this.nRingPnts);
            let i2 = (j + 1) * this.nRingPnts + ((i + 1) % this.nRingPnts);
            let i3 = (j) * this.nRingPnts + ((i + 1) % this.nRingPnts);

 //           console.log(i0 + " " + i1 + " " + i2);
 //           console.log(i0 + " " + i2 + " " + i3);

            indexArray.push(i0);
            indexArray.push(i1);
            indexArray.push(i2);
            // BC_Array.push(vec3(1.0, 0.0, 0.0));
            // BC_Array.push(vec3(0.0, 1.0, 0.0));
            // BC_Array.push(vec3(0.0, 0.0, 1.0));
            // BC_Array.push(1.0);
            // BC_Array.push(0.0);
            // BC_Array.push(0.0);
            // BC_Array.push(0.0);
            // BC_Array.push(1.0);
            // BC_Array.push(0.0);
            // BC_Array.push(0.0);
            // BC_Array.push(0.0);
            // BC_Array.push(1.0);
            indexArray.push(i0);
            indexArray.push(i2);
            indexArray.push(i3);
            // BC_Array.push(vec3(1.0, 0.0, 0.0));
            // BC_Array.push(vec3(0.0, 1.0, 0.0));
            // BC_Array.push(vec3(0.0, 0.0, 1.0));
            // BC_Array.push(1.0);
            // BC_Array.push(0.0);
            // BC_Array.push(0.0);
            // BC_Array.push(0.0);
            // BC_Array.push(1.0);
            // BC_Array.push(0.0);
            // BC_Array.push(0.0);
            // BC_Array.push(0.0);
            // BC_Array.push(1.0);
       }
    }

    let texSize = 64;
    let numBlocks = 16;
    let numComponents = 4;

    let texImage = new Uint8Array(numComponents * texSize * texSize);

    for (let i = 0; i < texSize; i++) {
        for (let j = 0; j < texSize; j++) {
            let patchx = Math.floor(i / (texSize / numBlocks));
            let patchy = Math.floor(j / (texSize / numBlocks));
            //let c = (patchx % 2 !== patchy ? 255 : 0);
            let c = 128;
            if (patchx % 2 ^ patchy % 2) {
                c = 255;
            }

            texImage[4 * i * texSize + 4 * j] = c;
            texImage[4 * i * texSize + 4 * j + 1] = c;
            texImage[4 * i * texSize + 4 * j + 2] = c;
            texImage[4 * i * texSize + 4 * j + 3] = 255;
        }
    }

  // this.indices = new Uint32Array([0, 1, 2,
  //                                 0, 2, 3]);
  // this.positions = new Float32Array([-1, -1, 0, 1,
  //                                    1, -1, 0, 1,
  //                                    1, 1, 0, 1,
  //                                    -1, 1, 0, 1]);

  // this.colors = new Float32Array([1, 0, 0, 1,
  //                                 1, 0, 0, 1,
  //                                 1, 0, 0, 1,
  //                                 1, 0, 0, 1]);

    this.indices = new Uint32Array(indexArray);
    this.positions = new Float32Array(positionsArray);
    this.barycentricCoords = new Float32Array(BC_Array);

    this.texture = texImage;
    this.texWidth = 64;
    this.texHeight = 64;

    this.generateIdx();
    this.generatePos();
    //this.generateCol();
    this.generateBcCoord();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    // gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    // gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf_bcCoord);
    gl.bufferData(gl.ARRAY_BUFFER, this.barycentricCoords, gl.STATIC_DRAW);

    console.log(`Created ocean`);
  }
};

export default Ocean;
