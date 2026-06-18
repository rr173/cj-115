import urllib.request
import json
import os
import datetime

BASE = 'http://localhost:3001'

def get(url):
    return json.loads(urllib.request.urlopen(BASE + url).read())

def post(url, data):
    req = urllib.request.Request(
        BASE + url,
        data=json.dumps(data).encode(),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    return json.loads(urllib.request.urlopen(req).read())

TOMORROW = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()

print(f"========== 水量平衡报表修复验证 ==========\n")

# 1. 先执行配水编排
print(f"【1】执行配水编排 (日期: {TOMORROW})")
result = post(f'/scheduling/run?date={TOMORROW}', {})
print(f"  处理: {result['totalProcessed']}  成功: {result['scheduled']}  失败: {result['failed']}")

# 2. 获取所有已安排申请并上报用水量
print(f"\n【2】上报多个用水户的实际用水量")
apps = get(f'/applications?targetDate={TOMORROW}')
scheduled = [a for a in apps if a['status'] == 'SCHEDULED']
print(f"  已安排申请数: {len(scheduled)}")

total_planned = 0
total_actual = 0
for i, app in enumerate(scheduled):
    ratio = [1.2, 1.0, 0.5, 0.9, 1.15, 0.4, 1.0, 1.05][i % 8]
    actual = app['requestVolume'] * ratio
    total_planned += app['requestVolume']
    total_actual += actual
    r = post('/accounting/report-usage', {'applicationId': app['id'], 'actualVolume': actual})
    print(f"  {r['farmer']['code']} {r['farmer']['name']}: 计划{r['plannedVolume']:.0f} 实际{r['actualVolume']:.0f} 偏差{r['deviationRate']:>7} → {r['evaluation']}")

print(f"\n  计划总计: {total_planned:.0f} m³")
print(f"  实际总计: {total_actual:.0f} m³")

# 3. 检查水量平衡报表
print(f"\n【3】水量平衡报表验证 (核心修复)")
bal = get(f"/accounting/balance?date={TOMORROW}")
print(f"  Summary:")
print(f"    干渠入口总供水:  {bal['summary']['totalInflow']:.2f} m³")
print(f"    末端实际用水:    {bal['summary']['totalActualUsed']:.2f} m³  ← 修复前恒为0")
print(f"    估算渗漏(5%):   {bal['summary']['estimatedLeakageLoss']:.2f} m³")
print(f"    未计及差值:     {bal['summary']['unaccountedDifference']:.2f} m³")

print(f"\n  农渠(FARM级别)明细:")
farm_ch = [d for d in bal['channelDetails'] if d['channel']['level'] == 'FARM']
farm_used = 0
farm_supplied = 0
for d in farm_ch:
    farm_used += d['actualUsedByEnd']
    farm_supplied += d['suppliedVolume']
    print(f"    {d['channel']['code']} {d['channel']['name']}: 供{d['suppliedVolume']:8.1f} 用{d['actualUsedByEnd']:8.1f} 漏{d['estimatedLeakageLoss']:8.1f} 余{d['balance']:8.1f}")

print(f"\n  农渠汇总: 供{farm_supplied:.1f} 用{farm_used:.1f}")
print(f"  Summary末端实际: {bal['summary']['totalActualUsed']:.1f}")

# 验证两个bug修复
print(f"\n【4】Bug修复验证:")

bug1_fixed = bal['summary']['totalActualUsed'] > 0
print(f"  Bug1 (末端用量恒为0):  {'✅ 已修复' if bug1_fixed else '❌ 仍为0'} (末端用量={bal['summary']['totalActualUsed']:.1f}m³)")

# Bug2: 实际用量应该和所有农渠末端用量加总相等，不应该是供水量的数倍
farm_total = sum(d['actualUsedByEnd'] for d in farm_ch)
bug2_fixed = abs(bal['summary']['totalActualUsed'] - farm_total) < 1.0 and bal['summary']['totalActualUsed'] <= bal['summary']['totalInflow'] * 2
print(f"  Bug2 (总用量重复计算): {'✅ 已修复' if bug2_fixed else '❌ 仍重复计算'}")
print(f"     Summary末端用量 = {bal['summary']['totalActualUsed']:.1f}")
print(f"     农渠加总实际用量 = {farm_total:.1f}")
print(f"     干渠总供水量     = {bal['summary']['totalInflow']:.1f}")

print(f"\n{'='*45}")
if bug1_fixed and bug2_fixed:
    print("🎉 两个Bug均已修复!")
else:
    print("⚠️ 仍有问题需要修复")
print(f"{'='*45}")
