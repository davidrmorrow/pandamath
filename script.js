// Copyright 2024 David Grober-Morrow

const questionElement = document.getElementById('question');
const answersElement = document.getElementById('answers');
const scoreElement = document.getElementById('streak-num');
let score = 0;
let maxPossibleScore = 0;
let streak = 0; // Total number of answers 
let incorrectAnswers; // Total number of incorrect answers
let incorrectAnswersRemaining; // New variable to track remaining incorrect answers
let hearts; // Total hearts
let lastMilestoneReached; // Tracks the highest milestone reached
let milestoneIncrements; // Size of milestone increments
const milestoneTitles = [
    'Great job!',    
    'Way to go!',      
    'Incredible!',   
    'Keep going!',
    'Unstoppable!',  
	'Unbelievable!',
    'You\'re on fire!',
    //'Amazing!',
    //'Brilliant!',
    //'You rock!',
    //'You\'re a star!',
    // Add more titles as needed for further milestones
];
let timer = 5 * 60; // 5 minutes in seconds
let lang = 'en';
const translations = {
    en: {
        'start-button': 'Start',
        'question-prompt': 'What is',
        'difficulty-label': 'Choose Difficulty:',
        'easy-label': 'Easy',
        'medium-label': 'Medium',
        'hard-label': 'Hard',
        'custom-label': 'Custom',
        'custom-settings-header': 'Custom Settings:',
        'remember-settings-label': 'Remember settings on this device',
        'remember-settings-info': 'Your settings will be saved on this device. They will not be shared with anyone.',
        'timer-label': 'Keep practicing for',
        'timer-length-label': 'Timer Length in Minutes:',
        'addition-label': 'Addition (+)',
        'subtraction-label': 'Subtraction (-)',
        'multiplication-label': 'Multiplication (×)',
        'multiplication-setting-annotation': 'Include multiplication problems that start with these numbers.',
        'division-label': 'Division (÷)',
        'division-setting-annotation': 'Include problems that divide a bigger number by these numbers.',
        'choose-integers-warning-multiplication': 'Oops! Be sure to choose some numbers to use for multiplication problems!',
        'choose-integers-warning-division': 'Oops! Be sure to choose some numbers to use for division problems!',
        'apply-settings-button': 'Apply Settings',
        'streak-label': 'Streak',
        'milestone-streak-message': 'Streak of',
        'continue-button': 'Continue',
        'timer-finished': 'You\'re All Done!',
        'milestone-titles': [   'Great job!',    
                                'Way to go!',      
                                'Incredible!',   
                                'Keep going!',
                                'Unstoppable!',  
                                'Unbelievable!',
                                'You\'re on fire!']
    },
    es: {
        'start-button': 'Comenzar',
        'question-prompt': '¿Cuanto es',
        'difficulty-label': 'Elige Dificultad:',
        'easy-label': 'Fácil',
        'medium-label': 'Intermedio',
        'hard-label': 'Difícil',
        'custom-label': 'Personalizado',
        'custom-settings-header': 'Configuraciones Personalizadas:',
        'remember-settings-label': 'Recordar la configuración en este dispositivo',
        'remember-settings-info': 'Su configuración se guardará en este dispositivo y no se compartirá con nadie.',
        'timer-label': 'Sigue practicando por',
        'timer-length-label': 'Duración del Temporizador en Minutos:',
        'addition-label': 'Suma (+)',
        'subtraction-label': 'Resta (-)',
        'multiplication-label': 'Multiplicación (×)',
        'multiplication-setting-annotation': 'Incluya problemas de multiplicación que comiencen con estos números.',
        'division-label': 'División (÷)',
        'division-setting-annotation': 'Incluya problemas que dividan un número mayor por estos números.',
        'choose-integers-warning-multiplication': '¡Ups! ¡Asegúrate de elegir algunos números para usar en los problemas de multiplicación!',
        'choose-integers-warning-division': '¡Ups! ¡Asegúrate de elegir algunos números para usar en los problemas de división!',
        'apply-settings-button': 'Aplicar Configuración',
        'streak-label': 'Racha',
        'milestone-streak-message': 'Racha de',
        'continue-button': 'Continuar',
        'timer-finished': '¡Ya estás!',
        'milestone-titles': [   '¡Buen trabajo!',    
                                '¡Bien hecho!',      
                                '¡Increíble!',   
                                '¡Asombroso!',
                                '¡Imparable!',  
                                '¡Brillante!',
                                '¡Fuego!']
    }
};


