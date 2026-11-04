import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function Scene() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); }
    catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 20);
    camera.position.z = 6;
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 5);
    key.position.set(-2, 3, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0xb096ff, 4);
    rim.position.set(3, -1, 2); scene.add(rim);
    const group = new THREE.Group();
    scene.add(group);
    const metal = new THREE.MeshStandardMaterial({ color: 0xc9d1c0, metalness: .65, roughness: .24 });
    const lime = new THREE.MeshStandardMaterial({ color: 0xc6ff00, emissive: 0x5a7000, emissiveIntensity: .4, roughness: .3 });
    const shape = new THREE.Shape();
    shape.moveTo(-.09, .32); shape.lineTo(-.17, .76); shape.lineTo(0, 1.48); shape.lineTo(.17, .76); shape.lineTo(.09, .32); shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: .13, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .025, bevelThickness: .025 });
    for (let i = 0; i < 8; i++) {
      const blade = new THREE.Mesh(geometry, metal);
      blade.rotation.z = i * Math.PI / 4;
      group.add(blade);
    }
    const ringGeometry = new THREE.TorusGeometry(1.7, .018, 8, 96);
    const ring = new THREE.Mesh(ringGeometry, lime); group.add(ring);
    const coreGeometry = new THREE.OctahedronGeometry(.25);
    const core = new THREE.Mesh(coreGeometry, lime); group.add(core);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, visible = true, elapsed = 0, previous = 0, targetX = 0, targetY = 0;
    const draw = () => renderer.render(scene, camera);
    const animate = (now: number) => {
      const dt = previous ? Math.min((now - previous) / 1000, .05) : 0;
      previous = now; elapsed += dt;
      group.rotation.x += (.18 + targetY * .3 - group.rotation.x) * .06;
      group.rotation.y += (-.25 + Math.sin(elapsed * .45) * .22 + targetX * .4 - group.rotation.y) * .06;
      group.rotation.z = elapsed * .085;
      core.rotation.y = elapsed * .5;
      draw(); frame = requestAnimationFrame(animate);
    };
    const sync = () => {
      cancelAnimationFrame(frame); previous = 0;
      if (visible && !document.hidden && !motion.matches) frame = requestAnimationFrame(animate);
      else draw();
    };
    const resize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight; camera.updateProjectionMatrix(); draw();
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const b = el.getBoundingClientRect(); targetX = (e.clientX - b.left) / b.width - .5; targetY = (e.clientY - b.top) / b.height - .5;
    };
    const leave = () => { targetX = 0; targetY = 0; };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(el);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }); observer.observe(el);
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', sync); motion.addEventListener('change', sync);
    group.rotation.set(.18, -.25, .12); resize(); sync();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); resizeObserver.disconnect();
      el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', sync); motion.removeEventListener('change', sync);
      geometry.dispose(); ringGeometry.dispose(); coreGeometry.dispose(); metal.dispose(); lime.dispose(); renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);
  return <div className="scene" ref={ref} aria-hidden="true" />;
}
