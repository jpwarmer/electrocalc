/**
 * Renders logo-calculadora-electrica.svg to PNG assets for Expo icons.
 */
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const root = path.join(__dirname, '..');
const svgPath = path.join(
  root,
  'assets',
  'images',
  'logo-calculadora-electrica.svg',
);
const outDir = path.join(root, 'assets', 'images');

let svg = fs.readFileSync(svgPath, 'utf8');
// Strip C2PA / foreign metadata that breaks some rasterizers.
svg = svg.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
svg = svg.replace(/\sxmlns:c2pa="[^"]*"/gi, '');

function writePng(filename, size) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
  });
  const png = resvg.render().asPng();
  const out = path.join(outDir, filename);
  fs.writeFileSync(out, png);
  console.log('Wrote', out, `(${size}px)`);
}

writePng('icon.png', 1024);
writePng('adaptive-icon.png', 1024);
writePng('splash-icon.png', 512);
writePng('favicon.png', 48);
writePng('android-icon-foreground.png', 1024);
writePng('android-icon-monochrome.png', 1024);
