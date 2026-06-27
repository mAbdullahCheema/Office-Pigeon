/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function ThreeHub() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [webGlSupported, setWebGlSupported] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  // PERF-01: throttle activeNode React updates instead of setState-ing every rAF frame
  const activeNodeRef = useRef<string | null>(null);
  const lastActiveUpdateRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 1000); // 1s delay to let page stabilize
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!shouldRender) return;

    // Disable WebGL on mobile devices (width < 768px) to guarantee smooth scrolling and zero lag
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setWebGlSupported(false);
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const support = !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      setWebGlSupported(support);
    } catch {
      setWebGlSupported(false);
    }
  }, [shouldRender]);

  useEffect(() => {
    if (!webGlSupported || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // Detect mobile device width for particle count and size once at mount
    const checkIsMobile = () => window.innerWidth < 768;
    const isMobileDevice = checkIsMobile();

    // SCENE
    const scene = new THREE.Scene();

    // CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    
    // Set initial Z position based on window width
    const updateCameraZ = (cam: THREE.PerspectiveCamera) => {
      const sw = window.innerWidth;
      if (sw < 640) {
        cam.position.z = 7.8; // Zoomed in closer for mobile devices
      } else if (sw >= 640 && sw < 1024) {
        cam.position.z = 8.2; // Zoomed-in for tablet
      } else {
        cam.position.z = 8.5; // Perfect perspective for desktop background
      }
    };
    updateCameraZ(camera);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ 
      antialias: window.devicePixelRatio < 2, 
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'mediump'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ROOT GROUP
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xf97316, 1.8, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const secondaryPointLight = new THREE.PointLight(0xec4899, 1.4, 100);
    secondaryPointLight.position.set(-5, -5, 5);
    scene.add(secondaryPointLight);

    // CENTRAL HUB GEOMETRY - Basic material is extremely fast as it doesn't compute lighting
    const hubGeometry = new THREE.IcosahedronGeometry(1.6, 2);
    const hubMaterial = new THREE.MeshBasicMaterial({
      color: 0x333333,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const hubMesh = new THREE.Mesh(hubGeometry, hubMaterial);
    mainGroup.add(hubMesh);

    // GLOWING INNER SPHERE - Lambert material is much faster on mobile than Phong
    const innerGeometry = new THREE.IcosahedronGeometry(0.8, 1);
    const innerMaterial = new THREE.MeshLambertMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      flatShading: true,
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    mainGroup.add(innerMesh);

    // ORBIT PATH RINGS
    const createOrbitRing = (radius: number, color: THREE.ColorRepresentation, rotationZ = 0) => {
      const ringGeom = new THREE.RingGeometry(radius - 0.02, radius + 0.01, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.1,
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.rotation.y = rotationZ;
      mainGroup.add(ringMesh);
    };

    createOrbitRing(2.45, 0xf97316, 0.2);
    createOrbitRing(3.15, 0xec4899, -0.3);
    createOrbitRing(3.75, 0xf59e0b, 0.5);

    // SATELLITE NODES - Lambert material is much faster on mobile than Phong
    const nodeGroup = new THREE.Group();
    mainGroup.add(nodeGroup);

    const createNode = (radius: number, angle: number, colorId: number, speed: number) => {
      const parent = new THREE.Group();
      
      const geom = new THREE.SphereGeometry(0.3, 16, 16);
      const mat = new THREE.MeshLambertMaterial({
        color: colorId,
        emissive: colorId,
        emissiveIntensity: 0.8,
      });
      const mesh = new THREE.Mesh(geom, mat);
      
      // Position on orbital circle
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle) * 0.3; // slightly inclined
      const z = radius * Math.sin(angle) * 0.9;
      mesh.position.set(x, y, z);
      
      parent.add(mesh);
      
      // Return details for update loops
      return { parent, mesh, radius, angle, speed, initialY: y };
    };

    const nodesData = [
      { id: 'web', label: 'Websites', node: createNode(2.45, 0, 0xf97316, 0.008) },
      { id: 'chat', label: 'Chatbots', node: createNode(3.15, Math.PI * 0.7, 0xec4899, 0.005) },
      { id: 'auto', label: 'Automations', node: createNode(3.75, Math.PI * 1.4, 0xf59e0b, 0.003) }
    ];

    nodesData.forEach(item => {
      nodeGroup.add(item.node.parent);
    });

    // PARTICLE SWARM / FLIGHT PATHS
    const particleCount = isMobileDevice ? 50 : 120;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      const r = 1.7 + Math.random() * 4.1;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.4;
      const z = r * Math.cos(phi);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      particleSpeeds.push(0.01 + Math.random() * 0.02);
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xf97316,
      size: isMobileDevice ? 0.05 : 0.07,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    mainGroup.add(particles);

    // TRACK MOUSE COORDINATES FOR ELASTIC ROTATIONS
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // Cache bounding rect to prevent layout thrashing on mouse/touch moves
    let rect = container.getBoundingClientRect();
    const updateRect = () => {
      if (container) rect = container.getBoundingClientRect();
    };

    const onMouseMove = (event: MouseEvent) => {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      mouseX = (x / rect.width) * 2 - 1;
      mouseY = -(y / rect.height) * 2 + 1;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const x = event.touches[0].clientX - rect.left;
        const y = event.touches[0].clientY - rect.top;
        mouseX = (x / rect.width) * 2 - 1;
        mouseY = -(y / rect.height) * 2 + 1;
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('scroll', updateRect, { passive: true });

    // visibility, animation loop and dynamic FPS tracking
    let animationFrameId: number | null = null;
    let isVisible = false;
    let isIntersecting = false;
    let isTabVisible = !document.hidden;
    let frameCount = 0;
    let lastTime = performance.now();
    let lowFpsCount = 0;

    const animate = (time: number) => {
      if (!isVisible) return;

      // Smooth Lerping movement back to cursor position
      targetX += (mouseX - targetX) * 0.06;
      targetY += (mouseY - targetY) * 0.06;

      // Rotate group accordingly (idle rotation + mouse tracking combined)
      mainGroup.rotation.y = targetX * 0.6 + time * 0.00008;
      mainGroup.rotation.x = -targetY * 0.4;
      
      hubMesh.rotation.y -= 0.001;
      innerMesh.rotation.x += 0.003;

      // Satellite orbital movement
      nodesData.forEach((item, index) => {
        const n = item.node;
        n.angle += n.speed;
        
        const x = n.radius * Math.cos(n.angle);
        const z = n.radius * Math.sin(n.angle) * 0.9;
        const y = n.initialY + Math.sin(time * 0.002 + index) * 0.2;
        
        n.mesh.position.set(x, y, z);
        n.mesh.rotation.x += 0.01;
        n.mesh.rotation.y += 0.02;
      });

      // Animate particle flow
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const xIdx = i * 3;
        const zIdx = i * 3 + 2;
        const x = positions[xIdx];
        const z = positions[zIdx];
        const sp = particleSpeeds[i];

        positions[xIdx] = x * Math.cos(sp) - z * Math.sin(sp);
        positions[zIdx] = x * Math.sin(sp) + z * Math.cos(sp);
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Identify closest orbit node. PERF-01: only push to React state when the
      // value actually changes AND at most ~6x/sec, so the 60fps render loop
      // doesn't trigger a React re-render storm on every frame.
      const currentHighest = nodesData.reduce((prev, curr) => {
        return curr.node.mesh.position.z > prev.node.mesh.position.z ? curr : prev;
      });
      const nextActive = currentHighest.node.mesh.position.z > 2 ? currentHighest.id : null;
      if (nextActive !== activeNodeRef.current && time - lastActiveUpdateRef.current > 150) {
        activeNodeRef.current = nextActive;
        lastActiveUpdateRef.current = time;
        setActiveNode(nextActive);
      }

      renderer.render(scene, camera);

      // FPS tracking
      frameCount++;
      const now = performance.now();
      const deltaMs = now - lastTime;
      if (deltaMs >= 1000) {
        const fps = (frameCount * 1000) / deltaMs;
        frameCount = 0;
        lastTime = now;

        if (fps < 35) {
          lowFpsCount++;
          if (lowFpsCount >= 3) {
            console.warn('Low FPS detected (' + Math.round(fps) + '), falling back to CSS animation');
            setWebGlSupported(false);
            return; // Exit rendering loop immediately
          }
        } else {
          lowFpsCount = Math.max(0, lowFpsCount - 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Asynchronously compile scene shaders on a background thread before starting render loops
    let compiled = false;
    let compiling = false;

    const startAnimation = () => {
      if (animationFrameId === null && isIntersecting && isTabVisible) {
        if (!compiled) {
          if (compiling) return;
          compiling = true;

          const runCompile = () => {
            if (typeof renderer.compileAsync === 'function') {
              renderer.compileAsync(scene, camera)
                .then(() => {
                  compiled = true;
                  compiling = false;
                  startAnimation();
                })
                .catch((err) => {
                  console.warn('WebGL compileAsync failed, using sync fallback:', err);
                  renderer.compile(scene, camera);
                  compiled = true;
                  compiling = false;
                  startAnimation();
                });
            } else {
              renderer.compile(scene, camera);
              compiled = true;
              compiling = false;
              startAnimation();
            }
          };

          runCompile();
          return;
        }

        isVisible = true;
        lastTime = performance.now();
        frameCount = 0;
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    const stopAnimation = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        isVisible = false;
      }
    };

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        startAnimation();
      } else {
        stopAnimation();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // INTERSECTION OBSERVER TO PAUSE ANIMATION WHEN CANVAS OFFSCREEN
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // RESIZE HANDLING - Smooth update without recreation
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      updateCameraZ(camera);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      updateRect();
    };

    window.addEventListener('resize', handleResize);

    // CLEANUP
    return () => {
      stopAnimation();
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('scroll', updateRect);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      hubGeometry.dispose();
      hubMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, [webGlSupported]);

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none font-sans">
      {/* 3D Render viewport box */}
      <div className="relative w-full h-[360px] md:h-[480px] lg:h-full lg:min-h-[620px] flex items-center justify-center">
        {/* Background Decorative Auras - Tailwind CSS glow replacement using radial gradients */}
        <div style={{ willChange: 'transform', transform: 'translate3d(0,0,0)', background: 'radial-gradient(circle, rgba(253, 186, 116, 0.10) 0%, transparent 70%)' }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full opacity-25" />
        <div style={{ willChange: 'transform', transform: 'translate3d(0,0,0)', background: 'radial-gradient(circle, rgba(244, 63, 94, 0.10) 0%, transparent 70%)' }} className="absolute top-[40%] left-[60%] w-[50%] h-[50%] rounded-full opacity-20" />

        {/* THREEJS CANVAS MOUNT */}
        {webGlSupported ? (
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing transition-opacity duration-700" id="threejs-canvas-hub" />
        ) : (
          /* ELEGANT CSS INTERACTIVE FALLBACK FOR LOW-END DEVICES / WITHOUT WEBGL SUPPORT */
          <div className="w-full h-full flex flex-col items-center justify-center relative p-6 animate-pulse" id="threejs-fallback-hub">
            <div className="relative w-48 h-48 bg-orange-50/50 border border-orange-100/50 rounded-full flex items-center justify-center shadow-lg shadow-orange-50/20">
              <div className="absolute inset-2 border-2 border-dashed border-orange-200/50 rounded-full animate-spin [animation-duration:15s]" />
              <div className="absolute inset-8 border border-rose-100/30 rounded-full animate-reverse-spin [animation-duration:8s]" />
              <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-rose-500 opacity-80 rounded-full flex items-center justify-center p-3 shadow-md">
                <img src="/logos/office-pigeon-icon.svg" alt="Office Pigeon" className="h-full w-full" />
              </div>
            </div>
            <p className="mt-6 text-xs text-gray-400 text-center uppercase tracking-widest font-mono">Interactive Hub Simulator Active</p>
          </div>
        )}

        {/* OVERLAY DYNAMIC NODE HIGHLIGHT SIGNALS (DESKTOP & TABLET ONLY) */}
        <div className="hidden sm:flex absolute left-4 bottom-4 flex-col gap-2 pointer-events-none md:left-6 md:bottom-6 lg:left-[16%] xl:left-[22%] lg:bottom-12 xl:bottom-14">
          <div className="flex items-center gap-2 transition-all duration-300">
            <span className={`w-2.5 h-2.5 rounded-full transition-colors ${activeNode === 'web' ? 'bg-orange-500 animate-pulse' : 'bg-gray-200'}`} />
            <span className={`font-mono text-[10px] tracking-wider uppercase font-bold transition-opacity ${activeNode === 'web' ? 'text-gray-900' : 'text-gray-400'}`}>Website Hub</span>
          </div>
          <div className="flex items-center gap-2 transition-all duration-300">
            <span className={`w-2.5 h-2.5 rounded-full transition-colors ${activeNode === 'chat' ? 'bg-rose-500 animate-pulse' : 'bg-gray-200'}`} />
            <span className={`font-mono text-[10px] tracking-wider uppercase font-bold transition-opacity ${activeNode === 'chat' ? 'text-gray-900' : 'text-gray-400'}`}>Chatbot Engine</span>
          </div>
          <div className="flex items-center gap-2 transition-all duration-300">
            <span className={`w-2.5 h-2.5 rounded-full transition-colors ${activeNode === 'auto' ? 'bg-amber-500 animate-pulse' : 'bg-gray-200'}`} />
            <span className={`font-mono text-[10px] tracking-wider uppercase font-bold transition-opacity ${activeNode === 'auto' ? 'text-gray-900' : 'text-gray-400'}`}>Workflow Relay</span>
          </div>
        </div>

        {/* HELPFUL INTERACTION HINT (DESKTOP & TABLET ONLY) */}
        <div className="hidden sm:block absolute right-4 bottom-4 md:right-6 md:bottom-6 bg-[#F0EEEA]/90 backdrop-blur-xs px-3.5 py-2 border border-black/5 rounded-full text-[9px] text-gray-500 uppercase tracking-widest font-mono pointer-events-none font-bold">
          Move mouse to orbit
        </div>
      </div>

      {/* MOBILE ONLY OVERLAY LAYOUT UNDER LAYOUT (PREVENTS COLLISION ON TIGHT RESPONSIVE VIEWS) */}
      <div className="sm:hidden flex flex-col items-center gap-3 w-full px-4 pt-4 border-t border-black/5 mt-2">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full transition-colors ${activeNode === 'web' ? 'bg-orange-500 animate-pulse' : 'bg-gray-250'}`} />
            <span className={`font-mono text-[9px] tracking-wider uppercase font-bold ${activeNode === 'web' ? 'text-gray-900' : 'text-gray-400'}`}>Website Hub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full transition-colors ${activeNode === 'chat' ? 'bg-rose-500 animate-pulse' : 'bg-gray-250'}`} />
            <span className={`font-mono text-[9px] tracking-wider uppercase font-bold ${activeNode === 'chat' ? 'text-gray-900' : 'text-gray-400'}`}>Chatbot Engine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full transition-colors ${activeNode === 'auto' ? 'bg-amber-500 animate-pulse' : 'bg-gray-250'}`} />
            <span className={`font-mono text-[9px] tracking-wider uppercase font-bold ${activeNode === 'auto' ? 'text-gray-900' : 'text-gray-400'}`}>Workflow Relay</span>
          </div>
        </div>
        <div className="bg-[#F0EEEA] px-3 py-1.5 border border-black/5 rounded-full text-[8px] text-gray-500 uppercase tracking-widest font-mono pointer-events-none font-bold">
          Move mouse to orbit
        </div>
      </div>
    </div>
  );
}
