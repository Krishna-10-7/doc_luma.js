/*!
 * LumaAnimate v0.2.0 - Animation Engine
 * Built-in GSAP-like animations for LumaJS
 * @license MIT
 */
(function(global) {
  'use strict';

  // ==================== EASING FUNCTIONS ====================
  
  const Easing = {
    linear: t => t,
    
    // Ease In
    easeInQuad: t => t * t,
    easeInCubic: t => t * t * t,
    easeInQuart: t => t * t * t * t,
    easeInQuint: t => t * t * t * t * t,
    easeInSine: t => 1 - Math.cos((t * Math.PI) / 2),
    easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
    easeInCirc: t => 1 - Math.sqrt(1 - t * t),
    easeInBack: t => {
      const c1 = 1.70158;
      return (c1 + 1) * t * t * t - c1 * t * t;
    },
    
    // Ease Out
    easeOutQuad: t => t * (2 - t),
    easeOutCubic: t => (--t) * t * t + 1,
    easeOutQuart: t => 1 - (--t) * t * t * t,
    easeOutQuint: t => 1 + (--t) * t * t * t * t,
    easeOutSine: t => Math.sin((t * Math.PI) / 2),
    easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    easeOutCirc: t => Math.sqrt(1 - (--t) * t),
    easeOutBack: t => {
      const c1 = 1.70158;
      return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    
    // Ease In Out
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
    easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
    easeInOutExpo: t => {
      if (t === 0) return 0;
      if (t === 1) return 1;
      return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
    },
    easeInOutCirc: t => {
      return t < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
    },
    easeInOutBack: t => {
      const c1 = 1.70158;
      const c2 = c1 * 1.525;
      return t < 0.5
        ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
        : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    },
    
    // Elastic
    elastic: t => {
      if (t === 0 || t === 1) return t;
      const p = 0.3;
      return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    },
    easeInElastic: t => {
      if (t === 0 || t === 1) return t;
      const c4 = (2 * Math.PI) / 3;
      return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    },
    easeOutElastic: t => {
      if (t === 0 || t === 1) return t;
      const c4 = (2 * Math.PI) / 3;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    easeInOutElastic: t => {
      if (t === 0 || t === 1) return t;
      const c5 = (2 * Math.PI) / 4.5;
      return t < 0.5
        ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
        : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
    },
    
    // Bounce - smoother version
    bounce: t => {
      const n1 = 7.5625;
      const d1 = 2.75;
      
      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    },
    easeInBounce: t => 1 - Easing.easeOutBounce(1 - t),
    easeOutBounce: t => {
      const n1 = 7.5625;
      const d1 = 2.75;
      
      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    },
    easeInOutBounce: t => t < 0.5
      ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2
      : (1 + Easing.easeOutBounce(2 * t - 1)) / 2
  };
  
  // Spring physics for natural motion
  Easing.spring = function(tension = 170, friction = 26) {
    return function(t) {
      const w0 = Math.sqrt(tension / 1);
      const zeta = friction / (2 * Math.sqrt(tension * 1));
      const wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
      const A = 1;
      const B = zeta < 1 ? (zeta * w0 + 0) / wd : 0;
      
      if (zeta < 1) {
        const envelope = Math.exp(-zeta * w0 * t);
        return 1 - envelope * (A * Math.cos(wd * t) + B * Math.sin(wd * t));
      } else {
        return 1 - Math.exp(-w0 * t) * (A + B * t);
      }
    };
  };

  // ==================== COLOR UTILITIES ====================
  
  const ColorUtils = {
    hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    },
    
    rgbToHex(r, g, b) {
      return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    },
    
    parseColor(color) {
      if (color.startsWith('#')) {
        return this.hexToRgb(color);
      } else if (color.startsWith('rgb')) {
        const match = color.match(/\d+/g);
        return match ? { r: +match[0], g: +match[1], b: +match[2] } : null;
      }
      return null;
    },
    
    interpolate(color1, color2, progress) {
      const c1 = this.parseColor(color1);
      const c2 = this.parseColor(color2);
      if (!c1 || !c2) return color2;
      
      const r = c1.r + (c2.r - c1.r) * progress;
      const g = c1.g + (c2.g - c1.g) * progress;
      const b = c1.b + (c2.b - c1.b) * progress;
      
      return this.rgbToHex(r, g, b);
    }
  };

  // ==================== ANIMATION CLASS ====================
  
  class Animation {
    constructor(element, properties, options = {}) {
      this.element = element;
      this.properties = properties;
      this.duration = options.duration || 1000;
      this.delay = options.delay || 0;
      this.easing = typeof options.easing === 'function' 
        ? options.easing 
        : (Easing[options.easing] || Easing.easeOutCubic);
      this.onComplete = options.onComplete;
      this.onUpdate = options.onUpdate;
      this.onStart = options.onStart;
      this.repeat = options.repeat || 0;
      this.yoyo = options.yoyo || false;
      this.repeatDelay = options.repeatDelay || 0;
      
      this.startTime = null;
      this.startValues = {};
      this.endValues = {};
      this.colorProperties = [];
      this.animationFrame = null;
      this.isRunning = false;
      this.isPaused = false;
      this.pausedTime = 0;
      this.totalPausedTime = 0;
      this.currentRepeat = 0;
      this.isReversed = false;
      
      this._parseProperties();
    }
    
    _parseProperties() {
      for (const [key, value] of Object.entries(this.properties)) {
        if (key === 'transform') {
          this._parseTransform(value);
        } else if (this._isColorProperty(key)) {
          this.colorProperties.push(key);
          this.startValues[key] = this._getCurrentColorValue(key);
          this.endValues[key] = value;
        } else {
          const current = this._getCurrentValue(key);
          this.startValues[key] = current;
          this.endValues[key] = this._parseValue(value, current);
        }
      }
    }
    
    _isColorProperty(prop) {
      const colorProps = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'];
      return colorProps.some(cp => prop.toLowerCase().includes(cp.toLowerCase()));
    }
    
    _getCurrentColorValue(property) {
      const computed = window.getComputedStyle(this.element);
      let color = computed[property];
      
      // If it's a gradient or complex value, default to a base color
      if (!color || color === 'none' || color.includes('gradient')) {
        // Get a reasonable default based on property
        if (property === 'backgroundColor') return 'rgb(255, 255, 255)';
        return 'rgb(0, 0, 0)';
      }
      
      return color;
    }
    
    _parseTransform(transform) {
      // Parse transform string like "translateX(100px) rotate(45deg)"
      const transforms = typeof transform === 'string' ? this._parseTransformString(transform) : transform;
      
      for (const [key, value] of Object.entries(transforms)) {
        const current = this._getCurrentTransform(key);
        this.startValues[`transform.${key}`] = current;
        this.endValues[`transform.${key}`] = this._parseValue(value, current);
      }
    }
    
    _parseTransformString(str) {
      const transforms = {};
      const regex = /(\w+)\(([^)]+)\)/g;
      let match;
      
      while ((match = regex.exec(str)) !== null) {
        transforms[match[1]] = match[2];
      }
      
      return transforms;
    }
    
    _getCurrentValue(property) {
      const computed = window.getComputedStyle(this.element);
      const value = computed[property];
      return parseFloat(value) || 0;
    }
    
    _getCurrentTransform(property) {
      const matrix = window.getComputedStyle(this.element).transform;
      if (matrix === 'none') return 0;
      
      // Parse matrix for transform values
      // For simplicity, return 0 - in production, parse matrix properly
      return 0;
    }
    
    _parseValue(value, current) {
      if (typeof value === 'string') {
        // Handle relative values like "+=100" or "-=50"
        if (value.startsWith('+=')) {
          return current + parseFloat(value.slice(2));
        } else if (value.startsWith('-=')) {
          return current - parseFloat(value.slice(2));
        }
        return parseFloat(value);
      }
      return value;
    }
    
    start() {
      if (this.isRunning && !this.isPaused) return this;
      
      if (this.isPaused) {
        this.isPaused = false;
        this.totalPausedTime += performance.now() - this.pausedTime;
        this.animationFrame = requestAnimationFrame((time) => this._animate(time));
      } else {
        setTimeout(() => {
          this.isRunning = true;
          this.startTime = null;
          if (this.onStart) this.onStart();
          this.animationFrame = requestAnimationFrame((time) => this._animate(time));
        }, this.delay);
      }
      
      return this;
    }
    
    _animate(currentTime) {
      if (!this.isRunning || this.isPaused) return;
      
      if (!this.startTime) this.startTime = currentTime;
      
      const elapsed = currentTime - this.startTime - this.totalPausedTime;
      const progress = Math.min(elapsed / this.duration, 1);
      const easedProgress = this.easing(progress);
      
      this._updateValues(this.isReversed ? 1 - easedProgress : easedProgress);
      
      if (this.onUpdate) {
        this.onUpdate(easedProgress);
      }
      
      if (progress < 1) {
        this.animationFrame = requestAnimationFrame((time) => this._animate(time));
      } else {
        if (this.currentRepeat < this.repeat) {
          this.currentRepeat++;
          
          if (this.yoyo) {
            this.isReversed = !this.isReversed;
          }
          
          setTimeout(() => {
            this.startTime = null;
            this.totalPausedTime = 0;
            this.animationFrame = requestAnimationFrame((time) => this._animate(time));
          }, this.repeatDelay);
        } else {
          this.isRunning = false;
          if (this.onComplete) {
            this.onComplete();
          }
        }
      }
    }
    
    _updateValues(progress) {
      const transforms = {};
      
      for (const [key, startValue] of Object.entries(this.startValues)) {
        const endValue = this.endValues[key];
        
        if (key.startsWith('transform.')) {
          const transformKey = key.split('.')[1];
          const currentValue = startValue + (endValue - startValue) * progress;
          transforms[transformKey] = currentValue;
        } else if (this.colorProperties.includes(key)) {
          const color = ColorUtils.interpolate(startValue, endValue, progress);
          this.element.style[key] = color;
        } else {
          const currentValue = startValue + (endValue - startValue) * progress;
          this._applyStyle(key, currentValue);
        }
      }
      
      if (Object.keys(transforms).length > 0) {
        this._applyTransform(transforms);
      }
    }
    
    _applyStyle(property, value) {
      // Auto-add units for certain properties
      const needsUnit = ['width', 'height', 'top', 'left', 'right', 'bottom', 
                         'margin', 'padding', 'fontSize', 'borderRadius'];
      
      if (needsUnit.some(prop => property.includes(prop))) {
        this.element.style[property] = `${value}px`;
      } else {
        this.element.style[property] = value;
      }
    }
    
    _applyTransform(transforms) {
      const transformStrings = [];
      
      for (const [key, value] of Object.entries(transforms)) {
        let unit = '';
        if (key.includes('translate')) unit = 'px';
        if (key.includes('rotate') || key.includes('skew')) unit = 'deg';
        if (key.includes('scale')) unit = '';
        
        transformStrings.push(`${key}(${value}${unit})`);
      }
      
      this.element.style.transform = transformStrings.join(' ');
    }
    
    pause() {
      if (!this.isRunning || this.isPaused) return this;
      
      this.isPaused = true;
      this.pausedTime = performance.now();
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
      return this;
    }
    
    resume() {
      if (!this.isPaused) return this;
      this.start();
      return this;
    }
    
    reverse() {
      this.isReversed = !this.isReversed;
      return this;
    }
    
    restart() {
      this.kill();
      this.startTime = null;
      this.totalPausedTime = 0;
      this.currentRepeat = 0;
      this.isReversed = false;
      this.isPaused = false;
      return this.start();
    }
    
    seek(progress) {
      const wasRunning = this.isRunning;
      if (wasRunning) this.pause();
      
      const easedProgress = this.easing(Math.max(0, Math.min(1, progress)));
      this._updateValues(easedProgress);
      
      if (wasRunning) this.resume();
      return this;
    }
    
    kill() {
      this.isRunning = false;
      this.isPaused = false;
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
      return this;
    }
  }

  // ==================== TIMELINE CLASS ====================
  
  class Timeline {
    constructor(options = {}) {
      this.animations = [];
      this.labels = {};
      this.position = 0;
      this.options = options;
    }
    
    to(element, properties, options = {}) {
      const position = typeof options.position === 'string' 
        ? this._parsePosition(options.position)
        : (options.position !== undefined ? options.position : this.position);
      
      const delay = options.delay || 0;
      options.delay = position + delay;
      
      const animation = new Animation(element, properties, options);
      this.animations.push(animation);
      
      this.position = position + (options.duration || 1000) + delay;
      return this;
    }
    
    from(element, properties, options = {}) {
      const position = typeof options.position === 'string' 
        ? this._parsePosition(options.position)
        : (options.position !== undefined ? options.position : this.position);
      
      const delay = options.delay || 0;
      options.delay = position + delay;
      
      const animation = new Animation(element, properties, options);
      const temp = animation.startValues;
      animation.startValues = animation.endValues;
      animation.endValues = temp;
      
      this.animations.push(animation);
      
      this.position = position + (options.duration || 1000) + delay;
      return this;
    }
    
    fromTo(element, fromProps, toProps, options = {}) {
      const position = typeof options.position === 'string' 
        ? this._parsePosition(options.position)
        : (options.position !== undefined ? options.position : this.position);
      
      const delay = options.delay || 0;
      options.delay = position + delay;
      
      const animation = new Animation(element, toProps, options);
      
      for (const [key, value] of Object.entries(fromProps)) {
        if (animation.startValues[key] !== undefined) {
          animation.startValues[key] = typeof value === 'string' ? parseFloat(value) : value;
        }
      }
      
      this.animations.push(animation);
      
      this.position = position + (options.duration || 1000) + delay;
      return this;
    }
    
    addLabel(label, position) {
      this.labels[label] = position !== undefined ? position : this.position;
      return this;
    }
    
    _parsePosition(position) {
      if (position === '<') {
        return Math.max(0, this.position - (this.animations[this.animations.length - 1]?.duration || 0));
      }
      
      const labelMatch = position.match(/^([^+-]+)([+-]\d+)?$/);
      if (labelMatch && this.labels[labelMatch[1]] !== undefined) {
        const offset = labelMatch[2] ? parseInt(labelMatch[2]) : 0;
        return this.labels[labelMatch[1]] + offset;
      }
      
      return parseFloat(position) || this.position;
    }
    
    play() {
      this.animations.forEach(anim => anim.start());
      return this;
    }
    
    pause() {
      this.animations.forEach(anim => anim.pause());
      return this;
    }
    
    resume() {
      this.animations.forEach(anim => anim.resume());
      return this;
    }
    
    restart() {
      this.animations.forEach(anim => anim.restart());
      this.position = 0;
      return this;
    }
    
    reverse() {
      this.animations.forEach(anim => anim.reverse());
      return this;
    }
    
    seek(time) {
      this.animations.forEach(anim => {
        const relativeTime = time - (anim.delay || 0);
        if (relativeTime >= 0) {
          anim.seek(relativeTime / anim.duration);
        }
      });
      return this;
    }
    
    kill() {
      this.animations.forEach(anim => anim.kill());
      this.animations = [];
      this.position = 0;
      return this;
    }
  }

  // ==================== SCROLL ANIMATIONS ====================
  
  class ScrollTrigger {
    constructor(element, options = {}) {
      this.element = element;
      this.start = options.start || 'top 80%';
      this.end = options.end || 'bottom 20%';
      this.animation = options.animation;
      this.onEnter = options.onEnter;
      this.onLeave = options.onLeave;
      this.once = options.once || false;
      this.hasTriggered = false;
      
      this._setup();
    }
    
    _setup() {
      const observerOptions = {
        threshold: this._calculateThreshold(),
        rootMargin: '0px'
      };
      
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!this.hasTriggered || !this.once) {
              if (this.animation) {
                this.animation.start();
              }
              if (this.onEnter) {
                this.onEnter(this.element);
              }
              this.hasTriggered = true;
            }
          } else {
            if (this.onLeave && this.hasTriggered) {
              this.onLeave(this.element);
            }
          }
        });
      }, observerOptions);
      
      this.observer.observe(this.element);
    }
    
    _calculateThreshold() {
      // Parse start position to threshold
      // For simplicity, using a default threshold
      return 0.1;
    }
    
    kill() {
      if (this.observer) {
        this.observer.disconnect();
      }
      if (this.animation) {
        this.animation.kill();
      }
    }
  }

  // ==================== STAGGER ANIMATIONS ====================
  
  function stagger(elements, properties, options = {}) {
    const staggerDelay = options.stagger || 100;
    const baseDelay = options.delay || 0;
    const animations = [];
    
    elements.forEach((el, index) => {
      const staggeredOptions = { 
        ...options, 
        delay: baseDelay + (index * staggerDelay) 
      };
      
      const element = typeof el === 'string' ? document.querySelector(el) : el;
      animations.push(new Animation(element, properties, staggeredOptions).start());
    });
    
    return animations;
  }
  
  // ==================== PARALLAX CLASS ====================
  
  class Parallax {
    constructor(element, options = {}) {
      this.element = typeof element === 'string' ? document.querySelector(element) : element;
      this.speed = options.speed || 0.5;
      this.direction = options.direction || 'vertical';
      this.offset = options.offset || 0;
      
      this._onScroll = this._onScroll.bind(this);
      this.enable();
    }
    
    _onScroll() {
      const scrolled = window.pageYOffset;
      const elementTop = this.element.getBoundingClientRect().top + scrolled;
      const distance = scrolled - elementTop;
      const offset = distance * this.speed + this.offset;
      
      if (this.direction === 'vertical') {
        this.element.style.transform = `translateY(${offset}px)`;
      } else {
        this.element.style.transform = `translateX(${offset}px)`;
      }
    }
    
    enable() {
      window.addEventListener('scroll', this._onScroll, { passive: true });
      this._onScroll();
    }
    
    disable() {
      window.removeEventListener('scroll', this._onScroll);
    }
    
    destroy() {
      this.disable();
      this.element.style.transform = '';
    }
  }
  
  // ==================== PATH ANIMATION ====================
  
  class PathAnimation {
    constructor(element, path, options = {}) {
      this.element = typeof element === 'string' ? document.querySelector(element) : element;
      this.path = typeof path === 'string' ? document.querySelector(path) : path;
      this.duration = options.duration || 2000;
      this.easing = Easing[options.easing] || Easing.easeInOutCubic;
      this.rotate = options.rotate !== false;
      this.onComplete = options.onComplete;
      
      if (this.path instanceof SVGPathElement) {
        this.pathLength = this.path.getTotalLength();
      }
    }
    
    start() {
      if (!this.path || !this.pathLength) return this;
      
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        const easedProgress = this.easing(progress);
        
        const distance = easedProgress * this.pathLength;
        const point = this.path.getPointAtLength(distance);
        
        this.element.style.transform = `translate(${point.x}px, ${point.y}px)`;
        
        if (this.rotate && distance < this.pathLength - 1) {
          const nextPoint = this.path.getPointAtLength(distance + 1);
          const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
          this.element.style.transform += ` rotate(${angle}deg)`;
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else if (this.onComplete) {
          this.onComplete();
        }
      };
      
      requestAnimationFrame(animate);
      return this;
    }
  }

  // ==================== PRESET ANIMATIONS ====================
  
  const Presets = {
    fadeIn: {
      opacity: 1,
      duration: 600,
      easing: 'easeOutCubic'
    },
    
    fadeOut: {
      opacity: 0,
      duration: 600,
      easing: 'easeOutCubic'
    },
    
    slideInLeft: {
      transform: { translateX: 0 },
      opacity: 1,
      duration: 800,
      easing: 'easeOutCubic'
    },
    
    slideInRight: {
      transform: { translateX: 0 },
      opacity: 1,
      duration: 800,
      easing: 'easeOutCubic'
    },
    
    slideInUp: {
      transform: { translateY: 0 },
      opacity: 1,
      duration: 800,
      easing: 'easeOutCubic'
    },
    
    slideInDown: {
      transform: { translateY: 0 },
      opacity: 1,
      duration: 800,
      easing: 'easeOutCubic'
    },
    
    slideOutLeft: {
      transform: { translateX: -100 },
      opacity: 0,
      duration: 600,
      easing: 'easeInCubic'
    },
    
    slideOutRight: {
      transform: { translateX: 100 },
      opacity: 0,
      duration: 600,
      easing: 'easeInCubic'
    },
    
    zoomIn: {
      transform: { scale: 1 },
      opacity: 1,
      duration: 600,
      easing: 'easeOutBack'
    },
    
    zoomOut: {
      transform: { scale: 0 },
      opacity: 0,
      duration: 600,
      easing: 'easeInBack'
    },
    
    rotateIn: {
      transform: { rotate: 0 },
      opacity: 1,
      duration: 800,
      easing: 'easeOutBack'
    },
    
    rotateOut: {
      transform: { rotate: 180 },
      opacity: 0,
      duration: 600,
      easing: 'easeInBack'
    },
    
    flipInX: {
      transform: { rotateX: 0 },
      opacity: 1,
      duration: 800,
      easing: 'easeOutBack'
    },
    
    flipInY: {
      transform: { rotateY: 0 },
      opacity: 1,
      duration: 800,
      easing: 'easeOutBack'
    },
    
    bounce: {
      transform: { translateY: 0 },
      duration: 1000,
      easing: 'bounce'
    },
    
    pulse: {
      transform: { scale: 1.05 },
      duration: 400,
      easing: 'easeInOutQuad',
      yoyo: true,
      repeat: 1
    },
    
    shake: {
      transform: { translateX: 10 },
      duration: 100,
      easing: 'linear',
      yoyo: true,
      repeat: 5
    },
    
    swing: {
      transform: { rotate: 15 },
      duration: 500,
      easing: 'easeInOutSine',
      yoyo: true,
      repeat: 2
    },
    
    rubberBand: {
      transform: { scaleX: 1.25, scaleY: 0.75 },
      duration: 800,
      easing: 'easeInOutElastic'
    },
    
    jello: {
      transform: { skewX: 0, skewY: 0 },
      duration: 1000,
      easing: 'easeInOutElastic'
    },
    
    heartBeat: {
      transform: { scale: 1.3 },
      duration: 300,
      easing: 'easeInOutQuad',
      yoyo: true,
      repeat: 2
    }
  };

  // ==================== PUBLIC API ====================
  
  const LumaAnimate = {
    // Core animation
    to: (element, properties, options) => {
      const el = typeof element === 'string' ? document.querySelector(element) : element;
      return new Animation(el, properties, options).start();
    },
    
    from: (element, properties, options) => {
      const el = typeof element === 'string' ? document.querySelector(element) : element;
      const animation = new Animation(el, properties, options);
      const temp = animation.startValues;
      animation.startValues = animation.endValues;
      animation.endValues = temp;
      return animation.start();
    },
    
    fromTo: (element, fromProps, toProps, options) => {
      const el = typeof element === 'string' ? document.querySelector(element) : element;
      const animation = new Animation(el, toProps, options);
      
      for (const [key, value] of Object.entries(fromProps)) {
        if (animation.startValues[key] !== undefined) {
          animation.startValues[key] = typeof value === 'string' ? parseFloat(value) : value;
        }
      }
      
      return animation.start();
    },
    
    // Batch animations
    batch: (elements, properties, options) => {
      const animations = [];
      elements.forEach(el => {
        const element = typeof el === 'string' ? document.querySelector(el) : el;
        animations.push(new Animation(element, properties, options).start());
      });
      return animations;
    },
    
    // Stagger animations
    stagger: (elements, properties, options) => {
      return stagger(elements, properties, options);
    },
    
    // Timeline
    timeline: (options) => new Timeline(options),
    
    // Scroll trigger
    scrollTrigger: (element, options) => {
      const el = typeof element === 'string' ? document.querySelector(element) : element;
      return new ScrollTrigger(el, options);
    },
    
    // Parallax
    parallax: (element, options) => {
      return new Parallax(element, options);
    },
    
    // Path animation
    pathAnimation: (element, path, options) => {
      return new PathAnimation(element, path, options);
    },
    
    // Preset animations
    animate: (element, presetName, options = {}) => {
      const el = typeof element === 'string' ? document.querySelector(element) : element;
      const preset = Presets[presetName];
      
      if (!preset) {
        console.warn(`[LumaAnimate] Preset "${presetName}" not found`);
        return;
      }
      
      const props = { ...preset };
      const animOptions = { ...props, ...options };
      delete animOptions.transform;
      delete animOptions.opacity;
      
      const animProps = {};
      if (preset.transform) animProps.transform = preset.transform;
      if (preset.opacity !== undefined) animProps.opacity = preset.opacity;
      
      return new Animation(el, animProps, animOptions).start();
    },
    
    // Utility functions
    killAll: () => {
      document.querySelectorAll('[data-luma-animated]').forEach(el => {
        el.style.transition = '';
        el.style.animation = '';
      });
    },
    
    // Easing
    easing: Easing,
    
    // Presets
    presets: Presets,
    
    // Version
    version: '0.2.1'
  };

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = LumaAnimate;
  } else {
    global.LumaAnimate = LumaAnimate;
  }

})(typeof window !== 'undefined' ? window : globalThis);
