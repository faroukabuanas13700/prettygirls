PRETTYGIRLS — script.js — REMPLACEMENT DU BLOC FIREBASE AUTHENTICATION

Garde le firebaseConfig, firebase.initializeApp(), auth et db au début du fichier.
Garde également tout le code actuel de l'application.
Supprime uniquement l'ancien bloc "FIREBASE AUTHENTICATION" situé à la fin et remplace-le par :

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  const authScreen = document.getElementById("authScreen");
  const authVideo = document.getElementById("authVideo");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginBtn = document.getElementById("loginBtn");
  const loginMessage = document.getElementById("loginMessage");
  const signupUsername = document.getElementById("signupUsername");
  const signupEmail = document.getElementById("signupEmail");
  const signupPassword = document.getElementById("signupPassword");
  const signupPasswordConfirm = document.getElementById("signupPasswordConfirm");
  const signupBtn = document.getElementById("signupBtn");
  const signupMessage = document.getElementById("signupMessage");
  const showSignupBtn = document.getElementById("showSignupBtn");
  const showLoginBtn = document.getElementById("showLoginBtn");
  const showLoginTextBtn = document.getElementById("showLoginTextBtn");

  function showLogin() {
    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    loginMessage.textContent = "";
    signupMessage.textContent = "";
    authScreen.scrollTo({top:0, behavior:"smooth"});
  }

  function showSignup() {
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
    loginMessage.textContent = "";
    signupMessage.textContent = "";
    authScreen.scrollTo({top:0, behavior:"smooth"});
  }

  showSignupBtn.addEventListener("click", showSignup);
  showLoginBtn.addEventListener("click", showLogin);
  showLoginTextBtn.addEventListener("click", showLogin);
  loginPassword.addEventListener("keydown", e => { if (e.key === "Enter") loginBtn.click(); });

  auth.onAuthStateChanged(async user => {
    if (!user) {
      app.classList.remove("authenticated");
      authScreen.classList.remove("authenticated");
      document.body.classList.add("auth-active");
      showLogin();
      if (authVideo) {
        authVideo.muted = true;
        const p = authVideo.play();
        if (p) p.catch(() => {});
      }
      return;
    }

    authScreen.classList.add("authenticated");
    app.classList.add("authenticated");
    document.body.classList.remove("auth-active");
    if (authVideo) authVideo.pause();

    try {
      const ref = db.collection("profiles").doc(user.uid);
      const snap = await ref.get();
      if (!snap.exists) {
        await ref.set({
          email: user.email || "",
          username: "",
          display_name: "",
          bio: "",
          created_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        return;
      }
      const profile = snap.data();
      const username = profile.username || profile.display_name || "prettygirls";
      const displayName = profile.display_name || profile.username || "PrettyGirls";
      const bio = profile.bio || "Bienvenue sur PrettyGirls ❤️";
      const top = document.getElementById("profileUsernameTop");
      const name = document.getElementById("profileDisplayName");
      const bioEl = document.getElementById("profileBio");
      const avatar = document.getElementById("profileAvatarLarge");
      const mini = document.querySelector(".mini-avatar");
      if (top) top.textContent = username;
      if (name) name.textContent = displayName;
      if (bioEl) bioEl.textContent = bio;
      const letter = (username || "P").charAt(0).toUpperCase();
      if (avatar) avatar.textContent = letter;
      if (mini) mini.textContent = letter;
    } catch (e) { console.error("Erreur chargement profil :", e); }
  });

  signupBtn.addEventListener("click", async () => {
    const username = signupUsername.value.trim();
    const email = signupEmail.value.trim();
    const password = signupPassword.value;
    const confirmation = signupPasswordConfirm.value;
    signupMessage.textContent = "";

    if (username.length < 3) return signupMessage.textContent = "Le nom d'utilisateur doit contenir au moins 3 caractères.";
    if (!/^[a-zA-Z0-9._]+$/.test(username)) return signupMessage.textContent = "Utilise seulement des lettres, chiffres, points ou _.";
    if (!email) return signupMessage.textContent = "Entre ton adresse e-mail.";
    if (password.length < 6) return signupMessage.textContent = "Le mot de passe doit contenir au moins 6 caractères.";
    if (password !== confirmation) return signupMessage.textContent = "Les deux mots de passe ne correspondent pas.";

    signupBtn.disabled = true;
    signupBtn.textContent = "Création du compte...";
    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      await db.collection("profiles").doc(result.user.uid).set({
        username, email, display_name: username,
        bio: "Bienvenue sur PrettyGirls ❤️",
        created_at: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      signupMessage.textContent = authMessage(e);
    } finally {
      signupBtn.disabled = false;
      signupBtn.textContent = "Créer mon compte";
    }
  });

  loginBtn.addEventListener("click", async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    loginMessage.textContent = "";
    if (!email || !password) return loginMessage.textContent = "Entre ton e-mail et ton mot de passe.";
    loginBtn.disabled = true;
    loginBtn.textContent = "Connexion...";
    try { await auth.signInWithEmailAndPassword(email, password); }
    catch (e) { loginMessage.textContent = authMessage(e); }
    finally { loginBtn.disabled = false; loginBtn.textContent = "Se connecter"; }
  });

  function authMessage(e) {
    switch (e.code) {
      case "auth/email-already-in-use": return "Cette adresse e-mail possède déjà un compte.";
      case "auth/invalid-email": return "L'adresse e-mail n'est pas valide.";
      case "auth/weak-password": return "Le mot de passe est trop faible.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found": return "E-mail ou mot de passe incorrect.";
      case "auth/too-many-requests": return "Trop de tentatives. Réessaie un peu plus tard.";
      case "auth/network-request-failed": return "Vérifie ta connexion Internet.";
      default: return e.message || "Une erreur est survenue.";
    }
  }
});
