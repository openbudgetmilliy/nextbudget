'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AmbientLight,
  BoxGeometry,
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

type Piece = {
  bx: number;
  y: number;
  z: number;
  scale: number;
  fall: number;
  rx: number;
  ry: number;
  rz: number;
  vrx: number;
  vry: number;
  vrz: number;
  phase: number;
  amp: number;
};

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }, () => ({
    bx: (Math.random() - 0.5) * 22,
    y: Math.random() * 24 - 11,
    z: (Math.random() - 0.5) * 8 - 1,
    scale: 0.3 + Math.random() * 0.45,
    fall: 0.024 + Math.random() * 0.04,
    rx: Math.random() * 6,
    ry: Math.random() * 6,
    rz: Math.random() * 6,
    vrx: (Math.random() - 0.5) * 0.04,
    vry: (Math.random() - 0.5) * 0.04,
    vrz: (Math.random() - 0.5) * 0.04,
    phase: Math.random() * 6,
    amp: 0.5 + Math.random() * 0.9,
  }));
}

/**
 * Pul yomg'iri — manba: files/14-barakat-referral.html.
 *
 * Ikki instansed mesh bir sahnada: yashil banknota (`BoxGeometry`) va
 * oltin tanga (`CylinderGeometry`), ikkalasi ham pastga tushayotib
 * yon tomonga sinusoidal tebranadi (`Math.sin` bilan) — manbadagi "og'ish"
 * effekti, oddiy tik tushishdan farqli. Sahna sichqoncha harakatiga qarab
 * yengil buriladi.
 *
 * Ikki chekinish yo'li HAR DOIM hisobga olinadi (manbadagi kabi):
 *   — WebGL yaratib bo'lmasa: canvas olib tashlanadi, `.bgFixedNoGl`
 *     sekin rang siljishi fonni band qiladi.
 *   — `prefers-reduced-motion: reduce`: sahna BIR MARTA chiziladi, tsikl
 *     boshlanmaydi.
 */
export default function MoneyRain() {
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
    cam.position.set(0, 0, 12);

    scene.add(new AmbientLight(0x446655, 0.95));
    const dirLight = new DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(3, 6, 5);
    scene.add(dirLight);
    const pointLight = new PointLight(0x7beac0, 0.7, 40);
    pointLight.position.set(-3, 2, 6);
    scene.add(pointLight);

    const NOTE_COUNT = 46;
    const noteGeo = new BoxGeometry(2.3, 1.1, 0.03);
    const noteMat = new MeshStandardMaterial({ color: 0x2ebd84, metalness: 0.15, roughness: 0.75 });
    const notes = new InstancedMesh(noteGeo, noteMat, NOTE_COUNT);
    scene.add(notes);

    const COIN_COUNT = 46;
    const coinGeo = new CylinderGeometry(1, 1, 0.15, 22);
    const coinMat = new MeshStandardMaterial({ color: 0xf2c14e, metalness: 0.85, roughness: 0.32 });
    const coins = new InstancedMesh(coinGeo, coinMat, COIN_COUNT);
    scene.add(coins);

    const dummy = new Object3D();
    const noteData = makePieces(NOTE_COUNT);
    const coinData = makePieces(COIN_COUNT).map((p) => ({ ...p, scale: p.scale * 0.6 }));

    let mouseX = 0;
    let t = 0;
    const onPointerMove = (e: PointerEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.3;
    };
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      cam.aspect = window.innerWidth / window.innerHeight;
      cam.updateProjectionMatrix();
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', onResize);
    renderer.setSize(window.innerWidth, window.innerHeight);

    function step(mesh: InstancedMesh, data: Piece[]) {
      for (let i = 0; i < data.length; i++) {
        const p = data[i];
        p.y -= p.fall;
        p.rx += p.vrx;
        p.ry += p.vry;
        p.rz += p.vrz;
        if (p.y < -13) {
          p.y = 12 + Math.random() * 4;
          p.bx = (Math.random() - 0.5) * 22;
        }
        dummy.position.set(p.bx + Math.sin(t * 0.7 + p.phase) * p.amp, p.y, p.z);
        dummy.rotation.set(p.rx, p.ry, p.rz);
        dummy.scale.setScalar(p.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }

    let raf = 0;
    function tick() {
      t += 0.016;
      step(notes, noteData);
      step(coins, coinData);
      scene.rotation.y += (mouseX - scene.rotation.y) * 0.04;
      renderer.render(scene, cam);
      if (!reduced) raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      noteGeo.dispose();
      noteMat.dispose();
      coinGeo.dispose();
      coinMat.dispose();
      renderer.dispose();
    };
  }, []);

  if (noGl) return <div className={styles.bgFixedNoGl} aria-hidden />;

  return <canvas ref={canvasRef} className={styles.moneyCanvas} aria-hidden />;
}
