import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { supabase } from "../lib/supabase";

/* =========================================================
   STALL DATA
========================================================= */

const stalls = [
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

/* =========================================================
   GROUND
========================================================= */

function Ground() {
  return (
    <>
      {/* MAIN GROUND */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#d6b98c" />
      </mesh>

      {/* MAIN ROAD */}
      <mesh position={[0, 0.03, 2]}>
        <boxGeometry args={[5, 0.05, 24]} />
        <meshStandardMaterial color="#c9a77b" />
      </mesh>

      {/* LEFT SIDE WALK */}
      <mesh position={[-6, 0.03, 2]}>
        <boxGeometry args={[8, 0.05, 3]} />
        <meshStandardMaterial color="#c9a77b" />
      </mesh>

      {/* RIGHT SIDE WALK */}
      <mesh position={[6, 0.03, 2]}>
        <boxGeometry args={[8, 0.05, 3]} />
        <meshStandardMaterial color="#c9a77b" />
      </mesh>

      {/* ROAD CENTER STRIP */}
      <mesh position={[0, 0.065, 2]}>
        <boxGeometry args={[0.12, 0.02, 24]} />
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

      <Html
        position={[0, 4.25, -1.57]}
        center
      >
        <div
          style={{
            background: "#4e2f1e",
            color: "#f6dfb0",
            padding: "8px 18px",
            borderRadius: "5px",
            fontWeight: "bold",
            fontSize: "15px",
            whiteSpace: "nowrap",
            border: "2px solid #2e1b11",
            boxShadow:
              "0 4px 10px rgba(0,0,0,0.3)",
          }}
        >
          {name}
        </div>
      </Html>

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
}: {
  onEnterStall: (stallName: string) => void;
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

  // =========================
  // KEYBOARD CONTROLS
  // =========================

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === "w") {
        keys.current.w = true;
      }

      if (key === "a") {
        keys.current.a = true;
      }

      if (key === "s") {
        keys.current.s = true;
      }

      if (key === "d") {
        keys.current.d = true;
      }

      if (key === "e") {
        keys.current.e = true;
      }

      if (
        ["w", "a", "s", "d", "e"].includes(key)
      ) {
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === "w") {
        keys.current.w = false;
      }

      if (key === "a") {
        keys.current.a = false;
      }

      if (key === "s") {
        keys.current.s = false;
      }

      if (key === "d") {
        keys.current.d = false;
      }

      if (key === "e") {
        keys.current.e = false;
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    window.addEventListener(
      "keyup",
      handleKeyUp
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      window.removeEventListener(
        "keyup",
        handleKeyUp
      );
    };
  }, []);

  // =========================
  // GAME LOOP
  // =========================

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const speed = 0.08;
    const turnSpeed = 0.04;

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

    const direction = new THREE.Vector3(
      0,
      0,
      -1
    );

    direction.applyQuaternion(
      playerRef.current.quaternion
    );

    // =========================
    // W / S = MOVE
    // =========================

    let newX =
      playerRef.current.position.x;

    let newZ =
      playerRef.current.position.z;

    if (keys.current.w) {
      newX += direction.x * speed;
      newZ += direction.z * speed;
    }

    if (keys.current.s) {
      newX -= direction.x * speed;
      newZ -= direction.z * speed;
    }

    // =========================
    // COLLISION WITH STALLS
    // =========================

    let blocked = false;

    for (const stall of stalls) {
      if (
        Math.abs(newX - stall.x) < 2.5 &&
        Math.abs(newZ - stall.z) < 2
      ) {
        blocked = true;
        break;
      }
    }

    if (!blocked) {
      playerRef.current.position.x = newX;
      playerRef.current.position.z = newZ;
    }

    // =========================
    // FIND NEAREST STALL
    // =========================

    let nearestStall:
      | (typeof stalls)[number]
      | null = null;

    let closestDistance = Infinity;

    for (const stall of stalls) {
      const dx =
        playerRef.current.position.x -
        stall.x;

      const dz =
        playerRef.current.position.z -
        stall.z;

      const distance = Math.sqrt(
        dx * dx + dz * dz
      );

      if (
        distance < 4 &&
        distance < closestDistance
      ) {
        closestDistance = distance;
        nearestStall = stall;
      }
    }

    // =========================
    // SHOW E MESSAGE
    // =========================

    setNearStall(
      nearestStall
        ? nearestStall.name
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
        nearestStall.name
      );

      keys.current.e = false;
    }

    // =========================
    // WALKING ANIMATION
    // =========================

    const isMoving =
      (keys.current.w ||
        keys.current.s) &&
      !blocked;

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

      {nearStall && (
        <Html
          position={[0, 2.8, 0]}
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
   WORLD
========================================================= */

type DatabaseProduct = {
  id: string;
  title: string;
  artisan_id: string;
  description: string;
  image_url: string;
  category: string;
  price: number | string;
  stock: number;

  artisan?: {
    id: string;
    name: string;
    bio: string | null;
    location: string | null;
  } | null;
};

function World({
  onEnterStall,
  dbProducts,
}: {
  onEnterStall: (name: string) => void;
  dbProducts: DatabaseProduct[];
}) {
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
          GROUND
      ===================================================== */}

      <Ground />

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
      />

      {/* =====================================================
          LEFT STALLS
      ===================================================== */}

      <Stall
        x={-6}
        z={-5}
        color="#b86f45"
        name="Meera Handloom"
        facing="left"
        type="textile"
        onEnter={() =>
          onEnterStall("Meera Handloom")
        }
      />

      <Stall
        x={-6}
        z={2}
        color="#477da3"
        name="Rajasthan Pottery"
        facing="left"
        type="pottery"
        onEnter={() =>
          onEnterStall("Rajasthan Pottery")
        }
      />

      <Stall
        x={-6}
        z={9}
        color="#9a633c"
        name="Woodcraft"
        facing="left"
        type="wood"
        onEnter={() =>
          onEnterStall("Woodcraft")
        }
      />

      {/* =====================================================
          RIGHT STALLS
      ===================================================== */}

      <Stall
        x={6}
        z={-5}
        color="#a65f42"
        name="Banarasi Weaves"
        facing="right"
        type="textile"
        onEnter={() =>
          onEnterStall("Banarasi Weaves")
        }
      />

      <Stall
        x={6}
        z={2}
        color="#477da3"
        name="Blue Pottery"
        facing="right"
        type="pottery"
        onEnter={() =>
          onEnterStall("Blue Pottery")
        }
      />

      <Stall
        x={6}
        z={9}
        color="#d19b35"
        name="Indian Jewellery"
        facing="right"
        type="jewellery"
        onEnter={() =>
          onEnterStall("Indian Jewellery")
        }
      />
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
  const normalizedStall = stallName.toLowerCase();

  const getStallKeywords = (name: string) => {
    if (name.includes("wood")) {
      return [
        "wood", "wooden", "woodwork", "puppet", "doll",
        "kathputli", "लकड़ी", "लकड़ी", "कठपुतली"
      ];
    }

    if (name.includes("pottery") || name.includes("pot")) {
      return [
        "pottery", "pot", "clay", "ceramic", "terracotta",
        "mitti", "मिट्टी", "मृत्तिका"
      ];
    }

    if (name.includes("weav") || name.includes("handloom")) {
      return [
        "weaving", "weave", "textile", "handloom", "saree",
        "silk", "fabric", "cloth", "embroidery", "बुनाई", "कढ़ाई"
      ];
    }

    if (name.includes("jewel")) {
      return [
        "jewellery", "jewelry", "jewel", "ornament",
        "gold", "silver", "आभूषण"
      ];
    }

    if (name.includes("metal")) {
      return [
        "metal", "metalwork", "brass", "copper", "iron",
        "पीतल", "तांबा"
      ];
    }

    if (name.includes("paint")) {
      return [
        "painting", "paint", "art", "madhubani", "pichwai", "चित्रकारी"
      ];
    }

    return [];
  };

  const keywords = getStallKeywords(normalizedStall);

  const stallProducts = dbProducts.filter((product) => {
    const searchableText = [
      product.title,
      product.category,
      product.description,
      (product as any).material,
      (product as any).craft,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return keywords.some((keyword) =>
      searchableText.includes(keyword.toLowerCase())
    );
  });

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
              {stallName}
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

        {stallProducts.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            {stallProducts.map((product) => (
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
                      onClick={() =>
                        onSelectProduct(product)
                      }
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
          <p>
            No products available for this
            artisan yet.
          </p>
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
          ← Back to Fair
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN GAME
========================================================= */
interface GameWorldProps {
  onExit: () => void;
}

export default function GameWorld({ onExit }: GameWorldProps) {


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

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const addToCart = (
    product: DatabaseProduct
  ) => {
    setCart((previousCart) => [
      ...previousCart,
      product,
    ]);

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
     CATALOGUE PRODUCTS

     The artisan catalogue stores published products in
     localStorage under "kalakriti_inventory".
     Read that same source so products appear in the fair
     immediately after catalogue publish.

     Supabase remains a fallback/legacy source.
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    const normalize = (value: unknown) =>
      String(value ?? "")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\\u0300-\\u036f]/g, "")
        .trim();

    const localInventoryToProducts = (): DatabaseProduct[] => {
      try {
        const raw = localStorage.getItem("kalakriti_inventory");
        if (!raw) return [];

        const items = JSON.parse(raw);
        if (!Array.isArray(items)) return [];

        return items.map((item: any, index: number) => ({
          id: String(item.id ?? `catalog-${index}`),
          artisan_id: String(
            item.artisan_id ?? item.artisanId ?? "local-catalogue-artisan"
          ),
          title:
            item.title_en ||
            item.title ||
            item.title_hi ||
            item.title_local ||
            "Handmade Product",
          description:
            item.quick_summary_en ||
            item.quick_summary_hi ||
            item.description ||
            item.story_en ||
            item.story_hi ||
            "Handcrafted product from a Kalakriti artisan.",
          image_url:
            item.imageUrl ||
            item.enhancedImageUrl ||
            item.originalImageUrl ||
            "",
          category:
            item.categoryName ||
            item.category ||
            item.craft ||
            item.localizedContent?.craft ||
            "",
          price: Number(
            item.suggested_price ?? item.suggestedPrice ?? item.price ?? 0
          ),
          stock: Math.max(0, Number(item.quantity ?? item.stock ?? 1)),
          artisan: {
            id: String(
              item.artisan_id ?? item.artisanId ?? "local-catalogue-artisan"
            ),
            name:
              item.artisan_name ||
              item.artisanName ||
              "Kalakriti Artisan",
            bio:
              item.quick_summary_en ||
              item.quick_summary_hi ||
              null,
            location:
              item.artisan_region || item.location || null,
          },
        }));
      } catch (error) {
        console.error("Catalogue localStorage error:", error);
        return [];
      }
    };

    const mergeProducts = (
      localProducts: DatabaseProduct[],
      remoteProducts: DatabaseProduct[]
    ) => {
      const merged = [...localProducts];

      for (const remote of remoteProducts) {
        const remoteTitle = normalize(remote.title);
        const alreadyExists = merged.some(
          (local) =>
            local.id === remote.id ||
            (remoteTitle && normalize(local.title) === remoteTitle)
        );

        if (!alreadyExists) merged.push(remote);
      }

      return merged;
    };

    const fetchProducts = async () => {
      // LOCAL CATALOGUE IS THE PRIMARY SOURCE.
      // This is what makes a newly published catalogue item appear
      // without requiring the seller to add it again manually.
      const localProducts = localInventoryToProducts();

      if (mounted) {
        setDbProducts(localProducts);
        setLoadingProducts(false);
      }

      // Also load existing Supabase products.
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (productError) {
        console.error("Supabase products error:", productError);
        return;
      }

      const artisanIds = [
        ...new Set(
          (productData || [])
            .map((product) => product.artisan_id)
            .filter(Boolean)
        ),
      ];

      let profiles: any[] = [];

      if (artisanIds.length > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, name, bio, location")
          .in("id", artisanIds);

        if (profileError) {
          console.error("Profiles error:", profileError);
        } else {
          profiles = profileData || [];
        }
      }

      const remoteProducts = (productData || []).map((product) => ({
        ...product,
        artisan:
          profiles.find(
            (profile) => profile.id === product.artisan_id
          ) || null,
      })) as DatabaseProduct[];

      if (mounted) {
        setDbProducts(
          mergeProducts(localInventoryToProducts(), remoteProducts)
        );
      }
    };

    fetchProducts();

    // App.tsx dispatches this event immediately after it writes the
    // catalogue to localStorage. This handles SAME-TAB updates.
    const handleCatalogueChanged = () => {
      console.log("Catalogue updated — refreshing 3D fair");
      const localProducts = localInventoryToProducts();
      if (mounted) {
        setDbProducts(localProducts);
        setLoadingProducts(false);
      }
      fetchProducts();
    };

    window.addEventListener("storage", handleCatalogueChanged);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchProducts();
    };

    document.addEventListener("visibilitychange", handleVisibility);

    // Backup polling for updates made from another tab.
    const refreshTimer = window.setInterval(() => {
      if (document.visibilityState !== "visible" || !mounted) return;

      const localProducts = localInventoryToProducts();
      setDbProducts((current) => {
        const currentKey = current.map((p) => p.id).join("|");
        const localKey = localProducts.map((p) => p.id).join("|");
        return currentKey === localKey ? current : localProducts;
      });
    }, 1500);

    return () => {
      mounted = false;
      window.removeEventListener("storage", handleCatalogueChanged);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.clearInterval(refreshTimer);
    };
  }, []);

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
          BACK TO MARKETPLACE
      ================================================= */}

      <button
        type="button"
        onClick={onExit}
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          zIndex: 100,
          padding: "12px 18px",
          border: "none",
          borderRadius: "12px",
          background: "white",
          color: "#3d2b1f",
          fontWeight: "bold",
          fontSize: "15px",
          cursor: "pointer",
          boxShadow: "0 5px 20px rgba(0,0,0,0.18)",
        }}
      >
        ← Back to Marketplace
      </button>

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
          onEnterStall={setEnteredStall}
          dbProducts={dbProducts}
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
          dbProducts={dbProducts}
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

            {/* ADD TO CART */}

            <button
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
                background: "#3155a5",
                color: "white",
                fontSize: "16px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Add to Cart
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
                    }}
                  >
                    Proceed to Checkout
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