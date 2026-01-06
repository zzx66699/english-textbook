// -----------------------------全局状态 & 常量 ----------------------------- //
let currentPageIndex = 0;
let sentences = [];
let activeTranslations = new Set();
let activeRecordingBox = null;
let activeShowBox = null;
let activeActionGroup = null;
let activeSentence = null;

// 学习统计数据 - 重置为初始状态
let learningStats = {
    highScoreSentences: 0,
    correctAnswers: 0,
    completedPages: new Set(),
    readingScores: {},
    practiceResults: {},
    practiceCompletedPages: new Set(),
    currentPagePracticeAnswers: 0,
    currentPagePracticeTotal: 0
};


// 当前练习状态
let currentPracticeQuestion = 0;
let currentPracticeQuestions = [];
let practiceSessionCorrect = 0;
let practiceSessionTotal = 0;
let isPracticeCompleted = false;

// 语音合成相关变量
let synth = window.speechSynthesis;
let currentUtterance = null;
let voices = [];
let isSpeechSupported = false;

// 录音相关变量
let mediaRecorder = null;
let audioChunks = [];
let audioBlob = null;
let isRecording = false;
let recordingTimer = null;
let recordingDuration = 0;

// 学习模式
const MODE = {
    LISTEN: 'listen',
    TRANSLATE: 'translate',
    READ: 'read',
    SHOW: 'show',
    MIX: 'mix'
};

let currentMode = MODE.LISTEN; // 默认听模式


// -----------------------------HTML ↔ JS 的桥梁 ----------------------------- //
// DOM元素
const pageImage = document.getElementById('pageImage');
const currentPageElement = document.getElementById('currentPage');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const container = document.querySelector('.container');
const learningTips = document.getElementById('learningTips');
const practiceSection = document.getElementById('practiceSection');
// 5 code buttons
const listenModeBtn = document.getElementById('listenModeBtn');
const learnModeBtn  = document.getElementById('learnModeBtn');
const readModeBtn   = document.getElementById('readModeBtn');
const showModeBtn   = document.getElementById('showModeBtn');
const mixModeBtn    = document.getElementById('mixModeBtn');
const modeButtons = [
    listenModeBtn,
    learnModeBtn,
    readModeBtn,
    showModeBtn,
    mixModeBtn
];


// 语音设置元素
const rateSlider = document.getElementById('rateSlider');
const pitchSlider = document.getElementById('pitchSlider');
const rateValue = document.getElementById('rateValue');
const pitchValue = document.getElementById('pitchValue');
const voiceSelect = document.getElementById('voiceSelect');

// 练习相关元素
const practiceQuestion = document.getElementById('practiceQuestion');
const practiceOptions = document.getElementById('practiceOptions');
const practiceFeedback = document.getElementById('practiceFeedback');
const explanationBox = document.getElementById('explanationBox');
const explanationText = document.getElementById('explanationText');
const explanationBtn = document.getElementById('explanationBtn');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');
const restartPracticeBtn = document.getElementById('restartPracticeBtn');
const practiceCompleteMessage = document.getElementById('practiceCompleteMessage');
const practiceCorrectCount = document.getElementById('practiceCorrectCount');
const practiceTotalCount = document.getElementById('practiceTotalCount');
const currentQuestionElement = document.getElementById('currentQuestion');
const totalQuestionsElement = document.getElementById('totalQuestions');

// 音效
const correctSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3');
const wrongSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3');
const applauseSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
const encouragementSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3');
const clickSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3');
const starSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3');
const fireworkSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-firework-explosion-3096.mp3');
const celebrationSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-happy-crowd-laugh-464.mp3');




// -----------------------------初始化 ----------------------------- //
// 初始化页面
function init() {
    checkSpeechSupport();

    // 模式按钮绑定
    listenModeBtn.addEventListener('click', () => setMode(MODE.LISTEN));
    learnModeBtn.addEventListener('click',  () => setMode(MODE.TRANSLATE));
    readModeBtn.addEventListener('click',   () => setMode(MODE.READ));
    showModeBtn.addEventListener('click',   () => setMode(MODE.SHOW));
    mixModeBtn.addEventListener('click',    () => setMode(MODE.MIX));

    // 事件监听
    prevPageBtn.addEventListener('click', prevPage);
    nextPageBtn.addEventListener('click', nextPage);
    
    // 语音设置事件
    rateSlider.addEventListener('input', updateRate);
    pitchSlider.addEventListener('input', updatePitch);
    voiceSelect.addEventListener('change', changeVoice);
    
    // 练习相关事件
    explanationBtn.addEventListener('click', showExplanation);
    nextQuestionBtn.addEventListener('click', nextPracticeQuestion);
    restartPracticeBtn.addEventListener('click', restartPractice);
    
    // 加载所有数据
    loadAllData();
    
    // 加载语音列表
    loadVoices();
    
    // 语音列表加载可能需要时间
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    
    // 更新页面按钮状态
    updatePageButtons();
    
    // 初始化练习
    loadPracticeQuestions();
    
    
    // 监听图片加载完成
    pageImage.onload = function() {
        // 图片加载完成后重新渲染热点，确保对齐
        renderHotspots();
    };
    
    // 初始化学习统计数据（清空所有数据）
    resetLearningStats();

    addShowHotspot();

    // Initiate the mode
    setMode(MODE.LISTEN); 
}

