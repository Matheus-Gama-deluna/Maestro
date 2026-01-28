"""Utility script to fix formatting and indentation in specialist skill files."""

from __future__ import annotations

from pathlib import Path
from textwrap import dedent
import re


BASE_SKILLS_DIR = Path(__file__).resolve().parents[1] / "content" / "skills"


def fix_skill_content(content: str) -> str:
    """Fix common formatting issues in skill files."""
    lines = content.split('\n')
    fixed_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Fix YAML frontmatter indentation
        if line.strip() == '---' and i == 0:
            fixed_lines.append('---')
            i += 1
            # Fix next lines until closing ---
            while i < len(lines) and lines[i].strip() != '---':
                if lines[i].strip():
                    # Remove leading spaces from YAML keys
                    fixed_lines.append(lines[i].lstrip())
                else:
                    fixed_lines.append('')
                i += 1
            fixed_lines.append('---')
            i += 1
            continue
        
        # Fix list formatting - ensure proper line breaks
        if line.strip().startswith('- '):
            # Ensure list items are properly formatted
            fixed_lines.append(line.strip())
        else:
            # Regular content line
            fixed_lines.append(line.rstrip())
        
        i += 1
    
    # Fix double "Use quando precisar" patterns
    content = '\n'.join(fixed_lines)
    content = re.sub(r'Use quando precisar quando', 'Use quando', content)
    
    # Remove extra indentation from all content lines after frontmatter
    lines_after_fix = content.split('\n')
    fixed_final_lines = []
    
    for line in lines_after_fix:
        if line.strip().startswith('#') or line.strip().startswith('##') or line.strip().startswith('###'):
            # Headers - no indentation
            fixed_final_lines.append(line.lstrip())
        elif line.strip().startswith('- '):
            # List items - no indentation
            fixed_final_lines.append(line.strip())
        else:
            # Regular content - strip extra spaces but keep structure
            fixed_final_lines.append(line.rstrip())
    
    return '\n'.join(fixed_final_lines)


def main() -> None:
    """Fix formatting in all specialist skill files."""
    specialist_dirs = [
        d for d in BASE_SKILLS_DIR.iterdir() 
        if d.is_dir() and d.name.startswith('specialist-')
    ]
    
    for skill_dir in sorted(specialist_dirs):
        skill_file = skill_dir / "SKILL.md"
        if skill_file.exists():
            print(f"Fixing {skill_file.name}...")
            
            # Read current content
            content = skill_file.read_text(encoding='utf-8')
            
            # Fix formatting
            fixed_content = fix_skill_content(content)
            
            # Write back
            skill_file.write_text(fixed_content, encoding='utf-8')
            print(f"✅ Fixed {skill_file.name}")
    
    print(f"\n✅ Fixed {len(specialist_dirs)} specialist skill files")


if __name__ == "__main__":
    main()