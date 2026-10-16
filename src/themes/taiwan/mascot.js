// ============================================================
// 🎨 src/themes/japanese/mascot.js — 星野葵立繪
// ============================================================

export const AnimeMascot = {
  renderSVG(mood = 'happy', headshotOnly = false) {
    const viewBox = headshotOnly ? "18 6 64 56" : "0 0 100 116";
    let eyes = '', mouth = '', fx = '';

    if (mood === 'star') {
      eyes = `
        <path d="M29 33 Q37 28 44 34" stroke="#4A2E2B" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        <path d="M56 34 Q63 28 71 33" stroke="#4A2E2B" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        <ellipse cx="37" cy="40" rx="5.5" ry="6.8" fill="url(#aoiEyeGrad)"/>
        <ellipse cx="63" cy="40" rx="5.5" ry="6.8" fill="url(#aoiEyeGrad)"/>
        <path d="M37 35 L38.3 38.7 L42 40 L38.3 41.3 L37 45 L35.7 41.3 L32 40 L35.7 38.7 Z" fill="#FFF3B0"/>
        <path d="M63 35 L64.3 38.7 L68 40 L64.3 41.3 L63 45 L61.7 41.3 L58 40 L61.7 38.7 Z" fill="#FFF3B0"/>
        <circle cx="34.2" cy="36.2" r="2.2" fill="#FFFFFF"/>
        <circle cx="60.2" cy="36.2" r="2.2" fill="#FFFFFF"/>
      `;
      mouth = `<path d="M44.5 48 Q50 55.5 55.5 48 Z" fill="#FF758F" stroke="#4A2E2B" stroke-width="1.8"/>`;
      fx = `
        <path d="M80 18 L82 23 L87 25 L82 27 L80 32 L78 27 L73 25 L78 23 Z" fill="#FFD166" stroke="#4A2E2B" stroke-width="1"/>
        <path d="M16 20 L17.5 24 L21.5 25.5 L17.5 27 L16 31 L14.5 27 L10.5 25.5 L14.5 24 Z" fill="#FF85A1" stroke="#4A2E2B" stroke-width="1"/>
      `;
    } else if (mood === 'worry') {
      eyes = `
        <path d="M30 33 Q37 36 43 32" stroke="#4A2E2B" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <path d="M70 33 Q63 36 57 32" stroke="#4A2E2B" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <path d="M32 38 L42 40.5 L32 43" stroke="#4A2E2B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <path d="M68 38 L58 40.5 L68 43" stroke="#4A2E2B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      `;
      mouth = `<path d="M45 50.5 Q50 47.5 55 50.5" stroke="#4A2E2B" stroke-width="2" stroke-linecap="round" fill="none"/>`;
      fx = `<path d="M76 26 Q80 33 76 37 Q72 33 76 26 Z" fill="#90E0EF" stroke="#4A2E2B" stroke-width="1.5"/>`;
    } else {
      eyes = `
        <g class="mascot-eye-blink">
          <path d="M29 31 Q37 29 43 32" stroke="#6E473B" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          <path d="M57 32 Q63 29 71 31" stroke="#6E473B" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          <path d="M29.5 34.5 Q37 30.5 44 35.5" stroke="#4A2E2B" stroke-width="2.8" stroke-linecap="round" fill="none"/>
          <path d="M56 35.5 Q63 30.5 70.5 34.5" stroke="#4A2E2B" stroke-width="2.8" stroke-linecap="round" fill="none"/>
          <ellipse cx="37" cy="40.5" rx="5.3" ry="6.5" fill="url(#aoiEyeGrad)"/>
          <ellipse cx="63" cy="40.5" rx="5.3" ry="6.5" fill="url(#aoiEyeGrad)"/>
          <ellipse cx="37" cy="40.5" rx="2.7" ry="3.4" fill="#4A2E2B"/>
          <ellipse cx="63" cy="40.5" rx="2.7" ry="3.4" fill="#4A2E2B"/>
          <circle cx="34.5" cy="37" r="2.3" fill="#FFFFFF"/>
          <circle cx="60.5" cy="37" r="2.3" fill="#FFFFFF"/>
          <circle cx="39.2" cy="43.5" r="1.2" fill="#FFF3B0"/>
          <circle cx="65.2" cy="43.5" r="1.2" fill="#FFF3B0"/>
        </g>
      `;
      mouth = `<path d="M46 48.5 Q50 53 54 48.5 Z" fill="#FF85A1" stroke="#4A2E2B" stroke-width="1.8" stroke-linejoin="round"/>`;
    }

    return `
      <svg viewBox="${viewBox}" class="w-full h-full">
        <path d="M22 28 C8 34, 7 68, 17 85 C23 76, 26 56, 27 36 Z" fill="url(#aoiHairGrad)" stroke="#4A2E2B" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M78 28 C92 34, 93 68, 83 85 C77 76, 74 56, 73 36 Z" fill="url(#aoiHairGrad)" stroke="#4A2E2B" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M23 27 L13 21 L15 32 Z" fill="#8FD18A" stroke="#4A2E2B" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M77 27 L87 21 L85 32 Z" fill="#8FD18A" stroke="#4A2E2B" stroke-width="1.8" stroke-linejoin="round"/>
        <rect x="44" y="55" width="12" height="12" rx="4" fill="#FFEFE2" stroke="#4A2E2B" stroke-width="2"/>
        <path d="M44 56 Q50 61 56 56 L56 60 Q50 63 44 60 Z" fill="#F0C9B2"/>
        <path d="M25 64 C25 60, 75 60, 75 64 L83 113 L17 113 Z" fill="#FFFDF7" stroke="#4A2E2B" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M33 65 L38 65 L38 113 L28 113 Z" fill="url(#apronGrad)" stroke="#4A2E2B" stroke-width="2"/>
        <path d="M62 65 L67 65 L72 113 L62 113 Z" fill="url(#apronGrad)" stroke="#4A2E2B" stroke-width="2"/>
        <path d="M31 76 L69 76 L73 113 L27 113 Z" fill="url(#apronGrad)" stroke="#4A2E2B" stroke-width="2.2"/>
        <polygon points="50,69 37,63 39,75" fill="#6BA368" stroke="#4A2E2B" stroke-width="1.8" stroke-linejoin="round"/>
        <polygon points="50,69 63,63 61,75" fill="#6BA368" stroke="#4A2E2B" stroke-width="1.8" stroke-linejoin="round"/>
        <circle cx="50" cy="69" r="3.8" fill="#FFF3B0" stroke="#4A2E2B" stroke-width="1.8"/>
        <path d="M27 36 C27 20, 73 20, 73 36 C73 49, 58 58.5, 50 59.5 C42 58.5, 27 49, 27 36 Z" fill="#FFEFE2" stroke="#4A2E2B" stroke-width="2.2"/>
        <ellipse cx="31.5" cy="45" rx="4.8" ry="2.3" fill="#FF85A1" opacity="0.55"/>
        <ellipse cx="68.5" cy="45" rx="4.8" ry="2.3" fill="#FF85A1" opacity="0.55"/>
        <line x1="29.5" y1="44.2" x2="31" y2="46" stroke="#E05780" stroke-width="1" opacity="0.7"/>
        <line x1="32" y1="44.2" x2="33.5" y2="46" stroke="#E05780" stroke-width="1" opacity="0.7"/>
        <line x1="66.5" y1="44.2" x2="68" y2="46" stroke="#E05780" stroke-width="1" opacity="0.7"/>
        <line x1="69" y1="44.2" x2="70.5" y2="46" stroke="#E05780" stroke-width="1" opacity="0.7"/>
        ${eyes}
        ${mouth}
        <path d="M25 48 C22 36, 24 22, 29 19 C27 30, 28 40, 29 50 Z" fill="url(#aoiHairGrad)" stroke="#4A2E2B" stroke-width="2" stroke-linejoin="round"/>
        <path d="M75 48 C78 36, 76 22, 71 19 C73 30, 72 40, 71 50 Z" fill="url(#aoiHairGrad)" stroke="#4A2E2B" stroke-width="2" stroke-linejoin="round"/>
        <path d="M24 36 C24 11, 76 11, 76 36 C70 23, 64 34, 58 22 C53 34, 47 34, 42 22 C36 34, 30 23, 24 36 Z" fill="url(#aoiHairGrad)" stroke="#4A2E2B" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M33 21 Q50 16 67 21" stroke="#FFF8EC" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.85"/>
        <path d="M38 23.5 Q50 20 62 23.5" stroke="#FFE5EC" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.75"/>
        <path d="M50 13 Q55 3 62 8 Q56 11 50 13 Z" fill="url(#aoiHairGrad)" stroke="#4A2E2B" stroke-width="1.8"/>
        <path d="M33 15 Q50 7 67 15 L63 20 Q50 15.5 37 20 Z" fill="#FFFDF7" stroke="#4A2E2B" stroke-width="2" stroke-linejoin="round"/>
        <path d="M46 11 L54 11 L53 14.5 L47 14.5 Z" fill="#FF85A1"/>
        ${fx}
      </svg>
    `;
  }
};
