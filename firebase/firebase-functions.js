import { auth, db } from './firebase-config.js';
import { signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { doc, setDoc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const provider = new GoogleAuthProvider();

export async function login() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName,
        piBalance: 0,
        coinBalance: 100,
        plots: [{ id: 1, planted: false }],
        upgrades: {},
        panenCount: 0,
        level: 1
      });
    }
    return user;
  } catch (error) {
    console.error('Login error:', error);
  }
}

export async function updateUserData(uid, data) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
}

export async function getUserData(uid) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
}

export async function updateLeaderboard() {
  const leaderboardList = document.getElementById('leaderboard-list');
  const q = query(collection(db, 'users'), orderBy('coinBalance', 'desc'), limit(10));
  const topUsers = await getDocs(q);
  leaderboardList.innerHTML = topUsers.docs.map(doc => `<li>${doc.data().displayName}: ${doc.data().coinBalance}</li>`).join('');
}
