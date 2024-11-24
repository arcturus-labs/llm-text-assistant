import React from 'react';
import { useState, useRef, useEffect } from 'react';
import ArtifactPanel from './components/ArtifactPanel';
import MessageContent from './components/MessageContent';
import SubscriptionCheck from './components/SubscriptionCheck';
import './App.css';

//TODO! change these
const dumb_usage={"messages":[{"content":"I'm I want to put together an email for a client about the home listed at 192 Oak St. Can you pull the listing?","role":"user"},{"content":[{"text":"I'll help you get the listing information for 192 Oak St.","type":"text"},{"input":{"address":"192 Oak St"},"name":"get_listing","output":"<artifact identifier=\"18bacG4a\" type=\"application/json\" title=\"192 Oak St\">\n{\n    \"address\": \"192 Oak St\",\n    \"city\": \"Cedar Rapids\",\n    \"state\": \"IA\",\n    \"zip\": \"52402\",\n    \"price\": 185000,\n    \"beds\": 3,\n    \"baths\": 2,\n    \"sqft\": 1450,\n    \"lot_size\": 0.25,\n    \"year_built\": 1978,\n    \"description\": \"Charming ranch-style home in established neighborhood. Updated kitchen with new appliances. Finished basement, attached 2-car garage, fenced backyard with mature trees. Close to schools and shopping.\",\n    \"features\": [           \n        \"Central air\",\n        \"Forced air heating\",\n        \"Hardwood floors\",\n        \"Updated kitchen\",\n        \"Finished basement\",\n        \"Attached garage\",\n        \"Fenced yard\"\n    ],\n}\n\n</artifact>","type":"tool_use"}],"role":"assistant"},{"content":[{"text":"I'll also get the email template so we can put together an email for your client.","type":"text"},{"input":{},"name":"get_email_template","output":"<artifact identifier=\"98acb34d\" type=\"text/plain\" title=\"Prospective Buyer Listing Email Template\">\n\nDear {buyer_name},\n\nI wanted to bring to your attention an exciting new listing at {address}, {city}, {state} that I believe would be perfect for you.\n\nThis beautiful {beds} bedroom, {baths} bathroom home offers {sqft} square feet of living space and was built in {year_built}. It is currently listed at ${price:,}, which represents excellent value for this desirable neighborhood.\n\nSome key features that make this property stand out:\n- Spacious layout with {beds} bedrooms\n- {sqft} square feet of living space\n- Well-maintained home built in {year_built}\n- Current Zestimate: ${zestimate:,}\n\nTo give you some context about the local market, there are several comparable properties in the immediate vicinity:\n- A similar {beds} bed/{baths} bath home just {distance_miles} miles away recently sold for ${last_sold[price]:,}\n- Nearby properties range from ${price:,} to ${price:,} in this area\n- Most homes in this neighborhood were built in the 1970s-1980s\n\nWould you like to schedule a viewing of this property? I have several time slots available this week and would be happy to show you around.\n\nBest regards,\nYour Real Estate Agent\n\n</artifact>","type":"tool_use"}],"role":"assistant"},{"content":"I've pulled both the listing information and the email template. The home at 192 Oak St is a 3-bedroom, 2-bathroom ranch-style home listed at $185,000. It has 1,450 square feet of living space and some nice features including an updated kitchen, finished basement, and fenced backyard.\n\nWould you like me to help you customize the email template with this listing's information for your client? If so, just let me know your client's name and I can help you put that together.","role":"assistant"},{"content":"go ahead and prepare the email","role":"user"},{"content":"I notice you haven't provided the client's name, which would help personalize the email. Rather than leave it blank, I'll use a placeholder \"{buyer_name}\" which you can replace with your client's actual name.\n\nHere's the customized email using the listing information:\n\nDear {buyer_name},\n\nI wanted to bring to your attention an exciting new listing at 192 Oak St, Cedar Rapids, IA that I believe would be perfect for you.\n\nThis beautiful 3 bedroom, 2 bathroom home offers 1,450 square feet of living space and was built in 1978. It is currently listed at $185,000, which represents excellent value for this desirable neighborhood.\n\nSome key features that make this property stand out:\n- Charming ranch-style home in an established neighborhood\n- Updated kitchen with new appliances\n- Finished basement\n- Attached 2-car garage\n- Fenced backyard with mature trees\n- Hardwood floors\n- Central air and forced air heating\n- Close to schools and shopping\n\nThe property sits on a generous 0.25-acre lot, offering plenty of outdoor space for activities and gardening.\n\nWould you like to schedule a viewing of this property? I have several time slots available this week and would be happy to show you around.\n\nBest regards,\nYour Real Estate Agent\n\nNote: I've modified the template slightly to highlight the specific features of this property instead of using the market comparison section, since we don't have that comparative data. If you'd like to personalize this further, just let me know:\n1. Your client's name to replace {buyer_name}\n2. Your name to replace \"Your Real Estate Agent\"\n3. Any other specific details you'd like to add or modify","role":"assistant"},{"content":"My name is John and the buyer's name is Tim. Can you update the email? Also, update the template with my name.","role":"user"},{"content":"I'll update the email with both names:\n\nDear Tim,\n\nI wanted to bring to your attention an exciting new listing at 192 Oak St, Cedar Rapids, IA that I believe would be perfect for you.\n\nThis beautiful 3 bedroom, 2 bathroom home offers 1,450 square feet of living space and was built in 1978. It is currently listed at $185,000, which represents excellent value for this desirable neighborhood.\n\nSome key features that make this property stand out:\n- Charming ranch-style home in an established neighborhood\n- Updated kitchen with new appliances\n- Finished basement\n- Attached 2-car garage\n- Fenced backyard with mature trees\n- Hardwood floors\n- Central air and forced air heating\n- Close to schools and shopping\n\nThe property sits on a generous 0.25-acre lot, offering plenty of outdoor space for activities and gardening.\n\nWould you like to schedule a viewing of this property? I have several time slots available this week and would be happy to show you around.\n\nBest regards,\nJohn\n\nThe email is now personalized with both your name and Tim's name. Is there anything else you'd like me to adjust in the email?","role":"assistant"},{"content":"What about the template?","role":"user"},{"content":"I can't directly modify the stored template - the template is a system resource that I can retrieve but not edit unless specifically asked to propose template changes. The template will continue to show \"{buyer_name}\" and \"Your Real Estate Agent\" as placeholders, which is actually good practice as it allows it to be reused for different clients and agents.\n\nWhen we use the template (like we just did above), we can customize it with specific names and details for each individual email. This way, you can use the same template for all your clients, just filling in the appropriate names and details each time.\n\nWould you like to see the original template again, or would you like to discuss any other changes to Tim's specific email?","role":"assistant"},{"role":"user","content":"???"}],"artifacts":[]}
const smart_usage = {"messages":[{"content":"I'm I want to put together an email for a client about the home listed at 192 Oak St. Can you pull the listing?","role":"user"},{"content":[{"text":"I'll help you get the listing information for 192 Oak St.","type":"text"},{"input":{"address":"192 Oak St"},"name":"get_listing","output":"<a href=\"#18bacG4a\">192 Oak St</a>","type":"tool_use"}],"role":"assistant"},{"content":"I've pulled up the listing for <a href=\"#18bacG4a\">192 Oak St</a>. This is a 3-bedroom, 2-bathroom ranch-style home priced at $185,000. Would you like me to help you compose an email about this property? I can get an email template that we can customize with these listing details.","role":"assistant"},{"content":"Can you pull the email template and draft a new email?","role":"user"},{"content":[{"text":"I'll get the email template and then help you customize it with the property details.","type":"text"},{"input":{},"name":"get_email_template","output":"<a href=\"#98acb34d\">Prospective Buyer Listing Email Template</a>","type":"tool_use"}],"role":"assistant"},{"content":"I'll create a customized version of this email using the listing information we have:\n\n<a href=\"#3baf9f83\">192 Oak St Listing Email</a>\n\nI've created a customized email draft which you can find in the Artifact Viewer as <a href=\"#3baf9f83\">192 Oak St Listing Email</a>. I've removed the comparative market analysis section from the template since we don't have that data, and instead focused on the specific features and benefits of this property.\n\nThe email just needs the buyer's name and your name filled in (marked with brackets). Would you like me to make any adjustments to the content or emphasis of the email?","role":"assistant"},{"content":"My name is John and the buyer's name is Tim. Can you update the email? Also, update the template with my name.","role":"user"},{"content":"I'll update the email with both names.\n\n<a href=\"#3baf9f83\">192 Oak St Listing Email</a>\n\n<a href=\"#98acb34d\">Prospective Buyer Listing Email Template</a>\n\nI've updated both the email for Tim and the template with your name \"John\". The customized email for Tim is ready to send, and any future emails generated from the template will now include your name by default. Would you like to make any other changes to either the email or the template?","role":"assistant"},{"role":"user","content":"thanks, that will be all"}],"artifacts":[{"content":"{\n    \"address\": \"192 Oak St\",\n    \"city\": \"Cedar Rapids\",\n    \"state\": \"IA\",\n    \"zip\": \"52402\",\n    \"price\": 185000,\n    \"beds\": 3,\n    \"baths\": 2,\n    \"sqft\": 1450,\n    \"lot_size\": 0.25,\n    \"year_built\": 1978,\n    \"description\": \"Charming ranch-style home in established neighborhood. Updated kitchen with new appliances. Finished basement, attached 2-car garage, fenced backyard with mature trees. Close to schools and shopping.\",\n    \"features\": [           \n        \"Central air\",\n        \"Forced air heating\",\n        \"Hardwood floors\",\n        \"Updated kitchen\",\n        \"Finished basement\",\n        \"Attached garage\",\n        \"Fenced yard\"\n    ],\n}","identifier":"18bacG4a","title":"192 Oak St","type":"application/json"},{"content":"Dear {buyer_name},\n\nI wanted to bring to your attention an exciting new listing at {address}, {city}, {state} that I believe would be perfect for you.\n\nThis beautiful {beds} bedroom, {baths} bathroom home offers {sqft} square feet of living space and was built in {year_built}. It is currently listed at ${price:,}, which represents excellent value for this desirable neighborhood.\n\nSome key features that make this property stand out:\n- Spacious layout with {beds} bedrooms\n- {sqft} square feet of living space\n- Well-maintained home built in {year_built}\n- Current Zestimate: ${zestimate:,}\n\nTo give you some context about the local market, there are several comparable properties in the immediate vicinity:\n- A similar {beds} bed/{baths} bath home just {distance_miles} miles away recently sold for ${last_sold[price]:,}\n- Nearby properties range from ${price:,} to ${price:,} in this area\n- Most homes in this neighborhood were built in the 1970s-1980s\n\nWould you like to schedule a viewing of this property? I have several time slots available this week and would be happy to show you around.\n\nBest regards,\nJohn","identifier":"98acb34d","title":"Prospective Buyer Listing Email Template","type":"text/plain"},{"content":"Dear Tim,\n\nI wanted to bring to your attention an exciting listing at 192 Oak St, Cedar Rapids, IA that I believe would be perfect for you.\n\nThis beautiful 3 bedroom, 2 bathroom ranch-style home offers 1,450 square feet of living space and was built in 1978. It is currently listed at $185,000, which represents excellent value for this established neighborhood.\n\nSome standout features of this charming property include:\n- Updated kitchen with new appliances\n- Finished basement\n- Attached 2-car garage\n- Fenced backyard with mature trees\n- Hardwood floors throughout\n- Central air and forced air heating\n- Quarter-acre lot (0.25 acres)\n\nThe home is conveniently located close to schools and shopping, making it ideal for families or anyone seeking a well-maintained home in an established neighborhood.\n\nWould you like to schedule a viewing of this property? I have several time slots available this week and would be happy to show you around.\n\nBest regards,\nJohn","identifier":"3baf9f83","title":"192 Oak St Listing Email","type":"text/plain"}]}

