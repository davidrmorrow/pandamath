const questionElement = document.getElementById('question');
const answersElement = document.getElementById('answers');
const scoreElement = document.getElementById('score');
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
  hearts = 5;
  incorrectAnswers = 3;
  score = 0;
  scoreElement.innerText = 'Streak: 0';

// Apply the selected difficulty settings
const selectedOption = document.querySelector('input[name="difficulty"]:checked');
if (selectedOption) {
    updateSettings(selectedOption.value); // Apply predefined difficulty settings (easy, medium, hard)
}
else {
    console.error("No difficulty setting selected.");
}

  //updateHearts();
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
        alert(`Oops! Be sure to choose some numbers to use for ${operation} problems!`);
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

    const question = `What is ${num1} ${operation} ${num2}?`;
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
                btn.style.backgroundColor = 'lightgreen'; // Highlight the correct answer in green
            } else if (parseInt(btn.innerText) === parseInt(clickedButton.innerText)) {
                btn.style.backgroundColor = 'red'; // Highlight the clicked wrong answer in red
            } else {
                btn.style.opacity = 0; // Hide other incorrect answers
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
                btn.style.opacity = 0; // Hide incorrect answers
            } else {
                btn.style.backgroundColor = 'lightgreen'; // Highlight the correct answer
            }
        });
        checkStreakMilestone(); // Check for streak milestones
    }
    scoreElement.innerText = `Streak: ${streak}`;
    setTimeout(generateQuestion, 1000); // Move to the next question after a delay
}

function startTimer() {
    const timerElement = document.getElementById('timer-panel');

    const interval = setInterval(() => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        timerElement.innerText = `Keep practicing for ${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (timer === 0) {
            clearInterval(interval);
            showMilestoneModal('images/HappyPanda2.png', 'You\'re all done!');
        }
        timer--;
    }, 1000);
}


function updateHearts() {
    const livesContainer = document.getElementById('lives');
    livesContainer.innerHTML = ''; // Clear all existing heart images

    for (let i = 0; i < hearts; i++) {
        livesContainer.innerHTML += '<img src="images/heart.webp" alt="Full Heart" class="heart">';
    }
}

function showGameOverScreen() {
    const gameOverModal = document.createElement('div');
    gameOverModal.innerHTML = `
        <div class="game-over-container">
			<img src="images/game-over-panda.webp" alt="A Sad Panda" id="game-over-panda" />
            <h1>Game Over</h1>
            <p>Your score: ${score}</p>
            <button onclick="restartGame()">Try Again</button>
        </div>
    `;
    gameOverModal.classList.add('modal');
    document.body.appendChild(gameOverModal);
}

/*
function checkScoreMilestone() {
    const currentMilestoneIndex = Math.floor(score / milestoneIncrements); // Determine current milestone index
    if (currentMilestoneIndex > lastMilestoneReached) { // Check if new milestone reached
        if (currentMilestoneIndex < milestoneTitles.length) { // Ensure it's within bounds
            const imageName = `images/HappyPanda${currentMilestoneIndex + 1}.png`;
            const title = milestoneTitles[currentMilestoneIndex];
            showMilestoneModal(imageName, title);
            lastMilestoneReached = currentMilestoneIndex; // Update the last milestone reached
        }
    }
}

function checkScoreMilestone() {
    const currentMilestoneIndex = Math.floor(score / milestoneIncrements);
    if (currentMilestoneIndex > milestoneTitles.length) {
        // Player has exceeded the last available milestone
		const imageName = `images/HappyPanda${milestoneTitles.length}.png`;
        showMilestoneModal(imageName, 'Keep Going!');
    } else if (currentMilestoneIndex > lastMilestoneReached) {
        const imageName = `images/HappyPanda${currentMilestoneIndex}.png`;
        const title = milestoneTitles[currentMilestoneIndex - 1];
        showMilestoneModal(imageName, title);
        lastMilestoneReached = currentMilestoneIndex;
    }
}
*/

function checkStreakMilestone() {
    if (streak % milestoneIncrements == 0 ) {
        const milestoneIndex = Math.min(streak / 5, milestoneTitles.length);
        showMilestoneModal(`images/HappyPanda${milestoneIndex + 1}.png`, milestoneTitles[milestoneIndex]);
    }
}


function showMilestoneModal(image, title) {
    const milestoneModal = document.createElement('div');
    milestoneModal.innerHTML = `
        <div class="game-over-container">
            <img src="${image}" alt="Happy Panda" id="milestone-panda" />
            <h1>${title}</h1>
            <p>Streak of ${streak}!</p>
            <button onclick="closeMilestoneModal()">Continue</button>
        </div>
    `;
    milestoneModal.classList.add('modal');
    document.body.appendChild(milestoneModal);
}

function closeMilestoneModal() {
    document.querySelector('.modal').remove();
}

function restartGame() {
    document.querySelector('.modal').remove();
    score = 0;
    hearts = 6; // Resetting to 3 full hearts
    scoreElement.innerText = 'Streak: 0';
    //updateHearts();
    startGame(); // Start the game again
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





/***********************
 * INITIALIZE THE GAME *
 ***********************/

document.addEventListener('DOMContentLoaded', () => {
    loadCustomSettingsFromLocalStorage();
    //setupCustomSettingsListeners(); // Ensure listeners are attached for dynamic changes
    startGame(); // Initialize the first question
});
 
