import os

colors = {
    1: "#34d399", 2: "#a78bfa", 3: "#38bdf8", 4: "#4ade80", 5: "#f43f5e",
    6: "#fb923c", 7: "#facc15", 8: "#e879f9", 9: "#22d3ee", 10: "#10b981"
}

lang_script = """
<!-- Global Language Switcher & Google Translate -->
<div id="google_translate_element" style="display:none;"></div>
<script type="text/javascript">
function googleTranslateElementInit() {
  new google.translate.TranslateElement({pageLanguage: 'kk', includedLanguages: 'ru,en,kk', autoDisplay: false}, 'google_translate_element');
}
</script>
<script type="text/javascript" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
<script>
(function() {
    let currentLang = localStorage.getItem('vsh-lang') || 'kk';

    // Synchronize cookie if needed
    var gtrans = '/kk/' + currentLang;
    if (currentLang === 'kk') { 
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        if (location.hostname) {
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + location.hostname + "; path=/;";
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=." + location.hostname + "; path=/;";
        }
 } else {
        document.cookie = "googtrans=" + gtrans + "; path=/";
        if (location.hostname) document.cookie = "googtrans=" + gtrans + "; domain=" + location.hostname + "; path=/";
    }

    // Floating UI
    if (!document.querySelector('.floating-lang-switcher')) {
        const style = document.createElement('style');
        style.innerHTML = `
            body { top: 0 !important; }
            .skiptranslate { display: none !important; }
            .floating-lang-switcher {
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: rgba(15, 23, 42, 0.9);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 10px;
                display: flex;
                gap: 10px;
                z-index: 999999;
                box-shadow: 0 5px 15px rgba(0,0,0,0.5);
                font-family: 'Roboto', sans-serif;
            }
            .floating-lang-btn {
                background: transparent;
                border: 1px solid rgba(255,255,255,0.2);
                color: #94a3b8;
                font-size: 14px;
                font-weight: 600;
                padding: 8px 15px;
                border-radius: 12px;
                cursor: pointer;
                transition: 0.3s;
            }
            .floating-lang-btn:hover {
                color: #fff;
                background: rgba(255,255,255,0.1);
            }
            .floating-lang-btn.active {
                background: linear-gradient(135deg, #a855f7, #3b82f6);
                color: #fff;
                border-color: transparent;
            }
        `;
        document.head.appendChild(style);

        const switcher = document.createElement('div');
        switcher.className = 'floating-lang-switcher notranslate';
        switcher.innerHTML = `
            <button class="floating-lang-btn " onclick="changeLangGlobal('ru')">RU</button>
            <button class="floating-lang-btn " onclick="changeLangGlobal('kk')">ҚАЗ</button>
            <button class="floating-lang-btn " onclick="changeLangGlobal('en')">EN</button>
        `;
        
        // set active
        const btns = switcher.querySelectorAll('.floating-lang-btn');
        if (currentLang === 'ru') btns[0].classList.add('active');
        else if (currentLang === 'kk') btns[1].classList.add('active');
        else if (currentLang === 'en') btns[2].classList.add('active');

        document.body.appendChild(switcher);
    }
})();

function changeLangGlobal(lang) {
    localStorage.setItem('vsh-lang', lang);
    var gtrans = '/kk/' + lang;
    if (lang === 'kk') { 
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        if (location.hostname) {
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + location.hostname + "; path=/;";
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=." + location.hostname + "; path=/;";
        }
 } else {
        document.cookie = "googtrans=" + gtrans + "; path=/";
        if (location.hostname) document.cookie = "googtrans=" + gtrans + "; domain=" + location.hostname + "; path=/";
    }
    location.reload();
}
</script>
"""

import re

