"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

const AMAP_URL =
  "https://uri.amap.com/search?keyword=%E9%87%8D%E5%BA%86%E5%A4%A7%E5%AD%A6%E8%99%8E%E6%BA%AA%E6%A0%A1%E5%8C%BA%E6%A2%85%E5%9B%AD%E5%85%AD%E6%A0%8B&city=%E9%87%8D%E5%BA%86%E5%B8%82&view=map&src=taildiary";

const PET_TYPES = ["小型犬", "中大型犬", "猫咪", "其他小动物"];

const SERVICES = [
  "清爽洗澡（小型犬 ¥128 起）",
  "洗澡 + 精致修剪（小型犬 ¥198 起）",
  "猫咪轻柔护理（短毛猫 ¥168 起）",
  "温和洁耳护理（新客首次到店赠送）",
  "还没想好，到店再商量",
];

type Field = "name" | "phone" | "time" | "pet" | "service" | "note";

const BLANK: Record<Field, string> = {
  name: "",
  phone: "",
  time: "",
  pet: "",
  service: "",
  note: "",
};

const LABELS: Record<Field, string> = {
  name: "联系人",
  phone: "手机号",
  time: "预计到店时间",
  pet: "宠物类型",
  service: "服务项目",
  note: "备注",
};

function formatSlot(value: string) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!parts) return value;
  return `${Number(parts[1])}年${Number(parts[2])}月${Number(parts[3])}日 ${parts[4]}:${parts[5]}`;
}

function localStamp() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return `${date}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export default function QuickBooking() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<Record<Field, string>>(BLANK);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [earliest, setEarliest] = useState("");

  const open = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    window.setTimeout(() => nameRef.current?.focus(), 80);
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  // 页面上任何带 data-booking-open 的按钮/链接都能唤起预约窗口
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest("[data-booking-open]")) return;
      event.preventDefault();
      open();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    setEarliest(localStamp());

    const sync = () => {
      document.body.classList.toggle("booking-open", dialog.open);
      if (dialog.open) return;
      setSubmitted(false);
      setCopied(false);
      setErrors({});
    };

    dialog.addEventListener("toggle", sync);
    return () => {
      dialog.removeEventListener("toggle", sync);
      document.body.classList.remove("booking-open");
    };
  }, []);

  // 支持直接分享 /#booking 链接进入预约
  useEffect(() => {
    const syncFromHash = () => {
      if (window.location.hash === "#booking") open();
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [open]);

  const change =
    (field: Field) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Partial<Record<Field, string>> = {};
    if (!values.name.trim()) next.name = "请填写联系人称呼";
    if (!/^1[3-9]\d{9}$/.test(values.phone.trim())) next.phone = "请填写 11 位手机号";
    if (!values.time) next.time = "请选择预计到店时间";
    if (!values.pet) next.pet = "请选择宠物类型";
    if (!values.service) next.service = "请选择服务项目";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitted(true);
  };

  const summary = [
    "【尾巴日记 · 快速预约】",
    `联系人：${values.name.trim()}`,
    `手机号：${values.phone.trim()}`,
    `预计到店：${formatSlot(values.time)}`,
    `宠物类型：${values.pet}`,
    `服务项目：${values.service}`,
    values.note.trim() ? `备注：${values.note.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setValues(BLANK);
    setErrors({});
    setSubmitted(false);
    setCopied(false);
    window.setTimeout(() => nameRef.current?.focus(), 80);
  };

  return (
    <dialog ref={dialogRef} className="booking-dialog" aria-labelledby="bd-title">
      <div className="bd-head">
        <div>
          <div className="eyebrow">快速预约</div>
          <h2 id="bd-title" className="bd-title">
            留个时间，我们提前准备好。
          </h2>
        </div>
        <button type="button" className="bd-close" aria-label="关闭预约窗口" onClick={close}>
          ✕
        </button>
      </div>

      {submitted ? (
        <div className="bd-done">
          <div className="bd-check" aria-hidden="true">
            ✓
          </div>
          <h3>信息已经整理好了</h3>
          <p className="bd-done-note">
            把下面这段复制发给门店微信，或到店时直接出示，我们会按时间帮你留好位置。
          </p>
          <dl className="bd-summary">
            {(Object.keys(LABELS) as Field[])
              .filter((field) => values[field].trim())
              .map((field) => (
                <div key={field}>
                  <dt>{LABELS[field]}</dt>
                  <dd>{field === "time" ? formatSlot(values[field]) : values[field]}</dd>
                </div>
              ))}
          </dl>
          <div className="bd-actions">
            <button type="button" className="bd-primary" onClick={copy}>
              {copied ? "已复制 ✓" : "复制预约信息"}
            </button>
            <button type="button" className="bd-ghost" onClick={reset}>
              再填一单
            </button>
          </div>
          <a className="bd-link" href={AMAP_URL} target="_blank" rel="noopener">
            在高德地图里看路线 ↗
          </a>
        </div>
      ) : (
        <form className="bd-form" onSubmit={submit} noValidate>
          <div className="bd-grid">
            <label className="bd-field">
              <span className="bd-label">联系人</span>
              <input
                ref={nameRef}
                name="name"
                autoComplete="name"
                placeholder="怎么称呼你"
                value={values.name}
                onChange={change("name")}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name ? <small className="bd-error">{errors.name}</small> : null}
            </label>
            <label className="bd-field">
              <span className="bd-label">手机号</span>
              <input
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={11}
                placeholder="11 位手机号"
                value={values.phone}
                onChange={change("phone")}
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone ? <small className="bd-error">{errors.phone}</small> : null}
            </label>
          </div>

          <div className="bd-grid">
            <label className="bd-field">
              <span className="bd-label">预计到店时间</span>
              <input
                name="time"
                type="datetime-local"
                min={earliest || undefined}
                value={values.time}
                onChange={change("time")}
                aria-invalid={Boolean(errors.time)}
              />
              {errors.time ? <small className="bd-error">{errors.time}</small> : null}
            </label>
            <label className="bd-field">
              <span className="bd-label">宠物类型</span>
              <select
                name="pet"
                value={values.pet}
                onChange={change("pet")}
                aria-invalid={Boolean(errors.pet)}
              >
                <option value="">请选择</option>
                {PET_TYPES.map((pet) => (
                  <option key={pet} value={pet}>
                    {pet}
                  </option>
                ))}
              </select>
              {errors.pet ? <small className="bd-error">{errors.pet}</small> : null}
            </label>
          </div>

          <label className="bd-field">
            <span className="bd-label">服务项目</span>
            <select
              name="service"
              value={values.service}
              onChange={change("service")}
              aria-invalid={Boolean(errors.service)}
            >
              <option value="">请选择</option>
              {SERVICES.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
            {errors.service ? <small className="bd-error">{errors.service}</small> : null}
          </label>

          <label className="bd-field">
            <span className="bd-label">
              备注<span className="bd-optional">（选填）</span>
            </span>
            <textarea
              name="note"
              rows={3}
              placeholder="例如：怕吹风、皮肤敏感、想约固定的美容师…"
              value={values.note}
              onChange={change("note")}
            />
          </label>

          <p className="bd-hint">提交后门店会在到店前和你确认，时间有变动直接改一下就行。</p>

          <div className="bd-actions">
            <button type="submit" className="bd-primary">
              提交预约
            </button>
            <button type="button" className="bd-ghost" onClick={close}>
              先不约了
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