// 重置学习统计数据
function resetLearningStats() {
    learningStats = {
        highScoreSentences: 0,
        correctAnswers: 0,
        completedPages: new Set(),
        readingScores: {},
        practiceResults: {},
        practiceCompletedPages: new Set(),
        currentPagePracticeAnswers: 0,
        currentPagePracticeTotal: 0
    };
    
    // 清除本地存储的学习数据
    localStorage.removeItem('learningStats');
    
    console.log("学习统计数据已重置为初始状态");
}

// 检查语音合成支持
function checkSpeechSupport() {
    if ('speechSynthesis' in window) {
        isSpeechSupported = true;
    } else {
        isSpeechSupported = false;
        alert("您的浏览器不支持语音合成功能，请使用Chrome、Edge或Safari浏览器。");
    }
}

// 加载语音列表
function loadVoices() {
    voices = synth.getVoices();
    voiceSelect.innerHTML = '<option value="">选择语音</option>';
    
    if (voices.length > 0) {
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
        
        // 尝试选择英文语音
        const englishVoice = voices.find(voice => voice.lang.startsWith('en-'));
        if (englishVoice) {
            voiceSelect.value = englishVoice.name;
        }
    }
}

// 加载所有数据
function loadAllData() {
    loadLearningStats();
    loadSentencesForCurrentPage();
}

// 加载当前页面的句子数据
function loadSentencesForCurrentPage() {
    if (!pages[currentPageIndex]) return;

    // 纯学习态：永远只读静态配置
    sentences = JSON.parse(JSON.stringify(pages[currentPageIndex].sentences));
}


// -----------------------------模式系统 ----------------------------- //
function setMode(mode) {
    currentMode = mode;

    // 1️⃣ 切换按钮高亮
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
        case MODE.MIX:
            mixModeBtn.classList.add('active');
            break;
    }

    // 2️⃣ 更新热区按钮显示（混合模式才显示）
    updateActionGroupVisibility();

    // 3️⃣ 切模式时清空浮层（很重要）
    hideAllTranslations();
    hideRecordingBox();
    hideShowBox();
}


// 添加秀一秀热点
function addShowHotspot() {
    removeShowHotspot();

    const showHotspot = document.createElement('div');
    showHotspot.className = 'show-hotspot';
    showHotspot.id = 'show-hotspot';
    showHotspot.innerHTML = '秀';
    showHotspot.style.left = '90%';
    showHotspot.style.top = '10%';

    showHotspot.addEventListener('click', handleShowHotspotClick);

    container.appendChild(showHotspot);
}


// 移除秀一秀热点
function removeShowHotspot() {
    const showHotspot = document.getElementById('show-hotspot');
    if (showHotspot && showHotspot.parentNode) {
        showHotspot.parentNode.removeChild(showHotspot);
    }
    
    // 同时隐藏秀一秀框
    hideShowBox();
}

// 处理秀一秀热点点击
function handleShowHotspotClick(e) {
    
    e.stopPropagation();
    
    const x = parseFloat(e.currentTarget.style.left);
    const y = parseFloat(e.currentTarget.style.top);
    
    // 隐藏其他弹出框
    hideAllTranslations();
    hideRecordingBox();
    
    // 如果秀一秀框已显示，则隐藏；否则显示
    if (activeShowBox) {
        hideShowBox();
    } else {
        showShowBox(x, y);
    }
}



// 上一页
function prevPage() {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        changePage(currentPageIndex);
        updatePageButtons();
        playSound(clickSound);

        addShowHotspot();
    }
}

// 下一页
function nextPage() {
    if (currentPageIndex < pages.length - 1) {
        currentPageIndex++;
        changePage(currentPageIndex);
        updatePageButtons();
        playSound(clickSound);

        addShowHotspot();
    }
}

// 更改页面
function changePage(pageIndex) {
    currentPageIndex = pageIndex;
    const page = pages[pageIndex];
    
    // 更新图片
    pageImage.src = page.image;
    
    // 更新页面指示器（虽然已隐藏）
    currentPageElement.textContent = pageIndex + 1;
    
    // 加载该页的句子数据
    loadSentencesForCurrentPage();
    
    // 重新渲染热点
    renderHotspots();
    
    // 清除活跃句子
    activeSentence = null;
    
    // 清除所有翻译框
    activeTranslations.clear();
    
    // 隐藏所有弹出框
    hideAllTranslations();
    hideRecordingBox();
    hideShowBox();
    
    // 重置练习状态
    isPracticeCompleted = false;
    practiceSessionCorrect = 0;
    practiceSessionTotal = 0;
}

// 更新页面按钮状态
function updatePageButtons() {
    prevPageBtn.disabled = currentPageIndex === 0;
    nextPageBtn.disabled = currentPageIndex === pages.length - 1;
}


// 渲染热点
function renderHotspots() {
    document.querySelectorAll('.hotspot-group').forEach(el => el.remove());

    sentences.forEach(sentence => {
        const hotspotGroup = document.createElement('div');
        hotspotGroup.className = 'hotspot-group';
        hotspotGroup.dataset.sentenceId = sentence.id;

        hotspotGroup.style.left = sentence.left + '%';
        hotspotGroup.style.top = sentence.top + '%';
        hotspotGroup.style.width = sentence.w + '%';
        hotspotGroup.style.height = sentence.h + '%';
        hotspotGroup.style.position = 'absolute';

        // 透明点击区（1:1）
        const textArea = document.createElement('div');
        textArea.className = 'text-area';
        textArea.addEventListener('click', e =>
            handleTextAreaClick(e, sentence)
        );

        // 操作按钮（默认隐藏）
        const actionGroup = document.createElement('div');
        actionGroup.className = 'action-group';

        actionGroup.append(
            createHotspotButton('speak', sentence.id, '听'),
            createHotspotButton('translate', sentence.id, '译'),
            createHotspotButton('score', sentence.id, '读')
        );

        hotspotGroup.append(textArea, actionGroup);
        container.appendChild(hotspotGroup);
    });

    updateActionGroupVisibility();
}


