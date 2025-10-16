/*!
 * Luma3D v0.3.0 - 3D Engine
 * Three.js-like 3D rendering for LumaJS
 * @license MIT
 */
(function(global) {
  'use strict';

  // ==================== MATH UTILITIES ====================
  
  const Matrix4 = {
    identity() {
      return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
    },
    
    perspective(fov, aspect, near, far) {
      const f = 1.0 / Math.tan(fov / 2);
      const nf = 1 / (near - far);
      
      return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, 2 * far * near * nf, 0
      ];
    },
    
    lookAt(eye, center, up) {
      const z = this.normalize([eye[0] - center[0], eye[1] - center[1], eye[2] - center[2]]);
      const x = this.normalize(this.cross(up, z));
      const y = this.cross(z, x);
      
      return [
        x[0], y[0], z[0], 0,
        x[1], y[1], z[1], 0,
        x[2], y[2], z[2], 0,
        -this.dot(x, eye), -this.dot(y, eye), -this.dot(z, eye), 1
      ];
    },
    
    multiply(a, b) {
      const result = [];
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          let sum = 0;
          for (let k = 0; k < 4; k++) {
            sum += a[i * 4 + k] * b[k * 4 + j];
          }
          result[i * 4 + j] = sum;
        }
      }
      return result;
    },
    
    translate(x, y, z) {
      return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
      ];
    },
    
    rotate(angle, axis) {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const t = 1 - c;
      const [x, y, z] = this.normalize(axis);
      
      return [
        t*x*x + c, t*x*y + z*s, t*x*z - y*s, 0,
        t*x*y - z*s, t*y*y + c, t*y*z + x*s, 0,
        t*x*z + y*s, t*y*z - x*s, t*z*z + c, 0,
        0, 0, 0, 1
      ];
    },
    
    scale(x, y, z) {
      return [
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
      ];
    },
    
    normalize(v) {
      const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
      return len > 0 ? [v[0]/len, v[1]/len, v[2]/len] : v;
    },
    
    cross(a, b) {
      return [
        a[1]*b[2] - a[2]*b[1],
        a[2]*b[0] - a[0]*b[2],
        a[0]*b[1] - a[1]*b[0]
      ];
    },
    
    dot(a, b) {
      return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    }
  };

  // ==================== SHADERS ====================
  
  const Shaders = {
    basic: {
      vertex: `
        attribute vec3 position;
        uniform mat4 modelMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;
        
        void main() {
          gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision mediump float;
        uniform vec3 color;
        
        void main() {
          gl_FragColor = vec4(color, 1.0);
        }
      `
    },
    
    phong: {
      vertex: `
        attribute vec3 position;
        attribute vec3 normal;
        
        uniform mat4 modelMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;
        uniform mat4 normalMatrix;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = (normalMatrix * vec4(normal, 0.0)).xyz;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragment: `
        precision mediump float;
        
        uniform vec3 color;
        uniform vec3 lightPosition;
        uniform vec3 lightColor;
        uniform vec3 ambientLight;
        uniform vec3 cameraPosition;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 lightDir = normalize(lightPosition - vPosition);
          vec3 viewDir = normalize(cameraPosition - vPosition);
          vec3 reflectDir = reflect(-lightDir, normal);
          
          // Ambient
          vec3 ambient = ambientLight * color;
          
          // Diffuse
          float diff = max(dot(normal, lightDir), 0.0);
          vec3 diffuse = diff * lightColor * color;
          
          // Specular
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
          vec3 specular = spec * lightColor * 0.5;
          
          vec3 result = ambient + diffuse + specular;
          gl_FragColor = vec4(result, 1.0);
        }
      `
    }
  };

  // ==================== GEOMETRIES ====================
  
  class BoxGeometry {
    constructor(width = 1, height = 1, depth = 1) {
      const w = width / 2, h = height / 2, d = depth / 2;
      
      this.vertices = new Float32Array([
        // Front
        -w, -h,  d,  w, -h,  d,  w,  h,  d, -w,  h,  d,
        // Back
        -w, -h, -d, -w,  h, -d,  w,  h, -d,  w, -h, -d,
        // Top
        -w,  h, -d, -w,  h,  d,  w,  h,  d,  w,  h, -d,
        // Bottom
        -w, -h, -d,  w, -h, -d,  w, -h,  d, -w, -h,  d,
        // Right
         w, -h, -d,  w,  h, -d,  w,  h,  d,  w, -h,  d,
        // Left
        -w, -h, -d, -w, -h,  d, -w,  h,  d, -w,  h, -d
      ]);
      
      this.normals = new Float32Array([
        0,0,1, 0,0,1, 0,0,1, 0,0,1,
        0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
        0,1,0, 0,1,0, 0,1,0, 0,1,0,
        0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
        1,0,0, 1,0,0, 1,0,0, 1,0,0,
        -1,0,0, -1,0,0, -1,0,0, -1,0,0
      ]);
      
      this.indices = new Uint16Array([
        0,1,2, 0,2,3,
        4,5,6, 4,6,7,
        8,9,10, 8,10,11,
        12,13,14, 12,14,15,
        16,17,18, 16,18,19,
        20,21,22, 20,22,23
      ]);
    }
  }

  class SphereGeometry {
    constructor(radius = 1, widthSegments = 32, heightSegments = 16) {
      const vertices = [];
      const normals = [];
      const indices = [];
      
      for (let y = 0; y <= heightSegments; y++) {
        const v = y / heightSegments;
        const phi = v * Math.PI;
        
        for (let x = 0; x <= widthSegments; x++) {
          const u = x / widthSegments;
          const theta = u * Math.PI * 2;
          
          const px = -radius * Math.cos(theta) * Math.sin(phi);
          const py = radius * Math.cos(phi);
          const pz = radius * Math.sin(theta) * Math.sin(phi);
          
          vertices.push(px, py, pz);
          
          const len = Math.sqrt(px*px + py*py + pz*pz);
          normals.push(px/len, py/len, pz/len);
        }
      }
      
      for (let y = 0; y < heightSegments; y++) {
        for (let x = 0; x < widthSegments; x++) {
          const a = y * (widthSegments + 1) + x;
          const b = a + widthSegments + 1;
          
          indices.push(a, b, a + 1);
          indices.push(b, b + 1, a + 1);
        }
      }
      
      this.vertices = new Float32Array(vertices);
      this.normals = new Float32Array(normals);
      this.indices = new Uint16Array(indices);
    }
  }

  class PlaneGeometry {
    constructor(width = 1, height = 1) {
      const w = width / 2, h = height / 2;
      
      this.vertices = new Float32Array([
        -w, -h, 0,
         w, -h, 0,
         w,  h, 0,
        -w,  h, 0
      ]);
      
      this.normals = new Float32Array([
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
      ]);
      
      this.indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    }
  }

  // ==================== MATERIALS ====================
  
  class Material {
    constructor(options = {}) {
      this.color = options.color || [1, 1, 1];
      this.wireframe = options.wireframe || false;
      this.shaderType = options.shaderType || 'phong';
    }
  }

  // ==================== MESH ====================
  
  class Mesh {
    constructor(geometry, material) {
      this.geometry = geometry;
      this.material = material;
      this.position = [0, 0, 0];
      this.rotation = [0, 0, 0];
      this.scale = [1, 1, 1];
      this.visible = true;
    }
    
    getModelMatrix() {
      let matrix = Matrix4.identity();
      matrix = Matrix4.multiply(matrix, Matrix4.translate(...this.position));
      matrix = Matrix4.multiply(matrix, Matrix4.rotate(this.rotation[0], [1, 0, 0]));
      matrix = Matrix4.multiply(matrix, Matrix4.rotate(this.rotation[1], [0, 1, 0]));
      matrix = Matrix4.multiply(matrix, Matrix4.rotate(this.rotation[2], [0, 0, 1]));
      matrix = Matrix4.multiply(matrix, Matrix4.scale(...this.scale));
      return matrix;
    }
  }

  // ==================== LIGHTS ====================
  
  class Light {
    constructor(color = [1, 1, 1], intensity = 1) {
      this.color = color.map(c => c * intensity);
    }
  }

  class AmbientLight extends Light {
    constructor(color, intensity) {
      super(color, intensity);
    }
  }

  class DirectionalLight extends Light {
    constructor(color, intensity) {
      super(color, intensity);
      this.position = [0, 10, 10];
    }
  }

  class PointLight extends Light {
    constructor(color, intensity, distance = 0) {
      super(color, intensity);
      this.position = [0, 0, 0];
      this.distance = distance;
    }
  }

  // ==================== CAMERA ====================
  
  class PerspectiveCamera {
    constructor(fov = 75, aspect = 1, near = 0.1, far = 1000) {
      this.fov = fov * Math.PI / 180;
      this.aspect = aspect;
      this.near = near;
      this.far = far;
      this.position = [0, 0, 5];
      this.target = [0, 0, 0];
      this.up = [0, 1, 0];
    }
    
    getProjectionMatrix() {
      return Matrix4.perspective(this.fov, this.aspect, this.near, this.far);
    }
    
    getViewMatrix() {
      return Matrix4.lookAt(this.position, this.target, this.up);
    }
    
    lookAt(x, y, z) {
      this.target = [x, y, z];
    }
  }

  // ==================== SCENE ====================
  
  class Scene {
    constructor() {
      this.children = [];
      this.lights = {
        ambient: new AmbientLight([0.2, 0.2, 0.2], 1),
        directional: new DirectionalLight([1, 1, 1], 0.8)
      };
    }
    
    add(object) {
      this.children.push(object);
    }
    
    remove(object) {
      const index = this.children.indexOf(object);
      if (index > -1) {
        this.children.splice(index, 1);
      }
    }
  }

  // ==================== RENDERER ====================
  
  class WebGLRenderer {
    constructor(options = {}) {
      this.canvas = options.canvas || document.createElement('canvas');
      this.width = options.width || 800;
      this.height = options.height || 600;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      
      this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
      
      if (!this.gl) {
        throw new Error('WebGL not supported');
      }
      
      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.enable(this.gl.CULL_FACE);
      
      this.programs = {};
      this.buffers = new WeakMap();
      
      this._initShaders();
    }
    
    _initShaders() {
      for (const [name, shader] of Object.entries(Shaders)) {
        this.programs[name] = this._createProgram(shader.vertex, shader.fragment);
      }
    }
    
    _createShader(type, source) {
      const shader = this.gl.createShader(type);
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);
      
      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
        this.gl.deleteShader(shader);
        return null;
      }
      
      return shader;
    }
    
    _createProgram(vertexSource, fragmentSource) {
      const vertexShader = this._createShader(this.gl.VERTEX_SHADER, vertexSource);
      const fragmentShader = this._createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
      
      const program = this.gl.createProgram();
      this.gl.attachShader(program, vertexShader);
      this.gl.attachShader(program, fragmentShader);
      this.gl.linkProgram(program);
      
      if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        console.error('Program link error:', this.gl.getProgramInfoLog(program));
        return null;
      }
      
      return program;
    }
    
    _setupBuffers(geometry) {
      if (this.buffers.has(geometry)) {
        return this.buffers.get(geometry);
      }
      
      const buffers = {
        position: this.gl.createBuffer(),
        normal: this.gl.createBuffer(),
        index: this.gl.createBuffer()
      };
      
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.position);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, geometry.vertices, this.gl.STATIC_DRAW);
      
      if (geometry.normals) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.normal);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, geometry.normals, this.gl.STATIC_DRAW);
      }
      
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.index);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, geometry.indices, this.gl.STATIC_DRAW);
      
      this.buffers.set(geometry, buffers);
      return buffers;
    }
    
    setSize(width, height) {
      this.width = width;
      this.height = height;
      this.canvas.width = width;
      this.canvas.height = height;
      this.gl.viewport(0, 0, width, height);
    }
    
    render(scene, camera) {
      this.gl.clearColor(0.1, 0.1, 0.1, 1);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      
      const projectionMatrix = camera.getProjectionMatrix();
      const viewMatrix = camera.getViewMatrix();
      
      for (const mesh of scene.children) {
        if (!mesh.visible) continue;
        
        this._renderMesh(mesh, projectionMatrix, viewMatrix, camera, scene.lights);
      }
    }
    
    _renderMesh(mesh, projectionMatrix, viewMatrix, camera, lights) {
      const program = this.programs[mesh.material.shaderType];
      this.gl.useProgram(program);
      
      const buffers = this._setupBuffers(mesh.geometry);
      const modelMatrix = mesh.getModelMatrix();
      
      // Position attribute
      const positionLoc = this.gl.getAttribLocation(program, 'position');
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.position);
      this.gl.vertexAttribPointer(positionLoc, 3, this.gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(positionLoc);
      
      // Normal attribute
      if (mesh.geometry.normals) {
        const normalLoc = this.gl.getAttribLocation(program, 'normal');
        if (normalLoc >= 0) {
          this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.normal);
          this.gl.vertexAttribPointer(normalLoc, 3, this.gl.FLOAT, false, 0, 0);
          this.gl.enableVertexAttribArray(normalLoc);
        }
      }
      
      // Uniforms
      this._setUniform(program, 'modelMatrix', 'Matrix4fv', modelMatrix);
      this._setUniform(program, 'viewMatrix', 'Matrix4fv', viewMatrix);
      this._setUniform(program, 'projectionMatrix', 'Matrix4fv', projectionMatrix);
      this._setUniform(program, 'normalMatrix', 'Matrix4fv', modelMatrix);
      this._setUniform(program, 'color', '3fv', mesh.material.color);
      
      if (mesh.material.shaderType === 'phong') {
        this._setUniform(program, 'lightPosition', '3fv', lights.directional.position);
        this._setUniform(program, 'lightColor', '3fv', lights.directional.color);
        this._setUniform(program, 'ambientLight', '3fv', lights.ambient.color);
        this._setUniform(program, 'cameraPosition', '3fv', camera.position);
      }
      
      // Draw
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.index);
      
      if (mesh.material.wireframe) {
        this.gl.drawElements(this.gl.LINES, mesh.geometry.indices.length, this.gl.UNSIGNED_SHORT, 0);
      } else {
        this.gl.drawElements(this.gl.TRIANGLES, mesh.geometry.indices.length, this.gl.UNSIGNED_SHORT, 0);
      }
    }
    
    _setUniform(program, name, type, value) {
      const location = this.gl.getUniformLocation(program, name);
      if (location !== null) {
        if (type === 'Matrix4fv') {
          this.gl.uniformMatrix4fv(location, false, value);
        } else if (type === '3fv') {
          this.gl.uniform3fv(location, value);
        }
      }
    }
  }

  // ==================== ORBIT CONTROLS ====================
  
  class OrbitControls {
    constructor(camera, canvas) {
      this.camera = camera;
      this.canvas = canvas;
      this.radius = 5;
      this.theta = 0;
      this.phi = Math.PI / 4;
      this.autoRotate = false;
      this.autoRotateSpeed = 0.01;
      
      this._setupEventListeners();
      this.update();
    }
    
    _setupEventListeners() {
      let isDragging = false;
      let lastX = 0, lastY = 0;
      
      this.canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
      });
      
      this.canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        
        this.theta += deltaX * 0.01;
        this.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.phi + deltaY * 0.01));
        
        lastX = e.clientX;
        lastY = e.clientY;
        
        this.update();
      });
      
      this.canvas.addEventListener('mouseup', () => {
        isDragging = false;
      });
      
      this.canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        this.radius = Math.max(2, Math.min(20, this.radius + e.deltaY * 0.01));
        this.update();
      });
    }
    
    update() {
      if (this.autoRotate) {
        this.theta += this.autoRotateSpeed;
      }
      
      this.camera.position = [
        this.radius * Math.sin(this.phi) * Math.cos(this.theta),
        this.radius * Math.cos(this.phi),
        this.radius * Math.sin(this.phi) * Math.sin(this.theta)
      ];
      
      this.camera.lookAt(0, 0, 0);
    }
  }

  // ==================== PUBLIC API ====================
  
  const Luma3D = {
    // Core
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Mesh,
    
    // Geometries
    BoxGeometry,
    SphereGeometry,
    PlaneGeometry,
    
    // Materials
    Material,
    
    // Lights
    AmbientLight,
    DirectionalLight,
    PointLight,
    
    // Controls
    OrbitControls,
    
    // Utils
    Matrix4,
    
    // Version
    version: '0.3.0'
  };

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Luma3D;
  } else {
    global.Luma3D = Luma3D;
  }

})(typeof window !== 'undefined' ? window : globalThis);
