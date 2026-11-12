// src/auth/firebase.js (v10.8.0 終極整合版：支援 iOS Safari / PWA Redirect 備援)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
let authInitialized = false;

export const CloudAuth = {
  init() {
    if (authInitialized) return;
    authInitialized = true;

    // 處理從 Google 登入頁面跳轉 (Redirect) 回來後的結果
    getRedirectResult(auth).catch((err) => {
      if (err && err.code !== 'auth/null-user') {
        console.warn('Redirect 登入結果異常:', err.code, err.message);
      }
    });

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        const userData = await CloudAuth.loadFromCloud();
        window.cloudSaveData = userData;

        const loginBtnText = document.getElementById('login-btn-text');
        const loginBtn = document.getElementById('btn-google-login');
        if (loginBtnText && loginBtn) {
          loginBtnText.innerText = `已登入：${user.displayName ? user.displayName.split(' ')[0] : '店長'}`;
          loginBtn.classList.remove('bg-black/40', 'bg-white/20', 'text-white');
          loginBtn.classList.add('bg-[#A8E6CF]/90', 'text-[#4A3326]');
        }

        if (userData) {
          console.log('☁️ 雲端存檔已下載，發送 cloudSaveLoaded 事件');
          window.dispatchEvent(new CustomEvent('cloudSaveLoaded', { detail: userData }));
        }
      } else {
        currentUser = null;
        window.cloudSaveData = null;

        const loginBtnText = document.getElementById('login-btn-text');
        const loginBtn = document.getElementById('btn-google-login');
        if (loginBtnText && loginBtn) {
          loginBtnText.innerText = '使用 Google 帳號同步進度';
          loginBtn.classList.add('bg-black/40', 'text-white');
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

    const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    try {
      // iOS 主畫面 PWA 模式優先採用 Redirect，避免彈窗失聯
      if (isIOS && isStandalone) {
        await signInWithRedirect(auth, provider);
        return;
      }
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('登入失敗詳細資訊:', err);

      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }

      // 若彈窗被 Safari 攔截或環境不支援，自動改用跳轉登入
      if (
        err.code === 'auth/popup-blocked' ||
        err.code === 'auth/operation-not-supported-in-this-environment' ||
        (isIOS && err.code === 'auth/network-request-failed')
      ) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirErr) {
          console.error('Redirect 備援登入失敗:', redirErr);
        }
      }

      if (err.code === 'auth/unauthorized-domain') {
        alert(`登入失敗！\n代碼: ${err.code}\n請至 Firebase 後台 Authorized domains 將「${window.location.hostname}」加入授權清單。`);
      } else if (err.code === 'auth/popup-blocked') {
        alert('登入視窗被瀏覽器攔截！請允許彈出式視窗，或改用 Safari 瀏覽器開啟後再試一次。');
      } else if (err.code === 'auth/network-request-failed') {
        alert(`網路請求失敗 (${err.code})！\n1. 請確認已重新整理網頁更新快取\n2. 請檢查網路連線或暫時關閉阻擋追蹤器。`);
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
    if (!currentUser) return;
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
