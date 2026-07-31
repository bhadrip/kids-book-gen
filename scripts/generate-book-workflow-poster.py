from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A3
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "picture-book-generation-workflow-poster.pdf"

NAVY = colors.HexColor("#183B56")
INK = colors.HexColor("#263238")
MUTED = colors.HexColor("#607D8B")
CREAM = colors.HexColor("#FFF9F0")
TEAL = colors.HexColor("#2A9D8F")
GOLD = colors.HexColor("#F4A261")
CORAL = colors.HexColor("#E76F51")
BLUE = colors.HexColor("#457B9D")
PALE_TEAL = colors.HexColor("#E7F5F2")
PALE_GOLD = colors.HexColor("#FFF1D6")
PALE_CORAL = colors.HexColor("#FDEAE5")
PALE_BLUE = colors.HexColor("#EAF1F6")
WHITE = colors.white


def register_fonts() -> tuple[str, str, str]:
    candidates = [
        Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
        Path("/Library/Fonts/Arial.ttf"),
    ]
    bold_candidates = [
        Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
        Path("/Library/Fonts/Arial Bold.ttf"),
    ]
    italic_candidates = [
        Path("/System/Library/Fonts/Supplemental/Arial Italic.ttf"),
        Path("/Library/Fonts/Arial Italic.ttf"),
    ]
    regular = next((path for path in candidates if path.exists()), None)
    bold = next((path for path in bold_candidates if path.exists()), None)
    italic = next((path for path in italic_candidates if path.exists()), None)
    if regular and bold and italic:
        pdfmetrics.registerFont(TTFont("PosterSans", str(regular)))
        pdfmetrics.registerFont(TTFont("PosterSans-Bold", str(bold)))
        pdfmetrics.registerFont(TTFont("PosterSans-Italic", str(italic)))
        return "PosterSans", "PosterSans-Bold", "PosterSans-Italic"
    return "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"


FONT, FONT_BOLD, FONT_ITALIC = register_fonts()

STEPS = [
    {
        "title": "Reader + intent brief",
        "purpose": "Define who this book is for before generating ideas.",
        "do": "Capture age, read-aloud mode, language, interests, sensitivities, purpose, format, must-keep and must-avoid details.",
        "output": "ProjectBrief v1",
        "gate": "Parent confirms the interpretation.",
        "example": "Age 4; cozy suspense; loves kites; no separation peril; must keep a rooftop launch.",
    },
    {
        "title": "Concept directions",
        "purpose": "Offer different story engines, not title variations.",
        "do": "Create 2-3 options with a story promise, pleasure mode, realism choice, participation pattern and likely ending.",
        "output": "StoryDirections",
        "gate": "Parent chooses or combines one.",
        "example": "Chosen: Maya hides a torn kite, then repairs both kite and trust before launch day.",
    },
    {
        "title": "Story architecture",
        "purpose": "Make the plot causal, active and emotionally meaningful.",
        "do": "Define protagonist, desire, disruption, attempts, consequences, harder choice, decisive action, resolution and reaction.",
        "output": "StoryBible + BeatGraph",
        "gate": "Agency, causality, escalation, safety and earned ending pass.",
        "example": "Maya hides the tear -> patch fails -> wind worsens it -> she tells Arun -> they repair it together.",
    },
    {
        "title": "Spread map",
        "purpose": "Give every page turn a unique job.",
        "do": "Assign story job, text job, visual job, before/after state, reader question, challenge budget and continuity facts.",
        "output": "SpreadMap",
        "gate": "Every spread is necessary; the arc fits the format.",
        "example": "Spread 6: the secret patch peels. Visual clue: one loose red thread. Hook: Who saw it?",
    },
    {
        "title": "Read-aloud manuscript",
        "purpose": "Turn the map into pleasurable spoken language.",
        "do": "Draft concise narration/dialogue, supported rich words, refrain, rhythm, clear referents and manageable inference.",
        "output": "Manuscript v1",
        "gate": "Human read-aloud plus language, comprehension and engagement review.",
        "example": "\"Hold tight, little kite,\" Maya whispered. But the wind tugged: tug-tug-TEAR.",
    },
    {
        "title": "Parent story approval",
        "purpose": "Lock the expensive story decisions.",
        "do": "Show the promise, characters, ending, spread outline and all must-keep details. Record requested changes explicitly.",
        "output": "Approved story version",
        "gate": "Parent approves or requests a successor version.",
        "example": "Locked: Maya, Arun, rooftop setting, honest confession and cooperative repair.",
    },
    {
        "title": "Visual bible",
        "purpose": "Create one source of truth for visual identity.",
        "do": "Define character model sheets, expressions, proportions, clothing, palette, medium, locations, props and allowed changes.",
        "output": "VisualBible + fact graph",
        "gate": "Parent approves identity and art direction.",
        "example": "Maya: round glasses, yellow overalls. Kite: red diamond, blue tail, lower-left tear after spread 4.",
    },
    {
        "title": "Storyboard + sample",
        "purpose": "Solve sequence and layout before final rendering.",
        "do": "Thumbnail every spread; vary framing with story rhythm. Produce 1-2 near-final samples with actual text placement.",
        "output": "Storyboard + sample spreads",
        "gate": "Visual causality, emotion, page turns, text-image fit and parent approval pass.",
        "example": "Wide windy rooftop -> close-up of loose thread -> quiet negative space during confession.",
    },
    {
        "title": "Final illustrations",
        "purpose": "Render approved scenes without losing continuity.",
        "do": "Use approved references, adjacent-spread context and exact scene specs. Store model, prompt and settings provenance.",
        "output": "Final art by spread",
        "gate": "Identity, action, props, world, safety and text-image agreement pass.",
        "example": "Spread 9 must show the same tear position, Maya still in yellow overalls, and Arun holding the blue thread.",
    },
    {
        "title": "Typography + layout",
        "purpose": "Turn text and pictures into a readable book object.",
        "do": "Apply type hierarchy, safe areas, whitespace, trim, bleed and front/back matter. Keep generated text out of artwork.",
        "output": "Laid-out book",
        "gate": "No overflow, unsafe margin, missing page or unreadable contrast.",
        "example": "Place the whisper in quiet sky space; reserve the full-bleed launch spread for the visual payoff.",
    },
    {
        "title": "Holistic proof + preflight",
        "purpose": "Check the complete experience and production file.",
        "do": "Review safety, story, listening fit, engagement, visual rhythm, continuity, page order, resolution and accessibility.",
        "output": "Readiness profile + proof",
        "gate": "All blockers pass; parent approves the full proof.",
        "example": "Catch: the repaired corner changes sides on spread 11. Local repair only; keep approved sibling spreads.",
    },
    {
        "title": "Export + field learning",
        "purpose": "Deliver the approved version and learn from real reading.",
        "do": "Export with provenance. Optionally record attention, predictions, delight, confusion, favorite part and reread intent.",
        "output": "Approved PDF + observations",
        "gate": "Revisions are bounded, consented and versioned.",
        "example": "Child predicts the confession and asks for a reread, but misses why the patch failed -> clarify the visual clue.",
    },
]


