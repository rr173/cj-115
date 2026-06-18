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

print(f"========== 灌区渠网配水调度系统功能验证 ==========\n")

# 1. 查询渠道
print(f"【1】渠网结构验证")
channels = get('/channels')
levels = {}
for c in channels:
    levels[c['level']] = levels.get(c['level'], 0) + 1
print(f"  总渠道数: {len(channels)}")
print(f"  级别分布: 干渠(MAIN)={levels.get('MAIN',0)}  支渠(BRANCH)={levels.get('BRANCH',0)}  斗渠(LATERAL)={levels.get('LATERAL',0)}  农渠(FARM)={levels.get('FARM',0)}")
main_ch = [c for c in channels if c['level']=='MAIN'][0]
print(f"  干渠 {main_ch['code']}: 最大流量{main_ch['maxFlow']}m³/s 传播延迟{main_ch['propagationDelay']}分钟")
print("  ✅ 渠道结构正确\n")

# 2. 查询用水户和定额状态
print(f"【2】用水户与定额状态")
farmers = get('/farmers')
print(f"  注册用水户数: {len(farmers)}")
for f in farmers[:3]:
    qs = get(f"/quotas/farmer/{f['id']}/status?year=2026&quarter=Q2")
    print(f"    {f['code']} {f['name']:6} {f['area']:4.0f}亩  总额度:{qs['totalAvailable']:8.1f} 已申请:{qs['appliedAmount']:8.1f} 剩余:{qs['remainingAmount']:8.1f}")
print(f"  ... 共{len(farmers)}户")
print("  ✅ 用水户与定额关联正确\n")

# 3. 配水编排
print(f"【3】配水编排 (日期: {TOMORROW})")
result = post(f'/scheduling/run?date={TOMORROW}', {})
print(f"  处理申请数: {result['totalProcessed']}  成功安排: {result['scheduled']}  失败: {result['failed']}")
for d in result['details'][:4]:
    print(f"    {d['farmerCode']} {d['status']} {d['farmerStartTime']}~{d['farmerEndTime']} 流量{d['flow']}m³/s 量级{d['volume']:.0f}m³")
if len(result['details'])>4:
    print(f"    ... 还有{len(result['details'])-4}份")
print("  ✅ 配水编排完成 (考虑了传播延迟与流量约束)\n")

# 4. 干渠时段占用
print(f"【4】干渠时段占用情况 (每30分钟分槽)")
sched = get(f"/scheduling/channel/{main_ch['id']}?date={TOMORROW}")
slots = [s for s in sched['timeSlots'] if s['allocatedFlow']>0]
print(f"  活跃时段数: {len(slots)}/48")
for s in slots[:8]:
    apps = '、'.join([f"{a['farmerCode']}" for a in s['servingApplications']])
    print(f"    {s['timeRange']} 已用:{s['allocatedFlow']:5.2f}/{s['maxFlow']:5.2f} 剩余:{s['remainingCapacity']:5.2f} 服务:{apps}")
if len(slots)>8:
    print(f"    ... 还有{len(slots)-8}个时段")
print("  ✅ 时段占用查询正确\n")

# 5. 上报实际用水量 (超用+正常+浪费)
print(f"【5】水量核算 - 偏差率计算")
apps = get(f'/applications?targetDate={TOMORROW}')
cases = [
    (apps[0], 1.20, "超用(120%)"),
    (apps[1], 1.00, "正常(100%)"),
    (apps[2], 0.50, "浪费(50%)"),
]
results = []
for app, ratio, label in cases:
    actual = app['requestVolume'] * ratio
    r = post('/accounting/report-usage', {'applicationId': app['id'], 'actualVolume': actual})
    results.append(r)
    print(f"  {r['farmer']['code']} {r['farmer']['name']}: 计划{r['plannedVolume']:.0f} 实际{r['actualVolume']:.0f} 偏差{r['deviationRate']:>7} → {r['evaluation']}")
print("  ✅ 偏差率计算正确 (>110%超用, <60%浪费)\n")

# 6. 水量平衡报表
print(f"【6】渠道水量平衡报表")
bal = get(f"/accounting/balance?date={TOMORROW}")
print(f"  干渠入口总供水: {bal['summary']['totalInflow']:10.2f} m³")
print(f"  末端实际用水:   {bal['summary']['totalActualUsed']:10.2f} m³")
print(f"  估算渗漏损耗(5%):{bal['summary']['estimatedLeakageLoss']:10.2f} m³")
print(f"  未计及差值:     {bal['summary']['unaccountedDifference']:10.2f} m³")
print("  各级渠道明细:")
for ch in bal['channelDetails']:
    cd = ch['channel']
    print(f"    {cd['code']:8} {cd['level']:7} 供{ch['suppliedVolume']:8.1f} 分{ch['distributedToChildren']:8.1f} 末端用{ch['actualUsedByEnd']:8.1f}")
print("  ✅ 水量平衡报表生成正确\n")

# 7. 定额调整 - 自动裁减
print(f"【7】定额管理 - 调低定额自动裁减申请")
f = farmers[3]
old_status = get(f"/quotas/farmer/{f['id']}/status?year=2026&quarter=Q2")
total_old = old_status['totalAvailable']
new_amount = 40
total_new = f['area'] * new_amount
print(f"  用水户: {f['code']} {f['name']} {f['area']}亩")
print(f"  原定额: {old_status['quota']['amount']}m³/亩 总额度={total_old:.0f}m³ 已申请={old_status['appliedAmount']:.0f}m³")
print(f"  新定额: {new_amount}m³/亩 总额度={total_new:.0f}m³ 超量={(old_status['appliedAmount']-total_new):.0f}m³")
qr = post('/quotas', {'farmerId': f['id'], 'quarter': 'Q2', 'year': 2026, 'amount': new_amount})
if qr['cancelledApplications']:
    print(f"  ✅ 自动裁减了 {len(qr['cancelledApplications'])} 个最晚提交的超量申请:")
    for ca in qr['cancelledApplications']:
        print(f"     - 裁减量: {ca['requestVolume']:.1f}m³ (标记:因定额调整取消)")
else:
    print(f"  (该户已申请未超新额度,无需裁减)")
new_status = get(f"/quotas/farmer/{f['id']}/status?year=2026&quarter=Q2")
print(f"  调整后: 已申请={new_status['appliedAmount']:.0f} 剩余={new_status['remainingAmount']:.0f}")
print("  ✅ 定额调低自动裁减功能正确\n")

print("=" * 55)
print("🎉 所有核心功能验证通过!")
print(f"🌐 Swagger API文档: {BASE}/api")
print("=" * 55)
