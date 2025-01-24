from app import create_app
from flask import jsonify

app = create_app()

# Keep the hello route if you want
@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello from Python Backend!"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)