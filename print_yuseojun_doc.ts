import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function main() {
  const uid = "Zp5Du5gcl0cck4GJdUAUiBuj26T2";
  console.log(`Fetching documents for UID: ${uid}...`);

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    console.log("USER DOC IN 'users':", JSON.stringify(userSnap.data(), null, 2));
  } else {
    console.log("No document found in 'users' collection.");
  }

  const publicRef = doc(db, 'publicProfiles', uid);
  const publicSnap = await getDoc(publicRef);
  if (publicSnap.exists()) {
    console.log("PUBLIC PROFILE:", JSON.stringify(publicSnap.data(), null, 2));
  } else {
    console.log("No document found in 'publicProfiles' collection.");
  }
  process.exit(0);
}

main().catch(console.error);
