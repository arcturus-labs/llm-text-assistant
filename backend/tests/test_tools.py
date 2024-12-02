from backend.app.routes.api.tools import MarkdownNode, IDs


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
    reconstructed = MarkdownNode.from_json(json_str)
    
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
