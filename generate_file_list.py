#!/usr/bin/env python
"""
Script to generate a file listing for the Enterprise Insights Copilot project.
Traverses both frontend and backend folders to create a table with file information.
"""

import os
import fnmatch
import re

def determine_component_type(file_path, folder_type):
    """Determine the type of component based on file path and extension"""
    file_ext = os.path.splitext(file_path)[1].lower()
    file_name = os.path.basename(file_path)
    
    if folder_type == 'Backend':
        if 'service.py' in file_name or '\\services\\' in file_path:
            return 'Service'
        elif '\\api\\' in file_path and '\\endpoints\\' in file_path:
            return 'API Endpoint'
        elif '\\schemas\\' in file_path:
            return 'Schema'
        elif '\\agents\\' in file_path:
            return 'Agent'
        elif '\\utils\\' in file_path:
            return 'Utility'
        elif '\\core\\' in file_path:
            return 'Core'
        elif '\\db\\' in file_path:
            return 'Database'
        elif '\\workflow\\' in file_path:
            return 'Workflow'
        elif '\\rag\\' in file_path:
            return 'RAG'
        elif file_ext == '.py':
            return 'Python Module'
        elif file_ext in ['.md']:
            return 'Documentation'
        else:
            return 'Configuration'
    else:  # frontend
        if '\\components\\' in file_path:
            return 'UI Component'
        elif '\\lib\\api\\' in file_path:
            return 'API Client'
        elif '\\styles\\' in file_path:
            return 'Styling'
        elif '\\app\\' in file_path and file_ext in ['.tsx', '.jsx']:
            return 'Page'
        elif '\\features\\' in file_path:
            return 'Feature'
        elif file_ext in ['.tsx', '.jsx']:
            return 'React Component'
        elif file_ext == '.ts' or file_ext == '.js':
            return 'Script'
        elif file_ext == '.css':
            return 'CSS'
        elif file_ext in ['.json', '.env']:
            return 'Configuration'
        elif file_ext in ['.md']:
            return 'Documentation'
        else:
            return 'Other'

def get_file_status(file_path):
    """Determine if the file appears to be complete based on simple heuristics"""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read().lower()
            
            # Check for TODO comments or incomplete markers
            if re.search(r'(todo|fixme|xxx|incomplete|not implemented|pending|to be implemented)', content):
                return 'In Progress'
            
            # Check for critical or known issues
            if re.search(r'(critical issue|bug|error|fix needed|broken)', content):
                return 'Needs Fix'
            
            # Empty or nearly empty files
            if len(content.strip()) < 50:
                return 'Empty/Stub'
                
            # File name indicators
            file_name = os.path.basename(file_path).lower()
            if 'test' in file_name or 'spec' in file_name:
                if re.search(r'(skip|disabled|xit|xdescribe)', content):
                    return 'Tests Incomplete'
                else:
                    return 'Tests Complete'
                    
            # Check for common patterns in complete files
            if os.path.basename(file_path) == '__init__.py' and len(content.strip()) < 100:
                return 'Complete'
            elif os.path.splitext(file_path)[1] == '.py' and ('def ' in content or 'class ' in content):
                return 'Complete'
            elif os.path.splitext(file_path)[1] in ['.tsx', '.jsx', '.ts', '.js'] and ('export ' in content or 'function ' in content):
                return 'Complete'
            elif os.path.splitext(file_path)[1] in ['.md', '.txt']:
                return 'Documentation'
                
            return 'Complete'  # Default to complete if none of above
    except Exception as e:
        return 'Unknown'

def is_excluded(file_path):
    """Check if the file should be excluded from the listing"""
    excludes = [
        '*.pyc', '*.pyo', '__pycache__/*', '*.log', '*.git*', 
        'node_modules/*', '.next/*', '*.map', 
        'package-lock.json', '*.tsbuildinfo'
    ]
    
    for pattern in excludes:
        if fnmatch.fnmatch(os.path.basename(file_path), pattern):
            return True
        if pattern.endswith('/*') and pattern[:-2] in file_path:
            return True
    
    return False

def gather_files(base_path, folder_type):
    """Recursively gather all files from the specified base path"""
    results = []
    
    for root, dirs, files in os.walk(base_path):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, base_path)
            
            # Skip excluded files
            if is_excluded(full_path) or is_excluded(rel_path):
                continue
                
            results.append({
                'path': rel_path,
                'folder_type': folder_type,
                'component_type': determine_component_type(rel_path, folder_type),
                'status': get_file_status(full_path)
            })
    
    return results