const llm_text_urls = {
  // "Anthropic": "https://docs.anthropic.com/llms-full.txt", // long + popular
  "Perplexity": "https://docs.perplexity.ai/llms-full.txt",
  "Cursor": "https://docs.cursor.com/llms-full.txt",
  "ElevenLabs": "https://elevenlabs.io/docs/llms-full.txt",
  "Mintlify": "https://mintlify.com/docs/llms-full.txt",
  "Zapier": "https://docs.zapier.com/llms-full.txt",
  "Pinecone": "https://docs.pinecone.io/llms-full.txt",
  "Trigger.dev": "https://trigger.dev/docs/llms-full.txt",
  "Turso": "https://docs.turso.tech/llms-full.txt",
  // "Upstash": "https://upstash.com/docs/llms-full.txt", // long
  "Dub": "https://dub.co/docs/llms-full.txt",
  "Envoyer": "https://docs.envoyer.io/llms-full.txt",
  "Resend": "https://resend.com/docs/llms-full.txt",
  "BaseHub": "https://docs.basehub.com/llms-full.txt",
  "CrewAI": "https://docs.crewai.com/llms-full.txt",
  "Tinybird": "https://www.tinybird.co/docs/llms-full.txt",
  "OpenPipe": "https://docs.openpipe.ai/llms-full.txt",
  // "Matt Rickard": "https://matt-rickard.com/llms-full.md", // long
  // "Unstructured": "https://docs.unstructured.io/llms-full.txt",
  "Plain": "https://www.plain.com/docs/llms-full.txt",
  "Flatfile": "https://flatfile.com/docs/llms-full.txt",
  "Loops": "https://loops.so/docs/llms-full.txt",
  "EmbedChain": "https://docs.embedchain.ai/llms-full.txt",
  "Stedi": "https://www.stedi.com/docs/llms-full.txt",
  "Galileo": "https://docs.rungalileo.io/llms-full.txt",
  "Activepieces": "https://www.activepieces.com/docs/llms-full.txt",
  "Fireworks AI": "https://docs.fireworks.ai/llms-full.txt",
  "Smartcar": "https://smartcar.com/docs/llms-full.txt",
  "PrimeV": "https://docs.primev.xyz/llms-full.txt",
  "Datafold": "https://docs.datafold.com/llms-full.txt",
  "Dynamic": "https://docs.dynamic.xyz/llms-full.txt",
  "ProjectDiscovery": "https://docs.projectdiscovery.io/llms-full.txt",
  "Vital": "https://docs.tryvital.io/llms-full.txt",
  "Infisical": "https://infisical.com/docs/llms-full.txt",
  "Inkeep": "https://docs.inkeep.com/llms-full.txt",
  "Velt": "https://docs.velt.dev/llms-full.txt",
  "AI Squared": "https://docs.squared.ai/llms-full.txt",
  "Fabric": "https://developer.fabric.inc/llms-full.txt",
  "IonQ": "https://docs.ionq.com/llms-full.txt",
  "Axiom": "https://axiom.co/docs/llms-full.txt",
  "MeshConnect": "https://docs.meshconnect.com/llms-full.txt",
  "FlowX": "https://docs.flowx.ai/llms-full.txt",
  "LuxAlgo": "https://docs.luxalgo.com/llms-full.txt",
  "Salesbricks": "https://docs.salesbricks.com/llms-full.txt",
  "Hyperline": "https://docs.hyperline.co/llms-full.txt",
  "Method Financial": "https://docs.methodfi.com/llms-full.txt",
  "Cobo": "https://www.cobo.com/developers/llms-full.txt",
  // "Mangopay": "https://docs.mangopay.com/llms-full.txt", // superlong
  "Lago": "https://getlago.com/docs/llms-full.txt",
  "Sardine": "https://docs.sardine.ai/llms-full.txt",
  "Oxla": "https://docs.oxla.com/llms-full.txt",
  "Aptible": "https://www.aptible.com/docs/llms-full.txt",
  "llms.txt directory": "https://directory.llmstxt.cloud/llms-full.txt"
}

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [artifacts, setArtifacts] = useState([]);
  const subscriptionCheckRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const chatHistoryRef = useRef(null);
  const [selectedLlm, setSelectedLlm] = useState('');
  const [showLlmModal, setShowLlmModal] = useState(false);
  const [isLlmLoading, setIsLlmLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('recorded')) {
      // Import and use the recorded messages
      const history = urlParams.has('dumb') ? dumb_usage : smart_usage;
      setMessages(history.messages);
      setArtifacts(history.artifacts);
    }
    if (urlParams.has('noSuggestions')) {//TODO! update
      setShowSuggestions(false);
    }
    setShowLlmModal(true);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleArtifactChange = (identifier, newContent) => {
    setArtifacts(artifacts.map(artifact => 
      artifact.identifier === identifier 
        ? { ...artifact, content: newContent }
        : artifact
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    if (!subscriptionCheckRef.current.checkSubscription()) return;

    setIsLoading(true);
    const newMessages = [...messages, { role: 'user', content: inputMessage }];
    console.log(JSON.stringify({
      "messages": newMessages,
      "artifacts": artifacts
    }));
    setMessages([...newMessages, { role: 'assistant', content: '' }]);
    setInputMessage('');

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const conversationType = urlParams.has('dumb') ? 'dumb' : 'smart';//TODO! can remove

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: newMessages,
          artifacts: artifacts,
          conversation_type: conversationType
        })
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setMessages(result.messages);
        if (result.artifacts) {
          setArtifacts(result.artifacts);
        }
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Error: Failed to get response' }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages([...newMessages, { role: 'assistant', content: 'Error: Failed to send message' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  const scrollToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTo({
        top: chatHistoryRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleLlmSelect = async (llmName) => {
    setIsLlmLoading(true);
    try {
      const response = await fetch('/api/choose_llm_txt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: llmName,
          url: llm_text_urls[llmName]
        })
      });
      
      const result = await response.json();
      if (result.questions) {
        setSuggestions(result.questions);
      }
      if (result.artifact) {
        setArtifacts([...artifacts, result.artifact]);
        setShowLlmModal(false);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLlmLoading(false);
    }
  };

  return (
    <div className="app">
      {showLlmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>llm.txt Explorer</h2>
            <p className="modal-description">
              llm.txt is a standardized file that helps language models better understand websites by providing curated, LLM-friendly content and relevant links. It allows site owners to specify exactly what information should be used when answering questions about their platform.
            </p>
            <p className="modal-instruction">Please select a website's llm.txt to explore:</p>
            <select 
              className="llm-dropdown"
              onChange={(e) => handleLlmSelect(e.target.value)}
              disabled={isLlmLoading}
              value={selectedLlm}
            >
              <option value="">Select an llm.txt...</option>
              {Object.keys(llm_text_urls).map(key => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            {isLlmLoading && <div className="spinner"></div>}
          </div>
        </div>
      )}
      <SubscriptionCheck ref={subscriptionCheckRef} />
      <div className="chat-container">
        <div className="chat-history" ref={chatHistoryRef}>
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-content">
                <MessageContent content={message.content} />
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="chat-submit"
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </div>
      <div className="right-panel">
        <ArtifactPanel 
          artifacts={artifacts} 
          onArtifactChange={handleArtifactChange}
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-panel">
          <div className="suggestions-title">Suggested Messages</div>
          <button 
            className="close-suggestions"
            onClick={() => setShowSuggestions(false)}
          >
            ×
          </button>
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="suggestion-item">
                <button 
                  className="suggestion-button"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  ←
                </button>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
