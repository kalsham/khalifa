#!/usr/bin/env python3
"""Build the polished Quick-Start Guide PDF for the UGC Creator Business OS bundle."""
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                 Spacer, Table, TableStyle, Flowable, PageBreak,
                                 KeepTogether)

INK = HexColor("#1C1C1E")
CREAM = HexColor("#FAF6EE")
CARD = HexColor("#F1EAD9")
ACCENT = HexColor("#E8674A")
GRAY = HexColor("#6B6B66")

PAGE_W, PAGE_H = letter
MARGIN = 0.85 * inch

styles = {
    "h1": ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=15, leading=19,
                          textColor=INK, spaceBefore=16, spaceAfter=6),
    "h2": ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=11.5, leading=15,
                          textColor=ACCENT, spaceBefore=10, spaceAfter=4),
    "body": ParagraphStyle("body", fontName="Helvetica", fontSize=10.3, leading=15,
                            textColor=INK, spaceAfter=6),
    "quote": ParagraphStyle("quote", fontName="Helvetica-Oblique", fontSize=10,
                             leading=14, textColor=INK, leftIndent=14,
                             spaceBefore=4, spaceAfter=8),
    "label": ParagraphStyle("label", fontName="Helvetica-Bold", fontSize=9.5,
                             leading=13, textColor=GRAY, spaceBefore=6, spaceAfter=2),
    "check": ParagraphStyle("check", fontName="Helvetica", fontSize=10, leading=14,
                             textColor=INK),
    "footnote": ParagraphStyle("footnote", fontName="Helvetica-Oblique", fontSize=9.5,
                                leading=14, textColor=ACCENT, spaceBefore=10),
}


class CheckBox(Flowable):
    def __init__(self, size=10.5):
        super().__init__()
        self.size = size
        self.width = size
        self.height = size

    def draw(self):
        self.canv.setLineWidth(1.3)
        self.canv.setStrokeColor(INK)
        self.canv.rect(0, 1, self.size, self.size)


def checklist_item(text):
    p = Paragraph(text, styles["check"])
    t = Table([[CheckBox(), p]], colWidths=[20, PAGE_W - 2 * MARGIN - 20])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (0, 0), 0),
    ]))
    return t


def rule(color=ACCENT, thickness=2, space_after=10):
    t = Table([[""]], colWidths=[PAGE_W - 2 * MARGIN], rowHeights=[thickness])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), color)]))
    return KeepTogether([t, Spacer(1, space_after)])


def draw_cover(canv, doc):
    canv.saveState()
    canv.setFillColor(INK)
    canv.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canv.setFillColor(ACCENT)
    canv.rect(0, PAGE_H - 0.18 * inch, PAGE_W, 0.18 * inch, fill=1, stroke=0)

    canv.setFillColor(white)
    canv.setFont("Helvetica-Bold", 30)
    canv.drawCentredString(PAGE_W / 2, PAGE_H - 3.0 * inch, "UGC CREATOR")
    canv.drawCentredString(PAGE_W / 2, PAGE_H - 3.5 * inch, "BUSINESS OS")

    canv.setFillColor(ACCENT)
    canv.setFont("Helvetica-Bold", 15)
    canv.drawCentredString(PAGE_W / 2, PAGE_H - 4.15 * inch, "QUICK-START GUIDE")

    canv.setStrokeColor(ACCENT)
    canv.setLineWidth(1.5)
    canv.line(PAGE_W / 2 - 1.1 * inch, PAGE_H - 4.45 * inch,
              PAGE_W / 2 + 1.1 * inch, PAGE_H - 4.45 * inch)

    canv.setFillColor(HexColor("#C9C4B4"))
    canv.setFont("Helvetica", 10.5)
    canv.drawCentredString(PAGE_W / 2, PAGE_H - 4.85 * inch,
                            "Price, pitch, and invoice brand deals with confidence.")

    canv.setFillColor(HexColor("#8A857A"))
    canv.setFont("Helvetica", 8.5)
    canv.drawCentredString(PAGE_W / 2, 0.7 * inch,
                            "Part of the UGC Creator Business OS bundle")
    canv.restoreState()


def draw_content_page(canv, doc):
    canv.saveState()
    canv.setFillColor(CREAM)
    canv.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canv.setFillColor(INK)
    canv.rect(0, PAGE_H - 0.5 * inch, PAGE_W, 0.5 * inch, fill=1, stroke=0)
    canv.setFillColor(white)
    canv.setFont("Helvetica-Bold", 9.5)
    canv.drawString(MARGIN, PAGE_H - 0.33 * inch, "UGC CREATOR BUSINESS OS")
    canv.setFillColor(ACCENT)
    canv.drawRightString(PAGE_W - MARGIN, PAGE_H - 0.33 * inch, "QUICK-START GUIDE")
    canv.setFillColor(GRAY)
    canv.setFont("Helvetica", 8.5)
    canv.drawCentredString(PAGE_W / 2, 0.45 * inch, f"Page {doc.page - 1}")
    canv.restoreState()


