import os
import re

for i in range(1, 11):
    filename = f"bio8_lab{i}.html"
    if not os.path.exists(filename):
        continue
        
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace the initial top nav text
    content = content.replace('<span id="snav">⭐ 0 ұпай</span>', '<span id="snav">🟢 Белсенді</span>')
    
    # 2. Replace JS score updates for top nav
    content = re.sub(r"'⭐ '\s*\+\s*score\s*\+\s*' ұпай'", "'🟢 Жалғасуда'", content)
    
    # 3. Replace the final score text in HTML
    content = re.sub(r'<div class="sbig" id="fscore">[^<]+</div>', '<div class="sbig" id="fscore">Аяқталды!</div>', content)
    
    # 4. Replace JS final score assignment
    content = re.sub(r"document\.getElementById\('fscore'\)\.textContent\s*=\s*[^;]+;", "document.getElementById('fscore').textContent='Тәжірибе сәтті аяқталды!';", content)

    # Write back
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Successfully removed point-based testing from all bio8 labs!")
