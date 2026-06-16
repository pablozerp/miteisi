const fs = require('fs');

const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu;

const files = [
  'c:\\Users\\LENOVO\\Documents\\Nueva carpeta (8)\\miteisi\\frontend\\app\\admin\\page.js',
  'c:\\Users\\LENOVO\\Documents\\Nueva carpeta (8)\\miteisi\\frontend\\app\\admin\\users\\page.js',
  'c:\\Users\\LENOVO\\Documents\\Nueva carpeta (8)\\miteisi\\frontend\\app\\dashboard\\page.js',
  'c:\\Users\\LENOVO\\Documents\\Nueva carpeta (8)\\miteisi\\frontend\\app\\playground\\page.js',
  'c:\\Users\\LENOVO\\Documents\\Nueva carpeta (8)\\miteisi\\frontend\\components\\ChatWindow.js',
  'c:\\Users\\LENOVO\\Documents\\Nueva carpeta (8)\\miteisi\\frontend\\components\\CodeEditor.js',
  'c:\\Users\\LENOVO\\Documents\\Nueva carpeta (8)\\miteisi\\frontend\\components\\NodeCard.js',
  'c:\\Users\\LENOVO\\Documents\\Nueva carpeta (8)\\miteisi\\frontend\\components\\NodeDetailPanel.js',
  'c:\\Users\\LENOVO\\Documents\\Nueva carpeta (8)\\miteisi\\frontend\\components\\SearchBar.js'
];

for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    // Eliminar emojis y espacios sobrantes junto a ellos
    content = content.replace(emojiRegex, '');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Eliminados emojis de: ${file}`);
  } catch (e) {
    console.error(`Error procesando ${file}:`, e.message);
  }
}
