async function main() {
  const projectId = "xenon-lyceum-455010-s1";
  const databaseId = "ai-studio-b405862a-6553-4aab-88c1-52582227499a";

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

    // Query feedbacks
    console.log(`\nQuerying Firestore REST API for 'feedback' collection...`);
    const feedbackUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/feedback?pageSize=100`;
    const feedbackResponse = await fetch(feedbackUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (feedbackResponse.ok) {
      const data: any = await feedbackResponse.json();
      console.log("__FEEDBACK_RESULT_START__");
      console.log(JSON.stringify(data.documents || [], null, 2));
      console.log("__FEEDBACK_RESULT_END__");
    } else {
      console.error("Failed to fetch feedbacks:", await feedbackResponse.text());
    }

    // Query 'users' for Zp5Du5gcl0cck4GJdUAUiBuj26T2 (Yu Seojun)
    console.log(`\nQuerying users document for Yu Seojun (Zp5Du5gcl0cck4GJdUAUiBuj26T2)...`);
    const userUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/users/Zp5Du5gcl0cck4GJdUAUiBuj26T2`;
    const userResponse = await fetch(userUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log("__USER_RESULT_START__");
      console.log(JSON.stringify(userData, null, 2));
      console.log("__USER_RESULT_END__");
    } else {
      console.error("Failed to fetch user:", await userResponse.text());
    }

  } catch (error: any) {
    console.error("Error in REST retrieval:", error.message || error);
  }
}

main();
