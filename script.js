document.addEventListener("DOMContentLoaded", () => {

  const createPost = document.getElementById("createPost");
  const imagePicker = document.getElementById("imagePicker");

  const feedImage = document.getElementById("feedImage");
  const feedPlaceholder = document.getElementById("feedPlaceholder");
  const openViewer = document.getElementById("openViewer");

  const viewer = document.getElementById("viewer");
  const viewerImage = document.getElementById("viewerImage");
  const closeViewer = document.getElementById("closeViewer");

  const feedLike = document.getElementById("feedLike");
  const viewerLike = document.getElementById("viewerLike");

  const likeCount = document.getElementById("likeCount");
  const viewerLikeCount = document.getElementById("viewerLikeCount");

  let liked = false;
  let currentImage = null;


  /* ==============================
     CHOISIR UNE PHOTO
  ============================== */

  createPost.addEventListener("click", () => {
    imagePicker.click();
  });


  imagePicker.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (!file) return;

    if (currentImage) {
      URL.revokeObjectURL(currentImage);
    }

    currentImage = URL.createObjectURL(file);

    feedImage.src = currentImage;
    viewerImage.src = currentImage;

    feedImage.style.display = "block";
    feedPlaceholder.style.display = "none";
  });


  /* ==============================
     OUVRIR LA PUBLICATION
  ============================== */

  openViewer.addEventListener("click", () => {

    if (!currentImage) return;

    viewer.classList.add("open");

    document.body.style.overflow = "hidden";
  });


  /* ==============================
     FERMER LA PUBLICATION
  ============================== */

  closeViewer.addEventListener("click", () => {

    viewer.classList.remove("open");

    document.body.style.overflow = "";
  });


  /* ==============================
     LIKE
  ============================== */

  function updateLike() {

    feedLike.classList.toggle("liked", liked);
    viewerLike.classList.toggle("liked", liked);

    likeCount.textContent =
      liked ? "1 J’aime" : "0 J’aime";

    viewerLikeCount.textContent =
      liked ? "1" : "0";
  }


  feedLike.addEventListener("click", () => {

    liked = !liked;

    updateLike();
  });


  viewerLike.addEventListener("click", () => {

    liked = !liked;

    updateLike();
  });


  /* ==============================
     DOUBLE TAP SUR LA PHOTO = LIKE
  ============================== */

  let lastTap = 0;

  openViewer.addEventListener("touchend", () => {

    const now = Date.now();

    if (now - lastTap < 300) {

      liked = true;

      updateLike();
    }

    lastTap = now;
  });


  updateLike();

});
