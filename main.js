let inputPDF = document.getElementById('inputPDF');
let startButton = document.getElementById('startButton');
let pauseButton = document.getElementById('pauseButton');
let wordDisplay = document.getElementById('wordDisplay');
let wordCount = document.getElementById('wordCount');
let speedSelect = document.getElementById('speedSelect');
let backButton = document.getElementById('voltar');
let forwardButton = document.getElementById('avancar');


let pdfDoc = null;
let words = [];
let currentWordIndex = 0;
let timer = null;
let paused = false;

function saveProgress() {
    localStorage.setItem('words', JSON.stringify(words));
    localStorage.setItem('currentWordIndex', currentWordIndex);
}

function checkSavedText() {
    const savedWords = localStorage.getItem('words');
    const savedCurrentWordIndex = localStorage.getItem('currentWordIndex');

    if (savedWords) {
        words = JSON.parse(savedWords);
    }
    if (savedCurrentWordIndex) {
        currentWordIndex = parseInt(savedCurrentWordIndex);
    }

    if (words.length > 0) {
        wordCount.textContent = `Palavras mostradas: ${currentWordIndex + 1} de ${words.length}`;
        startButton.style.display = 'inline';
    }
}

inputPDF.addEventListener('change', function (event) {
    let file = event.target.files[0];
    if (file.type === 'application/pdf') {
        let fileReader = new FileReader();
        fileReader.onload = function (event) {
            let typedArray = new Uint8Array(event.target.result);
            pdfjsLib.getDocument(typedArray).promise.then(function (doc) {
                pdfDoc = doc;
                startButton.style.display = 'inline';
            });
        };
        fileReader.readAsArrayBuffer(file);
    }
});

startButton.addEventListener('click', function () {
    if (pdfDoc) {
        startButton.style.display = 'none';
        pauseButton.style.display = 'inline';
        paused = false;
        displayWords();
    }
});

pauseButton.addEventListener('click', function () {
    pauseButton.style.display = 'none';
    startButton.style.display = 'inline';
    paused = true;
    if (timer) {
        clearTimeout(timer);
    }
    saveProgress();
});

checkSavedText();

async function displayWords() {
    if (!words.length) {
        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            let page = await pdfDoc.getPage(pageNum);
            let textContent = await page.getTextContent();
            textContent.items.forEach(function (item) {
                words = words.concat(item.str.split(' '));
            });
        }
    }

    function showNextWord() {
        if (currentWordIndex < words.length && !paused) {
            let currentWord = words[currentWordIndex];
            let wordLength = currentWord.length;
    
            let firstHalf = currentWord.slice(0, Math.floor(wordLength / 2));
            let secondHalf = currentWord.slice(Math.floor(wordLength / 2) + 1);
            let middleLetter = currentWord.slice(Math.floor(wordLength / 2), Math.floor(wordLength / 2) + 1);
    
            wordDisplay.innerHTML = `<div class="textoPDF">
                <div class="div1">${firstHalf}</div><span style='color: red;'>${middleLetter}</span><div class="div2">${secondHalf}</div>
                </div class="textoPDF">
            `;
            wordDisplay.style.color = "black";
    
            wordCount.textContent = `Palavras mostradas: ${currentWordIndex + 1} de ${words.length}`;
            currentWordIndex++;
    
            let wordsPerMinute = parseInt(speedSelect.value);
            let interval = 60000 / wordsPerMinute;
            timer = setTimeout(showNextWord, interval);
            
        }
    }
    

    showNextWord();
}

backButton.addEventListener('click', function () {
    // Verificar se a posição atual é maior que 10, caso contrário, voltar para o início
    if (currentWordIndex > 10) {
        currentWordIndex -= 10;
    } else {
        currentWordIndex = 0;
    }
    wordCount.textContent = `Palavras mostradas: ${currentWordIndex + 1} de ${words.length}`;
    saveProgress();
});



forwardButton.addEventListener('click', function () {
    // Verificar se a posição atual é menor que o tamanho total das palavras - 10, caso contrário, ir para o final
    if (currentWordIndex < words.length - 10) {
        currentWordIndex += 10;
    } else {
        currentWordIndex = words.length - 1;
    }
    wordCount.textContent = `Palavras mostradas: ${currentWordIndex + 1} de ${words.length}`;
    saveProgress();
});