def main():
    project_root = os.path.dirname(os.path.abspath(__file__))
    frontend_path = os.path.join(project_root, 'frontend')
    backend_path = os.path.join(project_root, 'backend')
    output_path = os.path.join(project_root, 'files', 'file.txt')
    md_output_path = os.path.join(project_root, 'files', 'frontend_verification_table.md')
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Gather all files
    all_files = []
    frontend_files = gather_files(frontend_path, 'Frontend')
    backend_files = gather_files(backend_path, 'Backend')
    all_files.extend(frontend_files)
    all_files.extend(backend_files)
    
    # Sort files by folder type, then component type, then path
    all_files.sort(key=lambda x: (x['folder_type'], x['component_type'], x['path']))
    
    from datetime import datetime
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Generate status counts
    status_counts = {}
    for file in all_files:
        status = file['status']
        status_counts[status] = status_counts.get(status, 0) + 1
        
    # Generate component counts
    component_counts = {}
    for file in all_files:
        component = file['component_type']
        component_counts[component] = component_counts.get(component, 0) + 1
    
    # Write plaintext output file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("# Enterprise Insights Copilot - File Listing\n\n")
        f.write(f"Generated on: {timestamp}\n\n")
        
        # Write summary statistics
        f.write("## Summary Statistics\n\n")
        f.write(f"Total Files: {len(all_files)}\n")
        f.write(f"Frontend Files: {len(frontend_files)}\n")
        f.write(f"Backend Files: {len(backend_files)}\n\n")
        
        # Status summary
        f.write("### Status Breakdown\n\n")
        for status, count in sorted(status_counts.items()):
            f.write(f"- {status}: {count} files\n")
        f.write("\n")
        
        # Component type summary
        f.write("### Component Type Breakdown\n\n")
        for component, count in sorted(component_counts.items()):
            f.write(f"- {component}: {count} files\n")
        f.write("\n\n")
        
        # Write main file table
        f.write("## Complete File Listing\n\n")
        f.write("| S.No | Status | Location | Component Type | File Path |\n")
        f.write("|------|--------|----------|---------------|----------|\n")
        
        for idx, file in enumerate(all_files, 1):
            f.write("| {} | {} | {} | {} | {} |\n".format(
                idx,
                file['status'],
                file['folder_type'],
                file['component_type'],
                file['path']
            ))
    
    # Write Markdown version with more detailed information
    with open(md_output_path, 'w', encoding='utf-8') as f:
        f.write("# Enterprise Insights Copilot - Frontend and Backend Verification\n\n")
        f.write(f"**Generated on:** {timestamp}\n\n")
        
        f.write("## Project Overview\n\n")
        f.write("This document provides a comprehensive listing of all files in both the frontend and backend of the Enterprise Insights Copilot project. ")
        f.write("It includes status information, component classification, and summary statistics to help track project progress and identify areas that need attention.\n\n")
        
        # Write summary statistics
        f.write("## Summary Statistics\n\n")
        f.write(f"**Total Files:** {len(all_files)}  \n")
        f.write(f"**Frontend Files:** {len(frontend_files)}  \n")
        f.write(f"**Backend Files:** {len(backend_files)}  \n\n")
        
        # Status summary with chart
        f.write("### Status Breakdown\n\n")
        f.write("| Status | Count | Percentage |\n")
        f.write("|--------|-------|------------|\n")
        for status, count in sorted(status_counts.items()):
            percentage = (count / len(all_files)) * 100
            bar = "█" * int(percentage / 5)
            f.write(f"| {status} | {count} | {percentage:.1f}% {bar} |\n")
        f.write("\n")
        
        # Component type summary
        f.write("### Component Type Breakdown\n\n")
        f.write("| Component Type | Count | Frontend | Backend |\n")
        f.write("|---------------|-------|----------|--------|\n")
        
        for component in sorted(component_counts.keys()):
            frontend_count = sum(1 for file in frontend_files if file['component_type'] == component)
            backend_count = sum(1 for file in backend_files if file['component_type'] == component)
            f.write(f"| {component} | {component_counts[component]} | {frontend_count} | {backend_count} |\n")
        f.write("\n\n")
        
        # Write frontend section
        f.write("## Frontend Files\n\n")
        f.write("| # | Status | Component Type | File Path |\n")
        f.write("|---|--------|---------------|----------|\n")
        
        for idx, file in enumerate(frontend_files, 1):
            f.write("| {} | {} | {} | {} |\n".format(
                idx,
                file['status'],
                file['component_type'],
                file['path']
            ))
        f.write("\n\n")
        
        # Write backend section
        f.write("## Backend Files\n\n")
        f.write("| # | Status | Component Type | File Path |\n")
        f.write("|---|--------|---------------|----------|\n")
        
        for idx, file in enumerate(backend_files, 1):
            f.write("| {} | {} | {} | {} |\n".format(
                idx,
                file['status'],
                file['component_type'],
                file['path']
            ))
        f.write("\n\n")
        
        # Add notes about status meanings
        f.write("## Status Definitions\n\n")
        f.write("- **Complete**: File appears to be feature-complete with no obvious issues\n")
        f.write("- **In Progress**: File contains TODOs or is marked as incomplete\n")
        f.write("- **Needs Fix**: File contains known issues, errors, or bugs that need fixing\n")
        f.write("- **Empty/Stub**: File is very minimal or appears to be a stub for future implementation\n")
        f.write("- **Documentation**: Markdown, text files, or other documentation\n")
        f.write("- **Tests Complete/Incomplete**: Test files with their current status\n")
        f.write("- **Unknown**: Status could not be determined\n")

if __name__ == "__main__":
    main()
