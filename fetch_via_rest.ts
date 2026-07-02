async function main() {
  const projectId = "xenon-lyceum-455010-s1";
  const databaseId = "ai-studio-b405862a-6553-4aab-88c1-52582227499a";
  const collectionId = "feedback";

  try {
    console.log("Fetching access token from metadata server...");
    const tokenResponse = await fetch(
      "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
      {
        headers: {
          "Metadata-Flavor": "Google"
        }
      }
    );
    
    if (!tokenResponse.ok) {
      throw new Error(`Failed to get token: ${tokenResponse.statusText}`);
    }
    
    const tokenData: any = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log("Successfully fetched access token!");

    console.log(`Querying Firestore REST API for database: ${databaseId}...`);
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionId}`;
    
    const firestoreResponse = await fetch(firestoreUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!firestoreResponse.ok) {
      const errorText = await firestoreResponse.text();
      throw new Error(`Firestore REST API Error: ${firestoreResponse.status} - ${errorText}`);
    }

    const firestoreData: any = await firestoreResponse.json();
    console.log("__FEEDBACK_START__");
    console.log(JSON.stringify(firestoreData, null, 2));
    console.log("__FEEDBACK_END__");

  } catch (error: any) {
    console.error("Error in REST retrieval:", error.message || error);
  }
}

main();