doc = BaseDocTemplate(
    "/home/user/khalifa/02-product/UGC-Creator-Quick-Start-Guide.pdf",
    pagesize=letter,
    leftMargin=MARGIN, rightMargin=MARGIN, topMargin=1.0 * inch, bottomMargin=0.8 * inch,
)
cover_frame = Frame(0, 0, PAGE_W, PAGE_H, id="cover")
content_frame = Frame(MARGIN, 0.8 * inch, PAGE_W - 2 * MARGIN,
                       PAGE_H - 1.8 * inch, id="content")
doc.addPageTemplates([
    PageTemplate(id="Cover", frames=[cover_frame], onPage=draw_cover),
    PageTemplate(id="Content", frames=[content_frame], onPage=draw_content_page),
])

story = [PageBreak()]
story[-1] = None
story = []
from reportlab.platypus import NextPageTemplate
story.append(NextPageTemplate("Content"))
story.append(PageBreak())

sections = [
    ("1. Make a copy first",
     ["Open the file in Google Sheets (upload it, then “File → Save as Google "
      "Sheets”) or Excel. Never edit the original download — keep it as a backup."]),
    ("2. Start with the Rate Calculator, even before your first deal",
     ["Go to the <b>Rate Calculator</b> tab and set your base hourly-equivalent rate in the "
      "blue cell. Not sure what to put? Start at $40–$60/hour if you're new, $75–$125/hour "
      "once you have 5+ completed deals and testimonials. This number should go up over time "
      "— revisit it monthly."]),
    ("3. Every brand conversation goes in the Pipeline — immediately",
     ["The moment a brand DMs you, replies to your pitch, or you find one worth reaching out "
      "to: add a row to <b>Brand Deal Pipeline</b>. Move the Stage dropdown forward as the "
      "conversation progresses. This does two things: nothing falls through the cracks, and "
      "you build a real record of your win rate over time (visible on the Dashboard)."]),
    ("4. Never quote a rate without checking Usage Rights first",
     ["Before you answer “how much do you charge,” ask the brand: <i>“Is this for "
      "your organic page only, or do you plan to run it as a paid ad? If so, for how long, and "
      "on which accounts?”</i> Their answer tells you which row to use in the <b>Usage "
      "Rights Cheat Sheet</b>, which tells you the multiplier to use in the Rate Calculator. "
      "This one habit is worth more than everything else in this guide combined."]),
    ("5. Every closed deal gets an invoice row",
     ["When a deal hits “Closed-Won” in the Pipeline, create the matching row in "
      "<b>Invoices</b>. Mark it Paid once you're actually paid — this is what feeds your "
      "real revenue numbers on the Dashboard, so keep it current."]),
    ("6. Check the Dashboard weekly, not daily",
     ["Once a week, look at: Active Pipeline Value (how much is in motion), Win Rate (are you "
      "closing what you pitch), and Total Unpaid Invoices (are you chasing money that's "
      "overdue). These three numbers tell you whether the business is healthy."]),
]

for heading, paras in sections:
    story.append(Paragraph(heading, styles["h1"]))
    for p in paras:
        story.append(Paragraph(p, styles["body"]))

story.append(rule())
story.append(Paragraph("Rate Negotiation Script", styles["h1"]))

script_items = [
    ("When a brand offers a rate first:",
     "“Thanks for sending that over! Based on [deliverable type] with [usage rights they "
     "mentioned], my rate for this scope is $[your calculator number]. Happy to talk through "
     "the details.”"),
    ("When a brand wants to expand usage after the fact:",
     "“Totally happy to extend usage — since that changes from [original terms] to "
     "[new terms], the rate for that would be $[recalculated number]. Want me to send an "
     "updated agreement?”"),
    ("When a brand pushes back on price:",
     "“I get it — if the budget's tighter, we could scale the usage rights down to "
     "[organic only / shorter window] to hit a lower number, or keep the usage as-is at the "
     "quoted rate. Which works better for you?”"),
]
for label, quote in script_items:
    story.append(Paragraph(label, styles["label"]))
    story.append(Paragraph(quote, styles["quote"]))

story.append(rule())
story.append(Paragraph("Usage Rights Contract Clause Checklist", styles["h1"]))
story.append(Paragraph(
    "Before you sign anything, the agreement should state, in writing:", styles["body"]))

checklist = [
    "Exact deliverables (number of videos/photos, length, format)",
    "Usage rights tier and duration (organic / whitelisted 30-90 days / paid ads 6mo / "
    "buyout) — match this to what you were actually paid for",
    "Which accounts can post/run the content (yours, theirs, both)",
    "Revision limit (1–2 rounds is standard; unlimited revisions is a red flag)",
    "Payment terms and due date (net 15 or net 30, not “after it goes live”)",
    "What happens if usage extends past the agreed window (should trigger a new rate, not "
    "silent free extension)",
]
for item in checklist:
    story.append(checklist_item(item))
    story.append(Spacer(1, 4))

story.append(Paragraph(
    "If a brand won't put these in writing, that itself is information.", styles["footnote"]))

doc.build(story)
print("guide pdf built")
