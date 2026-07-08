import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function findUser() {
  const emailToFind = 'naldeulda@cberi.go.kr';
  console.log(`Searching for user with email: ${emailToFind}...`);
  
  const q = query(collection(db, 'users'), where('email', '==', emailToFind));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    console.log('No user found matching that email in the "users" collection.');
    // Let's also search in activity logs or comments to see if they wrote their name there
    console.log('Searching all users to see if we can find any matching field...');
    const allUsersSnap = await getDocs(collection(db, 'users'));
    allUsersSnap.forEach(d => {
      const data = d.data();
      if (data.email && data.email.toLowerCase().includes('naldeulda')) {
        console.log(`Found partial match: ${JSON.stringify(data)}`);
      }
    });
  } else {
    snap.forEach((doc) => {
      console.log(`FOUND USER PROFILE: ID=${doc.id}`, JSON.stringify(doc.data(), null, 2));
    });
  }
  process.exit(0);
}

findUser().catch((err) => {
  console.error(err);
  process.exit(1);
});