// 创建热点按钮
function createHotspotButton(type, sentenceId) {
    const hotspotElement = document.createElement('div');
    hotspotElement.className = `${type}-hotspot`;
    hotspotElement.dataset.sentenceId = sentenceId;
    hotspotElement.dataset.type = type;

    hotspotElement.addEventListener('click', handleHotspotClick); 

    return hotspotElement;
}

function handleTextAreaClick(e, sentence) {
    e.stopPropagation();

    const hotspotGroup = e.currentTarget.closest('.hotspot-group');
    const x = parseFloat(hotspotGroup.style.left);
    const y = parseFloat(hotspotGroup.style.top);

    hideAllTranslations();
    hideRecordingBox();
    hideShowBox();

    switch (currentMode) {
        case MODE.LISTEN:
            speakText(sentence.text);
            break;

        case MODE.TRANSLATE:
            toggleTranslation(sentence.id, x, y);
            break;

        case MODE.READ:
            showRecordingBox(sentence.id, x, y);
            break;

        case MODE.SHOW:
            showShowBox(x, y);
            break;

        case MODE.MIX:
            // 混合模式只显示按钮，不直接动作
            break;
    }
}

function updateActionGroupVisibility() {
    document.querySelectorAll('.hotspot-group').forEach(group => {
        group.classList.remove('mix-mode');

        if (currentMode === MODE.MIX) {
            group.classList.add('mix-mode');
        }
    });
}



// 显示翻译框
function showTranslation(sentenceId, x, y) {
    // 如果翻译框已存在，先移除
    hideTranslation(sentenceId);
    
    const translation = translations[sentenceId];
    if (!translation) return;
    
    // 创建翻译框
    const translationBox = document.createElement('div');
    translationBox.className = 'translation-box';
    translationBox.id = `translation-${sentenceId}`;
    translationBox.dataset.sentenceId = sentenceId;
    translationBox.textContent = translation;
    
    // 设置位置（在按钮下方）
    translationBox.style.left = `${x}%`;
    translationBox.style.top = `${parseFloat(y) + 4}%`;
    
    // 添加到容器
    container.appendChild(translationBox);
    
    // 显示翻译框
    setTimeout(() => {
        translationBox.classList.add('show');
    }, 10);
    
    // 添加到活跃翻译集合
    activeTranslations.add(sentenceId);
    
    // 高亮对应的翻译按钮
    const translateHotspot = document.querySelector(`.translate-hotspot[data-sentence-id="${sentenceId}"]`);
    if (translateHotspot) {
        translateHotspot.classList.add('active');
    }
    
    // 播放点击音效
    playSound(clickSound);
}

// 隐藏翻译框
function hideTranslation(sentenceId) {
    const translationBox = document.getElementById(`translation-${sentenceId}`);
    if (translationBox) {
        translationBox.classList.remove('show');
        setTimeout(() => {
            if (translationBox.parentNode) {
                translationBox.parentNode.removeChild(translationBox);
            }
        }, 300);
    }
    
    // 从活跃翻译集合中移除
    activeTranslations.delete(sentenceId);
    
    // 取消高亮对应的翻译按钮
    const translateHotspot = document.querySelector(`.translate-hotspot[data-sentence-id="${sentenceId}"]`);
    if (translateHotspot) {
        translateHotspot.classList.remove('active');
    }
}

// 切换翻译显示/隐藏
function toggleTranslation(sentenceId, x, y) {
    if (activeTranslations.has(sentenceId)) {
        // 如果翻译已显示，则隐藏
        hideTranslation(sentenceId);
    } else {
        // 如果翻译未显示，则显示
        showTranslation(sentenceId, x, y);
    }
}

// 隐藏所有翻译框
function hideAllTranslations() {
    document.querySelectorAll('.translation-box').forEach(box => {
        const sentenceId = parseInt(box.dataset.sentenceId);
        hideTranslation(sentenceId);
    });
}

