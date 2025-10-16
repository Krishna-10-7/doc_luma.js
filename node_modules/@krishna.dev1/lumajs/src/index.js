/*!
 * LumaJS v0.1.0 - React-like Framework
 * Component-based reactive UI library
 * @license MIT
 */
(function(global) {
  'use strict';

  // ==================== REACTIVITY CORE ====================
  
  let currentComponent = null;
  let currentHookIndex = 0;
  const effectStack = [];
  let activeEffect = null;

  function createReactive(initialValue) {
    const subscribers = new Set();
    let value = initialValue;

    return {
      get value() {
        if (activeEffect) {
          subscribers.add(activeEffect);
        }
        return value;
      },
      set value(newValue) {
        if (value !== newValue) {
          value = newValue;
          subscribers.forEach(effect => effect());
        }
      },
      _subscribers: subscribers
    };
  }

  // ==================== HOOKS SYSTEM ====================
  
  function useState(initialValue) {
    if (!currentComponent) {
      throw new Error('useState must be called inside a component');
    }

    const component = currentComponent;
    const hookIndex = currentHookIndex++;

    if (!component._hooks[hookIndex]) {
      const state = createReactive(
        typeof initialValue === 'function' ? initialValue() : initialValue
      );
      
      component._hooks[hookIndex] = {
        type: 'state',
        state
      };
    }

    const hook = component._hooks[hookIndex];
    const setState = (newValue) => {
      const nextValue = typeof newValue === 'function' 
        ? newValue(hook.state.value) 
        : newValue;
      
      if (hook.state.value !== nextValue) {
        hook.state.value = nextValue;
        scheduleRender(component);
      }
    };

    return [hook.state.value, setState];
  }

  function useEffect(callback, deps) {
    if (!currentComponent) {
      throw new Error('useEffect must be called inside a component');
    }

    const component = currentComponent;
    const hookIndex = currentHookIndex++;

    const hasNoDeps = !deps;
    const hasChanged = !component._hooks[hookIndex] || 
      !deps || 
      !component._hooks[hookIndex].deps ||
      deps.some((dep, i) => dep !== component._hooks[hookIndex].deps[i]);

    if (hasNoDeps || hasChanged) {
      if (component._hooks[hookIndex]?.cleanup) {
        component._hooks[hookIndex].cleanup();
      }

      component._effects.push(() => {
        const cleanup = callback();
        if (component._hooks[hookIndex]) {
          component._hooks[hookIndex].cleanup = cleanup;
        }
      });
    }

    component._hooks[hookIndex] = {
      type: 'effect',
      deps: deps ? [...deps] : undefined,
      cleanup: component._hooks[hookIndex]?.cleanup
    };
  }

  function useRef(initialValue) {
    if (!currentComponent) {
      throw new Error('useRef must be called inside a component');
    }

    const component = currentComponent;
    const hookIndex = currentHookIndex++;

    if (!component._hooks[hookIndex]) {
      component._hooks[hookIndex] = {
        type: 'ref',
        current: initialValue
      };
    }

    return component._hooks[hookIndex];
  }

  function useMemo(factory, deps) {
    if (!currentComponent) {
      throw new Error('useMemo must be called inside a component');
    }

    const component = currentComponent;
    const hookIndex = currentHookIndex++;

    const hasNoDeps = !deps;
    const hasChanged = !component._hooks[hookIndex] ||
      !deps ||
      !component._hooks[hookIndex].deps ||
      deps.some((dep, i) => dep !== component._hooks[hookIndex].deps[i]);

    if (hasNoDeps || hasChanged) {
      const value = factory();
      component._hooks[hookIndex] = {
        type: 'memo',
        value,
        deps: deps ? [...deps] : undefined
      };
      return value;
    }

    return component._hooks[hookIndex].value;
  }

  function useCallback(callback, deps) {
    return useMemo(() => callback, deps);
  }

  // ==================== VIRTUAL DOM ====================
  
  function h(type, props, ...children) {
    const flatChildren = children.flat(Infinity).filter(child => 
      child !== null && child !== undefined && child !== false
    );

    return {
      type,
      props: props || {},
      children: flatChildren.map(child => 
        typeof child === 'object' && child !== null && 'type' in child
          ? child
          : { type: 'TEXT', props: {}, children: [], text: String(child) }
      )
    };
  }

  // ==================== RENDERING ====================
  
  function createElement(vnode) {
    if (vnode.type === 'TEXT') {
      return document.createTextNode(vnode.text || '');
    }

    if (typeof vnode.type === 'function') {
      // Component
      const component = createComponentInstance(vnode.type, vnode.props);
      return component._dom;
    }

    // Regular DOM element
    const el = document.createElement(vnode.type);

    // Set props
    Object.entries(vnode.props || {}).forEach(([key, value]) => {
      if (key.startsWith('on') && typeof value === 'function') {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, value);
      } else if (key === 'className') {
        el.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(el.style, value);
      } else if (key !== 'children') {
        el.setAttribute(key, value);
      }
    });

    // Append children
    vnode.children.forEach(child => {
      el.appendChild(createElement(child));
    });

    return el;
  }

  function createComponentInstance(Component, props) {
    const instance = {
      Component,
      props,
      _hooks: [],
      _effects: [],
      _dom: null,
      _vnode: null,
      _mounted: false
    };

    renderComponent(instance);
    return instance;
  }

  function renderComponent(instance) {
    currentComponent = instance;
    currentHookIndex = 0;
    instance._effects = [];

    const vnode = instance.Component(instance.props);
    instance._vnode = vnode;

    const newDom = createElement(vnode);
    
    if (instance._dom) {
      instance._dom.replaceWith(newDom);
    }
    
    instance._dom = newDom;
    currentComponent = null;

    // Run effects after render
    if (instance._mounted) {
      instance._effects.forEach(effect => effect());
    } else {
      // First mount - schedule effects
      Promise.resolve().then(() => {
        instance._mounted = true;
        instance._effects.forEach(effect => effect());
      });
    }
  }

  const renderQueue = new Set();
  let isScheduled = false;

  function scheduleRender(component) {
    renderQueue.add(component);
    if (!isScheduled) {
      isScheduled = true;
      Promise.resolve().then(() => {
        isScheduled = false;
        const components = Array.from(renderQueue);
        renderQueue.clear();
        components.forEach(comp => renderComponent(comp));
      });
    }
  }

  // ==================== RENDER TO DOM ====================
  
  function render(vnode, container) {
    const containerEl = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!containerEl) {
      throw new Error('[Luma] Container not found');
    }

    containerEl.innerHTML = '';
    containerEl.appendChild(createElement(vnode));
  }

  // ==================== FRAGMENT ====================
  
  function Fragment(props) {
    return h('div', { style: { display: 'contents' } }, props.children);
  }

  // ==================== PUBLIC API ====================
  
  const Luma = {
    // Core
    h,
    render,
    Fragment,
    
    // Hooks
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
    
    // Utilities
    createElement,
    
    // Version
    version: '0.1.0'
  };

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Luma;
  } else {
    global.Luma = Luma;
  }

})(typeof window !== 'undefined' ? window : globalThis);
