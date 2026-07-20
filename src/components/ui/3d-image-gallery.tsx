"use client";

import React, { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Plane, Sphere } from "@react-three/drei";
import { useTransitionNavigate } from "@/components/chrome/Transition";

/* La galerie 3D des projets — c'est la page /projets.
   Une carte par film livré, en orbite dans un champ de braises sur
   basalte. Le clic emmène directement sur la fiche du projet, via la
   transition rideau du site. Zoom molette désactivé : la molette
   appartient au scroll de la page. */

export type CarteProjet = {
  slug: string;
  imageUrl: string;
  alt: string;
  titre: string;
  meta: string;
};

/* Champ de braises : des points chauds en dérive lente. */
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
}: {
  carte: CarteProjet;
  position: [number, number, number];
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
      <Plane
        args={[7.5, 6]}
        onClick={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "auto";
          navigate(`/projets/${carte.slug}`);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <meshBasicMaterial transparent opacity={0} />
      </Plane>

      <Html
        transform
        distanceFactor={10}
        position={[0, 0, 0.01]}
        style={{
          transition: "transform 0.3s var(--ease-braise)",
          transform: hovered ? "scale(1.08)" : "scale(1)",
          pointerEvents: "none",
        }}
      >
        <div
          className="w-72 select-none overflow-hidden p-2"
          style={{
            background: "var(--color-basalte-2)",
            border: hovered
              ? "1px solid var(--color-braise-vive)"
              : "1px solid var(--color-filet)",
            boxShadow: hovered
              ? "0 0 40px color-mix(in srgb, var(--color-braise) 45%, transparent)"
              : "0 20px 40px rgba(0, 0, 0, 0.55)",
            transition: "box-shadow 0.3s var(--ease-braise), border-color 0.3s",
          }}
        >
          <img
            src={carte.imageUrl}
            alt={carte.alt}
            className="aspect-video w-full object-cover"
            loading="lazy"
            draggable={false}
          />
          <div className="px-1 pb-1 pt-3">
            <p
              className="voix-display truncate"
              style={{ color: "var(--color-pierre)", fontSize: "1rem" }}
            >
              {carte.titre}
            </p>
            <p
              className="voix-mono mt-1.5"
              style={{ color: hovered ? "var(--color-braise-vive)" : "var(--color-bronze)", fontSize: "0.5625rem" }}
            >
              {carte.meta}
            </p>
            <p
              className="voix-mono mt-2"
              style={{
                color: "var(--color-gris-pierre)",
                fontSize: "0.5625rem",
                opacity: hovered ? 1 : 0,
                transition: "opacity 0.25s",
              }}
            >
              VOIR LA FICHE →
            </p>
          </div>
        </div>
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

  return (
    <div
      className="relative h-svh w-full overflow-hidden"
      style={{ background: "var(--color-basalte)" }}
    >
      <Canvas
        camera={{ position: [0, 0, 16], fov: 60 }}
        className="absolute inset-0"
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <ChampDeBraises />

          {/* Les cercles du temple : sphères filaires concentriques. */}
          <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
            <meshBasicMaterial color="#96794c" transparent opacity={0.14} wireframe />
          </Sphere>
          <Sphere args={[12, 32, 32]} position={[0, 0, 0]}>
            <meshBasicMaterial color="#96794c" transparent opacity={0.05} wireframe />
          </Sphere>
          <Sphere args={[17, 32, 32]} position={[0, 0, 0]}>
            <meshBasicMaterial color="#c2551e" transparent opacity={0.035} wireframe />
          </Sphere>

          {cartes.map((c, i) => (
            <CarteFlottante key={c.slug + i} carte={c} position={positions[i]} />
          ))}

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            enableRotate
            autoRotate
            autoRotateSpeed={0.4}
            rotateSpeed={0.5}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
        <p className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
          GLISSEZ POUR ORBITER · CLIQUEZ UN PROJET POUR OUVRIR SA FICHE
        </p>
      </div>
    </div>
  );
}
