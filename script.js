document.addEventListener("DOMContentLoaded", () => {

  const createPost = document.getElementById("createPost");
  const imagePicker = document.getElementById("imagePicker");

  const feedPlaceholder = document.getElementById("feedPlaceholder");
  const openViewer = document.getElementById("openViewer");

  const carousel = document.getElementById("carousel");
  const carouselTrack = document.getElementById("carouselTrack");
  const carouselPrev = document.getElementById("carouselPrev");
  const carouselNext = document.getElementById("carouselNext");
  const carouselCounter = document.getElementById("carouselCounter");
  const carouselDots = document.getElementById("carouselDots");

  const mediaGrid = document.getElementById("mediaGrid");

  const publishChoice = document.getElementById("publishChoice");
  const selectedCount = document.getElementById("selectedCount");
  const chooseCarousel = document.getElementById("chooseCarousel");
  const chooseGrid = document.getElementById("chooseGrid");
  const cancelPublish = document.getElementById("cancelPublish");

  const viewer = document.getElementById("viewer");
  const closeViewer = document.getElementById("closeViewer");

  const viewerCarouselTrack =
    document.getElementById("viewerCarouselTrack");

  const viewerPrev = document.getElementById("viewerPrev");
  const viewerNext = document.getElementById("viewerNext");
  const viewerCounter = document.getElementById("viewerCounter");

  const feedLike = document.getElementById("feedLike");
  const viewerLike = document.getElementById("viewerLike");
  const likeCount = document.getElementById("likeCount");
  const viewerLikeCount =
    document.getElementById("viewerLikeCount");

  let selectedImages = [];
  let pendingImages = [];

  let currentIndex = 0;
  let viewerIndex = 0;

  let publicationType = "carousel";
  let liked = false;


  /* ========================================
     BOUTON +
  ======================================== */

  createPost.addEventListener("click", () => {

    imagePicker.value = "";

    imagePicker.click();

  });


  /* ========================================
     SÉLECTION DE PLUSIEURS PHOTOS
  ======================================== */

  imagePicker.addEventListener("change", (event) => {

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
     CHOISIR CARROUSEL
  ======================================== */

  chooseCarousel.addEventListener("click", () => {

    publicationType = "carousel";

    confirmPublication();

  });


  /* ========================================
     CHOISIR GRILLE
  ======================================== */

  chooseGrid.addEventListener("click", () => {

    publicationType = "grid";

    confirmPublication();

  });


  /* ========================================
     CONFIRMER PUBLICATION
  ======================================== */

  function confirmPublication() {

    clearSelectedImages();

    selectedImages = pendingImages;
    pendingImages = [];

    currentIndex = 0;
    viewerIndex = 0;

    publishChoice.classList.remove("open");

    document.body.style.overflow = "";

    feedPlaceholder.style.display = "none";

    renderPublication();

    renderViewer();

  }


  /* ========================================
     AFFICHER PUBLICATION
  ======================================== */

  function renderPublication() {

    carousel.classList.remove("active");
    mediaGrid.className = "media-grid";

    carouselTrack.innerHTML = "";
    carouselDots.innerHTML = "";
    mediaGrid.innerHTML = "";

    if (!selectedImages.length) return;

    if (publicationType === "carousel") {

      renderCarousel();

    } else {

      renderGrid();

    }

  }


  /* ========================================
     CARROUSEL
  ======================================== */

  function renderCarousel() {

    carousel.classList.add("active");

    selectedImages.forEach((image, index) => {

      const slide = document.createElement("div");

      slide.className = "carousel-slide";

      const img = document.createElement("img");

      img.src = image.url;
      img.alt = `Photo ${index + 1}`;

      slide.appendChild(img);

      carouselTrack.appendChild(slide);


      const dot = document.createElement("span");

      dot.className =
        index === 0
          ? "carousel-dot active"
          : "carousel-dot";

      carouselDots.appendChild(dot);

    });

    updateCarousel();

    if (selectedImages.length <= 1) {

      carouselPrev.style.display = "none";
      carouselNext.style.display = "none";
      carouselCounter.style.display = "none";
      carouselDots.style.display = "none";

    } else {

      carouselPrev.style.display = "";
      carouselNext.style.display = "";
      carouselCounter.style.display = "";
      carouselDots.style.display = "flex";

    }

  }


  /* ========================================
     MISE À JOUR CARROUSEL
  ======================================== */

  function updateCarousel() {

    if (!selectedImages.length) return;

    carouselCounter.textContent =
      `${currentIndex + 1}/${selectedImages.length}`;

    const dots =
      carouselDots.querySelectorAll(".carousel-dot");

    dots.forEach((dot, index) => {

      dot.classList.toggle(
        "active",
        index === currentIndex
      );

    });

    carouselPrev.style.visibility =
      currentIndex === 0
        ? "hidden"
        : "visible";

    carouselNext.style.visibility =
      currentIndex === selectedImages.length - 1
        ? "hidden"
        : "visible";

  }


  /* ========================================
     FLÈCHE GAUCHE
  ======================================== */

  carouselPrev.addEventListener("click", (event) => {

    event.stopPropagation();

    if (currentIndex <= 0) return;

    currentIndex--;

    scrollFeedCarousel();

  });


  /* ========================================
     FLÈCHE DROITE
  ======================================== */

  carouselNext.addEventListener("click", (event) => {

    event.stopPropagation();

    if (
      currentIndex >=
      selectedImages.length - 1
    ) return;

    currentIndex++;

    scrollFeedCarousel();

  });


  function scrollFeedCarousel() {

    carouselTrack.scrollTo({
      left:
        carouselTrack.clientWidth *
        currentIndex,
      behavior: "smooth"
    });

    updateCarousel();

  }


  /* ========================================
     BALAYAGE AU DOIGT DU CARROUSEL
  ======================================== */

  let carouselScrollTimer;

  carouselTrack.addEventListener("scroll", () => {

    clearTimeout(carouselScrollTimer);

    carouselScrollTimer = setTimeout(() => {

      if (!carouselTrack.clientWidth) return;

      currentIndex = Math.round(
        carouselTrack.scrollLeft /
        carouselTrack.clientWidth
      );

      currentIndex = Math.max(
        0,
        Math.min(
          currentIndex,
          selectedImages.length - 1
        )
      );

      updateCarousel();

    }, 80);

  });


  /* ========================================
     GRILLE
  ======================================== */

  function renderGrid() {

    const total = selectedImages.length;

    if (total === 1) {
      mediaGrid.classList.add("active", "grid-1");
    }

    else if (total === 2) {
      mediaGrid.classList.add("active", "grid-2");
    }

    else if (total === 3) {
      mediaGrid.classList.add("active", "grid-3");
    }

    else if (total === 4) {
      mediaGrid.classList.add("active", "grid-4");
    }

    else {
      mediaGrid.classList.add(
        "active",
        "grid-many"
      );
    }


    const visibleImages =
      total > 4
        ? selectedImages.slice(0, 4)
        : selectedImages;


    visibleImages.forEach((image, index) => {

      const item =
        document.createElement("div");

      item.className = "grid-item";

      item.dataset.index = index;


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
        (event) => {

          event.stopPropagation();

          openFullViewer(index);

        }
      );


      mediaGrid.appendChild(item);

    });

  }


  /* ========================================
     CRÉER LE VIEWER
  ======================================== */

  function renderViewer() {

    viewerCarouselTrack.innerHTML = "";

    selectedImages.forEach((image, index) => {

      const slide =
        document.createElement("div");

      slide.className = "viewer-slide";


      const img =
        document.createElement("img");

      img.src = image.url;
      img.alt = `Photo ${index + 1}`;


      slide.appendChild(img);

      viewerCarouselTrack.appendChild(slide);

    });

    updateViewer();

  }


  /* ========================================
     OUVRIR PLEIN ÉCRAN
  ======================================== */

  openViewer.addEventListener(
    "click",
    (event) => {

      if (!selectedImages.length) return;

      if (
        event.target.closest(
          ".carousel-arrow"
        )
      ) return;

      openFullViewer(currentIndex);

    }
  );


  function openFullViewer(index = 0) {

    viewerIndex = index;

    viewer.classList.add("open");

    document.body.style.overflow = "hidden";


    requestAnimationFrame(() => {

      viewerCarouselTrack.scrollLeft =
        viewerCarouselTrack.clientWidth *
        viewerIndex;

      updateViewer();

    });

  }


  /* ========================================
     FERMER VIEWER
  ======================================== */

  closeViewer.addEventListener(
    "click",
    () => {

      viewer.classList.remove("open");

      document.body.style.overflow = "";

    }
  );


  /* ========================================
     VIEWER - PHOTO PRÉCÉDENTE
  ======================================== */

  viewerPrev.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      if (viewerIndex <= 0) return;

      viewerIndex--;

      scrollViewer();

    }
  );


  /* ========================================
     VIEWER - PHOTO SUIVANTE
  ======================================== */

  viewerNext.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      if (
        viewerIndex >=
        selectedImages.length - 1
      ) return;

      viewerIndex++;

      scrollViewer();

    }
  );


  function scrollViewer() {

    viewerCarouselTrack.scrollTo({
      left:
        viewerCarouselTrack.clientWidth *
        viewerIndex,
      behavior: "smooth"
    });

    updateViewer();

  }


  /* ========================================
     BALAYAGE VIEWER
  ======================================== */

  let viewerScrollTimer;

  viewerCarouselTrack.addEventListener(
    "scroll",
    () => {

      clearTimeout(viewerScrollTimer);

      viewerScrollTimer = setTimeout(() => {

        if (
          !viewerCarouselTrack.clientWidth
        ) return;

        viewerIndex = Math.round(
          viewerCarouselTrack.scrollLeft /
          viewerCarouselTrack.clientWidth
        );

        viewerIndex = Math.max(
          0,
          Math.min(
            viewerIndex,
            selectedImages.length - 1
          )
        );

        updateViewer();

      }, 80);

    }
  );


  /* ========================================
     MISE À JOUR VIEWER
  ======================================== */

  function updateViewer() {

    if (!selectedImages.length) return;

    viewerCounter.textContent =
      `${viewerIndex + 1}/${selectedImages.length}`;


    if (selectedImages.length <= 1) {

      viewerCounter.style.display = "none";
      viewerPrev.style.display = "none";
      viewerNext.style.display = "none";

    }

    else {

      viewerCounter.style.display = "";
      viewerPrev.style.display = "";
      viewerNext.style.display = "";

      viewerPrev.style.visibility =
        viewerIndex === 0
          ? "hidden"
          : "visible";

      viewerNext.style.visibility =
        viewerIndex ===
        selectedImages.length - 1
          ? "hidden"
          : "visible";

    }

  }


  /* ========================================
     LIKE
  ======================================== */

  function updateLike() {

    feedLike.classList.toggle(
      "liked",
      liked
    );

    viewerLike.classList.toggle(
      "liked",
      liked
    );

    likeCount.textContent =
      liked
        ? "1 J’aime"
        : "0 J’aime";

    viewerLikeCount.textContent =
      liked
        ? "1"
        : "0";

  }


  feedLike.addEventListener(
    "click",
    () => {

      liked = !liked;

      updateLike();

    }
  );


  viewerLike.addEventListener(
    "click",
    () => {

      liked = !liked;

      updateLike();

    }
  );


  /* ========================================
     LIBÉRER LES ANCIENNES IMAGES
  ======================================== */

  function clearSelectedImages() {

    selectedImages.forEach(image => {

      URL.revokeObjectURL(image.url);

    });

    selectedImages = [];

  }


  function clearPendingImages() {

    pendingImages.forEach(image => {

      URL.revokeObjectURL(image.url);

    });

    pendingImages = [];

  }


  /* ========================================
     ÉTAT INITIAL
  ======================================== */

  updateLike();

});
