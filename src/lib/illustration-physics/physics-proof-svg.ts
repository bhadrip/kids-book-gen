import type {
  PhysicsPoint,
  PhysicsPoseProof,
} from "@/lib/illustration-physics/rapier-pose-proof";

const WIDTH = 1400;
const HEIGHT = 900;
const PLOT = { left: 74, top: 92, right: 1020, bottom: 805 };
const WORLD = { minX: 0.7, maxX: 12.7, minY: -2.0, maxY: 3.55 };

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function x(value: number): number {
  return (
    PLOT.left +
    ((value - WORLD.minX) / (WORLD.maxX - WORLD.minX)) *
      (PLOT.right - PLOT.left)
  );
}

function y(value: number): number {
  return (
    PLOT.bottom -
    ((value - WORLD.minY) / (WORLD.maxY - WORLD.minY)) *
      (PLOT.bottom - PLOT.top)
  );
}

function point(value: PhysicsPoint): string {
  return `${x(value.x).toFixed(1)},${y(value.y).toFixed(1)}`;
}

function actorSvg(actor: PhysicsPoseProof["actors"][number]): string {
  const headRadius = actor.id === "mouse" || actor.id === "hen" ? 25 : 34;
  const feet = actor.feet
    .map(
      (foot) =>
        `<line x1="${x(actor.hip.x)}" y1="${y(actor.hip.y)}" x2="${x(foot.x)}" y2="${y(foot.y)}" class="limb"/><ellipse cx="${x(foot.x)}" cy="${y(foot.y)}" rx="18" ry="7" class="foot"/>`,
    )
    .join("");
  const grips = actor.grips
    .map((grip, index) => {
      const elbow = {
        x: (actor.shoulder.x + grip.x) / 2,
        y: (actor.shoulder.y + grip.y) / 2 + (index % 2 === 0 ? 0.14 : -0.08),
      };
      return `<polyline points="${point(actor.shoulder)} ${point(elbow)} ${point(grip)}" class="limb"/><circle cx="${x(grip.x)}" cy="${y(grip.y)}" r="10" class="hand"/>`;
    })
    .join("");

  return `<g data-actor="${escapeXml(actor.id)}" style="--actor:${actor.color}">
    <line x1="${x(actor.shoulder.x)}" y1="${y(actor.shoulder.y)}" x2="${x(actor.hip.x)}" y2="${y(actor.hip.y)}" class="torso"/>
    ${feet}
    ${grips}
    <circle cx="${x(actor.head.x)}" cy="${y(actor.head.y)}" r="${headRadius}" class="head"/>
    <circle cx="${x(actor.head.x + 0.09)}" cy="${y(actor.head.y + 0.03)}" r="3.5" fill="#31433f"/>
    <text x="${x(actor.hip.x)}" y="${y(actor.hip.y) + 38}" class="actor-label" text-anchor="middle">${escapeXml(actor.label)}</text>
  </g>`;
}

function forceSvg(force: PhysicsPoseProof["forces"][number]): string {
  const midX = (x(force.from.x) + x(force.to.x)) / 2;
  const midY = (y(force.from.y) + y(force.to.y)) / 2;
  return `<g style="--force:${force.color}">
    <line x1="${x(force.from.x)}" y1="${y(force.from.y)}" x2="${x(force.to.x)}" y2="${y(force.to.y)}" class="force" marker-end="url(#arrow)"/>
    <text x="${midX}" y="${midY - 13}" class="force-label" text-anchor="middle">${escapeXml(force.label)}</text>
  </g>`;
}

function leafSvg(proof: PhysicsPoseProof): string {
  if (proof.leafChain.length === 0) {
    const crown = proof.turnip.crown;
    return `<g class="leaves">
      <path d="M ${point(crown)} Q ${point({ x: crown.x - 0.45, y: crown.y + 0.85 })} ${point({ x: crown.x - 0.25, y: crown.y + 1.7 })}"/>
      <path d="M ${point(crown)} Q ${point({ x: crown.x + 0.45, y: crown.y + 0.9 })} ${point({ x: crown.x + 0.3, y: crown.y + 1.62 })}"/>
      <path d="M ${point(crown)} Q ${point({ x: crown.x + 0.03, y: crown.y + 1.0 })} ${point({ x: crown.x + 0.02, y: crown.y + 1.9 })}"/>
    </g>`;
  }
  const chainPoints = [
    proof.leafChain[0]!.from,
    ...proof.leafChain.map((segment) => segment.to),
  ];
  return `<g class="leaf-chain">
    <polyline points="${chainPoints.map(point).join(" ")}" class="stalk-under"/>
    <polyline points="${chainPoints.map(point).join(" ")}" class="stalk-line"/>
    ${chainPoints
      .slice(1, -1)
      .map(
        (joint) =>
          `<circle cx="${x(joint.x)}" cy="${y(joint.y)}" r="3.2" class="joint"/>`,
      )
      .join("")}
    <g class="leaf-blades">
      ${proof.leafBlades
        .map(
          (blade) =>
            `<line x1="${x(blade.from.x)}" y1="${y(blade.from.y)}" x2="${x(blade.to.x)}" y2="${y(blade.to.y)}" class="leaf-blade"/><line x1="${x(blade.from.x)}" y1="${y(blade.from.y)}" x2="${x(blade.to.x)}" y2="${y(blade.to.y)}" class="leaf-vein"/>`,
        )
        .join("")}
    </g>
  </g>`;
}

