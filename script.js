const questionElement = document.getElementById('question');
const answersElement = document.getElementById('answers');
const scoreElement = document.getElementById('score');
let score = 0;
let maxPossibleScore = 0;
let incorrectAnswers; // Total number of incorrect answers
let incorrectAnswersRemaining; // New variable to track remaining incorrect answers
let hearts; // Total hearts
let lastMilestoneReached; // Tracks the highest milestone reached
let milestoneIncrements; // Size of milestone increments
const milestoneTitles = [
    'Great Job!',    
    'Amazing!',      
    'Incredible!',   
    'Unstoppable!',  
	'Unbelievable!'
    // Add more titles as needed for further milestones
];


//let selectedOperations = ['+', '-', '×', '÷'];
//let minNumber = 1;
//let maxNumber = 10;

let gameSettings = {
    currentDifficulty: 'easy',
    operations: {
        '+': { enabled: true, min: 1, max: 10 },
        '-': { enabled: true, min: 1, max: 10 },
        '×': { enabled: false, min: 1, max: 10 },
        '÷': { enabled: false, min: 1, max: 10 }
    },
    customSettings: {
        '+': { enabled: true, min: 1, max: 10 },
        '-': { enabled: true, min: 1, max: 10 },
        '×': { enabled: false, min: 1, max: 10 },
        '÷': { enabled: false, min: 1, max: 10 }
    }
};

//let operationSettings = {}; // Holds min and max for each operation

function startGame() {
  // Reset game state
  // Adjust these values to change hard-coded settings
  lastMilestoneReached = 0;
  milestoneIncrements = 50;
  hearts = 5;
  incorrectAnswers = 3;
  score = 0;
  scoreElement.innerText = 'Score: 0';

  // Ensure at least one operation is selected
  //if (Object.keys(operationSettings).length === 0) {
  //  alert('Please select at least one operation.');
  //  return;
  //}

  updateHearts();
  generateQuestion();
}

function generateQuestion() {
    // Filter out disabledoperations and select a random one from those enabled
    const enabledOperations = Object.keys(gameSettings.operations).filter(op => gameSettings.operations[op].enabled);
    const operation = enabledOperations[Math.floor(Math.random() * enabledOperations.length)];

    // Get the min and max range for the selected operation
    const min = gameSettings.operations[operation].min;
    const max = gameSettings.operations[operation].max;

    let num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    let num2 = Math.floor(Math.random() * (max - min + 1)) + min;

    let correctAnswer;
    switch (operation) {
        case '+':
            correctAnswer = num1 + num2;
            break;
        case '-':
		    // Ensure num1 is always greater than or equal to num2 for subtraction
			if (num1 < num2) {
			  [num1, num2] = [num2, num1]; // Swap num1 and num2 if num1 is smaller than num2
			}
            correctAnswer = num1 - num2;
            break;
        case '×':
            correctAnswer = num1 * num2;
            break;
        case '÷':
			// Ensuring integer division
		    num2 = num1 !== 0 ? num2 : 2; // Avoid division by zero -- default to 2 instead
		    correctAnswer = Math.floor(num1 / num2); // Ensure result is an integer
		    num1 = correctAnswer * num2; // Adjust so division is clean
            break;
        default:
			console.error("Unknown mathematical operation requested: " + operation);
            generateQuestion();  // Generate a new question if the operation is unknown
            return;    }

    const question = `What is ${num1} ${operation} ${num2}?`;
	questionElement.innerText = question;
    console.log(question); // Output the question to the console for now
  
  maxPossibleScore += 4;  

  generateAnswers(correctAnswer);
}

function generateAnswers(correctAnswer) {
    answersElement.innerHTML = ''; // Clear previous answers

    const correctPosition = Math.floor(Math.random() * (incorrectAnswers + 1)); // Position for the correct answer among all possibilities
	let answers = new Set([correctAnswer]); // Ensure all answers are unique
    for (let i = 0; i < incorrectAnswers + 1; i++) {
        const button = document.createElement('button');
        let answerValue = i == correctPosition ? correctAnswer : generateAnswerValue(i, correctAnswer, answers);
        button.innerText = answerValue;
        button.addEventListener('click', function() {
            checkAnswer(this, correctAnswer);
        });
        answersElement.appendChild(button);
    }
	
	incorrectAnswersRemaining = incorrectAnswers;
}

function generateAnswerValue(index, correctAnswer, answers) {
	let incorrectAnswer;
	do {
		if ( correctAnswer < 10 ) {
			incorrectAnswer = correctAnswer + Math.floor((Math.random() * 10 )) - 5;
		}
		else {
			const offset = Math.floor(Math.random() * (correctAnswer * 0.25 + 1)); // Max 25% of correctAnswer
			incorrectAnswer = correctAnswer + (Math.random() < 0.5 ? -offset : offset); // Adjust up or down
		}
		// Only return positive values
		if (incorrectAnswer < 0) incorrectAnswer = Math.abs(incorrectAnswer);
	} while (answers.has(incorrectAnswer));
	answers.add(incorrectAnswer);
	return incorrectAnswer;
}


function checkAnswer(clickedButton, correctAnswer) {
    const isCorrect = parseInt(clickedButton.innerText) === correctAnswer;
    const buttons = answersElement.querySelectorAll('button');
    buttons.forEach(btn => {
        if (parseInt(btn.innerText) !== correctAnswer) {
            btn.style.display = 'none'; // Hide incorrect answers
        } else {
            btn.style.backgroundColor = 'lightgreen'; // Highlight the correct answer
        }
    });

    if (!isCorrect) {
        hearts -= 1;
        updateHearts();
        if (hearts === 0) {
            showGameOverScreen();
        } else {
            setTimeout(generateQuestion, 1000); // Wait for 1 second before moving to the next question
        }
    } else {
        score += incorrectAnswersRemaining; // Adjust score calculation if needed
        scoreElement.innerText = `Score: ${score}`;
		checkScoreMilestone(); // Check for milestones after updating the score
        setTimeout(generateQuestion, 1000); // Move to the next question after a brief pause
    }
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


function showMilestoneModal(image, title) {
    const milestoneModal = document.createElement('div');
    milestoneModal.innerHTML = `
        <div class="game-over-container">
            <img src="${image}" alt="Happy Panda" id="milestone-panda" />
            <h1>${title}</h1>
            <p>Your score: ${score}</p>
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
    scoreElement.innerText = 'Score: 0';
    updateHearts();
    startGame(); // Start the game again
}

/**********************
 * CONTROL PANEL CODE *
 **********************/

function updateSettings(difficulty) {
    if (difficulty !== 'custom') {
        gameSettings.currentDifficulty = difficulty;
        switch (difficulty) {
            case "easy":
                updateOperationSettings(true, true, false, false, 1, 10, 1, 10);
                break;
            case "medium":
                updateOperationSettings(true, true, true, true, 1, 10, 1, 10);
                break;
            case "hard":
                updateOperationSettings(true, true, true, true, 1, 99, 1, 12);
                break;
        }
    } else {
        //restoreCustomSettings();
    }
    //updateFormUI();
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
}

document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
    radio.addEventListener('change', function() {
		const customSettings = document.getElementById('custom-settings');
        updateSettings(this.value);
        if (this.value === 'custom') {
            customSettings.style.display = 'block';
        } else {
            customSettings.style.display = 'none';
        }
    });
});



/***********************
 * INITIALIZE THE GAME *
 ***********************/

startGame(); // Initialize the first question