for i in range(1, 11):
    filename = f"bio8_lab{i}.html"
    if not os.path.exists(filename):
        continue
        
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Skip if already processed
    if "MODERN UI UPGRADE" in content:
        continue
        
    color = colors[i]
    
    # Calculate a slightly darker color for gradients
    # Very simple approach: just use the color directly or a fixed dark theme
    
    css_override = f"""
<!-- MODERN UI UPGRADE -->
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700;800&display=swap" rel="stylesheet">
<style>
/* Base Overrides */
* {{ font-family: 'Roboto', sans-serif !important; }}
body {{ background: #020617 !important; color: #f8fafc !important; }}

/* Top Nav */
nav {{ height: 60px !important; padding: 0 30px !important; background: rgba(15,23,42,0.95) !important; border-bottom: 2px solid #1e293b !important; box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important; }}
nav a {{ background: rgba(56,189,248,0.1) !important; border: 1px solid rgba(56,189,248,0.3) !important; color: #38bdf8 !important; padding: 8px 16px !important; border-radius: 8px !important; font-weight: bold !important; font-size: 14px !important; }}
nav a:hover {{ background: rgba(56,189,248,0.2) !important; transform: translateX(-2px) !important; }}
nav span {{ font-size: 16px !important; font-weight: 800 !important; letter-spacing: 1px !important; color: #f8fafc !important; }}
#snav {{ background: rgba(250,204,21,0.1) !important; color: #facc15 !important; padding: 6px 12px !important; border-radius: 8px !important; border: 1px solid rgba(250,204,21,0.3) !important; }}

/* Layout */
.main {{ grid-template-columns: 320px 1fr 350px !important; background: radial-gradient(circle at 50% 50%, #1e293b 0%, #020617 100%) !important; }}
.pn {{ background: rgba(15,23,42,0.95) !important; padding: 25px !important; gap: 15px !important; box-shadow: 0 0 20px rgba(0,0,0,0.5) !important; overflow-y: auto !important; }}
.pl {{ border-right: 2px solid #1e293b !important; }}
.pr {{ border-left: 2px solid #1e293b !important; }}
.plbl {{ font-weight: 800 !important; font-size: 14px !important; letter-spacing: 1px !important; color: {color} !important; border-bottom: 1px solid #1e293b !important; padding-bottom: 10px !important; text-transform: uppercase !important; margin-bottom: 10px !important; }}

/* Cards & Buttons */
.dbt, .iopt, .sbt, .rxb, .disk-item, .i-btn {{ border-radius: 10px !important; padding: 12px 15px !important; border: 1px solid #334155 !important; background: #0f172a !important; font-size: 14px !important; font-weight: 500 !important; color: #e2e8f0 !important; transition: 0.2s !important; box-shadow: 0 4px 6px rgba(0,0,0,0.3) !important; }}
.dbt:hover, .iopt:hover, .sbt:hover, .rxb:hover, .disk-item:hover, .i-btn:hover {{ border-color: {color} !important; background: #1e293b !important; transform: translateX(5px) !important; }}
.active, .ok {{ border-color: #34d399 !important; background: rgba(52,211,153,0.1) !important; color: #34d399 !important; box-shadow: inset 0 0 10px rgba(52,211,153,0.2) !important; }}
.bad {{ border-color: #ef4444 !important; background: rgba(239,68,68,0.1) !important; color: #ef4444 !important; }}

/* Text Logs & Info */
.clog, .info-box, .evc, .vrd, .pat-card, .rx-section, .srcsec {{ border-radius: 12px !important; padding: 15px !important; background: rgba(255,255,255,0.03) !important; border: 1px solid rgba(255,255,255,0.05) !important; font-size: 14px !important; color: #cbd5e1 !important; line-height: 1.6 !important; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2) !important; margin-bottom: 10px !important; }}

/* Overlays & Big Modals */
.card {{ width: min(600px, 90vw) !important; padding: 40px 50px !important; background: rgba(15,23,42,0.95) !important; border: 2px solid {color} !important; border-radius: 20px !important; box-shadow: 0 20px 50px rgba(0,0,0,0.7) !important; backdrop-filter: blur(10px) !important; }}
.card h2 {{ font-size: 28px !important; color: #fff !important; margin-bottom: 15px !important; font-weight: 800 !important; }}
.card p {{ color: #94a3b8 !important; font-size: 16px !important; }}
.cbtn {{ padding: 15px 40px !important; background: {color} !important; color: #000 !important; font-size: 16px !important; font-weight: bold !important; border-radius: 12px !important; border: none !important; box-shadow: 0 10px 20px rgba(0,0,0,0.4) !important; text-transform: uppercase !important; letter-spacing: 1px !important; cursor: pointer; transition: 0.3s; }}
.cbtn:hover {{ transform: translateY(-3px) scale(1.05) !important; box-shadow: 0 15px 30px rgba(0,0,0,0.6) !important; background: #fff !important; }}
.elink {{ background: transparent !important; color: {color} !important; border: 2px solid {color} !important; padding: 10px 20px !important; border-radius: 10px !important; font-size: 14px !important; text-decoration: none !important; font-weight: bold !important; transition: 0.3s !important; display: inline-block; }}
.elink:hover {{ background: {color} !important; color: #020617 !important; }}

/* Specific fixes */
.sev {{ padding: 4px 8px !important; border-radius: 6px !important; font-size: 12px !important; font-weight: bold !important; }}
.sh {{ background: rgba(239,68,68,0.2) !important; color: #fca5a5 !important; border: 1px solid rgba(239,68,68,0.3) !important; }}
.sm {{ background: rgba(250,204,21,0.2) !important; color: #fde047 !important; border: 1px solid rgba(250,204,21,0.3) !important; }}
.sl {{ background: rgba(52,211,153,0.2) !important; color: #86efac !important; border: 1px solid rgba(52,211,153,0.3) !important; }}

/* Scrollbars */
::-webkit-scrollbar {{ width: 8px; }}
::-webkit-scrollbar-track {{ background: rgba(0,0,0,0.2); }}
::-webkit-scrollbar-thumb {{ background: {color}; border-radius: 4px; }}
</style>
</head>"""

    # Inject CSS
    content = content.replace("</head>", css_override)
    
    # Inject Language Script
    content = content.replace("</body>", lang_script + "\n</body>")
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Updated all 10 bio8 labs successfully.")
