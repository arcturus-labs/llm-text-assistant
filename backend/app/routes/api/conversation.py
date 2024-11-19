import re
import os

import anthropic


class Artifact:
    def __init__(self, identifier, type, title, content):
        self.identifier = identifier
        self.type = type
        self.title = title
        self.content = content

    def __str__(self):
        return f'<artifact identifier="{self.identifier}" type="{self.type}" title="{self.title}">\n{self.content}\n</artifact>'
    
    def __repr__(self):
        return f'Artifact(identifier="{self.identifier}", title="{self.title}")'
    
    def dict(self):
        return {
            'identifier': self.identifier,
            'type': self.type,
            'title': self.title,
            'content': self.content,
        }
    
class Tool:
    def __init__(self, schema, callable):
        self.schema = schema
        self.callable = callable
        self.name = schema["name"]

#TODO! update this to make it llm.txt specific and to describe the markdown stuff
#TODO! write specific sections as a markdown document (name sections and quote within sections - don't use section ids b/c people can't see them)
SYSTEM_MESSAGE = f"""\
You help users navigate and understand an llm.txt document.

<llm_txt_instructions>
The llm.txt document is a new standard for conveying information about an website so that it is ledgible to LLM assistants. It is a simple markdown document found at https://<website_url>/llm.txt. It contains sections that convey all the important information about the website.

The llm.txt document is typically very long and not able to fit in the a typicall LLM token window, therefore the sections are collapsed by default. If you want to navigate the document, you must expand the sections using the provided tools.

When answering a question about the llm.txt document, first read over the llm.txt in it's existing state (collapsed by default), and then selectively open any sections that might be necessary to address the user's question. Sometimes a section may not have the expected information and may be irrelevant to the conversation. In this case it is important to collapse the section (again, using the provided tools) so that the total size of the document is minimized.

If you are unable to find the information you need in the llm.txt document, then explain what you tried to do and apologize that you couldn't find the information. Then ask them if they want to alter their question to be more specific (and provide some options that look addressable from the llm.txt document).

Each time the user asks a question, first consider if the currently open sections are still relevant. If they are not, then collapse them. You can collapse all the open sections at once by making parallel calls to collapse individual sections. Do _not_ collapse any section at the end of your response, because the user's next question might be a followon question about the same thing. Instead wait until you receive the next question before collapsing any sections.

If the answer is particularly complex, then you can prepare a markdown artifact that concisely conveys the answer and then refer them to it in the artifact panel (by using a link). If you do this then feel free to copy content out of llm.txt (and leave out the <!-- ... --> comments). Also make sure to cite the sections (by name, not section_id) so that the user can understand where the information is coming from. Note that the user can not see the section ids, so you must use the section names. Section ids are only useful for expanding and collapsing sections with the provided tools.
</llm_txt_instructions>

<artifacts_info>
Artifacts are self-contained pieces of content that can be referenced in the conversation. The assistant can generate artifacts during the course of the conversation upon request of the user. Artifacts have the following format:

```
<artifact identifier="acG9fb4a" type="mime_type" title="title">
...actual content of the artifact...
</artifact>
```

<artifact_instructions>
- The user has access to the artifacts. They will be visible in a window on their screen called the "Artifact Viewer". Therefore, the assistant should only provide the highest level summary of the artifact content in the conversation because the user will have access to the artifact and can read it.
- The assistant should reference artifacts by `identifier` using an anchor tag like this: `<a href="#18bacG4a">linked text</a>`.
  - If the user says "Pull up this or that resource", then the assistant can say "I found this resource: <a href="#18bacG4a">linked text</a>".
  - The linked text should make sense in the context of the conversation. The assistant must supply the linked text. The artifact title is often a good choice.
- The user can similarly refer to the artifacts via an anchor. But they can also just say "the thing we were discussing earlier".
- The assistant can create artifacts on behalf of the user, but only if the user asks for it.
  - The assistant will specify the information below:
    - identifiers: Must be unique 8 character hex strings. Examples: 18bacG4a, 3baf9f83, 98acb34d
    - types: MIME types. Examples: text/markdown, text/plain, application/json, image/svg+xml
    - titles: Must be short, descriptive, and unique. Examples: "Simple Python factorial script", "Blue circle SVG", "Metrics dashboard React component"
    - content: The actual content of the artifact and must conform to the artifact's type and correspond to the title.
  - To create an artifact, the assistant should simply write the content in the format specified above. The content will not be visible to the user in chat, but instead will be visible in the Artifact Viewer. After creating an artifact, they can refer to it in the conversation using an anchor tag as described above. Example:
    ```
    HUMAN: Create a simple Python int sort function.
    ASSISTANT: I will create a simple Python merge sort function.
    <artifact identifier="18bacG4a" type="text/markdown" title="Simple Python int sort function">
    def sort_ints(ints):
        if len(ints) <= 1:
            return ints
            
        mid = len(ints) // 2
        left = sort_ints(ints[:mid])
        right = sort_ints(ints[mid:])
        
        # Merge sorted halves
        result = []
        i = j = 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
                
        result.extend(left[i:])
        result.extend(right[j:])
        return result
    </artifact>

    It is available in the Artifact Viewer as <a href="#18bacG4a">Simple Python int sort function</a>.
    ```
- The assistant can edit artifacts. They do this by simply rewriting the artifact content.
  - If the user asks the assistant to edit the content of an artifact, the assistant should rewrite the full artifact (e.g. keeping the same identifier, but modifying the content and the title if needed).
  - The user doesn't have to explicitly ask to edit an "artifact". They can just say "modify that" or "change that" or something similar.
  - When editing the artifact, you must completely reproduce the full artifact block, including the identifier, type, and title. Example:
    ```
    HUMAN: Make that sorting function sort in descending order.
    ASSISTANT: <artifact identifier="18bacG4a" type="text/markdown" title="Simple Python int sort function (descending)">
    def sort_ints(ints):
        if len(ints) <= 1:
            return ints
            
        mid = len(ints) // 2
        left = sort_ints(ints[:mid])
        right = sort_ints(ints[mid:])
        
        # Merge sorted halves in descending order
        result = []
        i = j = 0
        while i < len(left) and j < len(right):
            if left[i] >= right[j]:  # Changed <= to >= for descending order
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
                
        result.extend(left[i:])
        result.extend(right[j:])
        return result
    </artifact>
    ```
- All existing artifacts are presented in the <artifacts> tag below.
</artifact_instructions>

</artifacts_info>
"""

