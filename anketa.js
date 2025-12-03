document.addEventListener('DOMContentLoaded', () => {
    let currentQuestionIndex = 0;
    let userAnswers = {};
    let correctAnswersCount = 0;

    let allTestData = [];
    let testData = [];

    const testContainer = document.getElementById('testContainer');
    const progressFill = document.getElementById('progressFill');
    const stepLabel = document.getElementById('stepLabel');
    const modeLabel = document.getElementById('modeLabel');
    const startTestBtn = document.getElementById('startTestBtn');
    const nextQuestionBtn = document.getElementById('nextQuestionBtn');
    const checkBtn = document.getElementById('checkBtn');
    const restartBtn = document.getElementById('restartBtn');

    function shuffleArray(array) {
      const arr = array.slice();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function renderQuestion() {
      if (currentQuestionIndex < testData.length) {
        const currentQuestion = testData[currentQuestionIndex];
        const isLastQuestion = currentQuestionIndex === testData.length - 1;

        stepLabel.textContent = `Вопрос ${currentQuestionIndex + 1} из ${testData.length}`;
        progressFill.style.width = `${((currentQuestionIndex + 1) / testData.length) * 100}%`;
        modeLabel.textContent = currentQuestion.type === "single"
          ? "Один правильный ответ"
          : "Несколько правильных ответов";
        modeLabel.className = currentQuestion.type === "single" ? "badge" : "badge warn";
        modeLabel.innerHTML = `<span class="badge-dot"></span>${modeLabel.textContent}`;

        testContainer.innerHTML = `
          <div class="question-title">${currentQuestion.question}</div>
          <div class="answers">
            ${currentQuestion.options.map(option => `
              <label class="answer-option ${currentQuestion.type}">
                <input type="${currentQuestion.type === 'single' ? 'radio' : 'checkbox'}"
                       name="answer" value="${option}" />
                <span class="custom-check"></span>
                <span class="answer-text">${option}</span>
              </label>
            `).join('')}
          </div>
        `;

        startTestBtn.style.display = 'none';
        nextQuestionBtn.style.display = 'inline-flex';
        // кнопку результата можно скрывать здесь
        checkBtn.style.display = 'none';

        document.querySelectorAll('.answer-option input').forEach(input => {
          input.addEventListener('change', () => {
            if (currentQuestion.type === 'single') {
              document.querySelectorAll('.answer-option').forEach(label => {
                label.classList.remove('selected');
              });
              if (input.checked) {
                input.closest('.answer-option').classList.add('selected');
              }
            } else if (currentQuestion.type === 'multiple') {
              input.closest('.answer-option').classList.toggle('selected', input.checked);
            }
          });
        });
      }
    }

    function handleNextQuestion() {
      const selectedAnswers = Array.from(
        document.querySelectorAll('.answer-option input:checked')
      ).map(input => input.value);

      if (selectedAnswers.length === 0) {
        alert('Пожалуйста, выберите хотя бы один вариант ответа.');
        return;
      }

      userAnswers[currentQuestionIndex] = selectedAnswers;

      currentQuestionIndex++;
      if (currentQuestionIndex < testData.length) {
        renderQuestion();
      } else {
        // все вопросы пройдены – показываем кнопку результата
        testContainer.innerHTML = `
          <div class="result">
            <p>Все вопросы пройдены. Нажмите "Показать результат".</p>
          </div>
        `;
        nextQuestionBtn.style.display = 'none';
        checkBtn.style.display = 'inline-flex';
        stepLabel.textContent = 'Все вопросы пройдены';
        modeLabel.style.display = 'none';
      }
    }

    function checkAnswers() {
      correctAnswersCount = 0;
      testData.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        let isCorrect = false;

        if (q.type === 'single') {
          isCorrect = userAnswer && userAnswer[0] === q.correctAnswer;
        } else if (q.type === 'multiple') {
          if (userAnswer && userAnswer.length === q.correctAnswer.length) {
            isCorrect = q.correctAnswer.every(answer => userAnswer.includes(answer));
          }
        }

        if (isCorrect) correctAnswersCount++;
      });
      return correctAnswersCount;
    }

    function showResults() {
      const correct = checkAnswers();
      const total = testData.length;

      let mistakesHtml = '';
      testData.forEach((q, index) => {
        const userAnswer = userAnswers[index] || [];
        let isCorrect = false;

        if (q.type === 'single') {
          isCorrect = userAnswer[0] === q.correctAnswer;
        } else if (q.type === 'multiple') {
          if (userAnswer && userAnswer.length === q.correctAnswer.length) {
            isCorrect = q.correctAnswer.every(a => userAnswer.includes(a));
          }
        }

        if (!isCorrect) {
          const correctText = Array.isArray(q.correctAnswer)
            ? q.correctAnswer.join(', ')
            : q.correctAnswer;
          const userText = userAnswer.length
            ? (Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer)
            : 'Нет ответа';

          mistakesHtml += `
            <div class="result-question">
              <p><strong>Вопрос ${index + 1}:</strong> ${q.question}</p>
              <p><span style="color:#ff8080;">Ваш ответ:</span> ${userText}</p>
              <p><span style="color:#80ff80;">Правильный ответ:</span> ${correctText}</p>
            </div>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:10px 0;">
          `;
        }
      });

      if (!mistakesHtml) {
        mistakesHtml = '<p>Все ответы правильные, ошибок нет.</p>';
      }

      testContainer.innerHTML = `
        <div class="result">
          <h3>Результаты тестирования</h3>
          <p>Вы ответили правильно на ${correct} из ${total} вопросов.</p>
          <h4 style="margin-top:12px;">Неправильные ответы:</h4>
          ${mistakesHtml}
        </div>
      `;

      nextQuestionBtn.style.display = 'none';
      checkBtn.style.display = 'none';
      restartBtn.style.display = 'inline-flex';
      stepLabel.textContent = 'Тест завершен';
      modeLabel.style.display = 'none';
    }

    function startTest() {
      currentQuestionIndex = 0;
      userAnswers = {};
      correctAnswersCount = 0;
      modeLabel.style.display = 'inline-flex';
      restartBtn.style.display = 'none';

      // каждый запуск берём случайные 20
      testData = shuffleArray(allTestData).slice(0, 20);
      renderQuestion();
    }

    // загрузка questions.json
    const QUESTIONS_URL = 'questions.json';
    fetch(QUESTIONS_URL)
      .then(res => res.json())
      .then(data => {
        allTestData = data;
        // тут можно разблокировать кнопку "Начать анкету", если до этого её прятали
      })
      .catch(err => {
        console.error('Ошибка загрузки questions.json', err);
        testContainer.innerHTML = '<p>Ошибка загрузки вопросов.</p>';
        startTestBtn.disabled = true;
      });

    startTestBtn.addEventListener('click', startTest);
    nextQuestionBtn.addEventListener('click', handleNextQuestion);
    checkBtn.addEventListener('click', showResults);
    restartBtn.addEventListener('click', startTest);

  });
