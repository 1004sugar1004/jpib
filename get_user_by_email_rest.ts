async function main() {
  const projectId = "xenon-lyceum-455010-s1";
  const databaseId = "ai-studio-b405862a-6553-4aab-88c1-52582227499a";
  const emailToFind = "naldeulda@cberi.go.kr";

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

    console.log(`Querying Firestore REST API runQuery for email: ${emailToFind}...`);
    const runQueryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents:runQuery`;
    
    const queryPayload = {
      structuredQuery: {
        from: [{ collectionId: "users" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "email" },
            op: "EQUAL",
            value: { stringValue: emailToFind }
          }
        }
      }
    };

    const firestoreResponse = await fetch(runQueryUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(queryPayload)
    });

    if (!firestoreResponse.ok) {
      const errorText = await firestoreResponse.text();
      throw new Error(`Firestore REST API Error: ${firestoreResponse.status} - ${errorText}`);
    }

    const queryResult: any = await firestoreResponse.json();
    console.log("QUERY_RESULT_START");
    console.log(JSON.stringify(queryResult, null, 2));
    console.log("QUERY_RESULT_END");

    // Also let's query publicProfiles to see if we can find anyone with that email or name if it doesn't return anything
    if (!queryResult || queryResult.length === 0 || !queryResult[0].document) {
      console.log("No user found in 'users' via email filter. Querying all users to search...");
      const listUsersUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/users?pageSize=1000`;
      const listResponse = await fetch(listUsersUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (listResponse.ok) {
        const listData: any = await listResponse.json();
        console.log("LIST_RESULT_START");
        const found = (listData.documents || []).filter((doc: any) => {
          const fields = doc.fields || {};
          const email = fields.email?.stringValue || "";
          return email.toLowerCase() === emailToFind.toLowerCase();
        });
        console.log(`Found ${found.length} matches in all users list:`, JSON.stringify(found, null, 2));
        console.log("LIST_RESULT_END");
      }
    }

  } catch (error: any) {
    console.error("Error in REST retrieval:", error.message || error);
  }
}

main();