let gameSettings = {
    currentDifficulty: 'custom',
    operations: {
        '+': { enabled: false, min: 1, max: 99 },
        '-': { enabled: false, min: 1, max: 99 },
        '×': { enabled: true, min: 1, max: 10 },
        '÷': { enabled: true, min: 1, max: 10 }
    }
};

function startGame() {
  // Reset game state
  // Adjust these values to change hard-coded settings
  lastMilestoneReached = 0;
  milestoneIncrements = 5;
  incorrectAnswers = 3;
  document.getElementById('score').style.display = 'block';
  scoreElement.innerText = '0';

// Apply the selected difficulty settings
const selectedOption = document.querySelector('input[name="difficulty"]:checked');
if (selectedOption) {
    updateSettings(selectedOption.value); // Apply predefined difficulty settings (easy, medium, hard)
}
else {
    console.error("No difficulty setting selected.");
}
  startTimer();
  generateQuestion();
}

function generateQuestion() {
    // Filter out disabled operations
    const enabledOperations = Object.keys(gameSettings.operations).filter(op => gameSettings.operations[op].enabled);
    if (enabledOperations.length === 0) {
        console.error("No operations enabled. Please enable at least one operation.");
        return;
    }

    // Randomly select an operation
    const operation = enabledOperations[Math.floor(Math.random() * enabledOperations.length)];
    const selectedIntegers = gameSettings.operations[operation].selectedIntegers;

    // Validate selectedIntegers
    if (!Array.isArray(selectedIntegers) || selectedIntegers.length === 0) {
        console.error(`No integers were selected for ${operation}`, selectedIntegers);
        
        const warning = operation == '×' ? translations[lang]['choose-integers-warning-multiplication'] : translations[lang]['choose-integers-warning-division'];
        alert(warning);
        return;
    }
    
    let num1, num2, correctAnswer;

    switch (operation) {
        case '+': // Addition
            num1 = _getRandomElement(selectedIntegers);
            num2 = _getRandomElement(selectedIntegers);
            correctAnswer = num1 + num2;
            break;

        case '-': // Subtraction
            num1 = _getRandomElement(selectedIntegers);
            num2 = _getRandomElement(selectedIntegers);
            if (num1 < num2) [num1, num2] = [num2, num1]; // Ensure num1 >= num2
            correctAnswer = num1 - num2;
            break;

        case '×': // Multiplication
            num1 = _getRandomElement(selectedIntegers);
            num2 = _getRandomNumber(1, 10); // Multiply with numbers 1–10
            correctAnswer = num1 * num2;
            break;

        case '÷': // Division
            num2 = _getRandomElement(selectedIntegers); // Divisor
            num1 = num2 * _getRandomNumber(1, 10); // Ensure integer division
            correctAnswer = num1 / num2;
            break;

        default:
            console.error("Unknown operation:", operation);
            generateQuestion(); // Retry if the operation is invalid
            return;
    }

    const question = translations[lang]['question-prompt'] + ` ${num1} ${operation} ${num2}?`;
    questionElement.innerText = question;
    console.log(question); // Log the question for debugging purposes

    generateAnswers(num1, num2, correctAnswer, operation);
}

    function _getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function _getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateAnswers(num1, num2, correctAnswer, operation) {
        answersElement.innerHTML = ''; // Clear previous answers
    
        const correctPosition = Math.floor(Math.random() * (incorrectAnswers + 1)); // Position for the correct answer
        let answers = new Set([correctAnswer]); // Ensure all answers are unique
    
        for (let i = 0; i < incorrectAnswers + 1; i++) {
            const button = document.createElement('button');
            let answerValue =
                i === correctPosition
                    ? correctAnswer
                    : generateAnswerValue(num1, num2, correctAnswer, answers, operation);
            button.innerText = answerValue;
            button.classList = 'answerButton';
            button.addEventListener('click', function () {
                checkAnswer(this, correctAnswer);
            });
            answersElement.appendChild(button);
        }
    
        incorrectAnswersRemaining = incorrectAnswers;
    }
    
    

    function generateAnswerValue(num1, num2, correctAnswer, answers, operation) {
        let incorrectAnswer = 0;
    
        do {
            if (operation === '+' || operation === '-') {
                // Addition and subtraction: Generate close values
                if (correctAnswer < 10) {
                    incorrectAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5;
                } else {
                    const offset = Math.floor(Math.random() * (correctAnswer * 0.25 + 1)); // Max 25% of correctAnswer
                    incorrectAnswer = correctAnswer + (Math.random() < 0.5 ? -offset : offset); // Adjust up or down
                }
            } else if (operation === '×') {
                // Multiplication: Generate nearby products
                const adjustment = (Math.random() > 0.5 ? 1 : -1)       // Choose plus or minus randomly
                                   * (Math.floor(Math.random()*3 + 1)); // Choose 1, 2, or 3 randomly
                incorrectAnswer = Math.random() < 0.5
                    ? (num1 + adjustment) * num2 // Slight variation in num1
                    : num1 * (num2 + adjustment); // Slight variation in num2
                
                // Avoid offering 0 as a distractor answer for multiplication
                if ( incorrectAnswer === 0 ) incorrectAnswer = Math.round(correctAnswer * 0.67);
            } else if (operation === '÷') {
                // Division: Generate plausible distractor answers
                const adjustment = (Math.random() < 0.5 ? -1 : 1)          // Choose plus or minus randomly
                                    * Math.floor(Math.random() * 3 + 1);   // Choose 1, 2, or 3 randomly
                incorrectAnswer = correctAnswer + ( num2 * adjustment);

                // Avoid offering distractors that are larger that than the dividend 
                if ( incorrectAnswer > num1 ) incorrectAnswer -= correctAnswer; 
            }
    
            // Ensure the answer is unique and positive
            if (incorrectAnswer < 0) incorrectAnswer = Math.abs(incorrectAnswer);
        } while (answers.has(incorrectAnswer) || incorrectAnswer === correctAnswer);
    
        answers.add(incorrectAnswer);
        return incorrectAnswer;
    }
    
    