class Conversation:
    def __init__(self, tools=None, messages=None, artifacts=None):
        self.client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
        self.model = "claude-3-5-sonnet-20241022"
        self.messages = messages or []
        self.artifacts = artifacts or []
        self.tools = tools or []
        
    def say(self, message):
        tools = [t.schema for t in self.tools]
        
        self.messages.append({
            "role": "user", 
            "content": message
        })

        response = self.client.messages.create(
            model=self.model,
            system=self._generate_system_message(self.artifacts),
            messages=self.messages,
            max_tokens=3000,
            temperature=0.7,
            tools=tools,#TODO! make sure to add tools!
        )

        # Handle potential tool use
        while response.stop_reason == "tool_use":
            tool_result_messages  = []
            for block in response.content:
                if block.type == "tool_use":
                    tool_use = block
                    tool_name = tool_use.name
                    tool_input = tool_use.input
                    tool_result = self._process_tool_call(tool_name, tool_input)
                    tool_result_messages.append({
                        "type": "tool_result",
                        "tool_use_id": tool_use.id,
                        "content": tool_result,
                    })

            self.messages.append({"role": "assistant", "content": response.content})
            self.messages.append({    
                "role": "user",
                "content": tool_result_messages,
            })
            
            # Get final response after tool use
            response = self.client.messages.create(
                model=self.model,
                system=self._generate_system_message(self.artifacts),
                messages=self.messages,
                max_tokens=3000,
                temperature=0.7,
                tools=tools,
            )
        if len(response.content) == 0:#TODO!
            import pdb; pdb.set_trace()
        assistant_message = response.content[0].text
        self.messages.append({"role": "assistant", "content": assistant_message})
        artifacts, messages = self._extract_messages_and_artifacts()
        
        return {
            'messages': messages,
            'artifacts': artifacts,
        }
    
    def _process_tool_call(self, tool_name, tool_input):
        for tool in self.tools:
            if tool.name == tool_name:
                try:
                    return tool.callable(**tool_input)
                except Exception as e:
                    return f"Error calling tool {tool_name}: {str(e)}"
        raise Exception(f"Tool {tool_name} not found")
    
    def _generate_system_message(self, artifacts):
        artifacts_info = "\n".join([str(artifact) for artifact in artifacts])
        system_message = SYSTEM_MESSAGE
        
        if artifacts:
            system_message += f"""\
            
<artifacts>
{artifacts_info}
</artifacts>
"""
        return system_message

    def _extract_messages_and_artifacts(self):
        """
        Extracts artifacts from the conversation and returns a list of messages with the artifacts replaced by anchor tags.
        """
        artifacts = self.artifacts
        new_messages = []

        # Process each message
        for message in self.messages:
            content = message['content']
            new_message = {"role": message["role"]}

            # Process string content
            if isinstance(content, str):
                new_content, message_artifacts = self._process_content(content)
                artifacts.extend(message_artifacts)
                new_message["content"] = new_content
                new_messages.append(new_message)
                continue

            # Process list content
            if isinstance(content, list):
                new_content_list = []
                for item in content:
                    # Handle string items
                    if isinstance(item, str):
                        new_item, item_artifacts = self._process_content(item)
                        artifacts.extend(item_artifacts)
                        new_content_list.append(new_item)
                        continue

                    # Handle dict-like items
                    item_dict = item.dict() if hasattr(item, 'dict') else item
                    
                    if item_dict.get('type') == 'text':
                        new_text, text_artifacts = self._process_content(item_dict['text'])
                        artifacts.extend(text_artifacts)
                        new_item = dict(item_dict)
                        new_item['text'] = new_text
                        new_content_list.append(new_item)
                    elif item_dict.get('type') == 'tool_result':
                        new_content, content_artifacts = self._process_content(item_dict['content'])
                        artifacts.extend(content_artifacts)
                        new_item = dict(item_dict)
                        new_item['content'] = new_content
                        new_content_list.append(new_item)
                    else:
                        new_content_list.append(item_dict)

                new_message["content"] = new_content_list
                new_messages.append(new_message)

        # Remove duplicate artifacts keeping only the latest version
        seen_ids = {}
        unique_artifacts = []
        for artifact in artifacts:
            seen_ids[artifact.identifier] = artifact
        unique_artifacts = list(seen_ids.values())

        return unique_artifacts, new_messages

    def _process_content(self, text):
        """Helper method to process text content and extract artifacts"""
        artifacts = []
        
        # Find all artifact blocks using regex
        artifact_pattern = r'<artifact\s+identifier="([^"]+)"\s+type="([^"]+)"\s+title="([^"]+)">(.*?)</artifact>'
        
        # Keep track of where we last ended to build the new content
        last_end = 0
        new_content = ""
        
        for match in re.finditer(artifact_pattern, text, re.DOTALL):
            # Add any text before this match
            new_content += text[last_end:match.start()]
            
            # Extract artifact info
            identifier = match.group(1)
            type_ = match.group(2)
            title = match.group(3)
            content = match.group(4).strip()
            
            # Create and store artifact
            artifact = Artifact(identifier, type_, title, content)
            artifacts.append(artifact)
            
            # Add anchor tag
            new_content += f'<a href="#{identifier}">{title}</a>'
            
            last_end = match.end()
        
        # Add any remaining text
        new_content += text[last_end:]
        
        return new_content, artifacts
