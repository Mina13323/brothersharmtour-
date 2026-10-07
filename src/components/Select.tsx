"use client";

/**
 * Site-wide dropdown.
 *
 * A drop-in replacement for <select>: it takes the same <option>/<optgroup>
 * children and `value` / `onChange(e.target.value)` contract, but renders its
 * own list — rounded, padded, shadowed, keyboard-navigable — instead of the
 * browser's native popup, which cannot be styled. The list is portalled to
 * <body> so no overflow-hidden ancestor (hero panel, drawer, card) can clip it.
 *
 * `dark` switches to the admin palette.
 */

import {
  Children,
  Fragment,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface Item {
  value: string;
  label: string;
  disabled: boolean;
  group?: string;
}

function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}

/** Flattens <option>/<optgroup> children (through fragments and arrays). */
function collect(children: ReactNode, group?: string, out: Item[] = []): Item[] {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const el = child as ReactElement<{
      value?: string | number;
      disabled?: boolean;
      label?: string;
      children?: ReactNode;
    }>;
    if (el.type === Fragment) {
      collect(el.props.children, group, out);
    } else if (el.type === "optgroup") {
      collect(el.props.children, el.props.label, out);
    } else if (el.type === "option") {
      const label = textOf(el.props.children);
      out.push({
        value: el.props.value !== undefined ? String(el.props.value) : label,
        label,
        disabled: Boolean(el.props.disabled),
        group,
      });
    }
  });
  return out;
}

export interface SelectProps {
  value: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  dark?: boolean;
  "aria-label"?: string;
}

export function Select({
  value,
  onChange,
  children,
  className,
  id,
  name,
  disabled,
  dark = false,
  "aria-label": ariaLabel,
}: SelectProps) {
  const items = useMemo(() => collect(children), [children]);
  const current = items.find((i) => i.value === value) ?? null;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [rect, setRect] = useState<{ left: number; top: number; width: number; up: boolean } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const autoId = useId();
  const listId = `${id ?? autoId}-list`;

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    const up = below < 260 && r.top > below;
    setRect({
      left: r.left,
      top: up ? r.top : r.bottom,
      width: Math.max(r.width, 180),
      up,
    });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || listRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onScroll = (e: Event) => {
      if (listRef.current?.contains(e.target as Node)) return;
      place();
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, place]);

  // Start the highlight on the selected row and keep it scrolled into view.
  useEffect(() => {
    if (!open) return;
    setActive(Math.max(0, items.findIndex((i) => i.value === value)));
  }, [open, items, value]);
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const choose = (item: Item) => {
    if (item.disabled) return;
    setOpen(false);
    triggerRef.current?.focus();
    if (item.value !== value) {
      onChange?.({ target: { value: item.value, name }, currentTarget: { value: item.value, name } } as unknown as ChangeEvent<HTMLSelectElement>);
    }
  };

  const move = (dir: 1 | -1) => {
    if (!items.length) return;
    let i = active;
    for (let n = 0; n < items.length; n++) {
      i = (i + dir + items.length) % items.length;
      if (!items[i].disabled) break;
    }
    setActive(i);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(items.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (items[active]) choose(items[active]);
    } else if (e.key === "Tab") {
      setOpen(false);
    } else if (e.key.length === 1) {
      // Type-ahead: jump to the next option starting with the typed letter.
      const ch = e.key.toLowerCase();
      const start = active + 1;
      const hit = [...items.slice(start), ...items.slice(0, start)].find(
        (i) => !i.disabled && i.label.toLowerCase().startsWith(ch),
      );
      if (hit) setActive(items.indexOf(hit));
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={cn(
          "flex items-center justify-between gap-2 text-start cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
          dark && "bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus-visible:border-teal-500/60",
          className,
        )}
      >
        <span className="min-w-0 flex-1 truncate">{current?.label ?? ""}</span>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          aria-hidden
          className={cn("shrink-0 transition-transform duration-200", open && "rotate-180", dark ? "text-stone-400" : "text-stone")}
        >
          <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {name ? <input type="hidden" name={name} value={value} /> : null}

      {open && rect && typeof document !== "undefined"
        ? createPortal(
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label={ariaLabel}
              style={{
                position: "fixed",
                left: rect.left,
                width: rect.width,
                top: rect.up ? undefined : rect.top + 6,
                bottom: rect.up ? window.innerHeight - rect.top + 6 : undefined,
                zIndex: 1000,
              }}
              className={cn(
                "max-h-72 overflow-y-auto overscroll-contain rounded-2xl border p-1.5 shadow-2xl animate-[select-pop_120ms_ease-out]",
                dark
                  ? "border-white/10 bg-[#101c1f] text-stone-100 shadow-black/50"
                  : "border-sand bg-paper text-ink shadow-ink/15",
              )}
            >
              {items.map((item, i) => {
                const selected = item.value === value;
                const showGroup = item.group && item.group !== items[i - 1]?.group;
                return (
                  <Fragment key={`${item.value}-${i}`}>
                    {showGroup ? (
                      <li
                        role="presentation"
                        className={cn(
                          "px-3 pb-1 pt-2.5 text-[0.65rem] font-bold uppercase tracking-[0.14em]",
                          dark ? "text-stone-500" : "text-stone",
                        )}
                      >
                        {item.group}
                      </li>
                    ) : null}
                    <li
                      role="option"
                      aria-selected={selected}
                      aria-disabled={item.disabled || undefined}
                      data-i={i}
                      onMouseEnter={() => setActive(i)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => choose(item)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[0.9rem] leading-snug transition-colors",
                        item.disabled && "cursor-not-allowed opacity-40",
                        i === active && !item.disabled && (dark ? "bg-white/10" : "bg-paper-warm"),
                        selected && (dark ? "font-semibold text-teal-300" : "font-semibold text-reef-deep"),
                      )}
                    >
                      <span className="min-w-0">{item.label}</span>
                      {selected ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="shrink-0">
                          <path d="m2.5 7.4 3 3 6-6.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : null}
                    </li>
                  </Fragment>
                );
              })}
            </ul>,
            document.body,
          )
        : null}
    </>
  );
}
