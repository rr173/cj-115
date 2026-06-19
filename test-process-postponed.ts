import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

async function main() {
  const farmer = await prisma.farmer.findFirst({ where: { code: 'YH-006' } });
  if (!farmer) throw new Error('No farmer found');

  // Test: processFailedApplications uses yesterday's date
  // It looks for POSTPONED apps with targetDate = yesterday
  // But that's problematic: if an app was postponed to 2 days later (due to maintenance),
  // and processFailedApplications runs the next day (today), the targetDate is NOT yesterday
  // but 2 days from now. So it won't be picked up until its actual targetDate arrives.

  // Let's test the normal case: app postponed to tomorrow, processFailedApplications runs tomorrow
  const tomorrow = dayjs().add(1, 'day').startOf('day');
  
  // Create a POSTPONED app with targetDate = today (simulating yesterday's postponement)
  const today = dayjs().startOf('day');
  const app = await prisma.waterApplication.create({
    data: {
      farmerId: farmer.id,
      expectedFlow: 0.5,
      expectedHours: 1,
      requestVolume: 1800,
      submitTime: new Date(),
      targetDate: today.toDate(),
      originalTargetDate: today.subtract(1, 'day').toDate(),
      status: 'POSTPONED',
      postponeCount: 1,
    },
  });
  console.log(`Created POSTPONED app with targetDate=${today.format('YYYY-MM-DD')}`);

  // Now auto-run for today should:
  // 1. processFailedApplications: look for POSTPONED apps with targetDate = yesterday (NOT today)
  // Wait -- let me re-read the code...
  // processFailedApplications looks for POSTPONED with targetDate between yesterday and today
  // So if targetDate = today, it WON'T be picked up by processFailedApplications
  // Because the query is: targetDate >= yesterday AND targetDate < today
  
  // The flow is:
  // 1. processFailedApplications() - converts yesterday's POSTPONED to PENDING
  // 2. runScheduling(today) - picks up PENDING apps for today
  // 3. handlePostponementForFailedApps(today) - postpones today's FAILED apps
  
  // But wait: the POSTPONED app's targetDate IS today. runScheduling picks up 
  // PENDING, FAILED, and POSTPONED statuses. So even without processFailedApplications,
  // the app should be picked up by runScheduling directly!
  
  // Let's verify: does runScheduling pick up POSTPONED status?
  console.log('\n--- Calling auto-run for today ---');
  const res = await fetch(`http://localhost:3001/scheduling/auto-run?date=${today.format('YYYY-MM-DD')}`, { method: 'POST' });
  const result = await res.json();
  console.log(`Result: total=${result.totalProcessed}, scheduled=${result.scheduled}, failed=${result.failed}`);
  
  const updatedApp = await prisma.waterApplication.findUnique({ where: { id: app.id } });
  console.log(`App after auto-run: status=${updatedApp?.status}`);
  
  // Test the real case: what if processFailedApplications is looking at yesterday's apps
  // but the app was postponed to 2 days later (due to maintenance skip)?
  // Create an app whose targetDate is tomorrow (i.e., NOT yesterday/today)
  const appFuture = await prisma.waterApplication.create({
    data: {
      farmerId: farmer.id,
      expectedFlow: 0.3,
      expectedHours: 1,
      requestVolume: 1080,
      submitTime: new Date(),
      targetDate: tomorrow.toDate(),
      originalTargetDate: today.subtract(2, 'day').toDate(),
      status: 'POSTPONED',
      postponeCount: 2,
    },
  });
  console.log(`\nCreated POSTPONED app with targetDate=${tomorrow.format('YYYY-MM-DD')} (future)`);
  
  // Run auto-run for today - this app should NOT be affected
  console.log('--- Calling auto-run for today ---');
  await fetch(`http://localhost:3001/scheduling/auto-run?date=${today.format('YYYY-MM-DD')}`, { method: 'POST' });
  const checkFuture = await prisma.waterApplication.findUnique({ where: { id: appFuture.id } });
  console.log(`Future app after today's auto-run: status=${checkFuture?.status}, targetDate=${dayjs(checkFuture?.targetDate).format('YYYY-MM-DD')}`);
  console.log(`验证: 未来的顺延申请不应被今天的auto-run影响: ${checkFuture?.status === 'POSTPONED' ? 'PASS' : 'FAIL'}`);

  // Run auto-run for tomorrow - NOW it should pick up the POSTPONED app
  console.log(`\n--- Calling auto-run for tomorrow (${tomorrow.format('YYYY-MM-DD')}) ---`);
  await fetch(`http://localhost:3001/scheduling/auto-run?date=${tomorrow.format('YYYY-MM-DD')}`, { method: 'POST' });
  const checkAfterTomorrow = await prisma.waterApplication.findUnique({ where: { id: appFuture.id } });
  console.log(`Future app after tomorrow's auto-run: status=${checkAfterTomorrow?.status}`);
  console.log(`验证: POSTPONED申请在其targetDate当天被编排: ${checkAfterTomorrow?.status === 'SCHEDULED' ? 'PASS' : 'FAIL (got ' + checkAfterTomorrow?.status + ')'}`);

  await prisma.$disconnect();
}

main().catch(console.error);