// 显示录音框
function showRecordingBox(sentenceId, x, y) {
    // 如果录音框已存在，先移除
    hideRecordingBox();
    
    const sentence = sentences.find(s => s.id === sentenceId);
    if (!sentence) return;
    
    // 创建录音框
    const recordingBox = document.createElement('div');
    recordingBox.className = 'recording-box';
    recordingBox.id = `recording-${sentenceId}`;
    recordingBox.dataset.sentenceId = sentenceId;
    
    // 设置位置（在按钮下方）
    recordingBox.style.left = `${x}%`;
    recordingBox.style.top = `${parseFloat(y) + 4}%`;
    
    // 创建录音框内容
    recordingBox.innerHTML = `
        <h4><i class="fas fa-microphone"></i> 朗读跟读练习</h4>
        <div style="margin-bottom:15px; font-weight:600; color:#2c3e50;">"${sentence.text}"</div>
        <div class="recording-controls">
            <button class="recording-btn" id="recordBtnBox">
                <i class="fas fa-circle"></i> 开始录音
            </button>
            <button class="recording-btn" id="stopRecordBtnBox" disabled>
                <i class="fas fa-square"></i> 停止录音
            </button>
            <button class="recording-btn" id="playRecordBtnBox" disabled>
                <i class="fas fa-play"></i> 播放录音
            </button>
            <button class="recording-btn" id="submitRecordBtnBox" disabled>
                <i class="fas fa-check"></i> 提交评分
            </button>
        </div>
        <div class="recording-visualizer">
            <div class="recording-bar" id="recordingBarBox"></div>
        </div>
        <div class="recording-status" id="recordingStatusBox">准备录音...</div>
    `;
    
    // 添加到容器
    container.appendChild(recordingBox);
    
    // 显示录音框
    setTimeout(() => {
        recordingBox.classList.add('show');
    }, 10);
    
    // 设置当前活跃的录音框
    activeRecordingBox = sentenceId;
    
    // 高亮对应的读按钮
    const scoreHotspot = document.querySelector(`.score-hotspot[data-sentence-id="${sentenceId}"]`);
    if (scoreHotspot) {
        scoreHotspot.classList.add('active');
    }
    
    // 添加录音框按钮事件监听
    setTimeout(() => {
        const recordBtnBox = document.getElementById('recordBtnBox');
        const stopRecordBtnBox = document.getElementById('stopRecordBtnBox');
        const playRecordBtnBox = document.getElementById('playRecordBtnBox');
        const submitRecordBtnBox = document.getElementById('submitRecordBtnBox');
        const recordingBarBox = document.getElementById('recordingBarBox');
        const recordingStatusBox = document.getElementById('recordingStatusBox');
        
        recordBtnBox.addEventListener('click', () => startRecordingBox(sentenceId, recordingBarBox, recordingStatusBox));
        stopRecordBtnBox.addEventListener('click', () => stopRecordingBox(sentenceId, recordingStatusBox));
        playRecordBtnBox.addEventListener('click', () => playRecordingBox(sentenceId));
        submitRecordBtnBox.addEventListener('click', () => submitRecordingBox(sentenceId));
    }, 50);
    
    // 播放点击音效
    playSound(clickSound);
}

// 隐藏录音框
function hideRecordingBox() {
    if (activeRecordingBox !== null) {
        const recordingBox = document.getElementById(`recording-${activeRecordingBox}`);
        if (recordingBox) {
            recordingBox.classList.remove('show');
            setTimeout(() => {
                if (recordingBox.parentNode) {
                    recordingBox.parentNode.removeChild(recordingBox);
                }
            }, 300);
        }
        
        // 取消高亮对应的读按钮
        const scoreHotspot = document.querySelector(`.score-hotspot[data-sentence-id="${activeRecordingBox}"]`);
        if (scoreHotspot) {
            scoreHotspot.classList.remove('active');
        }
        
        activeRecordingBox = null;
    }
}

// 显示秀一秀框
function showShowBox(x, y) {
    // 如果秀一秀框已存在，先移除
    hideShowBox();
    
    // 创建秀一秀框
    const showBox = document.createElement('div');
    showBox.className = 'show-box';
    showBox.id = 'show-box';
    
    // 计算综合评分（从零开始的数据）
    const totalSentences = Object.keys(translations).length;
    const readingScore = Math.min(100, Math.round((learningStats.highScoreSentences / totalSentences) * 100));
    const practiceScore = Math.min(100, Math.round((learningStats.correctAnswers / 20) * 100));
    const pageScore = Math.min(100, Math.round((learningStats.completedPages.size / 4) * 100));
    const overallScore = Math.round((readingScore * 0.4) + (practiceScore * 0.4) + (pageScore * 0.2));
    
    // 创建秀一秀框内容
    showBox.innerHTML = `
        <h4><i class="fas fa-chart-line"></i> 学习成果统计</h4>
        <div class="show-stats">
            <div class="show-stat-item">
                <div class="show-stat-value">${learningStats.highScoreSentences}</div>
                <div class="show-stat-label">朗读成就<br>(90分以上句子)</div>
            </div>
            <div class="show-stat-item">
                <div class="show-stat-value">${learningStats.correctAnswers}</div>
                <div class="show-stat-label">练习成就<br>(答对题目数)</div>
            </div>
            <div class="show-stat-item">
                <div class="show-stat-value">${learningStats.completedPages.size}/4</div>
                <div class="show-stat-label">学习进度<br>(完成页面)</div>
            </div>
            <div class="show-stat-item">
                <div class="show-stat-value">${overallScore}</div>
                <div class="show-stat-label">综合评分<br>(满分100)</div>
            </div>
        </div>
        <div style="margin-top: 15px; text-align: center; font-size: 0.9rem; opacity: 0.8;">
            <i class="fas fa-trophy"></i> 学习之旅刚刚开始，继续加油！
        </div>
    `;
    
    // 设置位置（在按钮下方）
    showBox.style.left = `${x}%`;
    showBox.style.top = `${parseFloat(y) + 4}%`;
    
    // 添加到容器
    container.appendChild(showBox);
    
    // 显示秀一秀框
    setTimeout(() => {
        showBox.classList.add('show');
    }, 10);
    
    // 设置当前活跃的秀一秀框
    activeShowBox = true;
    
    // 高亮对应的秀一秀按钮
    const showHotspot = document.getElementById('show-hotspot');
    if (showHotspot) {
        showHotspot.classList.add('active');
    }
    
    // 播放点击音效
    playSound(clickSound);
}

