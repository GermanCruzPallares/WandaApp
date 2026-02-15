// AvatarIcons.ts - Avatares por defecto para cuentas

export const AvatarIcons = {
  personal: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="50" fill="url(#gradientPersonal)"/>
    <g fill="white" opacity="0.95">
      <circle cx="50" cy="38" r="15"/>
      <path d="M 50 55 C 35 55, 25 63, 25 75 L 25 85 C 25 90, 28 93, 32 93 L 68 93 C 72 93, 75 90, 75 85 L 75 75 C 75 63, 65 55, 50 55 Z"/>
    </g>
    <defs>
      <linearGradient id="gradientPersonal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#6366F1;stop-opacity:1" />
      </linearGradient>
    </defs>
  </svg>`,

  joint: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="50" fill="url(#gradientJoint)"/>
    <g fill="white" opacity="0.95">
      <g opacity="0.8">
        <circle cx="38" cy="40" r="11"/>
        <path d="M 38 52 C 28 52, 22 58, 22 68 L 22 75 C 22 78, 24 80, 27 80 L 49 80 C 49 80, 49 68, 49 68 C 49 58, 43 52, 38 52 Z"/>
      </g>
      <g>
        <circle cx="62" cy="40" r="11"/>
        <path d="M 62 52 C 52 52, 51 58, 51 68 L 51 75 C 51 78, 53 80, 56 80 L 73 80 C 76 80, 78 78, 78 75 L 78 68 C 78 58, 72 52, 62 52 Z"/>
      </g>
    </g>
    <defs>
      <linearGradient id="gradientJoint" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#06B6D4;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
      </linearGradient>
    </defs>
  </svg>`
};

// Helper para convertir SVG string a data URL
export const getAvatarDataUrl = (accountType: 'personal' | 'joint'): string => {
  const svg = AvatarIcons[accountType];
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};