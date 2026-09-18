<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Refs
const canvasRef = ref(null);
const heroRef = ref(null);
const featuredRef = ref(null);
const directorsRef = ref(null);
const reviewsRef = ref(null);
const isMenuOpen = ref(false);
const activeTab = ref('all');

// Three.js vars
let scene, camera, renderer, filmStrip;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
let animationId = null;

const handleMouseMove = (e) => {
  const x = e.clientX;
  const y = e.clientY;

  gsap.to('.cursor-dot', {
    x: x,
    y: y,
    duration: 0.03,
    ease: 'power1.out'
  });

  gsap.to('.cursor-ring', {
    x: x,
    y: y,
    duration: 0.25,
    ease: 'power2.out'
  });

  targetX = (x / window.innerWidth) * 2 - 1;
  targetY = -(y / window.innerHeight) * 2 + 1;
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Three.js - Film strip animation
const initThreeJS = () => {
  if (!canvasRef.value) return;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true,
    antialias: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.position.z = 5;

  // Golden particles
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 1500;
  const posArray = new Float32Array(particlesCount * 3);

  for(let i = 0; i < particlesCount * 3; i += 3) {
    posArray[i] = (Math.random() - 0.5) * 50;
    posArray[i + 1] = (Math.random() - 0.5) * 50;
    posArray[i + 2] = (Math.random() - 0.5) * 30;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.04,
    color: 0xFFD700,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  });

  filmStrip = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(filmStrip);

  const animate = () => {
    animationId = requestAnimationFrame(animate);

    mouseX += (targetX * 0.5 - mouseX) * 0.03;
    mouseY += (targetY * 0.5 - mouseY) * 0.03;

    filmStrip.rotation.y += 0.0003;
    filmStrip.rotation.x = mouseY * 0.03;

    camera.position.x = mouseX * 0.4;
    camera.position.y = mouseY * 0.4;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  };

  animate();
};

const handleResize = () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
};

const initAnimations = () => {
  // Hero
  const heroTl = gsap.timeline({ delay: 0.4 });

  heroTl.from('.hero-badge', {
    opacity: 0,
    scale: 0.5,
    duration: 0.8,
    ease: 'back.out(2)'
  })
      .from('.hero-title', {
        opacity: 0,
        y: 100,
        duration: 1.2,
        ease: 'power4.out'
      }, '-=0.4')
      .from('.hero-subtitle', {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out'
      }, '-=0.6')
      .from('.hero-cta', {
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        ease: 'back.out(1.5)'
      }, '-=0.3');

  // Parallax
  gsap.to('.hero-content-wrapper', {
    scrollTrigger: {
      trigger: heroRef.value,
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    },
    y: 300,
    opacity: 0,
    scale: 0.85
  });

  // Featured films
  gsap.from('.featured-card', {
    scrollTrigger: {
      trigger: featuredRef.value,
      start: 'top 70%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 120,
    scale: 0.95,
    duration: 1,
    stagger: 0.15,
    ease: 'power3.out'
  });

  // Directors grid
  gsap.from('.director-card', {
    scrollTrigger: {
      trigger: directorsRef.value,
      start: 'top 70%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 80,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power2.out'
  });

  // Reviews
  gsap.from('.review-card', {
    scrollTrigger: {
      trigger: reviewsRef.value,
      start: 'top 75%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    x: -100,
    duration: 0.9,
    stagger: 0.2,
    ease: 'power3.out'
  });

  // Nav scroll
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top -50',
    onEnter: () => document.querySelector('nav')?.classList.add('scrolled'),
    onLeaveBack: () => document.querySelector('nav')?.classList.remove('scrolled')
  });
};

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('resize', handleResize);
  initThreeJS();

  setTimeout(() => {
    initAnimations();
  }, 100);

  // Hover effects
  const interactiveEls = document.querySelectorAll('a, button, .featured-card, .director-card, .review-card');
  interactiveEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to('.cursor-dot', { scale: 2.5, backgroundColor: '#FFD700', duration: 0.25 });
      gsap.to('.cursor-ring', { scale: 2, borderColor: '#FFD700', duration: 0.3 });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to('.cursor-dot', { scale: 1, backgroundColor: '#ffffff', duration: 0.25 });
      gsap.to('.cursor-ring', { scale: 1, borderColor: 'rgba(255,215,0,0.3)', duration: 0.3 });
    });
  });
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('resize', handleResize);
  if (animationId) cancelAnimationFrame(animationId);
  if (renderer) renderer.dispose();
  ScrollTrigger.getAll().forEach(st => st.kill());
});

