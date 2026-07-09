import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function main() {
  console.log("Fetching live publicProfiles from Firestore...");
  const liveSnapshot = await getDocs(collection(db, 'publicProfiles'));
  console.log(`Fetched ${liveSnapshot.size} live publicProfiles.`);
  
  let foundByUid = false;
  let foundByName = false;
  const uidToSearch = "Zp5Du5gcl0cck4GJdUAUiBuj26T2";

  liveSnapshot.forEach(doc => {
    const data = doc.data();
    if (doc.id === uidToSearch) {
      console.log(`FOUND BY UID (${uidToSearch}):`, JSON.stringify(data, null, 2));
      foundByUid = true;
    }
    if (data.name && data.name.includes("유서준")) {
      console.log(`FOUND BY NAME containing '유서준' (ID: ${doc.id}):`, JSON.stringify(data, null, 2));
      foundByName = true;
    }
  });

  if (!foundByUid) {
    console.log(`UID ${uidToSearch} NOT found in publicProfiles.`);
  }
  if (!foundByName) {
    console.log("No profile with name containing '유서준' found in publicProfiles.");
  }

  process.exit(0);
}

main().catch(console.error);
