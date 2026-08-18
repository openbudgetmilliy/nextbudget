'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AmbientLight,
  CylinderGeometry,
  DirectionalLight,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from 'three';

import styles from './page.module.css';

/**
 * Oltin tanga yomg'iri — manba: files/11-dostpul-referral.html.
 *
 * 110 ta tanga bitta `InstancedMesh`da (bitta draw call — 110 alohida
 * mesh emas), sekin pastga tushadi va o'z o'qida aylanadi; butun sahna
 * sichqoncha harakatiga qarab yengil buriladi. Ekrandan chiqqan tanga
 * yuqoriga qaytadi — yomg'ir hech qachon tugamaydi.
 *
 * Ikki chekinish yo'li HAR DOIM hisobga olinadi:
 *   — WebGL yaratib bo'lmasa (eski qurilma, driver muammosi): canvas olib
 *     tashlanadi, `page.module.css` dagi `.bgFixedNoGl` sekin rang
 *     siljishi fonni band qiladi.
 *   — `prefers-reduced-motion: reduce`: sahna BIR MARTA chiziladi (tanga
 *     boshlang'ich tasodifiy joylarida ko'rinadi), lekin animatsiya
 *     tsikli boshlanmaydi.
 */
export default function CoinRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [noGl, setNoGl] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      setNoGl(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new Scene();
    const cam = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    cam.position.set(0, 0, 11);

    scene.add(new AmbientLight(0x556655, 0.9));
    const dirLight = new DirectionalLight(0xffffff, 0.95);
    dirLight.position.set(3, 6, 5);
    scene.add(dirLight);
    const pointLight = new PointLight(0xffd27a, 0.8, 40);
    pointLight.position.set(0, 2, 7);
    scene.add(pointLight);

    const COUNT = 110;
    const geometry = new CylinderGeometry(1, 1, 0.16, 26);
    const material = new MeshStandardMaterial({ color: 0xf5c242, metalness: 0.85, roughness: 0.32 });
    const mesh = new InstancedMesh(geometry, material, COUNT);
    scene.add(mesh);

    const dummy = new Object3D();
    const coins = Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 19,
      y: Math.random() * 22 - 10,
      z: (Math.random() - 0.5) * 7 - 1,
      scale: 0.22 + Math.random() * 0.3,
      fall: 0.028 + Math.random() * 0.045,
      rx: Math.random() * 6,
      rz: Math.random() * 6,
      vrx: (Math.random() - 0.5) * 0.05,
      vrz: (Math.random() - 0.5) * 0.05,
    }));

    let mouseX = 0;
    const onPointerMove = (e: PointerEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.35;
    };
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      cam.aspect = window.innerWidth / window.innerHeight;
      cam.updateProjectionMatrix();
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', onResize);
    renderer.setSize(window.innerWidth, window.innerHeight);

    let raf = 0;
    function tick() {
      for (let i = 0; i < coins.length; i++) {
        const c = coins[i];
        c.y -= c.fall;
        c.rx += c.vrx;
        c.rz += c.vrz;
        if (c.y < -12) {
          c.y = 11 + Math.random() * 4;
          c.x = (Math.random() - 0.5) * 19;
        }
        dummy.position.set(c.x, c.y, c.z);
        dummy.rotation.set(c.rx, 0, c.rz);
        dummy.scale.setScalar(c.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      scene.rotation.y += (mouseX - scene.rotation.y) * 0.04;
      renderer.render(scene, cam);
      if (!reduced) raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  if (noGl) return <div className={styles.bgFixedNoGl} aria-hidden />;

  return <canvas ref={canvasRef} className={styles.coinsCanvas} aria-hidden />;
}
