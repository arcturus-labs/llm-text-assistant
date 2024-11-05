from flask import Blueprint, send_from_directory

static_bp = Blueprint('static', __name__)

@static_bp.route('/')
def serve_index():
    return send_from_directory('../frontend/dist', 'index.html')

@static_bp.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend/dist', path) 