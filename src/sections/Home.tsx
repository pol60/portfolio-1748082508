import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface HomeProps {
  scrollToSection?: (sectionId: string) => void;
}

const Home: React.FC<HomeProps> = ({ scrollToSection = () => {} }) => {
  const { t } = useTranslation();

  useEffect(() => {
    class PerplexitySwarm {
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D;
      particles: Array<{
        cosA: number;
        sinA: number;
        angularSpeed: number;
        originalRadius: number;
        offsetX: number;
        offsetY: number;
        offsetVX: number;
        offsetVY: number;
        size: number;
        baseOpacity: number;
        opacity: number;
        layer: number;
        isRepelled: boolean;
        x: number;
        y: number;
      }>;
      mouse: { x: number; y: number; active: boolean };
      center: { x: number; y: number };
      dpr: number;
      baseRadius: number;
      ringCounts: number[];
      interiorCount: number;
      repulsionRadius: number;
      repulsionForce: number;
      returnForce: number;
      dampening: number;
      globalSpeedFactor: number;
      frameCount: number;
      resizeTimeout: number | null;
      scrollY: number;
      isScrolled: boolean;
      maxScroll: number;

      constructor() {
        this.canvas = document.getElementById(
          "particle-canvas"
        ) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;
        this.particles = [];
        this.mouse = { x: 0, y: 0, active: false };
        this.center = { x: 0, y: 0 };
        this.scrollY = 0;
        this.isScrolled = false;
        this.maxScroll = 0;

        this.dpr = window.devicePixelRatio || 1;

        this.baseRadius = 100;
        this.ringCounts = [200, 150, 150];
        this.interiorCount = Math.floor(
          this.ringCounts.reduce((a, b) => a + b, 0) * 0.5
        );

        this.repulsionRadius = 50;
        this.repulsionForce = 120.0;
        this.returnForce = 0.008;
        this.dampening = 0.85;
        this.globalSpeedFactor = 0.6;

        this.frameCount = 0;
        this.resizeTimeout = null;

        this.resize();
        this.initParticles();
        this.setupEvents();
        this.animate();

        // Добавляем обработчик скролла
        window.addEventListener('scroll', this.handleScroll);
      }

      handleScroll = () => {
        const scrollY = window.scrollY || window.pageYOffset;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        this.scrollY = scrollY;
        this.maxScroll = maxScroll;
        this.isScrolled = scrollY > 0;
      }

      // Debounce для resize: дождёмся, пока в течение 200 мс не будет новых «resize»
      handleResizeDebounced = () => {
        if (this.resizeTimeout !== null) {
          clearTimeout(this.resizeTimeout);
        }
        this.resizeTimeout = window.setTimeout(() => {
          this.resize();
          this.resizeTimeout = null;
        }, 200);
      };

      resize() {
        // При прокрутке mobile-адресной строки clientHeight остаётся «стабильным»
        const w = window.innerWidth;
        const h = document.documentElement.clientHeight;

        this.canvas.width = w * this.dpr;
        this.canvas.height = h * this.dpr;
        this.canvas.style.width = w + "px";
        this.canvas.style.height = h + "px";

        this.ctx.resetTransform();
        this.ctx.scale(this.dpr, this.dpr);

        // Включаем сглаживание для чётких частиц
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = "high";

        // На мобильных (ширина < 768px) центрируем ровно по середине,
        // иначе — со старым смещением w/1.5
        if (w < 768) {
          this.center.x = w / 2;
          this.center.y = h * 0.55; // Смещаем центр анимации ниже на мобильных
        } else {
          this.center.x = w / 1.5;
          this.center.y = h / 2; // Оставляем по центру для десктопа
        }
      }

      initParticles() {
        this.particles = [];
        const layers = this.ringCounts.length;

        for (let layer = 0; layer < layers; layer++) {
          const count = this.ringCounts[layer];
          const layerRadius = this.baseRadius + layer * 25;

          for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + layer * 0.3;
            const radiusVar = layerRadius + (Math.random() - 0.5) * 20;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            const speed =
              (Math.random() * 0.004 + 0.001) *
              (1 + layer * 0.2) *
              this.globalSpeedFactor;

            this.particles.push({
              cosA,
              sinA,
              angularSpeed: speed,
              originalRadius: radiusVar,
              offsetX: 0,
              offsetY: 0,
              offsetVX: 0,
              offsetVY: 0,
              size: Math.random() * 1.5 + 1.2,
              baseOpacity: Math.random() * 0.4 + 0.4,
              opacity: 0,
              layer,
              isRepelled: false,
              x: 0,
              y: 0,
            });
          }
        }

        for (let i = 0; i < this.interiorCount; i++) {
          const rand = Math.random();
          const r = this.baseRadius * Math.sqrt(rand);
          const angle = Math.random() * Math.PI * 2;
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);
          const speed = (Math.random() * 0.004 + 0.001) * this.globalSpeedFactor;

          this.particles.push({
            cosA,
            sinA,
            angularSpeed: speed,
            originalRadius: r,
            offsetX: 0,
            offsetY: 0,
            offsetVX: 0,
            offsetVY: 0,
            size: Math.random() * 0.8 + 1.2,
            baseOpacity: Math.random() * 0.4 + 0.4,
            opacity: 0,
            layer: -1,
            isRepelled: false,
            x: 0,
            y: 0,
          });
        }
      }

      setupEvents() {
        const canvasEl = this.canvas;

        // DESKTOP: мышь
        window.addEventListener("mousemove", (e) => {
          this.mouse.x = e.clientX;
          this.mouse.y = e.clientY;
          this.mouse.active = true;
        });
        window.addEventListener("mouseleave", () => {
          this.mouse.active = false;
        });

        // MOBILE: тач-события только на canvas, без preventDefault, чтобы скролл не блокировался
        canvasEl.addEventListener(
          "touchstart",
          (e) => {
            const t = e.touches[0];
            this.mouse.x = t.clientX;
            this.mouse.y = t.clientY;
            this.mouse.active = true;
          },
          { passive: true }
        );
        canvasEl.addEventListener(
          "touchmove",
          (e) => {
            const t = e.touches[0];
            this.mouse.x = t.clientX;
            this.mouse.y = t.clientY;
            this.mouse.active = true;
          },
          { passive: true }
        );
        canvasEl.addEventListener(
          "touchend",
          () => {
            this.mouse.active = false;
          },
          { passive: true }
        );

        // Ресайз окна — через дебаунс
        window.addEventListener("resize", this.handleResizeDebounced);
      }

      updateParticles() {
        this.frameCount++;
        const mx = this.mouse.x;
        const my = this.mouse.y;
        const cx = this.center.x;
        const cy = this.center.y;
        const rRad = this.repulsionRadius;
        const rRadSq = rRad * rRad;
        const rForce = this.repulsionForce;
        const retForce = this.returnForce;
        const damp = this.dampening;
        const mouseActive = this.mouse.active;
        const part = this.particles;
        const len = part.length;

        // Вычисляем смещение для частиц на основе скролла
        const scrollProgress = this.maxScroll > 0 ? this.scrollY / this.maxScroll : 0;
        const maxOffset = window.innerHeight * 0.3; // Максимальное смещение вниз
        const currentOffset = maxOffset * scrollProgress;

        for (let i = 0; i < len; i++) {
          const p = part[i];

          // Плавное вращение
          const dθ = p.angularSpeed;
          const cos_dθ = Math.cos(dθ);
          const sin_dθ = Math.sin(dθ);
          const nextCos = p.cosA * cos_dθ - p.sinA * sin_dθ;
          const nextSin = p.sinA * cos_dθ + p.cosA * sin_dθ;
          p.cosA = nextCos;
          p.sinA = nextSin;

          // Координата на орбите с учетом скролла
          const orbitX = cx + nextCos * p.originalRadius;
          const orbitY = cy + nextSin * p.originalRadius + currentOffset;

          // Текущая позиция с учётом отскока
          const currX = orbitX + p.offsetX;
          const currY = orbitY + p.offsetY;

          // Репульсия от курсора
          if (mouseActive) {
            const dx = currX - mx;
            const dy = currY - my;
            const distSq = dx * dx + dy * dy;
            
            if (distSq < rRadSq && distSq > 0) {
              const dist = Math.sqrt(distSq);
              const strength = ((rRad - dist) / rRad) * rForce;
              const invD = 1 / dist;
              p.offsetVX += dx * invD * strength * 0.4;
              p.offsetVY += dy * invD * strength * 0.4;
              p.isRepelled = true;
            } else {
              p.isRepelled = false;
            }
          } else {
            p.isRepelled = false;
          }

          // Если не отталкивается, возвращаем на орбиту
          if (!p.isRepelled) {
            p.offsetVX += -p.offsetX * retForce;
            p.offsetVY += -p.offsetY * retForce;
          }

          // Дампинг
          p.offsetVX *= damp;
          p.offsetVY *= damp;

          // Обновляем оффсеты
          p.offsetX += p.offsetVX;
          p.offsetY += p.offsetVY;

          // Сохраняем координаты
          p.x = orbitX + p.offsetX;
          p.y = orbitY + p.offsetY;

          // Плавное изменение opacity
          const targetOpacity = p.baseOpacity * (p.isRepelled ? 1.0 : 0.7);
          p.opacity += (targetOpacity - p.opacity) * 0.12;
        }
      }

      drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const part = this.particles;
        for (let i = 0, len = part.length; i < len; i++) {
          const p = part[i];
          const alpha = p.opacity;
          const x = p.x;
          const y = p.y;
          const size = p.size;

          // Основная частица
          this.ctx.fillStyle = `rgba(120, 180, 255, ${alpha})`;
          this.ctx.beginPath();
          this.ctx.arc(x, y, size, 0, Math.PI * 2);
          this.ctx.fill();

          // Эффект свечения при отталкивании
          if (p.isRepelled) {
            this.ctx.fillStyle = `rgba(150, 200, 255, ${alpha * 0.3})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 1.8, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = `rgba(180, 220, 255, ${alpha * 0.15})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
            this.ctx.fill();
          }
        }

        // Линии связи с прежней частотой
        if (this.frameCount % 15 === 0) {
          this.ctx.strokeStyle = "rgba(120, 180, 255, 0.08)";
          this.ctx.lineWidth = 0.5;
          for (let i = 0; i < part.length; i += 20) {
            const pA = part[i];
            const xA = pA.x;
            const yA = pA.y;
            for (let j = 1; j <= 3 && i + j < part.length; j++) {
              const pB = part[i + j];
              const xB = pB.x;
              const yB = pB.y;
              const dx = xA - xB;
              const dy = yA - yB;
              const distSq = dx * dx + dy * dy;
              if (distSq < 1200) {
                this.ctx.beginPath();
                this.ctx.moveTo(xA, yA);
                this.ctx.lineTo(xB, yB);
                this.ctx.stroke();
              }
            }
          }
        }
      }

      animate() {
        this.updateParticles();
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
      }

      cleanup() {
        window.removeEventListener('scroll', this.handleScroll);
      }
    }

    const swarm = new PerplexitySwarm();

    return () => {
      swarm.cleanup();
      swarm.ctx.clearRect(0, 0, swarm.canvas.width, swarm.canvas.height);
    };
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Canvas для анимации роя частиц */}
      <canvas id="particle-canvas" className="absolute inset-0 z-0"></canvas>

      {/* Градиентный оверлей */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-transparent z-10"></div>

      {/* Контент поверх */}
      <div className="container mx-auto px-6 relative z-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              <span className="block transform translate-y-0 opacity-100 transition-all duration-1000 delay-300">
                {t("home.greeting")}
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 transform translate-y-0 opacity-100 transition-all duration-1000 delay-500">
                {t("home.title")}
              </span>
            </h1>

            <p className="text-xl text-gray-200 max-w-lg transform translate-y-0 opacity-100 transition-all duration-1000 delay-700">
              {t("home.description")}
            </p>

            <div className="flex flex-wrap gap-4 transform translate-y-0 opacity-100 transition-all duration-1000 delay-900">
              <button
                onClick={() => scrollToSection("projects")}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
              >
                {t("home.projects_btn")}
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="px-8 py-3 bg-transparent hover:bg-white/10 text-white border-2 border-white rounded-full font-medium transition-all duration-300 transform hover:scale-105"
              >
                {t("home.contact_btn")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
