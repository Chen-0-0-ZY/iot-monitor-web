const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconDir = path.join(__dirname, '../public/icons');
const sourceIcon = path.join(__dirname, '../../tea_iot_app_icon.jpg');

if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

const sizes = [64, 192, 512];

Promise.all(sizes.map(size => {
  return sharp(sourceIcon)
    .resize(size, size)
    .png()
    .toFile(path.join(iconDir, `pwa-${size}x${size}.png`));
})).then(() => {
  console.log('Icons generated successfully from tea_iot_app_icon.jpg');
}).catch(err => {
  console.error('Error generating icons:', err);
});