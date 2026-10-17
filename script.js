const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

document.querySelectorAll('a[href^="http://"], a[href^="https://"]').forEach((link) => {
  const hostname = new URL(link.href).hostname;
  if (hostname !== "careerplannerindia.com" && !hostname.endsWith(".careerplannerindia.com")) return;

  link.removeAttribute("href");
  link.removeAttribute("target");
  link.removeAttribute("rel");
});

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
  mainNav.classList.toggle("is-open", !isOpen);
  mainNav.querySelectorAll(".nav-dropdown__toggle").forEach((toggle) => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.closest(".nav-dropdown").classList.remove("is-open");
  });
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    mainNav.classList.remove("is-open");
    mainNav.querySelectorAll(".nav-dropdown__toggle").forEach((toggle) => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.closest(".nav-dropdown").classList.remove("is-open");
    });
  });
});

mainNav.querySelectorAll(".nav-dropdown__toggle").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    mainNav.querySelectorAll(".nav-dropdown__toggle").forEach((otherToggle) => {
      otherToggle.setAttribute("aria-expanded", "false");
      otherToggle.closest(".nav-dropdown").classList.remove("is-open");
    });
    toggle.closest(".nav-dropdown").classList.remove("is-scroll-closed");
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.closest(".nav-dropdown").classList.toggle("is-open", !isOpen);
  });
});

const dropdowns = [...mainNav.querySelectorAll(".nav-dropdown")];

dropdowns.forEach((dropdown) => {
  dropdown.addEventListener("pointerleave", () => {
    dropdown.classList.remove("is-scroll-closed");
  });
});

window.addEventListener("scroll", () => {
  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector(".nav-dropdown__toggle");
    const isOpen = dropdown.classList.contains("is-open") || dropdown.matches(":hover, :focus-within");

    if (isOpen) {
      dropdown.classList.add("is-scroll-closed");
      dropdown.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}, { passive: true });

const consultationForm = document.querySelector("#consult-form");

consultationForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!consultationForm.reportValidity()) return;

  consultationForm.querySelector(".form-note").textContent =
    "Online enquiry submission is unavailable. Please call 9386347918.";
});

const newsSection = document.querySelector(".news-section");
const newsList = newsSection.querySelector(".news-list");
const newsItems = [...newsList.querySelectorAll(".news-item")];
const newsMarquee = document.createElement("div");
newsMarquee.className = "news-marquee";

for (let copyIndex = 0; copyIndex < 2; copyIndex += 1) {
  const group = document.createElement("div");
  group.className = "news-marquee__group";
  group.setAttribute("aria-hidden", String(copyIndex === 1));

  newsItems.forEach((item, itemIndex) => {
    const marqueeItem = copyIndex === 0 ? item : item.cloneNode(true);
    marqueeItem.dataset.newsIndex = String(itemIndex);

    if (copyIndex === 1) {
      marqueeItem.classList.add("news-item--loop-copy");
      marqueeItem.setAttribute("tabindex", "-1");
      marqueeItem.setAttribute("aria-pressed", "false");
      marqueeItem.querySelectorAll("a, button").forEach((control) => control.setAttribute("tabindex", "-1"));
    }

    group.append(marqueeItem);
  });

  newsMarquee.append(group);
}

newsList.replaceChildren(newsMarquee);
const newsImages = [...newsSection.querySelectorAll(".news-image-slider__image")];
const newsCaptionCategory = newsSection.querySelector(".news-image-slider__caption span");
const newsCaptionTitle = newsSection.querySelector(".news-image-slider__caption strong");
let activeNewsIndex = 0;
let newsMarqueeFrame = 0;

const activateNews = (index) => {
  if (index === activeNewsIndex) return;
  activeNewsIndex = index;
  newsItems.forEach((item, itemIndex) => {
    const isActive = itemIndex === activeNewsIndex;
    item.setAttribute("aria-pressed", String(isActive));
    newsImages[itemIndex].classList.toggle("is-active", isActive);
  });
  newsCaptionCategory.textContent = newsItems[activeNewsIndex].querySelector(".news-item__category").textContent;
  newsCaptionTitle.textContent = newsItems[activeNewsIndex].querySelector(".news-item__copy strong").textContent;
};

const syncNewsImageToMarquee = () => {
  const listTop = newsList.getBoundingClientRect().top;
  const anchor = listTop + newsList.clientHeight / 2;
  let nearestItem = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  newsMarquee.querySelectorAll(".news-item").forEach((item) => {
    const bounds = item.getBoundingClientRect();
    const distance = bounds.top <= anchor && bounds.bottom >= anchor
      ? 0
      : Math.min(Math.abs(bounds.top - anchor), Math.abs(bounds.bottom - anchor));

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestItem = item;
    }
  });

  if (nearestItem) activateNews(Number(nearestItem.dataset.newsIndex));
  newsMarqueeFrame = window.requestAnimationFrame(syncNewsImageToMarquee);
};

newsItems.forEach((item, index) => {
  item.addEventListener("click", () => activateNews(index));
});

newsMarqueeFrame = window.requestAnimationFrame(syncNewsImageToMarquee);

const storyGrid = document.querySelector("#story-track");

storyGrid.querySelectorAll(".story-tile").forEach((tile) => {
  const video = tile.querySelector("video");
  const iframe = tile.querySelector("iframe");
  if (!video && !iframe) return;

  const youtubeId = iframe?.src.match(/\/embed\/([^/?]+)/)?.[1];
  if (iframe && !youtubeId) {
    console.error("Could not create a video thumbnail for an invalid YouTube embed URL.", iframe.src);
    return;
  }

  const title = tile.querySelector(".story-tile__content strong").textContent.trim();
  const preview = document.createElement("button");
  preview.className = "story-video-preview";
  preview.type = "button";
  preview.setAttribute("aria-label", `Play video: ${title}`);
  preview.dataset.mediaType = video ? "video" : "youtube";
  preview.dataset.mediaSource = video
    ? video.querySelector("source").src
    : youtubeId;

  const image = document.createElement("img");
  image.className = "story-video-preview__image";
  image.src = video?.poster || `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  image.alt = "";
  image.loading = "lazy";
  image.decoding = "async";
  preview.append(image);

  const playIcon = document.createElement("span");
  playIcon.className = "story-video-preview__play";
  playIcon.setAttribute("aria-hidden", "true");
  preview.append(playIcon);

  (video || iframe).replaceWith(preview);
});

storyGrid.addEventListener("click", (event) => {
  const preview = event.target.closest(".story-video-preview");
  if (!preview) return;

  if (preview.dataset.mediaType === "youtube") {
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${preview.dataset.mediaSource}?autoplay=1&rel=0`;
    iframe.title = preview.getAttribute("aria-label").replace(/^Play video: /, "");
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.loading = "eager";
    preview.replaceWith(iframe);
    return;
  }

  const video = document.createElement("video");
  video.controls = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.poster = preview.querySelector("img").src;
  const source = document.createElement("source");
  source.src = preview.dataset.mediaSource;
  source.type = "video/mp4";
  video.append(source);
  preview.replaceWith(video);
  video.play().catch((error) => {
    console.error("Unable to start the selected success story video.", error);
  });
});

const faqItems = [...document.querySelectorAll(".faq-list details")];

faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;

    faqItems.forEach((otherItem) => {
      if (otherItem !== item) otherItem.open = false;
    });
  });
});

document.querySelector("#year").textContent = new Date().getFullYear();
