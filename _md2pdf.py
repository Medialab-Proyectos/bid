import markdown, pathlib, subprocess, os, urllib.parse

base = pathlib.Path(r"C:/Users/coben/OneDrive/Desktop/BID/Portal/Version 1/IF")
md = (base / "Atomic-Design-Report.md").read_text(encoding="utf-8")
html_body = markdown.markdown(md, extensions=["tables", "fenced_code", "toc"])

css = """
body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:880px;margin:40px auto;padding:0 24px;color:#222;line-height:1.55}
h1,h2,h3,h4{color:#0b3d91;margin-top:1.6em}
h1{border-bottom:3px solid #0b3d91;padding-bottom:.3em}
h2{border-bottom:1px solid #ccd;padding-bottom:.2em}
code{background:#f3f4f6;padding:1px 5px;border-radius:3px;font-size:.9em}
pre{background:#f3f4f6;padding:12px;border-radius:6px;overflow:auto;font-size:.85em}
table{border-collapse:collapse;width:100%;margin:1em 0;font-size:.9em}
th,td{border:1px solid #d0d4dc;padding:6px 10px;text-align:left;vertical-align:top}
th{background:#eef2fa}
hr{border:none;border-top:1px solid #ccd;margin:2em 0}
ul,ol{padding-left:1.4em}
@page{size:A4;margin:18mm}
"""

html = f"<!doctype html><html><head><meta charset='utf-8'><title>Atomic Design Report</title><style>{css}</style></head><body>{html_body}</body></html>"
html_path = base / "Atomic-Design-Report.html"
html_path.write_text(html, encoding="utf-8")

pdf_path = base / "Atomic-Design-Report.pdf"
chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
url = "file:///" + str(html_path).replace("\\", "/")
subprocess.run([chrome, "--headless", "--disable-gpu", "--no-pdf-header-footer",
                f"--print-to-pdf={pdf_path}", url], check=True)
print("PDF:", pdf_path, "exists:", pdf_path.exists(), "size:", pdf_path.stat().st_size if pdf_path.exists() else 0)
