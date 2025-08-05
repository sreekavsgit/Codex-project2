const gridEl = document.getElementById('grid');
const formEl = document.getElementById('word-form');
const inputEl = document.getElementById('word-input');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const timerEl = document.getElementById('timer');
const wordListEl = document.getElementById('word-list');
const restartBtn = document.getElementById('restart');
const submitBtn = document.getElementById('submit-word');
const themeToggle = document.getElementById('theme-toggle');
const successSound = document.getElementById('success-sound');
const failSound = document.getElementById('fail-sound');

let gridLetters = [];
let usedWords = new Set();
let score = 0;
let timeLeft = 60;
let timerId = null;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
highScoreEl.textContent = highScore;

function generateGrid() {
  gridEl.innerHTML = '';
  gridLetters = [];
  
  // Make sure we have at least one vowel
  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const vowelPosition = Math.floor(Math.random() * 16);
  
  // Common letters appear more frequently
  const commonLetters = 'ETAOINSHRDLUMWBFGYPVKJXQZ';
  const commonLetterWeights = [12,9,8,8,7,7,6,6,6,4,4,3,3,2,2,2,2,2,1,1,1,1,1,1];
  
  for (let i = 0; i < 16; i++) {
    let letter;
    if (i === vowelPosition) {
      // Guarantee a vowel
      letter = vowels[Math.floor(Math.random() * vowels.length)];
    } else {
      // Use weighted random for other positions
      const randWeight = Math.floor(Math.random() * commonLetterWeights.reduce((a,b) => a+b));
      let sum = 0;
      for (let j = 0; j < commonLetterWeights.length; j++) {
        sum += commonLetterWeights[j];
        if (randWeight < sum) {
          letter = commonLetters[j];
          break;
        }
      }
    }
    
    gridLetters.push(letter);
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.textContent = letter;
    tile.addEventListener('click', function() {
      if (!inputEl.disabled) {
        const currentValue = inputEl.value;
        const newValue = currentValue + letter;
        // Always add the letter to input box
        inputEl.value = newValue;
        inputEl.focus();
        // Play error sound only if the word becomes invalid
        if (!validateLettersUsed(newValue)) {
          failSound.currentTime = 0;
          failSound.play();
        }
      }
    });
    gridEl.appendChild(tile);
  }
}

function startGame() {
  score = 0;
  usedWords.clear();
  wordListEl.innerHTML = '';
  scoreEl.textContent = score;
  inputEl.value = '';
  inputEl.disabled = false;
  submitBtn.disabled = false;
  timeLeft = 60;
  timerEl.textContent = timeLeft;
  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
  generateGrid();
  inputEl.focus();
}

function endGame() {
  clearInterval(timerId);
  inputEl.disabled = true;
  submitBtn.disabled = true;
  const words = Array.from(usedWords);
  alert(`Time's up!\nScore: ${score}\nWords: ${words.join(', ')}`);
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
    highScoreEl.textContent = highScore;
  }
}

// Helper function to validate if a partial word can be made with grid letters
function validateLettersUsed(word) {
  const gridCounts = {};
  gridLetters.forEach(l => (gridCounts[l] = (gridCounts[l] || 0) + 1));
  const wordCounts = {};
  for (const char of word.toUpperCase()) {
    if (!gridCounts[char]) return false;
    wordCounts[char] = (wordCounts[char] || 0) + 1;
    if (wordCounts[char] > gridCounts[char]) return false;
  }
  return true;
}

function validateWord(word) {
  if (word.length < 3) return false;
  if (usedWords.has(word)) return false;
  
  // Check if word uses valid grid letters
  if (!validateLettersUsed(word)) return false;
  
  // Require at least one vowel in the word
  const hasVowel = /[AEIOU]/.test(word);
  if (!hasVowel) return false;
  
  return true;
}

function submitWord() {
  const word = inputEl.value.trim().toUpperCase();
  if (!word) return;
  if (validateWord(word)) {
    usedWords.add(word);
    score += word.length;
    scoreEl.textContent = score;
    const li = document.createElement('li');
    li.textContent = word;
    wordListEl.appendChild(li);
    successSound.currentTime = 0;
    successSound.play();
    inputEl.value = '';
  } else {
    failSound.currentTime = 0;
    failSound.play();
    inputEl.classList.add('invalid');
    // Prevent input during animation
    inputEl.disabled = true;
    setTimeout(() => {
      inputEl.classList.remove('invalid');
      inputEl.disabled = false;
      inputEl.value = '';
      inputEl.focus();
    }, 600); // Matches animation duration
  }
}


formEl.addEventListener('submit', e => {
  e.preventDefault();
  submitWord();
});
restartBtn.addEventListener('click', startGame);
wordListEl.addEventListener('click', e => {
  if (e.target.tagName === 'LI') {
    inputEl.value = e.target.textContent;
    inputEl.focus();
  }
});

inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    submitWord();
  }
});
submitBtn.addEventListener('click', submitWord);
function handleInput(e) {
  if (e.key === 'Enter') {
    const word = inputEl.value.trim().toUpperCase();
    if (validateWord(word)) {
      usedWords.add(word);
      score += word.length;
      scoreEl.textContent = score;
      const li = document.createElement('li');
      li.textContent = word;
      wordListEl.appendChild(li);
      successSound.currentTime = 0;
      successSound.play();
    } else {
      failSound.currentTime = 0;
      failSound.play();
    }
    inputEl.value = '';
  }
}

inputEl.addEventListener('keydown', handleInput);
//*restartBtn.addEventListener('click', startGame);

function applyTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
});

window.addEventListener('load', startGame);
// Enable clicking a word in the list to populate the input box
wordListEl.addEventListener('click', function(e) {
  if (e.target && e.target.nodeName === 'LI') {
    inputEl.value = e.target.textContent;
    inputEl.focus();
  }
});
