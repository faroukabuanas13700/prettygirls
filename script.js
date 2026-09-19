SCRIPT.JS — REMPLACER TOUT L'ANCIEN BLOC "FIREBASE AUTHENTICATION" DE FIN DE FICHIER PAR CECI

/* =========================================================
   FIREBASE AUTHENTICATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  const authScreen = document.getElementById("authScreen");

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

  function showLogin() {
    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    loginMessage.textContent = "";
    signupMessage.textContent = "";
  }

  function showSignup() {
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
    loginMessage.textContent = "";
    signupMessage.textContent = "";
  }

  showSignupBtn.addEventListener("click", showSignup);
  showLoginBtn.addEventListener("click", showLogin);

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      authScreen.classList.add("authenticated");
      app.classList.add("authenticated");

      try {
        const profileRef = db.collection("profiles").doc(user.uid);
        const profileDoc = await profileRef.get();

        if (profileDoc.exists) {
          const profile = profileDoc.data();

          const username = profile.username || profile.display_name || "PrettyGirls";
          const displayName = profile.display_name || username;
          const bio = profile.bio || "Bienvenue sur PrettyGirls ❤️";

          const profileUsernameTop = document.getElementById("profileUsernameTop");
          const profileDisplayName = document.getElementById("profileDisplayName");
          const profileBio = document.getElementById("profileBio");

          if (profileUsernameTop) profileUsernameTop.textContent = username;
          if (profileDisplayName) profileDisplayName.textContent = displayName;
          if (profileBio) profileBio.textContent = bio;
        }
      } catch (error) {
        console.error("Erreur chargement profil :", error);
      }
    } else {
      app.classList.remove("authenticated");
      authScreen.classList.remove("authenticated");
      showLogin();
    }
  });

  signupBtn.addEventListener("click", async () => {
    const username = signupUsername.value.trim();
    const email = signupEmail.value.trim();
    const password = signupPassword.value;
    const confirmation = signupPasswordConfirm.value;

    signupMessage.textContent = "";

    if (!username) {
      signupMessage.textContent = "Choisis un nom d'utilisateur.";
      return;
    }

    if (!email) {
      signupMessage.textContent = "Entre ton adresse e-mail.";
      return;
    }

    if (password.length < 6) {
      signupMessage.textContent = "Le mot de passe doit contenir au moins 6 caractères.";
      return;
    }

    if (password !== confirmation) {
      signupMessage.textContent = "Les deux mots de passe ne correspondent pas.";
      return;
    }

    signupBtn.disabled = true;
    signupBtn.textContent = "Création...";

    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);

      await db.collection("profiles").doc(result.user.uid).set({
        username: username,
        email: email,
        display_name: username,
        bio: "Bienvenue sur PrettyGirls ❤️",
        created_at: firebase.firestore.FieldValue.serverTimestamp()
      });

      signupMessage.textContent = "";
    } catch (error) {
      signupMessage.textContent = firebaseAuthMessage(error);
    } finally {
      signupBtn.disabled = false;
      signupBtn.textContent = "Créer mon compte";
    }
  });

  loginBtn.addEventListener("click", async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    loginMessage.textContent = "";

    if (!email || !password) {
      loginMessage.textContent = "Entre ton e-mail et ton mot de passe.";
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Connexion...";

    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      loginMessage.textContent = firebaseAuthMessage(error);
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Se connecter";
    }
  });

  function firebaseAuthMessage(error) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "Cette adresse e-mail possède déjà un compte.";
      case "auth/invalid-email":
        return "L'adresse e-mail n'est pas valide.";
      case "auth/weak-password":
        return "Le mot de passe est trop faible.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "E-mail ou mot de passe incorrect.";
      case "auth/too-many-requests":
        return "Trop de tentatives. Réessaie un peu plus tard.";
      default:
        return error.message || "Une erreur est survenue.";
    }
  }
});
