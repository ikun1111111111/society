import re, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
js = open(r'E:/workbuddy/2026-09-14-20-48-27/club-site/dist/bundle-detail.js', encoding='utf-8').read()
print('文件大小:', len(js))
print('转义序列数量:', len(re.findall(r'\\u[0-9a-f]{4}', js)))
print('雷丁学院(原文):', '雷丁' in js)
print('陈明睿(原文):', '陈明睿' in js)
i = js.find('L19')
print('L19 上下文:', js[max(0, i-80):i+80] if i >= 0 else 'N/A')
