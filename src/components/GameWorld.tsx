import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Text } from "@react-three/drei";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { supabase } from "../lib/supabase";
import {
  awardXp,
  recordStallVisit,
  recordCraftDiscovery,
} from "../utils/gamificationService";
import { useLanguage, TRANSLATIONS } from "../context/LanguageContext";
import {
  StallType,
  DynamicStallData,
  normalizeCategoryName,
  getCategoryKey,
  inferCraftTypeAndVisuals,
  getLocalizedStallName,
  generateDynamicStalls,
  getStallProducts,
  isStallCollision,
  findNearestStall,
  extractProductCategory,
} from "../utils/craftFairStallService";

export interface GameWorldProps {
  onExit?: () => void;
  inventory?: any[];
  onAddToCart?: (product: any) => void;
}

export type DatabaseProduct = {
  id: string;
  title: string;
  title_en?: string;
  title_hi?: string;
  artisan_id: string;
  description: string;
  story?: string;
  image_url: string;
  category: string;
  categoryName?: string;
  price: number | string;
  stock: number;
  source?: "local" | "remote";

  artisan?: {
    id: string;
    name: string;
    bio: string | null;
    location: string | null;
  } | null;
};

const mapInventoryToStallProducts = (inv: any[]): DatabaseProduct[] => {
  if (!inv || inv.length === 0) return [];
  const stallNames = [
    "Meera Handloom",
    "Rajasthan Pottery",
    "Woodcraft",
    "Banarasi Weaves",
    "Blue Pottery",
    "Indian Jewellery",
  ];

  return inv.map((item, index) => {
    const title = item.title_en || item.title_hi || `Handmade Craft ${index + 1}`;
    const desc =
      item.story_en ||
      item.quick_summary_en ||
      item.story_hi ||
      item.quick_summary_hi ||
      "Authentic handcrafted creation from rural artisans across India.";
    const price = item.suggested_price || 499;
    const img = item.imageUrl || "";

    let assignedStall = stallNames[index % stallNames.length];
    const textLower = (title + " " + (item.categoryName || "")).toLowerCase();

    if (/pottery|मिट्टी|clay|terracotta|घड़ा/i.test(textLower)) {
      assignedStall = index % 2 === 0 ? "Rajasthan Pottery" : "Blue Pottery";
    } else if (/wood|लकड़ी|कठपुतली|puppet|channapatna|toy/i.test(textLower)) {
      assignedStall = "Woodcraft";
    } else if (/silk|saree|banarasi|weav|बुनाई|shawl|dupatta/i.test(textLower)) {
      assignedStall = index % 2 === 0 ? "Banarasi Weaves" : "Meera Handloom";
    } else if (/jewel|silver|bangle|necklace|brass|पीतल|गहने/i.test(textLower)) {
      assignedStall = "Indian Jewellery";
    }

    return {
      id: item.id || `inv-${index}`,
      title,
      artisan_id: `artisan-${index}`,
      description: desc,
      image_url: img,
      category: item.categoryName || "Handicraft",
      price,
      stock: item.quantity !== undefined && item.quantity !== null && !isNaN(Number(item.quantity)) ? Math.max(0, Number(item.quantity)) : 5,
      artisan: {
        id: `artisan-${index}`,
        name: assignedStall,
        bio: item.artisan_name
          ? `${item.artisan_name} (${item.artisan_region || "India"})`
          : "Master Indian Artisan",
        location: item.artisan_region || "India",
      },
    };
  });
};

/* =========================================================
   STALL PRESETS & COMPATIBILITY DATA
========================================================= */

export const DEFAULT_STALL_PRESETS = [
  {
    x: -6,
    z: -5,
    name: "Meera Handloom",
    color: "#b86f45",
    facing: "left" as const,
    type: "textile" as const,
  },
  {
    x: -6,
    z: 2,
    name: "Rajasthan Pottery",
    color: "#477da3",
    facing: "left" as const,
    type: "pottery" as const,
  },
  {
    x: -6,
    z: 9,
    name: "Woodcraft",
    color: "#9a633c",
    facing: "left" as const,
    type: "wood" as const,
  },
  {
    x: 6,
    z: -5,
    name: "Banarasi Weaves",
    color: "#a65f42",
    facing: "right" as const,
    type: "textile" as const,
  },
  {
    x: 6,
    z: 2,
    name: "Blue Pottery",
    color: "#477da3",
    facing: "right" as const,
    type: "pottery" as const,
  },
  {
    x: 6,
    z: 9,
    name: "Indian Jewellery",
    color: "#d19b35",
    facing: "right" as const,
    type: "jewellery" as const,
  },
];

export const stalls = DEFAULT_STALL_PRESETS;

/* =========================================================
   GROUND (Scales dynamically with stall count)
========================================================= */

function Ground({ roadLength = 24 }: { roadLength?: number }) {
  const groundSize = Math.max(30, roadLength + 8);
  const sidewalkZ = Math.max(3, roadLength * 0.35);

  return (
    <>
      {/* MAIN GROUND */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[groundSize, groundSize]} />
        <meshStandardMaterial color="#d6b98c" />
      </mesh>

      {/* MAIN ROAD */}
      <mesh position={[0, 0.03, 2]}>
        <boxGeometry args={[5, 0.05, roadLength]} />
        <meshStandardMaterial color="#c9a77b" />
      </mesh>

      {/* LEFT SIDE WALK */}
      <mesh position={[-6, 0.03, 2]}>
        <boxGeometry args={[8, 0.05, sidewalkZ]} />
        <meshStandardMaterial color="#c9a77b" />
      </mesh>

      {/* RIGHT SIDE WALK */}
      <mesh position={[6, 0.03, 2]}>
        <boxGeometry args={[8, 0.05, sidewalkZ]} />
        <meshStandardMaterial color="#c9a77b" />
      </mesh>

      {/* ROAD CENTER STRIP */}
      <mesh position={[0, 0.065, 2]}>
        <boxGeometry args={[0.12, 0.02, roadLength]} />
        <meshStandardMaterial color="#ead7b5" />
      </mesh>
    </>
  );
}

/* =========================================================
   TREE
========================================================= */

function Tree({
  x,
  z,
}: {
  x: number;
  z: number;
}) {
  return (
    <group position={[x, 0, z]}>
      {/* TRUNK */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 2.4, 8]} />
        <meshStandardMaterial color="#6b4226" />
      </mesh>

      {/* LEAVES */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[1.3, 12, 12]} />
        <meshStandardMaterial color="#4f7f45" />
      </mesh>

      <mesh position={[0.6, 2.8, 0.2]}>
        <sphereGeometry args={[0.75, 12, 12]} />
        <meshStandardMaterial color="#5d8a4d" />
      </mesh>

      <mesh position={[-0.55, 2.7, 0.1]}>
        <sphereGeometry args={[0.7, 12, 12]} />
        <meshStandardMaterial color="#527f43" />
      </mesh>
    </group>
  );
}

/* =========================================================
   ARTISAN CHARACTER
========================================================= */

