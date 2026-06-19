import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

async function main() {
  // Get farmers on NQ-01
  const farmers = await prisma.farmer.findMany({
    where: { channel: { code: 'NQ-01' } },
    include: { channel: true },
  });
  const farmer1 = farmers[0]; // 张三
  const farmer2 = farmers[1]; // 吴十
  console.log(`Farmer1: ${farmer1.name} (${farmer1.code}), Farmer2: ${farmer2.name} (${farmer2.code})`);
  console.log(`Channel NQ-01 maxFlow = ${farmer1.channel.maxFlow}`);

  // Use a fresh date: 2026-06-25
  const testDate = dayjs('2026-06-25').startOf('day');
  console.log(`\nTest date: ${testDate.format('YYYY-MM-DD')}`);

  // First, fill up NQ-01 for the entire day using farmer1 with a long 18-hour allocation
  // NQ-01 maxFlow = 1 m³/s. If we occupy 0.9 m³/s for 18 hours, there's only 0.1 left
  // And the scheduling tries to use 0.9 m³/s which won't fit
  
  // Create a large application from farmer1 that will take up most of the day
  const bigApp = await prisma.waterApplication.create({
    data: {
      farmerId: farmer1.id,
      expectedFlow: 0.9,
      expectedHours: 18, // 18 hours fills 6:00 to 24:00
      requestVolume: 0.9 * 18 * 3600,
      submitTime: dayjs().subtract(2, 'hour').toDate(), // submitted earlier
      targetDate: testDate.toDate(),
      originalTargetDate: testDate.toDate(),
      status: 'PENDING',
      postponeCount: 0,
    },
  });
  console.log(`Created big app from ${farmer1.name}: 0.9 m³/s × 18h`);

  // Create a smaller app from farmer2 that will NOT fit (0.9 m³/s on same channel already at 0.9)
  const smallApp = await prisma.waterApplication.create({
    data: {
      farmerId: farmer2.id,
      expectedFlow: 0.2, // even 0.2 + 0.9 = 1.1 > maxFlow 1.0
      expectedHours: 1,
      requestVolume: 0.2 * 1 * 3600,
      submitTime: dayjs().subtract(1, 'hour').toDate(), // submitted later
      targetDate: testDate.toDate(),
      originalTargetDate: testDate.toDate(),
      status: 'PENDING',
      postponeCount: 0,
    },
  });
  console.log(`Created small app from ${farmer2.name}: 0.2 m³/s × 1h`);

  // Run scheduling for that date - bigApp should succeed, smallApp should FAIL
  console.log(`\n--- Running scheduling for ${testDate.format('YYYY-MM-DD')} ---`);
  const res = await fetch(`http://localhost:3001/scheduling/run?date=${testDate.format('YYYY-MM-DD')}`, { method: 'POST' });
  const result = await res.json();
  console.log(`total=${result.totalProcessed}, scheduled=${result.scheduled}, failed=${result.failed}`);
  for (const d of result.details) {
    console.log(`  ${d.farmerCode}: ${d.status} ${d.failReason || ''}`);
  }

  // Check if smallApp is now FAILED
  const checkApp = await prisma.waterApplication.findUnique({ where: { id: smallApp.id } });
  console.log(`\nsmallApp status: ${checkApp?.status}, failReason: ${checkApp?.failReason}`);

  if (checkApp?.status !== 'FAILED') {
    console.log('ERROR: Expected smallApp to be FAILED but it is: ' + checkApp?.status);
    console.log('Need to use longer duration or higher flow to cause congestion');
    await prisma.$disconnect();
    return;
  }

  // Now trigger auto-run for that same date - should detect FAILED app and postpone it
  console.log(`\n--- Triggering auto-run for ${testDate.format('YYYY-MM-DD')} ---`);
  const autoRes = await fetch(`http://localhost:3001/scheduling/auto-run?date=${testDate.format('YYYY-MM-DD')}`, { method: 'POST' });
  const autoResult = await autoRes.json();
  console.log('Auto-run result:', JSON.stringify(autoResult, null, 2));

  // Check postponed status
  const afterAuto = await prisma.waterApplication.findUnique({ where: { id: smallApp.id } });
  console.log(`\nAfter auto-run:`);
  console.log(`  status: ${afterAuto?.status}`);
  console.log(`  targetDate: ${dayjs(afterAuto?.targetDate).format('YYYY-MM-DD')}`);
  console.log(`  postponeCount: ${afterAuto?.postponeCount}`);
  console.log(`  failReason: ${afterAuto?.failReason}`);

  // Check history
  const history = await prisma.applicationPostponeHistory.findMany({ where: { applicationId: smallApp.id } });
  console.log(`\nPostpone history (${history.length} records):`);
  for (const h of history) {
    console.log(`  originalDate=${dayjs(h.originalDate).format('YYYY-MM-DD')}, targetDate=${dayjs(h.targetDate).format('YYYY-MM-DD')}, reason=${h.reason}`);
  }

  // Check notifications
  const notifs = await prisma.notification.findMany({ where: { applicationId: smallApp.id } });
  console.log(`\nNotifications (${notifs.length}):`);
  for (const n of notifs) {
    console.log(`  type=${n.type}, title=${n.title}`);
    console.log(`  content=${n.content}`);
  }

  // Query postpone history via API
  console.log(`\n--- Query postpone history via API for farmer ${farmer2.id} ---`);
  const histRes = await fetch(`http://localhost:3001/scheduling/farmer/${farmer2.id}/postpone-history`);
  const histData = await histRes.json();
  console.log(`API returned ${histData.length} records:`);
  for (const h of histData) {
    console.log(`  originalDate=${h.originalDate}, targetDate=${h.targetDate}, reason=${h.reason}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
