// Kalyan-Ji Bakery — Isometric Cake Renderer
// Renders a live, beautiful isometric cake SVG based on config

function IsometricCake({ config, size = 300 }) {
  const {
    flavour = 'vanilla',
    filling = 'buttercream',
    frosting = 'smooth-buttercream',
    frostingColor = 'ivory',
    decorations = [],
    shape = 'round',
    tiers = 1,
    message = '',
    candles = false,
    candleCount = 0,
  } = config;

  const fd = (window.CAKE_DATA || {});
  const frostingColorData = (fd.frostingColors || []).find(c => c.id === frostingColor) || { hex: '#FFF8EE' };
  const flavourData = (fd.flavours || []).find(f => f.id === flavour) || { color: '#F5E6C8' };
  const frostingData = (fd.frostings || []).find(f => f.id === frosting) || { style: 'smooth' };
  const fillingData = (fd.fillings || []).find(f => f.id === filling) || { color: '#FFF8E7' };

  const frostHex = frostingColorData.hex;
  const spongeColor = flavourData.color;
  const fillColor = fillingData.color;

  // Darken/lighten helpers
  function shadeColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  const frostDark = shadeColor(frostHex, -30);
  const frostMid = shadeColor(frostHex, -12);
  const spongeDark = shadeColor(spongeColor, -20);

  const cx = size / 2;
  const isNaked = frostingData.style === 'naked';
  const isDrip = frostingData.style === 'drip';
  const isTextured = frostingData.style === 'textured';

  const tierCount = Math.min(Math.max(tiers, 1), 4);
  const tierConfigs = getTierConfigs(tierCount, size, shape);

  const hasFlowers = decorations.includes('fresh-flowers');
  const hasGoldLeaf = decorations.includes('gold-leaf');
  const hasSprinkles = decorations.includes('sprinkles');
  const hasMacarons = decorations.includes('macarons');
  const hasBerries = decorations.includes('berries');
  const hasChocShards = decorations.includes('chocolate-shards');
  const hasPearls = decorations.includes('sugar-pearls');
  const hasGlitter = decorations.includes('edible-glitter');
  const hasRosettes = decorations.includes('rosettes');
  const hasFondantShapes = decorations.includes('fondant-shapes');

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.18))' }}
    >
      <defs>
        <radialGradient id="plateGrad" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#f0e8d8" />
          <stop offset="100%" stopColor="#c8b89a" />
        </radialGradient>
        <radialGradient id="glitterGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE566" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFB800" stopOpacity="0.1" />
        </radialGradient>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Plate / board */}
      <PlateShape cx={cx} size={size} shape={shape} />

      {/* Render tiers bottom up */}
      {tierConfigs.map((tier, i) => (
        <TierGroup
          key={i}
          tier={tier}
          index={i}
          total={tierCount}
          size={size}
          frostHex={frostHex}
          frostDark={frostDark}
          frostMid={frostMid}
          spongeColor={spongeColor}
          spongeDark={spongeDark}
          fillColor={fillColor}
          isNaked={isNaked}
          isDrip={isDrip}
          isTextured={isTextured}
          shape={shape}
          frostingStyle={frostingData.style}
        />
      ))}

      {/* Top decorations */}
      <TopDecorations
        cx={cx}
        topTier={tierConfigs[tierConfigs.length - 1]}
        hasFlowers={hasFlowers}
        hasGoldLeaf={hasGoldLeaf}
        hasSprinkles={hasSprinkles}
        hasMacarons={hasMacarons}
        hasBerries={hasBerries}
        hasChocShards={hasChocShards}
        hasPearls={hasPearls}
        hasGlitter={hasGlitter}
        hasRosettes={hasRosettes}
        hasFondantShapes={hasFondantShapes}
        candles={candles}
        candleCount={candleCount}
        frostHex={frostHex}
        size={size}
        message={message}
        shape={shape}
      />
    </svg>
  );
}

