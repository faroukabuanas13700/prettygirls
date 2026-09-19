const firebaseConfig = {
  apiKey: "AIzaSyBSDUYIIzNi-6WJz_QpEOE6KQKEQ9no3Y0",
  authDomain: "prettygirls-8e2cf.firebaseapp.com",
  projectId: "prettygirls-8e2cf",
  storageBucket: "prettygirls-8e2cf.firebasestorage.app",
  messagingSenderId: "54340647655",
  appId: "1:54340647655:web:02a86d117d8073c21d0042",
  measurementId: "G-25PE8MX3WD"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const app=$("app"), authScreen=$("authScreen"), authVideo=$("authVideo");
  const loginForm=$("loginForm"), signupForm=$("signupForm");
  const loginEmail=$("loginEmail"), loginPassword=$("loginPassword"), loginBtn=$("loginBtn"), loginMessage=$("loginMessage");
  const signupUsername=$("signupUsername"), signupEmail=$("signupEmail"), signupPassword=$("signupPassword"), signupPasswordConfirm=$("signupPasswordConfirm"), signupBtn=$("signupBtn"), signupMessage=$("signupMessage");

  $("showSignupBtn").onclick=()=>{loginForm.classList.add("hidden");signupForm.classList.remove("hidden");};
  $("showLoginBtn").onclick=$("showLoginTextBtn").onclick=()=>{signupForm.classList.add("hidden");loginForm.classList.remove("hidden");};

  function msg(e){
    switch(e.code){
      case "auth/email-already-in-use":return"Cette adresse e-mail possède déjà un compte.";
      case "auth/invalid-email":return"L'adresse e-mail n'est pas valide.";
      case "auth/weak-password":return"Le mot de passe est trop faible.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":return"E-mail ou mot de passe incorrect.";
      case "auth/too-many-requests":return"Trop de tentatives. Réessaie plus tard.";
      default:return e.message||"Une erreur est survenue.";
    }
  }

  loginBtn.onclick=async()=>{
    loginMessage.textContent="";
    if(!loginEmail.value.trim()||!loginPassword.value){loginMessage.textContent="Entre ton e-mail et ton mot de passe.";return;}
    loginBtn.disabled=true;loginBtn.textContent="Connexion...";
    try{await auth.signInWithEmailAndPassword(loginEmail.value.trim(),loginPassword.value);}
    catch(e){loginMessage.textContent=msg(e);}
    finally{loginBtn.disabled=false;loginBtn.textContent="Se connecter";}
  };

  signupBtn.onclick=async()=>{
    const username=signupUsername.value.trim(),email=signupEmail.value.trim(),password=signupPassword.value,confirm=signupPasswordConfirm.value;
    signupMessage.textContent="";
    if(username.length<3){signupMessage.textContent="Le nom d'utilisateur doit contenir au moins 3 caractères.";return;}
    if(!/^[a-zA-Z0-9._]+$/.test(username)){signupMessage.textContent="Utilise seulement lettres, chiffres, points ou _.";return;}
    if(!email){signupMessage.textContent="Entre ton adresse e-mail.";return;}
    if(password.length<6){signupMessage.textContent="Le mot de passe doit contenir au moins 6 caractères.";return;}
    if(password!==confirm){signupMessage.textContent="Les deux mots de passe ne correspondent pas.";return;}
    signupBtn.disabled=true;signupBtn.textContent="Création...";
    try{
      const result=await auth.createUserWithEmailAndPassword(email,password);
      await db.collection("profiles").doc(result.user.uid).set({
        username,email,display_name:username,bio:"Bienvenue sur PrettyGirls ❤️",
        created_at:firebase.firestore.FieldValue.serverTimestamp()
      });
    }catch(e){signupMessage.textContent=msg(e);}
    finally{signupBtn.disabled=false;signupBtn.textContent="Créer mon compte";}
  };

  auth.onAuthStateChanged(async user=>{
    if(!user){
      app.classList.remove("authenticated");authScreen.classList.remove("authenticated");document.body.classList.add("auth-active");
      if(authVideo){authVideo.muted=true;authVideo.play().catch(()=>{});}
      return;
    }
    authScreen.classList.add("authenticated");app.classList.add("authenticated");document.body.classList.remove("auth-active");
    if(authVideo)authVideo.pause();
    try{
      const snap=await db.collection("profiles").doc(user.uid).get();
      if(snap.exists){
        const p=snap.data(),u=p.username||p.display_name||"prettygirls",n=p.display_name||u,b=p.bio||"Bienvenue sur PrettyGirls ❤️";
        if($("profileUsernameTop"))$("profileUsernameTop").textContent=u;
        if($("profileDisplayName"))$("profileDisplayName").textContent=n;
        if($("profileBio"))$("profileBio").textContent=b;
        const letter=u.charAt(0).toUpperCase();
        if($("profileAvatarLarge"))$("profileAvatarLarge").textContent=letter;
        const mini=document.querySelector(".mini-avatar");if(mini)mini.textContent=letter;
      }
    }catch(e){console.error(e);}
  });

  /* Interface principale */
  const feed=$("feed"),emptyFeed=$("emptyFeed"),createPost=$("createPost"),imagePicker=$("imagePicker");
  const sourceChoice=$("sourceChoice"),chooseUpload=$("chooseUpload"),chooseExternal=$("chooseExternal"),cancelSource=$("cancelSource");
  const externalModal=$("externalModal"),externalBack=$("externalBack"),externalInput=$("externalInput"),externalContinue=$("externalContinue"),externalError=$("externalError");
  const publishChoice=$("publishChoice"),selectedCount=$("selectedCount"),chooseCarousel=$("chooseCarousel"),chooseGrid=$("chooseGrid"),cancelPublish=$("cancelPublish");
  let pendingMedia=[],posts=[];

  createPost.onclick=()=>sourceChoice.classList.add("open");
  cancelSource.onclick=()=>sourceChoice.classList.remove("open");
  chooseUpload.onclick=()=>{sourceChoice.classList.remove("open");imagePicker.value="";imagePicker.click();};
  imagePicker.onchange=e=>{
    pendingMedia=[...e.target.files].map(file=>({type:file.type.startsWith("video/")?"video":"image",url:URL.createObjectURL(file),local:true,file}));
    if(pendingMedia.length){selectedCount.textContent=`${pendingMedia.length} média${pendingMedia.length>1?"s":""} sélectionné${pendingMedia.length>1?"s":""}`;publishChoice.classList.add("open");}
  };
  chooseExternal.onclick=()=>{sourceChoice.classList.remove("open");externalModal.classList.add("open");};
  externalBack.onclick=()=>{externalModal.classList.remove("open");sourceChoice.classList.add("open");};
  externalContinue.onclick=()=>{
    const urls=(externalInput.value.match(/https?:\/\/[^\s<>"'\]]+/gi)||[]);
    pendingMedia=urls.map(url=>({type:/\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)?"image":/\.(mp4|webm|mov)(\?|$)/i.test(url)?"video":"iframe",url,local:false}));
    if(!pendingMedia.length){externalError.textContent="Aucun média valide détecté.";return;}
    externalModal.classList.remove("open");selectedCount.textContent=`${pendingMedia.length} média(s) sélectionné(s)`;publishChoice.classList.add("open");
  };
  cancelPublish.onclick=()=>{publishChoice.classList.remove("open");pendingMedia=[];};

  function publish(layout){
    if(!pendingMedia.length)return;
    posts.unshift({id:Date.now().toString(),layout,media:[...pendingMedia],liked:false,likes:0});
    pendingMedia=[];publishChoice.classList.remove("open");render();
  }
  chooseCarousel.onclick=()=>publish("carousel");chooseGrid.onclick=()=>publish("grid");

  function mediaEl(m){
    const el=document.createElement(m.type==="image"?"img":m.type==="video"?"video":"iframe");el.src=m.url;
    if(m.type==="video"){el.controls=true;el.playsInline=true;}if(m.type==="iframe")el.allowFullscreen=true;return el;
  }
  function render(){
    feed.querySelectorAll(".post").forEach(x=>x.remove());
    emptyFeed.classList.toggle("hidden",posts.length>0);
    posts.forEach(p=>{
      const a=document.createElement("article");a.className="post";
      a.innerHTML=`<div class="post-header"><div class="avatar">P</div><div class="post-user"><strong>prettygirls</strong></div><button class="more-btn">•••</button></div>`;
      const mc=document.createElement("div");mc.className="post-media";
      const wrap=document.createElement("div");wrap.className=p.layout==="grid"?"post-grid grid-"+Math.min(p.media.length,4):"post-carousel-track";
      p.media.forEach(m=>{const box=document.createElement("div");box.className=p.layout==="grid"?"grid-item":"post-slide";box.appendChild(mediaEl(m));wrap.appendChild(box);});
      mc.appendChild(wrap);a.appendChild(mc);
      const actions=document.createElement("div");actions.className="post-actions";actions.innerHTML=`<div class="left-actions"><button class="action-btn like-btn">♡</button><button class="action-btn">◯</button><button class="action-btn">↗</button></div><button class="action-btn">♡</button>`;
      a.appendChild(actions);const likes=document.createElement("div");likes.className="likes";likes.innerHTML="<strong>0 J’aime</strong>";a.appendChild(likes);
      const cap=document.createElement("div");cap.className="caption";cap.innerHTML="<strong>prettygirls</strong> Bienvenue sur PrettyGirls ❤️";a.appendChild(cap);feed.appendChild(a);
    });
    if($("profilePostCount"))$("profilePostCount").textContent=posts.length;
  }

  $("homeNav").onclick=()=>{$("profilePage").classList.remove("open");document.querySelectorAll(".home-ui").forEach(e=>e.style.display="");};
  $("profileNav").onclick=()=>{document.querySelectorAll(".home-ui").forEach(e=>e.style.display="none");$("profilePage").classList.add("open");};
  $("editProfileBtn").onclick=()=>{$("editDisplayName").value=$("profileDisplayName").textContent;$("editBio").value=$("profileBio").textContent;$("editProfileModal").classList.add("open");};
  $("cancelEditProfile").onclick=()=>$("editProfileModal").classList.remove("open");
  $("saveEditProfile").onclick=async()=>{
    const name=$("editDisplayName").value.trim()||"PrettyGirls",bio=$("editBio").value.trim()||"Bienvenue sur PrettyGirls ❤️";
    $("profileDisplayName").textContent=name;$("profileBio").textContent=bio;$("editProfileModal").classList.remove("open");
    if(auth.currentUser)await db.collection("profiles").doc(auth.currentUser.uid).set({display_name:name,bio},{merge:true});
  };
  render();
});
