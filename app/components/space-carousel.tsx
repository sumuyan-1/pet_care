"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    image: "https://d1tm14lrsghf7q.cloudfront.net/public/media/92224/conversions/paw-day-hcreates24-thumb.jpg",
    alt: "真实宠物洗护店明亮温暖的迎宾与休息空间",
    label: "01 / WELCOME",
    title: "进门先放松下来",
    description: "明亮舒适的迎宾空间，让第一次到店也有熟悉、安心的感觉。",
  },
  {
    image: "https://d1tm14lrsghf7q.cloudfront.net/public/media/92219/conversions/paw-day-hcreates10-thumb.jpg",
    alt: "真实宠物洗护店的宠物洗护美容操作区",
    label: "02 / GROOMING",
    title: "洗护过程清晰安心",
    description: "专业美容台与整洁陈列，让每一步护理都从容、卫生、看得见。",
  },
  {
    image: "https://d1tm14lrsghf7q.cloudfront.net/public/media/92217/conversions/paw-day-hcreates16-thumb.jpg",
    alt: "真实宠物洗护店为宠物与家长准备的休息区",
    label: "03 / REST & CARE",
    title: "留一处慢慢休息",
    description: "护理前后都可以自在适应，在舒适的小空间里放松一下。",
  },
];

export default function SpaceCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setCurrent((index) => (index + 1) % slides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [paused]);

  function step(amount: number) {
    setCurrent((index) => (index + amount + slides.length) % slides.length);
  }

  return (
    <section className="spaces" aria-labelledby="spaces-title">
      <div className="spaces-head">
        <div>
          <div className="eyebrow">看得见的安心</div>
          <h2 id="spaces-title">每个角落，都为舒服而准备。</h2>
        </div>
        <p>从迎接到洗护，再到安静休息，带你看看尾巴日记真实而用心的店内空间。</p>
      </div>
      <div className="space-carousel" aria-roledescription="轮播图" aria-label="宠物洗护店内环境" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }}>
        {slides.map((slide, index) => (
          <article
            className={`space-slide${index === current ? " is-active" : ""}`}
            aria-hidden={index !== current}
            key={slide.image}
          >
            <img src={slide.image} alt={slide.alt} referrerPolicy="no-referrer" />
            <div className="space-caption">
              <small>{slide.label}</small>
              <h3>{slide.title}</h3>
              <p>{slide.description}</p>
            </div>
          </article>
        ))}
        <div className="space-controls">
          <button className="space-arrow" type="button" onClick={() => step(-1)} aria-label="上一张">‹</button>
          <div className="space-dots" aria-label="选择店内区域">
            {slides.map((slide, index) => (
              <button
                className="space-dot"
                type="button"
                aria-label={`第 ${index + 1} 张：${slide.title}`}
                aria-current={index === current}
                onClick={() => setCurrent(index)}
                key={slide.image}
              />
            ))}
          </div>
          <span className="space-count" aria-live="polite">0{current + 1} / 0{slides.length}</span>
          <button className="space-arrow" type="button" onClick={() => step(1)} aria-label="下一张">›</button>
        </div>
      </div>
    </section>
  );
}

