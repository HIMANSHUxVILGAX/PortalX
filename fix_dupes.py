import os

directory = 'app/app'
for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                data = f.read()
            # Replace multiple occurrences of useNativeDriver: true
            new_data = data.replace('useNativeDriver: true, useNativeDriver: true', 'useNativeDriver: true')
            if new_data != data:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_data)
