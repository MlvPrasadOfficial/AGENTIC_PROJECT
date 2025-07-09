"""
Code Quality Assessment Script for Enterprise Insights Copilot

This script scans through the file listing and analyzes each code file to check:
1. Code Completion - Whether the code is complete and not missing major parts
2. No Stray Code - Whether there are no debugging/commented-out code chunks
3. Docstrings - Whether key functions/classes have proper docstrings
4. Code Comments - Whether there are helpful inline comments

The script will update the file.txt with appropriate checks (✅) for each column.
"""

import os
import re
from pathlib import Path

# File path
FILE_LISTING = r"c:\JUL7PROJECT\files\file.txt"

# Define extensions for code files
CODE_EXTENSIONS = {
    '.py', '.js', '.jsx', '.ts', '.tsx', '.css', '.scss',
    '.html', '.json', '.yml', '.yaml', '.md', '.sql'
}

def is_code_file(filepath):
    """Check if a file is a code file based on extension."""
    ext = os.path.splitext(filepath)[1]
    return ext.lower() in CODE_EXTENSIONS

def check_code_completion(content, file_path):
    """Check if code appears complete (no TODOs or FIXME markers)."""
    # This is a simplistic check - in practice would need more nuance
    if not content.strip():
        return False
    
    # Check for common incomplete code markers
    incomplete_markers = [
        r'\bTODO\b', r'\bFIXME\b', r'\bXXX\b', 
        r'Not implemented', r'//\s*stub', r'#\s*stub',
        r'pass\s*#.*implement', r'return\s*#.*implement'
    ]
    
    for marker in incomplete_markers:
        if re.search(marker, content, re.IGNORECASE):
            return False

    # Very basic structure completeness checks based on file type
    ext = os.path.splitext(file_path)[1].lower()
    
    # For Python files, check basic structure
    if ext == '.py':
        # If it's a class and has method stubs or pass statements as the main content
        class_match = re.search(r'class\s+\w+', content)
        if class_match and (content.count('pass') > 2 or content.count('raise NotImplementedError') > 1):
            return False
    
    # For React components, check if they return JSX
    elif ext in ['.jsx', '.tsx']:
        if 'export' in content and 'return' not in content:
            return False
    
    return True

def check_no_stray_code(content):
    """Check if there's no stray/debugging code left in the file."""
    stray_patterns = [
        r'console\.log\(', r'print\(.*debug', r'debugger;',
        r'//\s*DEBUG', r'#\s*DEBUG', r'alert\(',
        r'<!--\s*DEBUG', r'/\*\s*DEBUG'
    ]
    
    for pattern in stray_patterns:
        if re.search(pattern, content):
            return False
    
    # Check for large commented out code blocks
    if content.count('"""') >= 2 and '"""' in content[:20]:
        commented_block = content.split('"""', 2)[1]
        if len(commented_block.splitlines()) > 5:
            return False
    
    # Check for blocks of commented out code (more than 5 consecutive comment lines)
    consecutive_comments = 0
    for line in content.splitlines():
        stripped = line.strip()
        if stripped.startswith('//') or stripped.startswith('#'):
            consecutive_comments += 1
            if consecutive_comments > 5:
                return False
        else:
            consecutive_comments = 0
    
    return True

def check_docstrings(content, file_path):
    """Check if key functions and classes have docstrings."""
    ext = os.path.splitext(file_path)[1].lower()
    
    # For Python files
    if ext == '.py':
        # Check if there are classes or functions
        has_classes_or_functions = bool(re.search(r'(def|class)\s+\w+', content))
        if not has_classes_or_functions:
            return True  # No functions/classes to document
        
        # Check for docstrings in classes and functions
        class_or_func_defs = re.finditer(r'(def|class)\s+\w+[^:]*:', content)
        for match in class_or_func_defs:
            # Get the position of the definition end (the colon)
            def_end = match.end()
            # Get the code after the definition
            code_after = content[def_end:def_end+200]  # Look ahead 200 chars
            # Check if there's a docstring
            if not (re.search(r'^\s*[\'"]', code_after.lstrip()) or re.search(r'^\s*"""', code_after.lstrip())):
                # No docstring found for this function/class
                return False
    
    # For JS/TS files
    elif ext in ['.js', '.jsx', '.ts', '.tsx']:
        # Check if there are functions or classes
        has_functions_or_classes = bool(re.search(r'(function|class)\s+\w+', content))
        if not has_functions_or_classes:
            return True  # No functions/classes to document
        
        # Check for JSDoc style comments
        if not re.search(r'/\*\*', content):
            return False
    
    # For other code files, we'll be more lenient
    return True

