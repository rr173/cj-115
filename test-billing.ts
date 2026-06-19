import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

async function main() {
  const farmers = await prisma.farmer.findMany({ include: { channel: true } });
  const farmer1 = farmers.find(f => f.code === 'YH-001')!;
  const farmer2 = farmers.find(f => f.code === 'YH-002')!;
  console.log(`Farmer1: ${farmer1.name} (${farmer1.code}), area=${farmer1.area}亩`);
  console.log(`Farmer2: ${farmer2.name} (${farmer2.code}), area=${farmer2.area}亩`);

  // Set up quota for 2026 Q2: 120 m³/亩 (already set by seed)
  // farmer1 has 50亩, so quota = 50 * 120 = 6000 m³
  // farmer2 has 70亩, so quota = 70 * 120 = 8400 m³

  // Create EXECUTED applications for May 2026 with actual usage data
  // Farmer1: total actual usage = 7000 m³ (exceeds quota 6000, into tier2)
  const app1 = await prisma.waterApplication.create({
    data: {
      farmerId: farmer1.id,
      expectedFlow: 0.5,
      expectedHours: 3,
      requestVolume: 5400,
      submitTime: dayjs('2026-05-05').toDate(),
      targetDate: dayjs('2026-05-06').toDate(),
      originalTargetDate: dayjs('2026-05-06').toDate(),
      status: 'EXECUTED',
      postponeCount: 0,
    },
  });
  await prisma.actualUsage.create({
    data: {
      applicationId: app1.id,
      farmerId: farmer1.id,
      actualVolume: 4000,
      reportTime: dayjs('2026-05-06 18:00').toDate(),
      deviationRate: 4000 / 5400 - 1,
      isOveruse: false,
      isWaste: false,
    },
  });

  const app2 = await prisma.waterApplication.create({
    data: {
      farmerId: farmer1.id,
      expectedFlow: 0.5,
      expectedHours: 2,
      requestVolume: 3600,
      submitTime: dayjs('2026-05-15').toDate(),
      targetDate: dayjs('2026-05-16').toDate(),
      originalTargetDate: dayjs('2026-05-16').toDate(),
      status: 'EXECUTED',
      postponeCount: 0,
    },
  });
  await prisma.actualUsage.create({
    data: {
      applicationId: app2.id,
      farmerId: farmer1.id,
      actualVolume: 3000,
      reportTime: dayjs('2026-05-16 18:00').toDate(),
      deviationRate: 3000 / 3600 - 1,
      isOveruse: false,
      isWaste: false,
    },
  });

  // Farmer1 total = 4000 + 3000 = 7000 m³, quota = 6000
  // tier1: 6000 * 2.5 = 15000
  // tier2: (7000-6000)=1000 at 2.5*1.5=3.75 => 3750
  // total = 18750 元
  console.log(`\nFarmer1 setup: 2 executed apps, total actual = 7000 m³ (quota=6000)`);

  // Farmer2: total actual usage = 4000 m³ (well below quota 8400)
  // 4000 < 8400*0.8=6720, so subsidy applies
  // subsidy volume = 6720 - 4000 = 2720
  // subsidy amount = 2720 * 2.5 * 0.5 = 3400
  const app3 = await prisma.waterApplication.create({
    data: {
      farmerId: farmer2.id,
      expectedFlow: 0.5,
      expectedHours: 2,
      requestVolume: 3600,
      submitTime: dayjs('2026-05-10').toDate(),
      targetDate: dayjs('2026-05-11').toDate(),
      originalTargetDate: dayjs('2026-05-11').toDate(),
      status: 'EXECUTED',
      postponeCount: 0,
    },
  });
  await prisma.actualUsage.create({
    data: {
      applicationId: app3.id,
      farmerId: farmer2.id,
      actualVolume: 4000,
      reportTime: dayjs('2026-05-11 18:00').toDate(),
      deviationRate: 4000 / 3600 - 1,
      isOveruse: false,
      isWaste: false,
    },
  });
  console.log(`Farmer2 setup: 1 executed app, total actual = 4000 m³ (quota=8400, threshold=6720)`);
  console.log(`  Expected subsidy volume = 6720-4000 = 2720 m³`);
  console.log(`  Expected subsidy amount = 2720 * 2.5 * 0.5 = 3400 元`);
  console.log(`  Base bill = 4000 * 2.5 = 10000 元`);
  console.log(`  After subsidy = 10000 - 3400 = 6600 元`);

  // Also add an EXECUTED app without actual usage (test 90% estimation)
  const app4 = await prisma.waterApplication.create({
    data: {
      farmerId: farmer1.id,
      expectedFlow: 0.3,
      expectedHours: 1,
      requestVolume: 1080,
      submitTime: dayjs('2026-05-25').toDate(),
      targetDate: dayjs('2026-05-26').toDate(),
      originalTargetDate: dayjs('2026-05-26').toDate(),
      status: 'EXECUTED',
      postponeCount: 0,
    },
  });
  // NO actual usage reported for app4 => should estimate 1080 * 0.9 = 972
  console.log(`\nFarmer1 app4: EXECUTED but no actual usage reported, planned=1080, estimated=972`);
  console.log(`Farmer1 revised total = 7000 + 972 = 7972 m³`);

  // Now generate bills for May 2026
  console.log(`\n=== Generating bills for 2026-05 ===`);
  const res = await fetch('http://localhost:3001/water-billing/generate-bills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ year: 2026, month: 5 }),
  });
  const result = await res.json();
  console.log(`Result: success=${result.successCount}, skip=${result.skipCount}`);
  for (const b of result.bills || []) {
    console.log(`  ${b.farmerName}: billId=${b.billId}, totalAmount=${b.totalAmount}`);
  }

  // Get farmer1's bill detail
  if (result.bills && result.bills.length > 0) {
    const farmer1Bill = result.bills.find((b: any) => b.farmerId === farmer1.id);
    if (farmer1Bill) {
      console.log(`\n=== Farmer1 bill detail ===`);
      const detailRes = await fetch(`http://localhost:3001/water-billing/bill/${farmer1Bill.billId}`);
      const detail = await detailRes.json();
      console.log(`  totalVolume: ${detail.totalVolume}`);
      console.log(`  quotaVolume: ${detail.quotaVolume}`);
      console.log(`  tierBreakdown:`);
      for (const t of detail.tierBreakdown) {
        console.log(`    tier${t.tier}: volume=${t.volume}, unitPrice=${t.unitPrice}, amount=${t.amount}`);
      }
      console.log(`  baseAmount: ${detail.baseAmount}`);
      console.log(`  subsidy: ${JSON.stringify(detail.subsidy)}`);
      console.log(`  totalAmount: ${detail.totalAmount}`);
    }

    const farmer2Bill = result.bills.find((b: any) => b.farmerId === farmer2.id);
    if (farmer2Bill) {
      console.log(`\n=== Farmer2 bill detail (should have subsidy) ===`);
      const detailRes = await fetch(`http://localhost:3001/water-billing/bill/${farmer2Bill.billId}`);
      const detail = await detailRes.json();
      console.log(`  totalVolume: ${detail.totalVolume}`);
      console.log(`  quotaVolume: ${detail.quotaVolume}`);
      console.log(`  baseAmount: ${detail.baseAmount}`);
      console.log(`  subsidy: amount=${detail.subsidy.amount}, volume=${detail.subsidy.volume}`);
      console.log(`  totalAmount: ${detail.totalAmount}`);
      console.log(`  验证: 补贴正确=${detail.subsidy.amount === 3400 ? 'PASS' : 'FAIL (got ' + detail.subsidy.amount + ')'}`);
      console.log(`  验证: 最终金额=${detail.totalAmount === 6600 ? 'PASS' : 'FAIL (got ' + detail.totalAmount + ')'}`);
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
