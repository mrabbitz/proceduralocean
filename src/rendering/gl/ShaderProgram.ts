import {vec3, vec4, mat4} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';
import Cube from '../../geometry/Cube';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number;
  attrBcCoord: number;
  attrUvCoord: number;

  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;
  unifViewProjInv: WebGLUniformLocation;
  unifColor: WebGLUniformLocation;
  unifTime: WebGLUniformLocation;
  unifWidthWireframe: WebGLUniformLocation;
  unifTextureMap: WebGLUniformLocation;
  unifSeaState: WebGLUniformLocation;
  unifWindDir: WebGLUniformLocation;
  unifEye: WebGLUniformLocation;
  unifCubeMap: WebGLUniformLocation;
  unifNumRings: WebGLUniformLocation;
  unifWaveSpeed: WebGLUniformLocation;
  unifSkyboxIntensity: WebGLUniformLocation;
  unifShadingMode: WebGLUniformLocation;
  unifFogIntensity: WebGLUniformLocation;
  unifFogSight: WebGLUniformLocation;

  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
    this.attrBcCoord = gl.getAttribLocation(this.prog, "vs_BcCoord");
    this.attrUvCoord = gl.getAttribLocation(this.prog, "vs_UV");
    this.unifModel          = gl.getUniformLocation(this.prog, "u_Model");
    this.unifModelInvTr     = gl.getUniformLocation(this.prog, "u_ModelInvTr");
    this.unifViewProj       = gl.getUniformLocation(this.prog, "u_ViewProj");
    this.unifViewProjInv    = gl.getUniformLocation(this.prog, "u_ViewProjInv");
    this.unifColor          = gl.getUniformLocation(this.prog, "u_Color");
    this.unifTime           = gl.getUniformLocation(this.prog, "u_Time");
    this.unifWidthWireframe = gl.getUniformLocation(this.prog, "u_WidthWireframe");
    this.unifTextureMap     = gl.getUniformLocation(this.prog, "u_TextureMap");
    this.unifSeaState       = gl.getUniformLocation(this.prog, "u_SeaState");
    this.unifWindDir        = gl.getUniformLocation(this.prog, "u_WindDirection");
    this.unifEye            = gl.getUniformLocation(this.prog, "u_Eye");
    this.unifCubeMap        = gl.getUniformLocation(this.prog, "u_CubeMap");
    this.unifNumRings       = gl.getUniformLocation(this.prog, "u_NumRings");
    this.unifWaveSpeed      = gl.getUniformLocation(this.prog, "u_WaveSpeed");
    this.unifSkyboxIntensity= gl.getUniformLocation(this.prog, "u_SkyboxIntensity");
    this.unifShadingMode    = gl.getUniformLocation(this.prog, "u_ShadingMode");
    this.unifFogIntensity   = gl.getUniformLocation(this.prog, "u_FogIntensity");
    this.unifFogSight       = gl.getUniformLocation(this.prog, "u_FogSight");

  }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

  setFogSight(n: number) {
    this.use();
    if (this.unifFogSight !== -1) {
      gl.uniform1f(this.unifFogSight, n);
    }
  }

  setFogIntensity(n: number) {
    this.use();
    if (this.unifFogIntensity !== -1) {
      gl.uniform1f(this.unifFogIntensity, n);
    }
  }

  setShadingMode(n: number) {
    this.use();
    if (this.unifShadingMode !== -1) {
      gl.uniform1i(this.unifShadingMode, n);
    }
  }

  setSkyboxIntensity(n: number) {
    this.use();
    if (this.unifSkyboxIntensity !== -1) {
      gl.uniform1f(this.unifSkyboxIntensity, n);
    }
  }

  setWaveSpeed(n: number) {
    this.use();
    if (this.unifWaveSpeed !== -1) {
      gl.uniform1f(this.unifWaveSpeed, n);
    }
  }

  setNumRings(n: number) {
    this.use();
    if (this.unifNumRings !== -1) {
      gl.uniform1f(this.unifNumRings, n);
    }
  }

  setCubeMap(cube: Cube) {
    this.use();
    if (this.unifCubeMap !== -1) {

      let cubeMap = gl.createTexture();

      gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cube.backImg);
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cube.frontImg);
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cube.leftImg);
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cube.rightImg);
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cube.botImg);
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cube.topImg);
  
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

      // gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      // gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

      gl.activeTexture(gl.TEXTURE0);
      gl.uniform1i(this.unifCubeMap, 0);
    }
  }

  setEye(eye: vec3) {
    this.use();
    if(this.unifEye !== -1) {
      gl.uniform3f(this.unifEye, eye[0], eye[1], eye[2]);
    }
  }

  setTime(t: number) {
    this.use();
    if (this.unifTime !== -1) {
      gl.uniform1f(this.unifTime, t);
    }
  }

  setSeaState(n: number) {
    this.use();
    if (this.unifSeaState !== -1) {
      gl.uniform1i(this.unifSeaState, n);
    }
  }

  setWindDirection(d: number) {
    this.use();
    if (this.unifWindDir !== -1) {
      gl.uniform1f(this.unifWindDir, d);
    }
  }

  setWidthWireframe(w: number) {
    this.use();
    if (this.unifWidthWireframe !== -1) {
      gl.uniform1f(this.unifWidthWireframe, w);
    }
  }

  setTextureMap(image: Uint8Array, width: number, height: number) {
    this.use();
    if (this.unifTextureMap !== -1) {

      let texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
  
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      gl.uniform1i(this.unifTextureMap, 0);
    }
  }

  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);
    }

    if (this.unifModelInvTr !== -1) {
      let modelinvtr: mat4 = mat4.create();
      mat4.transpose(modelinvtr, model);
      mat4.invert(modelinvtr, modelinvtr);
      gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
    }
  }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);
    }
  }
  setViewProjInvMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProjInv !== -1) {
      gl.uniformMatrix4fv(this.unifViewProjInv, false, vp);
    }
  }

  setGeometryColor(color: vec4) {
    this.use();
    if (this.unifColor !== -1) {
      gl.uniform4fv(this.unifColor, color);
    }
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.attrCol != -1 && d.bindCol()) {
      gl.enableVertexAttribArray(this.attrCol);
      gl.vertexAttribPointer(this.attrCol, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.attrBcCoord != -1 && d.bindBcCoord()) {
      gl.enableVertexAttribArray(this.attrBcCoord);
      gl.vertexAttribPointer(this.attrBcCoord, 3, gl.FLOAT, false, 0, 0);
    }

    if (this.attrUvCoord != -1 && d.bindUvCoord()) {
      gl.enableVertexAttribArray(this.attrUvCoord);
      gl.vertexAttribPointer(this.attrUvCoord, 2, gl.FLOAT, false, 0, 0);
    }

    d.bindIdx();
    gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
    if (this.attrCol != -1) gl.disableVertexAttribArray(this.attrCol);
    if (this.attrBcCoord != -1) gl.disableVertexAttribArray(this.attrBcCoord);
    if (this.attrUvCoord != -1) gl.disableVertexAttribArray(this.attrUvCoord);
  }
};

export default ShaderProgram;
