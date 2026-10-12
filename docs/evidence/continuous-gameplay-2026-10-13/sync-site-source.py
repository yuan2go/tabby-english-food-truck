from pathlib import Path
import subprocess, tarfile, shutil, json, os, hashlib
repo=Path('/Users/dafangzi/.codex/worktrees/continuous-gameplay-2026-10-13/tabby-english-food-truck')
dst=Path('/Users/dafangzi/.codex/artifacts/tabby-continuous-release-2026-10-13/site-source')
rev=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()
assert rev=='1c6af31fd2c109fca3cb36786f2e5232814b5839'
assert not subprocess.check_output(['git','status','--porcelain'],cwd=repo,text=True).strip()
assert not subprocess.check_output(['git','status','--porcelain'],cwd=dst,text=True).strip()
allpaths=[p for p in subprocess.check_output(['git','ls-tree','-rz','--name-only',rev],cwd=repo).decode().split('\0') if p]
paths=[p for p in allpaths if not p.startswith(('docs/evidence/','docs/archive/','docs/playtests/'))]
old=subprocess.check_output(['git','ls-files','-z'],cwd=dst).decode().split('\0')
for name in old:
 if name and name not in paths and name!='public/site-release.json':
  p=dst/name
  if p.is_file():p.unlink()
proc=subprocess.Popen(['git','archive','--format=tar',rev,'--',*paths],cwd=repo,stdout=subprocess.PIPE)
with tarfile.open(fileobj=proc.stdout,mode='r|') as archive:
 for member in archive:
  if not member.isfile():continue
  target=(dst/member.name).resolve();assert target.is_relative_to(dst)
  target.parent.mkdir(parents=True,exist_ok=True)
  with archive.extractfile(member) as src,target.open('wb') as out:shutil.copyfileobj(src,out)
  os.chmod(target,member.mode)
assert proc.wait()==0
for name in paths:assert hashlib.sha256((repo/name).read_bytes()).digest()==hashlib.sha256((dst/name).read_bytes()).digest(), name
assert json.loads((dst/'.openai/hosting.json').read_text())['project_id']=='appgprj_6ab141055ab8819186112dee423d0d04'
metadata={'release':'continuous-gameplay-2026-10-13','githubMainSha':rev,'testedPullRequestHead':'a7ab8ed6de9567d8610eafd0b15fa35005180e9a','pullRequest':25,'ciRun':38291628118,'contentVersion':'continuous-gameplay-1','siteProjectId':'appgprj_6ab141055ab8819186112dee423d0d04'}
(dst/'public/site-release.json').write_text(json.dumps(metadata,indent=2)+'\n')
if (dst/'dist').exists():shutil.rmtree(dst/'dist')
shutil.copytree(repo/'dist',dst/'dist')
shutil.copy2(dst/'public/site-release.json',dst/'dist/site-release.json')
report={'sourceFromCommittedGitMain':rev,'testedHead':metadata['testedPullRequestHead'],'retainedPaths':len(paths),'excludedHistoricalProofPaths':len(allpaths)-len(paths),'allRetainedPathsByteIdentical':True,'extraPublicMetadataOnly':'site-release.json','distBuildFromCleanGitHubMain':True,'manifestProjectUnchanged':True}
out=Path('/Users/dafangzi/.codex/artifacts/tabby-continuous-release-2026-10-13/materials/evidence')
(out/'source-integrity.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
