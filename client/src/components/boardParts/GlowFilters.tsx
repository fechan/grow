export function GlowFilters() {
  return (
    <>
      <filter id="back-glow">
        <feColorMatrix type="matrix" values="1 0 0 0   1
                                              0 1 0 0   1
                                              0 0 1 0   1
                                              0 0 0 1   0"/>
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="back-glow-color">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </>
  );
}