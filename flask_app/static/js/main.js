
/* Project gallery category filters */
document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".project-card");

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const selectedFilter = button.dataset.filter;

            filterButtons.forEach((item) => {
                item.classList.toggle("active", item === button);
            });

            projectCards.forEach((card) => {
                const categories = (card.dataset.category || "").split(" ");
                const matches =
                    selectedFilter === "all" ||
                    categories.includes(selectedFilter);

                card.hidden = !matches;
            });
        });
    });
});

/* ===== ACHIEVEMENTS & HACKATHONS CAROUSEL ===== */
(() => {
    const carousel = document.getElementById("achievementCarousel");
    const modes = document.getElementById("achievementModes");

    // Do nothing if the Achievements section is not on this page.
    if (!carousel || !modes) return;

    const imageFolder = "/static/images/achievements/";

const achievements = [
    { src: "achievement1.png", title: "Achievement 1", tag: "Milestone" },
    { src: "achievement2.png", title: "Achievement 2", tag: "Hackathon" },
    { src: "achievement3.png", title: "Achievement 3", tag: "Experience" },
    { src: "achievement4.png", title: "Achievement 4", tag: "Recognition" },
    { src: "achievement5.png", title: "Achievement 5", tag: "Milestone" },
    { src: "achievement6.png", title: "Achievement 6", tag: "Hackathon" },
    { src: "achievement7.png", title: "Achievement 7", tag: "Recognition" }
].map(item => ({
    ...item,
    src: imageFolder + item.src
}));

    const dotsBox = document.getElementById("achievementThumbnails");
    const bar = document.getElementById("achievementProgressBar");
    const counter = document.getElementById("achievementCounter");
    const lightbox = document.getElementById("achievementLightbox");
    const lightboxImage = document.getElementById("achievementLightboxImage");
    const closeButton = document.getElementById("achievementClose");

    const autoplayDelay = 2000;

    let current = 0;
    let mode = "circle";
    let timer = null;
    let isPaused = false;
    let isVisible = true;
    let pointerStartX = null;
    let dragged = false;

    // Build carousel images and thumbnail controls.
    const slides = achievements.map((item, index) => {
        const slide = document.createElement("div");
        slide.className = "achievement-slide";

        const img = document.createElement("img");
        img.src = item.src;
        img.alt = item.title;
        img.draggable = false;

        const caption = document.createElement("div");
        caption.className = "achievement-caption";

        const tag = document.createElement("small");
        tag.textContent = item.tag;

        const title = document.createElement("strong");
        title.textContent = item.title;

        caption.append(tag, title);
        slide.append(img, caption);

        slide.addEventListener("click", () => {
            if (dragged) return;

            if (index === current) {
                openLightbox(item);
            } else {
                goTo(index);
            }
        });

        carousel.appendChild(slide);

        const thumb = document.createElement("button");
        thumb.type = "button";
        thumb.setAttribute("aria-label", `Show ${item.title}`);

        const thumbImg = document.createElement("img");
        thumbImg.src = item.src;
        thumbImg.alt = "";
        thumbImg.loading = "lazy";

        thumb.appendChild(thumbImg);
        thumb.addEventListener("click", () => goTo(index));
        dotsBox.appendChild(thumb);

        return slide;
    });

    const thumbnails = [...dotsBox.children];
    const total = slides.length;

    function circularOffset(index) {
        let distance = index - current;

        if (distance > total / 2) distance -= total;
        if (distance < -total / 2) distance += total;

        return distance;
    }

    function render() {
        const mobile = carousel.clientWidth < 700;
        const spread = mobile ? 0.34 : 0.49;

        slides.forEach((slide, index) => {
            const distance = circularOffset(index);
            const abs = Math.abs(distance);

            slide.classList.toggle("active", index === current);
            slide.style.pointerEvents = "auto";

            if (mode === "fade") {
                slide.style.transform =
                    `translateX(-50%) scale(${abs === 0 ? 1 : 0.96})`;
                slide.style.opacity = abs === 0 ? "1" : "0";
                slide.style.filter = "none";
                slide.style.zIndex = abs === 0 ? "10" : "1";
                slide.style.pointerEvents = abs === 0 ? "auto" : "none";
            } else if (mode === "ring") {
                const width = slide.offsetWidth;
                const radius = Math.max(
                    width * 0.62 / Math.tan(Math.PI / total),
                    width * 0.9
                );

                const angle = distance * (360 / total);
                const radians = angle * Math.PI / 180;
                const front = Math.cos(radians);

                slide.style.transform =
                    `translateX(-50%) translateZ(${-radius}px) ` +
                    `rotateY(${angle}deg) translateZ(${radius}px)`;

                slide.style.opacity =
                    String(Math.max(0.12, (front + 1) / 2) ** 1.4);

                slide.style.filter = "none";
                slide.style.zIndex = String(Math.round(front * 10) + 10);
                slide.style.pointerEvents = front > 0.2 ? "auto" : "none";
            } else {
                const x = distance * slide.offsetWidth * spread;
                const scale = 1 - Math.min(abs, 3) * 0.14;
                const rotate = Math.max(-1, Math.min(1, distance)) * -12;

                const opacity =
                    abs === 0 ? 1 :
                    abs === 1 ? 0.48 :
                    abs === 2 ? 0.18 : 0;

                slide.style.transform =
                    `translateX(calc(-50% + ${x}px)) ` +
                    `scale(${scale}) rotateY(${rotate}deg)`;

                slide.style.opacity = String(opacity);
                slide.style.zIndex = String(10 - abs);
                slide.style.filter =
                    abs === 0 ? "none" :
                    `brightness(${1 - abs * 0.18}) blur(${abs > 1 ? 2 : 0}px)`;

                slide.style.pointerEvents = abs > 2 ? "none" : "auto";
            }
        });

        thumbnails.forEach((thumb, index) => {
            const active = index === current;
            thumb.classList.toggle("active", active);

            if (active) {
                thumb.setAttribute("aria-current", "true");
            } else {
                thumb.removeAttribute("aria-current");
            }
        });

        counter.textContent =
            `${String(current + 1).padStart(2, "0")} / ` +
            `${String(total).padStart(2, "0")}`;
    }

    function updateProgress() {
        if (!bar) return;

        bar.style.transition = "none";
        bar.style.width = "0";

        if (mode === "fade") {
            carousel.classList.add("fade");
        } else {
            carousel.classList.remove("fade");
        }

        if (mode === "ring") {
            carousel.classList.add("ring");
        } else {
            carousel.classList.remove("ring");
        }

        void bar.offsetWidth;
        bar.style.transition = `width ${autoplayDelay}ms linear`;
        bar.style.width = "100%";
    }

    function stopAutoplay() {
        clearInterval(timer);
        timer = null;

        if (bar) {
            bar.style.transition = "none";
            bar.style.width = "0";
        }
    }

    function startAutoplay() {
        stopAutoplay();

        if (isPaused || !isVisible || document.hidden ||
            lightbox?.classList.contains("open")) {
            return;
        }

        updateProgress();
        timer = setInterval(() => {
            current = (current + 1) % total;
            render();
            updateProgress();
        }, autoplayDelay);
    }

    function goTo(index) {
        current = (index + total) % total;
        render();
        startAutoplay();
    }

    function next() {
        goTo(current + 1);
    }

    function previous() {
        goTo(current - 1);
    }

    document.getElementById("achievementNext")
        ?.addEventListener("click", next);

    document.getElementById("achievementPrev")
        ?.addEventListener("click", previous);

    // Switch between carousel styles.
    modes.addEventListener("click", event => {
        const button = event.target.closest("button[data-mode]");
        if (!button) return;

        mode = button.dataset.mode;

        modes.querySelectorAll("button").forEach(btn => {
            const active = btn === button;
            btn.classList.toggle("active", active);
            btn.setAttribute("aria-pressed", String(active));
        });

        render();
        startAutoplay();
    });

    // Full-screen image viewer.
    function openLightbox(item) {
        if (!lightbox || !lightboxImage) return;

        stopAutoplay();
        lightboxImage.src = item.src;
        lightboxImage.alt = item.title;
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
        closeButton?.focus();
    }

    function closeLightbox() {
        if (!lightbox) return;

        lightbox.classList.remove("open");
        document.body.style.overflow = "";
        startAutoplay();
    }

    closeButton?.addEventListener("click", closeLightbox);

    lightbox?.addEventListener("click", event => {
        if (event.target === lightbox) closeLightbox();
    });

    // Keyboard controls.
    document.addEventListener("keydown", event => {
        if (lightbox?.classList.contains("open")) {
            if (event.key === "Escape") closeLightbox();
            return;
        }

        if (event.key === "ArrowRight") next();
        if (event.key === "ArrowLeft") previous();
    });

    // Pause while the visitor interacts with the carousel.
    carousel.addEventListener("mouseenter", () => {
        isPaused = true;
        stopAutoplay();
    });

    carousel.addEventListener("mouseleave", () => {
        isPaused = false;
        startAutoplay();
    });

    carousel.addEventListener("focusin", () => {
        isPaused = true;
        stopAutoplay();
    });

    carousel.addEventListener("focusout", event => {
        if (!carousel.contains(event.relatedTarget)) {
            isPaused = false;
            startAutoplay();
        }
    });

    // Touch swipe and mouse drag.
    carousel.addEventListener("pointerdown", event => {
        if (event.target.closest("button")) return;

        pointerStartX = event.clientX;
        dragged = false;
        stopAutoplay();
    });

    carousel.addEventListener("pointerup", event => {
        if (pointerStartX === null) return;

        const difference = event.clientX - pointerStartX;
        pointerStartX = null;

        if (Math.abs(difference) > 45) {
            dragged = true;
            difference < 0 ? next() : previous();

            setTimeout(() => {
                dragged = false;
            }, 0);
        } else {
            startAutoplay();
        }
    });

    carousel.addEventListener("pointercancel", () => {
        pointerStartX = null;
        startAutoplay();
    });

    // Pause autoplay when the section is off-screen.
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            isVisible = entries[0].isIntersecting;

            if (isVisible) startAutoplay();
            else stopAutoplay();
        });

        observer.observe(carousel);
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopAutoplay();
        else startAutoplay();
    });

    window.addEventListener("resize", render);

    render();
    startAutoplay();
})();


