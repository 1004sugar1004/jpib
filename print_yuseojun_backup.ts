import * as fs from 'fs';

function main() {
  const data = JSON.parse(fs.readFileSync('full_profiles.json', 'utf8'));
  console.log("Searching in full_profiles.json...");
  
  if (Array.isArray(data)) {
    data.forEach((p: any, idx: number) => {
      if (p.name && p.name.includes("유서준")) {
        console.log(`Found matching array element at index ${idx}:`, JSON.stringify(p, null, 2));
      }
    });
  } else {
    // maybe it is an object
    for (const key in data) {
      const p = data[key];
      if (p.name && p.name.includes("유서준")) {
        console.log(`Found matching key ${key}:`, JSON.stringify(p, null, 2));
      }
    }
  }
}

main();
