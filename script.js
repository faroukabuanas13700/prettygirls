document.addEventListener("DOMContentLoaded", () => {

  const feed = document.getElementById("feed");
  const emptyFeed = document.getElementById("emptyFeed");

  const createPost = document.getElementById("createPost");
  const imagePicker = document.getElementById("imagePicker");

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

  let pendingImages = [];
  let posts = [];

  let activePost = null;
  let viewerIndex = 0;


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
    imagePicker.value = "";
    imagePicker.click();
  });


  /* ========================================
     SÉLECTION DES PHOTOS
  ======================================== */

  imagePicker.addEventListener("change", event => {

    const files = Array.from(event.target.files);

    if (!files.length) return;

    clearPendingImages();

    pendingImages = files.map(file => ({
      file: file,
      url: URL.createObjectURL(file)
    }));

    selectedCount.textContent =
      pendingImages.length === 1
        ? "1 photo sélectionnée"
        : `${pendingImages.length} photos sélectionnées`;

    publishChoice.classList.add("open");
    document.body.style.overflow = "hidden";

  });


  /* ========================================
     ANNULER
  ======================================== */

  cancelPublish.addEventListener("click", () => {

    publishChoice.classList.remove("open");
    document.body.style.overflow = "";

    clearPendingImages();

  });


  /* ========================================
     CARROUSEL / GRILLE
  ======================================== */

  chooseCarousel.addEventListener("click", () => {
    createNewPost("carousel");
  });

  chooseGrid.addEventListener("click", () => {
    createNewPost("grid");
  });


  /* ========================================
     CRÉER UNE NOUVELLE PUBLICATION
  ======================================== */

  function createNewPost(type) {

    if (!pendingImages.length) return;

    const post = {
      id:
        Date.now().toString() +
        Math.random().toString(16).slice(2),

      type: type,

      images: pendingImages.map(image => ({
        file: image.file,
        url: image.url
      })),

      liked: false,
      likes: 0,
      currentIndex: 0
    };

    pendingImages = [];

    posts.unshift(post);

    publishChoice.classList.remove("open");
    document.body.style.overflow = "";

    renderFeed();

  }


  /* ========================================
     AFFICHER LE FEED
  ======================================== */

  function renderFeed() {

    /*
      IMPORTANT :
      on supprime seulement les anciennes publications.
      On ne détruit plus emptyFeed.
    */

    const oldPosts =
      feed.querySelectorAll(".post");

    oldPosts.forEach(postElement => {
      postElement.remove();
    });


    if (!posts.length) {

      emptyFeed.classList.remove("hidden");
      return;

    }


    emptyFeed.classList.add("hidden");


    posts.forEach(post => {

      const article =
        createPostElement(post);

      feed.appendChild(article);

    });

  }


  /* ========================================
     CRÉER UNE PUBLICATION
  ======================================== */

  function createPostElement(post) {

    const article =
      document.createElement("article");

    article.className = "post";
    article.dataset.postId = post.id;


    /* ---------- EN-TÊTE ---------- */

    const header =
      document.createElement("div");

    header.className = "post-header";

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


    /* ---------- MÉDIA ---------- */

    const media =
      document.createElement("div");

    media.className = "post-media";


    if (post.type === "carousel") {

      createCarousel(post, media);

    } else {

      createGrid(post, media);

    }


    article.appendChild(media);


    /* ---------- ACTIONS ---------- */

    const actions =
      document.createElement("div");

    actions.className = "post-actions";

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
      actions.querySelector(".like-btn");


    likeButton.addEventListener(
      "click",
      () => {

        post.liked = !post.liked;
        post.likes = post.liked ? 1 : 0;

        updatePostLike(article, post);

      }
    );


    article.appendChild(actions);


    /* ---------- NOMBRE DE LIKES ---------- */

    const likes =
      document.createElement("div");

    likes.className = "likes";

    likes.innerHTML = `
      <strong class="post-like-count">
        ${post.likes} J’aime
      </strong>
    `;

    article.appendChild(likes);


    /* ---------- LÉGENDE ---------- */

    const caption =
      document.createElement("div");

    caption.className = "caption";

    caption.innerHTML = `
      <strong>prettygirls</strong>
      Bienvenue sur PrettyGirls ❤️
    `;

    article.appendChild(caption);


    return article;

  }


  /* ========================================
     CRÉER LE CARROUSEL
  ======================================== */

  function createCarousel(post, media) {

    const carousel =
      document.createElement("div");

    carousel.className = "post-carousel";


    const track =
      document.createElement("div");

    track.className = "post-carousel-track";


    post.images.forEach((image, index) => {

      const slide =
        document.createElement("div");

      slide.className = "post-slide";


      const img =
        document.createElement("img");

      img.src = image.url;
      img.alt = `Photo ${index + 1}`;


      slide.appendChild(img);
      track.appendChild(slide);

    });


    carousel.appendChild(track);


    /* UNE SEULE PHOTO */

    if (post.images.length === 1) {

      track.addEventListener(
        "click",
        () => {

          openFullViewer(post, 0);

        }
      );

      media.appendChild(carousel);

      return;

    }


    /* COMPTEUR */

    const counter =
      document.createElement("div");

    counter.className =
      "carousel-counter";


    carousel.appendChild(counter);


    /* POINTS */

    const dots =
      document.createElement("div");

    dots.className = "carousel-dots";


    post.images.forEach(
      (image, index) => {

        const dot =
          document.createElement("span");

        dot.className =
          index === post.currentIndex
            ? "carousel-dot active"
            : "carousel-dot";

        dots.appendChild(dot);

      }
    );


    carousel.appendChild(dots);


    /* FLÈCHE GAUCHE */

    const prev =
      document.createElement("button");

    prev.className =
      "carousel-arrow carousel-prev";

    prev.type = "button";
    prev.textContent = "‹";


    /* FLÈCHE DROITE */

    const next =
      document.createElement("button");

    next.className =
      "carousel-arrow carousel-next";

    next.type = "button";
    next.textContent = "›";


    carousel.appendChild(prev);
    carousel.appendChild(next);


    function updateCarousel() {

      counter.textContent =
        `${post.currentIndex + 1}/${post.images.length}`;


      const allDots =
        dots.querySelectorAll(
          ".carousel-dot"
        );


      allDots.forEach(
        (dot, index) => {

          dot.classList.toggle(
            "active",
            index === post.currentIndex
          );

        }
      );


      prev.style.visibility =
        post.currentIndex === 0
          ? "hidden"
          : "visible";


      next.style.visibility =
        post.currentIndex ===
        post.images.length - 1
          ? "hidden"
          : "visible";

    }


    /* FLÈCHE GAUCHE */

    prev.addEventListener(
      "click",
      event => {

        event.stopPropagation();

        if (post.currentIndex <= 0) {
          return;
        }

        post.currentIndex--;

        track.scrollTo({
          left:
            track.clientWidth *
            post.currentIndex,

          behavior: "smooth"
        });

        updateCarousel();

      }
    );


    /* FLÈCHE DROITE */

    next.addEventListener(
      "click",
      event => {

        event.stopPropagation();

        if (
          post.currentIndex >=
          post.images.length - 1
        ) {
          return;
        }

        post.currentIndex++;

        track.scrollTo({
          left:
            track.clientWidth *
            post.currentIndex,

          behavior: "smooth"
        });

        updateCarousel();

      }
    );


    /* BALAYAGE */

    let scrollTimer;

    track.addEventListener(
      "scroll",
      () => {

        clearTimeout(scrollTimer);

        scrollTimer = setTimeout(
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
                  post.images.length - 1
                )
              );


            updateCarousel();

          },
          80
        );

      }
    );


    /* OUVRIR EN GRAND */

    track.addEventListener(
      "click",
      () => {

        openFullViewer(
          post,
          post.currentIndex
        );

      }
    );


    updateCarousel();

    media.appendChild(carousel);

  }


  /* ========================================
     CRÉER LA GRILLE
  ======================================== */

  function createGrid(post, media) {

    const grid =
      document.createElement("div");

    const total =
      post.images.length;


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


    const visibleImages =
      total > 4
        ? post.images.slice(0, 4)
        : post.images;


    visibleImages.forEach(
      (image, index) => {

        const item =
          document.createElement("div");

        item.className = "grid-item";


        const img =
          document.createElement("img");

        img.src = image.url;
        img.alt = `Photo ${index + 1}`;


        item.appendChild(img);


        if (
          total > 4 &&
          index === 3
        ) {

          const more =
            document.createElement("div");

          more.className = "grid-more";

          more.textContent =
            `+${total - 4}`;

          item.appendChild(more);

        }


        item.addEventListener(
          "click",
          () => {

            openFullViewer(
              post,
              index
            );

          }
        );


        grid.appendChild(item);

      }
    );


    media.appendChild(grid);

  }


  /* ========================================
     LIKE PUBLICATION
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
     OUVRIR VIEWER
  ======================================== */

  function openFullViewer(
    post,
    index
  ) {

    activePost = post;
    viewerIndex = index;

    viewerTrack.innerHTML = "";


    post.images.forEach(
      (image, i) => {

        const slide =
          document.createElement("div");

        slide.className =
          "viewer-slide";


        const img =
          document.createElement("img");

        img.src = image.url;
        img.alt = `Photo ${i + 1}`;


        slide.appendChild(img);
        viewerTrack.appendChild(slide);

      }
    );


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


  /* ========================================
     FERMER VIEWER
  ======================================== */

  closeViewer.addEventListener(
    "click",
    () => {

      viewer.classList.remove("open");

      document.body.style.overflow = "";

      activePost = null;

    }
  );


  /* ========================================
     VIEWER GAUCHE
  ======================================== */

  viewerPrev.addEventListener(
    "click",
    () => {

      if (!activePost) return;

      if (viewerIndex <= 0) return;

      viewerIndex--;

      scrollViewer();

    }
  );


  /* ========================================
     VIEWER DROITE
  ======================================== */

  viewerNext.addEventListener(
    "click",
    () => {

      if (!activePost) return;

      if (
        viewerIndex >=
        activePost.images.length - 1
      ) {
        return;
      }

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


  /* ========================================
     BALAYAGE VIEWER
  ======================================== */

  let viewerScrollTimer;

  viewerTrack.addEventListener(
    "scroll",
    () => {

      clearTimeout(
        viewerScrollTimer
      );

      viewerScrollTimer =
        setTimeout(
          () => {

            if (
              !activePost ||
              !viewerTrack.clientWidth
            ) {
              return;
            }


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
                  activePost.images.length - 1
                )
              );


            updateViewer();

          },
          80
        );

    }
  );


  /* ========================================
     MISE À JOUR VIEWER
  ======================================== */

  function updateViewer() {

    if (!activePost) return;

    const total =
      activePost.images.length;


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
     NETTOYAGE
  ======================================== */

  function clearPendingImages() {

    pendingImages.forEach(
      image => {

        URL.revokeObjectURL(
          image.url
        );

      }
    );

    pendingImages = [];

  }


  /* ========================================
     DÉMARRAGE
  ======================================== */

  renderFeed();

});
