from flask import Blueprint, jsonify, request

api_bp = Blueprint('api', __name__)

@api_bp.route('/example', methods=['GET'])
def example_route():
    return jsonify({"message": "This is an example route."})

@api_bp.route('/data', methods=['POST'])
def data_route():
    data = request.json
    return jsonify({"received": data}), 201

@api_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})