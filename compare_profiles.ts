import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

interface BackupProfile {
  uid: string;
  name: string;
  grade: string;
  class: string;
  score: number;
  monthlyScore: number;
  lastActiveMonth: string;
  lastXPDate: string;
}

async function main() {
  console.log("Loading backup from full_profiles.json...");
  const rawBackup = fs.readFileSync('full_profiles.json', 'utf8');
  
  // Clean up any non-JSON prefix/suffix from the backup
  const jsonStartIndex = rawBackup.indexOf('{');
  const jsonEndIndex = rawBackup.lastIndexOf('}') + 1;
  const jsonStr = rawBackup.substring(jsonStartIndex, jsonEndIndex);
  
  const backupData = JSON.parse(jsonStr);
  const backupProfiles: BackupProfile[] = backupData.individual || [];
  console.log(`Loaded ${backupProfiles.length} profiles from backup.`);

  console.log("\nFetching live publicProfiles from Firestore...");
  const liveSnapshot = await getDocs(collection(db, 'publicProfiles'));
  const liveProfilesMap = new Map<string, any>();
  liveSnapshot.forEach(doc => {
    liveProfilesMap.set(doc.id, doc.data());
  });
  console.log(`Fetched ${liveProfilesMap.size} live publicProfiles.`);

  console.log("\nComparing backup scores with live scores...");
  const resetUsers: any[] = [];
  
  backupProfiles.forEach(backup => {
    const live = liveProfilesMap.get(backup.uid);
    if (live) {
      const liveScore = live.score || 0;
      const backupScore = backup.score || 0;
      
      if (liveScore < backupScore) {
        resetUsers.push({
          uid: backup.uid,
          name: backup.name,
          grade: backup.grade,
          class: backup.class,
          backupScore,
          liveScore,
          backupMonthly: backup.monthlyScore,
          liveMonthly: live.monthlyScore || 0,
          difference: backupScore - liveScore
        });
      }
    }
  });

  console.log("\n====== RESET DETECTED USERS ======");
  if (resetUsers.length === 0) {
    console.log("No users found with scores lower than backup.");
  } else {
    resetUsers.forEach(u => {
      console.log(`User: ${u.name} (${u.grade} ${u.class})`);
      console.log(`  UID: ${u.uid}`);
      console.log(`  Backup Score: ${u.backupScore} (July 8)`);
      console.log(`  Live Score: ${u.liveScore} (July 9)`);
      console.log(`  Backup Monthly: ${u.backupMonthly}`);
      console.log(`  Live Monthly: ${u.liveMonthly}`);
      console.log(`  Difference: ${u.difference}`);
    });
  }
  console.log("==================================\n");
}

main().catch(console.error);
