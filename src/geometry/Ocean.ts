import {vec2, vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
//import { floor } from 'gl-matrix/src/gl-matrix/vec2';

class Ocean extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
  barycentricCoords: Float32Array;

  nRings: number;
  nRingPnts: number;
  nTris: number;
  nVerts: number;

  texture: Uint8Array;
  texWidth: number;
  texHeight: number;

  constructor(numRings: number, numRingPoints: number) {
    super(); // Call the constructor of the super class. This is required.

    this.nRings = numRings;
    this.nRingPnts = numRingPoints;
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
          positionsArray.push(j);
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

    let texSize = 512;
    let numBlocks = 16;
    let numComponents = 4;

    let texImage = new Uint8Array(numComponents * texSize * texSize);

    let a = true;

    // for (let i = 0; i < texSize; i++) {
    //     for (let j = 0; j < texSize; j++) {

    //         //let c = this.noise(vec2.fromValues(i, j)) * 255.0;
    //         // (x/width)*noise(x,y)+(1-x/width)*noise(x+width,y).
    //         //let c = ((i/texSize)*this.fbm2D(i / 100.0, j / 100.0)+(1.0-i/texSize)*this.fbm2D((i+texSize) / 100.0, j / 100.0)) * 255.0;
    //         let c = ((j/texSize)*this.fbm2D(i / 100.0, j / 100.0)+(1.0-j/texSize)*this.fbm2D(i / 100.0, (j+texSize) / 100.0)) * 255.0;
    //         //let c = this.fbm2D(i / 100.0, j / 100.0) * 255.0;

    //         texImage[4 * i * texSize + 4 * j] = c;
    //         texImage[4 * i * texSize + 4 * j + 1] = c;
    //         texImage[4 * i * texSize + 4 * j + 2] = c;
    //         texImage[4 * i * texSize + 4 * j + 3] = 255;
    //     }
    // }

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
    this.texWidth = texSize;
    this.texHeight = texSize;

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


  hash(p : vec2) // replace this by something better
  {
    p = vec2.fromValues( vec2.dot(p,vec2.fromValues(127.1,311.7)), vec2.dot(p,vec2.fromValues(269.5,183.3)) );
    let p0 : number = Math.sin(p[0])*43758.5453123;
    let p1 : number = Math.sin(p[1])*43758.5453123;
    p0 = ((p0 - Math.floor(p0)) * 2.0) - 1.0;
    p1 = ((p1 - Math.floor(p1)) * 2.0) - 1.0;
    //return -1.0 + 2.0*fract(sin(p)*43758.5453123);
    return vec2.fromValues(p0, p1);
  }

  noise(p : vec2)
  {
    let K1 : number = 0.366025404; // (sqrt(3)-1)/2;
    let K2 : number = 0.211324865; // (3-sqrt(3))/6;

    let ii : number = (p[0]+p[1])*K1;

    let i : vec2 = vec2.fromValues(Math.floor(p[0] + ii), Math.floor(p[1] + ii));
    //vec2  i = floor( p + (p.x+p.y)*K1 );
    
    let aa: number = (i[0]+i[1])*K2;
    let a : vec2 = vec2.fromValues(p[0] - i[0] + aa, p[1] - i[1] + aa);
    //vec2  a = p - i + (i.x+i.y)*K2;

    let m : number = 1.0;
    if (a[0] < a[1])
    {
      m = 0.0;
    }
    //float m = step(a.y,a.x); 


    let o : vec2 = vec2.fromValues(m, 1.0 - m);
    //vec2  o = vec2(m,1.0-m);

    let b : vec2 = vec2.fromValues(a[0] - o[0] + K2, a[1] - o[1] + K2);
    //vec2  b = a - o + K2;

    let c : vec2 = vec2.fromValues(a[0] - 1.0 + 2.0 * K2, a[1] - 1.0 + 2.0 * K2);
    //vec2  c = a - 1.0 + 2.0*K2;
  
    let hh : vec3 = vec3.fromValues(vec2.dot(a,a), vec2.dot(b,b), vec2.dot(c,c));
    let h : vec3 = vec3.fromValues(Math.max(0.5 - hh[0], 0.0), Math.max(0.5 - hh[1], 0.0), Math.max(0.5 - hh[2], 0.0));
    //vec3  h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );


    let io : vec2 = vec2.create();
    vec2.add(io, i, o);
    let i1 : vec2 = vec2.create();
    vec2.add(i1, i, vec2.fromValues(1.0, 1.0));
    let nn : vec3 = vec3.fromValues( vec2.dot(a,this.hash(i)), vec2.dot(b,this.hash(io)), vec2.dot(c,this.hash(i1)));
    let n : vec3 = vec3.create();
    vec3.multiply(n, h, h);
    vec3.multiply(n, n, h);
    vec3.multiply(n, n, h);
    vec3.multiply(n, n, nn);
    //vec3  n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
  
    let returnVal : number = vec3.dot(n, vec3.fromValues(70.0, 70.0, 70.0));
    //float returnVal = dot( n, vec3(70.0) );

    return 0.5 + 0.5*returnVal;
  }

// -----------------------------------------------

interpNoise2D(x : number, y : number) {
    let intX : number = Math.floor(x);
    let fractX : number = x - intX;
    let intY : number = Math.floor(y);
    let fractY : number = y - intY;

    // modulo grid size, 3rd parameter based on based on frequency passed in from fbm2d
    let v1 : number = this.noise(vec2.fromValues(intX, intY));
    let v2 : number = this.noise(vec2.fromValues(intX + 1.0, intY));
    let v3 : number = this.noise(vec2.fromValues(intX, intY + 1.0));
    let v4 : number = this.noise(vec2.fromValues(intX + 1.0, intY + 1.0));

    let i1 : number = v1 * (1.0 - fractX) + v2 * fractX;
    let i2 : number = v3 * (1.0 - fractX) + v4 * fractX;
    // mix(	genType x, genType y, float a);
    // x * (1 − a) + y * a
    // let i1 : number = mix(v1, v2, fractX);
    // let i2 : number = mix(v3, v4, fractX);
    
    return i1 * (1.0 - fractY) + i2 * fractY;
    // return mix(i1, i2, fractY);
}
fbm2D(x : number, y : number) {
    let total : number = 0.0;
    let persistence : number = 0.6;
    let octaves : number = 8;

    for(let i : number = 1; i <= octaves; i++) {
        let freq : number = Math.pow(2.0, i);
        let amp : number = Math.pow(persistence, i);

        total += this.interpNoise2D(x * freq, y * freq) * amp;
    }
    return total;
}


};

export default Ocean;