function ArtisanCharacter({
  position,
  shirtColor = "#3155a5",
}: {
  position: [number, number, number];
  shirtColor?: string;
}) {
  const artisanRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!artisanRef.current) return;

    // Small natural idle movement
    artisanRef.current.position.y =
      position[1] +
      Math.sin(clock.elapsedTime * 1.5) * 0.025;
  });

  return (
    <group
      ref={artisanRef}
      position={position}
      rotation={[0, Math.PI, 0]}
    >
      {/* BODY */}
      <mesh position={[0, 0.75, 0]}>
        <capsuleGeometry args={[0.32, 0.65, 8, 12]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>

      {/* APRON */}
      <mesh position={[0, 0.85, -0.27]}>
        <boxGeometry args={[0.58, 0.85, 0.08]} />
        <meshStandardMaterial color="#ead8b5" />
      </mesh>

      {/* HEAD */}
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#b87552" />
      </mesh>

      {/* HAIR */}
      <mesh position={[0, 1.72, 0]}>
        <sphereGeometry args={[0.29, 16, 10]} />
        <meshStandardMaterial color="#211712" />
      </mesh>

      {/* EYES */}
      <mesh position={[-0.1, 1.57, -0.26]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      <mesh position={[0.1, 1.57, -0.26]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* LEFT ARM */}
      <mesh position={[-0.4, 0.78, 0]}>
        <capsuleGeometry args={[0.1, 0.5, 6, 10]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>

      {/* RIGHT ARM */}
      <mesh position={[0.4, 0.78, 0]}>
        <capsuleGeometry args={[0.1, 0.5, 6, 10]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>

      {/* LEFT LEG */}
      <mesh position={[-0.15, 0.05, 0]}>
        <capsuleGeometry args={[0.11, 0.55, 6, 10]} />
        <meshStandardMaterial color="#3b302c" />
      </mesh>

      {/* RIGHT LEG */}
      <mesh position={[0.15, 0.05, 0]}>
        <capsuleGeometry args={[0.11, 0.55, 6, 10]} />
        <meshStandardMaterial color="#3b302c" />
      </mesh>

      {/* LEFT SHOE */}
      <mesh position={[-0.15, -0.27, -0.08]}>
        <boxGeometry args={[0.25, 0.12, 0.38]} />
        <meshStandardMaterial color="#171717" />
      </mesh>

      {/* RIGHT SHOE */}
      <mesh position={[0.15, -0.27, -0.08]}>
        <boxGeometry args={[0.25, 0.12, 0.38]} />
        <meshStandardMaterial color="#171717" />
      </mesh>
    </group>
  );
}

/* =========================================================
   STALL
========================================================= */

function Stall({
  x,
  z,
  name,
  color,
  onEnter,
  facing = "left",
  type = "general",
}: {
  x: number;
  z: number;
  name: string;
  color: string;
  onEnter: () => void;
  facing?: "left" | "right";
  type?:
    | "textile"
    | "pottery"
    | "wood"
    | "jewellery"
    | "general";
}) {
  /*
    Local FRONT of stall = -Z

    Left stalls face +X
    Right stalls face -X
  */

  const rotation =
    facing === "left"
      ? -Math.PI / 2
      : Math.PI / 2;

  return (
    <group
      position={[x, 0, z]}
      rotation={[0, rotation, 0]}
    >
      {/* =====================================================
          BACK WALL
      ===================================================== */}

      <mesh position={[0, 2, 1]}>
        <boxGeometry args={[4.5, 4, 0.25]} />
        <meshStandardMaterial color="#70452d" />
      </mesh>

      {/* =====================================================
          WOODEN PILLARS
      ===================================================== */}

      <mesh position={[-2.15, 2, 0]}>
        <boxGeometry args={[0.25, 4, 0.25]} />
        <meshStandardMaterial color="#51321f" />
      </mesh>

      <mesh position={[2.15, 2, 0]}>
        <boxGeometry args={[0.25, 4, 0.25]} />
        <meshStandardMaterial color="#51321f" />
      </mesh>

      {/* FRONT TOP BEAM */}
      <mesh position={[0, 3.25, -0.05]}>
        <boxGeometry args={[4.5, 0.22, 0.25]} />
        <meshStandardMaterial color="#51321f" />
      </mesh>

      {/* =====================================================
          CANOPY
      ===================================================== */}

      <mesh
        position={[0, 3.65, -0.15]}
        rotation={[0.05, 0, 0]}
      >
        <boxGeometry args={[5, 0.25, 3.3]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* CANOPY FRONT */}
      <mesh position={[0, 3.35, -1.65]}>
        <boxGeometry args={[5, 0.65, 0.18]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* CANOPY STRIPES */}
      <mesh position={[-1.5, 3.37, -1.76]}>
        <boxGeometry args={[0.55, 0.6, 0.08]} />
        <meshStandardMaterial color="#f3e5c8" />
      </mesh>

      <mesh position={[0, 3.37, -1.76]}>
        <boxGeometry args={[0.55, 0.6, 0.08]} />
        <meshStandardMaterial color="#f3e5c8" />
      </mesh>

      <mesh position={[1.5, 3.37, -1.76]}>
        <boxGeometry args={[0.55, 0.6, 0.08]} />
        <meshStandardMaterial color="#f3e5c8" />
      </mesh>

      {/* =====================================================
          SIGN BOARD
      ===================================================== */}

      <mesh position={[0, 4.25, -1.45]}>
        <boxGeometry args={[3.6, 0.7, 0.18]} />
        <meshStandardMaterial color="#4e2f1e" />
      </mesh>

      <Text
        position={[0, 4.25, -1.57]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.32}
        maxWidth={3.1}
        anchorX="center"
        anchorY="middle"
        color="#f6dfb0"
        outlineWidth={0.025}
        outlineColor="#2e1b11"
        depthOffset={-1}
      >
        {name}
      </Text>

      {/* =====================================================
          COUNTER
      ===================================================== */}

      <mesh position={[0, 0.95, -1.15]}>
        <boxGeometry args={[4, 1.05, 0.75]} />
        <meshStandardMaterial color="#70452d" />
      </mesh>

      {/* COUNTER TOP */}
      <mesh position={[0, 1.52, -1.15]}>
        <boxGeometry args={[4.2, 0.18, 0.9]} />
        <meshStandardMaterial color="#412719" />
      </mesh>

      {/* =====================================================
          ARTISAN
      ===================================================== */}

      <ArtisanCharacter
        position={[0, 0.05, 0.15]}
        shirtColor={color}
      />

      {/* =====================================================
          TEXTILE PRODUCTS
      ===================================================== */}

      {type === "textile" && (
        <>
          {/* FOLDED CLOTH 1 */}
          <mesh position={[-1.35, 1.72, -1.25]}>
            <boxGeometry args={[0.75, 0.22, 0.65]} />
            <meshStandardMaterial color="#8d4051" />
          </mesh>

          {/* FOLDED CLOTH 2 */}
          <mesh position={[-0.45, 1.72, -1.25]}>
            <boxGeometry args={[0.75, 0.22, 0.65]} />
            <meshStandardMaterial color="#3155a5" />
          </mesh>

          {/* FOLDED CLOTH 3 */}
          <mesh position={[0.45, 1.72, -1.25]}>
            <boxGeometry args={[0.75, 0.22, 0.65]} />
            <meshStandardMaterial color="#d49b3a" />
          </mesh>

          {/* HANGING SAREE */}
          <mesh position={[1.35, 2.25, -1.18]}>
            <boxGeometry args={[0.65, 1.15, 0.08]} />
            <meshStandardMaterial color="#9d3f52" />
          </mesh>

          {/* HANGING SECOND CLOTH */}
          <mesh position={[1.8, 2.25, -1.18]}>
            <boxGeometry args={[0.35, 1.05, 0.08]} />
            <meshStandardMaterial color="#d49b3a" />
          </mesh>
        </>
      )}

      {/* =====================================================
          POTTERY PRODUCTS
      ===================================================== */}

      {type === "pottery" && (
        <>
          {/* LARGE POT */}
          <mesh position={[-1.25, 1.95, -1.25]}>
            <latheGeometry
              args={[
                [
                  new THREE.Vector2(0.05, -0.4),
                  new THREE.Vector2(0.35, -0.3),
                  new THREE.Vector2(0.42, 0),
                  new THREE.Vector2(0.32, 0.35),
                  new THREE.Vector2(0.18, 0.45),
                ],
                16,
              ]}
            />
            <meshStandardMaterial color="#477da3" />
          </mesh>

          {/* SMALL POT */}
          <mesh position={[0, 1.95, -1.25]}>
            <cylinderGeometry
              args={[0.28, 0.38, 0.55, 16]}
            />
            <meshStandardMaterial color="#c8784d" />
          </mesh>

          {/* BOWL */}
          <mesh position={[1.15, 1.95, -1.25]}>
            <torusGeometry
              args={[0.3, 0.1, 8, 16]}
            />
            <meshStandardMaterial color="#d2a64e" />
          </mesh>

          {/* BLUE SMALL POT */}
          <mesh position={[1.6, 1.95, -1.25]}>
            <cylinderGeometry
              args={[0.18, 0.25, 0.4, 16]}
            />
            <meshStandardMaterial color="#5c91b5" />
          </mesh>

          {/* POTTERY SHELF */}
          <mesh position={[0, 2.75, 0.78]}>
            <boxGeometry args={[3.4, 0.12, 0.4]} />
            <meshStandardMaterial color="#4e3020" />
          </mesh>

          {/* SHELF POTS */}
          <mesh position={[-1.1, 3.05, 0.55]}>
            <cylinderGeometry
              args={[0.16, 0.22, 0.35, 12]}
            />
            <meshStandardMaterial color="#d08a58" />
          </mesh>

          <mesh position={[0, 3.05, 0.55]}>
            <cylinderGeometry
              args={[0.16, 0.22, 0.35, 12]}
            />
            <meshStandardMaterial color="#477da3" />
          </mesh>

          <mesh position={[1.1, 3.05, 0.55]}>
            <cylinderGeometry
              args={[0.16, 0.22, 0.35, 12]}
            />
            <meshStandardMaterial color="#d2a64e" />
          </mesh>
        </>
      )}

      {/* =====================================================
          WOODCRAFT PRODUCTS
      ===================================================== */}

      {type === "wood" && (
        <>
          {/* WOODEN BOX */}
          <mesh position={[-1.2, 1.85, -1.25]}>
            <boxGeometry args={[0.7, 0.6, 0.65]} />
            <meshStandardMaterial color="#9a633c" />
          </mesh>

          {/* TALL WOODEN BOX */}
          <mesh position={[0, 1.9, -1.25]}>
            <boxGeometry args={[0.55, 0.8, 0.55]} />
            <meshStandardMaterial color="#7b4a2d" />
          </mesh>

          {/* WOODEN VASE */}
          <mesh position={[1.1, 1.95, -1.25]}>
            <cylinderGeometry
              args={[0.25, 0.35, 0.65, 12]}
            />
            <meshStandardMaterial color="#a86d3d" />
          </mesh>

          {/* SMALL TOY */}
          <mesh position={[1.65, 1.85, -1.25]}>
            <sphereGeometry args={[0.28, 12, 12]} />
            <meshStandardMaterial color="#c47a52" />
          </mesh>

          {/* WOOD SHELF */}
          <mesh position={[0, 2.8, 0.78]}>
            <boxGeometry args={[3.4, 0.12, 0.4]} />
            <meshStandardMaterial color="#4e3020" />
          </mesh>

          {/* SHELF PRODUCTS */}
          <mesh position={[-1.1, 3.1, 0.55]}>
            <boxGeometry args={[0.45, 0.45, 0.45]} />
            <meshStandardMaterial color="#8b572f" />
          </mesh>

          <mesh position={[0, 3.1, 0.55]}>
            <cylinderGeometry
              args={[0.16, 0.2, 0.45, 12]}
            />
            <meshStandardMaterial color="#b87843" />
          </mesh>

          <mesh position={[1.1, 3.1, 0.55]}>
            <boxGeometry args={[0.45, 0.5, 0.45]} />
            <meshStandardMaterial color="#754628" />
          </mesh>
        </>
      )}

      {/* =====================================================
          JEWELLERY PRODUCTS
      ===================================================== */}

      {type === "jewellery" && (
        <>
          {/* NECKLACE 1 */}
          <mesh position={[-1.2, 2.1, -1.25]}>
            <torusGeometry
              args={[0.32, 0.06, 8, 24]}
            />
            <meshStandardMaterial
              color="#d5a72e"
              metalness={0.8}
              roughness={0.25}
            />
          </mesh>

          {/* NECKLACE 2 */}
          <mesh position={[0, 2.1, -1.25]}>
            <torusGeometry
              args={[0.4, 0.06, 8, 24]}
            />
            <meshStandardMaterial
              color="#d5a72e"
              metalness={0.8}
              roughness={0.25}
            />
          </mesh>

          {/* EARRING 1 */}
          <mesh position={[1.1, 2.15, -1.25]}>
            <sphereGeometry args={[0.13, 12, 12]} />
            <meshStandardMaterial
              color="#e0b52f"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>

          {/* EARRING 2 */}
          <mesh position={[1.1, 1.8, -1.25]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial
              color="#9e3c54"
              metalness={0.7}
              roughness={0.2}
            />
          </mesh>

          {/* JEWELLERY DISPLAY SHELF */}
          <mesh position={[0, 2.8, 0.78]}>
            <boxGeometry args={[3.4, 0.12, 0.4]} />
            <meshStandardMaterial color="#4e3020" />
          </mesh>

          {/* DISPLAY GEMS */}
          <mesh position={[-1.2, 3.05, 0.55]}>
            <sphereGeometry args={[0.13, 12, 12]} />
            <meshStandardMaterial
              color="#d5a72e"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          <mesh position={[0, 3.05, 0.55]}>
            <sphereGeometry args={[0.13, 12, 12]} />
            <meshStandardMaterial
              color="#9e3c54"
              metalness={0.7}
              roughness={0.2}
            />
          </mesh>

          <mesh position={[1.2, 3.05, 0.55]}>
            <sphereGeometry args={[0.13, 12, 12]} />
            <meshStandardMaterial
              color="#477da3"
              metalness={0.7}
              roughness={0.2}
            />
          </mesh>
        </>
      )}

      {/* =====================================================
          GENERAL PRODUCTS
      ===================================================== */}

      {type === "general" && (
        <>
          <mesh position={[-1.2, 1.85, -1.25]}>
            <cylinderGeometry
              args={[0.3, 0.38, 0.55, 12]}
            />
            <meshStandardMaterial color="#c47a52" />
          </mesh>

          <mesh position={[0, 1.85, -1.25]}>
            <cylinderGeometry
              args={[0.35, 0.28, 0.35, 12]}
            />
            <meshStandardMaterial color="#c99a55" />
          </mesh>

          <mesh position={[1.2, 1.85, -1.25]}>
            <boxGeometry args={[0.65, 0.5, 0.55]} />
            <meshStandardMaterial color="#9b4d45" />
          </mesh>
        </>
      )}

      {/* =====================================================
          EXTRA BACK SHELVES
      ===================================================== */}

      <mesh position={[-1.25, 2.8, 0.78]}>
        <boxGeometry args={[1.5, 0.12, 0.4]} />
        <meshStandardMaterial color="#4e3020" />
      </mesh>

      <mesh position={[1.25, 2.8, 0.78]}>
        <boxGeometry args={[1.5, 0.12, 0.4]} />
        <meshStandardMaterial color="#4e3020" />
      </mesh>

      {/* =====================================================
          SMALL LANTERN
      ===================================================== */}

      <mesh position={[-1.75, 2.65, 0.6]}>
        <cylinderGeometry
          args={[0.16, 0.16, 0.35, 8]}
        />
        <meshStandardMaterial
          color="#d59b37"
          emissive="#8a5a18"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* =====================================================
          INTERACTION AREA
      ===================================================== */}

      <mesh
        position={[0, 0.05, -2.25]}
        onClick={onEnter}
      >
        <boxGeometry args={[4, 0.1, 1.2]} />
        <meshStandardMaterial
          transparent
          opacity={0}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   COLLISION
========================================================= */

function isBlocked(x: number, z: number) {
  for (const stall of stalls) {
    if (
      Math.abs(x - stall.x) < 2.5 &&
      Math.abs(z - stall.z) < 2
    ) {
      return true;
    }
  }

  return false;
}

/* =========================================================
   PLAYER
========================================================= */

function Player({
  onEnterStall,
  hideInteractionPrompt = false,
  activeStalls = stalls,
  currentLang = "en",
}: {
  onEnterStall: (stallName: string) => void;
  hideInteractionPrompt?: boolean;
  activeStalls?: any[];
  currentLang?: string;
}) {
  const playerRef = useRef<THREE.Group>(null);

  // =========================
  // BODY REFS FOR ANIMATION
  // =========================

  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);

  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);

  const torsoRef = useRef<THREE.Mesh>(null);

  // Walking animation timer
  const walkTime = useRef(0);

  // Keyboard state
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    e: false,
  });

  const [nearStall, setNearStall] =
    useState<string | null>(null);

  // =========================
  // CAMERA
  // =========================

  const { camera } = useThree();

  // Reset keys when interaction prompt is hidden or modal opens
  useEffect(() => {
    if (hideInteractionPrompt) {
      keys.current.w = false;
      keys.current.a = false;
      keys.current.s = false;
      keys.current.d = false;
      keys.current.e = false;
    }
  }, [hideInteractionPrompt]);

  // =========================
  // KEYBOARD CONTROLS
  // =========================

  useEffect(() => {
    const isFormElement = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof HTMLElement)) return false;
      const tag = target.tagName.toLowerCase();
      return tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isFormElement(event.target)) return;
      if (hideInteractionPrompt) return;

      const key = event.key.toLowerCase();

      if (key === "w" || key === "arrowup") {
        keys.current.w = true;
      }

      if (key === "a" || key === "arrowleft") {
        keys.current.a = true;
      }

      if (key === "s" || key === "arrowdown") {
        keys.current.s = true;
      }

      if (key === "d" || key === "arrowright") {
        keys.current.d = true;
      }

      if (key === "e" || key === "enter") {
        keys.current.e = true;
      }

      if (
        ["w", "a", "s", "d", "e", "arrowup", "arrowdown", "arrowleft", "arrowright", "enter"].includes(key)
      ) {
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isFormElement(event.target)) return;

      const key = event.key.toLowerCase();

      if (key === "w" || key === "arrowup") {
        keys.current.w = false;
      }

      if (key === "a" || key === "arrowleft") {
        keys.current.a = false;
      }

      if (key === "s" || key === "arrowdown") {
        keys.current.s = false;
      }

      if (key === "d" || key === "arrowright") {
        keys.current.d = false;
      }

      if (key === "e" || key === "enter") {
        keys.current.e = false;
      }
    };

    const handleBlur = () => {
      keys.current.w = false;
      keys.current.a = false;
      keys.current.s = false;
      keys.current.d = false;
      keys.current.e = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [hideInteractionPrompt]);

  // =========================
  // GAME LOOP
  // =========================

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    if (hideInteractionPrompt) return;

    // Framerate-independent normalized delta time (clamped between ~15fps and 120fps)
    const clampedDelta = Math.min(Math.max(delta, 0.008), 0.066);
    const moveSpeed = 4.8 * clampedDelta;
    const turnSpeed = 2.4 * clampedDelta;

    // =========================
    // A / D = TURN
    // =========================

    if (keys.current.a) {
      playerRef.current.rotation.y += turnSpeed;
    }

    if (keys.current.d) {
      playerRef.current.rotation.y -= turnSpeed;
    }

    // =========================
    // FIND PLAYER DIRECTION
    // =========================

    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(playerRef.current.quaternion);

    // =========================
    // W / S = MOVE WITH AXIS SLIDING
    // =========================

    const currentX = playerRef.current.position.x;
    const currentZ = playerRef.current.position.z;

    let targetDeltaX = 0;
    let targetDeltaZ = 0;

    if (keys.current.w) {
      targetDeltaX += direction.x * moveSpeed;
      targetDeltaZ += direction.z * moveSpeed;
    }

    if (keys.current.s) {
      targetDeltaX -= direction.x * moveSpeed;
      targetDeltaZ -= direction.z * moveSpeed;
    }

    let moved = false;

    if (targetDeltaX !== 0 || targetDeltaZ !== 0) {
      // 1. Check X movement independently (enables smooth sliding along Z axis)
      const candX = Math.max(-10, Math.min(10, currentX + targetDeltaX));
      const blockedX = isStallCollision(candX, currentZ, activeStalls, 2.3, 1.85);

      if (!blockedX) {
        playerRef.current.position.x = candX;
      }

      // 2. Check Z movement independently (enables smooth sliding along X axis)
      const activeX = playerRef.current.position.x;
      const candZ = Math.max(-15, Math.min(30, currentZ + targetDeltaZ));
      const blockedZ = isStallCollision(activeX, candZ, activeStalls, 2.3, 1.85);

      if (!blockedZ) {
        playerRef.current.position.z = candZ;
      }

      moved = Math.abs(playerRef.current.position.x - currentX) > 0.0001 ||
              Math.abs(playerRef.current.position.z - currentZ) > 0.0001;
    }

    // =========================
    // FIND NEAREST STALL
    // =========================

    const nearestStall = findNearestStall(
      playerRef.current.position.x,
      playerRef.current.position.z,
      activeStalls,
      4
    );

    // =========================
    // SHOW E MESSAGE
    // =========================

    setNearStall(
      nearestStall
        ? nearestStall.displayName
        : null
    );

    // =========================
    // E = ENTER STALL
    // =========================

    if (
      keys.current.e &&
      nearestStall
    ) {
      onEnterStall(
        nearestStall.categoryKey
      );

      keys.current.e = false;
    }

    // =========================
    // WALKING ANIMATION
    // =========================

    const isMoving = (keys.current.w || keys.current.s) && moved;

    if (isMoving) {
      walkTime.current +=
        delta * 8;

      const swing =
        Math.sin(
          walkTime.current
        ) * 0.5;

      // Arms
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x =
          swing;
      }

      if (rightArmRef.current) {
        rightArmRef.current.rotation.x =
          -swing;
      }

      // Legs
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x =
          -swing;
      }

      if (rightLegRef.current) {
        rightLegRef.current.rotation.x =
          swing;
      }

      // Small body bounce
      if (torsoRef.current) {
        torsoRef.current.position.y =
          0.8 +
          Math.abs(
            Math.sin(
              walkTime.current * 2
            )
          ) *
            0.04;
      }
    } else {
      // Return to idle position

      if (leftArmRef.current) {
        leftArmRef.current.rotation.x +=
          (0 -
            leftArmRef.current.rotation.x) *
          0.15;
      }

      if (rightArmRef.current) {
        rightArmRef.current.rotation.x +=
          (0 -
            rightArmRef.current.rotation.x) *
          0.15;
      }

      if (leftLegRef.current) {
        leftLegRef.current.rotation.x +=
          (0 -
            leftLegRef.current.rotation.x) *
          0.15;
      }

      if (rightLegRef.current) {
        rightLegRef.current.rotation.x +=
          (0 -
            rightLegRef.current.rotation.x) *
          0.15;
      }

      if (torsoRef.current) {
        torsoRef.current.position.y +=
          (0.8 -
            torsoRef.current.position.y) *
          0.15;
      }
    }

    // =========================
    // CAMERA
    // =========================

    const playerX =
      playerRef.current.position.x;

    const playerZ =
      playerRef.current.position.z;

    // --------------------------------
    // CAMERA WHEN NEAR A STALL
    // --------------------------------

    if (nearestStall) {
      const frontDirection =
        nearestStall.facing === "left"
          ? 1
          : -1;

      const desiredCameraX =
        nearestStall.x +
        frontDirection * 5.8;

      const desiredCameraZ =
        nearestStall.z + 3.5;

      // Smooth camera movement
      camera.position.x +=
        (desiredCameraX -
          camera.position.x) *
        0.08;

      camera.position.y +=
        (3.6 -
          camera.position.y) *
        0.08;

      camera.position.z +=
        (desiredCameraZ -
          camera.position.z) *
        0.08;

      // Look toward stall
      camera.lookAt(
        nearestStall.x,
        1.7,
        nearestStall.z
      );
    }

    // --------------------------------
    // NORMAL THIRD-PERSON CAMERA
    // --------------------------------

    else {
      const cameraDirection =
        new THREE.Vector3(
          0,
          0,
          -1
        );

      cameraDirection.applyQuaternion(
        playerRef.current.quaternion
      );

      const cameraDistance = 6.5;

      const desiredCameraX =
        playerX -
        cameraDirection.x *
          cameraDistance;

      const desiredCameraZ =
        playerZ -
        cameraDirection.z *
          cameraDistance;

      // Smooth follow
      camera.position.x +=
        (desiredCameraX -
          camera.position.x) *
        0.08;

      camera.position.y +=
        (3.6 -
          camera.position.y) *
        0.08;

      camera.position.z +=
        (desiredCameraZ -
          camera.position.z) *
        0.08;

      // Look slightly ahead of player
      camera.lookAt(
        playerX +
          cameraDirection.x * 4,

        1.5,

        playerZ +
          cameraDirection.z * 4
      );
    }
  });

  // =========================
  // PLAYER MODEL
  // =========================

  return (
    <group
      ref={playerRef}
      position={[0, 0.45, 6]}
    >
      {/* =========================
          TORSO
      ========================= */}

      <mesh
        ref={torsoRef}
        position={[0, 0.8, 0]}
      >
        <capsuleGeometry
          args={[
            0.38,
            0.65,
            8,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#3155a5"
        />
      </mesh>

      {/* =========================
          HEAD
      ========================= */}

      <mesh
        position={[0, 1.65, 0]}
      >
        <sphereGeometry
          args={[
            0.32,
            16,
            16,
          ]}
        />

        <meshStandardMaterial
          color="#c9825c"
        />
      </mesh>

      {/* =========================
          HAIR
      ========================= */}

      <mesh
        position={[0, 1.87, 0]}
      >
        <sphereGeometry
          args={[
            0.33,
            16,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#241812"
        />
      </mesh>

      {/* =========================
          LEFT ARM
      ========================= */}

      <mesh
        ref={leftArmRef}
        position={[-0.48, 0.85, 0]}
      >
        <capsuleGeometry
          args={[
            0.12,
            0.55,
            6,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#3155a5"
        />
      </mesh>

      {/* =========================
          RIGHT ARM
      ========================= */}

      <mesh
        ref={rightArmRef}
        position={[0.48, 0.85, 0]}
      >
        <capsuleGeometry
          args={[
            0.12,
            0.55,
            6,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#3155a5"
        />
      </mesh>

      {/* =========================
          LEFT LEG
      ========================= */}

      <mesh
        ref={leftLegRef}
        position={[-0.2, 0.05, 0]}
      >
        <capsuleGeometry
          args={[
            0.14,
            0.65,
            6,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#26344f"
        />
      </mesh>

      {/* =========================
          RIGHT LEG
      ========================= */}

      <mesh
        ref={rightLegRef}
        position={[0.2, 0.05, 0]}
      >
        <capsuleGeometry
          args={[
            0.14,
            0.65,
            6,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#26344f"
        />
      </mesh>

      {/* =========================
          LEFT SHOE
      ========================= */}

      <mesh
        position={[-0.2, -0.38, -0.12]}
      >
        <boxGeometry
          args={[
            0.3,
            0.16,
            0.45,
          ]}
        />

        <meshStandardMaterial
          color="#171717"
        />
      </mesh>

      {/* =========================
          RIGHT SHOE
      ========================= */}

      <mesh
        position={[0.2, -0.38, -0.12]}
      >
        <boxGeometry
          args={[
            0.3,
            0.16,
            0.45,
          ]}
        />

        <meshStandardMaterial
          color="#171717"
        />
      </mesh>

      {/* =========================
          BACKPACK
      ========================= */}

      <mesh
        position={[0, 0.9, 0.35]}
      >
        <boxGeometry
          args={[
            0.55,
            0.7,
            0.25,
          ]}
        />

        <meshStandardMaterial
          color="#5b3a29"
        />
      </mesh>

      {/* =========================
          STALL INTERACTION MESSAGE
      ========================= */}

      {nearStall && !hideInteractionPrompt && (
        <Html
          position={[0, 3.55, 0]}
          center
        >
          <div
            style={{
              background:
                "rgba(0,0,0,0.75)",
              color: "white",
              padding:
                "8px 14px",
              borderRadius:
                "8px",
              fontSize: "14px",
              whiteSpace:
                "nowrap",
            }}
          >
            Press <b>E</b> to enter{" "}
            {nearStall}
          </div>
        </Html>
      )}
    </group>
  );
}
/* =========================================================
   FAIR EMPTY STATE (3D Welcome Pavilion)
========================================================= */

function FairEmptyState({ currentLang = "en" }: { currentLang?: string }) {
  const title =
    (TRANSLATIONS.fair_empty_title as any)?.[currentLang] ||
    TRANSLATIONS.fair_empty_title?.en ||
    "Welcome to Kalakriti Virtual Craft Fair";

  const subtitle =
    (TRANSLATIONS.fair_empty_desc as any)?.[currentLang] ||
    TRANSLATIONS.fair_empty_desc?.en ||
    "Stalls are being prepared. Add products from the Seller Dashboard.";

  return (
    <group position={[0, 0, 0]}>
      {/* DECORATIVE ARCHWAY PILLARS */}
      <mesh position={[-3.2, 2.2, 0]}>
        <boxGeometry args={[0.35, 4.4, 0.35]} />
        <meshStandardMaterial color="#6b4226" />
      </mesh>
      <mesh position={[3.2, 2.2, 0]}>
        <boxGeometry args={[0.35, 4.4, 0.35]} />
        <meshStandardMaterial color="#6b4226" />
      </mesh>

      {/* ARCHWAY BEAMS */}
      <mesh position={[0, 4.3, 0]}>
        <boxGeometry args={[7, 0.3, 0.4]} />
        <meshStandardMaterial color="#51321f" />
      </mesh>
      <mesh position={[0, 4.65, 0]}>
        <boxGeometry args={[6.2, 0.25, 0.35]} />
        <meshStandardMaterial color="#70452d" />
      </mesh>

      {/* MARIGOLD GARLAND */}
      {[-2.5, -1.8, -1.1, -0.4, 0.3, 1.0, 1.7, 2.4].map((gx, idx) => (
        <mesh key={idx} position={[gx, 4.05, 0.05]}>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshStandardMaterial color={idx % 2 === 0 ? "#f59e0b" : "#dc2626"} />
        </mesh>
      ))}

      {/* MAIN WOODEN PLAQUE */}
      <mesh position={[0, 3.1, 0]}>
        <boxGeometry args={[6, 1.6, 0.18]} />
        <meshStandardMaterial color="#4e2f1e" />
      </mesh>
      <mesh position={[0, 3.1, 0.1]}>
        <boxGeometry args={[5.7, 1.35, 0.05]} />
        <meshStandardMaterial color="#f7efe3" />
      </mesh>

      {/* TEXT ON PLAQUE */}
      <Text
        position={[0, 3.35, 0.15]}
        fontSize={0.32}
        maxWidth={5.4}
        anchorX="center"
        anchorY="middle"
        color="#70452d"
        outlineWidth={0.015}
        outlineColor="#ead9c3"
      >
        {`🎪 ${title}`}
      </Text>

      <Text
        position={[0, 2.75, 0.15]}
        fontSize={0.2}
        maxWidth={5.2}
        anchorX="center"
        anchorY="middle"
        color="#574235"
      >
        {subtitle}
      </Text>

      {/* ARTISAN WELCOME CHARACTER */}
      <ArtisanCharacter
        position={[0, 0.05, 1.2]}
        shirtColor="#b86f45"
      />
    </group>
  );
}

/* =========================================================
   WORLD
========================================================= */

function World({
  onEnterStall,
  dbProducts,
  hideInteractionPrompt = false,
  currentLang = "en",
}: {
  onEnterStall: (name: string) => void;
  dbProducts: DatabaseProduct[];
  hideInteractionPrompt?: boolean;
  currentLang?: string;
}) {
  const dynamicStalls = useMemo(
    () => generateDynamicStalls(dbProducts, currentLang, TRANSLATIONS),
    [dbProducts, currentLang]
  );

  const totalRows = Math.max(1, Math.ceil(dynamicStalls.length / 2));
  const roadLength = Math.max(24, (totalRows + 1) * 7);

  return (
    <>
      {/* =====================================================
          LIGHTING
      ===================================================== */}

      <ambientLight intensity={1} />

      <directionalLight
        position={[5, 10, 5]}
        intensity={2}
      />

      <directionalLight
        position={[-5, 6, -5]}
        intensity={0.6}
      />

      {/* =====================================================
          GROUND (Scales dynamically)
      ===================================================== */}

      <Ground roadLength={roadLength} />

      {/* =====================================================
          TREES
      ===================================================== */}

      <Tree x={-11} z={-8} />
      <Tree x={11} z={-8} />

      <Tree x={-11} z={5} />
      <Tree x={11} z={5} />

      <Tree x={-11} z={12} />
      <Tree x={11} z={12} />

      {/* =====================================================
          PLAYER
      ===================================================== */}

      <Player
        onEnterStall={onEnterStall}
        hideInteractionPrompt={hideInteractionPrompt}
        activeStalls={dynamicStalls}
        currentLang={currentLang}
      />

      {/* =====================================================
          DYNAMIC STALLS OR EMPTY STATE
      ===================================================== */}

      {dynamicStalls.length === 0 ? (
        <FairEmptyState currentLang={currentLang} />
      ) : (
        dynamicStalls.map((stall) => (
          <Stall
            key={stall.id}
            x={stall.x}
            z={stall.z}
            color={stall.color}
            name={stall.displayName}
            facing={stall.facing}
            type={stall.type}
            onEnter={() => onEnterStall(stall.categoryKey)}
          />
        ))
      )}
    </>
  );
}

/* =========================================================
   SHOP PANEL
========================================================= */

function ShopPanel({
  stallName,
  onClose,
  onSelectProduct,
  dbProducts,
}: {
  stallName: string;
  onClose: () => void;
  onSelectProduct: (
    product: DatabaseProduct
  ) => void;
  dbProducts: DatabaseProduct[];
}) {
  const { currentLang, t } = useLanguage();
  const normalizedKey = getCategoryKey(stallName);
  const displayTitle = getLocalizedStallName(normalizedKey, stallName, currentLang, TRANSLATIONS);
  // Genuinely filter products matching this stall's category strictly
  const displayProducts = getStallProducts(dbProducts, stallName);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.65)",
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "1000px",
          maxHeight: "85vh",
          overflowY: "auto",
          background: "#f8f5ef",
          borderRadius: "24px",
          padding: "30px",
          boxSizing: "border-box",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "30px",
            gap: "20px",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#8b6f52",
                fontSize: "13px",
                fontWeight: "bold",
                letterSpacing: "1px",
              }}
            >
              ARTISAN MARKETPLACE
            </p>

            <h1
              style={{
                margin: "6px 0 8px",
                fontSize: "32px",
              }}
            >
              {displayTitle}
            </h1>

            <p
              style={{
                margin: 0,
                color: "#666",
                fontSize: "15px",
              }}
            >
              Discover handmade products
              directly from the artisan.
            </p>
          </div>

          {/* CLOSE */}

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#222",
              color: "white",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              fontSize: "22px",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* PRODUCTS */}

        {displayProducts.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            {displayProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow:
                    "0 5px 20px rgba(0,0,0,0.08)",
                }}
              >
                {/* PRODUCT IMAGE */}

                <div
                  style={{
                    height: "160px",
                    background:
                      "linear-gradient(135deg, #d6b98c, #b87950)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "55px",
                  }}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: "55px",
                      }}
                    >
                      🧶
                    </span>
                  )}
                </div>

                {/* PRODUCT STORY */}
                <div
                  style={{
                    margin: "0 18px 0",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "#f7efe3",
                    border: "1px solid #ead9c3",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      letterSpacing: "1px",
                      color: "#8b6f52",
                      textTransform: "uppercase",
                      marginBottom: "5px",
                    }}
                  >
                    The Story Behind the Craft
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      lineHeight: "1.55",
                      color: "#5f5146",
                    }}
                  >
                    {product.story ||
                      product.description ||
                      "A handmade craft carrying the skill and tradition of its artisan."}
                  </div>
                </div>

                {/* PRODUCT DETAILS */}

                <div
                  style={{
                    padding: "18px",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 8px",
                      fontSize: "18px",
                    }}
                  >
                    {product.title}
                  </h3>

                  <p
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      minHeight: "42px",
                    }}
                  >
                    {product.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      gap: "10px",
                      marginTop: "15px",
                    }}
                  >
                    <strong
                      style={{
                        fontSize: "18px",
                      }}
                    >
                      ₹
                      {Number(
                        product.price
                      ).toLocaleString("en-IN")}
                    </strong>

                    <button
                      onClick={() => {
                        recordCraftDiscovery(product.id, product.title || product.category);
                        onSelectProduct(product);
                      }}
                      style={{
                        background: "#3155a5",
                        color: "white",
                        border: "none",
                        padding: "9px 14px",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      View Product
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              background: "white",
              borderRadius: "16px",
              border: "2px dashed #d6b98c",
              margin: "15px 0",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏪</div>
            <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#3e2723", margin: "0 0 8px 0" }}>
              {t("stall_no_products") || "No products available in this stall yet."}
            </h3>
            <p style={{ fontSize: "14px", color: "#795548", maxWidth: "420px", margin: "0 auto", lineHeight: 1.5 }}>
              {t("fair_empty_desc") || "Artisans can list their authentic handmade creations from the Seller Dashboard to display them in this craft pavilion."}
            </p>
          </div>
        )}

        {/* BACK BUTTON */}

        <button
          onClick={onClose}
          style={{
            marginTop: "25px",
            padding: "12px 20px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            background: "white",
            cursor: "pointer",
            fontSize: "15px",
          }}
        >
          ← Back to Marketplace
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN GAME
========================================================= */

