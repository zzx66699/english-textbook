import {pages} from data.js

const listenModeBtn = document.getElementById("listen-mode-btn")
const learnModeBtn  = document.getElementById("learn-mode-btn")
const readModeBtn   = document.getElementById("read-mode-btn")
const showModeBtn   = document.getElementById("show-mode-btn")
const prevPageBtn   = document.getElementById("prev-page-btn")
const nextPageBtn   = document.getElementById("next-page-btn")

// mode selector
listenModeBtn.addEventListener("change", listenMode)

function listenMode() {
    console.log("listen")
    document.getElementById("translate-checkbox").style.display = "block";

}

learnModeBtn.addEventListener("change", learnMode)

function learnMode() {
    console.log("learn")
    document.getElementById("translate-checkbox").style.display = "none";
}

readModeBtn.addEventListener("change", readMode)


function readMode() {
    console.log("read")
    document.getElementById("translate-checkbox").style.display = "none";
}

showModeBtn.addEventListener("change", showMode)

function showMode() {
    console.log("show")
    document.getElementById("translate-checkbox").style.display = "none";
}


// page selector
let count = 1; 

nextPageBtn.addEventListener("click", pageIncrement) 

function pageIncrement() {
    if (count < 4){
        count ++
        pageRender()
        pageNumberRender()
    }

}

prevPageBtn.addEventListener("click", pageDecrement) 

function pageDecrement() {
    if (count > 1){
        count --
        pageRender()
        pageNumberRender()
    }
}

function pageRender() {
    document.getElementById("main-img").innerHTML = `
    <img id="pageImage" 
        class="page-image" 
        src="page${count}.png" 
        alt="textbook page">
    </img>`
}

function pageNumberRender() {
    document.getElementById("currentPage").innerHTML = count
}
