// 教材页面数据 - 使用百分比坐标而不是像素坐标
export const pages = [
    { 
        image: "page1.png", 
        sentences: [
            { id: 1, text: "Unit 1 We're friends", left: 20, top: 3, w: 60, h: 12 },
            { id: 2, text: "We're good friends!", left: 41, top: 44, w: 25, h: 6 },
            { id: 3, text: "The more we get together,\nTogether, together,\nThe more we get together,\nThe happier we'll be.", left: 47, top: 78, w: 38, h: 14 }
        ]
    },
    { 
        image: "page2.png", 
        sentences: [
            { id: 4, text: "Thank you for the carrots", left: 10, top: 13, w: 45, h: 4 },
            { id: 5, text: "There are so many carrots. I want to share them with my friends.", left: 15, top: 18, w: 32, h: 8 },
            { id: 6, text: "Thank you. Let's have a fruit party!", left: 59, top: 53, w: 31, h: 7 },
            { id: 7, text: "The fruit is so sweet. Like our friendship!", left: 16, top: 73, w: 48, h: 8 },
            { id: 18, text: "Cartoon time", left: 8, top: 6, w: 35, h: 6 },
            { id: 19, text: "There are some carrots.", left: 56, top: 17, w: 24, h: 6 },
            { id: 20, text: "They're from my friend Ruby.", left: 69, top: 30, w: 27, h: 6 }
        ]
    },
    { 
        image: "page3.png", 
        sentences: [
            { id: 8, text: "The lion and the mouse", left: 10, top: 13, w: 45, h: 4 },
            { id: 9, text: "There are many animals in the forest. The lion is big and strong. The mouse is small and thin.", left: 14, top: 17, w: 65, h: 6 },
            { id: 10, text: "The mouse is on the lion's back. The lion is angry.", left: 14, top: 45, w: 65, h: 4 },
            { id: 11, text: "Please don't eat me. I can help you one day.", left: 16, top: 72, w: 30, h: 7 },
            { id: 12, text: "How can you help me? You're so weak!", left: 64, top: 77, w: 25, h: 8 },
            { id: 21, text: "Story time", left: 9, top: 6, w: 30, h: 6 },
            { id: 22, text: "There are many animals in the forest.", left: 14, top: 17, w: 40, h: 4 },
            { id: 23, text: "Please!", left: 27, top: 84, w: 13, h: 4 },
            { id: 24, text: "Ha ha! How can you help me?", left: 64, top: 77, w: 22, h: 5 }
        ]
    },
    { 
        image: "page4.png", 
        sentences: [
            { id: 13, text: "The lion is in the net. He is sad.", left: 16, top: 9, w: 50, h: 4 },
            { id: 14, text: "Let me help you.", left: 56, top: 21, w: 20, h: 4 },
            { id: 15, text: "There is a big hole in the net.", left: 16, top: 36, w: 45, h: 4 },
            { id: 16, text: "Thank you! You're so kind!", left: 68, top: 52, w: 25, h: 6 },
            { id: 17, text: "The lion and the mouse become good friends.", left: 16, top: 64, w: 56, h: 4 },
            { id: 25, text: "Help!", left: 25, top: 18, w: 12, h: 4 },
            { id: 26, text: "OK. Go away!", left: 60, top: 89, w: 18, h: 4 },
            { id: 27, text: "What do the lion and the mouse do for each other?", left: 16, top: 89, w: 75, h: 4 }
        ]
    }
];

// 句子翻译对照表
const translations = {
    1: "第一单元 我们是朋友",
    2: "我们是好朋友！",
    3: "我们越是相聚在一起，\n在一起，在一起，\n我们越是相聚在一起，\n我们就会越快乐。",
    4: "感谢你的胡萝卜",
    5: "有这么多胡萝卜。我想和我的朋友们分享。",
    6: "谢谢。让我们开个水果派对吧！",
    7: "水果真甜。就像我们的友谊！",
    8: "狮子和老鼠",
    9: "森林里有许多动物。狮子又大又强壮。老鼠又小又瘦。",
    10: "老鼠在狮子的背上。狮子很生气。",
    11: "请不要吃我。有一天我可以帮助你。",
    12: "你怎么能帮我？你太弱了！",
    13: "狮子在网里。他很伤心。",
    14: "让我来帮你。",
    15: "网上有一个大洞。",
    16: "谢谢！你真是太好了！",
    17: "狮子和老鼠成为了好朋友。",
    18: "卡通时间",
    19: "有一些胡萝卜。",
    20: "它们来自我的朋友鲁比。",
    21: "故事时间",
    22: "森林里有许多动物。",
    23: "拜托！",
    24: "哈哈！你怎么能帮我？",
    25: "救命！",
    26: "好的。走开！",
    27: "狮子和老鼠为彼此做了什么？"
};

