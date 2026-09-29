import os
import re

directory = 'app/app'

# We look for Animated.timing or Animated.spring blocks and inject useNativeDriver: true
# We can just look for 'duration: <num>,' or 'duration: <num>\n'
# Actually, the safest way is to find all Animated.(timing|spring) calls and make sure they have useNativeDriver: true.

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the config object of Animated.timing or spring.
    # We can just replace 'duration: (\d+),?' with 'duration: \g<1>, useNativeDriver: true,'
    # But wait, what if useNativeDriver is already there?
    
    # Let's just blindly add useNativeDriver: true after duration and tension, then deduplicate.
    new_content = re.sub(r'duration:\s*(\d+),?', r'duration: \1, useNativeDriver: true,', content)
    new_content = re.sub(r'tension:\s*(\d+),?', r'tension: \1, useNativeDriver: true,', new_content)
    
    # Deduplicate: 'useNativeDriver: true, useNativeDriver: true' -> 'useNativeDriver: true'
    new_content = re.sub(r'(useNativeDriver:\s*true,\s*)+', 'useNativeDriver: true, ', new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))

