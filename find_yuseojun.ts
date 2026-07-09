import { Firestore } from '@google-cloud/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const db = new Firestore({
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId || '(default)',
});

async function main() {
  console.log("Searching for 유서준 using Admin SDK...");
  const usersRef = db.collection('users');
  const publicProfilesRef = db.collection('publicProfiles');
  const feedbacksRef = db.collection('feedbacks');

  // Search by name
  const nameQuery1 = await usersRef.where('name', '==', '유서준').get();
  if (!nameQuery1.empty) {
    nameQuery1.forEach(doc => {
      console.log(`FOUND in users (exact match): ID=${doc.id}`, JSON.stringify(doc.data(), null, 2));
    });
  }

  const nameQuery2 = await usersRef.get();
  nameQuery2.forEach(doc => {
    const data = doc.data();
    if (data.name && data.name.trim() === '유서준') {
      console.log(`FOUND in users (trimmed match): ID=${doc.id}`, JSON.stringify(data, null, 2));
    }
  });

  const nameQuery3 = await publicProfilesRef.get();
  nameQuery3.forEach(doc => {
    const data = doc.data();
    if (data.name && data.name.trim() === '유서준') {
      console.log(`FOUND in publicProfiles (trimmed match): ID=${doc.id}`, JSON.stringify(data, null, 2));
    }
  });

  // Query feedbacks to find his message
  console.log("\nSearching in feedbacks collection...");
  const feedbacksSnap = await feedbacksRef.get();
  feedbacksSnap.forEach(doc => {
    const data = doc.data();
    console.log(`Feedback doc ${doc.id}:`, JSON.stringify(data, null, 2));
  });

  process.exit(0);
}

main().catch(err => {
  console.error("Error in find_yuseojun.ts:", err);
  process.exit(1);
});
