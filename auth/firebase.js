// src/auth/firebase.js (v10.8.0 手機穩定版)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  getRedirectResult, // 👈 新增：接收跳轉回來的結果
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

export const CloudAuth = {
  init() {
    // 1. 處理從 Google 跳轉回來的登入結果
    getRedirectResult(auth).then((result) => {
      if (result) {
        console.log('✅ 登入成功，歡迎回來！', result.user.displayName);
      }
    }).catch((error) => {
      console.error('❌ 登入重定向失敗:', error);
      alert(`登入失敗 (${error.code})，請確認網域授權或稍後再試。`);
    });

    // 2. 監聽登入狀態的變化
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
        
        if (userData) {
          window.dispatchEvent(new CustomEvent('cloudSaveLoaded', { detail: userData }));
        }
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

  login() {
    const provider = new GoogleAuthProvider();
    // 👇 改為 signInWithRedirect，這在手機上是穩定的做法
    signInWithRedirect(auth, provider).catch((err) => {
      console.error('登入失敗:', err);
      alert(`登入失敗 (${err.code})，請確認網路連線。`);
    });
  },

  logout() {
    signOut(auth);
  },

  async saveToCloud(dataToSave) {
    if (!currentUser) return;
    try {
      await setDoc(doc(db, 'saves', currentUser.uid), dataToSave);
      console.log('☁️ 雲端存檔成功');
    } catch (e) {
      console.error('雲端存檔失敗:', e);
    }
  },

  async loadFromCloud() {
    if (!currentUser) return null;
    try {
      const docSnap = await getDoc(doc(db, 'saves', currentUser.uid));
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (e) {
      console.error('讀取雲端失敗:', e);
      return null;
    }
  }
};
