import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import { ChannelLevel, QuotaQuarter } from '../src/common/enums';

const prisma = new PrismaClient();

const FLOW_SPEED = 0.8;
function calcDelay(length: number) {
  return Math.floor(length / FLOW_SPEED / 60);
}

async function main() {
  console.log('开始填充示例数据...');

  await prisma.actualUsage.deleteMany({});
  await prisma.waterAllocation.deleteMany({});
  await prisma.waterApplication.deleteMany({});
  await prisma.quota.deleteMany({});
  await prisma.farmer.deleteMany({});
  await prisma.channel.deleteMany({});

  const mainChannel = await prisma.channel.create({
    data: {
      code: 'GQ-01',
      name: '总干渠',
      level: ChannelLevel.MAIN,
      maxFlow: 10.0,
      length: 5000,
      propagationDelay: calcDelay(5000),
    },
  });
  console.log('干渠:', mainChannel.code, '传播延迟:', mainChannel.propagationDelay, '分钟');

  const branch1 = await prisma.channel.create({
    data: {
      code: 'ZQ-01',
      name: '东支渠',
      level: ChannelLevel.BRANCH,
      maxFlow: 5.0,
      length: 3000,
      parentId: mainChannel.id,
      propagationDelay: calcDelay(3000),
    },
  });
  const branch2 = await prisma.channel.create({
    data: {
      code: 'ZQ-02',
      name: '西支渠',
      level: ChannelLevel.BRANCH,
      maxFlow: 4.5,
      length: 2800,
      parentId: mainChannel.id,
      propagationDelay: calcDelay(2800),
    },
  });
  console.log('支渠:', branch1.code, branch2.code);

  const lateral1 = await prisma.channel.create({
    data: {
      code: 'DQ-01',
      name: '东1斗渠',
      level: ChannelLevel.LATERAL,
      maxFlow: 2.5,
      length: 1500,
      parentId: branch1.id,
      propagationDelay: calcDelay(1500),
    },
  });
  const lateral2 = await prisma.channel.create({
    data: {
      code: 'DQ-02',
      name: '东2斗渠',
      level: ChannelLevel.LATERAL,
      maxFlow: 2.0,
      length: 1200,
      parentId: branch1.id,
      propagationDelay: calcDelay(1200),
    },
  });
  const lateral3 = await prisma.channel.create({
    data: {
      code: 'DQ-03',
      name: '西1斗渠',
      level: ChannelLevel.LATERAL,
      maxFlow: 2.2,
      length: 1400,
      parentId: branch2.id,
      propagationDelay: calcDelay(1400),
    },
  });
  console.log('斗渠:', lateral1.code, lateral2.code, lateral3.code);

  const farmChannels = [];
  for (let i = 1; i <= 4; i++) {
    const f = await prisma.channel.create({
      data: {
        code: `NQ-${i.toString().padStart(2, '0')}`,
        name: `农渠${i}号(东片区)`,
        level: ChannelLevel.FARM,
        maxFlow: 1.0,
        length: 500 + i * 50,
        parentId: i <= 2 ? lateral1.id : lateral2.id,
        propagationDelay: calcDelay(500 + i * 50),
      },
    });
    farmChannels.push(f);
  }
  for (let i = 5; i <= 7; i++) {
    const f = await prisma.channel.create({
      data: {
        code: `NQ-${i.toString().padStart(2, '0')}`,
        name: `农渠${i}号(西片区)`,
        level: ChannelLevel.FARM,
        maxFlow: 0.9,
        length: 480 + i * 30,
        parentId: lateral3.id,
        propagationDelay: calcDelay(480 + i * 30),
      },
    });
    farmChannels.push(f);
  }
  console.log('农渠:', farmChannels.map((c) => c.code).join(', '));

  const farmers = [];
  const farmerNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二'];
  for (let i = 0; i < 10; i++) {
    const f = await prisma.farmer.create({
      data: {
        code: `YH-${(i + 1).toString().padStart(3, '0')}`,
        name: farmerNames[i],
        channelId: farmChannels[i % farmChannels.length].id,
        area: 50 + (i % 5) * 20,
      },
    });
    farmers.push(f);
  }
  console.log('用水户:', farmers.map((f) => `${f.code}(${f.name},${f.area}亩)`).join(', '));

  const currentYear = dayjs().year();
  const currentQuarter = Math.floor(dayjs().month() / 3) + 1;
  const quarterMap = { 1: QuotaQuarter.Q1, 2: QuotaQuarter.Q2, 3: QuotaQuarter.Q3, 4: QuotaQuarter.Q4 };
  for (const farmer of farmers) {
    await prisma.quota.create({
      data: {
        farmerId: farmer.id,
        year: currentYear,
        quarter: quarterMap[currentQuarter as keyof typeof quarterMap],
        amount: 120,
      },
    });
  }
  console.log(`已设置${currentYear}年Q${currentQuarter}定额: 120m³/亩`);

  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
  console.log(`为${tomorrow}生成示例申请...`);

  const apps = [];
  for (let i = 0; i < 8; i++) {
    const farmer = farmers[i];
    const app = await prisma.waterApplication.create({
      data: {
        farmerId: farmer.id,
        expectedFlow: 0.5 + (i % 3) * 0.15,
        expectedHours: 2 + (i % 4) * 0.5,
        requestVolume: (0.5 + (i % 3) * 0.15) * (2 + (i % 4) * 0.5) * 3600,
        submitTime: dayjs().subtract(i * 10, 'minute').toDate(),
        targetDate: dayjs(tomorrow).toDate(),
      },
    });
    apps.push(app);
    console.log(`  申请${i + 1}: ${farmer.name} ${app.expectedFlow}m³/s × ${app.expectedHours}h = ${app.requestVolume.toFixed(0)}m³`);
  }

  console.log('\n示例数据填充完成!');
  console.log('渠道结构: 1干渠 → 2支渠 → 3斗渠 → 7农渠');
  console.log('用水户: 10户');
  console.log(`已提交${tomorrow}的用水申请: ${apps.length}份`);
  console.log(`\n接下来可调用 POST /scheduling/run?date=${tomorrow} 进行配水编排`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
