interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export const rgbToHex = (r: number, g: number, b: number) => {
  const hex = ((r << 16) | (g << 8) | b).toString(16);
  return `#${hex}`;
};

export function hexToRgb(hex: string | undefined): RgbColor | null {
  if (!hex) return null;

  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, "");

  // Parse the hex string
  let r: number, g: number, b: number;

  if (hex.length === 3) {
    // Handle shorthand hex colors
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else if (hex.length === 6) {
    // Handle full hex colors
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    // Return null for invalid hex codes
    return null;
  }

  return { r, g, b };
}