export default function GameWorld({
  onExit,
  inventory = [],
  onAddToCart,
}: GameWorldProps) {
  const { currentLang, t } = useLanguage();


  const [enteredStall, setEnteredStall] =
    useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] =
    useState<DatabaseProduct | null>(null);

  const [cart, setCart] = useState<
    DatabaseProduct[]
  >([]);

  const [cartOpen, setCartOpen] =
    useState(false);

  const [dbProducts, setDbProducts] =
    useState<DatabaseProduct[]>([]);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const handleEnterStall = (stallName: string) => {
    setEnteredStall(stallName);
    recordStallVisit(stallName);
    recordCraftDiscovery(stallName);
  };

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const addToCart = (
    product: DatabaseProduct
  ) => {
    const currentStock = product.stock !== undefined ? Number(product.stock) : 0;
    if (currentStock <= 0) {
      return;
    }
    const alreadyInCart = cart.filter((p) => p.id === product.id).length;
    if (alreadyInCart >= currentStock) {
      return;
    }

    setCart((previousCart) => [
      ...previousCart,
      product,
    ]);

    if (onAddToCart) {
      onAddToCart(product);
    }

    awardXp(50, `Added ${product.title} to cart`);

    setSelectedProduct(null);
  };

  /* =====================================================
     REMOVE FROM CART
  ===================================================== */

  const removeFromCart = (index: number) => {
    setCart((previousCart) =>
      previousCart.filter(
        (_, i) => i !== index
      )
    );
  };

  /* =====================================================
     TOTAL
  ===================================================== */

  const total = cart.reduce(
    (sum, product) => {
      const price = Number(product.price);

      return sum + price;
    },
    0
  );

  /* =====================================================
     KALAKRITI LOCAL CATALOGUE
     Seller catalogue writes here:
       localStorage["kalakriti_inventory"]
     This is merged into the fair immediately.
  ===================================================== */

  const convertLocalInventory = (items: any[]): DatabaseProduct[] =>
    (items || [])
      .filter((item) => Number(item.quantity ?? 1) > 0)
      .map((item) => ({
        id: String(item.id ?? `local-${Date.now()}`),
        title:
          item.title_en ||
          item.title ||
          item.title_hi ||
          item.title_local ||
          "Handmade Craft",
        title_en: item.title_en,
        title_hi: item.title_hi,
        artisan_id: String(item.artisan_id ?? "local-artisan"),
        description:
          item.quick_summary_en ||
          item.description ||
          item.quick_summary_hi ||
          "Handmade product by an Indian artisan.",
        story:
          item.story_en ||
          item.story_hi ||
          item.description ||
          item.quick_summary_en ||
          "",
        image_url: item.imageUrl || item.image_url || "",
        category: item.categoryName || item.category || item.craft || extractProductCategory(item) || "",
        categoryName: item.categoryName || extractProductCategory(item),
        price: Number(item.suggested_price ?? item.price ?? 0),
        stock: Math.max(0, Number(item.quantity ?? 1)),
        source: "local" as const,
        artisan: {
          id: String(item.artisan_id ?? "local-artisan"),
          name: item.artisan_name || item.artisanName || "Kalakriti Artisan",
          bio: null,
          location: item.artisan_region || item.location || null,
        },
      }));

  const [localCatalogueProducts, setLocalCatalogueProducts] =
    useState<DatabaseProduct[]>(() => {
      try {
        const saved = localStorage.getItem("kalakriti_inventory");
        return convertLocalInventory(saved ? JSON.parse(saved) : inventory);
      } catch {
        return convertLocalInventory(inventory);
      }
    });

  const refreshLocalCatalogue = () => {
    try {
      const saved = localStorage.getItem("kalakriti_inventory");
      setLocalCatalogueProducts(
        convertLocalInventory(saved ? JSON.parse(saved) : inventory)
      );
    } catch (error) {
      console.warn("Catalogue sync failed:", error);
    }
  };

  useEffect(() => {
    refreshLocalCatalogue();

    const sync = () => refreshLocalCatalogue();
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);

    // App dispatches a custom "storage" event after every catalogue save.
    // Polling is a fallback for same-tab state changes.
    const timer = window.setInterval(refreshLocalCatalogue, 1000);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
      window.clearInterval(timer);
    };
  }, [inventory]);

  /* =====================================================
     SUPABASE PRODUCTS
  ===================================================== */

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);

      const {
        data: productData,
        error: productError,
      } = await supabase
        .from("products")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (productError) {
        console.error(
          "Products error:",
          productError
        );

        setLoadingProducts(false);

        return;
      }

      console.log(
        "Products from Supabase:",
        productData
      );

      const artisanIds = [
        ...new Set(
          (productData || [])
            .map(
              (product) =>
                product.artisan_id
            )
            .filter(Boolean)
        ),
      ];

      let profiles: any[] = [];

      if (artisanIds.length > 0) {
        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "id, name, bio, location"
          )
          .in("id", artisanIds);

        if (profileError) {
          console.error(
            "Profiles error:",
            profileError
          );
        } else {
          profiles = profileData || [];
        }
      }

      const combinedProducts = (
        productData || []
      ).map((product) => ({
        ...product,

        artisan:
          profiles.find(
            (profile) =>
              profile.id ===
              product.artisan_id
          ) || null,
      }));

      console.log(
        "Products with artisans:",
        combinedProducts
      );

      const remoteProducts = combinedProducts as DatabaseProduct[];

      // Local catalogue is the source used by the current Kalakriti seller flow.
      // Keep Supabase products too, but don't duplicate local products.
      const mergedProducts = [
        ...localCatalogueProducts,
        ...remoteProducts.filter(
          (remote) =>
            !localCatalogueProducts.some(
              (local) =>
                String(local.id) === String(remote.id) ||
                String(local.title).trim().toLowerCase() ===
                  String(remote.title ?? "").trim().toLowerCase()
            )
        ),
      ];

      setDbProducts(mergedProducts);

      setLoadingProducts(false);
    };

    fetchProducts();
  }, []);

  const mappedFallback = mapInventoryToStallProducts(inventory);
  const effectiveProducts =
    dbProducts.length > 0
      ? dbProducts
      : localCatalogueProducts.length > 0
      ? localCatalogueProducts
      : mappedFallback;

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#87ceeb",
        overflow: "hidden",
      }}
    >
      {/* =================================================
          BACK TO MARKETPLACE BUTTON
      ================================================= */}

      {onExit && (
        <button
          type="button"
          onClick={onExit}
          style={{
            position: "fixed",
            top: "20px",
            left: "20px",
            zIndex: 150,
            background: "rgba(255, 255, 255, 0.96)",
            color: "#1c1917",
            padding: "10px 20px",
            borderRadius: "9999px",
            fontWeight: "bold",
            boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,0,0,0.1)",
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backdropFilter: "blur(8px)",
          }}
          aria-label="Exit Craft Fair"
          title="Back to Marketplace"
        >
          <span style={{ fontSize: "16px" }}>←</span>
          <span>Exit Craft Fair</span>
        </button>
      )}

      {/* =================================================
          EXPLORATION BANNER PILL
      ================================================= */}

      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 140,
          background: "rgba(255, 255, 255, 0.92)",
          padding: "8px 18px",
          borderRadius: "9999px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          fontWeight: "600",
          color: "#5b21b6",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(91, 33, 182, 0.15)",
          pointerEvents: "none",
        }}
      >
        <span>🎪</span>
        <span>
          {effectiveProducts.length === 0
            ? t("fair_empty_title") || "3D Virtual Craft Fair • Welcome Plaza"
            : t("fair_title") || "3D Virtual Craft Fair • Explore Stalls"}
        </span>
      </div>

      {/* =================================================
          CONTROLS HINT HUD
      ================================================= */}

      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          zIndex: 140,
          background: "rgba(20, 20, 20, 0.78)",
          color: "white",
          padding: "10px 16px",
          borderRadius: "14px",
          fontSize: "12px",
          backdropFilter: "blur(8px)",
          pointerEvents: "none",
          boxShadow: "0 4px 15px rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.1)",
          lineHeight: "1.6",
        }}
      >
        <div style={{ fontWeight: "bold", color: "#fbbf24", marginBottom: "2px" }}>
          🎮 Controls
        </div>
        <div>
          <span style={{ fontWeight: "700" }}>W A S D</span> or <span style={{ fontWeight: "700" }}>Arrow Keys</span> to walk
        </div>
        <div>
          Approach stall & press <span style={{ fontWeight: "700" }}>E</span> / <span style={{ fontWeight: "700" }}>Enter</span> (or click stall)
        </div>
      </div>

      {/* =================================================
          VIRTUAL TOUCH D-PAD (Mobile Friendly)
      ================================================= */}
      <div
        className="game-touch-controls"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 140,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          userSelect: "none",
          touchAction: "manipulation",
        }}
      >
        <button
          type="button"
          onPointerDown={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "w" }))}
          onPointerUp={() => window.dispatchEvent(new KeyboardEvent("keyup", { key: "w" }))}
          onPointerLeave={() => window.dispatchEvent(new KeyboardEvent("keyup", { key: "w" }))}
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "14px",
            background: "rgba(255, 255, 255, 0.92)",
            color: "#1c1917",
            fontWeight: "bold",
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            border: "1px solid rgba(0,0,0,0.12)",
            cursor: "pointer",
          }}
          aria-label="Move Forward"
        >
          ▲
        </button>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onPointerDown={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }))}
            onPointerUp={() => window.dispatchEvent(new KeyboardEvent("keyup", { key: "a" }))}
            onPointerLeave={() => window.dispatchEvent(new KeyboardEvent("keyup", { key: "a" }))}
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.92)",
              color: "#1c1917",
              fontWeight: "bold",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              border: "1px solid rgba(0,0,0,0.12)",
              cursor: "pointer",
            }}
            aria-label="Move Left"
          >
            ◀
          </button>
          <button
            type="button"
            onPointerDown={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "s" }))}
            onPointerUp={() => window.dispatchEvent(new KeyboardEvent("keyup", { key: "s" }))}
            onPointerLeave={() => window.dispatchEvent(new KeyboardEvent("keyup", { key: "s" }))}
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.92)",
              color: "#1c1917",
              fontWeight: "bold",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              border: "1px solid rgba(0,0,0,0.12)",
              cursor: "pointer",
            }}
            aria-label="Move Backward"
          >
            ▼
          </button>
          <button
            type="button"
            onPointerDown={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }))}
            onPointerUp={() => window.dispatchEvent(new KeyboardEvent("keyup", { key: "d" }))}
            onPointerLeave={() => window.dispatchEvent(new KeyboardEvent("keyup", { key: "d" }))}
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.92)",
              color: "#1c1917",
              fontWeight: "bold",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              border: "1px solid rgba(0,0,0,0.12)",
              cursor: "pointer",
            }}
            aria-label="Move Right"
          >
            ▶
          </button>
        </div>
      </div>

      {/* =================================================
          3D GAME
      ================================================= */}

      <Canvas
        camera={{
          position: [0, 4, 10],
          fov: 60,
        }}
      >
        <World
          onEnterStall={handleEnterStall}
          dbProducts={effectiveProducts}
          hideInteractionPrompt={Boolean(enteredStall || selectedProduct || cartOpen)}
          currentLang={currentLang}
        />
      </Canvas>

      {/* =================================================
          SHOP PANEL
      ================================================= */}

      {enteredStall && (
        <ShopPanel
          stallName={enteredStall}
          onClose={() =>
            setEnteredStall(null)
          }
          onSelectProduct={
            setSelectedProduct
          }
          dbProducts={effectiveProducts}
        />
      )}

      {/* =================================================
          PRODUCT MODAL
      ================================================= */}

      {selectedProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.7)",
            zIndex: 200,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "30px",
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "700px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "white",
              borderRadius: "24px",
              padding: "30px",
              fontFamily:
                "Arial, sans-serif",
              boxSizing: "border-box",
            }}
          >
            {/* CLOSE */}

            <button
              onClick={() =>
                setSelectedProduct(null)
              }
              style={{
                float: "right",
                border: "none",
                background: "#222",
                color: "white",
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            {/* PRODUCT IMAGE */}

            <div
              style={{
                height: "260px",
                background:
                  "linear-gradient(135deg, #d6b98c, #b87950)",
                borderRadius: "16px",
                display: "flex",
                justifyContent:
                  "center",
                alignItems: "center",
                fontSize: "90px",
                marginBottom: "25px",
                overflow: "hidden",
              }}
            >
              {selectedProduct.image_url ? (
                <img
                  src={
                    selectedProduct.image_url
                  }
                  alt={
                    selectedProduct.title
                  }
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "16px",
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize: "90px",
                  }}
                >
                  🧶
                </span>
              )}
            </div>

            {/* ARTISAN */}

            <p
              style={{
                color: "#8b6f52",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              {selectedProduct.artisan
                ?.name ||
                "Artisan Marketplace"}
            </p>

            {/* TITLE */}

            <h1>
              {selectedProduct.title}
            </h1>

            {/* DESCRIPTION */}

            <p
              style={{
                color: "#666",
                lineHeight: "1.6",
              }}
            >
              {
                selectedProduct.description
              }
            </p>

            {/* PRICE */}

            <h2>
              ₹
              {Number(
                selectedProduct.price
              ).toLocaleString("en-IN")}
            </h2>

            {/* STOCK INFO */}
            <div style={{ marginTop: "6px", fontSize: "13px", fontWeight: "600", color: (selectedProduct.stock ?? 0) <= 0 ? "#dc2626" : "#4b5563" }}>
              {(selectedProduct.stock ?? 0) <= 0 ? "Out of Stock" : `In Stock: ${selectedProduct.stock}`}
            </div>

            {/* ADD TO CART */}

            <button
              disabled={(selectedProduct.stock ?? 0) <= 0}
              onClick={() =>
                addToCart(
                  selectedProduct
                )
              }
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: "10px",
                background: (selectedProduct.stock ?? 0) <= 0 ? "#9ca3af" : "#3155a5",
                color: "white",
                fontSize: "16px",
                cursor: (selectedProduct.stock ?? 0) <= 0 ? "not-allowed" : "pointer",
                marginTop: "10px",
              }}
            >
              {(selectedProduct.stock ?? 0) <= 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          CART BUTTON
      ================================================= */}

      <button
        onClick={() => setCartOpen(true)}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 50,
          background: "white",
          padding: "12px 18px",
          borderRadius: "12px",
          fontWeight: "bold",
          boxShadow:
            "0 5px 20px rgba(0,0,0,0.15)",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        🛒 Cart ({cart.length})
      </button>

      {/* =================================================
          CART PANEL
      ================================================= */}

      {cartOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.7)",
            zIndex: 300,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              width: "420px",
              maxWidth: "90%",
              height: "100%",
              background: "#f8f5ef",
              padding: "30px",
              boxSizing: "border-box",
              fontFamily:
                "Arial, sans-serif",
              overflowY: "auto",
            }}
          >
            {/* CART HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "25px",
              }}
            >
              <h1
                style={{
                  margin: 0,
                }}
              >
                Your Cart
              </h1>

              <button
                onClick={() =>
                  setCartOpen(false)
                }
                style={{
                  border: "none",
                  background: "#222",
                  color: "white",
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* EMPTY CART */}

            {cart.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "100px",
                  color: "#666",
                }}
              >
                <div
                  style={{
                    fontSize: "60px",
                  }}
                >
                  🛒
                </div>

                <h2>
                  Your cart is empty
                </h2>

                <p>
                  Explore artisan products
                  and add something you
                  love.
                </p>
              </div>
            ) : (
              <>
                {/* CART ITEMS */}

                {cart.map(
                  (product, index) => (
                    <div
                      key={`${product.id}-${index}`}
                      style={{
                        background: "white",
                        padding: "15px",
                        borderRadius: "12px",
                        marginBottom:
                          "12px",
                        display: "flex",
                        gap: "15px",
                        alignItems:
                          "center",
                      }}
                    >
                      {/* IMAGE */}

                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          background:
                            "#d6b98c",
                          borderRadius:
                            "10px",
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          fontSize: "30px",
                          flexShrink: 0,
                          overflow:
                            "hidden",
                        }}
                      >
                        {product.image_url ? (
                          <img
                            src={
                              product.image_url
                            }
                            alt={
                              product.title
                            }
                            style={{
                              width:
                                "100%",
                              height:
                                "100%",
                              objectFit:
                                "cover",
                              borderRadius:
                                "10px",
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize:
                                "30px",
                            }}
                          >
                            🧶
                          </span>
                        )}
                      </div>

                      {/* DETAILS */}

                      <div
                        style={{
                          flex: 1,
                        }}
                      >
                        <strong>
                          {product.title}
                        </strong>

                        <p
                          style={{
                            margin:
                              "5px 0",
                            color:
                              "#666",
                          }}
                        >
                          ₹
                          {Number(
                            product.price
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>

                      {/* REMOVE */}

                      <button
                        onClick={() =>
                          removeFromCart(
                            index
                          )
                        }
                        style={{
                          border: "none",
                          background:
                            "#eee",
                          borderRadius:
                            "8px",
                          padding:
                            "8px",
                          cursor:
                            "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )
                )}

                {/* TOTAL */}

                <div
                  style={{
                    marginTop: "30px",
                    paddingTop: "20px",
                    borderTop:
                      "1px solid #ddd",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      fontSize: "20px",
                      fontWeight:
                        "bold",
                    }}
                  >
                    <span>
                      Total
                    </span>

                    <span>
                      ₹
                      {total.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setCartOpen(false);
                      if (onExit) onExit();
                    }}
                    style={{
                      width: "100%",
                      marginTop:
                        "20px",
                      padding:
                        "15px",
                      border: "none",
                      borderRadius:
                        "10px",
                      background:
                        "#3155a5",
                      color: "white",
                      fontSize:
                        "16px",
                      cursor:
                        "pointer",
                      fontWeight:
                        "bold",
                    }}
                  >
                    Proceed to Checkout →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}