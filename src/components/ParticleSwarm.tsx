// src/components/ParticleSwarm.tsx

import React, { useEffect, useRef } from 'react';

type Particle = {
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
  color: string;
};

class PerplexitySwarm {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[];
  private mouse: { x: number; y: number; active: boolean };
  private center: { x: number; y: number };
  private dpr: number;
  private frameCount: number;
  private baseRadius: number;
  private ringCounts: number[];
  private interiorCount: number;
  private repulsionRadius: number;
  private repulsionForce: number;
  private returnForce: number;
  private dampening: number;
  private globalSpeedFactor: number;
  private animationId: number | null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Не удалось получить 2D-контекст');
    }
    this.ctx = context;
    this.particles = [];
    this.mouse = { x: 0, y: 0, active: false };
    this.center = { x: 0, y: 0 };
    this.dpr = window.devicePixelRatio || 1;
    this.frameCount = 0;
    this.baseRadius = 100;
    this.ringCounts = [200, 150, 150];
    this.interiorCount = Math.floor(
      this.ringCounts.reduce((a, b) => a + b, 0) * 0.5
    );
    this.repulsionRadius = 40;
    this.repulsionForce = 100.0;
    this.returnForce = 0.01;
    this.dampening = 0.70;
    this.globalSpeedFactor = 0.5;
    this.animationId = null;

    this.resize();
    this.initParticles();
    this.setupEvents();
    this.animate();
  }

  private resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    // Сбрасываем трансформацию и масштабируем под DPI
    this.ctx.resetTransform();
    this.ctx.scale(this.dpr, this.dpr);
    this.ctx.imageSmoothingEnabled = true;

    this.center.x = w / 2;
    this.center.y = h / 2;
  };

  private initParticles() {
    this.particles = [];
    const layers = this.ringCounts.length;

    // 1) «Кольцевые» частицы
    for (let layer = 0; layer < layers; layer++) {
      const count = this.ringCounts[layer];
      const layerRadius = this.baseRadius + layer * 20;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + layer * 0.5;
        const radiusVar = layerRadius + (Math.random() - 0.5) * 15;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const speed =
          (Math.random() * 0.006 + 0.002) * (1 + layer * 0.3) * this.globalSpeedFactor;

        const color = `rgba(${180 + Math.random() * 30}, ${
          210 + Math.random() * 30
        }, ${255 + Math.random() * 30}, 1)`;

        this.particles.push({
          cosA,
          sinA,
          angularSpeed: speed,
          originalRadius: radiusVar,
          offsetX: 0,
          offsetY: 0,
          offsetVX: 0,
          offsetVY: 0,
          size: Math.random() * 1.5 + 1,
          baseOpacity: Math.random() * 0.5 + 0.3,
          opacity: 0,
          layer,
          isRepelled: false,
          x: 0,
          y: 0,
          color,
        });
      }
    }

    // 2) «Внутренние» частицы (плотное заполнение круга)
    for (let i = 0; i < this.interiorCount; i++) {
      const rand = Math.random();
      const r = this.baseRadius * Math.sqrt(rand);
      const angle = Math.random() * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const speed = (Math.random() * 0.006 + 0.002) * this.globalSpeedFactor;
      const color = `rgba(${180 + Math.random() * 30}, ${
        210 + Math.random() * 30
      }, ${255 + Math.random() * 30}, 1)`;

      this.particles.push({
        cosA,
        sinA,
        angularSpeed: speed,
        originalRadius: r,
        offsetX: 0,
        offsetY: 0,
        offsetVX: 0,
        offsetVY: 0,
        size: Math.random() * 1.5 + 1,
        baseOpacity: Math.random() * 0.5 + 0.3,
        opacity: 0,
        layer: -1,
        isRepelled: false,
        x: 0,
        y: 0,
        color,
      });
    }
  }

  private setupEvents() {
    // Обработчики мыши
    this.canvas.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
    });
    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.active = false;
    });

    // Обработчики тача
    this.canvas.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        const t = e.touches[0];
        this.mouse.x = t.clientX;
        this.mouse.y = t.clientY;
        this.mouse.active = true;
      },
      { passive: false }
    );
    this.canvas.addEventListener(
      'touchmove',
      (e) => {
        e.preventDefault();
        const t = e.touches[0];
        this.mouse.x = t.clientX;
        this.mouse.y = t.clientY;
        this.mouse.active = true;
      },
      { passive: false }
    );
    this.canvas.addEventListener(
      'touchend',
      (e) => {
        e.preventDefault();
        this.mouse.active = false;
      },
      { passive: false }
    );

    // Изменение размеров окна
    window.addEventListener('resize', this.resize);
  }

  private updateParticles() {
    this.frameCount++;
    const mx = this.mouse.x;
    const my = this.mouse.y;
    const cx = this.center.x;
    const cy = this.center.y;
    const rRad = this.repulsionRadius;
    const rForce = this.repulsionForce;
    const retForce = this.returnForce;
    const damp = this.dampening;
    const mouseActive = this.mouse.active;
    const part = this.particles;

    for (let i = 0; i < part.length; i++) {
      const p = part[i];

      // 1) Рекуррентное обновление угла (cosA/sinA)
      const dθ = p.angularSpeed;
      const cos_dθ = Math.cos(dθ);
      const sin_dθ = Math.sin(dθ);
      const nextCos = p.cosA * cos_dθ - p.sinA * sin_dθ;
      const nextSin = p.sinA * cos_dθ + p.cosA * sin_dθ;
      p.cosA = nextCos;
      p.sinA = nextSin;

      // 2) «Идеальная» позиция на орбите
      const orbitX = cx + nextCos * p.originalRadius;
      const orbitY = cy + nextSin * p.originalRadius;

      // 3) Текущая позиция с учётом смещения (offsetX/offsetY)
      const currX = orbitX + p.offsetX;
      const currY = orbitY + p.offsetY;

      // 4) Логика отталкивания при наведении
      if (mouseActive) {
        const dx = currX - mx;
        const dy = currY - my;
        const distSq = dx * dx + dy * dy;
        if (distSq < rRad * rRad && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const strength = ((rRad - dist) / rRad) * rForce;
          const invD = 1 / dist;
          p.offsetVX += dx * invD * strength;
          p.offsetVY += dy * invD * strength;
          p.isRepelled = true;
        } else {
          p.isRepelled = false;
        }
      } else {
        p.isRepelled = false;
      }

      // 5) Возврат на «идеальную» орбиту (если не отталкивается)
      if (!p.isRepelled) {
        p.offsetVX += -p.offsetX * retForce;
        p.offsetVY += -p.offsetY * retForce;
      }

      // 6) Дебампфирование скоростей
      p.offsetVX *= damp;
      p.offsetVY *= damp;

      // 7) Обновление смещения
      p.offsetX += p.offsetVX;
      p.offsetY += p.offsetVY;

      // 8) Итоговая позиция частицы для рисования
      p.x = orbitX + p.offsetX;
      p.y = orbitY + p.offsetY;

      // 9) Обновление прозрачности (ярче при отталкивании)
      p.opacity = p.baseOpacity * (p.isRepelled ? 1.0 : 0.6);
    }
  }

  private drawParticles() {
    // Очищаем canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const part = this.particles;

    // 1) Рисуем каждую частицу: градиентная точка + «свечение» при отталкивании
    for (let i = 0; i < part.length; i++) {
      const p = part[i];
      const alpha = p.opacity;
      const size = p.size;

      // Радиальный градиент для «тела» частицы
      const gradient = this.ctx.createRadialGradient(
        p.x,
        p.y,
        0,
        p.x,
        p.y,
        size
      );
      gradient.addColorStop(0, p.color.replace('1)', `${alpha})`));
      gradient.addColorStop(1, p.color.replace('1)', '0)'));

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      this.ctx.fill();

      // Лёгкое свечение при отталкивании
      if (p.isRepelled) {
        const glowGradient = this.ctx.createRadialGradient(
          p.x,
          p.y,
          size,
          p.x,
          p.y,
          size * 3
        );
        glowGradient.addColorStop(0, p.color.replace('1)', `${alpha * 0.4})`));
        glowGradient.addColorStop(1, p.color.replace('1)', '0)'));

        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // 2) Рисуем тонкие градиентные линии (связи) очень редко, раз в 10 кадров
    if (this.frameCount % 10 === 0) {
      this.ctx.lineWidth = 0.5;
      for (let i = 0; i < part.length; i += 15) {
        const pA = part[i];
        for (let j = 1; j <= 2 && i + j < part.length; j++) {
          const pB = part[i + j];
          const dx = pA.x - pB.x;
          const dy = pA.y - pB.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 900) {
            const gradient = this.ctx.createLinearGradient(
              pA.x,
              pA.y,
              pB.x,
              pB.y
            );
            // Прозрачные концы линии, чтобы она была едва заметна
            gradient.addColorStop(0, pA.color.replace('1)', '0.04)'));
            gradient.addColorStop(1, pB.color.replace('1)', '0.04)'));

            this.ctx.strokeStyle = gradient;
            this.ctx.beginPath();
            this.ctx.moveTo(pA.x, pA.y);
            this.ctx.lineTo(pB.x, pB.y);
            this.ctx.stroke();
          }
        }
      }
    }
  }

  private animate = () => {
    this.updateParticles();
    this.drawParticles();
    this.animationId = requestAnimationFrame(this.animate);
  };

  public destroy() {
    // Отменяем цикл анимации
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    // Снимаем слушатели
    window.removeEventListener('resize', this.resize);
    this.canvas.removeEventListener('mousemove', () => {});
    this.canvas.removeEventListener('mouseleave', () => {});
    this.canvas.removeEventListener('touchstart', () => {});
    this.canvas.removeEventListener('touchmove', () => {});
    this.canvas.removeEventListener('touchend', () => {});
  }
}

const ParticleSwarm: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const swarmRef = useRef<PerplexitySwarm | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Создаём экземпляр анимации
      swarmRef.current = new PerplexitySwarm(canvasRef.current);
    }
    return () => {
      // При размонтировании компонента — очищаем всё
      if (swarmRef.current) {
        swarmRef.current.destroy();
        swarmRef.current = null;
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1, cursor: 'none' }}
    />
  );
};

export default ParticleSwarm;
