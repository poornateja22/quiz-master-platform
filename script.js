// Application State
const state = {
    users: [],
    quizzes: [],
    currentUser: null,
    leaderboard: []
};

// Authentication Handling
function initAuth() {
    const authForm = document.getElementById('authForm');
    const registerBtn = document.getElementById('registerBtn');

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        loginUser(username, password);
    });

    registerBtn.addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        registerUser(username, password);
    });
}

function registerUser(username, password) {
    if (state.users.some(user => user.username === username)) {
        alert('Username already exists');
        return;
    }

    const newUser = {
        id: Date.now(),
        username,
        password,
        quizzesTaken: [],
        quizzesCreated: []
    };

    state.users.push(newUser);
    loginUser(username, password);
}

function loginUser(username, password) {
    const user = state.users.find(u => u.username === username && u.password === password);
    
    if (user) {
        state.currentUser = user;
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('quizCreationSection').style.display = 'block';
    } else {
        alert('Invalid credentials');
    }
}

// Quiz Creation
function initQuizCreation() {
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const questionsContainer = document.getElementById('questionsContainer');
    const quizCreationForm = document.getElementById('quizCreationForm');

    let questionCount = 0;

    addQuestionBtn.addEventListener('click', () => {
        questionCount++;
        const questionHTML = `
            <div class="card question-card mb-3">
                <div class="card-body">
                    <input type="text" class="form-control mb-2 question-text" placeholder="Question ${questionCount}" required>
                    <div class="options-container">
                        ${[1,2,3,4].map(i => `
                            <div class="input-group mb-2">
                                <div class="input-group-text">
                                    <input class="form-check-input mt-0" type="radio" name="correctOption${questionCount}" value="${i}">
                                </div>
                                <input type="text" class="form-control option-text" placeholder="Option ${i}" required>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        questionsContainer.insertAdjacentHTML('beforeend', questionHTML);
    });

    quizCreationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const quizTitle = document.getElementById('quizTitle').value;
        const questions = [];

        document.querySelectorAll('.question-card').forEach((questionCard, index) => {
            const questionText = questionCard.querySelector('.question-text').value;
            const options = Array.from(questionCard.querySelectorAll('.option-text')).map(opt => opt.value);
            const correctOptionIndex = questionCard.querySelector('input[type="radio"]:checked').value - 1;

            questions.push({
                text: questionText,
                options,
                correctAnswer: correctOptionIndex
            });
        });

        const newQuiz = {
            id: Date.now(),
            title: quizTitle,
            creator: state.currentUser.username,
            questions,
            attempts: []
        };

        state.quizzes.push(newQuiz);
        state.currentUser.quizzesCreated.push(newQuiz.id);
        alert('Quiz created successfully!');
        startQuizAttempt(newQuiz);
    });
}

// Quiz Attempting
function startQuizAttempt(quiz) {
    document.getElementById('quizCreationSection').style.display = 'none';
    document.getElementById('quizAttemptSection').style.display = 'block';
    
    const quizQuestions = document.getElementById('quizQuestions');
    const quizAttemptTitle = document.getElementById('quizAttemptTitle');
    quizAttemptTitle.textContent = quiz.title;
    quizQuestions.innerHTML = '';

    quiz.questions.forEach((question, qIndex) => {
        const questionHTML = `
            <div class="card mb-3 question-card">
                <div class="card-body">
                    <h5 class="card-title">${question.text}</h5>
                    <div class="options">
                        ${question.options.map((option, oIndex) => `
                            <div class="form-check quiz-option p-2" data-question="${qIndex}" data-option="${oIndex}">
                                <input class="form-check-input" type="radio" name="question${qIndex}" 
                                       id="q${qIndex}o${oIndex}" value="${oIndex}">
                                <label class="form-check-label" for="q${qIndex}o${oIndex}">
                                    ${option}
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        quizQuestions.insertAdjacentHTML('beforeend', questionHTML);
    });

    document.getElementById('submitQuizBtn').onclick = () => submitQuiz(quiz);
}

function submitQuiz(quiz) {
    let score = 0;
    const userAnswers = [];

    quiz.questions.forEach((question, qIndex) => {
        const selectedOption = document.querySelector(`input[name="question${qIndex}"]:checked`);
        
        if (selectedOption) {
            const selectedOptionIndex = parseInt(selectedOption.value);
            userAnswers.push(selectedOptionIndex);

            if (selectedOptionIndex === question.correctAnswer) {
                score++;
            }
        } else {
            userAnswers.push(null);
        }
    });

    const quizResult = {
        quizId: quiz.id,
        username: state.currentUser.username,
        score: score,
        totalQuestions: quiz.questions.length,
        timestamp: new Date()
    };

    quiz.attempts.push(quizResult);
    state.currentUser.quizzesTaken.push(quizResult);
    updateLeaderboard(quizResult);

    alert(`Quiz completed! Your score: ${score}/${quiz.questions.length}`);
    showLeaderboard();
}

// Leaderboard Management
function updateLeaderboard(quizResult) {
    state.leaderboard.push(quizResult);
    state.leaderboard.sort((a, b) => b.score - a.score);
}

function showLeaderboard() {
    document.getElementById('quizAttemptSection').style.display = 'none';
    document.getElementById('leaderboardSection').style.display = 'block';

    const leaderboardBody = document.getElementById('leaderboardBody');
    leaderboardBody.innerHTML = '';

    state.leaderboard.slice(0, 10).forEach((result, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${result.username}</td>
                <td>${result.score}/${result.totalQuestions}</td>
            </tr>
        `;
        leaderboardBody.insertAdjacentHTML('beforeend', row);
    });
}

// Initialize Application
function initApp() {
    initAuth();
    initQuizCreation();
}

document.addEventListener('DOMContentLoaded', initApp);