import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function main() {
  console.log("Searching for '유서준' via getDocs in collections...");

  // 1. Search in users collection
  const usersRef = collection(db, 'users');
  const userQuery = query(usersRef, where('name', '==', '유서준'));
  const userSnap = await getDocs(userQuery);
  if (!userSnap.empty) {
    userSnap.forEach(d => {
      console.log("Found in 'users':", d.id, JSON.stringify(d.data(), null, 2));
    });
  } else {
    console.log("No exact match '유서준' in 'users'. Let's fetch all users to search manually...");
    const allUsers = await getDocs(usersRef);
    let foundCount = 0;
    allUsers.forEach(d => {
      const data = d.data();
      if (data.name && data.name.includes('서준')) {
        console.log(`Partial match '서준' in 'users':`, d.id, JSON.stringify(data, null, 2));
        foundCount++;
      }
    });
    if (foundCount === 0) {
      console.log("No '서준' found in 'users' collection at all.");
    }
  }

  // 2. Search in publicProfiles collection
  const publicRef = collection(db, 'publicProfiles');
  const publicQuery = query(publicRef, where('name', '==', '유서준'));
  const publicSnap = await getDocs(publicQuery);
  if (!publicSnap.empty) {
    publicSnap.forEach(d => {
      console.log("Found in 'publicProfiles':", d.id, JSON.stringify(d.data(), null, 2));
    });
  } else {
    console.log("No exact match '유서준' in 'publicProfiles'.");
  }

  process.exit(0);
}

main().catch(console.error);
