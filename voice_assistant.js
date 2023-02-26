const chatGptKrakenBlockPosition = document.getElementById('appbar');
 
const synth = window.speechSynthesis;

synth.onvoiceschanged = setVoices;

let utterThis = new SpeechSynthesisUtterance();

const krakenGetAnswer = async(question, krakenAnswerOutput,recognition) => {
    const data = {
        model: "text-davinci-003",
        prompt: `${question}`,
        max_tokens: 200,
        temperature: 0,
    }

    
        fetch('https://api.openai.com/v1/completions', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer {OPEN_AI_API_KEY}',
            },
            body: JSON.stringify(data) 
        }).then(res => res.json())
        .then(data => {
            if(data.choices && data.choices.length > 0) {
                krakenAnswerOutput.innerText = data.choices[0].text.trim();
                speak(data.choices[0].text, recognition);  
                return data.choices[0].text.length;
            } else {
                return 'Please repeat your question again';
            }
        })
        .catch(error => console.log(error));
    
}


const speak = (words, recognition) => {
    utterThis = new SpeechSynthesisUtterance(words); 
    utterThis.voice = voices[10];
    utterThis.volume = 1;
    utterThis.rate = 0.7;
    utterThis.pitch = 1;
    utterThis.addEventListener('end', function () {
        krakenAnswerSentence = '';
        setTimeout(function () {
            recognition.start();
        }, 1000)
    })

    synth.speak(utterThis, voices);
}

const drawKrakenAssistant = () => {
    const krakenApp = document.createElement('div');
    krakenApp.setAttribute('class', 'kraken-app');

    const krakenHeader = document.createElement('div');
    const krakenQuestionInput = document.createElement("textarea");
    const krakenAnswerOutput = document.createElement("div");
     
    krakenAnswerOutput.innerText = "Ask a question, get an answer";
    krakenQuestionInput.placeholder = 'Please ask a question you need';
    krakenHeader.setAttribute('class', 'kraken-header');
    krakenQuestionInput.setAttribute('class', 'kraken-assistant-input');
    krakenAnswerOutput.setAttribute('class', 'kraken-assistant-output');
    
    krakenApp.appendChild(krakenQuestionInput);
    krakenApp.appendChild(krakenAnswerOutput);

    chatGptKrakenBlockPosition.appendChild(krakenHeader);
    chatGptKrakenBlockPosition.appendChild(krakenApp);


    return {
        krakenQuestionInput,
        krakenAnswerOutput
    }
};




const {krakenAnswerOutput, krakenQuestionInput} = drawKrakenAssistant();

krakenQuestionInput.addEventListener('input', (element) => {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight)+"px";
})

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new window.SpeechRecognition();
recognition.interimResults = true;

let krakenAnswerSentence = '';

recognition.addEventListener('result', (speechEvent) => {
    krakenAnswerSentence= [...speechEvent.results].map(result => result[0].transcript).join('');
    krakenQuestionInput.value=krakenAnswerSentence;  
});




recognition.addEventListener('end', async() => {
    if(krakenAnswerSentence.length) {
        recognition.stop();
        await krakenGetAnswer(krakenAnswerSentence, krakenAnswerOutput,recognition);
    } else  {
        krakenAnswerOutput.innerText = "What are you waiting for? Ask me another question!"; 
        recognition.start();
    }
}); 

function setVoices(){  
    voices = window.speechSynthesis.getVoices(); 
}

recognition.start();
    