"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Sphere } from "@react-three/drei";
import { useRouter } from "next/navigation";

/* L'environnement 3D des projets. Champ de braises rondes (shader), un
   marqueur-étincelle par projet qui révèle sa carte au survol, et un
   « voyage dans les braises » au clic vers la fiche. */

export type CarteProjet = {
  slug: string;
  imageUrl: string;
  alt: string;
  titre: string;
  /* Les photos du projet, pour le montage qui défile dans les lettres. */
  photos?: string[];
  /* Affiché uniquement dans la liste de repli (reduced-motion / mobile). */
  meta?: string;
};

/* —————————————————— Champ de braises (shader) —————————————————— */

const VERT = `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aPhase;
  uniform float uTime;
  uniform float uBoost;
  varying vec3 vColor;
  varying float vTw;
  void main() {
    vColor = aColor;
    float tw = 0.55 + 0.45 * sin(uTime * 1.4 + aPhase);
    vTw = tw;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = min(aSize * uBoost * (0.7 + 0.5 * tw) * (185.0 / -mv.z), 34.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = `
  varying vec3 vColor;
  varying float vTw;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a = pow(a, 1.7);
    vec3 c = vColor * (0.5 + 0.9 * vTw);
    gl_FragColor = vec4(c, a);
  }
`;

const PALETTE = [
  new THREE.Color("#c2551e"),
  new THREE.Color("#e8863c"),
  new THREE.Color("#96794c"),
  new THREE.Color("#f0c48a"),
];

function ChampDeBraises({ boost }: { boost: React.RefObject<number> }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const groupe = useRef<THREE.Points>(null);

  const geometrie = useMemo(() => {
    const n = 2600;
    const positions = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);
    const sizes = new Float32Array(n);
    const phases = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 340;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 340;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 340;
      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      sizes[i] = 1.1 + Math.random() * 2.6;
      phases[i] = Math.random() * Math.PI * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uBoost: { value: 1 } }),
    [],
  );

  useFrame((_, dt) => {
    uniforms.uTime.value += dt;
    /* Rampe le boost + expansion des braises pendant le warp
       (elles fusent vers l'extérieur, effet vitesse-lumière). */
    const cible = boost.current ?? 1;
    const rush = cible > 1;
    uniforms.uBoost.value += (cible - uniforms.uBoost.value) * Math.min(1, dt * 5);
    const g = groupe.current;
    if (g) {
      const cibleScale = rush ? 3.2 : 1;
      const s = g.scale.x + (cibleScale - g.scale.x) * Math.min(1, dt * 3.2);
      g.scale.setScalar(s);
      const vitesse = rush ? 0.09 : 0.012;
      g.rotation.y += dt * vitesse;
      g.rotation.x += dt * vitesse * 0.4;
    }
  });

  return (
    <points ref={groupe} geometry={geometrie}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* —————————————————— Le noyau : logo vesta* interactif —————————————————— */

const LETTRES = ["v", "e", "s", "t", "a"];

function LogoNoyau({ cartes }: { cartes: CarteProjet[] }) {
  const groupe = useRef<THREE.Group>(null);
  const cible = useMemo(() => new THREE.Object3D(), []);
  const [survol, setSurvol] = useState<number | null>(null);
  const [frame, setFrame] = useState(0);

  useFrame(({ camera }, delta) => {
    const g = groupe.current;
    if (!g) return;
    cible.position.copy(g.position);
    cible.lookAt(camera.position);
    g.quaternion.slerp(cible.quaternion, 1 - Math.pow(0.0009, delta));
  });

  /* Montage : pendant le survol, les photos du projet se succèdent. */
  useEffect(() => {
    if (survol === null) return;
    setFrame(0);
    const id = window.setInterval(() => setFrame((f) => f + 1), 1200);
    return () => window.clearInterval(id);
  }, [survol]);

  const police: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontStretch: "125%",
    letterSpacing: "-0.01em",
    fontSize: "150px",
    lineHeight: 1,
  };

  const entrer = (i: number) => {
    setSurvol(i);
    document.body.dataset.cursorMute = "true";
  };
  const sortir = (i: number) => {
    setSurvol((s) => (s === i ? null : s));
    delete document.body.dataset.cursorMute;
  };

  return (
    <group ref={groupe}>
      {/* Le logo, en DOM. Deux calques détourés, sans fond : un écho braise
         en retrait, les lettres pierre par-dessus (interactives au survol). */}
      <Html transform distanceFactor={9} position={[0, 0, 0.05]} style={{ pointerEvents: "none" }}>
        <div className="relative select-none" style={{ pointerEvents: "auto" }}>
          {/* Calque écho (braise, décalé) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-baseline"
            style={{ ...police, color: "var(--color-gris-pierre)", opacity: 0.32, transform: "translate(3px, 4px)" }}
          >
            {LETTRES.join("")}
            <span style={{ fontSize: "0.7em" }}>*</span>
          </div>

          {/* Calque avant (pierre, interactif) */}
          <div className="relative flex items-baseline" style={police}>
            {LETTRES.map((lettre, i) => {
              const carte = cartes[i % cartes.length];
              const actif = survol === i;
              const photos = carte?.photos?.length ? carte.photos : carte ? [carte.imageUrl] : [];
              const img = photos.length ? photos[frame % photos.length] : null;
              return (
                <span
                  key={i}
                  onMouseEnter={() => entrer(i)}
                  onMouseLeave={() => sortir(i)}
                  style={
                    actif && img
                      ? {
                          backgroundImage: `url(${img})`,
                          backgroundSize: "auto 132%",
                          backgroundPosition: "50% 0%",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          color: "transparent",
                          animation: "ref-defile 5s ease-in-out infinite alternate",
                          cursor: "none",
                        }
                      : { color: "var(--color-pierre)", transition: "color 0.25s", cursor: "none" }
                  }
                >
                  {lettre}
                </span>
              );
            })}
            <span style={{ color: "var(--color-braise-vive)", fontSize: "0.7em" }}>*</span>
          </div>
        </div>
      </Html>
    </group>
  );
}

/* —————————————————— Marqueur : la carte du projet —————————————————— */

function Marqueur({
  carte,
  position,
  actif,
  onHover,
  onWarp,
}: {
  carte: CarteProjet;
  position: [number, number, number];
  actif: boolean;
  onHover: (slug: string | null) => void;
  onWarp: (p: [number, number, number], slug: string) => void;
}) {
  const groupe = useRef<THREE.Group>(null);
  /* La carte fait face à la caméra en permanence, comme le logo. */
  useFrame(({ camera }) => {
    if (groupe.current) groupe.current.lookAt(camera.position);
  });

  return (
    <group ref={groupe} position={position}>
      <Html transform distanceFactor={13}>
      <button
        type="button"
        data-cursor
        onMouseEnter={() => onHover(carte.slug)}
        onMouseLeave={() => onHover(null)}
        onClick={() => onWarp(position, carte.slug)}
        aria-label={`Ouvrir la fiche du projet ${carte.titre}`}
        className="block w-52 select-none overflow-hidden p-2 text-left"
        style={{
          background: "var(--color-basalte-2)",
          border: actif ? "1px solid var(--color-braise-vive)" : "1px solid var(--color-filet)",
          boxShadow: actif
            ? "0 0 40px color-mix(in srgb, var(--color-braise) 45%, transparent)"
            : "0 20px 40px rgba(0, 0, 0, 0.55)",
          transform: actif ? "scale(1.06)" : "scale(1)",
          transition: "transform 0.3s var(--ease-braise), box-shadow 0.3s var(--ease-braise), border-color 0.3s",
        }}
      >
        <img
          src={carte.imageUrl}
          alt={carte.alt}
          className="pointer-events-none aspect-video w-full object-cover"
          loading="lazy"
          draggable={false}
        />
        <span
          className="voix-mono block truncate px-0.5 pb-0.5 pt-2.5 text-center"
          style={{
            color: actif ? "var(--color-braise-vive)" : "var(--color-gris-pierre)",
            fontSize: "0.5rem",
            letterSpacing: "0.08em",
            transition: "color 0.25s",
          }}
        >
          {carte.titre}
        </span>
      </button>
      </Html>
    </group>
  );
}

/* —————————————————— Le voyage (warp caméra) —————————————————— */

function Warp({ onDone }: { onDone: () => void }) {
  const { camera } = useThree();
  const dir = useRef<THREE.Vector3 | null>(null);
  const dist0 = useRef(0);
  const prog = useRef(0);
  const fini = useRef(false);
  const DUREE = 1.2;

  useFrame((_, dt) => {
    if (fini.current) return;
    if (!dir.current) {
      dir.current = camera.position.clone().normalize();
      dist0.current = camera.position.length();
    }
    prog.current = Math.min(1, prog.current + dt / DUREE);
    const p = prog.current;
    const e = p * p; // accélère : le recul prend de la vitesse
    /* Dézoom : la caméra recule le long de son axe, en visant le centre. */
    const dist = dist0.current + e * 58;
    camera.position.copy(dir.current).multiplyScalar(dist);
    camera.lookAt(0, 0, 0);
    if (p >= 1) {
      fini.current = true;
      onDone();
    }
  });

  return null;
}

/* —————————————————— Caméra responsive —————————————————— */

function CameraRig() {
  const { camera, size } = useThree();
  useEffect(() => {
    const portrait = size.height >= size.width;
    const fov = portrait ? 80 : size.width < 1000 ? 66 : 55;
    const cam = camera as THREE.PerspectiveCamera;
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
  }, [camera, size]);
  return null;
}

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

/* —————————————————— Scène —————————————————— */

export default function GaleriePlans({ cartes }: { cartes: CarteProjet[] }) {
  const positions = useMemo(() => positionsPour(cartes.length), [cartes.length]);
  const [survol, setSurvol] = useState<string | null>(null);
  const [warp, setWarp] = useState<{ slug: string } | null>(null);
  const boost = useRef(1);
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const router = useRouter();

  const lancerWarp = (_p: [number, number, number], slug: string) => {
    if (warp) return;
    boost.current = 6;
    setSurvol(null);
    setWarp({ slug });
  };

  useEffect(() => {
    if (controls.current) controls.current.enabled = !warp;
  }, [warp]);

  return (
    <div className="absolute inset-0" style={{ background: "var(--color-basalte)" }}>
      <Canvas
        camera={{ position: [0, 0, 38], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: warp ? "none" : "auto" }}
      >
        <Suspense fallback={null}>
          <CameraRig />
          <ambientLight intensity={0.5} />
          <ChampDeBraises boost={boost} />
          <LogoNoyau cartes={cartes} />

          {/* Les cercles du temple : sphères filaires concentriques. */}
          <Sphere args={[12, 32, 32]} position={[0, 0, 0]}>
            <meshBasicMaterial color="#96794c" transparent opacity={0.05} wireframe />
          </Sphere>
          <Sphere args={[17, 32, 32]} position={[0, 0, 0]}>
            <meshBasicMaterial color="#c2551e" transparent opacity={0.035} wireframe />
          </Sphere>

          {cartes.map((c, i) => (
            <Marqueur
              key={c.slug + i}
              carte={c}
              position={positions[i]}
              actif={survol === c.slug}
              onHover={setSurvol}
              onWarp={lancerWarp}
            />
          ))}

          {warp ? <Warp onDone={() => router.push(`/projets/${warp.slug}`)} /> : null}

          <OrbitControls
            ref={controls}
            enablePan={false}
            enableZoom
            minDistance={12}
            maxDistance={38}
            zoomSpeed={0.9}
            enableRotate
            autoRotate={survol === null && !warp}
            autoRotateSpeed={0.4}
            rotateSpeed={0.5}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>

      {/* Voile du voyage : la lumière de braise engloutit l'écran. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--color-braise-vive) 70%, transparent) 0%, color-mix(in srgb, var(--color-braise) 30%, transparent) 35%, var(--color-basalte) 72%)",
          opacity: warp ? 1 : 0,
          transition: warp ? "opacity 0.85s ease-in 0.25s" : "opacity 0s",
        }}
      />
    </div>
  );
}
