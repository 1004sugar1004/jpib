import { Firestore } from "@google-cloud/firestore";

const db = new Firestore({
  projectId: "xenon-lyceum-455010-s1",
  databaseId: "ai-studio-b405862a-6553-4aab-88c1-52582227499a",
});

const SEOJUN_UID = "Zp5Du5gcl0cck4GJdUAUiBuj26T2";
const HYEONWOO_UID = "iAMt2fR5UagTPnCiVMseR7ide9i1";

async function main() {
  console.log("Analyzing logs for 유서준 (SEOJUN)...");
  
  const logsRef = db.collection('activityLogs');
  const seojunSnapshot = await logsRef.where('uid', '==', SEOJUN_UID).get();
  console.log(`유서준 logs count: ${seojunSnapshot.size}`);
  
  let seojunSuspiciousCount = 0;
  const seojunLogs: any[] = [];
  seojunSnapshot.forEach(doc => {
    const data = doc.data();
    seojunLogs.push(data);
    if (data.isSuspicious) seojunSuspiciousCount++;
  });
  
  // Sort by timestamp
  seojunLogs.sort((a, b) => a.timestamp - b.timestamp);
  console.log(`유서준 suspicious logs: ${seojunSuspiciousCount}`);
  if (seojunLogs.length > 0) {
    console.log("First 3 logs for 유서준:", JSON.stringify(seojunLogs.slice(0, 3), null, 2));
    console.log("Last 3 logs for 유서준:", JSON.stringify(seojunLogs.slice(-3), null, 2));
  }
  
  console.log("\nAnalyzing logs for 도현우 (HYEONWOO)...");
  const hyeonwooSnapshot = await logsRef.where('uid', '==', HYEONWOO_UID).get();
  console.log(`도현우 logs count: ${hyeonwooSnapshot.size}`);
  
  let hyeonwooSuspiciousCount = 0;
  const hyeonwooLogs: any[] = [];
  hyeonwooSnapshot.forEach(doc => {
    const data = doc.data();
    hyeonwooLogs.push(data);
    if (data.isSuspicious) hyeonwooSuspiciousCount++;
  });
  
  hyeonwooLogs.sort((a, b) => a.timestamp - b.timestamp);
  console.log(`도현우 suspicious logs: ${hyeonwooSuspiciousCount}`);
  if (hyeonwooLogs.length > 0) {
    console.log("First 3 logs for 도현우:", JSON.stringify(hyeonwooLogs.slice(0, 3), null, 2));
    console.log("Last 3 logs for 도현우:", JSON.stringify(hyeonwooLogs.slice(-3), null, 2));
  }

  // June 2026 logs
  const juneSeojun = seojunLogs.filter(l => {
    const d = new Date(l.timestamp);
    return d.getFullYear() === 2026 && d.getMonth() === 5; // June is month 5 (0-indexed)
  });
  const juneHyeonwoo = hyeonwooLogs.filter(l => {
    const d = new Date(l.timestamp);
    return d.getFullYear() === 2026 && d.getMonth() === 5;
  });

  console.log(`\nJune 2026 logs - 유서준: ${juneSeojun.length}, 도현우: ${juneHyeonwoo.length}`);
  
  // Analyze XP gains per day for Yu Seo-jun in June
  const seojunXPByDay: Record<string, number> = {};
  juneSeojun.forEach(l => {
    const dateStr = new Date(l.timestamp).toISOString().split('T')[0];
    seojunXPByDay[dateStr] = (seojunXPByDay[dateStr] || 0) + (l.xpGained || 0);
  });
  console.log("유서준 June XP by day:", Object.entries(seojunXPByDay).sort((a,b) => a[0].localeCompare(b[0])));

  const hyeonwooXPByDay: Record<string, number> = {};
  juneHyeonwoo.forEach(l => {
    const dateStr = new Date(l.timestamp).toISOString().split('T')[0];
    hyeonwooXPByDay[dateStr] = (hyeonwooXPByDay[dateStr] || 0) + (l.xpGained || 0);
  });
  console.log("도현우 June XP by day:", Object.entries(hyeonwooXPByDay).sort((a,b) => a[0].localeCompare(b[0])));

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