function getTierConfigs(tierCount, size, shape) {
  // baseY = bottom of the lowest tier (sits just above the plate)
  const baseY = size * 0.78;
  const tiers = [];
  const totalHeight = size * 0.50;
  const tierH = totalHeight / tierCount;

  let currentBottom = baseY;

  for (let i = 0; i < tierCount; i++) {
    // Each successive tier is smaller (scales down as we go up)
    const scale = 1 - (i * 0.20);
    const w = size * 0.54 * scale;
    const h = tierH;
    // ty = bottom edge of this tier
    const ty = currentBottom;
    tiers.push({ w, h, ty, scale, index: i });
    // Next tier starts where this one's top is
    currentBottom = ty - h * 0.88;
  }
  return tiers;
}

function PlateShape({ cx, size, shape }) {
  const py = size * 0.83;
  const pw = size * 0.62;
  const ph = pw * 0.32;

  if (shape === 'heart') {
    return (
      <ellipse cx={cx} cy={py} rx={pw * 0.5} ry={ph * 0.5} fill="url(#plateGrad)" stroke="#b8a888" strokeWidth="1" opacity="0.85" />
    );
  }
  if (shape === 'square') {
    const pts = `${cx},${py - ph * 0.5} ${cx + pw * 0.5},${py} ${cx},${py + ph * 0.5} ${cx - pw * 0.5},${py}`;
    return <polygon points={pts} fill="url(#plateGrad)" stroke="#b8a888" strokeWidth="1" opacity="0.85" />;
  }
  return <ellipse cx={cx} cy={py} rx={pw * 0.5} ry={ph * 0.5} fill="url(#plateGrad)" stroke="#b8a888" strokeWidth="1" opacity="0.85" />;
}

function TierGroup({ tier, index, total, size, frostHex, frostDark, frostMid, spongeColor, spongeDark, fillColor, isNaked, isDrip, isTextured, shape, frostingStyle }) {
  const { w, h, ty } = tier;
  const cx = w / 2;
  const layerH = h;

  // isometric-ish ellipse params
  const ew = w;
  const eh = ew * 0.36;

  // Center the tier horizontally in the SVG
  // ty = bottom edge of this tier, so top edge = ty - h
  const tx = (size - w) / 2;
  const tyOffset = ty - layerH;

  if (shape === 'round') {
    return (
      <g transform={`translate(${tx}, ${tyOffset})`}>
        <RoundTier cx={cx} w={w} h={layerH} ew={ew} eh={eh}
          frostHex={frostHex} frostDark={frostDark} frostMid={frostMid}
          spongeColor={spongeColor} spongeDark={spongeDark} fillColor={fillColor}
          isNaked={isNaked} isDrip={isDrip} isTextured={isTextured}
          isTop={index === total - 1} frostingStyle={frostingStyle}
        />
      </g>
    );
  }
  if (shape === 'square') {
    return (
      <g transform={`translate(${tx}, ${tyOffset})`}>
        <SquareTier cx={cx} w={w} h={layerH}
          frostHex={frostHex} frostDark={frostDark} frostMid={frostMid}
          spongeColor={spongeColor} spongeDark={spongeDark} fillColor={fillColor}
          isNaked={isNaked} isDrip={isDrip} isTextured={isTextured}
          isTop={index === total - 1} frostingStyle={frostingStyle}
        />
      </g>
    );
  }
  if (shape === 'heart') {
    return (
      <g transform={`translate(${tx}, ${tyOffset})`}>
        <HeartTier cx={cx} w={w} h={layerH}
          frostHex={frostHex} frostDark={frostDark} frostMid={frostMid}
          spongeColor={spongeColor} spongeDark={spongeDark} fillColor={fillColor}
          isNaked={isNaked} isDrip={isDrip} isTextured={isTextured}
          isTop={index === total - 1} frostingStyle={frostingStyle}
        />
      </g>
    );
  }
  return null;
}

