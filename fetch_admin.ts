import { Firestore } from "@google-cloud/firestore";

async function main() {
  const db = new Firestore({
    projectId: "xenon-lyceum-455010-s1",
    databaseId: "ai-studio-b405862a-6553-4aab-88c1-52582227499a",
  });

  console.log("Fetching feedback from Firestore Admin SDK...");
  const feedbackRef = db.collection("feedback");
  const snapshot = await feedbackRef.get();

  console.log(`Found ${snapshot.size} feedback documents.`);
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
