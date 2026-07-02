import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function main() {
  console.log("Fetching feedback via Client SDK...");
  const feedbackCol = collection(db, 'feedback');
  const snapshot = await getDocs(feedbackCol);
  
  const feedbacks: any[] = [];
  snapshot.forEach(doc => {
    feedbacks.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  console.log("__FEEDBACK_START__");
  console.log(JSON.stringify(feedbacks, null, 2));
  console.log("__FEEDBACK_END__");
}

main().catch(console.error);