function contactsSvg(proof: PhysicsPoseProof): string {
  return proof.contacts
    .map(
      (contact, index) => `<g>
        <circle cx="${x(contact.point.x)}" cy="${y(contact.point.y)}" r="16" class="contact-ring"/>
        <circle cx="${x(contact.point.x)}" cy="${y(contact.point.y)}" r="5" class="contact-dot"/>
        <text x="${x(contact.point.x)}" y="${y(contact.point.y) - 23 - (index % 2) * 10}" class="contact-label" text-anchor="middle">grip ${index + 1}</text>
      </g>`,
    )
    .join("");
}

function checksSvg(proof: PhysicsPoseProof): string {
  const rows = proof.checks
    .map((check, index) => {
      const rowY = 180 + index * 78;
      const value =
        check.unit === "ratio"
          ? `${Math.round(check.actual * 100)}%`
          : `${check.actual} ${check.unit === "boolean" ? "" : check.unit}`;
      return `<g transform="translate(1064 ${rowY})">
        <circle cx="10" cy="-4" r="10" fill="${check.passed ? "#4f806f" : "#ad5b50"}"/>
        <path d="M4 -4 l4 4 8 -10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="32" y="0" class="check-label">${escapeXml(check.label)}</text>
        <text x="32" y="25" class="check-value">${escapeXml(value)} · target ${check.operator} ${check.threshold}</text>
      </g>`;
    })
    .join("");
  return `<g>
    <text x="1064" y="112" class="panel-kicker">RAPIER VERIFICATION</text>
    <text x="1064" y="143" class="panel-title">${proof.passed ? "PASS" : "REVISE"}</text>
    ${rows}
  </g>`;
}

