"use client";

import React, { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Sphere } from "@react-three/drei";
import { useTransitionNavigate } from "@/components/chrome/Transition";

/* L'environnement 3D des projets — c'est la page /projets entière.
   Une carte par film livré, en orbite dans un champ de braises sur
   basalte. Les cartes sont de vrais éléments DOM (drei Html) : le clic
   est un clic DOM natif, fiable, qui ouvre la fiche via la transition
   rideau. Zoom molette désactivé, rotation auto lente, drag pour orbiter. */

export type CarteProjet = {
  slug: string;
  imageUrl: string;
  alt: string;
  titre: string;
  meta: string;
};

function ChampDeBraises() {
  const points = useRef<THREE.Points>(null);

  const geometrie = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 2500;
    const positions = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300;
    }
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  useFrame(() => {
    if (points.current) {
      points.current.rotation.y += 0.0001;
      points.current.rotation.x += 0.00004;
    }
  });

  return (
    <points ref={points} geometry={geometrie}>
      <pointsMaterial color="#c2551e" size={0.5} sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

function CarteFlottante({
  carte,
  position,
  occulteurs,
}: {
  carte: CarteProjet;
  position: [number, number, number];
  occulteurs: React.RefObject<THREE.Object3D>[];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const navigate = useTransitionNavigate();

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Html
        transform
        distanceFactor={10}
        position={[0, 0, 0]}
        occlude={occulteurs}
        style={{ transition: "opacity 0.25s" }}
      >
        {/* Clic DOM natif : fiable, accessible, pas de raycast. */}
        <button
          type="button"
          data-cursor
          onClick={() => navigate(`/projets/${carte.slug}`)}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          aria-label={`Ouvrir la fiche du projet ${carte.titre}`}
          className="block w-72 select-none overflow-hidden p-2 text-left"
          style={{
            background: "var(--color-basalte-2)",
            border: hovered
              ? "1px solid var(--color-braise-vive)"
              : "1px solid var(--color-filet)",
            boxShadow: hovered
              ? "0 0 40px color-mix(in srgb, var(--color-braise) 45%, transparent)"
              : "0 20px 40px rgba(0, 0, 0, 0.55)",
            transform: hovered ? "scale(1.06)" : "scale(1)",
            transition:
              "transform 0.3s var(--ease-braise), box-shadow 0.3s var(--ease-braise), border-color 0.3s",
          }}
        >
          <img
            src={carte.imageUrl}
            alt={carte.alt}
            className="pointer-events-none aspect-video w-full object-cover"
            loading="lazy"
            draggable={false}
          />
          <span className="block px-1 pb-1 pt-3">
            <span
              className="voix-display block truncate"
              style={{ color: "var(--color-pierre)", fontSize: "1rem" }}
            >
              {carte.titre}
            </span>
            <span
              className="voix-mono mt-1.5 block"
              style={{
                color: hovered ? "var(--color-braise-vive)" : "var(--color-bronze)",
                fontSize: "0.5625rem",
              }}
            >
              {carte.meta}
            </span>
            <span
              className="voix-mono mt-2 block"
              style={{
                color: "var(--color-gris-pierre)",
                fontSize: "0.5625rem",
                opacity: hovered ? 1 : 0,
                transition: "opacity 0.25s",
              }}
            >
              VOIR LA FICHE →
            </span>
          </span>
        </button>
      </Html>
    </group>
  );
}

/* Trois projets : triangle en orbite. Au-delà : spirale dorée. */
function positionsPour(n: number): [number, number, number][] {
  if (n <= 3) {
    const base: [number, number, number][] = [
      [10, 1.2, 0],
      [-5, -0.8, 8.66],
      [-5, 0.6, -8.66],
    ];
    return base.slice(0, n);
  }
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = (2 * Math.PI * i) / goldenRatio;
    const layer = 12 + (i % 3) * 4;
    return [Math.cos(theta) * r * layer, y * layer, Math.sin(theta) * r * layer];
  });
}

export default function GaleriePlans({ cartes }: { cartes: CarteProjet[] }) {
  const positions = useMemo(() => positionsPour(cartes.length), [cartes.length]);
  const noyau = useRef<THREE.Mesh>(null);

  return (
    <div className="absolute inset-0" style={{ background: "var(--color-basalte)" }}>
      <Canvas camera={{ position: [0, 0, 16], fov: 60 }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <ChampDeBraises />

          {/* Le noyau : un corps solide basalte — il occulte les cartes
             qui passent derrière lui. Le filaire bronze l'habille. */}
          <Sphere ref={noyau} args={[2, 48, 48]} position={[0, 0, 0]}>
            <meshBasicMaterial color="#1b1f26" />
          </Sphere>
          <Sphere args={[2.02, 32, 32]} position={[0, 0, 0]}>
            <meshBasicMaterial color="#96794c" transparent opacity={0.2} wireframe />
          </Sphere>
          <Sphere args={[12, 32, 32]} position={[0, 0, 0]}>
            <meshBasicMaterial color="#96794c" transparent opacity={0.05} wireframe />
          </Sphere>
          <Sphere args={[17, 32, 32]} position={[0, 0, 0]}>
            <meshBasicMaterial color="#c2551e" transparent opacity={0.035} wireframe />
          </Sphere>

          {cartes.map((c, i) => (
            <CarteFlottante
              key={c.slug + i}
              carte={c}
              position={positions[i]}
              occulteurs={[noyau as unknown as React.RefObject<THREE.Object3D>]}
            />
          ))}

          <OrbitControls
            enablePan={false}
            enableZoom
            minDistance={7}
            maxDistance={32}
            zoomSpeed={0.9}
            enableRotate
            autoRotate
            autoRotateSpeed={0.4}
            rotateSpeed={0.5}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
