import subprocess,json,time,platform
from pathlib import Path
out=Path('/tmp/tabby-continuous-release-head');out.mkdir(exist_ok=True)
results=[]
for label,cmd in [('lint',['npm','run','lint']),('unit',['npm','test']),('resources',['npm','run','resources']),('vocabulary',['node','scripts/check-vocabulary.mjs']),('build',['npm','run','build'])]:
 t=time.time()
 with (out/(label+'.log')).open('w') as f: r=subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT)
 item={'label':label,'command':cmd,'exit_code':r.returncode,'seconds':round(time.time()-t,2)}; results.append(item); print(json.dumps(item),flush=True)
 print('\n'.join((out/(label+'.log')).read_text().splitlines()[-8:]),flush=True)
 if r.returncode: break
(out/'engineering.json').write_text(json.dumps({'sha':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'dirty':bool(subprocess.check_output(['git','status','--porcelain'],text=True).strip()),'platform':platform.platform(),'node':subprocess.check_output(['node','--version'],text=True).strip(),'results':results},indent=2)+'\n')
raise SystemExit(max(x['exit_code'] for x in results))