export function renderPhysicsPoseProofSvg(proof: PhysicsPoseProof): string {
  const soilY = y(proof.soilY);
  const turnipCenter = point(proof.turnip.center);
  const turnipRx =
    (proof.turnip.radiusX / (WORLD.maxX - WORLD.minX)) *
    (PLOT.right - PLOT.left);
  const turnipRy =
    (proof.turnip.radiusY / (WORLD.maxY - WORLD.minY)) *
    (PLOT.bottom - PLOT.top);
  const crownX = x(proof.turnip.crown.x);
  const mound = `M ${PLOT.left} ${soilY} L ${crownX - 90} ${soilY} C ${crownX - 52} ${soilY - 3}, ${crownX - 35} ${soilY - 17}, ${crownX} ${soilY - 18} C ${crownX + 35} ${soilY - 17}, ${crownX + 52} ${soilY - 3}, ${crownX + 90} ${soilY} L ${PLOT.right} ${soilY} L ${PLOT.right} ${PLOT.bottom} L ${PLOT.left} ${PLOT.bottom} Z`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${escapeXml(proof.title)}">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/></marker>
    <pattern id="soil" width="32" height="24" patternUnits="userSpaceOnUse"><rect width="32" height="24" fill="#ddd0b5"/><circle cx="7" cy="7" r="1.8" fill="#b49c79" opacity=".45"/><path d="M18 15 q5 -5 10 0" fill="none" stroke="#b49c79" stroke-width="1.2" opacity=".35"/></pattern>
    <filter id="shadow"><feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#394843" flood-opacity=".14"/></filter>
    <style>
      text { font-family: ui-rounded, "Avenir Next", system-ui, sans-serif; fill:#31433f }
      .eyebrow { font-size:16px; letter-spacing:2.2px; font-weight:700; fill:#688078 }
      .title { font-size:34px; font-weight:760; letter-spacing:-.6px }
      .note { font-size:17px; fill:#66736f }
      .soil-line { fill:url(#soil); stroke:#9b8765; stroke-width:3 }
      .hidden-root { fill:#987399; fill-opacity:.32; stroke:#765c78; stroke-width:3; stroke-dasharray:9 7 }
      .root-label { font-size:15px; font-weight:650; fill:#765c78 }
      .crown { fill:#7d9960; stroke:#526b45; stroke-width:3 }
      .leaves path { fill:none; stroke:#668550; stroke-width:19; stroke-linecap:round }
      .stalk-under { fill:none; stroke:#e9f0e3; stroke-width:24; stroke-linecap:round; stroke-linejoin:round }
      .stalk-line { fill:none; stroke:#668550; stroke-width:15; stroke-linecap:round; stroke-linejoin:round }
      .leaf-blade { stroke:#87a965; stroke-width:34; stroke-linecap:round }
      .leaf-vein { stroke:#5e7f4b; stroke-width:3; stroke-linecap:round }
      .joint { fill:#f9fbf7; stroke:#527044; stroke-width:2 }
      .torso { stroke:var(--actor); stroke-width:44; stroke-linecap:round }
      .limb { fill:none; stroke:var(--actor); stroke-width:17; stroke-linecap:round; stroke-linejoin:round }
      .head { fill:var(--actor); stroke:#4e5f59; stroke-width:3; filter:url(#shadow) }
      .hand { fill:#fbf5e7; stroke:var(--actor); stroke-width:6 }
      .foot { fill:#fbf5e7; stroke:var(--actor); stroke-width:6 }
      .actor-label { font-size:15px; font-weight:750; fill:#4d5d58 }
      .force { stroke:var(--force); stroke-width:5; stroke-dasharray:12 8; stroke-linecap:round }
      .force-label { font-size:15px; font-weight:750; fill:var(--force); paint-order:stroke; stroke:#fbfaf5; stroke-width:5 }
      .contact-ring { fill:none; stroke:#d18c4a; stroke-width:3; stroke-dasharray:5 4 }
      .contact-dot { fill:#d18c4a }
      .contact-label { font-size:13px; font-weight:750; fill:#9a642e; paint-order:stroke; stroke:#fbfaf5; stroke-width:4 }
      .panel-kicker { font-size:14px; letter-spacing:1.8px; font-weight:750; fill:#688078 }
      .panel-title { font-size:27px; font-weight:800; fill:${proof.passed ? "#4f806f" : "#ad5b50"} }
      .check-label { font-size:14px; font-weight:700 }
      .check-value { font-size:12px; fill:#78827f }
      .legend { font-size:13px; fill:#66736f }
    </style>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#fbfaf5"/>
  <text x="74" y="38" class="eyebrow">STATIC ILLUSTRATION PHYSICS PROOF · RAPIER 2D 0.20.0</text>
  <text x="74" y="76" class="title">${escapeXml(proof.title)}</text>
  <text x="74" y="858" class="note">${escapeXml(proof.note)}</text>
  <line x1="1040" y1="92" x2="1040" y2="805" stroke="#d9ded8" stroke-width="2"/>
  <ellipse cx="${turnipCenter.split(",")[0]}" cy="${turnipCenter.split(",")[1]}" rx="${turnipRx}" ry="${turnipRy}" class="hidden-root"/>
  <path d="${mound}" class="soil-line"/>
  <ellipse cx="${crownX}" cy="${soilY - 13}" rx="34" ry="14" class="crown"/>
  <ellipse cx="${turnipCenter.split(",")[0]}" cy="${turnipCenter.split(",")[1]}" rx="${turnipRx}" ry="${turnipRy}" class="hidden-root"/>
  <text x="${crownX + turnipRx + 18}" y="${y(proof.turnip.center.y)}" class="root-label">hidden root · ${Math.round(proof.turnip.buriedRatio * 100)}% buried</text>
  ${leafSvg(proof)}
  ${proof.actors.map(actorSvg).join("")}
  ${contactsSvg(proof)}
  ${proof.forces.map(forceSvg).join("")}
  <g transform="translate(78 790)"><circle cx="0" cy="0" r="7" class="contact-dot"/><text x="15" y="5" class="legend">verified grip</text><line x1="130" y1="0" x2="183" y2="0" class="force" style="--force:#276b68" marker-end="url(#arrow)"/><text x="198" y="5" class="legend">force direction</text><path d="M330 0 h55" class="stalk-line"/><text x="400" y="5" class="legend">root-side stalks</text><path d="M555 0 h55" class="leaf-blade"/><text x="625" y="5" class="legend">hand-side leafy tops</text></g>
  ${checksSvg(proof)}
</svg>`;
}
