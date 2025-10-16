# ⚡ LumaJS

[![Version](https://img.shields.io/badge/version-0.2.1-blue.svg)](https://github.com/Krishna-10-7/LUMA/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Bundle Size](https://img.shields.io/badge/core-~8KB-brightgreen.svg)](https://github.com/Krishna-10-7/LUMA)
[![Animation Size](https://img.shields.io/badge/animate-~14KB-brightgreen.svg)](https://github.com/Krishna-10-7/LUMA)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](dist/index.d.ts)

**Next-generation JavaScript framework combining React-like reactivity, animations, and 3D capabilities in one lightweight library.**

🚀 **[View Demo](https://krishna-10-7.github.io/LUMA/)** | 📖 **[Documentation](#documentation)** | 🎯 **[Hackathon Guide](STEP1_OVERVIEW.md)**

---

## 🌟 Current Status

### ✅ Step 1: Core Reactivity (Complete)
**Complete React-like framework** with functional components, hooks, and virtual DOM - all in **~8KB**!

✅ Functional Components  
✅ Full Hooks System (useState, useEffect, useRef, useMemo, useCallback)  
✅ Virtual DOM Rendering  
✅ TypeScript Support  
✅ Production Ready

### ✅ Step 2: Animation Engine (Complete)
**Professional GSAP-like animation system** with advanced features - all in **~14KB**!

✅ 30+ Easing Functions (including spring physics)  
✅ Timeline Sequencing with Labels  
✅ Stagger Animations  
✅ Scroll Triggers (IntersectionObserver)  
✅ Parallax Effects  
✅ Color Morphing  
✅ SVG Path Animations  
✅ Advanced Controls (pause, resume, reverse, seek)  
✅ 20+ Preset Animations

### ✅ Step 3: 3D Engine (Complete)
**Three.js-like WebGL 3D rendering** with declarative API - all in **~18KB**!

✅ 3D Geometries (Box, Sphere, Plane)  
✅ Phong Lighting & Shading  
✅ Materials & Colors  
✅ Camera System (Perspective)  
✅ Orbit Controls  
✅ Scene Graph  
✅ Matrix Transformations  
✅ WebGL Renderer

---

## 🎯 What is LumaJS?

LumaJS aims to replace the need for multiple libraries (React + GSAP + Three.js) with one unified framework:

- **Reactive & Declarative**: Build UIs with automatic state-to-DOM updates
- **Animation-Ready**: Built-in scroll, hover, click, and time-based triggers (Step 2)
- **3D-Ready**: Declarative 3D API on top of WebGL (Step 3)
- **Lightweight**: ~15–20 KB core (vs 100–200 KB for multiple libraries)
- **Plug-and-Play**: Works directly in the browser with zero build tools

---

## 📦 Installation

### Option 1: Direct Browser Usage

```html
<script src="luma-core.js"></script>
<script>
  Luma.mount('#app', {
    state: { count: 0 }
  });
</script>
```

### Option 2: NPM (Coming Soon)

```bash
npm install lumajs
```

---

## 🚀 Quick Start

### 1. Create an HTML file

```html
<!DOCTYPE html>
<html>
<head>
  <title>LumaJS Counter</title>
</head>
<body>
  <div id="app">
    <h1 l-text="count"></h1>
    <button l-on:click="count++">Increment</button>
  </div>

  <script src="luma-core.js"></script>
  <script>
    Luma.mount('#app', {
      state: { count: 0 }
    });
  </script>
</body>
</html>
```

### 2. Open in browser

That's it! You now have a reactive counter with zero build tools.

---

## 📖 Core Directives (Step 1)

### `l-text="expression"`
Binds text content to an expression.

```html
<span l-text="username"></span>
<!-- Renders: username from state -->
```

### `l-html="expression"`
Binds innerHTML to an expression.

```html
<div l-html="'<strong>Bold Text</strong>'"></div>
```

### `l-show="condition"`
Shows/hides element based on condition.

```html
<div l-show="isLoggedIn">Welcome back!</div>
```

### `l-model="path"`
Two-way binding for form inputs.

```html
<input type="text" l-model="name">
<p l-text="name"></p>
<!-- Typing updates state and vice versa -->
```

### `l-on:event="handler"`
Event listener binding.

```html
<button l-on:click="count++">Click Me</button>
<input l-on:keydown="if(event.key === 'Enter') submit()">
```

### `l-bind:attr="expression"`
Dynamic attribute binding.

```html
<img l-bind:src="imageUrl" l-bind:alt="imageAlt">
<button l-bind:disabled="!isValid">Submit</button>
```

---

## 🏗️ Examples

### Counter App

```html
<div id="counter">
  <h1 l-text="count"></h1>
  <button l-on:click="count++">+</button>
  <button l-on:click="count--">-</button>
  <button l-on:click="count = 0">Reset</button>
</div>

<script>
  Luma.mount('#counter', {
    state: { count: 0 }
  });
</script>
```

### Form Binding

```html
<div id="form">
  <input type="text" l-model="name" placeholder="Name">
  <input type="email" l-model="email" placeholder="Email">
  <p>Hello, <span l-text="name || 'Guest'"></span>!</p>
  <p>Your email: <span l-text="email || 'Not provided'"></span></p>
</div>

<script>
  Luma.mount('#form', {
    state: { name: '', email: '' }
  });
</script>
```

### Todo List

```html
<div id="todos">
  <input l-model="newTodo" l-on:keydown="if(event.key==='Enter') addTodo()">
  <button l-on:click="addTodo()">Add</button>
  <p l-text="todos.length + ' todos'"></p>
</div>

<script>
  Luma.mount('#todos', {
    state: {
      newTodo: '',
      todos: []
    },
    methods: {
      addTodo() {
        if (!this.state.newTodo.trim()) return;
        this.state.todos.push({
          id: Date.now(),
          text: this.state.newTodo,
          done: false
        });
        this.state.newTodo = '';
      }
    }
  });
</script>
```

---

## 🔧 API Reference

### `Luma.mount(selector, options)`

Mounts a LumaJS app to a DOM element.

**Parameters:**
- `selector` (string | HTMLElement): Target element
- `options.state` (object): Reactive state object
- `options.methods` (object): Methods accessible in directives

**Returns:** `{ state, methods }` context object

```js
const app = Luma.mount('#app', {
  state: { count: 0 },
  methods: {
    increment() { this.state.count++; }
  }
});

// Access state programmatically
app.state.count = 10;
```

### `Luma.reactive(object)`

Creates a reactive proxy around an object.

```js
const state = Luma.reactive({ count: 0 });
Luma.effect(() => {
  console.log('Count:', state.count);
});
state.count++; // Logs: "Count: 1"
```

### `Luma.effect(fn)`

Runs a function and automatically re-runs when dependencies change.

```js
const state = Luma.reactive({ x: 1, y: 2 });
Luma.effect(() => {
  console.log('Sum:', state.x + state.y);
});
state.x = 5; // Logs: "Sum: 7"
```

---

## 🎨 Demo

Open `demo-step1.html` in your browser to see:

- ✅ Counter with increment/decrement
- ✅ Two-way form binding
- ✅ Todo list with add/delete
- ✅ Conditional rendering
- ✅ Computed values

---

## 🎨 LumaAnimate - Animation Engine

### Quick Start

```html
<script src="luma-animate.min.js"></script>
<script>
  // Basic animation
  LumaAnimate.to('.box', {
    transform: { translateX: 200, rotate: 360 },
    opacity: 0.5
  }, {
    duration: 1000,
    easing: 'easeOutCubic'
  });
</script>
```

### Core API

#### `LumaAnimate.to(element, properties, options)`
Animates element to target properties.

```js
LumaAnimate.to('.box', {
  transform: { translateY: 100, scale: 1.2 },
  backgroundColor: '#ff6b6b',
  opacity: 1
}, {
  duration: 800,
  delay: 200,
  easing: 'easeOutBack',
  onComplete: () => console.log('Done!')
});
```

#### `LumaAnimate.from(element, properties, options)`
Animates element from specified properties to current state.

```js
LumaAnimate.from('.box', {
  opacity: 0,
  transform: { translateY: -50 }
}, {
  duration: 600,
  easing: 'easeOutCubic'
});
```

#### `LumaAnimate.fromTo(element, from, to, options)`
Animates element from specific start to end values.

```js
LumaAnimate.fromTo('.box',
  { opacity: 0, transform: { scale: 0.5 } },
  { opacity: 1, transform: { scale: 1 } },
  { duration: 800, easing: 'easeOutBack' }
);
```

### Transform Properties

```js
LumaAnimate.to('.element', {
  transform: {
    translateX: 100,      // Move horizontally
    translateY: 50,       // Move vertically
    rotate: 45,           // Rotate in degrees
    rotateX: 30,          // 3D rotate on X axis
    rotateY: 45,          // 3D rotate on Y axis
    scale: 1.5,           // Scale uniformly
    scaleX: 1.2,          // Scale horizontally
    scaleY: 0.8,          // Scale vertically
    skewX: 10,            // Skew horizontally
    skewY: 5              // Skew vertically
  }
}, { duration: 1000 });
```

### Easing Functions (30+)

```js
// Basic
'linear', 'easeInQuad', 'easeOutQuad', 'easeInOutQuad'

// Cubic
'easeInCubic', 'easeOutCubic', 'easeInOutCubic'

// Quartic
'easeInQuart', 'easeOutQuart', 'easeInOutQuart'

// Quintic
'easeInQuint', 'easeOutQuint'

// Sine
'easeInSine', 'easeOutSine', 'easeInOutSine'

// Expo
'easeInExpo', 'easeOutExpo', 'easeInOutExpo'

// Circ
'easeInCirc', 'easeOutCirc', 'easeInOutCirc'

// Back
'easeInBack', 'easeOutBack', 'easeInOutBack'

// Elastic
'elastic', 'easeInElastic', 'easeOutElastic', 'easeInOutElastic'

// Bounce
'bounce', 'easeInBounce', 'easeOutBounce', 'easeInOutBounce'

// Spring Physics
LumaAnimate.easing.spring(tension, friction)
```

### Timeline Sequencing

Orchestrate complex animation sequences:

```js
const tl = LumaAnimate.timeline();

tl
  .to('.box1', { opacity: 1 }, { duration: 500 })
  .to('.box2', { opacity: 1 }, { duration: 500 }) // After box1
  .to('.box3', { opacity: 1 }, { duration: 500, position: '<' }) // Same time as box2
  .addLabel('middle')
  .to('.box4', { transform: { scale: 2 } }, { duration: 800, position: 'middle+200' })
  .play();

// Control timeline
tl.pause();
tl.resume();
tl.restart();
tl.seek(0.5); // Jump to 50%
```

### Stagger Animations

Animate multiple elements with sequential delays:

```js
const boxes = document.querySelectorAll('.box');

LumaAnimate.stagger(boxes, {
  opacity: 1,
  transform: { translateY: 0 }
}, {
  duration: 600,
  stagger: 100, // 100ms delay between each
  easing: 'easeOutBack'
});
```

### Scroll Triggers

Trigger animations on scroll:

```js
LumaAnimate.scrollTrigger('.element', {
  animation: LumaAnimate.to('.element', {
    opacity: 1,
    transform: { translateY: 0 }
  }, { duration: 800 }),
  once: true, // Only trigger once
  onEnter: (el) => console.log('Entered viewport'),
  onLeave: (el) => console.log('Left viewport')
});
```

### Parallax Effects

```js
LumaAnimate.parallax('.background', {
  speed: 0.5,        // Slower than scroll
  direction: 'vertical' // or 'horizontal'
});
```

### Color Morphing

```js
LumaAnimate.to('.box', {
  backgroundColor: '#ff6b6b', // Hex colors
  color: 'rgb(100, 200, 255)', // RGB colors
  borderColor: '#00ff00'
}, { duration: 1000 });
```

### Preset Animations (20+)

```js
// Fade
LumaAnimate.animate('.box', 'fadeIn');
LumaAnimate.animate('.box', 'fadeOut');

// Slide
LumaAnimate.animate('.box', 'slideInLeft');
LumaAnimate.animate('.box', 'slideInRight');
LumaAnimate.animate('.box', 'slideInUp');
LumaAnimate.animate('.box', 'slideInDown');

// Zoom
LumaAnimate.animate('.box', 'zoomIn');
LumaAnimate.animate('.box', 'zoomOut');

// Rotate
LumaAnimate.animate('.box', 'rotateIn');
LumaAnimate.animate('.box', 'rotateOut');

// Flip
LumaAnimate.animate('.box', 'flipInX');
LumaAnimate.animate('.box', 'flipInY');

// Attention Seekers
LumaAnimate.animate('.box', 'bounce');
LumaAnimate.animate('.box', 'pulse');
LumaAnimate.animate('.box', 'shake');
LumaAnimate.animate('.box', 'swing');
LumaAnimate.animate('.box', 'rubberBand');
LumaAnimate.animate('.box', 'heartBeat');
```

### Advanced Controls

```js
const anim = LumaAnimate.to('.box', {
  transform: { translateX: 200 }
}, {
  duration: 2000,
  repeat: 2,           // Repeat 2 times
  yoyo: true,          // Reverse on repeat
  repeatDelay: 500,    // Delay between repeats
  onStart: () => console.log('Started'),
  onUpdate: (progress) => console.log('Progress:', progress),
  onComplete: () => console.log('Done')
});

// Control methods
anim.pause();
anim.resume();
anim.reverse();
anim.restart();
anim.seek(0.5); // Jump to 50%
anim.kill();    // Stop and cleanup
```

### Spring Physics

Natural physics-based motion:

```js
LumaAnimate.to('.box', {
  transform: { translateY: -200 }
}, {
  duration: 2000,
  easing: LumaAnimate.easing.spring(170, 26) // tension, friction
});

// Presets
const softSpring = LumaAnimate.easing.spring(80, 20);
const stiffSpring = LumaAnimate.easing.spring(300, 30);
```

### SVG Path Animation

```html
<svg>
  <path id="myPath" d="M 0,0 Q 100,100 200,0" />
</svg>
<div class="follower"></div>

<script>
LumaAnimate.pathAnimation('.follower', '#myPath', {
  duration: 3000,
  rotate: true, // Rotate along path
  easing: 'easeInOutCubic'
}).start();
</script>
```

### Performance Tips

1. **Use transforms instead of position properties** for better performance
2. **Batch animations** with timelines or stagger
3. **Use `will-change` CSS** for elements that will animate
4. **Kill animations** when no longer needed
5. **Prefer hardware-accelerated properties**: transform, opacity

---

## 🌟 Luma3D - 3D Engine

### Quick Start

```html
<canvas id="canvas"></canvas>
<script src="luma-3d.min.js"></script>
<script>
  // Setup
  const canvas = document.getElementById('canvas');
  const scene = new Luma3D.Scene();
  const camera = new Luma3D.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
  const renderer = new Luma3D.WebGLRenderer({ canvas });
  
  // Create 3D objects
  const geometry = new Luma3D.BoxGeometry(1, 1, 1);
  const material = new Luma3D.Material({ color: [1, 0.3, 0.3] });
  const cube = new Luma3D.Mesh(geometry, material);
  scene.add(cube);
  
  // Camera position
  camera.position = [0, 0, 5];
  
  // Animation loop
  function animate() {
    cube.rotation[1] += 0.01;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
</script>
```

### Core API

#### Scene
```js
const scene = new Luma3D.Scene();
scene.add(mesh);      // Add object to scene
scene.remove(mesh);   // Remove object

// Lighting
scene.lights.ambient.color = [0.3, 0.3, 0.4];
scene.lights.directional.position = [5, 10, 7];
scene.lights.directional.color = [1.2, 1.2, 1.0];
```

#### Camera
```js
const camera = new Luma3D.PerspectiveCamera(
  fov = 75,         // Field of view in degrees
  aspect = 1.6,     // Aspect ratio
  near = 0.1,       // Near clipping plane
  far = 1000        // Far clipping plane
);

camera.position = [0, 5, 10];
camera.lookAt(0, 0, 0);
```

#### Geometries
```js
// Box
const boxGeo = new Luma3D.BoxGeometry(width, height, depth);

// Sphere
const sphereGeo = new Luma3D.SphereGeometry(
  radius = 1,
  widthSegments = 32,
  heightSegments = 16
);

// Plane
const planeGeo = new Luma3D.PlaneGeometry(width, height);
```

#### Materials
```js
const material = new Luma3D.Material({
  color: [1, 0.5, 0.2],        // RGB values 0-1
  wireframe: false,             // Render as wireframe
  shaderType: 'phong'           // 'basic' or 'phong'
});
```

#### Mesh
```js
const mesh = new Luma3D.Mesh(geometry, material);

// Transform
mesh.position = [x, y, z];
mesh.rotation = [rx, ry, rz];  // Radians
mesh.scale = [sx, sy, sz];
mesh.visible = true;
```

#### Renderer
```js
const renderer = new Luma3D.WebGLRenderer({ 
  canvas: canvasElement 
});

renderer.render(scene, camera);        // Render frame
renderer.setSize(width, height);       // Update size
```

#### Orbit Controls
```js
const controls = new Luma3D.OrbitControls(camera, canvas);

controls.autoRotate = true;
controls.autoRotateSpeed = 0.01;
controls.update();  // Call in animation loop
```

### Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  
  <script src="luma-3d.min.js"></script>
  <script>
    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Setup scene
    const scene = new Luma3D.Scene();
    const camera = new Luma3D.PerspectiveCamera(
      75, 
      canvas.width / canvas.height, 
      0.1, 
      1000
    );
    const renderer = new Luma3D.WebGLRenderer({ canvas });
    const controls = new Luma3D.OrbitControls(camera, canvas);
    
    // Create animated objects
    const boxGeo = new Luma3D.BoxGeometry(1, 1, 1);
    const sphereGeo = new Luma3D.SphereGeometry(0.7, 32, 16);
    
    // Central rotating cube
    const cube = new Luma3D.Mesh(
      boxGeo,
      new Luma3D.Material({ color: [1, 0.3, 0.3] })
    );
    cube.position = [-1.5, 0, 0];
    scene.add(cube);
    
    // Orbiting sphere
    const sphere = new Luma3D.Mesh(
      sphereGeo,
      new Luma3D.Material({ color: [0.3, 0.5, 1] })
    );
    scene.add(sphere);
    
    // Ground plane
    const plane = new Luma3D.Mesh(
      new Luma3D.PlaneGeometry(10, 10),
      new Luma3D.Material({ color: [0.3, 0.3, 0.3] })
    );
    plane.rotation = [Math.PI / 2, 0, 0];
    plane.position = [0, -2, 0];
    scene.add(plane);
    
    // Animation loop
    let time = 0;
    function animate() {
      time += 0.016;
      
      // Rotate cube
      cube.rotation[1] += 0.01;
      
      // Orbit sphere
      sphere.position = [
        Math.cos(time) * 3,
        Math.sin(time * 2) * 0.5,
        Math.sin(time) * 3
      ];
      sphere.rotation[0] += 0.02;
      
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      camera.aspect = canvas.width / canvas.height;
      renderer.setSize(canvas.width, canvas.height);
    });
  </script>
</body>
</html>
```

### Features

- **⚡ Lightweight**: ~18KB minified (vs Three.js ~580KB)
- **🎨 Phong Lighting**: Realistic shading with ambient + directional lights
- **📷 Camera Controls**: Built-in orbit controls with mouse/scroll
- **📦 3D Geometries**: Box, Sphere, Plane (more coming)
- **🖄 Matrix Math**: Full 3D transformations
- **🎮 Interactive**: Drag to rotate, scroll to zoom
- **🖥 WebGL**: Hardware-accelerated rendering

---

## 🛣️ Roadmap

| Step | Feature | Status |
|------|---------|--------|
| 1 | Core Reactivity | ✅ Complete |
| 2 | Animation Engine | ✅ Complete |
| 3 | 3D Engine (WebGL) | ✅ Complete |
| 4 | Full Interactive 3D Website Demo | 📅 Next |

---

## 🧪 Technical Details

### Reactivity System

LumaJS uses **fine-grained reactivity** with Proxy-based tracking:

1. **Track**: When a reactive property is accessed during an effect, it's tracked as a dependency
2. **Trigger**: When a property changes, all dependent effects re-run
3. **Cleanup**: Effects clean up old dependencies before re-running

This approach is similar to Vue 3's reactivity system but optimized for minimal bundle size.

### Bundle Size

- **LumaCore**: ~6 KB minified + gzipped
- **Compare**: React (~40 KB) + GSAP (~30 KB) + Three.js (~100 KB) = 170 KB

### Browser Support

- Chrome 49+
- Firefox 18+
- Safari 10+
- Edge 12+

Requires `Proxy` support (all modern browsers).

---

## 🤝 Contributing

LumaJS is in active development. Contributions welcome!

### Immediate Priorities

- [ ] Add `l-for` directive for list rendering
- [ ] Add `l-if` directive for conditional rendering (vs `l-show`)
- [ ] Optimize batch updates for performance
- [ ] Add TypeScript definitions
- [ ] Build npm package

---

## 📄 License

MIT License – feel free to use in any project!

---

## 🌟 Why LumaJS?

| Challenge | Current Solution | LumaJS Solution |
|-----------|------------------|-----------------|
| Reactive UI | React (40 KB) | Built-in (~6 KB) |
| Animations | GSAP/Anime.js (30 KB) | Built-in (Step 2) |
| 3D Graphics | Three.js (100 KB) | Built-in (Step 3) |
| Setup Complexity | Multiple configs, bundlers | Single `<script>` tag |
| Learning Curve | JSX, hooks, separate libs | Simple directives |

**One library. Zero setup. Infinite possibilities.**

---

**Next:** Step 2 will add `LumaAnimate` for scroll triggers, hover effects, and micro-interactions!