// 基于页面内容的练习题数据（多样化的题型）
const practiceQuestions = {
    page1: [
        {
            type: "choice",
            question: "请选择 'We're good friends!' 的正确翻译：",
            options: ["我们是好朋友！", "我们是同学！", "我们是老师！", "我们是一家人！"],
            correct: 0,
            explanation: "'We're good friends!' 是Unit 1的重点句型，表示'我们是好朋友！'。'we're'是'we are'的缩写形式。"
        },
        {
            type: "judge",
            question: "判断对错：'The more we get together' 的意思是 '我们越是相聚在一起'",
            options: ["正确", "错误"],
            correct: 0,
            explanation: "这是Unit 1课文中的原句，'The more...'表示'越...'，整句话的意思是'我们越是相聚在一起'。"
        },
        {
            type: "fill",
            question: "选词填空：The ______ we get together, the happier we'll be.",
            options: ["more", "most", "many", "much"],
            correct: 0,
            explanation: "'The more..., the happier...' 是固定句型，表示'越...就越快乐'。"
        },
        {
            type: "choice",
            question: "请选择句子中画线部分单词的正确发音：\nWe're good friends!",
            options: ["/friːndz/", "/frɪndz/", "/freɪndz/", "/frændz/"],
            correct: 1,
            explanation: "'friends' 的正确发音是 /frɪndz/，注意复数形式的发音。"
        }
    ],
    page2: [
        {
            type: "choice",
            question: "请选择 'Thank you for the carrots' 的正确翻译：",
            options: ["感谢你的胡萝卜", "感谢你的苹果", "感谢你的香蕉", "感谢你的橘子"],
            correct: 0,
            explanation: "'Thank you for...'是固定表达，表示'感谢你的...'。carrots是胡萝卜的意思。"
        },
        {
            type: "choice",
            question: "请选择短语 'share sth. with sb.' 的正确翻译：",
            options: ["和某人分享某物", "和某人玩游戏", "和某人一起学习", "和某人交朋友"],
            correct: 0,
            explanation: "'share sth. with sb.' 是Unit 1的重点短语，意思是'和某人分享某物'。课文原句是'I want to share them with my friends.'"
        },
        {
            type: "fill",
            question: "根据首字母提示补全单词：\nThere are so m______ carrots. I want to share them with my friends.",
            options: ["any", "uch", "any", "ost"],
            correct: 0,
            explanation: "'so many' 是固定搭配，表示'这么多'。课文原句是'There are so many carrots.'"
        },
        {
            type: "match",
            question: "请将左边的短语与右边的中文翻译配对：",
            leftOptions: ["Thank you for", "so many", "share with", "fruit party"],
            rightOptions: ["感谢你的", "这么多", "和...分享", "水果派对"],
            correct: [0, 1, 2, 3],
            explanation: "这些是Cartoon部分的重要短语，需要熟练掌握。"
        }
    ],
    page3: [
        {
            type: "choice",
            question: "请选择 'The lion is big and strong' 的正确翻译：",
            options: ["狮子又大又强壮", "老鼠又小又瘦", "老虎又大又凶猛", "大象又大又重"],
            correct: 0,
            explanation: "'big and strong' 是Unit 1的重点短语，表示'又大又强壮'，用来描述狮子。"
        },
        {
            type: "choice",
            question: "请选择 'Please don't eat me.' 的正确翻译：",
            options: ["请不要吃我。", "请不要打我。", "请不要碰我。", "请不要看我。"],
            correct: 0,
            explanation: "这是狮子和老鼠故事中的关键句子，老鼠对狮子说'请不要吃我。'，'Please don't...'是礼貌的请求句式。"
        },
        {
            type: "judge",
            question: "判断对错：'You're so weak!' 的意思是 '你太弱了！'",
            options: ["正确", "错误"],
            correct: 0,
            explanation: "'weak' 是Unit 1的重点单词，表示'虚弱的'。'so'在这里表示'如此，太'的意思。"
        },
        {
            type: "choice",
            question: "根据Story time内容，选择合适的单词填空：\nThe lion is big and ______. The mouse is small and ______.",
            options: ["strong, thin", "weak, strong", "thin, strong", "strong, weak"],
            correct: 0,
            explanation: "根据课文，狮子是'big and strong'(又大又强壮)，老鼠是'small and thin'(又小又瘦)。"
        }
    ],
    page4: [
        {
            type: "choice",
            question: "请选择 'Let me help you.' 的正确翻译：",
            options: ["让我来帮你。", "让我来救你。", "让我来教你。", "让我来看你。"],
            correct: 0,
            explanation: "'Let me...' 是常用表达，表示'让我...'。这是老鼠救狮子时说的话。"
        },
        {
            type: "choice",
            question: "请选择 'become good friends' 的正确翻译：",
            options: ["成为好朋友", "变成敌人", "互相帮助", "一起玩耍"],
            correct: 0,
            explanation: "'become' 是Unit 1的重点单词，表示'变成，变为'。'become good friends'是故事的结局。"
        },
        {
            type: "choice",
            question: "根据Story time结尾内容，回答问题：\nWhat do the lion and the mouse do for each other?",
            options: ["The mouse helps the lion, and they become friends.", "The lion helps the mouse, and they become friends.", "They fight with each other.", "They run away from each other."],
            correct: 0,
            explanation: "故事中老鼠帮助狮子从网中逃脱，然后他们成为了好朋友。"
        },
        {
            type: "judge",
            question: "判断对错：'There is a big hole in the net.' 的意思是 '网上有一个大洞。'",
            options: ["正确", "错误"],
            correct: 0,
            explanation: "这是故事中的句子，老鼠咬破了网，让狮子能够逃脱。'hole'是洞的意思。"
        }
    ]
};