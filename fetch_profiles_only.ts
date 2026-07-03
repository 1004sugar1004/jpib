import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function main() {
  console.log("Fetching profiles...");
  const snapshot = await getDocs(collection(db, 'publicProfiles'));
  
  const profiles: any[] = [];
  snapshot.forEach(doc => {
    profiles.push({
      id: doc.id,
      ...doc.data()
    });
  });

  console.log(`Successfully fetched ${profiles.length} profiles.`);

  // Filter for users who had active scores in June 2026
  // (Either lastActiveMonth is '2026-06' or their overall score is substantial)
  const juneUsers = profiles.map(p => {
    let juneScore = 0;
    if (p.lastActiveMonth === '2026-06') {
      juneScore = p.monthlyScore || 0;
    } else if (p.lastActiveMonth === '2026-07') {
      // For those who already logged in during July, we can use their total score minus their current monthlyScore
      // because total score is cumulative, and monthlyScore is July score.
      juneScore = (p.score || 0) - (p.monthlyScore || 0);
    } else {
      juneScore = p.monthlyScore || 0;
    }

    return {
      uid: p.uid,
      name: p.name,
      grade: p.grade,
      class: p.class,
      role: p.role || 'student',
      juneScore: juneScore,
      score: p.score || 0,
      monthlyScore: p.monthlyScore || 0,
      lastActiveMonth: p.lastActiveMonth,
      lastXPDate: p.lastXPDate
    };
  }).filter(u => u.role !== 'teacher' && u.juneScore > 0);

  // Sort by June score descending
  const sortedJune = [...juneUsers].sort((a, b) => b.juneScore - a.juneScore);

  // Class rankings
  const classMap: Record<string, { name: string; score: number; count: number }> = {};
  juneUsers.forEach(user => {
    const gradeNum = user.grade?.replace(/[^0-9]/g, '') || '';
    const classNum = user.class?.replace(/[^0-9]/g, '') || '';
    
    if (gradeNum && classNum) {
      const key = `${gradeNum}-${classNum}`;
      const name = `${gradeNum}학년 ${classNum}반`;
      if (!classMap[key]) {
        classMap[key] = { name, score: 0, count: 0 };
      }
      classMap[key].score += user.juneScore;
      classMap[key].count += 1;
    }
  });

  const sortedClasses = Object.values(classMap).sort((a, b) => b.score - a.score);

  console.log("\n=================== RESULT ===================");
  console.log("__JUNE_RANKINGS_START__");
  console.log(JSON.stringify({
    individual: sortedJune.slice(0, 30),
    classes: sortedClasses
  }, null, 2));
  console.log("__JUNE_RANKINGS_END__");
  console.log("==============================================");

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
