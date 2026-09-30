import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def generate_report(toc_map=None, lof_map=None):
    doc = Document()

    COLOR_BLACK = RGBColor(0, 0, 0)
    COLOR_DARK_RED = RGBColor(192, 0, 0)       # #C00000
    COLOR_NAVY = RGBColor(0, 32, 96)          # #002060
    COLOR_GRAY = RGBColor(128, 128, 128)

    # Normal Style: Times New Roman, 12pt, 1.5 line spacing, Justified
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Times New Roman'
    style_normal.font.size = Pt(12)
    style_normal.font.color.rgb = COLOR_BLACK
    style_normal.paragraph_format.line_spacing = 1.35
    style_normal.paragraph_format.space_after = Pt(4)
    style_normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # XML Helpers
    def set_cell_margins(cell, top=60, bottom=60, left=80, right=80):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(
            f'<w:tcMar {nsdecls("w")}>\n'
            f'  <w:top w:w="{top}" w:type="dxa"/>\n'
            f'  <w:bottom w:w="{bottom}" w:type="dxa"/>\n'
            f'  <w:left w:w="{left}" w:type="dxa"/>\n'
            f'  <w:right w:w="{right}" w:type="dxa"/>\n'
            f'</w:tcMar>'
        )
        tcPr.append(tcMar)

    def set_cell_shading(cell, color_hex):
        tcPr = cell._tc.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
        tcPr.append(shd)

    def set_table_borders(table, color="000000", sz="4", val="single"):
        tblPr = table._tbl.tblPr
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>\n'
            f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
            f'  <w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
            f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
            f'  <w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
            f'  <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
            f'  <w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
            f'</w:tblBorders>'
        )
        tblPr.append(borders)

    def set_section_double_borders(section):
        sectPr = section._sectPr
        pgBorders = parse_xml(
            f'<w:pgBorders {nsdecls("w")} w:offsetFrom="page">\n'
            f'  <w:top w:val="double" w:sz="12" w:space="24" w:color="002060"/>\n'
            f'  <w:left w:val="double" w:sz="12" w:space="24" w:color="002060"/>\n'
            f'  <w:bottom w:val="double" w:sz="12" w:space="24" w:color="002060"/>\n'
            f'  <w:right w:val="double" w:sz="12" w:space="24" w:color="002060"/>\n'
            f'</w:pgBorders>'
        )
        sectPr.append(pgBorders)

    def add_floating_border_to_section(section, img_path):
        header = section.header
        header.is_linked_to_previous = False
        p_head = header.paragraphs[0]
        p_head.text = ""
        run_head = p_head.add_run()
        run_head.add_picture(img_path, width=Inches(7.85), height=Inches(11.15))

        inline_elems = run_head._r.xpath('.//wp:inline')
        if inline_elems:
            inline = inline_elems[0]
            extent = inline.find(docx.oxml.ns.qn('wp:extent'))
            graphic = inline.find(docx.oxml.ns.qn('a:graphic'))
            cx = extent.get('cx')
            cy = extent.get('cy')

            anchor_xml = f"""
            <wp:anchor {nsdecls('wp')} distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="251658240" behindDoc="1" locked="0" layoutInCell="1" allowOverlap="1">
              <wp:simplePos x="0" y="0"/>
              <wp:positionH relativeFrom="page">
                <wp:align>center</wp:align>
              </wp:positionH>
              <wp:positionV relativeFrom="page">
                <wp:align>center</wp:align>
              </wp:positionV>
              <wp:extent cx="{cx}" cy="{cy}"/>
              <wp:effectExtent l="0" t="0" r="0" b="0"/>
              <wp:wrapNone/>
              <wp:docPr id="100" name="PageBorder"/>
              <wp:cNvGraphicFramePr/>
            </wp:anchor>
            """
            anchor = parse_xml(anchor_xml)
            anchor.append(graphic)
            drawing = inline.getparent()
            drawing.replace(inline, anchor)

    def add_page_number_field(run):
        fldSimple = parse_xml(r'<w:fldSimple %s w:instr="PAGE"/>' % nsdecls('w'))
        run._r.append(fldSimple)

    def set_section_page_numbering(section, fmt="decimal", start=1):
        sectPr = section._sectPr
        pgNumTypes = sectPr.xpath('./w:pgNumType')
        if pgNumTypes:
            pgNumType = pgNumTypes[0]
        else:
            pgNumType = OxmlElement('w:pgNumType')
            sectPr.append(pgNumType)
        if fmt:
            pgNumType.set(qn('w:fmt'), fmt)
        if start is not None:
            pgNumType.set(qn('w:start'), str(start))

    def add_header_footer(section, is_prelim=False):
        section.header.is_linked_to_previous = False
        section.footer.is_linked_to_previous = False

        if is_prelim:
            set_section_page_numbering(section, fmt="lowerRoman", start=1)
            p_head = section.header.paragraphs[0]
            p_head.text = ""
            p_foot = section.footer.paragraphs[0]
            p_foot.text = ""
            p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_foot.paragraph_format.line_spacing = 1.0
            p_foot.paragraph_format.space_after = Pt(0)
            run = p_foot.add_run()
            run.font.name = 'Times New Roman'
            run.font.size = Pt(11)
            add_page_number_field(run)
        else:
            set_section_page_numbering(section, fmt="decimal", start=1)
            # Header
            header = section.header
            p_head = header.paragraphs[0]
            p_head.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p_head.paragraph_format.line_spacing = 1.0
            p_head.paragraph_format.space_after = Pt(4)
            r_head = p_head.add_run("SPELLING CORRECTION TOOL")
            r_head.font.name = 'Times New Roman'
            r_head.font.size = Pt(11.5)

            pPr = p_head._p.get_or_add_pPr()
            pBdr = parse_xml(
                f'<w:pBdr {nsdecls("w")}>\n'
                f'  <w:bottom w:val="single" w:sz="6" w:space="2" w:color="000000"/>\n'
                f'</w:pBdr>'
            )
            pPr.append(pBdr)

            # Footer
            footer = section.footer
            p_foot = footer.paragraphs[0]
            p_foot.text = ""
            p_foot.paragraph_format.line_spacing = 1.0
            p_foot.paragraph_format.space_after = Pt(0)

            pPr_f = p_foot._p.get_or_add_pPr()
            pBdr_f = parse_xml(
                f'<w:pBdr {nsdecls("w")}>\n'
                f'  <w:top w:val="single" w:sz="6" w:space="2" w:color="000000"/>\n'
                f'</w:pBdr>'
            )
            pPr_f.append(pBdr_f)

            f_table = footer.add_table(rows=1, cols=3, width=Inches(6.4))
            f_table.alignment = WD_TABLE_ALIGNMENT.CENTER
            for cell in f_table.rows[0].cells:
                set_cell_margins(cell, top=30, bottom=30, left=0, right=0)
            
            p_left = f_table.rows[0].cells[0].paragraphs[0]
            p_left.alignment = WD_ALIGN_PARAGRAPH.LEFT
            r1 = p_left.add_run("DEPT. OF CSE, MVJCE")
            r1.font.name = 'Times New Roman'
            r1.font.size = Pt(11)

            p_center = f_table.rows[0].cells[1].paragraphs[0]
            p_center.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r2 = p_center.add_run("2026 - 2027")
            r2.font.name = 'Times New Roman'
            r2.font.size = Pt(11)

            p_right = f_table.rows[0].cells[2].paragraphs[0]
            p_right.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            r3 = p_right.add_run()
            r3.font.name = 'Times New Roman'
            r3.font.size = Pt(11)
            add_page_number_field(r3)
            r4 = p_right.add_run(" | P a g e")
            r4.font.name = 'Times New Roman'
            r4.font.size = Pt(11)
            r4.font.color.rgb = COLOR_GRAY

    # ========================================================
    # SECTION 1: COVER PAGE
    # ========================================================
    sec_cover = doc.sections[0]
    sec_cover.page_width = Inches(8.27)
    sec_cover.page_height = Inches(11.69)
    sec_cover.top_margin = Inches(0.5)
    sec_cover.bottom_margin = Inches(0.4)
    sec_cover.left_margin = Inches(0.9)
    sec_cover.right_margin = Inches(0.9)
    sec_cover.header.is_linked_to_previous = False
    sec_cover.footer.is_linked_to_previous = False

    # Add floating ornate decorative border
    if os.path.exists("report_assets/cover_border_transparent.png"):
        add_floating_border_to_section(sec_cover, "report_assets/cover_border_transparent.png")

    # Top MVJ Logo
    p_logo = doc.add_paragraph()
    p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_logo.paragraph_format.space_before = Pt(8)
    p_logo.paragraph_format.space_after = Pt(1)
    if os.path.exists("report_assets/page1_img1_617x345.jpeg"):
        p_logo.add_run().add_picture("report_assets/page1_img1_617x345.jpeg", width=Inches(1.5))

    # Autonomous Info
    p_aff = doc.add_paragraph()
    p_aff.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_aff.paragraph_format.line_spacing = 1.05
    p_aff.paragraph_format.space_after = Pt(8)
    
    r_aff0 = p_aff.add_run("Engineering A Better Tomorrow\n")
    r_aff0.font.name = 'Times New Roman'
    r_aff0.font.size = Pt(8.5)
    r_aff0.font.color.rgb = COLOR_DARK_RED
    r_aff0.font.bold = True

    r_aff1 = p_aff.add_run("An Autonomous Institute\n")
    r_aff1.font.name = 'Times New Roman'
    r_aff1.font.size = Pt(9.5)
    r_aff1.font.color.rgb = COLOR_DARK_RED
    r_aff1.font.bold = True

    r_aff2 = p_aff.add_run(
        "(Affiliated to Visvesvaraya Technological University, Belagavi\n"
        "Approved By AICTE, New Delhi,\n"
        "Recognized by UGC under 2(f) & 12(B)\n"
        "Accredited by NBA and NAAC)"
    )
    r_aff2.font.name = 'Times New Roman'
    r_aff2.font.size = Pt(7.5)
    r_aff2.font.bold = True

    # Title: AN AAT - 2 REPORT ON "SPELLING CORRECTION TOOL"
    p_aat = doc.add_paragraph()
    p_aat.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_aat.paragraph_format.space_before = Pt(2)
    p_aat.paragraph_format.space_after = Pt(2)
    r_aat = p_aat.add_run("AN AAT - 2 REPORT\nON")
    r_aat.font.name = 'Times New Roman'
    r_aat.font.size = Pt(13)
    r_aat.font.bold = True

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(2)
    p_title.paragraph_format.space_after = Pt(6)
    r_title = p_title.add_run("“SPELLING CORRECTION TOOL”")
    r_title.font.name = 'Times New Roman'
    r_title.font.size = Pt(14.5)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_DARK_RED

    # Subtitle
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.line_spacing = 1.05
    p_sub.paragraph_format.space_after = Pt(6)
    r_sub1 = p_sub.add_run("Submitted in partial fulfillment of the requirements for\n")
    r_sub1.font.name = 'Times New Roman'
    r_sub1.font.size = Pt(11)
    r_sub1.font.italic = True
    r_sub2 = p_sub.add_run("Alternative Assessment Tool – II (AAT-2)")
    r_sub2.font.name = 'Times New Roman'
    r_sub2.font.size = Pt(11)
    r_sub2.font.italic = True

    # Submitted by
    p_sby = doc.add_paragraph()
    p_sby.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sby.paragraph_format.space_after = Pt(4)
    r_sby = p_sby.add_run("Submitted by")
    r_sby.font.name = 'Times New Roman'
    r_sby.font.size = Pt(11.5)

    # Student Table
    stud_table = doc.add_table(rows=4, cols=2)
    stud_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(stud_table, color="000000", sz="4", val="single")

    students = [
        ("1MJ23CS036", "CHETHAN KUMAR B S"),
        ("1MJ23CS038", "CHIRANTH L"),
        ("1MJ23CS040", "D MANOHAR"),
        ("1MJ23CS047", "DEERAJ ASHOK SHIRAHATTI")
    ]
    for row_idx, (usn, name) in enumerate(students):
        row = stud_table.rows[row_idx]
        cell_usn = row.cells[0]
        cell_name = row.cells[1]
        cell_usn.width = Inches(1.8)
        cell_name.width = Inches(3.2)
        set_cell_margins(cell_usn, top=30, bottom=30, left=80, right=80)
        set_cell_margins(cell_name, top=30, bottom=30, left=80, right=80)

        p_u = cell_usn.paragraphs[0]
        p_u.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p_u.paragraph_format.line_spacing = 1.0
        p_u.paragraph_format.space_after = Pt(0)
        ru = p_u.add_run(usn)
        ru.font.name = 'Times New Roman'
        ru.font.size = Pt(12)
        ru.font.bold = True

        p_n = cell_name.paragraphs[0]
        p_n.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p_n.paragraph_format.line_spacing = 1.0
        p_n.paragraph_format.space_after = Pt(0)
        rn = p_n.add_run(name)
        rn.font.name = 'Times New Roman'
        rn.font.size = Pt(12)
        rn.font.bold = True

    # Guidance Section
    p_guide = doc.add_paragraph()
    p_guide.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_guide.paragraph_format.space_before = Pt(8)
    p_guide.paragraph_format.line_spacing = 1.05
    p_guide.paragraph_format.space_after = Pt(4)
    
    r_g0 = p_guide.add_run("Under the Guidance of\n")
    r_g0.font.name = 'Times New Roman'
    r_g0.font.size = Pt(11.5)

    r_g1 = p_guide.add_run("Mrs. Sujitha K L\n")
    r_g1.font.name = 'Times New Roman'
    r_g1.font.size = Pt(12.5)
    r_g1.font.bold = True

    r_g2 = p_guide.add_run("Assistant Professor,\nDepartment of Computer Science & Engineering")
    r_g2.font.name = 'Times New Roman'
    r_g2.font.size = Pt(10.5)

    # SECOND MVJ LOGO AND INSTITUTIONAL BLOCK (As in reference PDF Page 1)
    p_logo2 = doc.add_paragraph()
    p_logo2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_logo2.paragraph_format.space_before = Pt(4)
    p_logo2.paragraph_format.space_after = Pt(1)
    if os.path.exists("report_assets/page1_img1_617x345.jpeg"):
        p_logo2.add_run().add_picture("report_assets/page1_img1_617x345.jpeg", width=Inches(1.25))

    p_aff2 = doc.add_paragraph()
    p_aff2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_aff2.paragraph_format.line_spacing = 1.0
    p_aff2.paragraph_format.space_after = Pt(6)
    
    ra2_0 = p_aff2.add_run("Engineering A Better Tomorrow\n")
    ra2_0.font.name = 'Times New Roman'
    ra2_0.font.size = Pt(7.5)
    ra2_0.font.color.rgb = COLOR_DARK_RED
    ra2_0.font.bold = True

    ra2_1 = p_aff2.add_run("An Autonomous Institute\n")
    ra2_1.font.name = 'Times New Roman'
    ra2_1.font.size = Pt(8.5)
    ra2_1.font.color.rgb = COLOR_DARK_RED
    ra2_1.font.bold = True

    ra2_2 = p_aff2.add_run(
        "(Affiliated to Visvesvaraya Technological University, Belagavi,\n"
        "Approved By AICTE, New Delhi,\n"
        "Recognized by UGC under 2(f) & 12(B)\n"
        "Accredited by NBA and NAAC)"
    )
    ra2_2.font.name = 'Times New Roman'
    ra2_2.font.size = Pt(7)
    ra2_2.font.bold = True

    # Bottom Department & College info
    p_dept = doc.add_paragraph()
    p_dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dept.paragraph_format.space_before = Pt(2)
    p_dept.paragraph_format.line_spacing = 1.1
    p_dept.paragraph_format.space_after = Pt(0)

    rd1 = p_dept.add_run("DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING\n")
    rd1.font.name = 'Times New Roman'
    rd1.font.size = Pt(11)
    rd1.font.bold = True

    rd2 = p_dept.add_run("MVJ COLLEGE OF ENGINEERING\n")
    rd2.font.name = 'Times New Roman'
    rd2.font.size = Pt(12)
    rd2.font.bold = True

    rd3 = p_dept.add_run("BANGALORE – 67\nACADEMIC YEAR 2026 – 2027")
    rd3.font.name = 'Times New Roman'
    rd3.font.size = Pt(10.5)
    rd3.font.bold = True

    # ========================================================
    # SECTION 2: CERTIFICATE (Page 2) & DECLARATION (Page 3)
    # ========================================================
    sec_cert = doc.add_section()
    sec_cert.page_width = Inches(8.27)
    sec_cert.page_height = Inches(11.69)
    sec_cert.top_margin = Inches(0.8)
    sec_cert.bottom_margin = Inches(0.8)
    sec_cert.left_margin = Inches(1.1)
    sec_cert.right_margin = Inches(1.0)
    sec_cert.header.is_linked_to_previous = False
    sec_cert.footer.is_linked_to_previous = False
    set_section_double_borders(sec_cert)

    # CERTIFICATE PAGE
    p_c_logo = doc.add_paragraph()
    p_c_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_c_logo.paragraph_format.space_before = Pt(0)
    p_c_logo.paragraph_format.space_after = Pt(2)
    if os.path.exists("report_assets/page2_img0_593x330.jpeg"):
        p_c_logo.add_run().add_picture("report_assets/page2_img0_593x330.jpeg", width=Inches(1.5))

    p_c_head = doc.add_paragraph()
    p_c_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_c_head.paragraph_format.line_spacing = 1.15
    p_c_head.paragraph_format.space_after = Pt(14)

    rc0 = p_c_head.add_run("Engineering A Better Tomorrow\n")
    rc0.font.name = 'Times New Roman'
    rc0.font.size = Pt(8.5)
    rc0.font.color.rgb = COLOR_DARK_RED
    rc0.font.bold = True

    rc01 = p_c_head.add_run("An Autonomous Institute\n")
    rc01.font.name = 'Times New Roman'
    rc01.font.size = Pt(10)
    rc01.font.color.rgb = COLOR_DARK_RED
    rc01.font.bold = True

    rc02 = p_c_head.add_run(
        "(Affiliated to Visvesvaraya Technological University, Belagavi\n"
        "Approved By AICTE, New Delhi,\n"
        "Recognized by UGC under 2(f) & 12(B)\n"
        "Accredited by NBA and NAAC)\n\n"
    )
    rc02.font.name = 'Times New Roman'
    rc02.font.size = Pt(7.5)
    rc02.font.bold = True

    rc1 = p_c_head.add_run("MVJ COLLEGE OF ENGINEERING\n")
    rc1.font.name = 'Times New Roman'
    rc1.font.size = Pt(16)
    rc1.font.bold = True

    rc2 = p_c_head.add_run("Near ITPB, Whitefield, Bangalore – 560067\n")
    rc2.font.name = 'Times New Roman'
    rc2.font.size = Pt(11)
    rc2.font.bold = True

    rc3 = p_c_head.add_run("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING")
    rc3.font.name = 'Times New Roman'
    rc3.font.size = Pt(12.5)
    rc3.font.bold = True

    # CERTIFICATE HEADING
    p_c_title = doc.add_paragraph()
    p_c_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_c_title.paragraph_format.space_before = Pt(8)
    p_c_title.paragraph_format.space_after = Pt(14)
    rc_title = p_c_title.add_run("CERTIFICATE")
    rc_title.font.name = 'Times New Roman'
    rc_title.font.size = Pt(18)
    rc_title.font.bold = True
    rc_title.font.color.rgb = COLOR_DARK_RED

    # Certificate Body
    p_c_body = doc.add_paragraph()
    p_c_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_c_body.paragraph_format.line_spacing = 1.45
    p_c_body.paragraph_format.space_after = Pt(36)

    rcb = p_c_body.add_run(
        "This is to certify that the work entitled “SPELLING CORRECTION TOOL” has been successfully "
        "carried out by the undersigned students, who are bona fide students of MVJ College of Engineering, "
        "Bengaluru, in partial fulfillment of the requirements for Alternative Assessment Tool – II (AAT-2) "
        "during the academic year 2026–2027. The work presented in this report is original and has been "
        "completed under the guidance and supervision of the faculty. All corrections and suggestions "
        "have been duly incorporated, and the report is approved as it satisfies the academic requirements "
        "prescribed for AAT-2."
    )
    rcb.font.name = 'Times New Roman'
    rcb.font.size = Pt(12)

    # Signatures Table
    sig_table = doc.add_table(rows=1, cols=2)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sig_table.rows[0].cells[0].width = Inches(3.0)
    sig_table.rows[0].cells[1].width = Inches(3.0)

    p_sig_l = sig_table.rows[0].cells[0].paragraphs[0]
    p_sig_l.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_sig_l.paragraph_format.line_spacing = 1.15
    r_sl = p_sig_l.add_run(
        "Signature of Guide\n\n\n"
        "Mrs. Sujitha K L\n"
        "Assistant Professor\n"
        "Department of CSE"
    )
    r_sl.font.name = 'Times New Roman'
    r_sl.font.size = Pt(11.5)
    r_sl.font.bold = True

    p_sig_r = sig_table.rows[0].cells[1].paragraphs[0]
    p_sig_r.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_sig_r.paragraph_format.line_spacing = 1.15
    r_sr = p_sig_r.add_run(
        "Signature of HOD\n\n\n"
        "Dr. Maruth Pandi J\n"
        "Professor & Head\n"
        "Department of CSE"
    )
    r_sr.font.name = 'Times New Roman'
    r_sr.font.size = Pt(11.5)
    r_sr.font.bold = True

    # Page Break for DECLARATION
    doc.add_page_break()

    # DECLARATION PAGE
    p_d_logo = doc.add_paragraph()
    p_d_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_d_logo.paragraph_format.space_before = Pt(0)
    p_d_logo.paragraph_format.space_after = Pt(2)
    if os.path.exists("report_assets/page2_img0_593x330.jpeg"):
        p_d_logo.add_run().add_picture("report_assets/page2_img0_593x330.jpeg", width=Inches(1.5))

    p_d_head = doc.add_paragraph()
    p_d_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_d_head.paragraph_format.line_spacing = 1.15
    p_d_head.paragraph_format.space_after = Pt(14)

    rdh0 = p_d_head.add_run("Engineering A Better Tomorrow\n")
    rdh0.font.name = 'Times New Roman'
    rdh0.font.size = Pt(8.5)
    rdh0.font.color.rgb = COLOR_DARK_RED
    rdh0.font.bold = True

    rdh01 = p_d_head.add_run("An Autonomous Institute\n")
    rdh01.font.name = 'Times New Roman'
    rdh01.font.size = Pt(10)
    rdh01.font.color.rgb = COLOR_DARK_RED
    rdh01.font.bold = True

    rdh02 = p_d_head.add_run(
        "(Affiliated to Visvesvaraya Technological University, Belagavi\n"
        "Approved By AICTE, New Delhi,\n"
        "Recognized by UGC under 2(f) & 12(B)\n"
        "Accredited by NBA and NAAC)\n\n"
    )
    rdh02.font.name = 'Times New Roman'
    rdh02.font.size = Pt(7.5)
    rdh02.font.bold = True

    rdh1 = p_d_head.add_run("MVJ COLLEGE OF ENGINEERING\n")
    rdh1.font.name = 'Times New Roman'
    rdh1.font.size = Pt(16)
    rdh1.font.bold = True

    rdh2 = p_d_head.add_run("Near ITPB, Whitefield, Bangalore – 560067\n")
    rdh2.font.name = 'Times New Roman'
    rdh2.font.size = Pt(11)
    rdh2.font.bold = True

    rdh3 = p_d_head.add_run("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING")
    rdh3.font.name = 'Times New Roman'
    rdh3.font.size = Pt(12.5)
    rdh3.font.bold = True

    # DECLARATION HEADING
    p_d_title = doc.add_paragraph()
    p_d_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_d_title.paragraph_format.space_before = Pt(8)
    p_d_title.paragraph_format.space_after = Pt(14)
    rd_title = p_d_title.add_run("DECLARATION")
    rd_title.font.name = 'Times New Roman'
    rd_title.font.size = Pt(18)
    rd_title.font.bold = True
    rd_title.font.color.rgb = COLOR_DARK_RED

    p_d_body = doc.add_paragraph()
    p_d_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_d_body.paragraph_format.line_spacing = 1.45
    p_d_body.paragraph_format.space_after = Pt(10)
    rdb1 = p_d_body.add_run(
        "We, the students of Sixth Semester B.E., Department of Computer Science and Engineering, "
        "MVJ College of Engineering, Bengaluru, hereby declare that the work entitled “SPELLING CORRECTION TOOL” "
        "has been carried out by us as part of Alternative Assessment Tool – II (AAT-2) during the academic "
        "year 2026–2027. We affirm that this work is original and has not been submitted, either in part or in "
        "full, for the award of any degree or diploma in any university or institution."
    )
    rdb1.font.name = 'Times New Roman'
    rdb1.font.size = Pt(12)

    p_d_body2 = doc.add_paragraph()
    p_d_body2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_d_body2.paragraph_format.line_spacing = 1.45
    p_d_body2.paragraph_format.space_after = Pt(16)
    rdb2 = p_d_body2.add_run(
        "We further state that any intellectual property rights arising out of this work shall remain the "
        "property of MVJ College of Engineering, Bengaluru, and we shall be duly acknowledged as contributors."
    )
    rdb2.font.name = 'Times New Roman'
    rdb2.font.size = Pt(12)

    # Students Signature Table
    d_sig_table = doc.add_table(rows=4, cols=3)
    d_sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    d_sig_table.rows[0].cells[0].width = Inches(1.8)
    d_sig_table.rows[0].cells[1].width = Inches(2.8)
    d_sig_table.rows[0].cells[2].width = Inches(1.8)

    for r_i, (u, n) in enumerate(students):
        row = d_sig_table.rows[r_i]
        c0, c1, c2 = row.cells[0], row.cells[1], row.cells[2]
        set_cell_margins(c0, top=45, bottom=45, left=30, right=30)
        set_cell_margins(c1, top=45, bottom=45, left=30, right=30)
        set_cell_margins(c2, top=45, bottom=45, left=30, right=30)

        p0 = c0.paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r = p0.add_run(u)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(11)
        r.font.bold = True

        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r = p1.add_run(n)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(11)
        r.font.bold = True

        p2 = c2.paragraphs[0]
        p2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r = p2.add_run("___________________")
        r.font.name = 'Times New Roman'
        r.font.size = Pt(11)

    p_pd = doc.add_paragraph()
    p_pd.paragraph_format.space_before = Pt(16)
    p_pd.paragraph_format.line_spacing = 1.2
    r_pd = p_pd.add_run("Place: BANGALORE\nDate:")
    r_pd.font.name = 'Times New Roman'
    r_pd.font.size = Pt(11.5)
    r_pd.font.bold = True

    # ========================================================
    # SECTION 3: PRELIMINARY PAGES (Acknowledgement, Abstract, Contribution, TOC, List of Figures)
    # ========================================================
    sec_prelim = doc.add_section()
    sec_prelim.page_width = Inches(8.27)
    sec_prelim.page_height = Inches(11.69)
    sec_prelim.top_margin = Inches(1.0)
    sec_prelim.bottom_margin = Inches(1.0)
    sec_prelim.left_margin = Inches(1.2)
    sec_prelim.right_margin = Inches(1.0)
    add_header_footer(sec_prelim, is_prelim=True)

    # 1. ACKNOWLEDGEMENT (Page i)
    p_ack_t = doc.add_paragraph()
    p_ack_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ack_t.paragraph_format.space_before = Pt(8)
    p_ack_t.paragraph_format.space_after = Pt(16)
    r = p_ack_t.add_run("ACKNOWLEDGEMENT")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(18)
    r.font.bold = True

    p_ack_body = doc.add_paragraph()
    p_ack_body.paragraph_format.line_spacing = 1.4
    p_ack_body.paragraph_format.space_after = Pt(8)
    p_ack_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_ack_body.add_run(
        "The successful completion of this work would not have been possible without the guidance, "
        "support, and encouragement of several individuals, to whom we express our sincere gratitude.\n\n"
        "We are deeply grateful to Dr. Ajayan K R, Principal, MVJ College of Engineering, Bengaluru, "
        "for providing us with the necessary academic facilities, computational infrastructure, and a "
        "supportive environment to carry out this project work.\n\n"
        "We extend our sincere thanks to Dr. Salim A, Dean, School of Computer Science & Engineering, and "
        "Dr. Kumar R, Controller of Examinations, for their continuous encouragement, academic guidance, "
        "and administrative support throughout the course of this work.\n\n"
        "We express our heartfelt gratitude to Dr. Maruth Pandi J, Head of the Department, Department of Computer "
        "Science and Engineering, for his constructive recommendations, continuous encouragement, and valuable "
        "departmental support.\n\n"
        "We sincerely thank our guide, Mrs. Sujitha K L, Assistant Professor, Department of Computer Science "
        "and Engineering, for her invaluable guidance, patient supervision, technical insights, and constant "
        "support throughout every phase of the project.\n\n"
        "We also extend our appreciation to all the faculty members of the Department of Computer Science "
        "and Engineering for their cooperation and support.\n\n"
        "Finally, we would like to thank our family members and friends for their encouragement, understanding, "
        "and moral support, which played a significant role in the successful completion of this work."
    )

    doc.add_page_break()

    # 2. ABSTRACT (Page ii)
    p_abs_t = doc.add_paragraph()
    p_abs_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_abs_t.paragraph_format.space_before = Pt(8)
    p_abs_t.paragraph_format.space_after = Pt(16)
    r = p_abs_t.add_run("ABSTRACT")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(18)
    r.font.bold = True

    p_abs_body = doc.add_paragraph()
    p_abs_body.paragraph_format.line_spacing = 1.45
    p_abs_body.paragraph_format.space_after = Pt(8)
    p_abs_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_abs_body.add_run(
        "In today’s digital era, textual information serves as the primary conduit for human-computer interaction, "
        "communication, search retrieval, and automated document analysis. However, typographical errors, cognitive "
        "slips, and phonetic confusions frequently corrupt digital text, severely impeding downstream natural language "
        "processing (NLP) tasks such as machine translation, sentiment analysis, and search query parsing. This work presents "
        "the design and architectural implementation of an intelligent Spelling Correction Tool named “SpellSense”, developed "
        "as an Alternative Assessment Tool – II (AAT-2) project under the subject Natural Language Processing.\n\n"
        "The system incorporates two established and complementary NLP spelling correction algorithms: TextBlob (utilizing "
        "Peter Norvig’s probabilistic model and unigram frequency distributions) and SymSpell (leveraging Wolf Garbe’s "
        "Symmetric Delete algorithm for ultra-fast lookup via pre-indexed deletion variations). The application is engineered "
        "using Python FastAPI as the high-performance asynchronous REST backend, coupled with an interactive, responsive React 19 "
        "single-page web interface. The core engine tokenizes input text, identifies non-word orthographic anomalies against "
        "pre-compiled English lexicons, generates candidate variations within bounded Damerau-Levenshtein edit distances, "
        "and executes an intelligent consensus recommendation mechanism.\n\n"
        "Furthermore, the application features side-by-side comparative execution, real-time wall-clock latency measurement "
        "without simulated accuracy claims, and an educational four-stage decision inspector detailing SymSpell’s heuristic "
        "ranking. The resulting system demonstrates the practical synergy of statistical language modeling, algorithmic "
        "optimization, and modern web interfaces, delivering an accurate, stable, and educational spelling correction solution "
        "suitable for academic demonstrations, assistive writing, and real-world NLP workflows."
    )

    doc.add_page_break()

    # 3. CONTRIBUTION OF TEAM MEMBERS (Page iii - FITS ON ONE PAGE!)
    p_ctm_t = doc.add_paragraph()
    p_ctm_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ctm_t.paragraph_format.space_before = Pt(8)
    p_ctm_t.paragraph_format.space_after = Pt(14)
    r = p_ctm_t.add_run("CONTRIBUTION OF TEAM MEMBERS")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(18)
    r.font.bold = True

    ctm_table = doc.add_table(rows=5, cols=5)
    ctm_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(ctm_table, color="000000", sz="4", val="single")

    ctm_headers = ["Sl.\nNo", "Name", "USN", "Contribution", "Marks /\n%"]
    col_widths = [Inches(0.45), Inches(1.50), Inches(1.15), Inches(2.90), Inches(0.60)]

    # Header Row
    for col_idx, text in enumerate(ctm_headers):
        cell = ctm_table.rows[0].cells[col_idx]
        cell.width = col_widths[col_idx]
        set_cell_margins(cell, top=50, bottom=50, left=40, right=40)
        set_cell_shading(cell, "F2F2F2")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.0
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10.5)
        r.font.bold = True

    # Exact 4 members, balanced 25% each, clean natural wrapping
    contributions_data = [
        ("1", "Chethan Kumar B S", "1MJ23CS036",
         "Actively contributed to project planning, frontend architecture design, layout structuring, and interactive workspace integration with REST services. Participated in end-to-end debugging, UI state-machine stabilization, testing, documentation, and result analysis.",
         "25%"),
        ("2", "Chiranth L", "1MJ23CS038",
         "Contributed to NLP module research, TextBlob probabilistic spelling model implementation, backend REST API endpoint development, request validation schemas, system unit testing, technical documentation, and comparative result analysis.",
         "25%"),
        ("3", "D Manohar", "1MJ23CS040",
         "Involved in SymSpell algorithm implementation, Symmetric Delete candidate generation logic, vocabulary frequency index caching, single-word decision inspector development, system testing, documentation, and performance benchmarking.",
         "25%"),
        ("4", "Deeraj Ashok Shirahatti", "1MJ23CS047",
         "Contributed to the multi-criteria consensus comparison engine, recommendation scoring logic, responsive mobile interface validation, edge-case testing, error handling routines, technical documentation, and final report compilation.",
         "25%")
    ]

    for row_idx, (sl, name, usn, contrib, marks) in enumerate(contributions_data, start=1):
        row = ctm_table.rows[row_idx]
        for c_i, w in enumerate(col_widths):
            row.cells[c_i].width = w
            set_cell_margins(row.cells[c_i], top=40, bottom=40, left=40, right=40)

        p0 = row.cells[0].paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p0.paragraph_format.line_spacing = 1.05
        p0.paragraph_format.space_after = Pt(0)
        r = p0.add_run(sl)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10)

        p1 = row.cells[1].paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p1.paragraph_format.line_spacing = 1.05
        p1.paragraph_format.space_after = Pt(0)
        r = p1.add_run(name)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10)
        r.font.bold = True

        p2 = row.cells[2].paragraphs[0]
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p2.paragraph_format.line_spacing = 1.05
        p2.paragraph_format.space_after = Pt(0)
        r = p2.add_run(usn)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10)
        r.font.bold = True

        p3 = row.cells[3].paragraphs[0]
        p3.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p3.paragraph_format.line_spacing = 1.05
        p3.paragraph_format.space_after = Pt(0)
        r = p3.add_run(contrib)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9.5)

        p4 = row.cells[4].paragraphs[0]
        p4.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p4.paragraph_format.line_spacing = 1.05
        p4.paragraph_format.space_after = Pt(0)
        r = p4.add_run(marks)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10)
        r.font.bold = True

    doc.add_page_break()

    # 4. TABLE OF CONTENT (Page iv)
    p_toc_t = doc.add_paragraph()
    p_toc_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_toc_t.paragraph_format.space_before = Pt(8)
    p_toc_t.paragraph_format.space_after = Pt(16)
    r = p_toc_t.add_run("TABLE OF CONTENT")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(18)
    r.font.bold = True

    toc_table = doc.add_table(rows=14, cols=3)
    toc_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(toc_table, color="000000", sz="4", val="single")

    toc_widths = [Inches(1.5), Inches(3.9), Inches(1.1)]
    toc_headers = ["SL No", "TITLE", "PAGE NO."]

    for c_i, h_text in enumerate(toc_headers):
        cell = toc_table.rows[0].cells[c_i]
        cell.width = toc_widths[c_i]
        set_cell_margins(cell, top=50, bottom=50, left=50, right=50)
        set_cell_shading(cell, "F2F2F2")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.0
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10.5)
        r.font.bold = True

    # Use dynamic toc_map if provided
    tm = toc_map or {
        "ACK": "i", "ABS": "ii", "CTM": "iii", "TOC": "iv", "LOF": "v",
        "CH1": "1", "CH2": "4", "CH3": "7", "CH4": "9", "CH5": "11",
        "CH6": "16", "CH7": "24", "REF": "26"
    }

    toc_items = [
        ("I", "ACKNOWLEDGEMENT", tm["ACK"]),
        ("II", "ABSTRACT", tm["ABS"]),
        ("III", "CONTRIBUTION OF TEAM MEMBERS", tm["CTM"]),
        ("IV", "TABLE OF CONTENT", tm["TOC"]),
        ("V", "LIST OF FIGURES", tm["LOF"]),
        ("CHAPTER - 1", "INTRODUCTION", tm["CH1"]),
        ("CHAPTER - 2", "PROBLEM ANALYSIS", tm["CH2"]),
        ("CHAPTER - 3", "SOFTWARE AND HARDWARE REQUIREMENTS", tm["CH3"]),
        ("CHAPTER - 4", "DOMAIN MODEL", tm["CH4"]),
        ("CHAPTER - 5", "IMPLEMENTATION", tm["CH5"]),
        ("CHAPTER - 6", "RESULTS", tm["CH6"]),
        ("CHAPTER - 7", "CONCLUSION", tm["CH7"]),
        ("", "REFERENCES", tm["REF"]),
    ]

    for r_i, (sl, tit, pg) in enumerate(toc_items, start=1):
        row = toc_table.rows[r_i]
        for c_i, w in enumerate(toc_widths):
            row.cells[c_i].width = w
            set_cell_margins(row.cells[c_i], top=40, bottom=40, left=50, right=50)

        p0 = row.cells[0].paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p0.paragraph_format.line_spacing = 1.0
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(sl)
        r0.font.name = 'Times New Roman'
        r0.font.size = Pt(10)
        if "CHAPTER" in sl or tit in ["REFERENCES"]:
            r0.font.bold = True

        p1 = row.cells[1].paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p1.paragraph_format.line_spacing = 1.0
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(tit)
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(10)
        if "CHAPTER" in sl or tit in ["REFERENCES"]:
            r1.font.bold = True

        p2 = row.cells[2].paragraphs[0]
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p2.paragraph_format.line_spacing = 1.0
        p2.paragraph_format.space_after = Pt(0)
        r2 = p2.add_run(pg)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(10)
        if "CHAPTER" in sl or tit in ["REFERENCES"]:
            r2.font.bold = True

    doc.add_page_break()

    # 5. LIST OF FIGURES (Page v)
    p_lof_t = doc.add_paragraph()
    p_lof_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_lof_t.paragraph_format.space_before = Pt(8)
    p_lof_t.paragraph_format.space_after = Pt(16)
    r = p_lof_t.add_run("LIST OF FIGURES")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(18)
    r.font.bold = True

    lof_table = doc.add_table(rows=20, cols=3)
    lof_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(lof_table, color="000000", sz="4", val="single")

    lof_widths = [Inches(1.4), Inches(4.0), Inches(1.1)]
    lof_headers = ["FIGURE NO.", "FIGURE NAME", "PAGE NO."]

    for c_i, h_text in enumerate(lof_headers):
        cell = lof_table.rows[0].cells[c_i]
        cell.width = lof_widths[c_i]
        set_cell_margins(cell, top=50, bottom=50, left=50, right=50)
        set_cell_shading(cell, "F2F2F2")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.0
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10.5)
        r.font.bold = True

    lm = lof_map or {
        "3.1": "7", "3.2": "8", "4.1": "9",
        "5.1": "11", "5.2": "12", "5.3": "12", "5.4": "13",
        "5.5": "13", "5.6": "14", "5.7": "15", "5.8": "15",
        "6.1": "16", "6.2": "17", "6.3": "18", "6.4": "19",
        "6.5": "20", "6.6": "21", "6.7": "22", "6.8": "23"
    }

    lof_items = [
        ("3.1", "SOFTWARE REQUIREMENTS", lm["3.1"]),
        ("3.2", "HARDWARE REQUIREMENTS", lm["3.2"]),
        ("4.1", "DOMAIN MODEL", lm["4.1"]),
        ("5.1", "PROJECT DIRECTORY STRUCTURE", lm["5.1"]),
        ("5.2", "FASTAPI APPLICATION & CORS LIFESPAN", lm["5.2"]),
        ("5.3", "SPELLING CORRECTION SERVICE PIPELINE", lm["5.3"]),
        ("5.4", "TEXTBLOB SPELLING CORRECTION IMPLEMENTATION", lm["5.4"]),
        ("5.5", "SYMSPELL SINGLETON & DICTIONARY INDEXING", lm["5.5"]),
        ("5.6", "CONSENSUS DECISION & RECOMMENDATION LOGIC", lm["5.6"]),
        ("5.7", "FRONTEND INTERACTIVE WORKSPACE COMPONENT", lm["5.7"]),
        ("5.8", "SINGLE WORD DEEP ANALYSIS REST ENDPOINT", lm["5.8"]),
        ("6.1", "MAIN SPELLING CORRECTION INTERFACE", lm["6.1"]),
        ("6.2", "TEXTBLOB CORRECTION RESULT", lm["6.2"]),
        ("6.3", "SYMSPELL CORRECTION RESULT", lm["6.3"]),
        ("6.4", "COMPARE BOTH RESULT VIEW", lm["6.4"]),
        ("6.5", "DETECTED CORRECTIONS BREAKDOWN TABLE", lm["6.5"]),
        ("6.6", "STATISTICS AND PROCESSING LATENCY", lm["6.6"]),
        ("6.7", "HOW SYMSPELL DECIDED (DECISION INSPECTOR)", lm["6.7"]),
        ("6.8", "MOBILE RESPONSIVE LAYOUT VIEW", lm["6.8"]),
    ]

    for r_i, (fnum, fname, fpg) in enumerate(lof_items, start=1):
        row = lof_table.rows[r_i]
        for c_i, w in enumerate(lof_widths):
            row.cells[c_i].width = w
            set_cell_margins(row.cells[c_i], top=35, bottom=35, left=50, right=50)

        p0 = row.cells[0].paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p0.paragraph_format.line_spacing = 1.0
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(fnum)
        r0.font.name = 'Times New Roman'
        r0.font.size = Pt(9.5)

        p1 = row.cells[1].paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p1.paragraph_format.line_spacing = 1.0
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(fname)
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(9.5)

        p2 = row.cells[2].paragraphs[0]
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p2.paragraph_format.line_spacing = 1.0
        p2.paragraph_format.space_after = Pt(0)
        r2 = p2.add_run(fpg)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(9.5)

    # ========================================================
    # SECTION 4: MAIN REPORT CHAPTERS (Arabic Page 1 onwards)
    # ========================================================
    sec_main = doc.add_section()
    sec_main.page_width = Inches(8.27)
    sec_main.page_height = Inches(11.69)
    sec_main.top_margin = Inches(1.0)
    sec_main.bottom_margin = Inches(1.0)
    sec_main.left_margin = Inches(1.2)
    sec_main.right_margin = Inches(1.0)
    add_header_footer(sec_main, is_prelim=False)

    # Helper functions for chapters
    def add_chapter_heading(ch_num, ch_title):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(f"CHAPTER {ch_num}")
        r.font.name = 'Times New Roman'
        r.font.size = Pt(16)
        r.font.bold = True

        p2 = doc.add_paragraph()
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p2.paragraph_format.space_before = Pt(2)
        p2.paragraph_format.space_after = Pt(16)
        p2.paragraph_format.keep_with_next = True
        r2 = p2.add_run(ch_title)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(18)
        r2.font.bold = True

    def add_section_heading(sec_title):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(sec_title)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(13)
        r.font.bold = True

    def add_figure_image(img_path, caption_text, width=Inches(4.8)):
        if os.path.exists(img_path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(6)
            p_img.paragraph_format.space_after = Pt(2)
            p_img.paragraph_format.keep_with_next = True
            p_img.add_run().add_picture(img_path, width=width)

            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_before = Pt(1)
            p_cap.paragraph_format.space_after = Pt(10)
            r_cap = p_cap.add_run(caption_text)
            r_cap.font.name = 'Times New Roman'
            r_cap.font.size = Pt(10.5)
            r_cap.font.bold = True

    # ----------------------------------------------------
    # CHAPTER 1: INTRODUCTION
    # ----------------------------------------------------
    add_chapter_heading("1", "INTRODUCTION")

    add_section_heading("1.1 Background")
    p = doc.add_paragraph()
    p.add_run(
        "In the contemporary information era, natural language text constitutes the foundation for communication, "
        "knowledge preservation, digital transactions, and computational intelligence. With the explosive expansion "
        "of web applications, online collaboration platforms, educational portals, search engines, and social media, "
        "billions of textual messages, essays, queries, and reports are generated every second. However, human text input "
        "is inherently susceptible to orthographic anomalies, typographical slips, phonetic confusions, and cognitive "
        "inaccuracies. Such errors not only impair human readability and comprehension but also degrade the accuracy "
        "of automated computational linguistics systems, including search query parsers, sentiment classifiers, "
        "information retrieval engines, and machine translation pipelines."
    )

    add_section_heading("1.2 Natural Language Processing")
    p = doc.add_paragraph()
    p.add_run(
        "Natural Language Processing (NLP) is a pivotal subfield of Artificial Intelligence and Computational "
        "Linguistics that bridges human natural language communication with computational interpretation. NLP encompasses "
        "tokenization, morphological analysis, syntactic parsing, semantic reasoning, and pragmatic discourse interpretation. "
        "Within NLP workflows, preprocessing constitutes an essential foundational phase. Automated spelling correction "
        "serves as a primary quality assurance filter, normalizing noisy, unstructured input text into canonical grammatical "
        "tokens before deeper syntactic and semantic evaluation."
    )

    add_section_heading("1.3 Spelling Correction in NLP")
    p = doc.add_paragraph()
    p.add_run(
        "Spelling errors are traditionally categorized into two principal domains: non-word errors and real-word errors. "
        "Non-word errors occur when an input character sequence does not match any valid entry in the lexicon of the language "
        "(e.g., entering “hav” instead of “have”, or “markat” instead of “market”). Real-word errors (cognitive errors) "
        "occur when a valid lexicon entry is erroneously substituted in an incorrect semantic context (e.g., using “there” "
        "instead of “their”). The spelling correction task involves three sequential operations: error detection, "
        "candidate generation via string mutation or deletion, and candidate ranking based on lexical frequency and minimum "
        "edit distance heuristics."
    )

    add_section_heading("1.4 Need for Automated Spelling Correction")
    p = doc.add_paragraph()
    p.add_run(
        "Manual proofreading is labor-intensive, error-prone, and unscalable in high-throughput digital environments. "
        "In interactive web environments, e-learning assessment tools, conversational interfaces, and customer support "
        "desks, automated, real-time spelling correction is imperative. A robust spelling correction system must satisfy "
        "three critical criteria: high orthographic correction accuracy, minimal computational latency to support interactive "
        "typing, and transparent candidate ranking that enables users to understand why an algorithmic decision was reached."
    )

    add_section_heading("1.5 TextBlob Spelling Correction Engine")
    p = doc.add_paragraph()
    p.add_run(
        "TextBlob is an established Python library for processing textual data, providing a high-level API for common "
        "NLP tasks including part-of-speech tagging, noun phrase extraction, sentiment analysis, and spelling correction. "
        "TextBlob’s spelling correction model is grounded in Peter Norvig’s classical probabilistic spell-checker. For any "
        "misspelled token w, the model searches for the candidate correction c that maximizes the posterior probability "
        "P(c|w) = P(w|c) * P(c) / P(w). By evaluating unigram frequencies from a large text corpus and generating variations "
        "within Damerau-Levenshtein edit distances of 1 and 2, TextBlob offers linguistically sound, statistically grounded corrections."
    )

    add_section_heading("1.6 SymSpell Algorithm")
    p = doc.add_paragraph()
    p.add_run(
        "SymSpell, introduced by Wolf Garbe, is an ultra-fast spelling correction algorithm based on the Symmetric Delete "
        "spelling correction approach. Unlike traditional spelling correction algorithms that generate deletion, insertion, "
        "transposition, and substitution candidates at query time (resulting in O(k^n) complexity where k is alphabet size "
        "and n is word length), SymSpell shifts computation to pre-indexing. It generates only deletion variations for both "
        "dictionary words during indexing and misspelled input queries at runtime. Because deletion operations are symmetric, "
        "intersections between query deletion sets and indexed dictionary deletion sets cover all edit operations in constant "
        "O(1) dictionary lookup time, achieving speedups of several orders of magnitude over Norvig’s algorithm."
    )

    add_section_heading("1.7 Motivation")
    p = doc.add_paragraph()
    p.add_run(
        "While individual implementations of TextBlob and SymSpell exist in isolated scripts, modern educational and "
        "engineering workflows lack a unified, transparent platform where students, developers, and educators can enter text, "
        "observe side-by-side behavioral differences, evaluate real execution latency, and inspect step-by-step decision metrics. "
        "This project was motivated by the desire to build a complete, production-grade Natural Language Processing web application "
        "that demonstrates the comparative strengths, algorithmic mechanisms, and trade-offs of both paradigms."
    )

    add_section_heading("1.8 Objectives")
    p = doc.add_paragraph()
    p.add_run(
        "The primary objectives of this AAT-2 project are:\n"
        "1. To design and implement a modular NLP spelling correction architecture supporting dual algorithm execution.\n"
        "2. To implement Peter Norvig’s probabilistic model using TextBlob for unigram-weighted correction.\n"
        "3. To implement Wolf Garbe’s Symmetric Delete algorithm using SymSpell with an 82,000+ word unigram and bigram vocabulary.\n"
        "4. To design an intelligent consensus arbitrator that combines edit distance and lexical confidence to recommend optimal corrections.\n"
        "5. To measure and display genuine wall-clock processing latency without simulated accuracy metrics.\n"
        "6. To construct an intuitive educational decision inspector (“How SymSpell Decided”) breaking down candidate generation, edit distance, and selection in a 4-stage visual diagram.\n"
        "7. To develop a responsive, production-quality React web application with zero UI flicker and instant feedback."
    )

    add_section_heading("1.9 Scope of the Project")
    p = doc.add_paragraph()
    p.add_run(
        "The scope of this project encompasses English non-word spelling mistake detection and correction for texts up to "
        "5,000 characters. It evaluates edit distances up to 2, supporting single and double-character insertions, deletions, "
        "substitutions, and transpositions. The system exposes a RESTful API backend and a responsive single-page web interface "
        "tested across desktop and mobile form factors."
    )

    doc.add_page_break()

    # ----------------------------------------------------
    # CHAPTER 2: PROBLEM ANALYSIS
    # ----------------------------------------------------
    add_chapter_heading("2", "PROBLEM ANALYSIS")

    add_section_heading("2.1 Existing System")
    p = doc.add_paragraph()
    p.add_run(
        "Traditional spelling correction tools in legacy word processors or basic applications rely primarily on brute-force "
        "lexicon lookups and full dynamic programming matrix calculations (such as the Wagner-Fischer algorithm for Levenshtein "
        "distance). When an error is encountered, these systems compute edit distance against every entry in the dictionary, "
        "leading to significant computational overhead O(N * |w1| * |w2|) where N is dictionary size. Furthermore, existing "
        "educational demonstrations often operate as command-line scripts or black-box web interfaces that output a single "
        "corrected string without explaining candidate ranking, edit operations, confidence levels, or algorithmic trade-offs."
    )

    add_section_heading("2.2 Limitations of Existing System")
    p = doc.add_paragraph()
    p.add_run(
        "1. High Latency: Brute-force edit distance matrix computations against large lexicons introduce perceptible delays.\n"
        "2. Monolithic Engine: Most platforms lock users into a single correction model, preventing comparative evaluation.\n"
        "3. Lack of Transparency: Traditional tools do not disclose the candidate pool, edit distances, or ranking criteria.\n"
        "4. Inflexible UI Transitions: Basic student implementations often suffer from layout shifts, flickering, and component remounting.\n"
        "5. Absence of Multi-Criteria Arbitration: Systems rarely combine edit distance minimization with language model probability."
    )

    add_section_heading("2.3 Problem Statement")
    p = doc.add_paragraph()
    p.add_run(
        "To develop an intelligent, interactive, and transparent NLP Spelling Correction Tool that integrates TextBlob’s "
        "probabilistic unigram model and SymSpell’s Symmetric Delete algorithm into a unified REST-based architecture, "
        "providing side-by-side comparative correction, consensus arbitration, sub-millisecond latency tracking, and a "
        "clear pedagogical breakdown of algorithmic decisions without layout instability or interface lag."
    )

    add_section_heading("2.4 Proposed System")
    p = doc.add_paragraph()
    p.add_run(
        "The proposed SpellSense system addresses existing limitations through a decoupled client-server architecture. "
        "The backend utilizes Python FastAPI, leveraging persistent singleton memory management to hold pre-indexed frequency "
        "lexicons. Input text is tokenized with span tracking, allowing individual tokens to be analyzed concurrently. "
        "The backend supports three distinct execution modes: 'compare' (running both engines and executing consensus arbitration), "
        "'symspell' (dedicated Symmetric Delete execution), and 'textblob' (dedicated probabilistic execution). The frontend is "
        "implemented in React 19 and TypeScript, featuring a deterministic request state machine that guarantees zero layout "
        "jumping and stable component identity."
    )

    add_section_heading("2.5 Functional Requirements")
    p = doc.add_paragraph()
    p.add_run(
        "1. Text Ingestion: The system shall accept arbitrary English text input up to 5,000 characters.\n"
        "2. Tokenization & Detection: The system shall segment input text into word tokens while preserving whitespace and punctuation offsets, classifying tokens as valid dictionary words or spelling anomalies.\n"
        "3. Dual Engine Execution: The system shall execute TextBlob and SymSpell correction algorithms independently or concurrently.\n"
        "4. Candidate Generation: For each misspelled token, the system shall retrieve candidate terms, confidence scores, and edit distances.\n"
        "5. Consensus Recommendation: The system shall apply heuristic arbitration to select the optimal recommendation.\n"
        "6. Performance Telemetry: The system shall record and report wall-clock execution time in milliseconds.\n"
        "7. Decision Inspection: The system shall expose a dedicated endpoint to generate four-stage visual breakdowns of SymSpell candidate decisions."
    )

    add_section_heading("2.6 Non-Functional Requirements")
    p = doc.add_paragraph()
    p.add_run(
        "1. Performance: SymSpell lookups shall execute in under 1 millisecond per word on standard hardware.\n"
        "2. Stability & Responsiveness: The UI shall prevent layout shifts, re-render cascades, and duplicate API requests.\n"
        "3. Usability: The interface shall provide intuitive navigation across tabs, clipboard copy utilities, and color-coded error highlights.\n"
        "4. Scalability: The stateless REST API architecture shall support concurrent client connections.\n"
        "5. Portability: The system shall run across Windows, macOS, and Linux operating systems."
    )

    add_section_heading("2.7 Advantages of Proposed System")
    p = doc.add_paragraph()
    p.add_run(
        "• Dual NLP Perspective: Demonstrates both statistical frequency modeling and combinatorial deletion indexing.\n"
        "• High Accuracy via Consensus: When both models agree, confidence reaches over 90%.\n"
        "• Sub-Millisecond Speed: Pre-indexed hash tables ensure lightning-fast processing.\n"
        "• Educational Value: The 4-stage decision breakdown is ideal for viva presentations and classroom demonstrations.\n"
        "• Production-Quality UI: Built with responsive design, glassmorphism aesthetics, and zero layout shift."
    )

    doc.add_page_break()

    # ----------------------------------------------------
    # CHAPTER 3: SOFTWARE AND HARDWARE REQUIREMENTS
    # ----------------------------------------------------
    add_chapter_heading("3", "SOFTWARE AND HARDWARE REQUIREMENTS")

    add_section_heading("SOFTWARE REQUIREMENTS:")
    p = doc.add_paragraph()
    p.add_run("The following table outlines the actual software tools, libraries, and frameworks utilized in the development and execution of the Spelling Correction Tool:")

    soft_table = doc.add_table(rows=11, cols=3)
    soft_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(soft_table, color="000000", sz="4", val="single")

    soft_widths = [Inches(0.6), Inches(2.2), Inches(3.6)]
    soft_headers = ["Sl.\nNo", "Software / Tool", "Description / Specification"]

    for c_i, h_text in enumerate(soft_headers):
        cell = soft_table.rows[0].cells[c_i]
        cell.width = soft_widths[c_i]
        set_cell_margins(cell, top=45, bottom=45, left=50, right=50)
        set_cell_shading(cell, "F2F2F2")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.0
        r = p.add_run(h_text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10.5)
        r.font.bold = True

    software_data = [
        ("1", "Operating System", "Windows 11 / Linux (Ubuntu 22.04+) / macOS"),
        ("2", "Programming Language", "Python 3.12 (Backend) & TypeScript 5.5+ (Frontend)"),
        ("3", "Backend REST Framework", "FastAPI 0.115+ (Asynchronous ASGI Architecture)"),
        ("4", "ASGI Server", "Uvicorn 0.32+ with High-Resolution Timers"),
        ("5", "NLP Library 1", "TextBlob 0.18+ (Norvig Probabilistic Spell Checker)"),
        ("6", "NLP Library 2", "SymSpellPy 6.7+ (Wolf Garbe Symmetric Delete Engine)"),
        ("7", "Corpus Dictionaries", "frequency_dictionary_en_82_765.txt & bigrams_243k"),
        ("8", "Frontend Framework", "React 19 & React Router v7"),
        ("9", "Build Tool & Bundler", "Vite 8.3 (High-Speed ES Module Bundler)"),
        ("10", "UI Styling & Icons", "Tailwind CSS & Lucide-React Icon Suite")
    ]

    for r_i, (sl, tool, desc) in enumerate(software_data, start=1):
        row = soft_table.rows[r_i]
        for c_i, w in enumerate(soft_widths):
            row.cells[c_i].width = w
            set_cell_margins(row.cells[c_i], top=40, bottom=40, left=50, right=50)

        p0 = row.cells[0].paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p0.paragraph_format.line_spacing = 1.05
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(sl)
        r0.font.name = 'Times New Roman'
        r0.font.size = Pt(9.5)

        p1 = row.cells[1].paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p1.paragraph_format.line_spacing = 1.05
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(tool)
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(9.5)
        r1.font.bold = True

        p2 = row.cells[2].paragraphs[0]
        p2.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p2.paragraph_format.line_spacing = 1.05
        p2.paragraph_format.space_after = Pt(0)
        r2 = p2.add_run(desc)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(9.5)

    p_cap31 = doc.add_paragraph()
    p_cap31.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap31.paragraph_format.space_before = Pt(4)
    p_cap31.paragraph_format.space_after = Pt(10)
    r = p_cap31.add_run("Fig 3.1 - Software Requirements")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(10.5)
    r.font.bold = True

    p = doc.add_paragraph()
    p.add_run(
        "The software requirements incorporate modern open-source technologies specifically selected for computational "
        "efficiency and developer ergonomics. Python 3.12 provides optimized byte-code execution and native type-hinting. "
        "FastAPI leverages Pydantic schemas for automatic request deserialization, serialization, and OpenAPI documentation. "
        "On the client side, React 19 paired with TypeScript ensures strict type safety across data contracts, while Vite "
        "guarantees rapid hot-module replacement and optimized production bundle delivery."
    )

    add_section_heading("HARDWARE REQUIREMENTS:")
    p = doc.add_paragraph()
    p.add_run("The hardware configurations required for optimal execution of the Spelling Correction Tool are detailed below:")

    hard_table = doc.add_table(rows=6, cols=3)
    hard_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(hard_table, color="000000", sz="4", val="single")

    hard_widths = [Inches(0.6), Inches(2.2), Inches(3.6)]
    hard_headers = ["Sl.\nNo", "Component", "Minimum Specification"]

    for c_i, h_text in enumerate(hard_headers):
        cell = hard_table.rows[0].cells[c_i]
        cell.width = hard_widths[c_i]
        set_cell_margins(cell, top=45, bottom=45, left=50, right=50)
        set_cell_shading(cell, "F2F2F2")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.0
        r = p.add_run(h_text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10.5)
        r.font.bold = True

    hardware_data = [
        ("1", "Processor", "Intel Core i5 (8th Gen or above) / AMD Ryzen 5 / Apple M-series"),
        ("2", "System Memory (RAM)", "Minimum 8 GB DDR4 (16 GB Recommended for development)"),
        ("3", "Primary Storage", "Minimum 10 GB available SSD space (for lexicons and dependencies)"),
        ("4", "Network Interface", "Standard TCP/IP Ethernet or Wi-Fi (for localhost/LAN client-server)"),
        ("5", "Architecture", "64-bit x86-64 or ARM64 Operating Architecture")
    ]

    for r_i, (sl, comp, spec) in enumerate(hardware_data, start=1):
        row = hard_table.rows[r_i]
        for c_i, w in enumerate(hard_widths):
            row.cells[c_i].width = w
            set_cell_margins(row.cells[c_i], top=40, bottom=40, left=50, right=50)

        p0 = row.cells[0].paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p0.paragraph_format.line_spacing = 1.05
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(sl)
        r0.font.name = 'Times New Roman'
        r0.font.size = Pt(9.5)

        p1 = row.cells[1].paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p1.paragraph_format.line_spacing = 1.05
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(comp)
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(9.5)
        r1.font.bold = True

        p2 = row.cells[2].paragraphs[0]
        p2.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p2.paragraph_format.line_spacing = 1.05
        p2.paragraph_format.space_after = Pt(0)
        r2 = p2.add_run(spec)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(9.5)

    p_cap32 = doc.add_paragraph()
    p_cap32.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap32.paragraph_format.space_before = Pt(4)
    p_cap32.paragraph_format.space_after = Pt(10)
    r = p_cap32.add_run("Fig 3.2 - Hardware Requirements")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(10.5)
    r.font.bold = True

    p = doc.add_paragraph()
    p.add_run(
        "Due to SymSpell’s lightweight in-memory deletion indexing and TextBlob’s compact frequency tables, the hardware "
        "demands of the system are modest. An 8 GB RAM system is more than sufficient to host the pre-indexed 82k+ English unigrams "
        "and 243k bigrams in RAM with an overhead of less than 150 MB, leaving abundant system capacity for concurrent "
        "processes, browser rendering, and IDE tooling."
    )

    doc.add_page_break()

    # ----------------------------------------------------
    # CHAPTER 4: DOMAIN MODEL
    # ----------------------------------------------------
    add_chapter_heading("4", "DOMAIN MODEL")

    p = doc.add_paragraph()
    p.add_run(
        "The domain model of the Spelling Correction Tool provides a conceptual representation of the principal entities, "
        "data contracts, and behavioral relationships that govern the natural language spelling intelligence system. It acts "
        "as an architectural blueprint illustrating how raw textual input traverses tokenization, anomaly detection, "
        "multi-model candidate exploration, consensus recommendation, and diagnostic telemetry extraction."
    )

    add_figure_image("report_assets/diagrams/fig4_1_domain_model.png", "Fig 4.1 - Domain Model", width=Inches(4.6))

    p = doc.add_paragraph()
    p.add_run(
        "As illustrated in Figure 4.1, the system is organized into decoupled layers and entity abstractions:\n\n"
        "1. User / Client Entity: Represents the end-user interacting through web browsers. The client maintains an active "
        "HTTP session, encapsulates client-side text state, word counts, character offsets, and dispatches requests to the backend.\n\n"
        "2. CorrectionRequest: Encapsulates the user’s raw input string along with the targeted correction algorithm ('compare', "
        "'symspell', or 'textblob'). It enforces strict input boundaries (maximum 5,000 characters) to prevent buffer overflows or denial-of-service.\n\n"
        "3. SpellingCorrectionEngine: Serves as the central dispatcher and coordinator. It receives the CorrectionRequest, invokes "
        "regex-based lexical tokenization while tracking start and end character offsets, filters known words against the cached vocabulary, "
        "and delegates misspelled tokens to the appropriate NLP engines.\n\n"
        "4. TextBlobEngine: Implements Peter Norvig’s unigram probabilistic model. For each query word, it calculates morphological variants "
        "within edit distance 1 and 2, computing normalized probability scores based on corpus occurrences.\n\n"
        "5. SymSpellEngine: Implements Wolf Garbe’s Symmetric Delete algorithm. It maintains pre-indexed hash maps of 82,765 unigrams "
        "and 243,342 bigrams. At runtime, it generates symmetric deletes of the query word in O(1) time, returning candidate words, "
        "exact Damerau-Levenshtein distances, and corpus frequencies.\n\n"
        "6. CorrectionItem: Represents the analytical outcome for an individual token. It captures the original word, whether it was "
        "classified as an error, TextBlob’s correction and confidence, SymSpell’s correction, edit distance and frequency, the recommended "
        "consensus result, the winning algorithm, and a plain-English explanation.\n\n"
        "7. CorrectionStatistics: Aggregates real execution telemetry, including total words analyzed, error count, execution latency "
        "for TextBlob and SymSpell in milliseconds, speedup ratios, and inter-model agreement percentages."
    )

    doc.add_page_break()

    # ----------------------------------------------------
    # CHAPTER 5: IMPLEMENTATION
    # ----------------------------------------------------
    add_chapter_heading("5", "IMPLEMENTATION")

    p = doc.add_paragraph()
    p.add_run(
        "This chapter presents the comprehensive architectural and programmatic implementation of the SpellSense "
        "Spelling Correction Tool. All code excerpts, structures, and configurations shown in this chapter correspond "
        "directly to the actual project implementation files."
    )

    add_section_heading("5.1 Project Directory Structure")
    p = doc.add_paragraph()
    p.add_run(
        "The project is structured into two autonomous tiers: a high-performance Python FastAPI backend and a modern React 19 "
        "TypeScript frontend. This separation of concerns guarantees complete modularity, maintainability, and scalability."
    )
    add_figure_image("report_assets/implementation/fig5_1_project_structure.png", "Fig 5.1 - Project Directory Structure", width=Inches(4.8))
    p = doc.add_paragraph()
    p.add_run(
        "Figure 5.1 illustrates the workspace hierarchy. The `backend/` directory encapsulates FastAPI endpoints, schemas, "
        "and the spelling service. The `frontend/` directory encapsulates React pages, UI components, routing, and API clients."
    )

    add_section_heading("5.2 FastAPI Application & CORS Lifespan")
    p = doc.add_paragraph()
    p.add_run(
        "The entry point of the backend is defined in `backend/app/main.py`. It configures FastAPI with an asynchronous lifespan "
        "handler that eagerly initializes the SymSpell dictionary into RAM during server startup, eliminating first-request latency."
    )
    add_figure_image("report_assets/implementation/fig5_2_main_application.png", "Fig 5.2 - FastAPI Application & CORS Lifespan", width=Inches(4.8))
    p = doc.add_paragraph()
    p.add_run(
        "As shown in Figure 5.2, CORS middleware is explicitly configured to permit seamless client-server communication from "
        "Vite’s local development and production ports, and routes are organized under the `/api` prefix."
    )

    add_section_heading("5.3 Spelling Correction Service Pipeline")
    p = doc.add_paragraph()
    p.add_run(
        "The core orchestration logic resides in `backend/app/services/spelling_service.py`. The `correct_text` method coordinates "
        "high-resolution wall-clock timing, tokenization, method-specific pipeline dispatch, and final text reconstruction."
    )
    add_figure_image("report_assets/implementation/fig5_3_spelling_service.png", "Fig 5.3 - Spelling Correction Service Pipeline", width=Inches(4.8))
    p = doc.add_paragraph()
    p.add_run(
        "Figure 5.3 illustrates the execution dispatcher. When a user requests 'symspell' or 'textblob', the pipeline executes "
        "only the targeted engine for maximum efficiency. When 'compare' is requested, both models are executed in parallel."
    )

    add_section_heading("5.4 TextBlob Probabilistic Speller Implementation")
    p = doc.add_paragraph()
    p.add_run(
        "The TextBlob correction engine employs a fast-path cache: if a word exists in the common English vocabulary hash set, "
        "it immediately returns with confidence 1.0. For misspelled words, it queries TextBlob’s Speller, generating candidate words "
        "and normalizing posterior probabilities."
    )
    add_figure_image("report_assets/implementation/fig5_4_textblob_implementation.png", "Fig 5.4 - TextBlob Spelling Correction Implementation", width=Inches(4.8))
    p = doc.add_paragraph()
    p.add_run(
        "As detailed in Figure 5.4, candidate variations are extracted and bounded to the top 5 candidates with normalized "
        "probability weights, ensuring realistic confidence scores."
    )

    add_section_heading("5.5 SymSpell Singleton & Dictionary Indexing")
    p = doc.add_paragraph()
    p.add_run(
        "To prevent expensive dictionary reloads on every HTTP request, the `SpellingService` class implements the Singleton "
        "design pattern. The frequency dictionary of 82,765 words and bigram dictionary of 243,342 words are loaded exactly once."
    )
    add_figure_image("report_assets/implementation/fig5_5_symspell_implementation.png", "Fig 5.5 - SymSpell Singleton & Dictionary Indexing", width=Inches(4.8))
    p = doc.add_paragraph()
    p.add_run(
        "Figure 5.5 demonstrates the singleton initialization. The pre-indexed deletion tables and prefix trees allow SymSpell "
        "to evaluate candidates across edit distance 2 in sub-millisecond execution times."
    )

    add_section_heading("5.6 Consensus Decision & Recommendation Logic")
    p = doc.add_paragraph()
    p.add_run(
        "When comparing both engines, the system applies a multi-criteria decision tree: if both algorithms agree, consensus "
        "is established with High confidence. If they disagree, preference is given to minimal edit distance combined with high "
        "corpus occurrence frequency."
    )
    add_figure_image("report_assets/implementation/fig5_6_consensus_logic.png", "Fig 5.6 - Consensus Decision & Recommendation Logic", width=Inches(4.8))
    p = doc.add_paragraph()
    p.add_run(
        "Figure 5.6 details the heuristic rules that resolve discrepancies, ensuring optimal recommendation quality."
    )

    add_section_heading("5.7 Frontend Interactive Workspace Component")
    p = doc.add_paragraph()
    p.add_run(
        "The user interface in `frontend/src/pages/CorrectorPage.tsx` implements a clean four-state machine ('idle', 'processing', "
        "'success', 'error') paired with an asynchronous concurrency guard (`isRequestingRef`). A permanently reserved status bar "
        "container guarantees zero layout shift or vertical bouncing when clicking 'Correct Text'."
    )
    add_figure_image("report_assets/implementation/fig5_7_frontend_corrector.png", "Fig 5.7 - Frontend Interactive Workspace Component", width=Inches(4.8))
    p = doc.add_paragraph()
    p.add_run(
        "As shown in Figure 5.7, previous results remain stably visible while updates are in-flight, providing an instant, polished user experience."
    )

    add_section_heading("5.8 Single Word Deep Analysis REST Endpoint")
    p = doc.add_paragraph()
    p.add_run(
        "In addition to batch sentence correction, the backend exposes the `/api/analyze-word` endpoint, which performs deep morphological "
        "inspection on an individual word, extracting symmetric deletes, candidate distances, and step-by-step ranking explanations."
    )
    add_figure_image("report_assets/implementation/fig5_8_word_inspector_api.png", "Fig 5.8 - Single Word Deep Analysis REST Endpoint", width=Inches(4.8))
    p = doc.add_paragraph()
    p.add_run(
        "Figure 5.8 shows the endpoint definition utilized by the frontend's 'How SymSpell Decided' visual decision inspector."
    )

    doc.add_page_break()

    # ----------------------------------------------------
    # CHAPTER 6: RESULTS
    # ----------------------------------------------------
    add_chapter_heading("6", "RESULTS")

    p = doc.add_paragraph()
    p.add_run(
        "This chapter presents the empirical results, interface captures, and performance evaluations obtained from the live, "
        "running Spelling Correction Tool. All screenshots displayed in this chapter were captured directly from the executing "
        "application operating at `http://127.0.0.1:5173/corrector` using the standard benchmark sentence:\n\n"
        "“I hav a beutiful day and I am goin to the markat.”\n\n"
        "This benchmark contains four distinct spelling errors representing different orthographic anomaly types:\n"
        "• “hav” — missing terminal letter (deletion error, target: “have”)\n"
        "• “beutiful” — missing internal vowel (transposition/omission error, target: “beautiful”)\n"
        "• “goin” — colloquial/phonetic truncation (target: “going”)\n"
        "• “markat” — phonetic vowel substitution (target: “market”)"
    )

    add_section_heading("6.1 Main Spelling Correction Interface")
    p = doc.add_paragraph()
    p.add_run(
        "The primary workspace features a dark glassmorphism aesthetic with real-time character and word counters, clear "
        "and paste shortcuts, method selectors, and an instant execution trigger."
    )
    add_figure_image("report_assets/results/fig6_1_main_interface.png", "Fig 6.1 - Main Spelling Correction Interface", width=Inches(4.8))
    p = doc.add_paragraph()
    p.add_run(
        "Figure 6.1 displays the interactive workspace upon initial load. The four misspelled words are clearly detected, and "
        "the consensus corrected sentence “I have a beautiful day and I am going to the market.” is generated immediately."
    )

    add_section_heading("6.2 TextBlob Correction Result")
    p = doc.add_paragraph()
    p.add_run(
        "When the user selects the dedicated 'TextBlob' mode, the application invokes Peter Norvig's probabilistic engine, "
        "displaying the corrected output highlighted in blue."
    )
    add_figure_image("report_assets/results/fig6_2_textblob_result.png", "Fig 6.2 - TextBlob Correction Result", width=Inches(4.8))
    p = doc.add_paragraph()
    p.add_run(
        "Figure 6.2 shows the TextBlob result. TextBlob successfully corrected all four words based on unigram probability "
        "distributions with an execution time of approximately 0.14 ms."
    )

    add_section_heading("6.3 SymSpell Correction Result")
    p = doc.add_paragraph()
    p.add_run(
        "Selecting the dedicated 'SymSpell' mode switches the engine to the Symmetric Delete algorithm, highlighted in purple."
    )
    add_figure_image("report_assets/results/fig6_3_symspell_result.png", "Fig 6.3 - SymSpell Correction Result", width=Inches(4.8))
    p = doc.add_paragraph()
    p.add_run(
        "Figure 6.3 shows the SymSpell correction. By checking pre-indexed deletion variations, SymSpell accurately identified "
        "all four target words with an execution latency of only 0.10 ms."
    )

    add_section_heading("6.4 Compare Both Multi-Model Result")
    p = doc.add_paragraph()
    p.add_run(
        "In 'Compare Both' mode, the interface displays the original input with red error highlights, the recommended consensus "
        "output with green highlights, and side-by-side cards comparing TextBlob and SymSpell outputs."
    )
    add_figure_image("report_assets/results/fig6_4_compare_both.png", "Fig 6.4 - Compare Both Result View", width=Inches(4.8))
    p = doc.add_paragraph()
    p.add_run(
        "Figure 6.4 illustrates the side-by-side comparison. Users can copy any of the outputs with a single click and observe "
        "where the models agree or diverge."
    )

    add_section_heading("6.5 Detected Corrections Breakdown Table")
    p = doc.add_paragraph()
    p.add_run(
        "Navigating to the 'Detected Corrections' tab provides a structured tabular breakdown of each error, displaying original term, "
        "recommended correction, SymSpell edit distance, TextBlob confidence, candidate rankings, and decision rationale."
    )
    add_figure_image("report_assets/results/fig6_5_detected_corrections.png", "Fig 6.5 - Detected Corrections Breakdown Table", width=Inches(4.8))
    p = doc.add_paragraph()
    p.add_run(
        "Figure 6.5 shows the detected corrections table. Each row includes an expandable candidate inspector showing alternative "
        "candidate terms and their individual scoring metrics."
    )

    add_section_heading("6.6 Statistics and Processing Latency")
    p = doc.add_paragraph()
    p.add_run(
        "The 'Statistics & Latency' tab presents legitimate, high-resolution wall-clock execution metrics measured via Python’s "
        "`time.perf_counter()`, deliberately avoiding simulated or fake accuracy claims."
    )
    add_figure_image("report_assets/results/fig6_6_statistics_latency.png", "Fig 6.6 - Statistics and Processing Latency", width=Inches(4.8))
    p = doc.add_paragraph()
    p.add_run(
        "Figure 6.6 demonstrates the performance summary: 12 words analyzed, 4 corrections made, total processing time under 0.3 ms, "
        "SymSpell latency 0.107 ms, TextBlob latency 0.149 ms, and 91.7% consensus agreement between both models."
    )

    add_section_heading("6.7 How SymSpell Decided (4-Stage Decision Inspector)")
    p = doc.add_paragraph()
    p.add_run(
        "The 'How SymSpell Decided' tab provides an educational decision pipeline illustrating the 4 distinct stages of Symmetric Delete "
        "decision-making: 1. Incorrect Word, 2. Candidate Generation via Deletes, 3. Edit Distance Calculation, and 4. Final Selected Correction."
    )
    add_figure_image("report_assets/results/fig6_7_how_symspell_decided.png", "Fig 6.7 - How SymSpell Decided (Decision Inspector)", width=Inches(4.8))
    p = doc.add_paragraph()
    p.add_run(
        "Figure 6.7 shows the inspector for the misspelled word “hav”. It clearly shows SymSpell identifying “have” at edit distance 1 "
        "and ranking it highest due to minimal distance and massive corpus frequency, accompanied by a viva-friendly narrative explanation."
    )

    add_section_heading("6.8 Mobile Responsive Layout View")
    p = doc.add_paragraph()
    p.add_run(
        "The application was tested across viewport widths ranging from 375px to 414px to confirm responsive stability."
    )
    add_figure_image("report_assets/results/fig6_8_mobile_responsive.png", "Fig 6.8 - Mobile Responsive Layout View", width=Inches(2.5))
    p = doc.add_paragraph()
    p.add_run(
        "Figure 6.8 demonstrates the mobile viewport (390px width). The tabular corrections cleanly reflow into responsive cards, "
        "preventing horizontal scrollbars and preserving complete readability on handheld devices."
    )

    doc.add_page_break()

    # ----------------------------------------------------
    # CHAPTER 7: CONCLUSION
    # ----------------------------------------------------
    add_chapter_heading("7", "CONCLUSION")

    add_section_heading("7.1 Conclusion")
    p = doc.add_paragraph()
    p.add_run(
        "The Spelling Correction Tool (“SpellSense”) has been successfully conceptualized, engineered, and empirically "
        "validated as an Alternative Assessment Tool – II (AAT-2) project in Natural Language Processing. The project successfully "
        "bridges the theoretical foundations of computational linguistics with modern web application engineering. By integrating "
        "Peter Norvig’s probabilistic model in TextBlob with Wolf Garbe’s Symmetric Delete algorithm in SymSpell, the system demonstrates "
        "how statistical language modeling and algorithmic combinatorial indexing can complement one another.\n\n"
        "Empirical testing confirms that the application reliably detects and corrects non-word orthographic anomalies across "
        "varying edit distances while maintaining sub-millisecond execution latency. The multi-criteria consensus engine provides "
        "high-confidence recommendations, while the transparent user interface allows students and educators to inspect candidate "
        "probability distributions and decision metrics. The final deliverable represents an accessible, production-quality educational "
        "tool that exemplifies sound software engineering and rigorous NLP principles."
    )

    add_section_heading("7.2 Learning Outcomes")
    p = doc.add_paragraph()
    p.add_run(
        "Throughout the execution of this project, the team attained several valuable technical competencies:\n"
        "1. In-depth understanding of Damerau-Levenshtein edit distance algorithms, including transposition, insertion, deletion, and substitution operations.\n"
        "2. Practical implementation of Bayesian unigram language modeling and posterior probability candidate ranking.\n"
        "3. Mastery of Symmetric Delete indexing principles, understanding how time-space trade-offs enable O(1) dictionary lookups.\n"
        "4. Experience building high-performance asynchronous RESTful APIs using Python FastAPI and Pydantic schemas.\n"
        "5. Architectural expertise in React 19 state machines, eliminating layout shifts, and building responsive, accessible UI components.\n"
        "6. Practical teamwork and collaborative technical documentation adhering to formal academic standards."
    )

    add_section_heading("7.3 Future Enhancements")
    p = doc.add_paragraph()
    p.add_run(
        "While the current system satisfies all project objectives, several promising directions for future research and extension include:\n"
        "1. Context-Aware Transformer Integration: Incorporating masked language models such as BERT or RoBERTa to resolve real-word semantic spelling errors (e.g., distinguishing “their” vs. “there”).\n"
        "2. Multilingual Vocabulary Expansion: Extending the frequency dictionary to support multilingual spelling correction across Kannada, Hindi, and European languages.\n"
        "3. Personalized Lexicon Adaptation: Allowing users to upload domain-specific medical, legal, or engineering glossaries that dynamically augment the SymSpell vocabulary.\n"
        "4. Phonetic Soundex/Metaphone Hybridization: Adding phonetic encoding algorithms to better assist users with auditory or phonetic spelling confusions.\n"
        "5. Grammar and Syntax Checking: Expanding the NLP pipeline to detect subject-verb agreement and punctuation anomalies alongside lexical spelling correction."
    )

    doc.add_page_break()

    # ----------------------------------------------------
    # REFERENCES
    # ----------------------------------------------------
    p_ref_t = doc.add_paragraph()
    p_ref_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ref_t.paragraph_format.space_before = Pt(8)
    p_ref_t.paragraph_format.space_after = Pt(16)
    r = p_ref_t.add_run("REFERENCES")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(18)
    r.font.bold = True

    references = [
        "[1] P. Norvig, “How to Write a Spelling Corrector,” Natural Language Processing Essay, 2007. [Online]. Available: http://norvig.com/spell-correct.html",
        "[2] W. Garbe, “SymSpell: 1 million times faster spelling correction & fuzzy search through a Symmetric Delete spelling correction algorithm,” GitHub Repository, 2012–2024. [Online]. Available: https://github.com/wolfgarbe/SymSpell",
        "[3] S. Loria, “TextBlob: Simplified Text Processing,” Python Software Foundation, Release 0.18.0, 2024. [Online]. Available: https://textblob.readthedocs.io/",
        "[4] D. Jurafsky and J. H. Martin, Speech and Language Processing: An Introduction to Natural Language Processing, Computational Linguistics, and Speech Recognition, 3rd ed. draft, Prentice Hall, 2024.",
        "[5] F. J. Damerau, “A technique for computer detection and correction of spelling errors,” Communications of the ACM, vol. 7, no. 3, pp. 171–176, 1964.",
        "[6] V. I. Levenshtein, “Binary codes capable of correcting deletions, insertions, and reversals,” Soviet Physics Doklady, vol. 10, no. 8, pp. 707–710, 1966.",
        "[7] S. Bird, E. Klein, and E. Loper, Natural Language Processing with Python: Analyzing Text with the Natural Language Toolkit, O'Reilly Media, 2009.",
        "[8] S. Ramírez-Gallego et al., “Fast and scalable text analysis algorithms for natural language processing,” Journal of Big Data, vol. 6, no. 1, pp. 1–24, 2019.",
        "[9] T. Tiangolo, “FastAPI: High performance, easy to learn, fast to code, ready for production,” FastAPI Documentation, 2024. [Online]. Available: https://fastapi.tiangolo.com/",
        "[10] M. Kukich, “Techniques for automatically correcting words in text,” ACM Computing Surveys (CSUR), vol. 24, no. 4, pp. 377–439, 1992."
    ]

    for ref in references:
        p_ref = doc.add_paragraph()
        p_ref.paragraph_format.line_spacing = 1.3
        p_ref.paragraph_format.space_after = Pt(6)
        p_ref.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r_ref = p_ref.add_run(ref)
        r_ref.font.name = 'Times New Roman'
        r_ref.font.size = Pt(11)

    output_path = "AAT2_Spelling_Correction_Tool_Report_FIXED.docx"
    doc.save(output_path)
    print(f"Generated: {output_path}")

if __name__ == "__main__":
    generate_report()