function checkAnswer(clickedButton, correctAnswer) {
    const isCorrect = parseInt(clickedButton.innerText) === correctAnswer;
    const buttons = answersElement.querySelectorAll('button');

    if (!isCorrect) {
        streak = 0; // Reset the streak if the answer is incorrect
        buttons.forEach(btn => {
            if (parseInt(btn.innerText) === correctAnswer) {
                btn.classList.add('correct'); // Highlight the correct answer in green
            } else if (parseInt(btn.innerText) === parseInt(clickedButton.innerText)) {
                btn.classList.add('incorrect'); // Highlight the clicked wrong answer in red
            } else {
                btn.classList.add('invisible'); // Hide other incorrect answers
            }
        });
        // Uncomment the following lines if you decide to handle hearts and game over
        // hearts -= 1;
        // updateHearts();
        // if (hearts === 0) {
        //     showGameOverScreen();
        // } else {
        //     setTimeout(generateQuestion, 1000); // Wait for 1 second before moving to the next question
        // }
    } else {
        streak++;
        buttons.forEach(btn => {
            if (parseInt(btn.innerText) !== correctAnswer) {
                btn.classList.add('invisible'); // Hide incorrect answers
            } else {
                btn.classList.add('correct'); // Highlight the correct answer
            }
        });
        checkStreakMilestone(); // Check for streak milestones
    }
    scoreElement.innerText = `${streak}`; // Update streak length
    setTimeout(generateQuestion, 1000); // Move to the next question after a delay
}

