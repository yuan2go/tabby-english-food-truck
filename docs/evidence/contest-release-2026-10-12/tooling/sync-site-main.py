from pathlib import Path
import subprocess,tarfile,shutil,os,json,sys
repo=Path('/Users/dafangzi/.codex/worktrees/contest-release-2026-10-12/tabby-english-food-truck');dst=Path('/Users/dafangzi/.codex/artifacts/tabby-contest-release-2026-10-12/site-runtime-source')
rev=sys.argv[1];head=sys.argv[2]
allpaths=subprocess.check_output(['git','ls-tree','-rz','--name-only',rev],cwd=repo).decode().split('\0');allpaths=[p for p in allpaths if p]
paths=[p for p in allpaths if not p.startswith(('docs/evidence/','docs/playtests/'))]
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
  with archive.extractfile(member) as src, target.open('wb') as out:shutil.copyfileobj(src,out)
  os.chmod(target,member.mode)
assert proc.wait()==0
metadata={'release':'contest-2026-10-12','githubMainSha':rev,'testedPullRequestHead':head,'demoPackageSha':'36200dd4d7bd931e4e5fedf8a25465d6b3f9e9e5','englishPackageSha':'103c2bb2272ddaa86fe32e342fc20e86feeb3a80','layoutFixPullRequest':18,'siteProjectId':'appgprj_6ab141055ab8819186112dee423d0d04'}
(dst/'public/site-release.json').write_text(json.dumps(metadata,indent=2)+'\n')
for start in range(0,len(paths),200):subprocess.run(['git','add','-f','--',*paths[start:start+200]],cwd=dst,check=True,stdout=subprocess.DEVNULL)
subprocess.run(['git','add','--all','--','.'],cwd=dst,check=True)
print(json.dumps({'sourceFromCommittedGitMain':rev,'retainedPaths':len(paths),'excludedOnlyRawProofs':len(allpaths)-len(paths),'noWorkingCopyDocChangesImported':True}))
