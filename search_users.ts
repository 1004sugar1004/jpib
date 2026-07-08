import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function main() {
  console.log("Searching for 유서준 and 도현우 in Firestore...");
  const publicProfilesRef = collection(db, 'publicProfiles');
  const snapshot = await getDocs(publicProfilesRef);
  
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.name && (data.name.includes("유서준") || data.name.includes("도현우"))) {
      console.log(`Found publicProfile matching: ID: ${doc.id}`, JSON.stringify(data, null, 2));
    }
  });

  console.log("\nSearching in 'users' collection...");
  const usersRef = collection(db, 'users');
  const userSnapshot = await getDocs(usersRef);
  userSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.name && (data.name.includes("유서준") || data.name.includes("도현우"))) {
      console.log(`Found user matching: ID: ${doc.id}`, JSON.stringify(data, null, 2));
    }
  });

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
