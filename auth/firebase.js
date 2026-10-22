// src/auth/firebase.js (最新 v10 寫法)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 你的 Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyDUwnKiTdmlJaSLADPxwt4OdLqUpfod0Ck",
  authDomain: "hoshino-game.firebaseapp.com",
  projectId: "hoshino-game",
  storageBucket: "hoshino-game.firebasestorage.app",
  messagingSenderId: "1040701395385",
  appId: "1:1040701395385:web:0693d9afed8c8f9c61e668",
  measurementId: "G-Q7FH95E3Z7"
};

// 初始化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

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
    signInWithPopup(auth, provider).catch((err) => {
      console.error('登入失敗:', err);
      alert('登入失敗，請確認是否阻擋彈出視窗，或授權網域是否正確。');
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
