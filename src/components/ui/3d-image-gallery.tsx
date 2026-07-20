"use client";

import React, {
  Suspense,
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Plane, Sphere } from "@react-three/drei";
import { ArrowRight, X } from "lucide-react";
import { useTransitionNavigate } from "@/components/chrome/Transition";

/* Galerie 3D des plans (base : Stellar Card Gallery, single-file).
   Adaptée à la charte Vesta : braises sur basalte (pas de noir pur,
   pas de cyan), cartes = les plans réels des films, la modale mène à
   la fiche projet. Zoom molette désactivé : la molette appartient au
   scroll de la page. Le fond étoilé d'origine devient un champ de
   braises rendu dans le même Canvas. */

export type CartePlan = {
  id: string;
  imageUrl: string;
  alt: string;
  title: string;
  meta: string;
  slug: string;
};

type CardContextType = {
  selectedCard: CartePlan | null;
  setSelectedCard: (card: CartePlan | null) => void;
  cards: CartePlan[];
};

const CardContext = createContext<CardContextType | undefined>(undefined);

function useCard() {
  const ctx = useContext(CardContext);
  if (!ctx) throw new Error("useCard must be used within CardProvider");
  return ctx;
}

function CardProvider({
  cards,
  children,
}: {
  cards: CartePlan[];
  children: React.ReactNode;
}) {
  const [selectedCard, setSelectedCard] = useState<CartePlan | null>(null);
  return (
    <CardContext.Provider value={{ selectedCard, setSelectedCard, cards }}>
      {children}
    </CardContext.Provider>
  );
}

/* Champ de braises : des points chauds en dérive lente, dans le Canvas. */
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

function FloatingCard({
  card,
  position,
}: {
  card: CartePlan;
  position: { x: number; y: number; z: number };
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { setSelectedCard } = useCard();

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      <Plane
        args={[4.5, 6]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedCard(card);
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
          transform: hovered ? "scale(1.12)" : "scale(1)",
          pointerEvents: "none",
        }}
      >
        <div
          className="h-52 w-44 select-none overflow-hidden p-2"
          style={{
            background: "var(--color-basalte-2)",
            border: hovered
              ? "1px solid var(--color-braise-vive)"
              : "1px solid var(--color-filet)",
            boxShadow: hovered
              ? "0 0 34px color-mix(in srgb, var(--color-braise) 45%, transparent)"
              : "0 18px 34px rgba(0, 0, 0, 0.55)",
            transition: "box-shadow 0.3s var(--ease-braise), border-color 0.3s",
          }}
        >
          <img
            src={card.imageUrl}
            alt={card.alt}
            className="h-40 w-full object-cover"
            loading="lazy"
            draggable={false}
          />
          <p
            className="voix-mono mt-2 truncate text-center"
            style={{ color: "var(--color-pierre)", fontSize: "0.5625rem" }}
          >
            {card.title}
          </p>
        </div>
      </Html>
    </group>
  );
}

function CardModal() {
  const { selectedCard, setSelectedCard } = useCard();
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useTransitionNavigate();

  if (!selectedCard) return null;

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const rotateX = (e.clientY - rect.top - rect.height / 2) / 18;
    const rotateY = (rect.width / 2 - (e.clientX - rect.left)) / 18;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.5s ease-out";
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    }
  };

  const handleClose = () => setSelectedCard(null);

  return (
    <div
      className="fixed inset-0 z-94 flex items-center justify-center"
      style={{ background: "color-mix(in srgb, var(--color-basalte) 82%, transparent)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={selectedCard.title}
    >
      <div className="relative mx-4 w-full max-w-md">
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 z-10 transition-colors"
          style={{ color: "var(--color-pierre)" }}
          aria-label="Fermer"
        >
          <X className="h-7 w-7" strokeWidth={1.5} />
        </button>

        <div style={{ perspective: "1000px" }} className="w-full">
          <div
            ref={cardRef}
            className="relative w-full p-4"
            style={{
              transformStyle: "preserve-3d",
              background: "var(--color-basalte-2)",
              border: "1px solid var(--color-filet)",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative mb-4 w-full" style={{ aspectRatio: "4 / 3" }}>
              <img
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
                alt={selectedCard.alt}
                src={selectedCard.imageUrl}
              />
            </div>

            <p className="voix-mono mb-1" style={{ color: "var(--color-bronze)" }}>
              {selectedCard.meta}
            </p>
            <h3
              className="voix-display mb-5"
              style={{ color: "var(--color-pierre)", fontSize: "1.375rem" }}
            >
              {selectedCard.title}
            </h3>

            <button
              type="button"
              onClick={() => {
                handleClose();
                navigate(`/projets/${selectedCard.slug}`);
              }}
              className="voix-mono inline-flex h-11 w-full items-center justify-center gap-2 transition-opacity duration-200 hover:opacity-85"
              style={{ background: "var(--color-braise)", color: "var(--color-pierre)" }}
            >
              <span>Voir la fiche du film</span>
              <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardGalaxy() {
  const { cards } = useCard();

  const cardPositions = useMemo(() => {
    const positions: { x: number; y: number; z: number }[] = [];
    const numCards = cards.length;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < numCards; i++) {
      const y = numCards > 1 ? 1 - (i / (numCards - 1)) * 2 : 0;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = (2 * Math.PI * i) / goldenRatio;
      const layerRadius = 12 + (i % 3) * 4;
      positions.push({
        x: Math.cos(theta) * radiusAtY * layerRadius,
        y: y * layerRadius,
        z: Math.sin(theta) * radiusAtY * layerRadius,
      });
    }
    return positions;
  }, [cards.length]);

  return (
    <>
      {/* Les cercles du temple : sphères filaires concentriques, bronze. */}
      <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#96794c" transparent opacity={0.14} wireframe />
      </Sphere>
      <Sphere args={[12, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#96794c" transparent opacity={0.05} wireframe />
      </Sphere>
      <Sphere args={[16, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#c2551e" transparent opacity={0.035} wireframe />
      </Sphere>

      {cards.map((card, i) => (
        <FloatingCard key={card.id} card={card} position={cardPositions[i]} />
      ))}
    </>
  );
}

export default function GaleriePlans({ cards }: { cards: CartePlan[] }) {
  return (
    <CardProvider cards={cards}>
      <div
        className="relative h-svh w-full overflow-hidden"
        style={{ background: "var(--color-basalte)" }}
      >
        <Canvas
          camera={{ position: [0, 0, 15], fov: 60 }}
          className="absolute inset-0"
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <ChampDeBraises />
            <CardGalaxy />
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

        <CardModal />

        <div className="pointer-events-none absolute left-[var(--spacing-marge)] top-6">
          <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
            LA GALERIE DES PLANS · GLISSEZ POUR ORBITER · CLIQUEZ UN PLAN
          </p>
        </div>
      </div>
    </CardProvider>
  );
}
