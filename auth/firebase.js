// src/auth/firebase.js (v10.8.0 終極整合版)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUwnKiTdmlJaSLADPxwt4OdLqUpfod0Ck",
  authDomain: "hoshino-game.firebaseapp.com",
  projectId: "hoshino-game",
  storageBucket: "hoshino-game.firebasestorage.app",
  messagingSenderId: "1040701395385",
  appId: "1:1040701395385:web:0693d9afed8c8f9c61e668",
  measurementId: "G-Q7FH95E3Z7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let isLoggingIn = false; 

export const CloudAuth = {
  init() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        const userData = await CloudAuth.loadFromCloud();
        window.cloudSaveData = userData;
        
        const loginBtnText = document.getElementById('login-btn-text');
        const loginBtn = document.getElementById('btn-google-login');
        if (loginBtnText && loginBtn) {
          loginBtnText.innerText = `已登入：${user.displayName ? user.displayName.split(' ')[0] : '使用者'}`;
          loginBtn.classList.remove('bg-white/20');
          loginBtn.classList.add('bg-[#A8E6CF]/90', 'text-[#4A3326]');
        }

        // 👇👇👇 新增：通知 main.js 套用雲端存檔 👇👇👇
        if (userData) {
          console.log('☁️ 雲端存檔已下載，發送 cloudSaveLoaded 事件');
          window.dispatchEvent(new CustomEvent('cloudSaveLoaded', { detail: userData }));
        }
        // 👆👆👆 新增結束 👆👆👆

      } else {
        currentUser = null;
        window.cloudSaveData = null;

        const loginBtnText = document.getElementById('login-btn-text');
        const loginBtn = document.getElementById('btn-google-login');
        if (loginBtnText && loginBtn) {
          loginBtnText.innerText = '使用 Google 帳號登入';
          loginBtn.classList.add('bg-white/20');
          loginBtn.classList.remove('bg-[#A8E6CF]/90', 'text-[#4A3326]');
        }
      }
    });
  },

  async login(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    if (isLoggingIn) return;

    const ua = navigator.userAgent || '';
    if (/Line|FBAN|FBAV|Instagram/i.test(ua)) {
      alert('請點擊右上角或右下角選單，選擇「使用預設瀏覽器 (Safari / Chrome) 開啟」以進行 Google 登入！');
      return;
    }

    isLoggingIn = true;
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('登入失敗詳細資訊:', err);

      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return;
      }

      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      if (err.code === 'auth/network-request-failed' && isStandalone) {
        alert('iOS 主畫面模式可能會中斷 Google 彈窗連線。\n請先直接在 Safari 瀏覽器中開啟網址完成登入！');
        return;
      }

      if (err.code === 'auth/unauthorized-domain') {
        alert(`登入失敗！\n代碼: ${err.code}\n請至 Firebase 後台 Authorized domains 將「${window.location.hostname}」加入授權清單。`);
      } else if (err.code === 'auth/popup-blocked') {
        alert(`登入視窗被瀏覽器攔截！\n請允許此網站開啟彈出式視窗後再試一次。`);
      } else if (err.code === 'auth/network-request-failed') {
        alert(`網路請求失敗 (${err.code})！\n1. 請確認已重新整理網頁更新 Service Worker 快取\n2. 請檢查網路連線或暫時關閉 VPN / 擋廣告外掛。`);
      } else {
        alert(`登入失敗！\n代碼: ${err.code}\n訊息: ${err.message}`);
      }
    } finally {
      isLoggingIn = false;
    }
  },

  async logout() {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('登出失敗:', e);
    }
  },

  async saveToCloud(dataToSave) {
    if (!currentUser) {
      console.warn('⚠️ 尚未登入，無法儲存至雲端');
      return;
    }
    try {
      await setDoc(doc(db, 'saves', currentUser.uid), dataToSave);
      console.log('☁️ 雲端存檔成功');
    } catch (e) {
      console.error('❌ 雲端存檔失敗 (請檢查 Firestore 規則):', e);
    }
  },

  async loadFromCloud() {
    if (!currentUser) return null;
    try {
      const docSnap = await getDoc(doc(db, 'saves', currentUser.uid));
      if (docSnap.exists()) return docSnap.data();
      return null;
    } catch (e) {
      console.error('❌ 讀取雲端失敗:', e);
      return null;
    }
  }
};
