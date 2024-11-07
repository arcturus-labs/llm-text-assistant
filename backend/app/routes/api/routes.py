from flask import Blueprint, request, jsonify
from anthropic import Anthropic
import os
api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/echo', methods=['POST'])
def echo():
    data = request.get_json()
    return jsonify(data.upper())

@api_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    messages = data.get('messages', [])
    print(messages)
    
    client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
    
    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-latest",
            messages=messages,
            max_tokens=1000,
        )
        return jsonify({
            'response': response.content[0].text,
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500 