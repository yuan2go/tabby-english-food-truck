from pathlib import Path
import re, sys, json, hashlib, unicodedata
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader
import pypdfium2 as pdfium

md = Path(sys.argv[1]).resolve()
pdf = Path(sys.argv[2]).resolve()
qa = Path(sys.argv[3]).resolve()
qa.mkdir(parents=True, exist_ok=True)
font = '/Library/Fonts/Arial Unicode.ttf'
pdfmetrics.registerFont(TTFont('TabbyUnicode', font))
body = ParagraphStyle('body', fontName='TabbyUnicode', fontSize=10.2, leading=14.7, textColor=colors.HexColor('#263d31'), wordWrap='CJK', spaceAfter=6)
heading = ParagraphStyle('heading', parent=body, fontSize=12.5, leading=17, spaceBefore=8, spaceAfter=4, textColor=colors.HexColor('#32654d'))
title = ParagraphStyle('title', parent=body, fontSize=19.5, leading=26, spaceAfter=10)
meta = ParagraphStyle('meta', parent=body, fontSize=9, leading=12.5, spaceAfter=4)
caption = ParagraphStyle('caption', parent=meta, fontSize=8.5, leading=12, textColor=colors.HexColor('#5d675f'))
flows = []; expected = []
for block in re.split(r'\n\s*\n', md.read_text().strip()):
 if block.startswith('!['):
  match = re.fullmatch(r'!\[.*?\]\((.*?)\)', block)
  if not match: raise ValueError('Unexpected image syntax')
  imagepath = md.parent / match.group(1)
  im = Image(str(imagepath)); width = 350
  ratio = im.imageHeight / im.imageWidth
  im.drawWidth = width; im.drawHeight = width * ratio
  im.hAlign = 'CENTER';flows += [Spacer(1,4), im, Spacer(1,4)]
  continue
 lines = block.splitlines() if block.startswith('- ') else [block.replace('\n', ' ')]
 for line in lines:
  if line.startswith('# '): text = line[2:]; style = title
  elif line.startswith('## '): text = line[3:]; style = heading
  elif line.startswith('- '): text = '• ' + line[2:]; style = body
  else: text = line; style = caption if line.startswith('图1') else meta if line.startswith(('参赛简要说明','体验站点','公开访问')) else body
  expected.append(text)
  xml = escape(text)
  xml = re.sub(r'(https://[^\s]+)', r'<link href="\1" color="#32654d">\1</link>', xml)
  flows.append(Paragraph(xml, style))
SimpleDocTemplate(str(pdf), pagesize=A4, leftMargin=42,rightMargin=42,topMargin=36,bottomMargin=36,title='大咪的英语餐车设计说明',author='大咪的英语餐车').build(flows)
reader = PdfReader(pdf)
actual = '\n'.join(page.extract_text() or '' for page in reader.pages)
canonical = lambda text: re.sub(r'\s+', '', unicodedata.normalize('NFC', text))
if canonical(actual) != canonical(''.join(expected)):
 (qa / 'text-actual.txt').write_text(actual)
 (qa / 'text-expected.txt').write_text('\n'.join(expected))
 raise ValueError('PDF exact text differs from Markdown')
(qa / 'exported-text.txt').write_text(actual)
render = pdfium.PdfDocument(str(pdf))
for n in range(len(render)):
 page = render[n];image = page.render(scale=1.7).to_pil();image.save(qa / f'page-{n+1}.png');page.close()
render.close()
result = {'markdownSha256':hashlib.sha256(md.read_bytes()).hexdigest(),'pdfSha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'pages':len(reader.pages),'textBlocks':len(expected),'exactTextMatch':True,'font':'Arial Unicode embedded subset','visualInspection':'PENDING'}
(qa / 'pdf-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False))
