const MODE = {
    LISTEN: 'listen',
    TRANSLATE: 'translate',
    READ: 'read',
    SHOW: 'show'
};

let currentMode = MODE.LISTEN; 

const listenModeBtn = document.getElementById('listenModeBtn');
const learnModeBtn  = document.getElementById('learnModeBtn');
const readModeBtn   = document.getElementById('readModeBtn');
const showModeBtn   = document.getElementById('showModeBtn');
const modeButtons = [
    listenModeBtn,
    learnModeBtn,
    readModeBtn,
    showModeBtn
];


// -----------------------------初始化 ----------------------------- //
// 初始化页面
function init() {

    // 模式按钮绑定
    listenModeBtn.addEventListener('click', () => setMode(MODE.LISTEN));
    learnModeBtn.addEventListener('click',  () => setMode(MODE.TRANSLATE));
    readModeBtn.addEventListener('click',   () => setMode(MODE.READ));
    showModeBtn.addEventListener('click',   () => setMode(MODE.SHOW));
    
    // 加载所有数据
    loadAllData();

    setMode(MODE.LISTEN); 
}



// -----------------------------模式系统 ----------------------------- //
function setMode(mode) {
    currentMode = mode;

    modeButtons.forEach(btn => btn.classList.remove('active'));

    switch (mode) {
        case MODE.LISTEN:
            listenModeBtn.classList.add('active');
            break;
        case MODE.TRANSLATE:
            learnModeBtn.classList.add('active');
            break;
        case MODE.READ:
            readModeBtn.classList.add('active');
            break;
        case MODE.SHOW:
            showModeBtn.classList.add('active');
            break;
    }

}
