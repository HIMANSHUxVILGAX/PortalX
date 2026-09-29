import os
import re

directory = 'app/app'

# Regex to match Animated.timing({ ... }) and Animated.spring({ ... })
# and ensure useNativeDriver: true is added if not present.
pattern = re.compile(r'(Animated\.(?:timing|spring)\([^,]+,\s*\{)([^}]+)(\})')

def replacer(match):
    start = match.group(1)
    content = match.group(2)
    end = match.group(3)
    if 'useNativeDriver' not in content:
        # Add useNativeDriver: true
        if content.strip().endswith(','):
            content = content + ' useNativeDriver: true,'
        else:
            content = content + ', useNativeDriver: true'
    return start + content + end

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                data = f.read()
            new_data = pattern.sub(replacer, data)
            if new_data != data:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_data)
                print(f'Updated {path}')