function RoundTier({ cx, w, h, ew, eh, frostHex, frostDark, frostMid, spongeColor, spongeDark, fillColor, isNaked, isDrip, isTextured, isTop, frostingStyle }) {
  const rx = ew / 2;
  const ry = eh / 2;

  return (
    <g>
      {/* Side face */}
      {isNaked ? (
        <>
          {/* Naked: show sponge sides with frosting bleed */}
          <path d={`M ${cx - rx} ${ry} Q ${cx - rx} ${h + ry} ${cx - rx} ${h + ry} L ${cx + rx} ${h + ry} Q ${cx + rx} ${ry} ${cx + rx} ${ry} Z`} fill={spongeDark} />
          <path d={`M ${cx - rx} ${ry} Q ${cx} ${ry + eh * 0.3} ${cx + rx} ${ry} L ${cx + rx} ${h + ry} Q ${cx} ${h + ry + eh * 0.3} ${cx - rx} ${h + ry} Z`} fill={spongeColor} />
          {/* Filling bleed */}
          <rect x={cx - rx + 2} y={h * 0.45 + ry} width={rx * 2 - 4} height={h * 0.12} fill={fillColor} opacity="0.7" />
        </>
      ) : isDrip ? (
        <>
          <path d={`M ${cx - rx} ${ry} L ${cx - rx} ${h + ry} Q ${cx} ${h + ry + eh * 0.3} ${cx + rx} ${h + ry} L ${cx + rx} ${ry}`} fill={frostDark} />
          <path d={`M ${cx - rx} ${ry} Q ${cx} ${ry + eh * 0.3} ${cx + rx} ${ry} L ${cx + rx} ${h + ry} Q ${cx} ${h + ry + eh * 0.3} ${cx - rx} ${h + ry} Z`} fill={frostMid} />
          {/* Drip lines */}
          {[-0.35, -0.1, 0.15, 0.38].map((ox, i) => (
            <ellipse key={i} cx={cx + rx * ox} cy={h + ry + eh * 0.1 + i * 2} rx={w * 0.03} ry={h * 0.08 + i * 3} fill={frostHex} opacity="0.9" />
          ))}
        </>
      ) : isTextured ? (
        <>
          <path d={`M ${cx - rx} ${ry} L ${cx - rx} ${h + ry} Q ${cx} ${h + ry + eh * 0.3} ${cx + rx} ${h + ry} L ${cx + rx} ${ry}`} fill={frostDark} />
          <path d={`M ${cx - rx} ${ry} Q ${cx} ${ry + eh * 0.3} ${cx + rx} ${ry} L ${cx + rx} ${h + ry} Q ${cx} ${h + ry + eh * 0.3} ${cx - rx} ${h + ry} Z`} fill={frostMid} />
          {/* Palette knife streaks */}
          {[0.2, 0.4, 0.6, 0.8].map((yp, i) => (
            <path key={i} d={`M ${cx - rx + 4} ${ry + h * yp} Q ${cx} ${ry + h * yp - 4} ${cx + rx - 4} ${ry + h * yp}`} stroke={frostHex} strokeWidth="3" fill="none" opacity="0.6" />
          ))}
        </>
      ) : (
        <>
          <path d={`M ${cx - rx} ${ry} L ${cx - rx} ${h + ry} Q ${cx} ${h + ry + eh * 0.3} ${cx + rx} ${h + ry} L ${cx + rx} ${ry}`} fill={frostDark} />
          <path d={`M ${cx - rx} ${ry} Q ${cx} ${ry + eh * 0.3} ${cx + rx} ${ry} L ${cx + rx} ${h + ry} Q ${cx} ${h + ry + eh * 0.3} ${cx - rx} ${h + ry} Z`} fill={frostMid} />
        </>
      )}

      {/* Top face */}
      {isNaked ? (
        <ellipse cx={cx} cy={ry} rx={rx} ry={ry} fill={spongeColor} stroke={spongeDark} strokeWidth="1" />
      ) : (
        <ellipse cx={cx} cy={ry} rx={rx} ry={ry} fill={frostHex} stroke={frostMid} strokeWidth="1" />
      )}

      {/* Rustic swirl on top */}
      {frostingStyle === 'rustic-swirl' && isTop && (
        <path d={`M ${cx} ${ry} Q ${cx + rx * 0.5} ${ry - eh * 0.4} ${cx} ${ry - eh * 0.2} Q ${cx - rx * 0.5} ${ry + eh * 0.1} ${cx + rx * 0.3} ${ry}`}
          stroke={frostMid} strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}

function SquareTier({ cx, w, h, frostHex, frostDark, frostMid, spongeColor, spongeDark, fillColor, isNaked, isDrip, isTextured, isTop, frostingStyle }) {
  const hw = w / 2;
  const depth = w * 0.18;

  const topLeft = [cx - hw, depth];
  const topRight = [cx + hw, depth];
  const topFront = [cx + hw, depth + h];
  const topFrontL = [cx - hw, depth + h];
  const topBack = [cx, 0];
  const topBackR = [cx + hw * 2, 0];
  const bottomFrontR = [cx + hw * 2, h];

  const frontFace = isNaked ? spongeColor : frostMid;
  const sideFace = isNaked ? spongeDark : frostDark;
  const topFace = isNaked ? spongeColor : frostHex;

  return (
    <g>
      {/* Left side */}
      <polygon points={`${cx - hw},${depth} ${cx - hw},${depth + h} ${cx},${h + depth * 2} ${cx},${depth * 2}`} fill={sideFace} />
      {/* Front face */}
      <polygon points={`${cx - hw},${depth} ${cx + hw},${depth} ${cx + hw},${depth + h} ${cx - hw},${depth + h}`} fill={frontFace} />
      {/* Top face */}
      <polygon points={`${cx - hw},${depth} ${cx + hw},${depth} ${cx + hw * 1.5},${0} ${cx - hw * 0.5},${0}`} fill={topFace} />

      {isNaked && (
        <rect x={cx - hw + 2} y={depth + h * 0.44} width={w - 4} height={h * 0.12} fill={fillColor} opacity="0.65" />
      )}

      {isDrip && (
        <>
          {[-0.3, 0, 0.3].map((ox, i) => (
            <rect key={i} x={cx + hw * ox - 4} y={depth + h * 0.85} width={8} height={h * 0.22} rx={4} fill={frostHex} opacity="0.9" />
          ))}
        </>
      )}
    </g>
  );
}

function HeartTier({ cx, w, h, frostHex, frostDark, frostMid, spongeColor, spongeDark, fillColor, isNaked, isDrip, isTextured, isTop, frostingStyle }) {
  const s = w * 0.44;
  const ty = h * 0.15;
  const by = h + ty;

  const topFace = isNaked ? spongeColor : frostHex;
  const sideFace = isNaked ? spongeDark : frostDark;
  const frontFace = isNaked ? spongeColor : frostMid;

  const heartPath = (offY, scale = 1) => {
    const sc = s * scale;
    const x = cx, y = offY + sc * 0.6;
    return `M ${x},${y}
      C ${x},${y - sc * 0.3} ${x - sc * 0.5},${y - sc * 0.8} ${x - sc},${y - sc * 0.6}
      C ${x - sc * 1.5},${y - sc * 0.4} ${x - sc * 1.5},${y + sc * 0.3} ${x},${y + sc * 0.9}
      C ${x + sc * 1.5},${y + sc * 0.3} ${x + sc * 1.5},${y - sc * 0.4} ${x + sc},${y - sc * 0.6}
      C ${x + sc * 0.5},${y - sc * 0.8} ${x},${y - sc * 0.3} ${x},${y}Z`;
  };

  return (
    <g>
      {/* Side shadow */}
      <path d={heartPath(ty + h * 0.1)} fill={sideFace} />
      {/* Front face */}
      <path d={heartPath(ty)} fill={frontFace} />
      {/* Top face */}
      <path d={heartPath(ty - h * 0.1, 0.95)} fill={topFace} />

      {isDrip && (
        <path d={`M ${cx - s * 0.5},${ty + h * 0.95} Q ${cx},${ty + h * 1.05} ${cx + s * 0.5},${ty + h * 0.95}`}
          stroke={frostHex} strokeWidth={6} fill="none" strokeLinecap="round" opacity="0.8" />
      )}
    </g>
  );
}

function TopDecorations({ cx, topTier, hasFlowers, hasGoldLeaf, hasSprinkles, hasMacarons, hasBerries, hasChocShards, hasPearls, hasGlitter, hasRosettes, hasFondantShapes, candles, candleCount, frostHex, size, message, shape }) {
  if (!topTier) return null;
  const { w, ty } = topTier;
  const topY = ty - topTier.h;
  const topCX = size / 2;

  const items = [];

  if (hasGlitter) {
    items.push(
      <g key="glitter" opacity="0.7">
        {[...Array(16)].map((_, i) => (
          <circle key={i}
            cx={topCX + (Math.cos(i * 1.4) * w * 0.3)}
            cy={topY + (Math.sin(i * 1.4) * topTier.h * 0.18) - 6}
            r={2}
            fill={i % 2 === 0 ? '#FFD700' : '#FFEEAA'}
            opacity={0.6 + (i % 3) * 0.1}
          />
        ))}
      </g>
    );
  }

  if (hasPearls) {
    items.push(
      <g key="pearls">
        {[-0.38, -0.2, 0, 0.2, 0.38].map((ox, i) => (
          <circle key={i}
            cx={topCX + w * 0.28 * ox}
            cy={topY - topTier.h * 0.06 + Math.abs(ox) * 4}
            r={4}
            fill="#EEE8DD"
            stroke="#CCC4B4"
            strokeWidth="0.5"
          />
        ))}
      </g>
    );
  }

  if (hasRosettes) {
    items.push(
      <g key="rosettes">
        {[-0.32, 0.32].map((ox, i) => (
          <g key={i} transform={`translate(${topCX + w * 0.32 * ox}, ${topY - topTier.h * 0.04})`}>
            {[0, 60, 120, 180, 240, 300].map((deg, j) => (
              <ellipse key={j}
                cx={Math.cos(deg * Math.PI / 180) * 5}
                cy={Math.sin(deg * Math.PI / 180) * 3}
                rx={5} ry={3}
                fill={frostHex}
                stroke={frostHex === '#FFFFFF' ? '#ddd' : frostHex}
                strokeWidth="0.5"
                transform={`rotate(${deg})`}
                opacity="0.9"
              />
            ))}
            <circle r={3} fill={frostHex} stroke="#ddd" strokeWidth="0.5" />
          </g>
        ))}
      </g>
    );
  }

  if (hasFlowers) {
    const flowerColors = ['#F2BEC5', '#FFD9E0', '#FBBFC7', '#E8A4AE'];
    items.push(
      <g key="flowers">
        {[-0.28, 0.05, 0.30, -0.05].map((ox, i) => {
          const fc = flowerColors[i % flowerColors.length];
          const fx = topCX + w * 0.32 * ox;
          const fy = topY - topTier.h * 0.1 - i * 3;
          return (
            <g key={i} transform={`translate(${fx}, ${fy})`}>
              {[0, 72, 144, 216, 288].map((deg, j) => (
                <ellipse key={j}
                  cx={Math.cos(deg * Math.PI / 180) * 5}
                  cy={Math.sin(deg * Math.PI / 180) * 5}
                  rx={5} ry={3}
                  fill={fc}
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle r={3} fill="#FFF59D" />
            </g>
          );
        })}
      </g>
    );
  }

  if (hasBerries) {
    items.push(
      <g key="berries">
        {[-0.25, 0, 0.28, -0.1].map((ox, i) => (
          <g key={i} transform={`translate(${topCX + w * 0.28 * ox}, ${topY - topTier.h * 0.08 - i * 2})`}>
            <circle r={5} fill={i % 2 === 0 ? '#C0394B' : '#E8697A'} />
            <rect x={-1} y={-8} width={2} height={5} fill="#4A7C3F" rx={1} />
          </g>
        ))}
      </g>
    );
  }

  if (hasMacarons) {
    const mColors = ['#F2BEC5', '#A8C4A0', '#9BB4C8', '#C4A8D4'];
    items.push(
      <g key="macarons">
        {[-0.3, 0.3].map((ox, i) => {
          const mx = topCX + w * 0.3 * ox;
          const my = topY - topTier.h * 0.06;
          const mc = mColors[i];
          return (
            <g key={i} transform={`translate(${mx}, ${my})`}>
              <ellipse rx={9} ry={4} fill={mc} />
              <rect x={-8} y={0} width={16} height={3} fill="#fff8" />
              <ellipse cy={4} rx={9} ry={4} fill={mc} />
            </g>
          );
        })}
      </g>
    );
  }

  if (hasSprinkles) {
    const sprinkleColors = ['#F2BEC5', '#A8C4A0', '#9BB4C8', '#C4A8D4', '#F5E6C8', '#E8697A'];
    items.push(
      <g key="sprinkles">
        {[...Array(20)].map((_, i) => {
          const angle = (i / 20) * Math.PI * 2;
          const r = w * 0.18 * (0.4 + (i % 3) * 0.3);
          const sx = topCX + Math.cos(angle) * r;
          const sy = topY - topTier.h * 0.04 + Math.sin(angle) * topTier.h * 0.1;
          return (
            <rect key={i}
              x={sx - 3} y={sy - 1} width={6} height={2} rx={1}
              fill={sprinkleColors[i % sprinkleColors.length]}
              transform={`rotate(${i * 37}, ${sx}, ${sy})`}
            />
          );
        })}
      </g>
    );
  }

  if (hasChocShards) {
    items.push(
      <g key="chocshards">
        {[-0.15, 0.05, 0.25].map((ox, i) => (
          <polygon key={i}
            points={`${topCX + w * 0.25 * ox},${topY - topTier.h * 0.1 - i * 4} ${topCX + w * 0.25 * ox + 6},${topY - topTier.h * 0.1 - i * 4 - 16} ${topCX + w * 0.25 * ox + 12},${topY - topTier.h * 0.1 - i * 4}`}
            fill={i % 2 === 0 ? '#3D1C02' : '#5C2E0A'}
          />
        ))}
      </g>
    );
  }

  if (hasGoldLeaf) {
    items.push(
      <g key="goldleaf" opacity="0.85">
        {[[-0.2, 0], [0.15, -0.04], [-0.05, -0.08]].map(([ox, oy], i) => (
          <ellipse key={i}
            cx={topCX + w * 0.28 * ox}
            cy={topY - topTier.h * 0.1 + topTier.h * oy - 2}
            rx={8 + i * 2} ry={3 + i}
            fill="#D4A80A"
            opacity={0.6 + i * 0.1}
            transform={`rotate(${-15 + i * 20}, ${topCX + w * 0.28 * ox}, ${topY - topTier.h * 0.1})`}
          />
        ))}
      </g>
    );
  }

  if (hasFondantShapes) {
    const shapeColors = ['#F2BEC5', '#9BB4C8', '#A8C4A0'];
    items.push(
      <g key="fondantshapes">
        {[-0.28, 0, 0.28].map((ox, i) => (
          <polygon key={i}
            points={`${topCX + w * 0.28 * ox},${topY - topTier.h * 0.14} ${topCX + w * 0.28 * ox + 7},${topY - topTier.h * 0.08} ${topCX + w * 0.28 * ox - 7},${topY - topTier.h * 0.08}`}
            fill={shapeColors[i]}
            opacity="0.9"
          />
        ))}
      </g>
    );
  }

  // Candles
  if (candles && candleCount > 0) {
    const count = Math.min(candleCount, 8);
    items.push(
      <g key="candles">
        {[...Array(count)].map((_, i) => {
          const angle = (i / count) * Math.PI * 2;
          const r = w * 0.22;
          const candleX = topCX + Math.cos(angle) * r;
          const candleY = topY - topTier.h * 0.05 + Math.sin(angle) * topTier.h * 0.1;
          const candleColors = ['#F2BEC5', '#A8C4A0', '#9BB4C8', '#C4A8D4', '#F5E6C8'];
          const cc = candleColors[i % candleColors.length];
          return (
            <g key={i} transform={`translate(${candleX}, ${candleY})`}>
              <rect x={-2} y={-18} width={4} height={16} rx={2} fill={cc} />
              {/* Flame */}
              <ellipse cx={0} cy={-22} rx={2.5} ry={4} fill="#FFB300" opacity="0.9" />
              <ellipse cx={0} cy={-23} rx={1.5} ry={2.5} fill="#FFF176" opacity="0.8" />
            </g>
          );
        })}
      </g>
    );
  }

  // Message on cake
  if (message && message.trim()) {
    items.push(
      <g key="message">
        <text
          x={topCX}
          y={topY - topTier.h * 0.06}
          textAnchor="middle"
          fontSize={Math.max(9, Math.min(13, w * 0.06))}
          fontFamily="'Playfair Display', Georgia, serif"
          fill="#2C1A0E"
          fontStyle="italic"
          opacity="0.85"
        >
          {message.length > 16 ? message.substring(0, 16) + '…' : message}
        </text>
      </g>
    );
  }

  return <g>{items}</g>;
}

// Export
window.IsometricCake = IsometricCake;
