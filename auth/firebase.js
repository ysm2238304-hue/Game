// ============================================================
// 🔐 src/auth/firebase.js — Firebase 登入與雲端存檔
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDUwnKiTdmlJaSLADPxwt4OdLqUpfod0Ck",
  authDomain: "hoshino-game.firebaseapp.com",
  projectId: "hoshino-game",
  storageBucket: "hoshino-game.firebasestorage.app",
  messagingSenderId: "1040701395385",
  appId: "1:1040701395385:web:0693d9afed8c8f9c61e668",
  measurementId: "G-Q7FH95E3Z7"
};

let auth, db;
let currentUser = null;

export const CloudAuth = {
  init() {
    // 如果找不到 Firebase 全域變數，代表 CDN 沒載入成功
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK 未載入');
      return;
    }

    // 初始化 Firebase
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();

    // 監聽登入狀態
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        currentUser = user;
        const userData = await CloudAuth.loadFromCloud();
        
        // 因為這裡拿不到 GameState，我們暫時把資料存在全域變數
        window.cloudSaveData = userData;
        
        // 更新歡迎頁的登入按鈕狀態
        const loginBtnText = document.getElementById('login-btn-text');
        const loginBtn = document.getElementById('btn-google-login');
        if (loginBtnText && loginBtn) {
          loginBtnText.innerText = `已登入：${user.displayName.split(' ')[0]}`;
          loginBtn.classList.remove('bg-white/20');
          loginBtn.classList.add('bg-[#A8E6CF]/90', 'text-[#4A3326]');
        }
        
        // 如果雲端有存檔，透過自訂事件通知 main.js 進行合併
        if (userData) {
          window.dispatchEvent(new CustomEvent('cloudSaveLoaded', { detail: userData }));
        }
      } else {
        currentUser = null;
        window.cloudSaveData = null;

        // 👇 新增：復原按鈕狀態 👇
        const loginBtnText = document.getElementById('login-btn-text');
        const loginBtn = document.getElementById('btn-google-login');
        if (loginBtnText && loginBtn) {
          loginBtnText.innerText = '使用 Google 帳號登入';
          loginBtn.classList.add('bg-white/20');
          loginBtn.classList.remove('bg-[#A8E6CF]/90', 'text-[#4A3326]');
        }
        // 👆 新增結束 👆
      }
    });
  },

  login() {
    if (!auth) return;
    const provider = new firebase.auth.GoogleAuthProvider();
    // 使用 popup 彈出視窗登入
    auth.signInWithPopup(provider).catch((err) => {
      console.error('登入失敗:', err);
      alert('登入失敗，請確認瀏覽器是否阻擋彈出視窗，或授權網域是否設定正確。');
    });
  },

  logout() {
    if (auth) auth.signOut();
  },

  async saveToCloud(dataToSave) {
    if (!currentUser || !db) return;
    try {
      await db.collection('saves').doc(currentUser.uid).set(dataToSave);
      console.log('☁️ 雲端存檔成功');
    } catch (e) {
      console.error('雲端存檔失敗:', e);
    }
  },

  async loadFromCloud() {
    if (!currentUser || !db) return null;
    try {
      const doc = await db.collection('saves').doc(currentUser.uid).get();
      if (doc.exists) {
        return doc.data();
      }
      return null;
    } catch (e) {
      console.error('讀取雲端失敗:', e);
      return null;
    }
  }
};
