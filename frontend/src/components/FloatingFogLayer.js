function FloatingFogLayer() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[2] overflow-hidden" aria-hidden="true">
      <div className="fog-drift fog-drift-a absolute -left-1/4 top-0 h-full w-[70%] rounded-full bg-slate-400/10 blur-[100px]" />
      <div className="fog-drift fog-drift-b absolute -right-1/4 bottom-0 h-full w-[65%] rounded-full bg-red-950/15 blur-[120px]" />
    </div>
  );
}

export default FloatingFogLayer;
