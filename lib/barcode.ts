// lib/barcode.ts
// Pure TypeScript Code 128B barcode generator returning SVG string or data URI

const CODE128_PATTERNS: string[] = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", // 30-39
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112" // 100-106 (104=StartB, 106=Stop)
];

const START_B = 104;
const STOP = 106;

export function generateBarcodeSvg(text: string, height: number = 44, barWidth: number = 2): string {
  if (!text) return "";

  const codes: number[] = [START_B];
  let checksum = START_B;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32;
    if (code >= 0 && code <= 95) {
      codes.push(code);
      checksum += code * (i + 1);
    }
  }

  codes.push(checksum % 103);
  codes.push(STOP);

  let patternStr = "";
  for (const c of codes) {
    patternStr += CODE128_PATTERNS[c] || "";
  }

  let totalWidth = 0;
  for (let i = 0; i < patternStr.length; i++) {
    totalWidth += parseInt(patternStr[i], 10) * barWidth;
  }

  let x = 0;
  let rects = "";

  for (let i = 0; i < patternStr.length; i++) {
    const width = parseInt(patternStr[i], 10) * barWidth;
    const isBar = i % 2 === 0;
    if (isBar) {
      rects += `<rect x="${x}" y="0" width="${width}" height="${height}" fill="#000" />`;
    }
    x += width;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${height + 16}" width="${totalWidth}" height="${height + 16}">
      ${rects}
      <text x="${totalWidth / 2}" y="${height + 13}" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle" fill="#000" letter-spacing="2">
        ${text}
      </text>
    </svg>
  `.trim();
}
