from pathlib import Path
import subprocess, shutil, hashlib, json, sys
source=Path(sys.argv[1]).resolve(); target=Path(sys.argv[2]).resolve(); receipt=Path(sys.argv[3]).resolve()
expected='appgprj_6ab141055ab8819186112dee423d0d04'
assert json.loads((source/'.openai/hosting.json').read_text())['project_id']==expected
assert json.loads((target/'.openai/hosting.json').read_text())['project_id']==expected
files=subprocess.check_output(['git','ls-files','-z'],cwd=source).decode().split('\0')[:-1]
excluded=('docs/evidence/','docs/playtests/')
retained=[name for name in files if not name.startswith(excluded)]
old=subprocess.check_output(['git','ls-files','-z'],cwd=target).decode().split('\0')[:-1]
removed=[]
for name in old:
 if name not in retained:
  p=target/name
  if p.is_file():p.unlink();removed.append(name)
for name in retained:
 p=source/name;q=target/name;q.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,q)
if (target/'dist').exists():shutil.rmtree(target/'dist')
shutil.copytree(source/'dist',target/'dist')
hash_file=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
differences=[name for name in retained if hash_file(source/name)!=hash_file(target/name)]
dist_files=[p for p in (source/'dist').rglob('*') if p.is_file()]
dist_diff=[str(p.relative_to(source/'dist')) for p in dist_files if hash_file(p)!=hash_file(target/'dist'/p.relative_to(source/'dist'))]
assert not differences and not dist_diff
receipt.write_text(json.dumps({'githubCodeMainSha':subprocess.check_output(['git','rev-parse','HEAD'],cwd=source).decode().strip(),'verifiedRetainedPaths':len(retained),'excludedPrefixes':excluded,'excludedRawEvidencePaths':len(files)-len(retained),'excludedEvidencePreserved':'all in merged GitHub main','removedOldTrackedPaths':removed,'differences':differences,'distVerifiedFiles':len(dist_files),'distDifferences':dist_diff,'status':'PASS'},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'retained':len(retained),'dist':len(dist_files),'differences':0}))
