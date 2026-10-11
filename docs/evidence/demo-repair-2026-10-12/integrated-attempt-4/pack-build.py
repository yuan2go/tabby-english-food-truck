from pathlib import Path
import json,hashlib,html,csv,datetime
root=Path.cwd();dist=root/'dist';out=Path('/Users/dafangzi/.codex/artifacts/tabby-demo-2026-10-12');e=Path('/tmp/tabby-demo-final-4-2026-10-12')
files=[{'path':p.relative_to(dist).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(dist.rglob('*')) if p.is_file()]
jsfile=next((dist/'assets').glob('index-*.js'));js=jsfile.read_text()
sha='337bd84c7a24264f038a9d45be83b867fbac012b';mh=hashlib.sha256((root/'art/manifest.json').read_bytes()).hexdigest();assert f'sha:"{sha}",dirty:!1,assets:"{mh}"' in js
meta={'sha':sha,'dirty':False,'manifestSha256':mh,'content':'adventure-experience-2','entryFileMtimeUTC':datetime.datetime.fromtimestamp(jsfile.stat().st_mtime,datetime.timezone.utc).isoformat(),'timestampMethod':'Actual generated entry mtime. Vite tree-shakes unused builtAt; no claim this is a runtime exposed timestamp.','runtimeFiles':files}
for base in [e,out]:(base/'build-identity.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
rows=list(csv.DictReader((root/'docs/evidence/demo-repair-2026-10-12/audio-review-queue.csv').open()));rows.sort(key=lambda r:(r['priority']!='CORE',r['id']))
parts=['<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>大咪：同构建语音待审</title><style>body{font:18px system-ui;line-height:1.6;max-width:1000px;margin:auto;padding:20px;background:#fcf5df;color:#214635}summary{min-height:48px;cursor:pointer}audio{width:100%;height:54px}details{padding:8px;border-bottom:1px solid #ccc}code{overflow-wrap:anywhere}</style><h1>同构建语音待审</h1><p>全部458条可触达语音；66条核心优先。当前人工听审BLOCKED，教研/权利PENDING。本页只提供原文件播放与精确文本，播放不会自动变为审核通过。</p><p>构建 '+sha+'；dirty=false；资源hash '+mh+'</p><p><a href="build/">打开同一游戏构建</a> · <a href="audio-review-queue.csv">下载全部队列</a></p><p>成人逐条对照文本、发音、断句、音量/开头结尾、图音和适龄性；记录实际日期、审阅角色、意见与文件hash。声音分发授权必须另有可核验凭证。核心路径详见仓库主报告。</p>']
for r in rows:
 parts.append('<details><summary>'+html.escape(r['priority']+' · '+r['id']+' — '+r['text'])+'</summary><audio controls preload="none" src="build/audio/'+html.escape(r['id'])+'.wav"></audio><p>PCM '+r['sample_rate']+'Hz / '+r['bits']+'bit；时长 '+r['duration_s']+'s。人工审查：NOT_RUN，权利PENDING。</p><code>sha256 '+r['sha256']+'</code></details>')
parts.append('</html>');(out/'audio-review.html').write_text('\n'.join(parts));(out/'audio-review-queue.csv').write_bytes((root/'docs/evidence/demo-repair-2026-10-12/audio-review-queue.csv').read_bytes())
assert all((out/'build'/f['path']).is_file() and hashlib.sha256((out/'build'/f['path']).read_bytes()).hexdigest()==f['sha256'] for f in files)
print(json.dumps({**{k:v for k,v in meta.items() if k!='runtimeFiles'},'runtimeFileCount':len(files),'runtimeBytes':sum(x['bytes'] for x in files)},ensure_ascii=False,indent=2))
