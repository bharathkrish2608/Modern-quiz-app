from flask import Flask, jsonify, request, send_from_directory, session
import random
import os

import json

app = Flask(__name__, static_folder='.', static_url_path='')
app.secret_key = 'super_secret_quiz_key'  # Required for using sessions

def load_questions():
    with open('questions.json', 'r', encoding='utf-8') as f:
        return json.load(f)

QUESTIONS = load_questions()

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/style.css')
def css():
    return send_from_directory('.', 'style.css')

@app.route('/script.js')
def js():
    return send_from_directory('.', 'script.js')

# --- QUIZ LOGIC ROUTES ---

@app.route('/api/start', methods=['POST'])
def start_quiz():
    """Initializes a new quiz session."""
    session['score'] = 0
    session['current_q'] = 0
    
    # Reload questions just in case the JSON file was updated
    global QUESTIONS
    QUESTIONS = load_questions()
    
    # Create a list of randomly ordered question indices, but only take 5
    indices = random.sample(range(len(QUESTIONS)), 5)
    session['question_indices'] = indices
    
    return jsonify({"status": "started", "total_questions": 5})

@app.route('/api/question', methods=['GET'])
def get_question():
    """Gets the current question without revealing the answer."""
    if 'question_indices' not in session or session['current_q'] >= len(session['question_indices']):
        return jsonify({"error": "Quiz not started or already finished"}), 400
    
    q_index = session['question_indices'][session['current_q']]
    question_data = QUESTIONS[q_index]
    
    # We deliberately DO NOT send the answer here.
    return jsonify({
        "question": question_data['question'],
        "options": question_data['options'],
        "current_q_num": session['current_q'] + 1,
        "total_questions": len(session['question_indices']),
        "score": session['score']
    })

@app.route('/api/answer', methods=['POST'])
def submit_answer():
    """Handles logic for checking answer, updating score, and advancing state."""
    if 'question_indices' not in session or session['current_q'] >= len(session['question_indices']):
        return jsonify({"error": "Quiz not started or already finished"}), 400
    
    data = request.json
    selected_index = data.get('answer') # 0, 1, 2, or 3
    
    q_index = session['question_indices'][session['current_q']]
    
    # The JSON uses "answer": "B". We need to convert our selected index to a letter
    letter_mapping = {0: "A", 1: "B", 2: "C", 3: "D"}
    selected_letter = letter_mapping.get(selected_index)
    
    correct_letter = QUESTIONS[q_index]['answer']
    
    is_correct = (selected_letter == correct_letter)
    
    # Determine the index of the correct answer to send back for highlighting
    reverse_mapping = {"A": 0, "B": 1, "C": 2, "D": 3}
    correct_index = reverse_mapping.get(correct_letter)
    
    # Logic for updating score
    if is_correct:
        session['score'] += 1
        
    # Advance to next question
    session['current_q'] += 1
    
    is_finished = session['current_q'] >= len(session['question_indices'])
    
    return jsonify({
        "is_correct": is_correct,
        "correct_index": correct_index,
        "score": session['score'],
        "is_finished": is_finished,
        "total_questions": len(session['question_indices'])
    })

if __name__ == '__main__':
    # Debug=True allows auto-reloading when this file is updated
    app.run(debug=True, port=5000, threaded=True)
