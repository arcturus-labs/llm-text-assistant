from flask import Blueprint, request, jsonify
from .conversation import Conversation
from .example_tools import tools

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/echo', methods=['POST'])
def echo():
    data = request.get_json()
    return jsonify(data.upper())

@api_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    messages = data.get('messages', [])
    user_message = messages[-1]['content']
    messages = messages[:-1]
    artifacts = data.get('artifacts', [])
    
    try:
        conversation = Conversation(
            tools=tools,
            messages=messages,
            artifacts=artifacts,
        )
        response = conversation.say(user_message)
        
        print(response) 
        return jsonify({
            'messages': response['messages'],
            'artifacts': [artifact.dict() for artifact in response['artifacts']],
            'status': 'success'
        })
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500