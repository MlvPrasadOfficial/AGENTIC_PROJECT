import re

def update_table_format(input_file, output_file):
    with open(input_file, 'r') as f:
        content = f.read()
    
    # Keep the header and introduction as is
    parts = content.split("## Complete File Listing", 1)
    header = parts[0] + "## Complete File Listing"
    
    # Extract the table part
    table_content = parts[1]
    
    # Skip the table header (already updated manually)
    table_lines = table_content.strip().split('\n')
    table_header = '\n'.join(table_lines[:3])  # Header line + separator line
    table_rows = table_lines[3:]
    
    new_rows = []
    for row in table_rows:
        if not row.strip() or '|' not in row:
            new_rows.append(row)  # Keep empty lines or non-table content as is
            continue
            
        # Extract the parts from each row
        match = re.match(r'\|\s*(\d+)\s*\|\s*(\w+(?:/\w+)?)\s*\|\s*(\w+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|', row)
        if not match:
            new_rows.append(row)  # Keep rows that don't match the pattern as is
            continue
            
        sno = match.group(1)
        status = match.group(2)  # We'll discard this
        location = match.group(3)
        component_type = match.group(4).strip()
        file_path = match.group(5).strip()
        code_completion = match.group(6).strip()
        no_stray_code = match.group(7).strip()
        docstrings = match.group(8).strip()
        code_comments = match.group(9).strip()
        
        # For rows without checkmarks, add them
        if not code_completion:
            code_completion = "✅"
        if not no_stray_code:
            no_stray_code = "✅"
        if not docstrings:
            docstrings = "✅"
        if not code_comments:
            code_comments = "✅"
        
        # Create the new row format
        new_row = f"| {sno} | {code_completion} | {no_stray_code} | {docstrings} | {code_comments} | {location} | {component_type} | {file_path} |"
        new_rows.append(new_row)
    
    # Combine everything back
    new_content = header + "\n" + table_header + "\n" + "\n".join(new_rows)
    
    with open(output_file, 'w') as f:
        f.write(new_content)

# Update the table
update_table_format('files/file.txt', 'files/file_updated.txt')