// 隐藏秀一秀框
function hideShowBox() {
    if (activeShowBox) {
        const showBox = document.getElementById('show-box');
        if (showBox) {
            showBox.classList.remove('show');
            setTimeout(() => {
                if (showBox.parentNode) {
                    showBox.parentNode.removeChild(showBox);
                }
            }, 300);
        }
        
        // 取消高亮对应的秀一秀按钮
        const showHotspot = document.getElementById('show-hotspot');
        if (showHotspot) {
            showHotspot.classList.remove('active');
        }
        
        activeShowBox = false;
    }
}



// 处理热点点击
function handleHotspotClick(e) {
    
    e.stopPropagation();
    
    const sentenceId = parseInt(e.currentTarget.dataset.sentenceId);
    const type = e.currentTarget.dataset.type;
    const sentence = sentences.find(s => s.id === sentenceId);
    
    if (!sentence) return;
    
    // 设置当前活跃句子
    activeSentence = sentence;
    
    // 获取热点组位置
    const hotspotGroup = e.currentTarget.closest('.hotspot-group');
    const x = parseFloat(hotspotGroup.style.left);
    const y = parseFloat(hotspotGroup.style.top);
    
    // 根据按钮类型执行不同操作
    if (type === 'speak') {
        // "听"按钮 - 朗读文本
        // 隐藏其他弹出框
        hideAllTranslations();
        hideRecordingBox();
        hideShowBox();
        
        // 立即朗读
        speakText(sentence.text);
        
    } else if (type === 'translate') {
        // "译"按钮 - 切换翻译显示/隐藏
        // 隐藏其他弹出框
        hideRecordingBox();
        hideShowBox();
        
        toggleTranslation(sentenceId, x, y);
        
    } else if (type === 'score') {
        // "读"按钮 - 显示/隐藏录音界面
        // 隐藏其他弹出框
        hideAllTranslations();
        hideShowBox();
        
        // 如果录音框已显示，则隐藏；否则显示
        if (activeRecordingBox === sentenceId) {
            hideRecordingBox();
        } else {
            showRecordingBox(sentenceId, x, y);
        }
    }
}




// 保存学习统计数据
function saveLearningStats() {
    localStorage.setItem('learningStats', JSON.stringify({
        ...learningStats,
        completedPages: Array.from(learningStats.completedPages),
        practiceCompletedPages: Array.from(learningStats.practiceCompletedPages)
    }));
}

// 加载学习统计数据
function loadLearningStats() {
    const saved = localStorage.getItem('learningStats');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            learningStats = {
                ...parsed,
                completedPages: new Set(parsed.completedPages || []),
                practiceCompletedPages: new Set(parsed.practiceCompletedPages || [])
            };
        } catch (e) {
            console.error("解析学习统计数据时出错:", e);
        }
    }
}

// 朗读文本
function speakText(text) {
    if (!isSpeechSupported) return;
    
    // 停止当前语音
    if (synth.speaking) {
        synth.cancel();
    }
    
    if (text.trim() === '') return;
    
    currentUtterance = new SpeechSynthesisUtterance(text);
    
    // 设置语音参数
    const selectedVoice = voiceSelect.value;
    if (selectedVoice && voices.length > 0) {
        const voice = voices.find(v => v.name === selectedVoice);
        if (voice) {
            currentUtterance.voice = voice;
        }
    }
    
    currentUtterance.rate = parseFloat(rateSlider.value);
    currentUtterance.pitch = parseFloat(pitchSlider.value);
    
    // 开始朗读
    try {
        synth.speak(currentUtterance);
    } catch (error) {
        console.error("语音合成异常:", error);
    }
}

// 更新语速显示
function updateRate() {
    rateValue.textContent = rateSlider.value;
}

// 更新音调显示
function updatePitch() {
    pitchValue.textContent = pitchSlider.value;
}

// 更改语音
function changeVoice() {
    // 可以在这里添加语音更改的逻辑
}

// 录音功能（录音框版本）
function startRecordingBox(sentenceId, recordingBarBox, recordingStatusBox) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("您的浏览器不支持录音功能，请使用Chrome、Edge或Firefox浏览器。");
        return;
    }
    
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });
            
            mediaRecorder.addEventListener("stop", () => {
                audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                
                // 更新按钮状态
                document.getElementById('playRecordBtnBox').disabled = false;
                document.getElementById('submitRecordBtnBox').disabled = false;
                recordingStatusBox.textContent = `录音完成，时长: ${recordingDuration}秒`;
                
                // 停止所有轨道
                stream.getTracks().forEach(track => track.stop());
            });
            
            // 开始录音
            mediaRecorder.start();
            isRecording = true;
            
            // 更新按钮状态
            document.getElementById('recordBtnBox').disabled = true;
            document.getElementById('stopRecordBtnBox').disabled = false;
            document.getElementById('playRecordBtnBox').disabled = true;
            document.getElementById('submitRecordBtnBox').disabled = true;
            
            // 启动录音计时器
            recordingDuration = 0;
            recordingTimer = setInterval(() => {
                recordingDuration++;
                recordingStatusBox.textContent = `录音中... ${recordingDuration}秒`;
                
                // 更新录音可视化
                const volume = Math.random() * 30 + 70; // 模拟音量
                recordingBarBox.style.width = `${volume}%`;
            }, 1000);
            
            recordingStatusBox.textContent = "录音中... 0秒";
            recordingStatusBox.style.color = "#e74c3c";
            
        })
        .catch(err => {
            console.error("无法访问麦克风:", err);
            alert("无法访问麦克风，请确保已授予麦克风权限。");
        });
}

