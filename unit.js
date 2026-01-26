import {pagesTexts} from "./data.js"


let currentMode = null;

document.addEventListener("change", (e) => {
    if (e.target.name === "mode"){
        currentMode = e.target.value;
        switchMode(currentMode);
        showTranslateCheckbox();
  }

});



function switchMode(mode){
    if (mode === "listen-mode"){
        listenMode()
    }
}


// listenMode
function listenMode(){
}

function showTranslateCheckbox() {
    if (currentMode === "listen-mode"){
        document.getElementById("translate-checkbox").style.display = "block";
    } else {
        document.getElementById("translate-checkbox").style.display = "none";
    }  
}

document.getElementById("hotmap-layer").addEventListener("click", e => {
    if(e.target.dataset.text && currentMode === "listen-mode"){
        speakEnglish(e.target.dataset.text)
    }
    }
)

function speakEnglish(text) {
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;   
  utterance.pitch = 1;    
  utterance.volume = 1;   

  window.speechSynthesis.speak(utterance);
}






// function showMode() {
//     console.log("show")
//     document.getElementById("translate-checkbox").style.display = "none";
// }



// create hotmap
function renderHotMap(pageNumber){
    const hotmapLayer = document.getElementById("hotmap-layer");
    hotmapLayer.innerHTML = ""; 

    const pageTexts = pagesTexts.find(page => 
        page.image === `page${pageNumber}.png`
    )

    const hopMapHtml= pageTexts.sentences.map(sentence => {
        return `
            <div 
                class="hotspot"
                data-text="${sentence.text}"
                style="
                    left: ${sentence.left}%;
                    top: ${sentence.top}%;
                    width: ${sentence.w}%;
                    height: ${sentence.h}%;"
            >
                <p>${sentence.text}</p>
            </div>`
    }
    ).join("")
    
    hotmapLayer.innerHTML = hopMapHtml

}

renderHotMap(1)



    




// page selector
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
    document.getElementById("page-image").src = `page${count}.png` 
    
}

function pageNumberRender() {
    document.getElementById("currentPage").innerHTML = count
}


