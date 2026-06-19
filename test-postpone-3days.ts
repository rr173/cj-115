import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

async function main() {
  // Get farmer2 on NQ-01
  const farmer2 = await prisma.farmer.findFirst({
    where: { code: 'YH-008' },
    include: { channel: true },
  });
  if (!farmer2) throw new Error('No farmer found');
  
  // Get the channel tree to find dry canal
  const nq01 = await prisma.channel.findFirst({ where: { code: 'NQ-01' } });
  
  console.log(`Farmer: ${farmer2.name}, Channel: ${farmer2.channel.code}`);

  // Create a scenario: fill up 2026-06-27, 28, 29 (3 consecutive days) so app fails each day
  // First create a big blocking app for each day
  const farmer1 = await prisma.farmer.findFirst({ where: { code: 'YH-001' } });
  
  for (const dateStr of ['2026-06-27', '2026-06-28', '2026-06-29', '2026-06-30']) {
    const d = dayjs(dateStr).startOf('day');
    await prisma.waterApplication.create({
      data: {
        farmerId: farmer1!.id,
        expectedFlow: 0.9,
        expectedHours: 18,
        requestVolume: 0.9 * 18 * 3600,
        submitTime: dayjs().subtract(10, 'hour').toDate(),
        targetDate: d.toDate(),
        originalTargetDate: d.toDate(),
        status: 'PENDING',
        postponeCount: 0,
      },
    });
  }
  console.log('Created blocking apps for 06-27 through 06-30');

  // Schedule all days to make the blocking apps fill the channels
  for (const dateStr of ['2026-06-27', '2026-06-28', '2026-06-29', '2026-06-30']) {
    const res = await fetch(`http://localhost:3001/scheduling/run?date=${dateStr}`, { method: 'POST' });
    const r = await res.json();
    console.log(`Scheduled ${dateStr}: ${r.scheduled} scheduled, ${r.failed} failed`);
  }

  // Now create a test application that will fail on 06-27
  const testApp = await prisma.waterApplication.create({
    data: {
      farmerId: farmer2.id,
      expectedFlow: 0.2,
      expectedHours: 1,
      requestVolume: 720,
      submitTime: new Date(),
      targetDate: dayjs('2026-06-27').startOf('day').toDate(),
      originalTargetDate: dayjs('2026-06-27').startOf('day').toDate(),
      status: 'FAILED',
      failReason: '本日无法安排',
      postponeCount: 0,
    },
  });
  console.log(`\nCreated test app ${testApp.id} as FAILED on 2026-06-27`);

  // Round 1: auto-run for 06-27 should postpone to 06-28
  console.log('\n=== Round 1: auto-run 2026-06-27 ===');
  await fetch('http://localhost:3001/scheduling/auto-run?date=2026-06-27', { method: 'POST' });
  let app = await prisma.waterApplication.findUnique({ where: { id: testApp.id } });
  console.log(`  status=${app?.status}, postponeCount=${app?.postponeCount}, targetDate=${dayjs(app?.targetDate).format('YYYY-MM-DD')}`);

  // Round 2: set back to FAILED, auto-run for 06-28
  console.log('\n=== Round 2: auto-run 2026-06-28 ===');
  await prisma.waterApplication.update({ where: { id: testApp.id }, data: { status: 'FAILED' } });
  await fetch('http://localhost:3001/scheduling/auto-run?date=2026-06-28', { method: 'POST' });
  app = await prisma.waterApplication.findUnique({ where: { id: testApp.id } });
  console.log(`  status=${app?.status}, postponeCount=${app?.postponeCount}, targetDate=${dayjs(app?.targetDate).format('YYYY-MM-DD')}`);

  // Round 3: set back to FAILED, auto-run for 06-29
  console.log('\n=== Round 3: auto-run 2026-06-29 ===');
  await prisma.waterApplication.update({ where: { id: testApp.id }, data: { status: 'FAILED' } });
  await fetch('http://localhost:3001/scheduling/auto-run?date=2026-06-29', { method: 'POST' });
  app = await prisma.waterApplication.findUnique({ where: { id: testApp.id } });
  console.log(`  status=${app?.status}, postponeCount=${app?.postponeCount}, targetDate=${dayjs(app?.targetDate).format('YYYY-MM-DD')}`);

  // Round 4: should be FAILED_FINAL now (postponeCount=3, next time should mark final)
  console.log('\n=== Round 4: auto-run 2026-06-30 (should be FAILED_FINAL) ===');
  await prisma.waterApplication.update({ where: { id: testApp.id }, data: { status: 'FAILED' } });
  await fetch('http://localhost:3001/scheduling/auto-run?date=2026-06-30', { method: 'POST' });
  app = await prisma.waterApplication.findUnique({ where: { id: testApp.id } });
  console.log(`  status=${app?.status}, postponeCount=${app?.postponeCount}`);

  // Check full postpone history
  const hist = await prisma.applicationPostponeHistory.findMany({
    where: { applicationId: testApp.id },
    orderBy: { createdAt: 'asc' },
  });
  console.log(`\nFull postpone history (${hist.length} records):`);
  for (const h of hist) {
    console.log(`  ${dayjs(h.originalDate).format('YYYY-MM-DD')} -> ${dayjs(h.targetDate).format('YYYY-MM-DD')}: ${h.reason}`);
  }

  // Check notifications
  const notifs = await prisma.notification.findMany({
    where: { applicationId: testApp.id },
    orderBy: { createdAt: 'asc' },
  });
  console.log(`\nNotifications (${notifs.length}):`);
  for (const n of notifs) {
    console.log(`  type=${n.type}: ${n.content.substring(0, 80)}...`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
