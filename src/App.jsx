import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from 'firebase/firestore';

// --- 內建圖示 ---
const IconWrapper = ({ children, className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);
const Music = (p) => <IconWrapper {...p}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></IconWrapper>;
const Trophy = (p) => <IconWrapper {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></IconWrapper>;
const Timer = (p) => <IconWrapper {...p}><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></IconWrapper>;
const Play = (p) => <IconWrapper {...p}><polygon points="5 3 19 12 5 21 5 3"/></IconWrapper>;
const Share2 = (p) => <IconWrapper {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></IconWrapper>;
const RefreshCcw = (p) => <IconWrapper {...p}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></IconWrapper>;
const Medal = (p) => <IconWrapper {...p}><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="M13 12l5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><polyline points="12 18 10.5 16.5 12.5 15"/></IconWrapper>;
const Sparkles = (p) => <IconWrapper {...p}><path d="m12 3-1.9 5.8a2 2 0 0 1-1.2 1.2L3 12l5.8 1.9a2 2 0 0 1 1.2 1.2L12 21l1.9-5.8a2 2 0 0 1 1.2-1.2L21 12l-5.8-1.9a2 2 0 0 1-1.2-1.2L12 3Z"/></IconWrapper>;
const CheckCircle = (p) => <IconWrapper {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></IconWrapper>;
const XCircle = (p) => <IconWrapper {...p}><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></IconWrapper>;
const Cloud = (p) => <IconWrapper {...p}><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></IconWrapper>;
const AlertTriangle = (p) => <IconWrapper {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></IconWrapper>;
const Save = (p) => <IconWrapper {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></IconWrapper>;
const LinkIcon = (p) => <IconWrapper {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></IconWrapper>;
const Copy = (p) => <IconWrapper {...p}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></IconWrapper>;
const Users = (p) => <IconWrapper {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></IconWrapper>;

// --- 題目設定 (50 題 Emoji 猜歌，台灣流行與經典) ---
const QUESTIONS = [
  { id: 1, question: "🗣️🤍🎈", options: ["告白氣球", "氣球", "說愛你", "簡單愛"], answer: "告白氣球", explanation: "周杰倫 (Jay Chou) - 告白氣球。🗣️(告白) 🤍(愛) 🎈(氣球)。" },
  { id: 2, question: "🌹👦", options: ["追風少年", "玫瑰少年", "笨小孩", "男孩看見野玫瑰"], answer: "玫瑰少年", explanation: "蔡依林 (Jolin Tsai) - 玫瑰少年。🌹(玫瑰) 👦(少年)，致敬葉永鋕的動人歌曲。" },
  { id: 3, question: "🤏🍀", options: ["幸運草", "小情歌", "小幸運", "遇見"], answer: "小幸運", explanation: "田馥甄 (Hebe) - 小幸運。🤏(小小的) 🍀(幸運)，電影《我的少女時代》主題曲。" },
  { id: 4, question: "👂🌊", options: ["看海", "聽海", "海闊天空", "珊瑚海"], answer: "聽海", explanation: "張惠妹 (A-Mei) - 聽海。👂(聽) 🌊(海)，華語樂壇經典 KTV 必點神曲。" },
  { id: 5, question: "🐟👦", options: ["魚", "美人魚", "魚仔", "孤味"], answer: "魚仔", explanation: "盧廣仲 (Crowd Lu) - 魚仔。🐟(魚) 👦(仔)，《花甲男孩轉大人》主題曲。" },
  { id: 6, question: "🏠👩", options: ["媽媽請你也保重", "家後", "落雨聲", "阿嬤的話"], answer: "家後", explanation: "江蕙 (Jody Chiang) - 家後。🏠👩 (家中的牽手/妻子)，台語流行音樂的巔峰之作。" },
  { id: 7, question: "1️⃣☂️", options: ["雨一直下", "雨夜花", "一支小雨傘", "一把紙傘"], answer: "一支小雨傘", explanation: "洪榮宏 - 一支小雨傘。1️⃣(一支) ☂️(小雨傘)，傳唱大街小巷的台語經典。" },
  { id: 8, question: "🏃‍♂️🌍🌕", options: ["步步", "星空", "離開地球表面", "超人不會飛"], answer: "離開地球表面", explanation: "五月天 (Mayday) - 離開地球表面。🏃‍♂️(離開) 🌍(地球) 🌕(表面)，演唱會必嗨神曲。" },
  { id: 9, question: "🦸‍♀️🌟", options: ["Super Star", "看我72變", "舞孃", "星晴"], answer: "Super Star", explanation: "S.H.E - Super Star。🦸‍♀️(超級) 🌟(巨星)，華語第一女團的搖滾代表作。" },
  { id: 10, question: "🇳🇴🌲🌲", options: ["挪威的森林", "童話", "白鴿", "樹枝孤鳥"], answer: "挪威的森林", explanation: "伍佰 & China Blue - 挪威的森林。🇳🇴(挪威國旗) 🌲🌲(森林)。" },
  { id: 11, question: "🍷🗣️", options: ["杯底不可飼金魚", "乾杯", "酒後的心聲", "愛情恰恰"], answer: "酒後的心聲", explanation: "江蕙 (Jody Chiang) - 酒後的心聲。🍷(酒後) 🗣️(吐露心聲)，台灣史上最暢銷台語專輯。" },
  { id: 12, question: "🚶‍♂️⬆️", options: ["步步", "向前走", "追風少年", "浪子回頭"], answer: "向前走", explanation: "林強 - 向前走。🚶‍♂️⬆️ (往前走)，打破傳統台語歌悲情印象的搖滾神曲。" },
  { id: 13, question: "🌊👦🔙👤", options: ["漂向北方", "追風少年", "浪子回頭", "孤勇者"], answer: "浪子回頭", explanation: "茄子蛋 (EggPlantEgg) - 浪子回頭。🌊👦(浪子) 🔙👤(回頭)，近年最紅的台語搖滾。" },
  { id: 14, question: "🌙🏆🙋❤️", options: ["城裡的月光", "星晴", "月亮代表我的心", "私奔到月球"], answer: "月亮代表我的心", explanation: "鄧麗君 (Teresa Teng) - 月亮代表我的心。🌙(月亮) 🏆(代表) 🙋(我的) ❤️(心)。" },
  { id: 15, question: "👴🍵", options: ["爺爺泡的茶", "外婆的澎湖灣", "稻香", "茶底世界"], answer: "爺爺泡的茶", explanation: "周杰倫 (Jay Chou) - 爺爺泡的茶。👴(爺爺) 🍵(泡的茶)。" },
  { id: 16, question: "🎉🐒", options: ["派對動物", "波斯貓", "狐狸精", "牛仔很忙"], answer: "派對動物", explanation: "五月天 (Mayday) - 派對動物。🎉(派對) 🐒(動物/猴子)。" },
  { id: 17, question: "🐱", options: ["黑貓探戈", "波斯貓", "學貓叫", "為你寫詩"], answer: "波斯貓", explanation: "S.H.E - 波斯貓。🐱(貓)，充滿異國風情的經典舞曲。" },
  { id: 18, question: "❤️💃🕺", options: ["舞孃", "愛情恰恰", "不如跳舞", "愛的主打歌"], answer: "愛情恰恰", explanation: "陳小雲 - 愛情恰恰。❤️(愛情) 💃🕺(恰恰舞)，MV中經典的翹臀舞步令人印象深刻。" },
  { id: 19, question: "👂🌧️🔊", options: ["聽見下雨的聲音", "落雨聲", "雨一直下", "聽海"], answer: "聽見下雨的聲音", explanation: "魏如昀/周杰倫 - 聽見下雨的聲音。👂(聽見) 🌧️(下雨的) 🔊(聲音)。" },
  { id: 20, question: "👩➡️🙋‍♂️🌸", options: ["玫瑰少年", "雨夜花", "妳是我的花朵", "夜來香"], answer: "妳是我的花朵", explanation: "伍佰 & China Blue - 妳是我的花朵。👩(妳) ➡️(是) 🙋‍♂️(我的) 🌸(花朵)，全民台客舞經典。" },
  { id: 21, question: "👧", options: ["女孩", "我是女生", "小幸運", "女孩別哭"], answer: "女孩", explanation: "韋禮安 (WeiBird) - 女孩。👧(女孩)，輕快又甜蜜的告白歌曲。" },
  { id: 22, question: "🤷‍♂️👌", options: ["如果可以", "以後別做朋友", "突然好想你", "怎麼了"], answer: "如果可以", explanation: "韋禮安 (WeiBird) - 如果可以。🤷‍♂️(如果) 👌(可以)，電影《月老》超紅主題曲。" },
  { id: 23, question: "⏭️🚫🤝", options: ["分手快樂", "以後別做朋友", "我們不該這樣的", "可惜不是你"], answer: "以後別做朋友", explanation: "周興哲 (Eric Chou) - 以後別做朋友。⏭️(以後) 🚫(別做) 🤝(朋友)。" },
  { id: 24, question: "🌧️🔊", options: ["聽見下雨的聲音", "落雨聲", "雨夜花", "雨一直下"], answer: "落雨聲", explanation: "江蕙 (Jody Chiang) - 落雨聲。🌧️(落雨) 🔊(聲)，周杰倫與方文山早期的台語神作。" },
  { id: 25, question: "🌧️🌃🌸", options: ["雨夜花", "夜來香", "妳是我的花朵", "繁華攏是夢"], answer: "雨夜花", explanation: "台灣傳統民謠 - 雨夜花。🌧️(雨) 🌃(夜) 🌸(花)。" },
  { id: 26, question: "👣👣", options: ["向前走", "步步", "慢慢", "小步舞曲"], answer: "步步", explanation: "五月天 (Mayday) - 步步。👣👣(一步一步)。" },
  { id: 27, question: "🥂", options: ["酒後的心聲", "杯底不可飼金魚", "乾杯", "對酒當歌"], answer: "乾杯", explanation: "五月天 (Mayday) - 乾杯。🥂(舉杯/乾杯)，充滿回憶殺的感人歌曲。" },
  { id: 28, question: "😈👼", options: ["魔鬼中的天使", "天使", "惡魔", "半獸人"], answer: "魔鬼中的天使", explanation: "田馥甄 (Hebe) - 魔鬼中的天使。😈(魔鬼) 👼(天使)。" },
  { id: 29, question: "🦸‍♂️🚫✈️", options: ["超人不會飛", "離開地球表面", "孤勇者", "無重力"], answer: "超人不會飛", explanation: "周杰倫 (Jay Chou) - 超人不會飛。🦸‍♂️(超人) 🚫(不會) ✈️(飛)。" },
  { id: 30, question: "🇨🇳🗣️", options: ["中國話", "東風破", "青花瓷", "長城"], answer: "中國話", explanation: "S.H.E - 中國話。🇨🇳(中國) 🗣️(話)，結合繞口令的經典快歌。" },
  { id: 31, question: "🩸❤️📖", options: ["童話", "血腥愛情故事", "愛情的盡頭", "故事的最後"], answer: "血腥愛情故事", explanation: "張惠妹 (aMEI) - 血腥愛情故事。🩸(血腥) ❤️(愛情) 📖(故事)。" },
  { id: 32, question: "🌅🌻", options: ["星晴", "早安晨之美", "陽光宅男", "天黑黑"], answer: "早安晨之美", explanation: "盧廣仲 (Crowd Lu) - 早安晨之美。🌅(早安/晨) 🌻(美好)。對呀對呀！" },
  { id: 33, question: "🚉", options: ["車站", "火車", "台北台北", "下一站天后"], answer: "車站", explanation: "張秀卿 - 車站。🚉(火車站)，台語苦情經典，火車已經到車站～" },
  { id: 34, question: "🥃🚫🐟", options: ["魚仔", "杯底不可飼金魚", "乾杯", "酒後的心聲"], answer: "杯底不可飼金魚", explanation: "呂泉生 - 杯底不可飼金魚。🥃(杯底) 🚫(不可飼) 🐟(金魚)，勸酒的經典台灣民謠。" },
  { id: 35, question: "🎆🛌💭", options: ["星空", "繁華攏是夢", "夢醒時分", "白日夢"], answer: "繁華攏是夢", explanation: "陳美鳳/盧春如 - 繁華攏是夢。🎆(繁華) 🛌💭(攏是夢)。" },
  { id: 36, question: "💃💃", options: ["愛情恰恰", "不如跳舞", "舞孃", "大藝術家"], answer: "舞孃", explanation: "蔡依林 (Jolin Tsai) - 舞孃。💃💃(跳舞的女孩)，奠定 Jolin 亞洲舞后地位之作。" },
  { id: 37, question: "👀🙋‍♀️7️⃣2️⃣🔄", options: ["看我72變", "三十而立", "十七", "魔術先生"], answer: "看我72變", explanation: "蔡依林 (Jolin Tsai) - 看我72變。👀(看) 🙋‍♀️(我) 7️⃣2️⃣ 🔄(變)。" },
  { id: 38, question: "🗣️❤️👦", options: ["告白氣球", "說愛你", "愛我別走", "簡單愛"], answer: "說愛你", explanation: "蔡依林 (Jolin Tsai) - 說愛你。🗣️(說) ❤️(愛) 👦(你)。" },
  { id: 39, question: "💔🧑🚫👂🐢🎵", options: ["傷心的人別聽慢歌", "愛情的盡頭", "分手快樂", "怎麼了"], answer: "傷心的人別聽慢歌", explanation: "五月天 (Mayday) - 傷心的人別聽慢歌。💔🧑(傷心的人) 🚫👂(別聽) 🐢🎵(慢歌)。" },
  { id: 40, question: "🌩️🤔👦", options: ["突然好想你", "如果可以", "想見你想見你想見你", "以後別做朋友"], answer: "突然好想你", explanation: "五月天 (Mayday) - 突然好想你。🌩️(突然/晴天霹靂) 🤔(想) 👦(你)。" },
  { id: 41, question: "👭", options: ["朋友", "姐妹", "老婆", "好膽你就來"], answer: "姐妹", explanation: "張惠妹 (A-Mei) - 姐妹。👭(姐妹)，阿妹出道即巔峰的神級單曲。" },
  { id: 42, question: "🌈🚂", options: ["彩虹", "火車", "車站", "下一站天后"], answer: "彩虹", explanation: "動力火車 (Power Station) - 彩虹。🌈(彩虹) + 🚂(代表動力「火車」)。(周杰倫跟阿妹也都有彩虹喔！)" },
  { id: 43, question: "🌬️🍃👦", options: ["追風箏的孩子", "風箏", "追風少年", "陣風"], answer: "追風少年", explanation: "吳奇隆 - 追風少年。🌬️🍃(追風) 👦(少年)，90年代偶像神曲。" },
  { id: 44, question: "🚕🌧️", options: ["雨一直下", "落雨聲", "聽見下雨的聲音", "一支小雨傘"], answer: "雨一直下", explanation: "張宇 - 雨一直下。🚕(計程車/車外) 🌧️(雨一直下)，氣氛不算融洽～" },
  { id: 45, question: "🎈", options: ["告白氣球", "氣球", "紅氣球", "飛"], answer: "氣球", explanation: "許哲珮 - 氣球。🎈(氣球)，以一口氣唱完超長副歌聞名。" },
  { id: 46, question: "🐌", options: ["蝸牛", "魚", "燕尾蝶", "波斯貓"], answer: "蝸牛", explanation: "周杰倫 (Jay Chou) - 蝸牛。🐌(蝸牛)，非常勵志的經典歌曲。" },
  { id: 47, question: "🌌✨", options: ["星空", "星晴", "夜空中最亮的星", "克卜勒"], answer: "星晴", explanation: "周杰倫 (Jay Chou) - 星晴。🌌(星空) ✨(晴/亮)。" },
  { id: 48, question: "🌾🌺", options: ["稻香", "七里香", "菊花台", "花海"], answer: "稻香", explanation: "周杰倫 (Jay Chou) - 稻香。🌾(稻草) 🌺(香氣)。" },
  { id: 49, question: "🧚‍♀️📖", options: ["童話", "神話", "故事", "格林童話"], answer: "童話", explanation: "光良 - 童話。🧚‍♀️📖(仙子與書本 = 童話)，KTV不敗合唱金曲。" },
  { id: 50, question: "🙋‍♀️👩", options: ["女孩", "女人花", "我是女生", "姐姐妹妹站起來"], answer: "我是女生", explanation: "徐懷鈺 (Yuki) - 我是女生。🙋‍♀️(我是) 👩(女生)，千禧年平民天后的爆紅單曲。" },
  { id: 51, question: "🇹🇼🏙️🚫🏃‍♂️", options: ["台北哪會攏無人", "台北台北", "向前走", "台北的天空"], answer: "台北哪會攏無人", explanation: "陳建瑋 - 台北哪會攏無人。🇹🇼🏙️(台北) 🚫🏃‍♂️(沒人)，金曲歌王陳建瑋的經典台語創作。" },
  { id: 52, question: "⬛🐦", options: ["黑鳥", "燕尾蝶", "白鴿", "候鳥"], answer: "黑鳥", explanation: "陳建瑋 - 黑鳥。⬛(黑) 🐦(鳥)，收錄於金曲最佳台語專輯《古倫美亞》。" },
  { id: 53, question: "🗑️👨", options: ["糞埽人", "笨小孩", "拾荒者", "流浪漢"], answer: "糞埽人", explanation: "陳建瑋 - 糞埽人。🗑️(垃圾/糞埽) 👨(人)，描寫市井小民心聲的感人歌曲。" },
  { id: 54, question: "👵🤍💇‍♀️", options: ["阿嬤的白頭鬃", "阿嬤的話", "家後", "媽媽請妳也保重"], answer: "阿嬤的白頭鬃", explanation: "陳建瑋 - 阿嬤的白頭鬃。👵(阿嬤) 🤍💇‍♀️(白頭髮/頭鬃)，充滿思鄉與親情的催淚神曲。" },
  { id: 55, question: "🏃‍♀️🏃‍♀️🏃‍♀️", options: ["追追追", "向前走", "跑路", "快逃"], answer: "追追追", explanation: "黃妃 - 追追追。🏃‍♀️🏃‍♀️🏃‍♀️(追追追)，超經典的台語飆高音神曲。" },
  { id: 56, question: "😍🌹🌸", options: ["癡情玫瑰花", "玫瑰少年", "男孩看見野玫瑰", "花心"], answer: "癡情玫瑰花", explanation: "Under Lover - 癡情玫瑰花。😍(癡情) 🌹🌸(玫瑰花)，KTV帶動唱必備金曲。" },
  { id: 57, question: "😎➡️💔", options: ["帥到分手", "分手快樂", "算什麼男人", "以後別做朋友"], answer: "帥到分手", explanation: "周湯豪 - 帥到分手。😎(帥) ➡️💔(到分手)。" },
  { id: 58, question: "🗓️🗓️🗓️", options: ["那些年", "後來", "童話", "我們"], answer: "那些年", explanation: "胡夏 - 那些年。🗓️(日曆/年份)，《那些年，我們一起追的女孩》電影主題曲。" },
  { id: 59, question: "👻🕊️", options: ["隱形的翅膀", "燕尾蝶", "天使", "飛起來"], answer: "隱形的翅膀", explanation: "張韶涵 - 隱形的翅膀。👻(隱形/看不見) 🕊️(翅膀)。" },
  { id: 60, question: "⏪⏪", options: ["倒帶", "重來", "慢歌", "時光機"], answer: "倒帶", explanation: "蔡依林 (Jolin Tsai) - 倒帶。⏪⏪(倒帶/倒退)，周杰倫作曲的經典悲歌。" },
  { id: 61, question: "👫🚫💯", options: ["戀人未滿", "愛我別走", "朋友", "缺口"], answer: "戀人未滿", explanation: "S.H.E - 戀人未滿。👫(戀人) 🚫💯(還沒滿分/未滿)。" },
  { id: 62, question: "🕊️🗽", options: ["自由", "飛翔", "海闊天空", "解脫"], answer: "自由", explanation: "張震嶽 - 自由。🕊️🗽(象徵自由)，搖滾區跟著跳的超嗨歌曲。" },
  { id: 63, question: "💋👋", options: ["吻別", "分手快樂", "再見", "說散就散"], answer: "吻別", explanation: "張學友 - 吻別。💋(吻) 👋(道別)，歌神傳唱度最高的百萬金曲。" },
  { id: 64, question: "🦁❤️", options: ["勇氣", "倔強", "無畏", "相信"], answer: "勇氣", explanation: "梁靜茹 - 勇氣。🦁(獅子/象徵勇氣) ❤️(心)，「愛真的需要勇氣～」" },
  { id: 65, question: "☮️☀️", options: ["寧夏", "知足", "星晴", "暖暖"], answer: "寧夏", explanation: "梁靜茹 - 寧夏。☮️(安寧) ☀️(夏天)。" },
  { id: 66, question: "🐂💪", options: ["倔強", "勇敢", "鐵漢", "硬骨頭"], answer: "倔強", explanation: "五月天 (Mayday) - 倔強。🐂(牛脾氣) 💪(強硬/倔強)。" },
  { id: 67, question: "☁️❤️", options: ["溫柔", "暖暖", "體貼", "天使"], answer: "溫柔", explanation: "五月天 (Mayday) - 溫柔。☁️(雲朵/輕柔) ❤️(心)。" },
  { id: 68, question: "❤️🙋‍♂️🚫🚶‍♂️", options: ["愛我別走", "再見", "挽留", "不散"], answer: "愛我別走", explanation: "張震嶽 - 愛我別走。❤️(愛) 🙋‍♂️(我) 🚫🚶‍♂️(別走)。" },
  { id: 69, question: "🗣️🤥", options: ["說謊", "騙子", "真相", "成全"], answer: "說謊", explanation: "林宥嘉 - 說謊。🗣️(說) 🤥(謊/說謊的鼻子)。" },
  { id: 70, question: "🫧🫧", options: ["泡沫", "氣球", "水滴", "眼淚"], answer: "泡沫", explanation: "鄧紫棋 (G.E.M.) - 泡沫。🫧🫧(泡泡/泡沫)。" },
  { id: 71, question: "👨❤️👩", options: ["志明與春嬌", "梁山伯與茱麗葉", "男孩女孩", "製造浪漫"], answer: "志明與春嬌", explanation: "五月天 (Mayday) - 志明與春嬌。👨❤️👩(經典台客愛情故事主角)。" },
  { id: 72, question: "❤️👦1️⃣0️⃣0️⃣0️⃣0️⃣🗓️", options: ["愛你一萬年", "愛你", "千年之戀", "永久"], answer: "愛你一萬年", explanation: "伍佰 & China Blue - 愛你一萬年。❤️👦(愛你) 1️⃣0️⃣0️⃣0️⃣0️⃣ 🗓️(年)。" },
  { id: 73, question: "💃👑", options: ["姐姐", "舞孃", "女神", "天后"], answer: "姐姐", explanation: "謝金燕 - 姐姐。💃👑(電音女王/姐姐)，「跳針跳針跳針～」" },
  { id: 74, question: "🤝🙋‍♀️✋", options: ["牽阮的手", "牽手", "握手", "家後"], answer: "牽阮的手", explanation: "蘇芮/蔡琴 - 牽阮的手。🤝(牽) 🙋‍♀️(阮) ✋(手)。" },
  { id: 75, question: "🥋👊⛓️", options: ["雙截棍", "霍元甲", "龍拳", "忍者"], answer: "雙截棍", explanation: "周杰倫 (Jay Chou) - 雙截棍。🥋👊(武術) ⛓️(鐵鍊/雙截棍)。" },
  { id: 76, question: "🧮❓👨", options: ["算什麼男人", "笨小孩", "男子漢", "壞人"], answer: "算什麼男人", explanation: "周杰倫 (Jay Chou) - 算什麼男人。🧮(算) ❓(什麼) 👨(男人)。" },
  { id: 77, question: "👂👩🗣️", options: ["聽媽媽的話", "阿嬤的話", "落雨聲", "孝順"], answer: "聽媽媽的話", explanation: "周杰倫 (Jay Chou) - 聽媽媽的話。👂(聽) 👩(媽媽) 🗣️(的話)。" },
  { id: 78, question: "⬛🍊", options: ["黑色柳丁", "黑貓探戈", "橘子紅了", "暗黑"], answer: "黑色柳丁", explanation: "陶喆 - 黑色柳丁。⬛(黑色) 🍊(柳丁)。" },
  { id: 79, question: "✈️🐉⬇️🌌", options: ["飛龍在天", "龍的傳人", "龍拳", "天龍八部"], answer: "飛龍在天", explanation: "江宏恩等 - 飛龍在天。✈️(飛) 🐉(龍) ⬇️🌌(在天)，同名八點檔神級主題曲。" },
  { id: 80, question: "🌊👐🌌", options: ["海闊天空", "聽海", "看海", "藍天"], answer: "海闊天空", explanation: "信樂團 - 海闊天空。🌊(海) 👐(闊) 🌌(天空)。" },
  { id: 81, question: "💀👊❤️", options: ["死了都要愛", "愛到瘋癲", "殉情", "愛如潮水"], answer: "死了都要愛", explanation: "信樂團 - 死了都要愛。💀(死) 👊(都要) ❤️(愛)。" },
  { id: 82, question: "🇯🇵☢️❤️", options: ["廣島之戀", "東京鐵塔", "富士山下", "跨國戀"], answer: "廣島之戀", explanation: "莫文蔚/張洪量 - 廣島之戀。🇯🇵☢️(日本廣島) ❤️(戀)。" },
  { id: 83, question: "🏠⬆️", options: ["屋頂", "天台", "星空", "看星星"], answer: "屋頂", explanation: "吳宗憲/溫嵐 - 屋頂。🏠⬆️(屋子的頂端/屋頂)，KTV男女對唱神曲。" },
  { id: 84, question: "🏭🌹", options: ["製造浪漫", "浪漫手機", "花海", "玫瑰少年"], answer: "製造浪漫", explanation: "鄭中基/陳慧琳 - 製造浪漫。🏭(工廠/製造) 🌹(浪漫/玫瑰)。" },
  { id: 85, question: "🛣️🚶‍♂️9️⃣", options: ["忠孝東路走九遍", "向前走", "台北台北", "九份的咖啡店"], answer: "忠孝東路走九遍", explanation: "動力火車 - 忠孝東路走九遍。🛣️(馬路) 🚶‍♂️(走) 9️⃣(九遍)。" },
  { id: 86, question: "💔🏨", options: ["傷心酒店", "酒後的心聲", "孤女的願望", "失戀陣線聯盟"], answer: "傷心酒店", explanation: "江蕙/施文彬 - 傷心酒店。💔(傷心) 🏨(酒店)，台語對唱無敵金曲。" },
  { id: 87, question: "🪦👻🚶‍♂️", options: ["墓仔埔也敢去", "向前走", "勇敢", "鬼屋"], answer: "墓仔埔也敢去", explanation: "伍佰 - 墓仔埔也敢去。🪦👻(墓仔埔) 🚶‍♂️(也敢去)。" },
  { id: 88, question: "🔄❤️👩1️⃣", options: ["閣愛妳一擺", "愛你一萬年", "再愛我一次", "最後一次"], answer: "閣愛妳一擺", explanation: "茄子蛋 - 閣愛妳一擺。🔄(再/閣) ❤️(愛) 👩(妳) 1️⃣(一擺)。" },
  { id: 89, question: "🔪❤️⬇️📛", options: ["刻在我心底的名字", "你的名字", "心動", "烙印"], answer: "刻在我心底的名字", explanation: "盧廣仲 - 刻在我心底的名字。🔪(刻) ❤️⬇️(心底) 📛(名字)。" },
  { id: 90, question: "🌳🌿👤🐦", options: ["樹枝孤鳥", "黑鳥", "白鴿", "候鳥"], answer: "樹枝孤鳥", explanation: "伍佰 - 樹枝孤鳥。🌳🌿(樹枝) 👤(孤) 🐦(鳥)。" },
  { id: 91, question: "🆕🚫🔚❤️", options: ["新不了情", "不了情", "舊愛", "再見"], answer: "新不了情", explanation: "萬芳 - 新不了情。🆕(新) 🚫🔚(不了) ❤️(情)。" },
  { id: 92, question: "❤️🌊🌊", options: ["愛如潮水", "聽海", "海嘯", "洶湧"], answer: "愛如潮水", explanation: "張信哲 - 愛如潮水。❤️(愛) 🌊🌊(如潮水)。" },
  { id: 93, question: "🤷‍♂️🔁", options: ["還是會", "如果可以", "可能", "一定"], answer: "還是會", explanation: "韋禮安 - 還是會。🤷‍♂️🔁(還是會/重複)，偶像劇《我可能不會愛你》插曲。" },
  { id: 94, question: "🤪❤️💯", options: ["痴心絕對", "痴情玫瑰花", "真心", "絕對"], answer: "痴心絕對", explanation: "李聖傑 - 痴心絕對。🤪❤️(痴心) 💯(絕對)。" },
  { id: 95, question: "✋👐", options: ["手放開", "牽手", "分手", "放手"], answer: "手放開", explanation: "李聖傑 - 手放開。✋(手) 👐(放開)。" },
  { id: 96, question: "👤🌎⬆️", options: ["孤單北半球", "離開地球表面", "星空", "寂寞邊界"], answer: "孤單北半球", explanation: "林依晨 - 孤單北半球。👤(孤單) 🌎⬆️(北半球)。" },
  { id: 97, question: "😌🈵", options: ["知足", "滿意", "快樂", "幸福"], answer: "知足", explanation: "五月天 (Mayday) - 知足。😌🈵(滿足/知足)。" },
  { id: 98, question: "🟩🌟", options: ["綠光", "極光", "星晴", "綠洲"], answer: "綠光", explanation: "孫燕姿 - 綠光。🟩(綠) 🌟(光)。" },
  { id: 99, question: "👀🤝", options: ["遇見", "巧遇", "初戀", "錯過"], answer: "遇見", explanation: "孫燕姿 - 遇見。👀(看到) 🤝(結識/遇見)。" },
  { id: 100, question: "🇹🇼🗺️⬇️", options: ["國境之南", "漂向北方", "東風破", "西風的話"], answer: "國境之南", explanation: "范逸臣 - 國境之南。🇹🇼🗺️(國境) ⬇️(南)，《海角七號》電影神曲。" }
];

// ⚠️⚠️⚠️ 雲端設定區 ⚠️⚠️⚠️
// 請將您 Firebase 後台取得的設定貼在這裡
const firebaseConfig = {
  apiKey: "AIzaSyA4OiasIpT3b6PgWygJ3zI9x_Wpb-F9GT8",
  authDomain: "new-year-sing.firebaseapp.com",
  projectId: "new-year-sing",
  storageBucket: "new-year-sing.firebasestorage.app",
  messagingSenderId: "319810108067",
  appId: "1:319810108067:web:815f00eab3d5c6bf401d16"
};

// --- Firebase 初始化邏輯 ---
let app, auth, db;
let isCloudEnabled = false;

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isCloudEnabled = true;
    console.log("🔥 Firebase 連線成功！雲端功能已啟用。");
  } catch (e) {
    console.error("Firebase 初始化失敗:", e);
  }
}

const appId = 'emoji_song_game_v1';

// Confetti Effect (Pop Music Colors)
const Confetti = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-fall"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            animationDelay: `${Math.random() * 2}s`,
            backgroundColor: ['#FF69B4', '#00FFFF', '#FFD700', '#9370DB'][Math.floor(Math.random() * 4)],
            width: `${Math.random() * 6 + 6}px`,
            height: `${Math.random() * 10 + 10}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
    </div>
  );
};

export default function App() {
  const [isTailwindLoaded, setIsTailwindLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [gameState, setGameState] = useState('welcome');
  const [playerName, setPlayerName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [randomQuestions, setRandomQuestions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  
  // 成績與群組相關狀態
  const [scoreStatus, setScoreStatus] = useState('calculating');
  const [existingRecord, setExistingRecord] = useState(null);
  const [currentFinalStats, setCurrentFinalStats] = useState({ score: 0, time: 0 });
  
  // 群組功能
  const [groupId, setGroupId] = useState('public');
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [showGroupJoiner, setShowGroupJoiner] = useState(false);
  const [newGroupCode, setNewGroupCode] = useState('');
  const [joinGroupCode, setJoinGroupCode] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [creatorPassword, setCreatorPassword] = useState('');
  const [isCreatorAuth, setIsCreatorAuth] = useState(false);

  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(0);

  // --- 自動載入 Tailwind CSS ---
  useEffect(() => {
    if (window.tailwind) {
      setIsTailwindLoaded(true);
      return;
    }
    const scriptId = 'tailwind-cdn-script';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
    script.onload = () => setIsTailwindLoaded(true);
    const fallbackTimer = setTimeout(() => setIsTailwindLoaded(true), 1500);
    return () => clearTimeout(fallbackTimer);
  }, []);

  // --- 解析網址參數 ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
        const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '');
        if (cleanId) setGroupId(cleanId);
    }
  }, []);

  // --- 1. Firebase 登入 ---
  useEffect(() => {
    if (!isCloudEnabled) return;
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- 2. 監聽雲端排行榜資料 ---
  useEffect(() => {
    if (!isCloudEnabled) {
      const localKey = `emojisong_local_${groupId}`;
      const saved = localStorage.getItem(localKey);
      if (saved) setLeaderboard(JSON.parse(saved));
      else setLeaderboard([]);
      return;
    }

    if (!user) return;
    setLoadingLeaderboard(true);
    const collectionName = `emojisong_lb_${groupId}`;
    const q = collection(db, 'artifacts', appId, 'public', 'data', collectionName);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sortedData = data.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.time !== b.time) return a.time - b.time;
        return b.timestamp - a.timestamp; 
      }).slice(0, 50);

      setLeaderboard(sortedData);
      setLoadingLeaderboard(false);
    }, (error) => {
      console.error("Leaderboard error:", error);
      setLoadingLeaderboard(false);
    });
    return () => unsubscribe();
  }, [user, groupId]);

  // --- 3. 計時器邏輯 ---
  useEffect(() => {
    if (gameState === 'playing') {
      startTimeRef.current = Date.now();
      setTimer(0);
      timerIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - startTimeRef.current) / 1000;
        setTimer(elapsed);
      }, 50);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameState]);

  const startGame = () => {
    if (!playerName.trim()) return;
    // 隨機抽選 5 題
    const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 5);
    setRandomQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimer(0);
    setGameState('playing');
    setCopySuccess(false);
    setScoreStatus('calculating');
    setExistingRecord(null);
  };

  const handleAnswer = (option) => {
    if (showExplanation) return;
    setSelectedOption(option);
    const correct = option === randomQuestions[currentQuestionIndex].answer;
    setIsAnswerCorrect(correct);
    if (correct) setScore(prev => prev + 1);
    setShowExplanation(true);

    setTimeout(() => {
      setShowExplanation(false);
      setSelectedOption(null);
      if (currentQuestionIndex < randomQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        finishGame(correct);
      }
    }, 2000);
  };

  const finishGame = async (lastAnswerCorrect) => {
    const endTime = Date.now();
    const finalTime = (endTime - startTimeRef.current) / 1000;
    setTimer(finalTime);
    setGameState('result');
    const finalScore = score + (lastAnswerCorrect ? 1 : 0);
    setCurrentFinalStats({ score: finalScore, time: finalTime });

    // --- 單機版邏輯 ---
    if (!isCloudEnabled) {
      setScoreStatus('calculating');
      const localKey = `emojisong_local_${groupId}`;
      const saved = JSON.parse(localStorage.getItem(localKey) || '[]');
      const existingIndex = saved.findIndex(p => p.name === playerName);
      let isBetter = true;
      
      if (existingIndex !== -1) {
        const oldRecord = saved[existingIndex];
        setExistingRecord(oldRecord);
        if (finalScore < oldRecord.score || (finalScore === oldRecord.score && finalTime >= oldRecord.time)) {
          isBetter = false;
        }
      }

      if (isBetter) {
        setScoreStatus('better');
        const newRecord = {
            name: playerName, score: finalScore, time: finalTime,
            date: new Date().toLocaleDateString(), timestamp: Date.now()
        };
        let newLeaderboard;
        if (existingIndex !== -1) {
            saved[existingIndex] = newRecord;
            newLeaderboard = saved;
        } else {
            newLeaderboard = [...saved, newRecord];
        }
        newLeaderboard.sort((a, b) => {
             if (b.score !== a.score) return b.score - a.score;
             return a.time - b.time;
        });
        localStorage.setItem(localKey, JSON.stringify(newLeaderboard));
        setLeaderboard(newLeaderboard);
      } else {
        setScoreStatus('worse');
      }
      return;
    }

    // --- 雲端版邏輯 ---
    if (!user) return;
    setScoreStatus('calculating');
    const collectionName = `emojisong_lb_${groupId}`;

    try {
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', collectionName), where("name", "==", playerName));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0];
            const oldRecord = docData.data();
            setExistingRecord({ id: docData.id, ...oldRecord });

            const isBetter = finalScore > oldRecord.score || (finalScore === oldRecord.score && finalTime < oldRecord.time);
            if (isBetter) {
                setScoreStatus('better');
                await updateScore(docData.id, finalScore, finalTime, collectionName);
            } else {
                setScoreStatus('worse');
            }
        } else {
            setScoreStatus('uploading');
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', collectionName), {
                name: playerName, score: finalScore, time: finalTime,
                date: new Date().toLocaleDateString(), timestamp: Date.now(), userId: user.uid
            });
            setScoreStatus('done');
        }
    } catch (e) {
        console.error("Score process failed", e);
        setScoreStatus('done');
    }
  };

  const updateScore = async (docId, newScore, newTime, collectionName) => {
      setScoreStatus('uploading');
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, docId), {
            score: newScore, time: newTime,
            date: new Date().toLocaleDateString(), timestamp: Date.now()
        });
        setScoreStatus('done');
      } catch (e) {
          console.error("Update failed", e);
      }
  };

  const generateGroupLink = () => {
      if (!newGroupCode.trim()) return;
      const cleanCode = newGroupCode.trim().replace(/[^a-zA-Z0-9_-]/g, '');
      const baseUrl = window.location.href.split('?')[0].split('#')[0];
      const link = `${baseUrl}?id=${cleanCode}`;
      setGeneratedLink(link);
      setGroupId(cleanCode);
  };

  const joinGroup = () => {
      if(!joinGroupCode.trim()) return;
      const cleanCode = joinGroupCode.trim().replace(/[^a-zA-Z0-9_-]/g, '');
      setGroupId(cleanCode);
      setShowGroupJoiner(false);
  };

  const copyLink = () => {
    if(!generatedLink) return;
    const textArea = document.createElement("textarea");
    textArea.value = generatedLink;
    document.body.appendChild(textArea);
    textArea.select();
    try { document.execCommand('copy'); alert("連結已複製！"); } catch (err) {}
    document.body.removeChild(textArea);
  };

  const copyResultToClipboard = () => {
    const currentUrl = window.location.href; 
    const text = `🎶 Emoji 猜歌王 🎶\n群組: ${groupId === 'public' ? '公開' : groupId}\n👤 挑戰者: ${playerName}\n✅ 答對: ${currentFinalStats.score} / 5 題\n⏱️ 耗時: ${currentFinalStats.time.toFixed(2)} 秒\n🏆 點此挑戰我的排名: ${currentUrl}`;
    
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {}
    document.body.removeChild(textArea);
  };

  if (!isTailwindLoaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', color: '#ecfeff', fontSize: '20px', fontFamily: 'sans-serif', flexDirection: 'column', gap: '10px' }}>
        <div>🎶</div>
        <div>正在準備音樂舞台...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-indigo-50 overflow-hidden relative selection:bg-pink-500 selection:text-white">
      {/* Background Gradients (Neon Vibes) */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-pink-600 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-600 rounded-full opacity-20 translate-x-1/3 translate-y-1/3 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-700 rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>

      <div className="max-w-md mx-auto min-h-screen flex flex-col relative z-10 bg-white/5 backdrop-blur-sm shadow-2xl border-x border-white/10">
        
        {/* Header */}
        <div className="p-4 text-center border-b border-white/10">
          <h1 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-300 drop-shadow-md flex items-center justify-center gap-2">
            <Music className="w-6 h-6 text-pink-400 animate-pulse" />
            Emoji 猜歌王
            <Music className="w-6 h-6 text-cyan-400 animate-pulse" />
          </h1>
          <p className="text-xs text-purple-300 font-medium mt-1 tracking-widest">台灣金曲挑戰賽</p>

          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 text-xs border border-white/10">
             <Cloud className={`w-3 h-3 ${isCloudEnabled ? 'text-cyan-400' : 'text-gray-400'}`}/>
             {isCloudEnabled ? '雲端連線中' : '單機模式'}
             <span className="mx-1 text-white/30">|</span>
             {groupId === 'public' ? '全民公開賽' : `群組: ${groupId}`}
             {groupId !== 'public' && (
                 <button onClick={() => setGroupId('public')} className="ml-2 text-pink-400 hover:text-pink-300 underline">退出</button>
             )}
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col justify-center">
          
          {gameState === 'welcome' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <Music className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">你是 KTV 霸主嗎？</h2>
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-600/50 text-left space-y-2 backdrop-blur-sm">
                    <p className="text-cyan-300 font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4"/> 看 Emoji 猜出台灣金曲
                    </p>
                    <p className="text-cyan-300 font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4"/> 隨機 5 題，比速度比準度
                    </p>
                    <p className="text-cyan-300 font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4"/> 排行榜只保留個人最高分
                    </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-600 focus-within:border-pink-500 transition-colors shadow-inner">
                  <input
                    type="text"
                    placeholder="輸入你的打歌名號 (暱稱)"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full bg-transparent text-center text-white placeholder-slate-400 outline-none px-4 py-2 text-lg font-medium"
                    maxLength={10}
                  />
                </div>
                <button
                  onClick={startGame}
                  disabled={!playerName.trim()}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(236,72,153,0.5)] transform transition hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  開始挑戰
                </button>
                <div className="flex gap-2">
                    <button 
                      onClick={() => setGameState('leaderboard')}
                      className="flex-1 bg-white/10 text-white font-medium py-3 rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2 border border-white/5"
                    >
                      <Trophy className="w-4 h-4" />
                      百大DJ榜
                    </button>
                    {groupId === 'public' && (
                        <button 
                            onClick={() => {
                                setShowGroupJoiner(!showGroupJoiner);
                                setShowGroupCreator(false);
                            }}
                            className="flex-1 bg-cyan-600/20 text-cyan-100 border border-cyan-400/30 font-medium py-3 rounded-xl hover:bg-cyan-600/40 transition-colors flex items-center justify-center gap-2"
                        >
                            <Users className="w-4 h-4" />
                            包廂連線
                        </button>
                    )}
                </div>
              </div>

              {/* 手動加入群組區塊 */}
              {showGroupJoiner && (
                   <div className="mt-4 bg-slate-800/80 p-4 rounded-xl border border-cyan-500/30 animate-in fade-in zoom-in duration-300">
                       <p className="text-xs text-cyan-200 mb-2">輸入包廂代號進入專屬排行榜</p>
                       <div className="flex gap-2">
                           <input 
                             type="text" 
                             className="flex-1 p-2 rounded bg-black/40 text-white border border-white/10 text-sm outline-none focus:border-cyan-400"
                             placeholder="例如: KTV888"
                             value={joinGroupCode}
                             onChange={(e) => setJoinGroupCode(e.target.value)}
                           />
                           <button onClick={joinGroup} className="bg-cyan-600 hover:bg-cyan-500 px-4 rounded text-white text-sm font-bold transition-colors">進入</button>
                       </div>
                   </div>
              )}

              {/* 團主開團區塊 */}
              <div className="pt-6 border-t border-white/10 text-center">
                  <button 
                    onClick={() => {
                        setShowGroupCreator(!showGroupCreator);
                        setShowGroupJoiner(false);
                    }}
                    className="text-xs text-pink-300/70 hover:text-pink-300 underline flex items-center justify-center gap-1 mx-auto transition-colors"
                  >
                    <LinkIcon className="w-3 h-3"/> 我要開專屬包廂 (自訂排行榜)
                  </button>

                  {showGroupCreator && (
                      <div className="mt-4 bg-purple-900/40 p-4 rounded-xl border border-purple-500/30 text-left space-y-3 animate-in fade-in zoom-in duration-300">
                          {!isCreatorAuth ? (
                              <>
                                  <p className="text-xs text-purple-200">請輸入管理密碼解鎖開團：</p>
                                  <div className="flex gap-2">
                                      <input 
                                        type="password" 
                                        placeholder="輸入密碼" 
                                        className="flex-1 p-2 rounded bg-black/40 text-white text-sm border border-white/20 outline-none focus:border-purple-400"
                                        value={creatorPassword}
                                        onChange={(e) => setCreatorPassword(e.target.value)}
                                      />
                                      <button 
                                        onClick={() => {
                                            if(creatorPassword === '8888') {
                                                setIsCreatorAuth(true);
                                            } else {
                                                alert('密碼錯誤！');
                                                setCreatorPassword('');
                                            }
                                        }}
                                        className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-4 rounded shrink-0 transition-colors"
                                      >
                                        解鎖
                                      </button>
                                  </div>
                              </>
                          ) : (
                              <>
                                  <p className="text-xs text-purple-200">設定一個英文或數字代號，產生連結傳給朋友！</p>
                                  <div className="flex gap-2">
                                      <input 
                                        type="text" 
                                        placeholder="包廂代號(限英數字)" 
                                        className="flex-1 p-2 rounded bg-black/40 text-white text-sm border border-white/20 outline-none focus:border-purple-400"
                                        value={newGroupCode}
                                        onChange={(e) => {
                                            setNewGroupCode(e.target.value);
                                            setGeneratedLink(''); 
                                        }}
                                      />
                                      <button 
                                        onClick={generateGroupLink}
                                        className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-3 rounded shrink-0 transition-colors"
                                      >
                                        產生
                                      </button>
                                  </div>
                                  
                                  {generatedLink && (
                                      <div className="bg-black/30 p-2 rounded space-y-2 border border-white/10">
                                          <div className="flex items-center justify-between gap-2">
                                              <div className="truncate text-xs text-white/70 flex-1 p-1">{generatedLink}</div>
                                              <button onClick={copyLink} className="bg-pink-600 hover:bg-pink-500 px-3 py-1.5 rounded text-xs font-bold text-white shrink-0 flex items-center gap-1 transition-colors"><Copy className="w-3 h-3"/> 複製</button>
                                          </div>
                                      </div>
                                  )}
                              </>
                          )}
                      </div>
                  )}
              </div>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="w-full max-w-sm mx-auto space-y-6">
              <div className="flex justify-between items-center bg-slate-800/80 p-3 rounded-lg border border-slate-700 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-1 rounded-full text-white shadow-sm">
                    Track {currentQuestionIndex + 1}/5
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-cyan-300 text-xl font-bold min-w-[80px] justify-end">
                  <Timer className="w-5 h-5" />
                  {timer.toFixed(1)}s
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-[0_0_30px_rgba(255,255,255,0.1)] min-h-[160px] flex items-center justify-center text-center relative overflow-hidden">
                <div className="relative z-10 w-full">
                  <p className="text-slate-400 text-xs font-bold mb-3 uppercase tracking-widest">猜出這首歌</p>
                  <h3 className="text-5xl tracking-widest leading-relaxed font-emoji drop-shadow-sm">
                    {randomQuestions[currentQuestionIndex].question}
                  </h3>
                </div>
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-slate-100 rounded-bl-full -mr-8 -mt-8 z-0"></div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {randomQuestions[currentQuestionIndex].options.map((option, idx) => {
                  let btnClass = "w-full p-4 rounded-xl text-left font-bold transition-all transform duration-200 border-2 text-lg ";
                  if (selectedOption === option) {
                     if (isAnswerCorrect) {
                       btnClass += "bg-green-500 border-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)] scale-[1.02]";
                     } else {
                       btnClass += "bg-red-500 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]";
                     }
                  } else if (showExplanation && option === randomQuestions[currentQuestionIndex].answer) {
                    btnClass += "bg-green-500 border-green-400 text-white shadow-lg animate-pulse";
                  } else {
                    btnClass += "bg-slate-800/60 border-slate-600 hover:bg-slate-700/80 text-indigo-100 hover:border-pink-400/50 backdrop-blur-sm";
                  }
                  return (
                    <button key={idx} onClick={() => handleAnswer(option)} disabled={showExplanation} className={btnClass}>
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {selectedOption === option && isAnswerCorrect && <CheckCircle className="w-6 h-6" />}
                        {selectedOption === option && !isAnswerCorrect && <XCircle className="w-6 h-6" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Pop-up */}
              {showExplanation && (
                <div className={`animate-in fade-in slide-in-from-bottom-2 duration-300 border-l-4 p-4 rounded-r shadow-lg mt-4 ${isAnswerCorrect ? 'bg-green-900/40 border-green-400 text-green-100' : 'bg-red-900/40 border-red-400 text-red-100'}`}>
                  <p className="font-bold text-sm mb-1 flex items-center gap-2">
                      {isAnswerCorrect ? "🎉 水啦！" : "😅 漏氣了喔！"}
                  </p>
                  <p className="text-sm opacity-90">{randomQuestions[currentQuestionIndex].explanation}</p>
                </div>
              )}
            </div>
          )}

          {gameState === 'result' && (
            <div className="text-center space-y-6 animate-in zoom-in duration-500 relative">
              <Confetti />
              
              <div className="bg-slate-800/60 backdrop-blur-md rounded-3xl p-6 border border-slate-600 shadow-2xl">
                <div className="relative inline-block">
                  {/* 使用不同的隨機頭像 API 配合現代感 */}
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${playerName}&backgroundColor=transparent`} alt="avatar" className="w-20 h-20 rounded-full border-4 border-pink-400 mx-auto bg-white/10" />
                  <div className="absolute -bottom-2 -right-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    DJ {playerName}
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                      <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">精準度 (Hits)</p>
                      <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">{currentFinalStats.score} <span className="text-lg text-slate-500 font-normal">/ 5</span></p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                      <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">節奏 (Time)</p>
                      <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-400">{currentFinalStats.time.toFixed(2)}<span className="text-lg text-slate-500 font-normal">s</span></p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-600/50 pt-4">
                    {scoreStatus === 'calculating' && (
                         <p className="text-cyan-300 animate-pulse text-sm font-medium">連線榜單比對中...</p>
                    )}
                    
                    {scoreStatus === 'done' && (
                        <p className="text-green-400 font-bold text-sm bg-green-900/30 py-2 rounded-lg border border-green-800/50">✅ 成績已成功上傳百大榜單</p>
                    )}

                    {scoreStatus === 'better' && (
                        <div className="animate-bounce mt-2">
                             <p className="text-yellow-400 font-black text-lg drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]">👑 刷新個人金曲紀錄！</p>
                        </div>
                    )}

                    {scoreStatus === 'worse' && existingRecord && (
                        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700 mt-2">
                            <p className="text-slate-300 text-sm font-bold flex items-center justify-center gap-1">
                                <AlertTriangle className="w-4 h-4 text-pink-400"/>
                                未打破個人最佳紀錄
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                歷史最佳: <span className="text-cyan-300 font-mono">{existingRecord.score}分 ({existingRecord.time.toFixed(2)}s)</span>
                            </p>
                            
                            <button 
                                onClick={() => updateScore(existingRecord.id, currentFinalStats.score, currentFinalStats.time, `emojisong_lb_${groupId}`)}
                                className="mt-3 text-[10px] text-slate-400 hover:text-white underline flex items-center justify-center gap-1 mx-auto transition-colors"
                            >
                                <Save className="w-3 h-3"/>
                                強制用這次成績覆蓋
                            </button>
                        </div>
                    )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={copyResultToClipboard}
                  className={`w-full font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transform transition hover:scale-[1.02] active:scale-95 ${
                    copySuccess ? "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]" : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                  }`}
                >
                  {copySuccess ? <CheckCircle className="w-5 h-5"/> : <Share2 className="w-5 h-5" />}
                  {copySuccess ? "戰績已複製！" : "分享戰績炫耀一下"}
                </button>
                <div className="flex gap-3">
                    <button onClick={() => setGameState('welcome')} className="flex-1 bg-slate-800 border border-slate-600 hover:bg-slate-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                        <RefreshCcw className="w-4 h-4" /> 再開一局
                    </button>
                    <button onClick={() => setGameState('leaderboard')} className="flex-1 bg-pink-500/20 border border-pink-500/30 hover:bg-pink-500/40 text-pink-200 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                        <Medal className="w-4 h-4" /> 看排行榜
                    </button>
                </div>
              </div>
            </div>
          )}

          {gameState === 'leaderboard' && (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right duration-300">
              <div className="flex items-end justify-between mb-6 pb-4 border-b border-white/10">
                 <div>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 flex items-center gap-2">
                        {groupId === 'public' ? '公開' : groupId} 百大名單
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Cloud className={`w-3 h-3 ${isCloudEnabled ? 'text-cyan-500' : 'text-slate-500'}`} />
                        {isCloudEnabled ? '雲端即時同步' : '單機模式'} / 取個人最佳
                    </p>
                 </div>
                 <button onClick={() => setGameState('welcome')} className="text-sm bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-white transition-colors border border-slate-600">
                   返回大廳
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loadingLeaderboard ? (
                    <div className="text-center text-cyan-300 py-10 flex flex-col items-center gap-3">
                        <Sparkles className="animate-spin w-8 h-8" />
                        <span className="font-medium tracking-widest text-sm">讀取榜單中...</span>
                    </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center bg-slate-800/50 p-6 rounded-xl border border-slate-700 mt-10">
                    <p className="text-slate-300 font-medium">還沒有人上榜，快去搶頭香！</p>
                    {!isCloudEnabled && <p className="text-xs mt-2 text-pink-400">(目前為單機模式，僅顯示本機紀錄)</p>}
                  </div>
                ) : (
                  <div className="space-y-3 pb-10">
                    {leaderboard.map((entry, idx) => {
                      const isMe = entry.name === playerName;
                      const isTop3 = idx < 3;
                      return (
                      <div key={entry.id || idx} className={`bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between border relative overflow-hidden group transition-all hover:bg-slate-700/80 ${isMe ? 'border-pink-500/50 shadow-[0_0_10px_rgba(236,72,153,0.2)]' : 'border-slate-700/50'}`}>
                        {isTop3 && (
                             <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                                 idx === 0 ? 'bg-gradient-to-b from-yellow-300 to-yellow-500' : 
                                 idx === 1 ? 'bg-gradient-to-b from-slate-300 to-slate-400' : 
                                 'bg-gradient-to-b from-orange-400 to-orange-600'
                             }`}></div>
                        )}
                        <div className="flex items-center gap-4">
                          <div className={`w-8 text-center font-black ${
                              idx === 0 ? 'text-yellow-400 text-2xl drop-shadow-md' : 
                              idx === 1 ? 'text-slate-300 text-xl' :
                              idx === 2 ? 'text-orange-400 text-xl' :
                              'text-slate-500 text-lg'
                          }`}>{idx + 1}</div>
                          <div>
                            <p className="font-bold text-indigo-50 flex items-center gap-2 text-lg">
                                {entry.name}
                                {isMe && <span className="text-[10px] font-black bg-pink-500 text-white px-1.5 py-0.5 rounded shadow-sm">我</span>}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">{entry.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-cyan-400 font-black text-lg">{entry.score} <span className="text-xs text-cyan-400/50 font-normal">pts</span></p>
                          <p className="text-xs text-pink-300/80 font-mono">{entry.time.toFixed(2)}s</p>
                        </div>
                        {idx === 0 && <div className="absolute top-0 right-0 p-2"><Trophy className="w-5 h-5 text-yellow-400/30"/></div>}
                      </div>
                    )})}
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
                目前顯示：包廂 [{groupId}] 
              </div>
            </div>
          )}

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap');
        
        .font-emoji {
          font-family: 'Noto Color Emoji', sans-serif;
        }
        
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
        }
        
        /* 訂製滾動條 */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(236, 72, 153, 0.5); /* Pink 500 */
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(236, 72, 153, 0.8);
        }
      `}} />
    </div>
  );
}