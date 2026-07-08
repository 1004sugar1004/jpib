import { Firestore } from '@google-cloud/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

// Initialize Firestore Admin
const db = new Firestore({
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId || '(default)',
});

async function findUser() {
  const emailToFind = 'naldeulda@cberi.go.kr';
  console.log(`[Admin] Searching for user with email: ${emailToFind}...`);
  
  const usersRef = db.collection('users');
  const snap = await usersRef.where('email', '==', emailToFind).get();
  
  if (snap.empty) {
    console.log('No user found matching that email in the "users" collection.');
    // List some users to see if we can find anyone with a partial match
    console.log('Searching all users for partial matches...');
    const allUsersSnap = await usersRef.limit(10).get();
    allUsersSnap.forEach(d => {
      console.log(`User: ${d.id} -> Name: ${d.data().name}, Email: ${d.data().email}, Grade: ${d.data().grade}, Class: ${d.data().class}`);
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
