from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import os
import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini
# print(os.getenv('GEMINI_API_KEY'))
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-1.5-flash')

# Serve static files
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        prompt = data.get('prompt', '').strip()
        
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400

        # Validate that the prompt is tax-related
        tax_prompt = """You are a knowledgeable tax advisor at Deloitte. Your role is to:
1. Only answer questions related to US tax law, regulations, and tax advisory
2. If the question is not tax-related, politely decline to answer and ask for a tax-related question
3. Provide accurate, up-to-date tax information based on US tax regulations
4. Include relevant IRS code sections or regulations when applicable
5. Maintain professional Deloitte standards in responses

Question: {prompt}

Remember to only provide tax-related advice and politely decline non-tax questions."""

        # Call Gemini API with enhanced prompt
        response = model.generate_content(tax_prompt.format(prompt=prompt))

        # Format timestamp for the response
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        return jsonify({
            'response': response.text,
            'timestamp': timestamp,
            'prompt': prompt
        })

    except Exception as e:
        print(f"Error: {str(e)}")  # Debug print
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(debug=True) 