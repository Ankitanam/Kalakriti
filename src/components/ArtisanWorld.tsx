import { useEffect, useRef } from "react";
import sceneImage from "../assets/kalakriti_reference_scene.png";

export default function ArtisanWorld() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;

    if (!scene) return;

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let animationFrame = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;

      targetX = x * 45;
      targetY = y * 30;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      scene.style.transform = `
        translate3d(${-currentX}px, ${-currentY}px, 0)
        scale(1.08)
      `;

      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);

    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <section className="artisan-world">
      <div
        ref={sceneRef}
        className="artisan-scene"
      >
        <div className="artisan-background">
          <img
            src={sceneImage}
            alt="Indian artisan marketplace"
          />
        </div>
      </div>
    </section>
  );
}