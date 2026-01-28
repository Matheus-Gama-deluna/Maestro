"""Final script to completely fix formatting in specialist skill files."""

from __future__ import annotations

from pathlib import Path
import re


BASE_SKILLS_DIR = Path(__file__).resolve().parents[1] / "content" / "skills"


def fix_skill_content(content: str) -> str:
    """Fix all formatting issues in skill files."""
    # Split into frontmatter and content
    parts = content.split('---', 2)
    if len(parts) < 3:
        return content
    
    frontmatter = parts[1].strip()
    main_content = parts[2].strip()
    
    # Fix frontmatter - remove all indentation
    frontmatter_lines = []
    for line in frontmatter.split('\n'):
        if line.strip():
            frontmatter_lines.append(line.strip())
        else:
            frontmatter_lines.append('')
    
    # Fix main content
    content_lines = []
    for line in main_content.split('\n'):
        stripped = line.strip()
        
        # Headers
        if stripped.startswith('#'):
            content_lines.append(stripped)
        # List items
        elif stripped.startswith('- '):
            content_lines.append(stripped)
        # Empty lines
        elif not stripped:
            content_lines.append('')
        # Regular content - remove leading spaces but keep internal structure
        else:
            content_lines.append(stripped)
    
    # Rebuild
    fixed_content = '---\n' + '\n'.join(frontmatter_lines) + '\n---\n\n' + '\n'.join(content_lines)
    
    # Fix double "Use quando precisar" patterns
    fixed_content = re.sub(r'Use quando precisar quando', 'Use quando', fixed_content)
    
    return fixed_content


def main() -> None:
    """Fix formatting in all specialist skill files."""
    specialist_dirs = [
        d for d in BASE_SKILLS_DIR.iterdir() 
        if d.is_dir() and d.name.startswith('specialist-')
    ]
    
    for skill_dir in sorted(specialist_dirs):
        skill_file = skill_dir / "SKILL.md"
        if skill_file.exists():
            print(f"Fixing {skill_dir.name}...")
            
            # Read current content
            content = skill_file.read_text(encoding='utf-8')
            
            # Fix formatting
            fixed_content = fix_skill_content(content)
            
            # Write back
            skill_file.write_text(fixed_content, encoding='utf-8')
            print(f"✅ Fixed {skill_dir.name}")
    
    print(f"\n✅ Fixed {len(specialist_dirs)} specialist skill files")


if __name__ == "__main__":
    main()