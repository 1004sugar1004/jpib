import * as fs from 'fs';

function main() {
  console.log("Searching for 유서준 in workspace files...");
  
  const files = fs.readdirSync('.');
  files.forEach(file => {
    if (file.endsWith('.json') || file.endsWith('.txt') || file.endsWith('.md')) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes("유서준")) {
          console.log(`Found "유서준" in file: ${file}`);
          // If it's json, try to parse and print more contextually, or just print lines
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (line.includes("유서준")) {
              console.log(`Line ${index + 1}: ${line.trim()}`);
            }
          });
        }
      } catch (e) {
        // Skip unreadable files
      }
    }
  });
}

main();
