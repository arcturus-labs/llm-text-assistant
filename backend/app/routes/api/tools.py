from typing import Union, List
from dataclasses import dataclass

from markdown_it import MarkdownIt

from .conversation import Artifact, Tool

class ID(int):
    def __str__(self):
        # Scramble bits using multiplicative hashing with prime numbers
        # Ensure we're working with 32-bit integers
        x = int(self) & 0xFFFFFFFF
        x = (x * 0x45d9f3b) & 0xFFFFFFFF  # Multiply by prime & mask to 32 bits
        x = (x ^ (x >> 16)) & 0xFFFFFFFF  # XOR with shifted version
        x = (x * 0x45d9f3b) & 0xFFFFFFFF  # Multiply again
        x = (x ^ (x >> 16)) & 0xFFFFFFFF  # Final XOR
        # Take only the last 8 hex chars
        return f"{x:08x}"  # Always returns 8 hex chars

class IDs:
    _counter = 0
    
    @classmethod
    def generate_id(cls) -> ID:
        cls._counter += 1
        return ID(cls._counter)
    
    @classmethod
    def str_to_id(cls, s: str) -> ID:
        """Inverse of __str__ method to recover original ID from hex string"""
        # Convert 8-char hex string to int
        x = int(s, 16) & 0xFFFFFFFF
        # Apply inverse operations in reverse order
        x = (x ^ (x >> 16)) & 0xFFFFFFFF
        x = (x * pow(0x45d9f3b, -1, 2**32)) & 0xFFFFFFFF  # Modular multiplicative inverse
        x = (x ^ (x >> 16)) & 0xFFFFFFFF
        x = (x * pow(0x45d9f3b, -1, 2**32)) & 0xFFFFFFFF
        return ID(x)


ContentItem = Union[str, 'MarkdownNode']

# Maximum characters allowed per markdown section - note that average GPT token size is 4 characters
SECTION_CHAR_LIMIT = 100


@dataclass
class MarkdownNode:
    id: ID
    level: int
    heading: str | None
    content: List[ContentItem]
    expanded: bool = False

    @classmethod
    def from_markdown(cls, text: str) -> 'MarkdownNode':
        md = MarkdownIt()
        tokens = md.parse(text)
        
        # Root node contains everything
        root = MarkdownNode(id=IDs.generate_id(), level=0, heading=None, content=[])
        stack = [root]
        
        # Buffer to accumulate text between headers
        text_buffer = []
        
        def flush_buffer():
            if text_buffer:
                stack[-1].content.append(''.join(text_buffer))
                text_buffer.clear()
        
        i = 0
        while i < len(tokens):
            token = tokens[i]
            
            if token.type == 'heading_open':
                # Get heading level
                level = int(token.tag[1])  # h1 = 1, h2 = 2, etc.
                
                # Get heading text from next token
                heading_text = tokens[i + 1].content
                
                # Flush any accumulated text to current node
                flush_buffer()
                
                # Pop stack until we're at the right level
                while stack and stack[-1].level >= level:
                    stack.pop()
                
                # Create new node and add it to parent's content
                new_node = MarkdownNode(id=IDs.generate_id(), level=level, heading=heading_text, content=[])
                stack[-1].content.append(new_node)
                stack.append(new_node)
                
                # Skip the heading content and closing tokens
                i += 2
                
            elif token.type == 'inline':
                # Only append non-empty content
                if token.content:
                    text_buffer.append(token.content)
            
            elif token.type in ['paragraph_open', 'paragraph_close']:
                # Handle paragraph breaks
                if token.type == 'paragraph_close':
                    text_buffer.append('\n\n')
            
            i += 1
        
        # Flush any remaining text
        flush_buffer()

        root.expanded = True
        
        return root

    def to_string(self, parent_expanded: bool = True) -> str:
        parts = []
        
        # Show heading for all cases
        if self.heading:
            parts.append('#' * self.level + ' ' + self.heading + '\n\n')
    
        if not parent_expanded:
            if self.expanded:
                raise ValueError("Invalid state: Node cannot be expanded when parent is collapsed")
            else:
                # Just show expand comment after heading
                parts.append(f"<!-- expand with expand_section({self.id}) -->\n\n")
                return ''.join(parts)
    
        if self.expanded:
            # Show collapse comment
            parts.append(f"<!-- collapse with collapse_section({self.id}) -->\n\n")
            
            # Show full first text section and recurse to children
            text_parts = []
            for item in self.content:
                if isinstance(item, str):
                    text_parts.append(item)
                else:  # MarkdownNode
                    text_parts.append(item.to_string(parent_expanded=True))
            parts.extend(text_parts)
        else:
            # Show truncated first text and recurse to children as collapsed
            text_parts = []
            for item in self.content:
                if isinstance(item, str):
                    if len(item) > SECTION_CHAR_LIMIT:
                        text_parts.append(item[:SECTION_CHAR_LIMIT])
                        text_parts.append(f"...\n\n<!-- truncated - run expand_section({self.id}) to see more -->\n\n")
                        break
                    text_parts.append(item)
                else:  # MarkdownNode
                    text_parts.append(item.to_string(parent_expanded=False))
            parts.extend(text_parts)
    
        return ''.join(parts)


tools = []

