from flask import Blueprint, request, jsonify

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/echo', methods=['POST'])
def echo():
    data = request.get_json()
    return jsonify(data.upper()) 