import urllib.request
import json

boundary = "----WebKitFormBoundaryRealTest"
content = """APLYD BRAND GUIDELINES
Version 1.0 - Confidential Brand Standards
1. Brand Assets & Ownership: All trademarks, brand marks, typography palettes, and visual assets are proprietary to Aplyd Media Inc.
2. License & Restriction: Licensee shall not sublicense, modify, or use brand assets outside authorized commercial campaigns without prior written approval.
3. Penalty for Misuse: Unauthorized alteration or brand dilution results in immediate termination of licensing rights and liquidated damages of $50,000 per violation.
"""

body = (
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="file"; filename="APLYD_BRAND_GUIDELINES_V1.0.txt"\r\n'
    f"Content-Type: text/plain\r\n\r\n"
    f"{content}\r\n"
    f"--{boundary}--\r\n"
).encode("utf-8")

req = urllib.request.Request(
    "http://127.0.0.1:8000/api/analyze/upload",
    data=body,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
)

with urllib.request.urlopen(req) as res:
    data = json.loads(res.read().decode("utf-8"))
    print("Live Analysis Result:")
    print("Title:", data.get("documentTitle"))
    print("Category:", data.get("documentCategory"))
    print("Headline:", data.get("headlineSummary"))
    print("Overall Risk:", data.get("overallRisk"))
    print("Clauses:")
    for c in data.get("clauses", []):
        print(f"  - [{c.get('severity')}] {c.get('title')} ({c.get('sectionRef')}): {c.get('whatItSays')}")
    print("What You Are Giving Up:", data.get("whatYouAreGivingUp"))
