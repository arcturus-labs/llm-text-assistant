from flask import Blueprint, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables

subscription_bp = Blueprint('subscription', __name__, url_prefix='/api')

@subscription_bp.route('/verify_subscription', methods=['POST'])
def verify_subscription():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({"subscribed": False, "error": "Email is required"})

    # check for subscription
    try:
        verify_url = 'https://api.convertkit.com/v3/subscribers'
        params = {
            'api_secret': os.getenv('CONVERTKIT_API_SECRET'),
            'email_address': email
        }
        verify_response = requests.get(verify_url, params=params)
        verify_response.raise_for_status()
        
        # If we get subscriber data back, they are subscribed
        subscriber_data = verify_response.json()
        if subscriber_data.get('total_subscribers') and subscriber_data['total_subscribers'] > 0:
            return jsonify({"subscribed": True, "error": None})
    except requests.exceptions.RequestException as e:
        return jsonify({"subscribed": False, "error": f"Verification error: {str(e)}"})
    
    # If not, attempt to subscribe
    try:
        url = 'https://api.convertkit.com/v3/forms/7337584/subscribe'
        headers = {'Content-Type': 'application/json; charset=utf-8'}
        payload = {
            'api_key': os.getenv('CONVERTKIT_API_KEY'),
            'email': email
        }
        
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        is_subscribed = response.status_code == 200
    except requests.exceptions.RequestException as e:
        return jsonify({"subscribed": False, "error": f"Subscription error: {str(e)}"})
    
    return jsonify({"subscribed": False, "error": None})