def check_code_comments(content):
    """Check if there are helpful inline comments in the code."""
    # Count meaningful lines of code (non-empty, non-comment-only)
    code_lines = [line for line in content.splitlines() 
                 if line.strip() and not line.strip().startswith(('#', '//', '/*', '*'))]
    
    if not code_lines:
        return True  # Empty file or only comments
    
    # Count comment lines
    comment_lines = [line for line in content.splitlines() 
                    if line.strip() and (line.strip().startswith(('#', '//')) or 
                                        '/*' in line or '*/' in line or 
                                        line.strip().startswith('*'))]
    
    # Check comment to code ratio (at least 1 comment per 10 lines of code)
    comment_ratio = len(comment_lines) / len(code_lines)
    
    # Also check if there's at least one detailed comment (more than 3 words)
    has_detailed_comment = False
    for line in comment_lines:
        # Extract the actual comment text
        comment_text = line.split('#', 1)[1] if '#' in line else line.split('//', 1)[1] if '//' in line else ''
        if len(comment_text.split()) > 3:
            has_detailed_comment = True
            break
    
    # Either good ratio or at least one detailed comment
    return comment_ratio >= 0.05 or has_detailed_comment

def update_file_with_checks():
    """Update the file.txt with code quality checks."""
    with open(FILE_LISTING, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the table data
    table_start = content.find('| S.No | Status')
    if table_start == -1:
        print("Could not find table in file")
        return
    
    table_content = content[table_start:]
    lines = table_content.strip().split('\n')
    
    # Skip the header and separator rows
    data_rows = lines[2:]
    updated_rows = []
    
    # Process each row
    for row in data_rows:
        if not row.strip() or '|' not in row:
            updated_rows.append(row)
            continue
            
        columns = [col.strip() for col in row.split('|')]
        
        # Extract the file path (5th column)
        if len(columns) >= 6:
            file_path = columns[5].strip()
            full_path = os.path.join('c:\\JUL7PROJECT', file_path)
            
            # Check if file exists and is a code file
            if os.path.exists(full_path) and is_code_file(file_path):
                try:
                    with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                        file_content = f.read()
                        
                    # Perform checks
                    code_completion = check_code_completion(file_content, file_path)
                    no_stray_code = check_no_stray_code(file_content)
                    has_docstrings = check_docstrings(file_content, file_path)
                    has_comments = check_code_comments(file_content)
                    
                    # Add check marks for each criterion
                    completion_mark = " ✅ " if code_completion else " "
                    stray_code_mark = " ✅ " if no_stray_code else " "
                    docstrings_mark = " ✅ " if has_docstrings else " "
                    comments_mark = " ✅ " if has_comments else " "
                    
                    # Update the row with check marks
                    updated_row = f"| {columns[1]} | {columns[2]} | {columns[3]} | {columns[4]} | {columns[5]} |{completion_mark}|{stray_code_mark}|{docstrings_mark}|{comments_mark}|"
                    updated_rows.append(updated_row)
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
                    # Keep the row as is without checks
                    updated_rows.append(row)
            else:
                # For non-code files or non-existent files, add empty checks
                updated_row = f"| {columns[1]} | {columns[2]} | {columns[3]} | {columns[4]} | {columns[5]} | | | | |"
                updated_rows.append(updated_row)
        else:
            updated_rows.append(row)
    
    # Reconstruct the content
    updated_table = '\n'.join([lines[0], lines[1]] + updated_rows)
    updated_content = content[:table_start] + updated_table
    
    # Write back to the file
    with open(FILE_LISTING, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    
    print("Updated file.txt with code quality checks")

if __name__ == "__main__":
    update_file_with_checks()
