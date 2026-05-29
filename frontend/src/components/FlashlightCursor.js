import { useEffect, useRef } from "react";

function FlashlightCursor() {
  const overlayRef = useRef(null);
  const positionRef = useRef({ x: -9999, y: -9999 });
  const frameRef = useRef(null);

  useEffect(() => {
    const applyPosition = () => {
      if (!overlayRef.current) return;
      overlayRef.current.style.setProperty("--mx", `${positionRef.current.x}px`);
      overlayRef.current.style.setProperty("--my", `${positionRef.current.y}px`);
      frameRef.current = null;
    };

    const onMouseMove = (event) => {
      positionRef.current = { x: event.clientX, y: event.clientY };
      if (!frameRef.current) {
        frameRef.current = requestAnimationFrame(applyPosition);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="flashlight-overlay pointer-events-none fixed inset-0 z-[4]"
      aria-hidden="true"
    />
  );
}

export default FlashlightCursor;
