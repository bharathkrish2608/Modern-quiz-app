# Modern Dynamic Quiz Application 🚀

Welcome to the Modern Dynamic Quiz Application! This project started as a simple Python terminal script and evolved into a fully functional, full-stack web application with a sleek UI and a robust Python backend.

---

## 🌟 What is this project?
This is a web-based Quiz platform where users can test their knowledge across various topics (like math, programming, geography, and general knowledge). It dynamically loads a random set of 5 questions per session, evaluates user answers securely on the backend, and provides a beautiful, interactive frontend with real-time feedback and a final score analysis.

---

## ✨ Features included
- **📱 Modern Web Interface:** Built with HTML, CSS, and JavaScript. Features a dark-mode minimalist aesthetic, smooth micro-animations, rich gradients, and an animated circular progress bar at the end.
- **🧠 Python Backend Power:** Uses `Flask` (a Python web framework) to host the application and manage all the logic.
- **🔀 Dynamic Question Pool:** Instead of the same 5 questions every time, it pulls from a massive `questions.json` dataset. Every time you play, the Python backend randomly shuffles and selects 5 fresh questions.
- **🔒 Secure Evaluation:** The frontend (browser) never knows the correct answers. It simply sends your choice back to Python, which evaluates it and securely manages your score in an encypted session state.
- **⚡ Real-time Feedback:** As soon as you click an option, you are visually told if it's "Correct! ✅" or "Wrong! ❌" before advancing to the next question.
- **📊 Performance Analysis:** At the end of 5 questions, it calculates your percentage and gives you a custom performance message based on your score (e.g., "Excellent 🎉", "Good 👍", "Try Again 💪").

---

## 🛠️ How it works under the hood

The application is built using a decoupled **Client-Server Architecture**.

### 1. The Data Source (`questions.json`)
This file acts as our "Database". It holds an array of JSON objects. Each object contains a `question` (string), 4 `options` (array of strings), and the correct `answer` stored as an alphabetic character ("A", "B", "C", "D").

### 2. The Backend Server (`quiz.py`)
This is the brain of the application running on Python's Flask framework.
- **Hosting files:** It serves the `index.html`, `style.css`, and `script.js` to your web browser.
- **Session Management:** When you click "Start Quiz", JS calls the `/api/start` route. Python initializes a secure user session, resets your score to 0, loads the `questions.json` file, and completely shuffles the pool of 50 questions into random indices, saving 5 of them active in your session memory.
- **Securing Data:** When JS calls `/api/question` to display the UI, Python *only* sends the question text and the 4 options. It purposefully strips out the correct answer so users can't cheat by looking at the browser console.
- **Evaluating:** When you click an option, JS sends your choice (e.g., "Option 2") to `/api/answer`. Python maps that index to an alphabetic letter, compares it to the correct answer loaded in memory, increments your session score if correct, and tells the frontend what the result was.

### 3. The Frontend Interface (`index.html`, `style.css`, `script.js`)
This is the "dumb UI". It focuses purely on looking good and handling clicks. 
- **HTML structure:** Divides the app into 3 invisible "screens" (`start-screen`, `quiz-screen`, `result-screen`).
- **CSS Styling:** Manages the animations, the sleek purple/blue gradients, and the dynamic coloring of buttons (Green for correct, Red for wrong).
- **JavaScript State:** It uses `async/await fetch()` to talk to the Python API. It asks python for the current question, renders the buttons dynamically, handles user button clicks, updates the progress bar visually, and finally creates the animated radial progress wheel on the result screen.

---

## 🚀 How to Run It!
Because it's a web-server application, it requires two simple steps to run.

1. **Start the Python Backend Server:**
   Open your terminal/command prompt, navigate to the folder containing the project, and run:
   ```bash
   python quiz.py
   ```
   *This starts the Flask web server locally on port 5000.*

2. **Open the Web Frontend:**
   Open your preferred web browser (Chrome, Edge, Safari) and navigate to:
   ```text
   http://127.0.0.1:5000
   ```
   *(This tells the browser to connect to the local server Python just started).*
