import os
import re

components_dir = 'd:/Rakesh React/HBN24/frontend/src/components'

for filename in os.listdir(components_dir):
    if not filename.endswith('.jsx'): continue
    if filename in ['BreakingNews.jsx', 'FeaturedNews.jsx', 'Header.jsx']: continue
    
    filepath = os.path.join(components_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    def replacer(match):
        img_tag = match.group(0)
        if 'loading=' in img_tag: return img_tag
        if 'alt="Logo"' in img_tag: return img_tag
        return img_tag.replace('<img ', '<img loading="lazy" width="400" height="250" ')
        
    content = re.sub(r'<img\s+[^>]+>', replacer, content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")
        
print("Done!")