function stopRecordingBox(sentenceId, recordingStatusBox) {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        
        // 清除计时器
        clearInterval(recordingTimer);
        
        // 更新按钮状态
        document.getElementById('recordBtnBox').disabled = false;
        document.getElementById('stopRecordBtnBox').disabled = true;
        
        recordingStatusBox.textContent = `录音完成，时长: ${recordingDuration}秒`;
        recordingStatusBox.style.color = "#27ae60";
        
        // 重置录音可视化
        const recordingBarBox = document.getElementById('recordingBarBox');
        if (recordingBarBox) {
            recordingBarBox.style.width = "0%";
        }
    }
}

function playRecordingBox(sentenceId) {
    if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        
        const recordingStatusBox = document.getElementById('recordingStatusBox');
        if (recordingStatusBox) {
            recordingStatusBox.textContent = "正在播放录音...";
            recordingStatusBox.style.color = "#3498db";
        }
        
        audio.addEventListener("ended", () => {
            if (recordingStatusBox) {
                recordingStatusBox.textContent = `播放完成，时长: ${recordingDuration}秒`;
                recordingStatusBox.style.color = "#27ae60";
            }
        });
    }
}

function submitRecordingBox(sentenceId) {
    if (!activeSentence) {
        alert("请先选择一个句子进行跟读");
        return;
    }
    
    if (!audioBlob) {
        alert("请先录制音频");
        return;
    }
    
    // 模拟评分过程
    const sentenceLength = activeSentence.text.length;
    const expectedDuration = sentenceLength * 0.1;
    const durationDiff = Math.abs(recordingDuration - expectedDuration);
    
    // 基础分数（基于时长匹配度）
    let score = 100 - Math.min(durationDiff * 10, 30);
    
    // 添加随机波动（模拟发音准确性评估）
    const randomFactor = Math.random() * 10 - 5;
    score += randomFactor;
    
    // 确保分数在合理范围内
    score = Math.max(60, Math.min(100, Math.round(score)));
    
    // 保存朗读分数
    learningStats.readingScores[sentenceId] = score;
    
    // 如果分数>=90，增加高分句子计数
    if (score >= 90) {
        learningStats.highScoreSentences++;
    }
    
    // 标记当前页面为已学习
    learningStats.completedPages.add(currentPageIndex);
    
    // 保存学习统计数据
    saveLearningStats();
    
    // 显示评分结果
    showScoreResult(score, sentenceId);
}

function showScoreResult(score, sentenceId) {
    // 创建评分结果元素
    const scoreResult = document.createElement('div');
    scoreResult.className = 'score-result';
    
    // 根据分数设置不同样式
    if (score >= 90) {
        scoreResult.classList.add('score-excellent');
        scoreResult.innerHTML = `
            <div style="font-size:1.8rem; margin-bottom:10px;">
                <i class="fas fa-trophy"></i> 太棒了！ <i class="fas fa-trophy"></i>
            </div>
            <div>朗读评分: ${score}分</div>
            <div style="margin-top:10px; font-size:1.2rem;">发音非常标准！继续保持！</div>
            <div class="star-rating">
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
            </div>
        `;
        
        // 播放喝彩音效和烟花音效
        playSound(applauseSound);
        playSound(fireworkSound);
        
        // 显示烟花效果
        showFireworks();
        
    } else if (score >= 80) {
        scoreResult.classList.add('score-good');
        scoreResult.innerHTML = `
            <div style="font-size:1.8rem; margin-bottom:10px;">
                <i class="fas fa-star"></i> 很好！ <i class="fas fa-star"></i>
            </div>
            <div>朗读评分: ${score}分</div>
            <div style="margin-top:10px; font-size:1.2rem;">发音不错！再多练习几次会更好！</div>
            <div class="star-rating">
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
            </div>
        `;
        
        // 播放星星音效
        playSound(starSound);
        
        // 显示小型烟花
        showMiniFireworks();
        
    } else {
        scoreResult.classList.add('score-need-improvement');
        scoreResult.innerHTML = `
            <div style="font-size:1.8rem; margin-bottom:10px;">
                <i class="fas fa-thumbs-up"></i> 加油！ <i class="fas fa-thumbs-up"></i>
            </div>
            <div>朗读评分: ${score}分</div>
            <div style="margin-top:10px; font-size:1.2rem;">多听多读多练习，你的发音会越来越好的！</div>
            <div class="star-rating">
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
            </div>
        `;
        
        // 播放鼓励音效
        playSound(encouragementSound);
    }
    
    // 添加到录音框中
    const recordingBox = document.getElementById(`recording-${sentenceId}`);
    if (recordingBox) {
        // 移除可能已存在的评分结果
        const existingResult = recordingBox.querySelector('.score-result');
        if (existingResult) {
            existingResult.remove();
        }
        
        recordingBox.appendChild(scoreResult);
        
        // 显示评分结果
        setTimeout(() => {
            scoreResult.style.display = 'block';
        }, 100);
    }
}

// 练习功能
function loadPracticeQuestions() {
    // 根据当前页面获取练习题
    const pageKey = `page${currentPageIndex + 1}`;
    currentPracticeQuestions = practiceQuestions[pageKey] || [];
    currentPracticeQuestion = 0;
    isPracticeCompleted = false;
    practiceSessionTotal = currentPracticeQuestions.length;
    practiceSessionCorrect = 0;
    
    // 更新题目数量显示
    totalQuestionsElement.textContent = currentPracticeQuestions.length;
    
    // 检查当前页练习是否已完成
    checkIfPracticeCompleted();
    
    // 加载第一题
    loadPracticeQuestion();
}