// ===== SCROLL REVEAL ANIMATIONS =====
(() => {
    const revealElements = [
        ...document.querySelectorAll(
            "section:not(#achievements), " +
            "#achievements .achievements-header, " +
            "#achievements .achievement-modes, " +
            "#achievements .achievement-carousel, " +
            "#achievements .achievement-progress, " +
            "#achievements .achievement-counter, " +
            "#achievements .achievement-thumbnails"
        )
    ];

    // Skip animations when the visitor prefers reduced motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    // Animate each section as it enters the screen.
    revealElements.forEach(element => {
        element.classList.add("scroll-reveal");
    });

    // Fallback for browsers without IntersectionObserver.
    if (!("IntersectionObserver" in window)) {
        revealElements.forEach(element => {
            element.classList.add("is-visible");
        });
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
    });

    revealElements.forEach(element => observer.observe(element));
})();

/* ===== VIDEO INTRO CONTROLLER ===== */

document.addEventListener("DOMContentLoaded", () => {
    const intro = document.getElementById("video-intro");
    const video = document.getElementById("intro-video");
    const skipButton = document.getElementById("skip-intro");

    if (!intro || !video || !skipButton) return;

    // Prevent scrolling while the intro is visible
    document.body.style.overflow = "hidden";

    let introFinished = false;

    function finishIntro() {
        if (introFinished) return;
        introFinished = true;

        intro.classList.add("intro-hidden");
        document.body.style.overflow = "";

        video.pause();

        // Remove the intro after the fade-out animation
        setTimeout(() => {
            intro.remove();
        }, 900);
    }

    // Show the portfolio when the video finishes
    video.addEventListener("ended", finishIntro);

    // Allow visitors to skip the intro
    skipButton.addEventListener("click", finishIntro);

    // If the video cannot play, show the portfolio anyway
    video.addEventListener("error", finishIntro);
});