function startTimer() {
    const timerElement = document.getElementById('timer-panel');
    timerElement.style.display = 'block'; // Show timer panel

    const interval = setInterval(() => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        timerElement.innerText = translations[lang]['timer-label'] + ` ${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (timer === 0) {
            clearInterval(interval);
            showMilestoneModal('images/HappyPanda2.png', translations[lang]['timer-finished']);
        }
        timer--;
    }, 1000);
}

function checkStreakMilestone() {
    if (streak % milestoneIncrements == 0 ) {
        const milestoneIndex = Math.min(streak / 5, translations[lang]['milestone-titles'].length);
        showMilestoneModal(`images/HappyPanda${milestoneIndex + 1}.png`, translations[lang]['milestone-titles'][milestoneIndex]);
    }
}

function showMilestoneModal(image, title) {
    const milestoneModal = document.createElement('div');
    milestoneModal.innerHTML = `
        <div class="game-over-container">
            <img src="${image}" alt="Happy Panda" id="milestone-panda" />
            <h1>${title}</h1>
            <p>${translations[lang]['milestone-streak-message']} ${streak}!</p>
            <button onclick="closeMilestoneModal()">${translations[lang]['continue-button']}</button>
        </div>
    `;
    milestoneModal.classList.add('modal');
    document.body.appendChild(milestoneModal);
}

function closeMilestoneModal() {
    document.querySelector('.modal').remove();
}

/**********************
 * CONTROL PANEL CODE *
 **********************/

function updateSettings(difficulty) {
    if (difficulty === 'custom') {
        restoreCustomSettings(); // Use the custom settings logic already provided
    } else {
        // Set predefined settings based on the selected difficulty
        switch (difficulty) {
            case 'easy':
                // Simple problems with small numbers
                gameSettings.operations['+'] = { enabled: true, selectedIntegers: [1, 2, 3, 4, 5] };
                gameSettings.operations['-'] = { enabled: true, selectedIntegers: [1, 2, 3, 4, 5] };
                gameSettings.operations['×'] = { enabled: false, selectedIntegers: [] }; // Disable multiplication
                gameSettings.operations['÷'] = { enabled: false, selectedIntegers: [] }; // Disable division
                break;

            case 'medium':
                // Add multiplication and division with broader ranges
                gameSettings.operations['+'] = { enabled: true, selectedIntegers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };
                gameSettings.operations['-'] = { enabled: true, selectedIntegers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };
                gameSettings.operations['×'] = { enabled: true, selectedIntegers: [1, 2, 3, 4, 5] }; // Multiples of 1–5
                gameSettings.operations['÷'] = { enabled: true, selectedIntegers: [1, 2, 3, 4, 5] }; // Divisors 1–5
                break;

            case 'hard':
                // All operations with wide ranges
                gameSettings.operations['+'] = { enabled: true, selectedIntegers: _generateRange(1, 49) };
                gameSettings.operations['-'] = { enabled: true, selectedIntegers: _generateRange(1, 49) };
                gameSettings.operations['×'] = { enabled: true, selectedIntegers: _generateRange(2, 10) }; // Multiples of 2–10
                gameSettings.operations['÷'] = { enabled: true, selectedIntegers: _generateRange(2, 10) }; // Divisors 2–10
                break;

            default:
                console.error(`Unknown difficulty: ${difficulty}`);
        }
    }

    console.log("Updated game settings:", gameSettings);
    saveCustomSettingsToLocalStorage(); // Save settings, if needed
    generateQuestion();
}

    function _generateRange(start, end) {
        const range = [];
        for (let i = start; i <= end; i++) {
            range.push(i);
        }
        return range;
    }



function updateOperationSettings(add, subtract, multiply, divide, minAddSub, maxAddSub, minMulDiv, maxMulDiv) {
    gameSettings.operations['+'].enabled = add;
    gameSettings.operations['-'].enabled = subtract;
    gameSettings.operations['×'].enabled = multiply;
    gameSettings.operations['÷'].enabled = divide;
    gameSettings.operations['+'].min = minAddSub;
    gameSettings.operations['-'].min = minAddSub;
    gameSettings.operations['×'].min = minMulDiv;
    gameSettings.operations['÷'].min = minMulDiv;
    gameSettings.operations['+'].max = maxAddSub;
    gameSettings.operations['-'].max = maxAddSub;
    gameSettings.operations['×'].max = maxMulDiv;
    gameSettings.operations['÷'].max = maxMulDiv;

    console.log("Updated game settings:", gameSettings);
}

function restoreCustomSettings() {

    // Set timer length
    const timerInput = document.getElementById('timer-length');
    timer = parseInt(timerInput.value, 10) * 60; // Convert minutes to seconds
 
    document.querySelectorAll('.operation').forEach(operationBlock => {
        const operation = operationBlock.getAttribute('data-operation');
        const checkbox = operationBlock.querySelector('input[type="checkbox"]');

        // Check if the operation is enabled
        gameSettings.operations[operation].enabled = checkbox.checked;

        if (operation === '+' || operation === '-') {
            // Handle addition and subtraction with min/max input boxes
            const minInput = operationBlock.querySelector('input[type="number"][id$="min"]');
            const maxInput = operationBlock.querySelector('input[type="number"][id$="max"]');

            let min = parseInt(minInput.value, 10);
            let max = parseInt(maxInput.value, 10);

            if (min > max) {
                alert("The minimum allowable number for " + operation + " can't be less than the minimum.");
                max = min + 1; // Gracefully reset max to be one more than min
                maxInput.value = max; // Update the input field
            }

            gameSettings.operations[operation].selectedIntegers = checkbox.checked ? _generateRange(min, max) : [];
        } else if (operation === '×' || operation === '÷') {

            // Handle multiplication and division with chip-based inputs
            const chips = operationBlock.querySelectorAll('.chip.selected');
            gameSettings.operations[operation].selectedIntegers = checkbox.checked
                ? Array.from(chips).map(chip => parseInt(chip.getAttribute('data-value'), 10))
                : [];
            //if (!checkbox.checked && gameSettings.operations[operation].selectedIntegers == []) {
            //    alert("To include " + operation + " problems, be sure to select at least one number.");
            //    checkbox.checked = false;
            //}
        }
    });

    //saveCustomSettingsToLocalStorage(); // Any reason to do this here?

    console.log('Updated custom game settings:', gameSettings);
}

document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
    radio.addEventListener('change', function() {
		const customSettings = document.getElementById('custom-settings');
        updateSettings(this.value);
        if (this.value == 'custom') {
            customSettings.style.display = 'block';
        } else {
            customSettings.style.display = 'none';
        }
    });
});

document.querySelectorAll('.operation').forEach(operationBlock => {
    const checkbox = operationBlock.querySelector('input[type="checkbox"]');
    const chips = operationBlock.querySelectorAll('.chip');
    
    // Toggle chips when clicked
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            if (!checkbox.checked) return; // Ignore clicks if the operation is disabled
            chip.classList.toggle('selected');
        });
    });

    // Enable/disable chips when the operation checkbox is toggled
    checkbox.addEventListener('change', () => {
        const isEnabled = checkbox.checked;
        chips.forEach(chip => {
            chip.disabled = !isEnabled; // Disable chips if the operation is unchecked
        });
    });
});

// Example: Call restoreCustomSettings() when "Apply" is clicked
document.getElementById('apply-settings-button').addEventListener('click', restoreCustomSettings);


// Attach an event listener to the "Remember my settings" checkbox
document.getElementById('remember-settings-checkbox').addEventListener('change', function () {
    if (this.checked) {
        // Save settings when the checkbox is checked
        saveCustomSettingsToLocalStorage();
        document.getElementById('remember-settings-info').style.display = 'block';
    } else {
        // Erase settings when the checkbox is unchecked
        localStorage.removeItem('customGameSettings');
        console.log('Custom settings removed from local storage.');
        document.getElementById('remember-settings-info').style.display = 'none';
    }
});

// Save custom settings to local storage, but only if the save settings box is checked
function saveCustomSettingsToLocalStorage() {
    if (document.getElementById('remember-settings-checkbox').checked) {
        localStorage.setItem('customGameSettings', JSON.stringify(gameSettings.operations));
        console.log('Custom settings saved:', gameSettings.operations);
    } 
}



function loadCustomSettingsFromLocalStorage() {
    const savedSettings = localStorage.getItem('customGameSettings');
    if (savedSettings) {
        const operations = JSON.parse(savedSettings);

        // Restore settings for each operation
        Object.keys(operations).forEach(operation => {
            const operationBlock = document.querySelector(`.operation[data-operation="${operation}"]`);
            if (!operationBlock) return;

            const checkbox = operationBlock.querySelector('input[type="checkbox"]');
            const minInput = operationBlock.querySelector('input[type="number"][id$="min"]');
            const maxInput = operationBlock.querySelector('input[type="number"][id$="max"]');
            const chips = operationBlock.querySelectorAll('.chip');

            // Restore checkbox
            checkbox.checked = operations[operation].enabled;

            // Restore range inputs for addition/subtraction
            if (minInput && maxInput) {
                minInput.value = operations[operation].selectedIntegers[0] || 1;
                maxInput.value = operations[operation].selectedIntegers.slice(-1)[0] || 10;
            }

            // Restore selected chips for multiplication/division
            if (chips) {
                chips.forEach(chip => {
                    const value = parseInt(chip.getAttribute('data-value'), 10);
                    chip.classList.toggle('selected', operations[operation].selectedIntegers.includes(value));
                });
            }
        });

        console.log('Custom settings loaded:', operations);
    }
}

/****************
 * LOCALIZATION *
 ****************/

document.getElementById('lang-eng').addEventListener('click', (e) => {
    e.preventDefault();
    switchLanguage('en');
});

document.getElementById('lang-esp').addEventListener('click', (e) => {
    e.preventDefault();
    switchLanguage('es');
});

function switchLanguage(newLang) {
    lang = newLang;
    console.log('Switching language to ' + lang);
    updateLanguage(lang);
    //localStorage.setItem('language', lang); // Save the selected language
}

function updateLanguage() {

    if (lang != 'en' && lang != 'es' ) {
        lang = 'en';
        console.error('Unknown language detected for localization. Defaulting to English.');
    }
    const otherLang = lang == 'en' ? 'es' : 'en';
    const elements = translations[lang];

    // Dynamically update elements
    for (const [id, text] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.innerText = text; // Update the element's text content
        }
    }

    // Update question prompt
    questionElement.innerText = questionElement.innerText.replace(translations[otherLang]['question-prompt'], translations[lang]['question-prompt']);
}


/***********************
 * INITIALIZE THE GAME *
 ***********************/

document.addEventListener('DOMContentLoaded', () => {
    loadCustomSettingsFromLocalStorage();
    updateLanguage();
    //setupCustomSettingsListeners(); // Ensure listeners are attached for dynamic changes

    // Add click event to the Start button
    document.getElementById('start-button').addEventListener('click', function () {
        startGame(); // Start the game logic
        startTimer(); // Start the timer
    });
});
 
