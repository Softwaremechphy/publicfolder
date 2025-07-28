// generate-tile-inventory.js
// Run this script in your project root: node generate-tile-inventory.js

const fs = require('fs');
const path = require('path');

function generateTileInventory() {
  const tilesDir = path.join(__dirname, 'public', 'tiles');
  const inventory = {};
  
  if (!fs.existsSync(tilesDir)) {
    console.error('Tiles directory not found:', tilesDir);
    return;
  }
  
  console.log('Scanning tiles directory:', tilesDir);
  
  // Read zoom level directories
  const zoomDirs = fs.readdirSync(tilesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && /^\d+$/.test(dirent.name))
    .map(dirent => dirent.name)
    .sort((a, b) => parseInt(a) - parseInt(b));
  
  console.log('Found zoom levels:', zoomDirs);
  
  for (const zoom of zoomDirs) {
    const zoomPath = path.join(tilesDir, zoom);
    inventory[zoom] = {};
    
    // Read X coordinate directories
    const xDirs = fs.readdirSync(zoomPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && /^\d+$/.test(dirent.name))
      .map(dirent => dirent.name)
      .sort((a, b) => parseInt(a) - parseInt(b));
    
    console.log(`Zoom ${zoom} - X coordinates:`, xDirs);
    
    for (const x of xDirs) {
      const xPath = path.join(zoomPath, x);
      inventory[zoom][x] = [];
      
      // Read Y coordinate files (PNG files)
      const yFiles = fs.readdirSync(xPath, { withFileTypes: true })
        .filter(dirent => dirent.isFile() && dirent.name.endsWith('.png'))
        .map(dirent => dirent.name.replace('.png', ''))
        .filter(name => /^\d+$/.test(name))
        .map(name => parseInt(name))
        .sort((a, b) => a - b);
      
      inventory[zoom][x] = yFiles;
      console.log(`  ${zoom}/${x}: [${yFiles.join(', ')}]`);
    }
  }
  
  // Write inventory to file
  const inventoryPath = path.join(tilesDir, 'tile-inventory.json');
  fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));
  
  console.log('\n✅ Tile inventory generated:', inventoryPath);
  console.log('📊 Summary:');
  
  let totalTiles = 0;
  for (const zoom in inventory) {
    let zoomTiles = 0;
    for (const x in inventory[zoom]) {
      zoomTiles += inventory[zoom][x].length;
    }
    totalTiles += zoomTiles;
    console.log(`  Zoom ${zoom}: ${zoomTiles} tiles`);
  }
  
  console.log(`  Total: ${totalTiles} tiles`);
  
  return inventory;
}

// Run the generator
if (require.main === module) {
  generateTileInventory();
}

module.exports = generateTileInventory;