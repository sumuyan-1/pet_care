"use client";

import { useEffect, useState } from "react";

const reviews = [
  { name: "林女士", pet: "柯基 · 七喜", date: "上周到店", quote: "七喜以前洗澡很紧张，这次店员先陪它熟悉环境，洗护时也一直轻声安抚。接回家毛毛蓬松又香香的，回家路上还开心地摇尾巴。" },
  { name: "周同学", pet: "布偶猫 · 芝麻", date: "两周前到店", quote: "第一次带猫咪做护理，本来很担心它会害怕。整个过程都很耐心，会随时告诉我芝麻的状态，梳毛也梳得特别仔细。" },
  { name: "陈先生", pet: "比熊 · 奶盖", date: "本月到店", quote: "修剪得很自然，脸型和脚底都收拾得干干净净。最喜欢这里不催不赶，奶盖能慢慢适应，结束后状态也很好。" },
  { name: "赵女士", pet: "橘猫 · 橘宝", date: "上月到店", quote: "环境明亮整洁，护理前会先了解猫咪平时的习惯。橘宝洗完没有应激，工作人员还贴心提醒了回家后的梳毛方法。" },
  { name: "王同学", pet: "柴犬 · 小满", date: "上月到店", quote: "预约方便，到店后不用等很久。洗澡、吹毛和清洁都做得很细致，全程也能看到小满的情况，体验很安心。" },
];

export default function ReviewsCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setCurrent((index) => (index + 1) % reviews.length), 5000);
    return () => window.clearInterval(timer);
  }, [paused]);

  const step = (amount: number) => setCurrent((index) => (index + amount + reviews.length) % reviews.length);
  const review = reviews[current];

  return (
    <section className="reviews-section" aria-labelledby="reviews-title">
      <div className="reviews-heading">
        <div><div className="eyebrow">邻居们的真实反馈</div><h2 id="reviews-title">每一份放心，都值得分享。</h2></div>
        <p>谢谢每一位家长的信任，也谢谢每一只毛孩子愿意把这里当作熟悉的小地方。</p>
      </div>
      <div className="review-carousel" aria-roledescription="轮播图" aria-label="客户评价" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }}>
        <div className="review-spark" aria-hidden="true">“</div>
        <article className="review-card" key={current} aria-live="polite">
          <div className="review-stars" aria-label="五星好评">★★★★★</div>
          <blockquote>{review.quote}</blockquote>
          <div className="review-author"><span className="review-avatar" aria-hidden="true">🐾</span><span><b>{review.name}</b><small>{review.pet} · {review.date}</small></span></div>
        </article>
        <div className="review-controls">
          <span className="review-count" aria-live="polite">0{current + 1} <i>/</i> 0{reviews.length}</span>
          <div className="review-dots" aria-label="选择评价">{reviews.map((item, index) => <button key={item.name} type="button" aria-label={`查看 ${item.name} 的评价`} aria-current={index === current} onClick={() => setCurrent(index)} />)}</div>
          <button className="review-arrow" type="button" onClick={() => step(-1)} aria-label="上一条评价">‹</button>
          <button className="review-arrow" type="button" onClick={() => step(1)} aria-label="下一条评价">›</button>
        </div>
      </div>
    </section>
  );
}
