// No state maintained in JS anymore! Python handles all the logic.

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

const questionCounterText = document.getElementById('question-counter');
const scoreText = document.getElementById('score-display');
const progressBar = document.getElementById('progress-bar');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');

const feedbackContainer = document.getElementById('feedback-container');
const feedbackText = document.getElementById('feedback-text');
const nextBtn = document.getElementById('next-btn');

// Start Quiz
document.getElementById('start-btn').addEventListener('click', startQuiz);
document.getElementById('restart-btn').addEventListener('click', startQuiz);
nextBtn.addEventListener('click', handleNextButton);

async function startQuiz() {
    document.getElementById('start-btn').innerText = "Loading...";
    document.getElementById('restart-btn').innerText = "Loading...";

    try {
        // Tells Python to setup session, score = 0, and shuffle questions
        const response = await fetch('/api/start', { method: 'POST' });
        if (!response.ok) throw new Error("Failed to start");

        await loadQuestionFromServer();

        // Switch Screens
        startScreen.classList.remove('active');
        resultScreen.classList.remove('active');
        quizScreen.classList.add('active');
    } catch (err) {
        console.error(err);
        alert("Failed to connect to the backend! Ensure Python server is running.");
    }

    document.getElementById('start-btn').innerText = "Start Quiz";
    document.getElementById('restart-btn').innerText = "Play Again";
}

async function loadQuestionFromServer() {
    resetState();
    try {
        // Fetch current question from Python
        const response = await fetch('/api/question');
        const data = await response.json();

        if (data.error) {
            console.error(data.error);
            return;
        }

        // Update Header & Progress based on Python state
        questionCounterText.innerText = `Question ${data.current_q_num}/${data.total_questions}`;
        scoreText.innerText = `Score: ${data.score}`;
        progressBar.style.width = `${((data.current_q_num - 1) / data.total_questions) * 100}%`;

        // Set Question
        questionText.innerText = data.question;

        // Create Options dynamically
        data.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.innerText = option;
            button.classList.add('option-btn');
            button.addEventListener('click', () => submitAnswer(index, button));
            optionsContainer.appendChild(button);
        });
    } catch (err) {
        console.error("Error loading question:", err);
    }
}

function resetState() {
    nextBtn.classList.add('hidden');
    feedbackContainer.classList.add('hidden');
    feedbackText.innerText = "";
    feedbackText.className = ""; // Remove colors
    while (optionsContainer.firstChild) {
        optionsContainer.removeChild(optionsContainer.firstChild);
    }
}

async function submitAnswer(selectedIndex, selectedButton) {
    const buttons = optionsContainer.querySelectorAll('.option-btn');

    // Disable all buttons to prevent multiple clicks
    buttons.forEach(btn => btn.disabled = true);

    try {
        // Check answer using Python logic!
        const response = await fetch('/api/answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answer: selectedIndex })
        });
        const data = await response.json();

        if (data.is_correct) {
            selectedButton.classList.add('correct');
            feedbackText.innerText = "Correct! ✅";
            feedbackText.classList.add('text-correct');
        } else {
            selectedButton.classList.add('wrong');
            // Highlight the correct one based on Python validation
            buttons[data.correct_index].classList.add('correct');
            // Extract the option text excluding the "A. " for the feedback string
            const correctOptionText = buttons[data.correct_index].innerText.substring(3);
            feedbackText.innerText = `Wrong! ❌ The correct answer was ${correctOptionText}`;
            feedbackText.classList.add('text-wrong');
        }

        // Update score text immediately from Python's score
        scoreText.innerText = `Score: ${data.score}`;

        // Show Feedback and Next button
        feedbackContainer.classList.remove('hidden');
        nextBtn.classList.remove('hidden');

        // Pass info for the "Next" click
        nextBtn.dataset.finished = data.is_finished ? "true" : "false";
        nextBtn.dataset.score = data.score;
        nextBtn.dataset.total = data.total_questions;

    } catch (err) {
        console.error("Error submitting answer:", err);
    }
}

function handleNextButton() {
    if (nextBtn.dataset.finished === "true") {
        showResults(parseInt(nextBtn.dataset.score), parseInt(nextBtn.dataset.total));
    } else {
        loadQuestionFromServer();
    }
}

function showResults(finalScore, totalQuestions) {
    quizScreen.classList.remove('active');
    resultScreen.classList.add('active');

    // Update Progress Bar to 100% just in case
    progressBar.style.width = '100%';

    const percentage = (finalScore / totalQuestions) * 100;

    document.getElementById('final-score').innerText = `You scored ${finalScore} out of ${totalQuestions}`;

    // Animate circular progress
    const circularProgress = document.querySelector('.circular-progress');
    const percentageText = document.getElementById('final-percentage');

    let currentPercent = 0;
    const speed = 20; // ms

    circularProgress.style.background = `conic-gradient(var(--primary-color) 0deg, var(--border-color) 0deg)`;

    const interval = setInterval(() => {
        if (currentPercent >= percentage) {
            clearInterval(interval);
        } else {
            currentPercent++;
            percentageText.innerText = `${currentPercent}%`;
            circularProgress.style.background = `conic-gradient(var(--primary-color) ${currentPercent * 3.6}deg, var(--border-color) 0deg)`;
        }
    }, speed);

    if (percentage === 0) {
        percentageText.innerText = `0%`;
    }

    const perfMessage = document.getElementById('performance-message');
    if (percentage >= 80) {
        perfMessage.innerText = "Excellent 🎉";
        perfMessage.style.color = "var(--success-color)";
    } else if (percentage >= 50) {
        perfMessage.innerText = "Good 👍";
        perfMessage.style.color = "#fbbf24"; // Yellow
    } else {
        perfMessage.innerText = "Try Again 💪";
        perfMessage.style.color = "var(--error-color)";
    }
}
