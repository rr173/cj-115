import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

async function main() {
  const farmer2 = await prisma.farmer.findFirst({ where: { code: 'YH-008' }, include: { channel: true } });
  const farmer1 = await prisma.farmer.findFirst({ where: { code: 'YH-001' } });
  if (!farmer2 || !farmer1) throw new Error('No farmer found');
  
  // NQ-01's channel ID
  const nq01Id = farmer2.channel.id;
  console.log(`NQ-01 id: ${nq01Id}`);

  // Create a maintenance order on NQ-01 that covers 07-03 to 07-05 (3 days)
  const mainOrder = await prisma.maintenanceOrder.create({
    data: {
      channelId: nq01Id,
      planStartDate: dayjs('2026-07-03').toDate(),
      estimatedDurationDays: 3,
      crewCode: 'CREW-TEST',
      status: 'APPROVED',
      stopWaterStart: dayjs('2026-07-03').startOf('day').toDate(),
      stopWaterEnd: dayjs('2026-07-05').endOf('day').toDate(),
    },
  });
  console.log(`Created maintenance order: stopWater 2026-07-03 to 2026-07-05`);

  // Fill up 2026-07-02 so the app fails there
  await prisma.waterApplication.create({
    data: {
      farmerId: farmer1.id,
      expectedFlow: 0.9,
      expectedHours: 18,
      requestVolume: 0.9 * 18 * 3600,
      submitTime: dayjs().subtract(10, 'hour').toDate(),
      targetDate: dayjs('2026-07-02').startOf('day').toDate(),
      originalTargetDate: dayjs('2026-07-02').startOf('day').toDate(),
      status: 'PENDING',
      postponeCount: 0,
    },
  });
  // Schedule it
  const schedRes = await fetch('http://localhost:3001/scheduling/run?date=2026-07-02', { method: 'POST' });
  const schedResult = await schedRes.json();
  console.log(`Scheduled 2026-07-02: ${schedResult.scheduled} scheduled`);

  // Create a test app that FAILS on 2026-07-02
  const testApp = await prisma.waterApplication.create({
    data: {
      farmerId: farmer2.id,
      expectedFlow: 0.2,
      expectedHours: 1,
      requestVolume: 720,
      submitTime: new Date(),
      targetDate: dayjs('2026-07-02').startOf('day').toDate(),
      originalTargetDate: dayjs('2026-07-02').startOf('day').toDate(),
      status: 'FAILED',
      failReason: '本日无法安排',
      postponeCount: 0,
    },
  });
  console.log(`Created test app as FAILED on 2026-07-02`);

  // Trigger auto-run for 2026-07-02
  // The next day would be 07-03, but 07-03/04/05 are in maintenance
  // So it should skip to 2026-07-06
  console.log('\n=== Auto-run 2026-07-02: should skip maintenance window (07-03 to 07-05) ===');
  await fetch('http://localhost:3001/scheduling/auto-run?date=2026-07-02', { method: 'POST' });
  
  const app = await prisma.waterApplication.findUnique({ where: { id: testApp.id } });
  console.log(`  status: ${app?.status}`);
  console.log(`  targetDate: ${dayjs(app?.targetDate).format('YYYY-MM-DD')}`);
  console.log(`  postponeCount: ${app?.postponeCount}`);
  console.log(`  failReason: ${app?.failReason}`);

  // Check history
  const hist = await prisma.applicationPostponeHistory.findMany({
    where: { applicationId: testApp.id },
  });
  console.log(`\nPostpone history:`);
  for (const h of hist) {
    console.log(`  ${dayjs(h.originalDate).format('YYYY-MM-DD')} -> ${dayjs(h.targetDate).format('YYYY-MM-DD')}: ${h.reason}`);
  }

  // IMPORTANT: Does the postponeCount still only increment by 1 even though it skipped multiple days?
  // The requirement says "最多连续顺延3天" - does skipping maintenance count towards that limit?
  // The requirement says "顺延过程中如果该申请对应的渠道正好有维护停水计划,跳过那天直接顺延到停水结束后的第一个可用日"
  // So a skip should count as 1 postponement but skip over multiple calendar days
  
  console.log(`\n验证: postponeCount应该=1 (跳过停水期只算1次顺延): ${app?.postponeCount === 1 ? 'PASS' : 'FAIL'}`);
  console.log(`验证: targetDate应该=2026-07-06 (停水结束后第一天): ${dayjs(app?.targetDate).format('YYYY-MM-DD') === '2026-07-06' ? 'PASS' : 'FAIL'}`);

  await prisma.$disconnect();
}

main().catch(console.error);
