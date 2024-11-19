import json
import re
from typing import Union, List, Dict

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

class MarkdownNode:
    def __init__(self, level: int, heading: str | None, content: List[ContentItem], expanded: bool = False):
        self.id = IDs.generate_id()
        self.level = level
        self.heading = heading
        self.content = content
        self.expanded = expanded
        self.nodes: Dict[ID, 'MarkdownNode'] = {}

    @classmethod
    def from_markdown(cls, text: str) -> 'MarkdownNode':
        md = MarkdownIt()
        tokens = md.parse(text)
        
        # Root node contains everything
        root = MarkdownNode(level=0, heading=None, content=[])
        stack = [root]
        
        # Keep track of all nodes created
        all_nodes = {root.id: root}
        
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
                new_node = MarkdownNode(level=level, heading=heading_text, content=[])
                stack[-1].content.append(new_node)
                stack.append(new_node)
                
                # Add to collection of all nodes
                all_nodes[new_node.id] = new_node
                
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

        # Set expanded and populate nodes dict on root only
        # root.expanded = True # TODO: consider making this True again
        root.nodes = all_nodes
        
        return root

    def to_string(self, parent_expanded: bool | None = None) -> str:
        root = False
        if parent_expanded is None:
            parent_expanded = True
            root = True

        parts = []
        
        # Show heading for all cases
        if self.heading:
            parts.append('#' * self.level + ' ' + self.heading)
    
        if not parent_expanded and not self.expanded:
            # Just show expand comment after heading
            parts.append(f'... <!-- Section collapsed - expand with expand_section("{self.id}") -->\n\n')
            return ''.join(parts)    
    
        if self.expanded:
            # Show collapse comment
            if root:
                parts.append(f' <!-- Collapse this document with collapse_section("{self.id}") -->\n\n')
            else:
                parts.append(f' <!-- Section expanded - collapse with collapse_section("{self.id}") -->\n\n')
            
            # Show full first text section and recurse to children
            text_parts = []
            for item in self.content:
                if isinstance(item, str):
                    text_parts.append(item)
                else:  # MarkdownNode
                    text_parts.append(item.to_string(parent_expanded=True))
            parts.extend(text_parts)
        else:
            if root:
                parts.append(f' <!-- Document summarized - expand with expand_section("{self.id}") -->\n\n')
            else:
                parts.append(f' <!-- Section collapsed - expand with expand_section("{self.id}") -->\n\n')
            # Show truncated first text and recurse to children as collapsed
            text_parts = []
            for i, item in enumerate(self.content):
                if isinstance(item, str):
                    if len(item) > SECTION_CHAR_LIMIT:
                        # Find first word boundary after limit
                        matches = re.finditer(r'\b', item[SECTION_CHAR_LIMIT:])
                        match = next(matches, None)  # Skip first match
                        match = next(matches, None)  # Get second match
                        print(item[SECTION_CHAR_LIMIT:], match, match.start() if match else None)
                        split_pos = SECTION_CHAR_LIMIT + (match.start() if match else 0)
                        text_parts.append(item[:split_pos])
                    else:
                        text_parts.append(item)
                else:  # MarkdownNode
                    text_parts.append(item.to_string(parent_expanded=False))
                if i == 0:
                    # special case, if there is no text, we still need to show the expand comment
                    text_parts.append(f"...\n\n")                    
            parts.extend(text_parts)
    
        return ''.join(parts)

    def expand_section(self, id: ID | None = None):
        """Expands this section by setting expanded to True"""
        if id is None or self.id == id:
            self.expanded = True
        elif self.nodes:
            if id in self.nodes:
                self.nodes[id].expand_section()
            else:
                raise ValueError(f"Node with id {id} not found")
        else:
            raise ValueError(f"Only the root node has a nodes dictionary")

    def collapse_section(self, id: ID | None = None):
        """Collapses this section and all child sections recursively"""
        if id is None or self.id == id:
            self.expanded = False
            for item in self.content:
                if isinstance(item, MarkdownNode):
                    item.collapse_section() 
        elif self.nodes:
            if id in self.nodes:
                self.nodes[id].collapse_section()
            else:
                raise ValueError(f"Node with id {id} not found")
        else:
            raise ValueError(f"Only the root node has a nodes dictionary")

    def to_dict(self) -> dict:
        """Convert the node to a dictionary representation."""
        return {
            'id': str(self.id),
            'level': self.level,
            'heading': self.heading,
            'content': [
                item.to_dict() if isinstance(item, MarkdownNode) else item 
                for item in self.content
            ],
            'expanded': self.expanded,
        }

    def to_json(self) -> str:
        """Convert the node to a JSON string."""
        return json.dumps(self.to_dict())

    @classmethod
    def from_dict(cls, data: dict, parent_nodes: Dict[ID, 'MarkdownNode'] | None = None) -> 'MarkdownNode':
        """Create a MarkdownNode from a dictionary representation."""
        root = False
        if parent_nodes is None:
            root = True
            parent_nodes = {}

        # Process content items - recursively create MarkdownNodes for nested items
        content = []
        for item in data['content']:
            if isinstance(item, dict):
                node = cls.from_dict(item, parent_nodes)
                content.append(node)
            else:
                content.append(item)

        # Create new node
        node = cls(
            level=data['level'],
            heading=data['heading'],
            content=content,
            expanded=data['expanded']
        )
        node.id = IDs.str_to_id(data['id'])  # Restore the original ID
        parent_nodes[node.id] = node
        
        # If this is the root node (first call), initialize and populate nodes dict
        if root:
            node.nodes = parent_nodes
        else:
            node.nodes = None

        return node
    
    @classmethod
    def from_json(cls, json_str: str) -> 'MarkdownNode':
        """Create a MarkdownNode from a JSON string."""
        return cls.from_dict(json.loads(json_str))

