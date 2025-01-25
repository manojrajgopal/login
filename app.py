from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process_voice', methods=['POST'])
def process_voice():
    # Get the text from the incoming JSON request
    content = request.json.get('text', '')
    if content.strip():
        print(f"Received from frontend: {content}")  # Log the received text to Flask console
        return jsonify({'status': 'success', 'message': 'Text received', 'processed_text': content})
    return jsonify({'status': 'error', 'message': 'No content received'})

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
