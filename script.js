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

  const feed = document.getElementById("feed");
  const emptyFeed = document.getElementById("emptyFeed");

  const createPost = document.getElementById("createPost");
  const imagePicker = document.getElementById("imagePicker");

  const sourceChoice = document.getElementById("sourceChoice");
  const chooseUpload = document.getElementById("chooseUpload");
  const chooseExternal = document.getElementById("chooseExternal");
  const cancelSource = document.getElementById("cancelSource");

  const externalModal = document.getElementById("externalModal");
  const externalBack = document.getElementById("externalBack");
  const externalInput = document.getElementById("externalInput");
  const externalContinue = document.getElementById("externalContinue");
  const externalError = document.getElementById("externalError");

  const publishChoice = document.getElementById("publishChoice");
  const selectedCount = document.getElementById("selectedCount");
  const chooseCarousel = document.getElementById("chooseCarousel");
  const chooseGrid = document.getElementById("chooseGrid");
  const cancelPublish = document.getElementById("cancelPublish");

  const viewer = document.getElementById("viewer");
  const viewerTrack = document.getElementById("viewerTrack");
  const viewerCounter = document.getElementById("viewerCounter");
  const viewerPrev = document.getElementById("viewerPrev");
  const viewerNext = document.getElementById("viewerNext");
  const closeViewer = document.getElementById("closeViewer");
  const viewerLike = document.getElementById("viewerLike");
  const viewerLikeCount = document.getElementById("viewerLikeCount");

  const homeNav = document.getElementById("homeNav");
  const profileNav = document.getElementById("profileNav");
  const profilePage = document.getElementById("profilePage");
  const profileGrid = document.getElementById("profileGrid");
  const profileEmpty = document.getElementById("profileEmpty");
  const profilePostCount = document.getElementById("profilePostCount");
  const editProfileBtn = document.getElementById("editProfileBtn");
  const editProfileModal = document.getElementById("editProfileModal");
  const cancelEditProfile = document.getElementById("cancelEditProfile");
  const saveEditProfile = document.getElementById("saveEditProfile");
  const editDisplayName = document.getElementById("editDisplayName");
  const editBio = document.getElementById("editBio");
  const profileDisplayName = document.getElementById("profileDisplayName");
  const profileBio = document.getElementById("profileBio");
  const shareProfileBtn = document.getElementById("shareProfileBtn");
  const profileTabs = Array.from(document.querySelectorAll(".profile-tab"));
  const homeUI = Array.from(document.querySelectorAll(".home-ui"));

  let pendingMedia = [];
  let posts = [];

  let activePost = null;
  let viewerIndex = 0;
  let activeProfileTab = "posts";


  /* ========================================
     ICÔNES
  ======================================== */

  const heartIcon = `
    <svg viewBox="0 0 24 24">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
    </svg>
  `;

  const commentIcon = `
    <svg viewBox="0 0 24 24">
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.5 9.5 0 0 1-4-.9L3 21l1.7-4.6A8.5 8.5 0 1 1 21 11.5z"/>
    </svg>
  `;

  const shareIcon = `
    <svg viewBox="0 0 24 24">
      <path d="M22 2L9.5 14.5M22 2l-8 20-4.5-7.5L2 10l20-8z"/>
    </svg>
  `;

  const bookmarkIcon = `
    <svg viewBox="0 0 24 24">
      <path d="M6 3h12v18l-6-4-6 4V3z"/>
    </svg>
  `;


  /* ========================================
     BOUTON +
  ======================================== */

  createPost.addEventListener("click", () => {

    sourceChoice.classList.add("open");
    document.body.style.overflow = "hidden";

  });


  /* ========================================
     ANNULER CHOIX SOURCE
  ======================================== */

  cancelSource.addEventListener("click", () => {

    sourceChoice.classList.remove("open");
    document.body.style.overflow = "";

  });


  /* ========================================
     TÉLÉVERSER DEPUIS APPAREIL
  ======================================== */

  chooseUpload.addEventListener("click", () => {

    sourceChoice.classList.remove("open");

    imagePicker.value = "";

    imagePicker.click();

  });


  imagePicker.addEventListener("change", event => {

    const files = Array.from(event.target.files);

    if (!files.length) {
      document.body.style.overflow = "";
      return;
    }

    clearPendingMedia();

    pendingMedia = files.map(file => {

      const isVideo =
        file.type.startsWith("video/");

      return {
        type: isVideo ? "video" : "image",
        url: URL.createObjectURL(file),
        local: true,
        file: file
      };

    });

    openLayoutChoice();

  });


  /* ========================================
     OUVRIR MÉDIAS EXTERNES
  ======================================== */

  chooseExternal.addEventListener("click", () => {

    sourceChoice.classList.remove("open");

    externalInput.value = "";
    externalError.textContent = "";

    externalModal.classList.add("open");

  });


  externalBack.addEventListener("click", () => {

    externalModal.classList.remove("open");

    sourceChoice.classList.add("open");

  });


  /* ========================================
     ANALYSER MÉDIAS EXTERNES
  ======================================== */

  externalContinue.addEventListener("click", () => {

    const text = externalInput.value.trim();

    externalError.textContent = "";

    if (!text) {

      externalError.textContent =
        "Colle au moins un lien, iframe ou BBCode.";

      return;

    }

    const foundMedia =
      parseExternalMedia(text);

    if (!foundMedia.length) {

      externalError.textContent =
        "Aucun média valide détecté.";

      return;

    }

    clearPendingMedia();

    pendingMedia = foundMedia;

    externalModal.classList.remove("open");

    openLayoutChoice();

  });


  /* ========================================
     EXTRAIRE LES MÉDIAS
  ======================================== */

  function parseExternalMedia(text) {

    const results = [];
    const used = new Set();


    function addMedia(type, url) {

      if (!url) return;

      url = decodeHtml(url.trim());

      if (!isSafeHttpUrl(url)) return;

      const key = `${type}:${url}`;

      if (used.has(key)) return;

      used.add(key);

      results.push({
        type: type,
        url: url,
        local: false
      });

    }


    /* -------------------------
       BBCode [img]
    ------------------------- */

    const imgBB =
      /\[img(?:=[^\]]*)?\]([\s\S]*?)\[\/img\]/gi;

    let match;

    while ((match = imgBB.exec(text)) !== null) {

      addMedia(
        "image",
        match[1]
      );

    }


    /* -------------------------
       BBCode [video]
    ------------------------- */

    const videoBB =
      /\[video(?:=[^\]]*)?\]([\s\S]*?)\[\/video\]/gi;

    while ((match = videoBB.exec(text)) !== null) {

      addMedia(
        detectUrlType(match[1], "video"),
        match[1]
      );

    }


    /* -------------------------
       BBCode [url]
    ------------------------- */

    const urlBB =
      /\[url(?:=([^\]]+))?\]([\s\S]*?)\[\/url\]/gi;

    while ((match = urlBB.exec(text)) !== null) {

      const url =
        match[1] || match[2];

      addMedia(
        detectUrlType(url),
        url
      );

    }


    /* -------------------------
       HTML
    ------------------------- */

    const parser =
      new DOMParser();

    const doc =
      parser.parseFromString(
        text,
        "text/html"
      );


    doc.querySelectorAll("img").forEach(element => {

      addMedia(
        "image",
        element.getAttribute("src")
      );

    });


    doc.querySelectorAll("video").forEach(element => {

      const src =
        element.getAttribute("src") ||
        element.querySelector("source")?.getAttribute("src");

      addMedia(
        "video",
        src
      );

    });


    doc.querySelectorAll("iframe").forEach(element => {

      addMedia(
        "iframe",
        element.getAttribute("src")
      );

    });


    /* -------------------------
       URLS BRUTES
    ------------------------- */

    const cleanedText = text
      .replace(/\[img(?:=[^\]]*)?\][\s\S]*?\[\/img\]/gi, " ")
      .replace(/\[video(?:=[^\]]*)?\][\s\S]*?\[\/video\]/gi, " ")
      .replace(/\[url(?:=[^\]]+)?\][\s\S]*?\[\/url\]/gi, " ")
      .replace(/<img\b[^>]*>/gi, " ")
      .replace(/<video\b[\s\S]*?<\/video>/gi, " ")
      .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, " ");


    const rawUrls =
      cleanedText.match(
        /https?:\/\/[^\s<>"'\]]+/gi
      ) || [];


    rawUrls.forEach(url => {

      url = url.replace(
        /[),.;]+$/,
        ""
      );

      addMedia(
        detectUrlType(url),
        url
      );

    });


    return results;

  }


  /* ========================================
     DÉTECTER TYPE D'UNE URL
  ======================================== */

  function detectUrlType(
    url,
    fallback = "iframe"
  ) {

    if (!url) return fallback;

    const clean =
      url.split("?")[0]
        .split("#")[0]
        .toLowerCase();


    if (
      /\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)$/i.test(clean)
    ) {

      return "image";

    }


    if (
      /\.(mp4|webm|ogg|ogv|mov|m4v)$/i.test(clean)
    ) {

      return "video";

    }


    return fallback;

  }


  /* ========================================
     URL HTTP/HTTPS UNIQUEMENT
  ======================================== */

  function isSafeHttpUrl(url) {

    try {

      const parsed =
        new URL(url);

      return (
        parsed.protocol === "https:" ||
        parsed.protocol === "http:"
      );

    } catch {

      return false;

    }

  }


  /* ========================================
     DÉCODER &amp; ETC.
  ======================================== */

  function decodeHtml(value) {

    const textarea =
      document.createElement("textarea");

    textarea.innerHTML = value;

    return textarea.value;

  }


  /* ========================================
     CHOIX CARROUSEL / GRILLE
  ======================================== */

  function openLayoutChoice() {

    const total =
      pendingMedia.length;

    selectedCount.textContent =
      total === 1
        ? "1 média sélectionné"
        : `${total} médias sélectionnés`;

    publishChoice.classList.add("open");

    document.body.style.overflow = "hidden";

  }


  cancelPublish.addEventListener("click", () => {

    publishChoice.classList.remove("open");

    document.body.style.overflow = "";

    clearPendingMedia();

  });


  chooseCarousel.addEventListener("click", () => {

    createNewPost("carousel");

  });


  chooseGrid.addEventListener("click", () => {

    createNewPost("grid");

  });


  /* ========================================
     CRÉER PUBLICATION
  ======================================== */

  function createNewPost(layout) {

    if (!pendingMedia.length) return;


    const post = {

      id:
        Date.now().toString() +
        Math.random()
          .toString(16)
          .slice(2),

      layout: layout,

      media: pendingMedia.map(item => ({
        ...item
      })),

      liked: false,

      likes: 0,

      currentIndex: 0

    };


    pendingMedia = [];

    posts.unshift(post);


    publishChoice.classList.remove("open");

    document.body.style.overflow = "";


    renderFeed();
    renderProfileGrid();

  }


  /* ========================================
     AFFICHER FEED
  ======================================== */

  function renderFeed() {

    feed
      .querySelectorAll(".post")
      .forEach(element => {
        element.remove();
      });


    if (!posts.length) {

      emptyFeed.classList.remove("hidden");

      return;

    }


    emptyFeed.classList.add("hidden");


    posts.forEach(post => {

      feed.appendChild(
        createPostElement(post)
      );

    });

  }


  /* ========================================
     CRÉER POST
  ======================================== */

  function createPostElement(post) {

    const article =
      document.createElement("article");

    article.className = "post";

    article.dataset.postId =
      post.id;


    /* EN-TÊTE */

    const header =
      document.createElement("div");

    header.className =
      "post-header";

    header.innerHTML = `
      <div class="avatar">P</div>

      <div class="post-user">
        <strong>prettygirls</strong>
      </div>

      <button
        class="more-btn"
        type="button"
      >
        •••
      </button>
    `;

    article.appendChild(header);


    /* MÉDIAS */

    const mediaContainer =
      document.createElement("div");

    mediaContainer.className =
      "post-media";


    if (post.layout === "grid") {

      createGrid(
        post,
        mediaContainer
      );

    } else {

      createCarousel(
        post,
        mediaContainer
      );

    }


    article.appendChild(
      mediaContainer
    );


    /* ACTIONS */

    const actions =
      document.createElement("div");

    actions.className =
      "post-actions";

    actions.innerHTML = `
      <div class="left-actions">

        <button
          class="action-btn like-btn ${
            post.liked ? "liked" : ""
          }"
          type="button"
        >
          ${heartIcon}
        </button>

        <button
          class="action-btn"
          type="button"
        >
          ${commentIcon}
        </button>

        <button
          class="action-btn"
          type="button"
        >
          ${shareIcon}
        </button>

      </div>

      <button
        class="action-btn"
        type="button"
      >
        ${bookmarkIcon}
      </button>
    `;


    const likeButton =
      actions.querySelector(
        ".like-btn"
      );


    likeButton.addEventListener(
      "click",
      () => {

        post.liked =
          !post.liked;

        post.likes =
          post.liked ? 1 : 0;

        updatePostLike(
          article,
          post
        );

      }
    );


    article.appendChild(actions);


    /* LIKES */

    const likes =
      document.createElement("div");

    likes.className = "likes";

    likes.innerHTML = `
      <strong class="post-like-count">
        ${post.likes} J’aime
      </strong>
    `;

    article.appendChild(likes);


    /* LÉGENDE */

    const caption =
      document.createElement("div");

    caption.className =
      "caption";

    caption.innerHTML = `
      <strong>prettygirls</strong>
      Bienvenue sur PrettyGirls ❤️
    `;

    article.appendChild(caption);


    return article;

  }


  /* ========================================
     CRÉER UN ÉLÉMENT MÉDIA
  ======================================== */

  function createMediaElement(
    item,
    viewerMode = false
  ) {

    let element;


    if (item.type === "image") {

      element =
        document.createElement("img");

      element.src = item.url;

      element.alt = "Publication PrettyGirls";

      element.loading = "lazy";

      return element;

    }


    if (item.type === "video") {

      element =
        document.createElement("video");

      element.src = item.url;

      element.controls = true;

      element.playsInline = true;

      element.preload = "metadata";

      return element;

    }


    element =
      document.createElement("iframe");

    element.src = item.url;

    element.allowFullscreen = true;

    element.loading = "lazy";

    element.referrerPolicy =
      "strict-origin-when-cross-origin";

    element.setAttribute(
      "allow",
      "autoplay; fullscreen; picture-in-picture"
    );

    return element;

  }


  /* ========================================
     CARROUSEL
  ======================================== */

  function createCarousel(
    post,
    container
  ) {

    const carousel =
      document.createElement("div");

    carousel.className =
      "post-carousel";


    const track =
      document.createElement("div");

    track.className =
      "post-carousel-track";


    post.media.forEach(
      (item, index) => {

        const slide =
          document.createElement("div");

        slide.className =
          "post-slide";


        const element =
          createMediaElement(item);


        slide.appendChild(element);

        track.appendChild(slide);


        if (item.type !== "iframe") {

          element.addEventListener(
            "click",
            () => {

              openFullViewer(
                post,
                index
              );

            }
          );

        }

      }
    );


    carousel.appendChild(track);


    if (post.media.length === 1) {

      container.appendChild(
        carousel
      );

      return;

    }


    const counter =
      document.createElement("div");

    counter.className =
      "carousel-counter";


    const dots =
      document.createElement("div");

    dots.className =
      "carousel-dots";


    post.media.forEach(
      (item, index) => {

        const dot =
          document.createElement("span");

        dot.className =
          index === post.currentIndex
            ? "carousel-dot active"
            : "carousel-dot";

        dots.appendChild(dot);

      }
    );


    const prev =
      document.createElement("button");

    prev.type = "button";

    prev.className =
      "carousel-arrow carousel-prev";

    prev.textContent = "‹";


    const next =
      document.createElement("button");

    next.type = "button";

    next.className =
      "carousel-arrow carousel-next";

    next.textContent = "›";


    carousel.appendChild(counter);
    carousel.appendChild(dots);
    carousel.appendChild(prev);
    carousel.appendChild(next);


    function update() {

      counter.textContent =
        `${post.currentIndex + 1}/${post.media.length}`;


      dots
        .querySelectorAll(".carousel-dot")
        .forEach(
          (dot, index) => {

            dot.classList.toggle(
              "active",
              index ===
              post.currentIndex
            );

          }
        );


      prev.style.visibility =
        post.currentIndex === 0
          ? "hidden"
          : "visible";


      next.style.visibility =
        post.currentIndex ===
        post.media.length - 1
          ? "hidden"
          : "visible";

    }


    prev.addEventListener(
      "click",
      event => {

        event.stopPropagation();

        if (
          post.currentIndex <= 0
        ) return;

        post.currentIndex--;

        track.scrollTo({
          left:
            track.clientWidth *
            post.currentIndex,

          behavior: "smooth"
        });

        update();

      }
    );


    next.addEventListener(
      "click",
      event => {

        event.stopPropagation();

        if (
          post.currentIndex >=
          post.media.length - 1
        ) return;

        post.currentIndex++;

        track.scrollTo({
          left:
            track.clientWidth *
            post.currentIndex,

          behavior: "smooth"
        });

        update();

      }
    );


    let timer;


    track.addEventListener(
      "scroll",
      () => {

        clearTimeout(timer);

        timer = setTimeout(
          () => {

            if (!track.clientWidth) {
              return;
            }

            post.currentIndex =
              Math.round(
                track.scrollLeft /
                track.clientWidth
              );


            post.currentIndex =
              Math.max(
                0,
                Math.min(
                  post.currentIndex,
                  post.media.length - 1
                )
              );


            update();

          },
          80
        );

      }
    );


    update();

    container.appendChild(
      carousel
    );

  }


  /* ========================================
     GRILLE
  ======================================== */

  function createGrid(
    post,
    container
  ) {

    const grid =
      document.createElement("div");

    const total =
      post.media.length;


    if (total === 1) {

      grid.className =
        "post-grid grid-1";

    } else if (total === 2) {

      grid.className =
        "post-grid grid-2";

    } else if (total === 3) {

      grid.className =
        "post-grid grid-3";

    } else if (total === 4) {

      grid.className =
        "post-grid grid-4";

    } else {

      grid.className =
        "post-grid grid-many";

    }


    const visible =
      total > 4
        ? post.media.slice(0, 4)
        : post.media;


    visible.forEach(
      (item, index) => {

        const box =
          document.createElement("div");

        box.className =
          "grid-item";


        const element =
          createMediaElement(item);


        box.appendChild(element);


        if (
          total > 4 &&
          index === 3
        ) {

          const more =
            document.createElement("div");

          more.className =
            "grid-more";

          more.textContent =
            `+${total - 4}`;

          box.appendChild(more);

        }


        if (item.type !== "iframe") {

          element.addEventListener(
            "click",
            () => {

              openFullViewer(
                post,
                index
              );

            }
          );

        }


        grid.appendChild(box);

      }
    );


    container.appendChild(grid);

  }


  /* ========================================
     LIKE
  ======================================== */

  function updatePostLike(
    article,
    post
  ) {

    const button =
      article.querySelector(
        ".like-btn"
      );

    const counter =
      article.querySelector(
        ".post-like-count"
      );


    button.classList.toggle(
      "liked",
      post.liked
    );


    counter.textContent =
      `${post.likes} J’aime`;


    if (
      activePost &&
      activePost.id === post.id
    ) {

      updateViewerLike();

    }

  }


  /* ========================================
     VIEWER
  ======================================== */

  function openFullViewer(
    post,
    index
  ) {

    activePost = post;
    viewerIndex = index;

    viewerTrack.innerHTML = "";


    post.media.forEach(item => {

      const slide =
        document.createElement("div");

      slide.className =
        "viewer-slide";


      const element =
        createMediaElement(
          item,
          true
        );


      slide.appendChild(element);

      viewerTrack.appendChild(slide);

    });


    viewer.classList.add("open");

    document.body.style.overflow =
      "hidden";


    requestAnimationFrame(
      () => {

        viewerTrack.scrollLeft =
          viewerTrack.clientWidth *
          viewerIndex;

        updateViewer();

      }
    );


    updateViewerLike();

  }


  closeViewer.addEventListener(
    "click",
    () => {

      viewer.classList.remove("open");

      document.body.style.overflow = "";

      viewerTrack.innerHTML = "";

      activePost = null;

    }
  );


  viewerPrev.addEventListener(
    "click",
    () => {

      if (!activePost) return;
      if (viewerIndex <= 0) return;

      viewerIndex--;

      scrollViewer();

    }
  );


  viewerNext.addEventListener(
    "click",
    () => {

      if (!activePost) return;

      if (
        viewerIndex >=
        activePost.media.length - 1
      ) return;

      viewerIndex++;

      scrollViewer();

    }
  );


  function scrollViewer() {

    viewerTrack.scrollTo({
      left:
        viewerTrack.clientWidth *
        viewerIndex,

      behavior: "smooth"
    });

    updateViewer();

  }


  let viewerTimer;


  viewerTrack.addEventListener(
    "scroll",
    () => {

      clearTimeout(viewerTimer);

      viewerTimer =
        setTimeout(
          () => {

            if (
              !activePost ||
              !viewerTrack.clientWidth
            ) return;


            viewerIndex =
              Math.round(
                viewerTrack.scrollLeft /
                viewerTrack.clientWidth
              );


            viewerIndex =
              Math.max(
                0,
                Math.min(
                  viewerIndex,
                  activePost.media.length - 1
                )
              );


            updateViewer();

          },
          80
        );

    }
  );


  function updateViewer() {

    if (!activePost) return;

    const total =
      activePost.media.length;


    viewerCounter.textContent =
      `${viewerIndex + 1}/${total}`;


    if (total <= 1) {

      viewerCounter.style.display =
        "none";

      viewerPrev.style.display =
        "none";

      viewerNext.style.display =
        "none";

      return;

    }


    viewerCounter.style.display = "";
    viewerPrev.style.display = "";
    viewerNext.style.display = "";


    viewerPrev.style.visibility =
      viewerIndex === 0
        ? "hidden"
        : "visible";


    viewerNext.style.visibility =
      viewerIndex === total - 1
        ? "hidden"
        : "visible";

  }


  /* ========================================
     LIKE VIEWER
  ======================================== */

  viewerLike.addEventListener(
    "click",
    () => {

      if (!activePost) return;


      activePost.liked =
        !activePost.liked;

      activePost.likes =
        activePost.liked ? 1 : 0;


      updateViewerLike();


      const article =
        feed.querySelector(
          `[data-post-id="${activePost.id}"]`
        );


      if (article) {

        updatePostLike(
          article,
          activePost
        );

      }

    }
  );


  function updateViewerLike() {

    if (!activePost) return;


    viewerLike.classList.toggle(
      "liked",
      activePost.liked
    );


    viewerLikeCount.textContent =
      activePost.likes;

  }


  /* ========================================
     NETTOYER MÉDIAS EN ATTENTE
  ======================================== */

  function clearPendingMedia() {

    pendingMedia.forEach(item => {

      if (
        item.local &&
        item.url
      ) {

        URL.revokeObjectURL(
          item.url
        );

      }

    });


    pendingMedia = [];

  }


  /* ========================================
     NAVIGATION PROFIL
  ======================================== */
  function showHome() {
    profilePage.classList.remove("open");
    homeUI.forEach(el => el.style.display = "");
    document.querySelectorAll(".bottom-nav .nav-btn").forEach(btn => btn.classList.remove("active"));
    homeNav.classList.add("active");
    window.scrollTo(0, 0);
  }

  function showProfile() {
    homeUI.forEach(el => el.style.display = "none");
    profilePage.classList.add("open");
    document.querySelectorAll(".bottom-nav .nav-btn").forEach(btn => btn.classList.remove("active"));
    profileNav.classList.add("active");
    renderProfileGrid();
    window.scrollTo(0, 0);
  }

  homeNav.addEventListener("click", showHome);
  profileNav.addEventListener("click", showProfile);

  profileTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      activeProfileTab = tab.dataset.profileTab;
      profileTabs.forEach(t => t.classList.toggle("active", t === tab));
      renderProfileGrid();
    });
  });

  function renderProfileGrid() {
    profileGrid.innerHTML = "";
    profilePostCount.textContent = posts.length;

    let visiblePosts = posts;
    if (activeProfileTab === "reels") {
      visiblePosts = posts.filter(post => post.media.some(item => item.type === "video"));
    } else if (activeProfileTab === "saved") {
      visiblePosts = [];
    }

    profileEmpty.classList.toggle("show", visiblePosts.length === 0);

    visiblePosts.forEach(post => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "profile-grid-item";
      const first = post.media[0];

      if (first.type === "iframe") {
        const placeholder = document.createElement("div");
        placeholder.className = "profile-grid-iframe";
        placeholder.textContent = "▶";
        button.appendChild(placeholder);
      } else {
        const media = createMediaElement(first);
        if (media.tagName === "VIDEO") {
          media.controls = false;
          media.muted = true;
          media.preload = "metadata";
        }
        button.appendChild(media);
      }

      if (post.media.length > 1) {
        const badge = document.createElement("span");
        badge.className = "profile-grid-badge";
        badge.textContent = "▣";
        button.appendChild(badge);
      }

      button.addEventListener("click", () => openFullViewer(post, 0));
      profileGrid.appendChild(button);
    });
  }

  editProfileBtn.addEventListener("click", () => {
    editDisplayName.value = profileDisplayName.textContent;
    editBio.value = profileBio.textContent;
    editProfileModal.classList.add("open");
    document.body.style.overflow = "hidden";
  });

  cancelEditProfile.addEventListener("click", () => {
    editProfileModal.classList.remove("open");
    document.body.style.overflow = "";
  });

  saveEditProfile.addEventListener("click", () => {
    profileDisplayName.textContent = editDisplayName.value.trim() || "PrettyGirls";
    profileBio.textContent = editBio.value.trim() || "Bienvenue sur PrettyGirls ❤️";
    editProfileModal.classList.remove("open");
    document.body.style.overflow = "";
  });

  shareProfileBtn.addEventListener("click", async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "PrettyGirls", url: window.location.href });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        alert("Lien du profil copié.");
      }
    } catch (error) {
      // Partage annulé par l'utilisateur.
    }
  });


  /* ========================================
     DÉMARRAGE
  ======================================== */

  renderFeed();
  renderProfileGrid();

});

/* =========================================================
   FIREBASE AUTHENTICATION
========================================================= */

const authScreen = document.getElementById("authScreen");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const authMessage = document.getElementById("authMessage");

auth.onAuthStateChanged((user) => {
  if (user) {
    authScreen.style.display = "none";
    console.log("Utilisateur connecté :", user.uid);
  } else {
    authScreen.style.display = "flex";
  }
});

signupBtn.addEventListener("click", async () => {
  const email = authEmail.value.trim();
  const password = authPassword.value;

  authMessage.textContent = "";

  try {
    const result = await auth.createUserWithEmailAndPassword(email, password);

    await db.collection("profiles").doc(result.user.uid).set({
      email: email,
      display_name: "",
      bio: "",
      created_at: firebase.firestore.FieldValue.serverTimestamp()
    });

    authMessage.textContent = "Compte créé !";
  } catch (error) {
    authMessage.textContent = error.message;
  }
});

loginBtn.addEventListener("click", async () => {
  const email = authEmail.value.trim();
  const password = authPassword.value;

  authMessage.textContent = "";

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    authMessage.textContent = error.message;
  }
});