################

class MarkdownArtifact(Artifact):
    def __init__(self, identifier, title, markdown: str|dict):
        markdownNode = None
        if isinstance(markdown, str):
            markdownNode = MarkdownNode.from_markdown(markdown)
        else:
            markdownNode = MarkdownNode.from_dict(markdown)
        super().__init__(identifier, 'markdown', title, markdownNode.to_string())
        self.root = markdownNode

    def dict(self):
        return {
            'identifier': self.identifier,
            'type': self.type,
            'title': self.title,
            'content': self.root.to_string(),
            'root': self.root.to_dict(),
        }
    
    def collapse_section(self, id: ID):
        self.root.collapse_section(id)
        return f"Section {id} collapsed. Artifact {self.identifier} above reflects this change."

    def expand_section(self, id: ID):
        self.root.expand_section(id)
        return f"Section {id} expanded. Artifact {self.identifier} above reflects this change."
    
    
collapse_section_schema = {
    "name": "collapse_section",
    "description": "Collapse a section of the markdown document to save memory and hide irrelevant content.\n\n"
                  "- You should collapse sections that are confirmed to be irrelevant to the current topic\n"
                  "- Collapse highest-level sections first when possible to maximize memory savings\n"
                  "- When a parent section is collapsed, all subsections are automatically hidden\n"
                  "- Multiple sections can be collapsed in parallel\n"
                  "- collapse_section can also be used in parallel with expand_section",
    "input_schema": {
        "type": "object",
        "properties": {
            "section_id": {
                "type": "string",
                "description": "8-digit hexadecimal ID of the section to collapse (e.g. '04c8214b')",
                "pattern": "^[0-9a-f]{8}$"
            }
        },
        "required": ["section_id"]
    }
}

expand_section_schema = {
    "name": "expand_section", 
    "description": "Expand a section of the markdown document to reveal its contents.\n\n"
                  "- Expand the most specific (lowest-level) relevant section first\n"
                  "- Multiple sections can be expanded in parallel\n"
                  "- You can expand any section regardless of parent section state (e.g. parent sections do not need to be expanded to view subsection content)\n"
                  "- If expansion causes a MemoryOverflow error, try expanding smaller subsections instead\n"
                  "- expand_section can also be used in parallel with collapse_section",
    "input_schema": {
        "type": "object",
        "properties": {
            "section_id": {
                "type": "string",
                "description": "8-digit hexadecimal ID of the section to expand (e.g. '04c8214b')",
                "pattern": "^[0-9a-f]{8}$"
            }
        },
        "required": ["section_id"]
    }
}


def set_up_tools(markdown_text: str):
    root = MarkdownArtifact(identifier='root_llm_txt', type='markdown', title='llm.txt', markdown=markdown_text)
    tools = [
        Tool(collapse_section_schema, root.collapse_section),
        Tool(expand_section_schema, root.expand_section),
    ]
    return root, tools


tools = []