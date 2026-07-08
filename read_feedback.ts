import * as fs from 'fs';

const data = JSON.parse(fs.readFileSync('./feedback_temp.json', 'utf8'));

console.log("Analyzing feedback_temp.json for 유서준 and 도현우...");

const seojunFeedbacks = data.filter((item: any) => 
  (item.userName && item.userName.includes("유서준")) || 
  (item.content && item.content.includes("유서준"))
);

const hyeonwooFeedbacks = data.filter((item: any) => 
  (item.userName && item.userName.includes("도현우")) || 
  (item.content && item.content.includes("도현우"))
);

console.log(`\n--- 유서준 Feedback (${seojunFeedbacks.length} found) ---`);
console.log(JSON.stringify(seojunFeedbacks, null, 2));

console.log(`\n--- 도현우 Feedback (${hyeonwooFeedbacks.length} found) ---`);
console.log(JSON.stringify(hyeonwooFeedbacks, null, 2));
