import {pagesTexts} from "./data.js"

const totalUnit = 8; 
const synth = window.speechSynthesis;
const voiceSelect = document.getElementById("voice-select");
const rateSelect = document.getElementById("rate-select");
const translateCheckbox = document.getElementById("translate-checkbox")
const textImg = document.getElementById("text-image")

let englishVoices = [];

const p = new URLSearchParams(location.search);

const grade = p.get("grade");
const semester = p.get("semester");
const unit = p.get("unit");


// ---------- Initialization ----------
// 1. Load the unit bar for current grade and semester
if (!grade || !semester) {
  document.body.innerHTML = "<p>请从首页选择年级和学期进入</p>";
  throw new Error("Missing grade or semester");
}

let unitNavHtml = ""
for (let i = 1; i <= totalUnit; i++){
    unitNavHtml += `
    <li>
        <a href="./text.html?grade=${grade}&semester=${semester}&unit=${i}">Unit ${i}</a>
    </li>`
    
}

document.getElementById("unit-list").innerHTML = unitNavHtml


// 2. Load the mode bar for the current unit
document.getElementById("link-text").href =
`./text.html?grade=${grade}&semester=${semester}&unit=${unit || 1}`;

document.getElementById("link-words").href =
`./words.html?grade=${grade}&semester=${semester}&unit=${unit || 1}`;

document.getElementById("link-dictation").href =
`./dictation.html?grade=${grade}&semester=${semester}&unit=${unit || 1}`;


// 3. Load the text image
textImg.src = `./images/grade${grade}/semester${semester}/unit${unit || 1}/page1.png`


// 4. Load voice from Web Speech API
function loadVoices() {
    const voices = synth.getVoices();
    englishVoices = voices.filter(v => v.lang.startsWith("en"));
    voiceSelect.innerHTML = englishVoices
        .map((voice, index) =>
            `<option value="${index}">
                ${voice.name} (${voice.lang})
            </option>`
        )
        .join("");
    

    const googleUSIndex = englishVoices.findIndex(v =>
        v.name.includes("Google") && v.lang === "en-US"
    );

    if (googleUSIndex !== -1) {
        voiceSelect.selectedIndex = googleUSIndex;
    }
}

speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();


// 5. Create hotmap
function renderHotMap(pageNumber){
    const hotmapLayer = document.getElementById("hotmap-layer");
    hotmapLayer.innerHTML = ""; 

    const pageTexts = pagesTexts.find(page => 
        page.image === `page${pageNumber}.png`
    )

    hotmapLayer.innerHTML = pageTexts.sentences.map(sentence => {
        return `
            <div 
                class="hotspot"
                data-id="${sentence.id}"
                data-page="${pageNumber}"
                style="
                    left: ${sentence.left}%;
                    top: ${sentence.top}%;
                    width: ${sentence.w}%;
                    height: ${sentence.h}%;"
            >
            </div>`
    }
    ).join("")
    
}

renderHotMap(1)






document.getElementById("hotmap-layer").addEventListener("click", e => {
    if(e.target.dataset.page && e.target.dataset.id){
        const pageNumber = Number(e.target.dataset.page)
        const sentenceId = Number(e.target.dataset.id)
        handleListenHotspot(pageNumber, sentenceId)
    } 
    }
)


function handleListenHotspot(pageNumber, sentenceId) {
    const sentence = getSentence(pageNumber, sentenceId);
    speakEnglish(sentence.text);
    if (document.getElementById("need-translate").checked){
        renderTranslation(sentence.translation, sentence.left, sentence.top, sentence.h);
    }
}

function getSentence(pageNumber, sentenceId) {
    const page = pagesTexts.find(
        p => p.image === `page${pageNumber}.png`
    );

    return page.sentences.find(
        s => s.id === sentenceId
    );
}


function speakEnglish(text) {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = parseFloat(rateSelect.value); 
    utterance.voice = englishVoices[voiceSelect.selectedIndex];
    synth.speak(utterance);
}

function renderTranslation(text, left, top, h){
    document.getElementById("tranlation-layer").innerHTML = `
    <p 
        style="
            left: ${left}%;
            top: ${top+h}%;"
        class="tranlation-layer"
    >
        ${text}
    </p>`
}



// ---------- page selector ----------
let count = 1; 

document.addEventListener("click", e =>
    {
        if (e.target.id === "next-page-btn"){
            pageIncrement()
        } else if (e.target.id === "prev-page-btn"){
            pageDecrement()
        }
    }
) 

function pageIncrement() {
    if (count < 4){
        count ++
        pageRender()
        pageNumberRender()
        renderHotMap(count)
    }

}

function pageDecrement() {
    if (count > 1){
        count --
        pageRender()
        pageNumberRender()
        renderHotMap(count)
    }
}

function pageRender() {
    textImg.src = `./images/grade${grade}/semester${semester}/unit${unit || 1}/page${count}.png` 
    
}

function pageNumberRender() {
    document.getElementById("currentPage").innerHTML = count
}