const featuredFilms = [
  { title: 'Oppenheimer', director: 'Christopher Nolan', rating: 9.2, year: '2023', genre: 'Biography', img: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&q=80' },
  { title: 'Killers of the Flower Moon', director: 'Martin Scorsese', rating: 8.9, year: '2023', genre: 'Crime', img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80' },
  { title: 'Past Lives', director: 'Celine Song', rating: 8.7, year: '2023', genre: 'Romance', img: 'https://images.unsplash.com/photo-1574267432644-f5560e04e79b?w=800&q=80' }
];

const directors = [
  { name: 'Christopher Nolan', films: 12, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
  { name: 'Martin Scorsese', films: 28, img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80' },
  { name: 'Greta Gerwig', films: 8, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80' },
  { name: 'Denis Villeneuve', films: 11, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80' }
];

const reviews = [
  { film: 'Oppenheimer', critic: 'Peter Bradshaw', outlet: 'The Guardian', rating: 5, quote: 'A stunning achievement in modern cinema' },
  { film: 'Poor Things', critic: 'David Ehrlich', outlet: 'IndieWire', rating: 4.5, quote: 'Lanthimos crafts a masterpiece of surreal beauty' },
  { film: 'The Zone of Interest', critic: 'Justin Chang', outlet: 'Los Angeles Times', rating: 5, quote: 'Chilling and unforgettable cinematic experience' }
];
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0f] text-white overflow-x-hidden cursor-none">


    <!-- Cursors -->
    <div class="cursor-dot" />
    <div class="cursor-ring" />

    <!-- Navigation -->
    <nav class="fixed top-0 w-full px-6 lg:px-12 py-5 z-50 transition-all duration-500">
      <div class="max-w-[1800px] mx-auto flex justify-between items-center">
        <div class="garamond text-3xl lg:text-4xl font-bold tracking-wide gold-accent">
          CINÉASTE
        </div>

        <ul class="hidden lg:flex gap-10 text-[11px] font-medium tracking-[0.15em]">
          <li v-for="item in ['FILMS', 'DIRECTORS', 'ACTORS', 'REVIEWS', 'AWARDS']" :key="item">
            <a :href="`#${item.toLowerCase()}`" class="nav-link text-white/70 hover:text-white">
              {{ item }}
            </a>
          </li>
        </ul>

        <button class="hidden lg:block px-7 py-2.5 bg-[#FFD700] text-black text-[10px] tracking-[0.2em] font-semibold hover:bg-white transition-all">
          SUBSCRIBE
        </button>

        <button @click="toggleMenu" class="lg:hidden text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5">
            <path v-if="!isMenuOpen" stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </nav>

    <!-- Mobile Menu -->
    <transition name="fade">
      <div v-if="isMenuOpen" class="fixed inset-0 z-40 bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center">
        <ul class="text-2xl space-y-7 text-center tracking-[0.15em]">
          <li v-for="item in ['FILMS', 'DIRECTORS', 'ACTORS', 'REVIEWS', 'AWARDS']" :key="item">
            <a :href="`#${item.toLowerCase()}`" @click="toggleMenu" class="hover:text-[#FFD700] transition-colors">
              {{ item }}
            </a>
          </li>
        </ul>
      </div>
    </transition>

    <!-- Hero -->
    <section ref="heroRef" class="relative h-screen flex items-center justify-center overflow-hidden">
      <canvas ref="canvasRef" class="absolute inset-0 w-full h-full" />

      <div class="absolute inset-0">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05),transparent_70%)]" />
        <div class="absolute inset-0 bg-gradient-to-b from-[#0d0d0f]/60 via-transparent to-[#0d0d0f]" />
      </div>

      <div class="hero-content-wrapper relative z-10 text-center px-6 max-w-6xl mx-auto">
        <div class="hero-badge inline-block px-6 py-2 border border-[#FFD700]/30 rounded-full mb-10 text-[10px] tracking-[0.25em] gold-accent">
          PREMIUM FILM CRITICISM
        </div>
        <h1 class="hero-title garamond text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] font-bold leading-none mb-6">
          CINÉASTE
        </h1>
        <p class="hero-subtitle text-base md:text-xl text-white/70 max-w-3xl mx-auto mb-12 leading-relaxed px-4">
          Curated reviews, exclusive interviews, and in-depth analysis of cinema's finest works.
          Where film criticism meets artistry.
        </p>
        <button class="hero-cta px-10 py-4 bg-[#FFD700] text-black text-[11px] tracking-[0.2em] font-bold hover:bg-white transition-all hover:scale-105">
          LATEST REVIEWS
        </button>
      </div>
    </section>

    <!-- Featured Films -->
    <section ref="featuredRef" id="films" class="py-28 px-6 relative">
      <div class="max-w-[1800px] mx-auto">
        <div class="mb-16">
          <div class="text-[#FFD700] text-[10px] tracking-[0.3em] mb-3">EDITOR'S CHOICE</div>
          <h2 class="garamond text-5xl md:text-7xl font-bold">Featured Films</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-10">
          <div
              v-for="(film, i) in featuredFilms"
              :key="i"
              class="featured-card group"
          >
            <div class="relative overflow-hidden mb-6 aspect-[2/3] bg-black/50">
              <img :src="film.img" :alt="film.title" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />
              <div class="absolute top-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span class="rating-star text-sm">★</span>
                <span class="text-xs font-semibold ml-1">{{ film.rating }}</span>
              </div>
              <div class="absolute bottom-0 left-0 right-0 p-6">
                <div class="text-[#FFD700] text-[9px] tracking-[0.25em] mb-2">{{ film.year }} · {{ film.genre }}</div>
                <h3 class="garamond text-3xl font-bold mb-2">{{ film.title }}</h3>
                <p class="text-white/70 text-sm">Directed by {{ film.director }}</p>
              </div>
            </div>
            <button class="text-[#FFD700] text-[10px] tracking-[0.2em] border-b border-[#FFD700] hover:text-white hover:border-white transition-colors pb-1">
              READ REVIEW
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Directors -->
    <section ref="directorsRef" id="directors" class="py-28 px-6 bg-[#0a0a0c]">
      <div class="max-w-[1800px] mx-auto">
        <div class="mb-16">
          <div class="text-[#FFD700] text-[10px] tracking-[0.3em] mb-3">VISIONARIES</div>
          <h2 class="garamond text-5xl md:text-7xl font-bold">Master Directors</h2>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div
              v-for="(director, i) in directors"
              :key="i"
              class="director-card group text-center"
          >
            <div class="relative overflow-hidden mb-5 aspect-square rounded-full bg-black/50 mx-auto w-40 md:w-48">
              <img :src="director.img" :alt="director.name" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              <div class="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all" />
            </div>
            <h3 class="text-xl font-semibold mb-1">{{ director.name }}</h3>
            <p class="text-[#FFD700] text-xs tracking-[0.2em]">{{ director.films }} FILMS</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Latest Reviews -->
    <section ref="reviewsRef" id="reviews" class="py-28 px-6">
      <div class="max-w-[1600px] mx-auto">
        <div class="mb-16">
          <div class="text-[#FFD700] text-[10px] tracking-[0.3em] mb-3">CRITICAL ACCLAIM</div>
          <h2 class="garamond text-5xl md:text-7xl font-bold mb-10">Latest Reviews</h2>
        </div>

        <div class="space-y-6">
          <div
              v-for="(review, i) in reviews"
              :key="i"
              class="review-card border-l-2 border-[#FFD700] pl-8 py-6 hover:border-l-4 transition-all"
          >
            <div class="flex items-start justify-between gap-6 flex-wrap">
              <div class="flex-1">
                <h3 class="garamond text-3xl font-bold mb-2">{{ review.film }}</h3>
                <p class="text-white/60 text-sm mb-4">{{ review.critic }} · {{ review.outlet }}</p>
                <p class="text-white/80 italic text-lg leading-relaxed">"{{ review.quote }}"</p>
              </div>
              <div class="flex items-center gap-1">
                <span v-for="n in Math.floor(review.rating)" :key="n" class="rating-star text-xl">★</span>
                <span v-if="review.rating % 1" class="rating-star text-xl">½</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter -->
    <section class="py-32 px-6 bg-gradient-to-b from-[#0a0a0c] to-[#0d0d0f] relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.03),transparent_70%)]" />

      <div class="relative z-10 max-w-4xl mx-auto text-center">
        <h2 class="garamond text-5xl md:text-6xl font-bold mb-6">
          Join the Elite
        </h2>
        <p class="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
          Subscribe to receive our curated film recommendations and exclusive critic insights.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <input
              type="email"
              placeholder="Your email address"
              class="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-none text-sm focus:outline-none focus:border-[#FFD700] transition-colors"
          />
          <button class="px-8 py-4 bg-[#FFD700] text-black text-[11px] tracking-[0.2em] font-bold hover:bg-white transition-all">
            SUBSCRIBE
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-white/10 py-12 px-6">
      <div class="max-w-[1800px] mx-auto">
        <div class="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div class="garamond text-2xl font-bold gold-accent tracking-wide">CINÉASTE</div>
          <div class="flex gap-8 text-[10px] tracking-[0.15em]">
            <a href="#" class="text-white/60 hover:text-[#FFD700] transition-colors">ABOUT</a>
            <a href="#" class="text-white/60 hover:text-[#FFD700] transition-colors">CONTACT</a>
            <a href="#" class="text-white/60 hover:text-[#FFD700] transition-colors">CAREERS</a>
            <a href="#" class="text-white/60 hover:text-[#FFD700] transition-colors">PRIVACY</a>
          </div>
        </div>
        <div class="text-center text-white/40 text-xs tracking-[0.12em]">
          © {{ new Date().getFullYear() }} CINÉASTE. CELEBRATING THE ART OF CINEMA.
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

* { cursor: none !important; }
body { font-family: 'Inter', sans-serif; }
.garamond { font-family: 'Cormorant Garamond', serif; }

.cursor-dot {
  position: fixed;
  width: 6px;
  height: 6px;
  background: #ffffff;
  border-radius: 50%;
  pointer-events: none;
  z-index: 10000;
  mix-blend-mode: difference;
  transform: translate(-50%, -50%);
}

.cursor-ring {
  position: fixed;
  width: 35px;
  height: 35px;
  border: 1.5px solid rgba(255, 215, 0, 0.3);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
}

nav.scrolled {
  background: rgba(13, 13, 15, 0.98) !important;
  backdrop-filter: blur(30px);
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);
}

.nav-link {
  position: relative;
  transition: color 0.3s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 0;
  height: 1px;
  background: #FFD700;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link:hover::after {
  width: 100%;
}

.gold-accent {
  color: #FFD700;
}

.featured-card {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.featured-card:hover {
  transform: translateY(-15px);
}

.featured-card img {
  transition: transform 0.7s ease;
}

.featured-card:hover img {
  transform: scale(1.08);
}

.director-card {
  transition: all 0.4s ease;
}

.director-card:hover {
  transform: translateY(-10px);
}

.rating-star {
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.tab-button.active {
  color: #FFD700;
  border-bottom: 2px solid #FFD700;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>