function loadPracticeQuestion() {
    if (currentPracticeQuestions.length === 0) {
        practiceQuestion.textContent = "当前页面暂无练习题";
        practiceOptions.innerHTML = "";
        return;
    }
    
    const question = currentPracticeQuestions[currentPracticeQuestion];
    
    // 更新题目计数器
    currentQuestionElement.textContent = currentPracticeQuestion + 1;
    
    // 更新题目
    practiceQuestion.textContent = question.question;
    
    // 清空选项
    practiceOptions.innerHTML = '';
    
    // 隐藏反馈和按钮
    practiceFeedback.className = 'practice-feedback';
    practiceFeedback.style.display = 'none';
    explanationBox.style.display = 'none';
    explanationBtn.style.display = 'none';
    nextQuestionBtn.style.display = 'none';
    restartPracticeBtn.style.display = 'none';
    practiceCompleteMessage.style.display = 'none';
    
    // 根据题目类型显示不同的选项
    if (question.type === "choice" || question.type === "judge") {
        // 选择题、判断题
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'practice-option';
            optionElement.textContent = option;
            optionElement.dataset.index = index;
            optionElement.addEventListener('click', () => checkPracticeAnswer(index, question));
            practiceOptions.appendChild(optionElement);
        });
    } else if (question.type === "fill") {
        // 填空题
        practiceOptions.style.gridTemplateColumns = "1fr";
        
        const fillContainer = document.createElement('div');
        fillContainer.style.display = 'flex';
        fillContainer.style.flexDirection = 'column';
        fillContainer.style.gap = '15px';
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'practice-option';
            optionElement.textContent = option;
            optionElement.dataset.index = index;
            optionElement.addEventListener('click', () => checkPracticeAnswer(index, question));
            fillContainer.appendChild(optionElement);
        });
        
        practiceOptions.appendChild(fillContainer);
    } else if (question.type === "match") {
        // 配对题
        practiceOptions.style.gridTemplateColumns = "1fr";
        
        const matchContainer = document.createElement('div');
        matchContainer.style.display = 'flex';
        matchContainer.style.flexDirection = 'column';
        matchContainer.style.gap = '15px';
        
        question.leftOptions.forEach((leftOption, index) => {
            const matchItem = document.createElement('div');
            matchItem.style.display = 'flex';
            matchItem.style.alignItems = 'center';
            matchItem.style.gap = '10px';
            matchItem.style.padding = '10px';
            matchItem.style.backgroundColor = 'var(--light-blue)';
            matchItem.style.borderRadius = '8px';
            
            const leftSpan = document.createElement('span');
            leftSpan.textContent = leftOption;
            leftSpan.style.fontWeight = '600';
            leftSpan.style.color = 'var(--primary-blue)';
            
            const arrowSpan = document.createElement('span');
            arrowSpan.textContent = '→';
            arrowSpan.style.margin = '0 10px';
            
            const select = document.createElement('select');
            select.style.padding = '5px 10px';
            select.style.borderRadius = '5px';
            select.style.border = '2px solid var(--primary-purple)';
            select.style.backgroundColor = 'white';
            
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = "请选择";
            select.appendChild(defaultOption);
            
            question.rightOptions.forEach((rightOption, rightIndex) => {
                const option = document.createElement('option');
                option.value = rightIndex;
                option.textContent = rightOption;
                select.appendChild(option);
            });
            
            select.dataset.index = index;
            
            matchItem.appendChild(leftSpan);
            matchItem.appendChild(arrowSpan);
            matchItem.appendChild(select);
            matchContainer.appendChild(matchItem);
        });
        
        practiceOptions.appendChild(matchContainer);
        
        // 添加配对题提交按钮
        const submitMatchButton = document.createElement('button');
        submitMatchButton.className = 'next-question-btn';
        submitMatchButton.innerHTML = '<i class="fas fa-check"></i> 提交配对';
        submitMatchButton.style.marginTop = '15px';
        submitMatchButton.addEventListener('click', () => checkMatchAnswer(question));
        practiceOptions.appendChild(submitMatchButton);
    }
}



function checkPracticeAnswer(selectedIndex, question) {
    const options = document.querySelectorAll('.practice-option');
    
    // 禁用所有选项
    options.forEach(option => {
        option.style.pointerEvents = 'none';
    });
    
    // 显示正确答案和错误答案
    options.forEach((option, index) => {
        if (index === question.correct) {
            option.classList.add('correct');
        } else if (index === selectedIndex && selectedIndex !== question.correct) {
            option.classList.add('wrong');
        }
    });
    
    // 显示反馈
    if (selectedIndex === question.correct) {
        practiceFeedback.textContent = "太棒了！答对了！";
        practiceFeedback.classList.add('correct');
        practiceFeedback.style.display = 'block';
        
        // 更新练习会话统计
        practiceSessionCorrect++;
        
        // 更新学习统计数据
        learningStats.correctAnswers++;
        saveLearningStats();
        
        // 播放正确音效
        playSound(correctSound);
        
        // 显示庆祝效果
        showMiniFireworks();
        
    } else {
        practiceFeedback.textContent = "再试一次！正确答案已高亮显示";
        practiceFeedback.classList.add('wrong');
        practiceFeedback.style.display = 'block';
        
        // 播放错误音效
        playSound(wrongSound);
    }
    
    // 设置解析文本
    explanationText.textContent = question.explanation || "这是Unit 1的重点知识，请认真复习课文。";
    
    // 显示解析按钮
    explanationBtn.style.display = 'block';
    
    // 检查是否是最后一题
    if (currentPracticeQuestion >= currentPracticeQuestions.length - 1) {
        // 最后一题，显示完成信息和重新练习按钮
        showPracticeComplete();
    } else {
        // 不是最后一题，显示下一题按钮
        nextQuestionBtn.style.display = 'block';
    }
}

