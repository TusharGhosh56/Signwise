import urllib.request
import json
import os

boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
content = """EMPLOYMENT AGREEMENT
This Executive Agreement is made between Cyberdyne Systems and Sarah Connor.
Clause 1: Term of Employment. Indefinite.
Clause 2: Non-Compete. Employee agrees not to engage in any competitive enterprise worldwide for a duration of 36 months following termination.
Clause 3: Intellectual Property Assignment. All inventions, whether created during working hours or personal time, belong exclusively to Company.
"""

body = (
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="file"; filename="executive_agreement.txt"\r\n'
    f"Content-Type: text/plain\r\n\r\n"
    f"{content}\r\n"
    f"--{boundary}--\r\n"
).encode("utf-8")

req = urllib.request.Request(
    "http://127.0.0.1:8000/api/analyze/upload",
    data=body,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
)

try:
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read().decode("utf-8"))
        print("Upload Test Passed! Status:", res.status)
        print("Document Title:", data.get("documentTitle"))
        print("Overall Risk:", data.get("overallRisk"))
        print("Clauses identified:", len(data.get("clauses", [])))
        print("Red flag count:", data.get("stats", {}).get("redFlagCount"))
except Exception as e:
    print("Upload Test Failed:", e)
