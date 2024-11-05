from flask import Blueprint, render_template, request, jsonify

adventure_bp = Blueprint('adventure', __name__,
    url_prefix='/games/adventure',
    template_folder='templates',
    static_folder='static',
    static_url_path='/static'
)

@adventure_bp.route('/npc_api', methods=['POST'])
def npc_api():
    data = request.get_json()
    print(data)
    message_history = data.get('messages', [])
    
    # For now, just echo the last user message in caps
    last_message = message_history[-1]['content'] if message_history else ""
    response = last_message.upper()
    
    return jsonify({
        'role': 'assistant',
        'content': response
    }) 