function checkMatchAnswer(question) {
    const selects = document.querySelectorAll('select');
    let allCorrect = true;
    
    // 检查每个选择是否正确
    selects.forEach((select, index) => {
        const selectedValue = parseInt(select.value);
        const matchItem = select.parentNode;
        
        if (selectedValue === question.correct[index]) {
            matchItem.style.backgroundColor = 'var(--light-green)';
            matchItem.style.border = '2px solid var(--primary-green)';
        } else {
            matchItem.style.backgroundColor = 'var(--light-pink)';
            matchItem.style.border = '2px solid var(--primary-red)';
            allCorrect = false;
        }
    });
    
    // 显示反馈
    if (allCorrect) {
        practiceFeedback.textContent = "太棒了！全部配对正确！";
        practiceFeedback.classList.add('correct');
        practiceFeedback.style.display = 'block';
        
        // 更新练习会话统计
        practiceSessionCorrect++;
        
        // 更新学习统计数据
        learningStats.correctAnswers++;
        saveLearningStats();
        
        // 播放正确音效
        playSound(correctSound);
        
        // 显示庆祝效果
        showMiniFireworks();
        
    } else {
        practiceFeedback.textContent = "有些配对不正确，请再检查一下";
        practiceFeedback.classList.add('wrong');
        practiceFeedback.style.display = 'block';
        
        // 播放错误音效
        playSound(wrongSound);
    }
    
    // 设置解析文本
    explanationText.textContent = question.explanation || "这是Unit 1的重点知识，请认真复习课文。";
    
    // 显示解析按钮
    explanationBtn.style.display = 'block';
    
    // 检查是否是最后一题
    if (currentPracticeQuestion >= currentPracticeQuestions.length - 1) {
        // 最后一题，显示完成信息和重新练习按钮
        showPracticeComplete();
    } else {
        // 不是最后一题，显示下一题按钮
        nextQuestionBtn.style.display = 'block';
    }
}

function showExplanation() {
    explanationBox.style.display = 'block';
    explanationBtn.style.display = 'none';
}

function nextPracticeQuestion() {
    currentPracticeQuestion++;
    loadPracticeQuestion();
    playSound(clickSound);
}

function showPracticeComplete() {
    // 标记当前页练习为已完成
    learningStats.practiceCompletedPages.add(currentPageIndex);
    saveLearningStats();
    
    // 更新完成信息
    practiceCorrectCount.textContent = practiceSessionCorrect;
    practiceTotalCount.textContent = practiceSessionTotal;
    
    // 显示完成信息
    practiceCompleteMessage.style.display = 'block';
    
    // 显示重新练习按钮
    restartPracticeBtn.style.display = 'block';
    
    // 隐藏下一题按钮
    nextQuestionBtn.style.display = 'none';
    
    // 播放庆祝音效
    playSound(celebrationSound);
    playSound(fireworkSound);
    
    // 显示庆祝效果
    showFireworks();
    
    isPracticeCompleted = true;
}

function restartPractice() {
    // 重置练习状态
    currentPracticeQuestion = 0;
    practiceSessionCorrect = 0;
    isPracticeCompleted = false;
    
    // 加载第一题
    loadPracticeQuestion();
    
    // 隐藏完成信息和重新练习按钮
    practiceCompleteMessage.style.display = 'none';
    restartPracticeBtn.style.display = 'none';
    
    playSound(clickSound);
}

function checkIfPracticeCompleted() {
    // 检查当前页练习是否已完成
    if (learningStats.practiceCompletedPages.has(currentPageIndex)) {
        // 显示重新练习按钮
        restartPracticeBtn.style.display = 'block';
        
        // 加载第一题但不显示下一题按钮
        loadPracticeQuestion();
        
        // 显示提示信息
        practiceCompleteMessage.style.display = 'block';
        practiceCorrectCount.textContent = learningStats.correctAnswers;
        practiceTotalCount.textContent = currentPracticeQuestions.length;
        
        isPracticeCompleted = true;
    } else {
        isPracticeCompleted = false;
    }
}

// 显示烟花效果
function showFireworks() {
    // 播放烟花音效
    fireworkSound.currentTime = 0;
    fireworkSound.play().catch(e => console.log("烟花音效播放失败:", e));
    
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            confetti({
                particleCount: 200,
                spread: 120,
                origin: { 
                    x: Math.random() * 0.8 + 0.1, 
                    y: Math.random() * 0.5 
                },
                colors: ['#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e74c3c', '#e84393']
            });
        }, i * 150);
    }
}

function showMiniFireworks() {
    // 播放小型烟花音效
    starSound.currentTime = 0;
    starSound.play().catch(e => console.log("星星音效播放失败:", e));
    
    confetti({
        particleCount: 80,
        spread: 90,
        origin: { 
            x: Math.random() * 0.6 + 0.2, 
            y: Math.random() * 0.4 + 0.1 
        },
        colors: ['#2ecc71', '#f1c40f', '#e84393']
    });
}

// 播放音效
function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.log("音效播放失败:", e));
}

// 初始化应用
window.addEventListener('DOMContentLoaded', init);