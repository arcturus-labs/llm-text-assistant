import json
from backend.app.routes.api.tools import MarkdownNode, ID

def test_markdown_node_serialization():
    # Create a sample hierarchy
    root = MarkdownNode(level=1, heading="Root", content=["Root text"])
    child1 = MarkdownNode(level=2, heading="Child 1", content=["Child 1 text"])
    child2 = MarkdownNode(level=2, heading="Child 2", content=["Child 2 text"])
    grandchild = MarkdownNode(level=3, heading="Grandchild", content=["Grandchild text"])

    # Update root's content to include nested nodes
    root.content = ["Root text", child1, child2, grandchild]
    
    # Build the nodes dictionary (only in root)
    root.nodes = {
        root.section_id: root,
        child1.section_id: child1,
        child2.section_id: child2,
        grandchild.section_id: grandchild
    }

    # Convert to JSON and back
    json_str = root.to_json()
    print('000000000',json_str)#TODO! 
    reconstructed = MarkdownNode.from_json(json_str)
    print('000000001',reconstructed.to_json())#TODO! 

    # Verify the reconstruction
    assert reconstructed.heading == "Root"
    assert reconstructed.level == 1
    assert len(reconstructed.content) == 4
    assert isinstance(reconstructed.content[0], str)
    assert all(isinstance(item, MarkdownNode) for item in reconstructed.content[1:])
    
    # Verify that root has nodes dictionary
    assert reconstructed.nodes is not None
    assert len(reconstructed.nodes) == 4
    
    # Verify that child nodes don't have nodes dictionary
    child_nodes = [node for node in reconstructed.content[1:] if isinstance(node, MarkdownNode)]
    assert all(node.nodes is None for node in child_nodes)

    # Verify content of nested nodes
    assert reconstructed.content[0] == "Root text"
    assert reconstructed.content[1].heading == "Child 1"
    assert reconstructed.content[2].heading == "Child 2"
    assert reconstructed.content[3].heading == "Grandchild"

def test_markdown_node_serialization_empty():
    # Test with a single node
    node = MarkdownNode(level=1, heading="Solo", content=["Just text"], expanded=True)
    node.nodes = {node.section_id: node}  # Root node should have nodes dictionary
    
    # Convert to JSON and back
    json_str = node.to_json()
    reconstructed = MarkdownNode.from_json(json_str)

    # Verify the reconstruction
    assert reconstructed.heading == "Solo"
    assert reconstructed.level == 1
    assert reconstructed.expanded == True
    assert len(reconstructed.content) == 1
    assert reconstructed.content[0] == "Just text"
    assert reconstructed.nodes is not None
    assert len(reconstructed.nodes) == 1


import pytest
from app.routes.api.tools import MarkdownArtifact, MarkdownNode, IDs

def test_markdown_artifact_init_with_string():
    markdown_text = """# Title
Some content

## Section 1
Section 1 content

## Section 2
Section 2 content"""
    
    artifact = MarkdownArtifact("test-id", "Test Doc", markdown_text)
    
    assert artifact.identifier == "test-id"
    assert artifact.type == "markdown"
    assert artifact.title == "Test Doc"
    assert isinstance(artifact.root, MarkdownNode)
    assert len(artifact.root.content) == 1  # whole document
    assert len(artifact.root.content[0].content) == 3  # text under title and 2 sections


def test_markdown_artifact_dict():
    markdown_text = "# Test\nContent"
    artifact = MarkdownArtifact("test-id", "Test Doc", markdown_text)
    
    result = artifact.dict()
    
    assert result["identifier"] == "test-id"
    assert result["type"] == "markdown"
    assert result["title"] == "Test Doc"
    assert "content" in result
    assert "root" in result
    assert isinstance(result["root"], dict)

def test_markdown_artifact_collapse_expand():
    markdown_text = """# Section 1
Content 1

# Section 2
Content 2"""
    
    artifact = MarkdownArtifact("test-id", "Test Doc", markdown_text)
    
    # Get the ID of the first section
    section_id = None
    for item in artifact.root.content:
        if isinstance(item, MarkdownNode) and item.heading == "Section 1":
            section_id = item.section_id
            break
    
    assert section_id is not None
    
    # Test collapse
    artifact.collapse_section(str(section_id))
    assert not artifact.root.nodes[section_id].expanded
    
    # Test expand
    artifact.expand_section(str(section_id))
    assert artifact.root.nodes[section_id].expanded

def test_markdown_artifact_invalid_section_id():
    artifact = MarkdownArtifact("test-id", "Test Doc", "# Test")
    
    invalid_id = IDs.str_to_id("ffffffff")  # Create an invalid ID
    
    with pytest.raises(ValueError, match="Node with section_id=ffffffff not found"):
        artifact.collapse_section(str(invalid_id))
    
    with pytest.raises(ValueError, match="Node with section_id=ffffffff not found"):
        artifact.expand_section(str(invalid_id))