def draw_paragraph(
    canvas: Canvas,
    text: str,
    x: float,
    y_top: float,
    width: float,
    style: ParagraphStyle,
    max_height: float,
) -> float:
    paragraph = Paragraph(text, style)
    _, height = paragraph.wrap(width, max_height)
    paragraph.drawOn(canvas, x, y_top - height)
    return height


def build() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    width, height = A3
    canvas = Canvas(str(OUTPUT), pagesize=A3)
    canvas.setTitle("12-Stage Picture Book Generation Workflow")
    canvas.setAuthor("Kids Book Gen")
    canvas.setSubject("Daily reference poster for generating and evaluating picture books")

    canvas.setFillColor(CREAM)
    canvas.rect(0, 0, width, height, stroke=0, fill=1)

    margin = 13 * mm
    header_h = 43 * mm
    footer_h = 18 * mm
    canvas.setFillColor(NAVY)
    canvas.roundRect(margin, height - margin - header_h, width - 2 * margin, header_h, 5 * mm, stroke=0, fill=1)

    title_style = ParagraphStyle(
        "title",
        fontName=FONT_BOLD,
        fontSize=25,
        leading=27,
        textColor=WHITE,
        alignment=TA_CENTER,
    )
    subtitle_style = ParagraphStyle(
        "subtitle",
        fontName=FONT,
        fontSize=10.2,
        leading=13,
        textColor=colors.HexColor("#DDEAF2"),
        alignment=TA_CENTER,
    )
    draw_paragraph(
        canvas,
        "THE 12-STAGE PICTURE BOOK GENERATION WORKFLOW",
        margin + 10 * mm,
        height - margin - 9 * mm,
        width - 2 * margin - 20 * mm,
        title_style,
        20 * mm,
    )
    draw_paragraph(
        canvas,
        "A daily build-and-review reference for ages 3-5  |  Running example: <b>Maya and the Torn Kite</b>",
        margin + 14 * mm,
        height - margin - 28 * mm,
        width - 2 * margin - 28 * mm,
        subtitle_style,
        14 * mm,
    )

    grid_top = height - margin - header_h - 7 * mm
    grid_bottom = margin + footer_h + 5 * mm
    col_gap = 5 * mm
    row_gap = 5 * mm
    card_w = (width - 2 * margin - 2 * col_gap) / 3
    card_h = (grid_top - grid_bottom - 3 * row_gap) / 4

    card_title = ParagraphStyle(
        "card_title",
        fontName=FONT_BOLD,
        fontSize=10.8,
        leading=12,
        textColor=NAVY,
        alignment=TA_LEFT,
    )
    body = ParagraphStyle(
        "body",
        fontName=FONT,
        fontSize=7.35,
        leading=9.15,
        textColor=INK,
        alignment=TA_LEFT,
        spaceAfter=0,
    )
    example_style = ParagraphStyle(
        "example",
        fontName=FONT_ITALIC,
        fontSize=7.15,
        leading=8.8,
        textColor=INK,
        alignment=TA_LEFT,
    )

    accents = [TEAL, GOLD, CORAL, BLUE]
    fills = [PALE_TEAL, PALE_GOLD, PALE_CORAL, PALE_BLUE]

    for index, step in enumerate(STEPS):
        row = index // 3
        col = index % 3
        x = margin + col * (card_w + col_gap)
        y = grid_top - (row + 1) * card_h - row * row_gap
        accent = accents[row]
        fill = fills[row]

        canvas.setFillColor(colors.white)
        canvas.setStrokeColor(colors.HexColor("#D8E0E5"))
        canvas.setLineWidth(0.6)
        canvas.roundRect(x, y, card_w, card_h, 3.5 * mm, stroke=1, fill=1)
        canvas.setFillColor(fill)
        canvas.roundRect(x, y + card_h - 18 * mm, card_w, 18 * mm, 3.5 * mm, stroke=0, fill=1)
        canvas.rect(x, y + card_h - 18 * mm, card_w, 4 * mm, stroke=0, fill=1)

        circle_x = x + 10 * mm
        circle_y = y + card_h - 9 * mm
        canvas.setFillColor(accent)
        canvas.circle(circle_x, circle_y, 6.1 * mm, stroke=0, fill=1)
        canvas.setFillColor(WHITE)
        canvas.setFont(FONT_BOLD, 12)
        number = str(index + 1)
        number_width = canvas.stringWidth(number, FONT_BOLD, 12)
        canvas.drawString(circle_x - number_width / 2, circle_y - 4, number)

        draw_paragraph(
            canvas,
            step["title"].upper(),
            x + 19 * mm,
            y + card_h - 5.8 * mm,
            card_w - 24 * mm,
            card_title,
            13 * mm,
        )

        inner_x = x + 5 * mm
        inner_w = card_w - 10 * mm
        cursor = y + card_h - 22 * mm
        sections = [
            ("WHY", step["purpose"], body),
            ("DO", step["do"], body),
            ("OUTPUT", step["output"], body),
            ("GATE", step["gate"], body),
        ]
        for label, value, style in sections:
            markup = f'<font name="{FONT_BOLD}" color="#183B56">{label}:</font> {value}'
            used = draw_paragraph(canvas, markup, inner_x, cursor, inner_w, style, 25 * mm)
            cursor -= used + 1.8 * mm

        example_box_h = 18.5 * mm
        canvas.setFillColor(fill)
        canvas.roundRect(
            inner_x,
            y + 4 * mm,
            inner_w,
            example_box_h,
            2 * mm,
            stroke=0,
            fill=1,
        )
        draw_paragraph(
            canvas,
            f'<font name="{FONT_BOLD}" color="#183B56">EXAMPLE:</font> {step["example"]}',
            inner_x + 2.5 * mm,
            y + 4 * mm + example_box_h - 2.4 * mm,
            inner_w - 5 * mm,
            example_style,
            example_box_h - 4 * mm,
        )

    footer_y = margin
    canvas.setFillColor(NAVY)
    canvas.roundRect(margin, footer_y, width - 2 * margin, footer_h, 3 * mm, stroke=0, fill=1)
    footer_style = ParagraphStyle(
        "footer",
        fontName=FONT,
        fontSize=8.2,
        leading=10.5,
        textColor=WHITE,
        alignment=TA_CENTER,
    )
    draw_paragraph(
        canvas,
        "<b>WORKING RULE:</b> Fix safety and production blockers first. Preserve parent-approved intent. "
        "Revise one bounded problem at a time. Rerun affected checks, then the whole-book review. "
        "<b>Predicted quality is not proof of child likeability - observe real reading and reread intent.</b>",
        margin + 8 * mm,
        footer_y + footer_h - 4.4 * mm,
        width - 2 * margin - 16 * mm,
        footer_style,
        footer_h - 5 * mm,
    )

    canvas.showPage()
    canvas.save()


if __name__ == "__main__":
    build()

