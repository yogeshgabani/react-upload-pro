import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  I18nProvider,
  ThemeProvider,
  ValidationErrorsModal,
  rtlLocales,
  type Locale,
  type Theme,
  type ValidationError,
} from "react-upload-pro";
import { getDemoMessages, type DemoMessages } from "./i18n";
import {
  BusinessCRM,
  BusinessDashboard,
  BusinessSaaS,
  CreativeAnimated,
  CreativeAvatar,
  CreativeGradient,
  CreativePremium,
  EnterpriseDocs,
  EnterpriseFullscreen,
  EnterpriseMediaLibrary,
  EnterpriseTeam,
  LayoutBox,
  LayoutCard,
  LayoutModal,
  LayoutSidebar,
  MinimalGlass,
  MinimalInline,
  MinimalMaterial,
  MinimalModern,
  MinimalNeumorphic,
} from "react-upload-pro/variants";
import { createMockAdapter } from "./mockAdapter";

// ────────── Variant registry ──────────

type VariantKey =
  | "MinimalModern"
  | "MinimalGlass"
  | "MinimalNeumorphic"
  | "MinimalMaterial"
  | "MinimalInline"
  | "BusinessCRM"
  | "BusinessDashboard"
  | "BusinessSaaS"
  | "CreativeGradient"
  | "CreativeAnimated"
  | "CreativePremium"
  | "CreativeAvatar"
  | "EnterpriseDocs"
  | "EnterpriseTeam"
  | "EnterpriseMediaLibrary"
  | "EnterpriseFullscreen"
  | "LayoutBox"
  | "LayoutCard"
  | "LayoutSidebar"
  | "LayoutModal";

const variantMap: Record<
  VariantKey,
  { name: string; category: string; Component: React.ComponentType<any> }
> = {
  MinimalModern: {
    name: "Modern",
    category: "Minimal",
    Component: MinimalModern,
  },
  MinimalGlass: { name: "Glass", category: "Minimal", Component: MinimalGlass },
  MinimalNeumorphic: {
    name: "Neumorphic",
    category: "Minimal",
    Component: MinimalNeumorphic,
  },
  MinimalMaterial: {
    name: "Material",
    category: "Minimal",
    Component: MinimalMaterial,
  },
  MinimalInline: {
    name: "Inline",
    category: "Minimal",
    Component: MinimalInline,
  },
  BusinessCRM: { name: "CRM", category: "Business", Component: BusinessCRM },
  BusinessDashboard: {
    name: "Dashboard",
    category: "Business",
    Component: BusinessDashboard,
  },
  BusinessSaaS: { name: "SaaS", category: "Business", Component: BusinessSaaS },
  CreativeGradient: {
    name: "Gradient",
    category: "Creative",
    Component: CreativeGradient,
  },
  CreativeAnimated: {
    name: "Animated",
    category: "Creative",
    Component: CreativeAnimated,
  },
  CreativePremium: {
    name: "Premium",
    category: "Creative",
    Component: CreativePremium,
  },
  CreativeAvatar: {
    name: "Avatar",
    category: "Creative",
    Component: CreativeAvatar,
  },
  EnterpriseDocs: {
    name: "Docs",
    category: "Enterprise",
    Component: EnterpriseDocs,
  },
  EnterpriseTeam: {
    name: "Team",
    category: "Enterprise",
    Component: EnterpriseTeam,
  },
  EnterpriseMediaLibrary: {
    name: "Media library",
    category: "Enterprise",
    Component: EnterpriseMediaLibrary,
  },
  EnterpriseFullscreen: {
    name: "Fullscreen",
    category: "Enterprise",
    Component: EnterpriseFullscreen,
  },
  LayoutBox: { name: "Box", category: "Layouts", Component: LayoutBox },
  LayoutCard: { name: "Card", category: "Layouts", Component: LayoutCard },
  LayoutSidebar: {
    name: "Sidebar",
    category: "Layouts",
    Component: LayoutSidebar,
  },
  LayoutModal: { name: "Modal", category: "Layouts", Component: LayoutModal },
};

const variantKeys = Object.keys(variantMap) as VariantKey[];

const progressVariants = [
  "striped",
  "bar",
  "circle",
  "minimal",
  "gradient",
  "segmented",
  "dots",
] as const;
type PV = (typeof progressVariants)[number];

/** Preset accept-filter shortcuts shown in the Accept dropdown.
 *  Labels are resolved per-locale; values stay technical/identifier-only. */
function buildAcceptPresets(dm: DemoMessages): { label: string; value: string }[] {
  return [
    { label: dm.acceptAny, value: "" },
    { label: dm.acceptImages, value: "image/*" },
    { label: dm.acceptVideos, value: "video/*" },
    { label: dm.acceptAudio, value: "audio/*" },
    { label: dm.acceptPdf, value: "application/pdf" },
    { label: dm.acceptImagesPdf, value: "image/*,application/pdf" },
    { label: dm.acceptOffice, value: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" },
    { label: dm.acceptArchives, value: ".zip,.rar,.7z,.tar,.gz" },
  ];
}

const ACCEPT_CUSTOM = "__custom__";

const accentPresets: { name: string; rgb: string; hex: string }[] = [
  { name: "Indigo", rgb: "79 70 229", hex: "#4f46e5" },
  { name: "Blue", rgb: "37 99 235", hex: "#2563eb" },
  { name: "Cyan", rgb: "8 145 178", hex: "#0891b2" },
  { name: "Emerald", rgb: "16 185 129", hex: "#10b981" },
  { name: "Amber", rgb: "245 158 11", hex: "#f59e0b" },
  { name: "Rose", rgb: "244 63 94", hex: "#f43f5e" },
  { name: "Purple", rgb: "147 51 234", hex: "#9333ea" },
  { name: "Slate", rgb: "71 85 105", hex: "#475569" },
];

function hexToRgbTriplet(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return accentPresets[0]!.rgb;
  const v = parseInt(m[1]!, 16);
  return `${(v >> 16) & 0xff} ${(v >> 8) & 0xff} ${v & 0xff}`;
}

function rgbTripletToHex(rgb: string): string {
  const parts = rgb
    .split(" ")
    .map((n) => Math.max(0, Math.min(255, Number(n))));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n)))
    return "#4f46e5";
  return "#" + parts.map((n) => n.toString(16).padStart(2, "0")).join("");
}

function pickAccentFg(rgb: string): string {
  const [r = 0, g = 0, b = 0] = rgb.split(" ").map(Number);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "17 24 39" : "255 255 255";
}

const acceptHintFriendly: Record<string, string> = {
  "image/*": "PNG, JPG, GIF",
  "video/*": "MP4, MOV, WebM",
  "audio/*": "MP3, WAV, OGG",
  "application/pdf": "PDF",
  "image/*,application/pdf": "Images, PDF",
};

function deriveHint(accept: string, maxSizeMB: number): string {
  let types: string;
  if (!accept) {
    types = "Any file type";
  } else if (acceptHintFriendly[accept]) {
    types = acceptHintFriendly[accept]!;
  } else {
    types = accept
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => {
        if (t.startsWith(".")) return t.slice(1).toUpperCase();
        if (t.endsWith("/*")) {
          const top = t.split("/")[0] ?? "";
          return top.charAt(0).toUpperCase() + top.slice(1);
        }
        if (t.includes("/")) return (t.split("/")[1] ?? "").toUpperCase();
        return t.toUpperCase();
      })
      .join(", ");
  }
  return maxSizeMB > 0 ? `${types} up to ${maxSizeMB}MB` : types;
}

// ────────── Playground state ──────────

type ConfigTab = "style" | "files" | "upload" | "advanced";
type Viewport = "mobile" | "tablet" | "desktop";
type CodeTab = "component" | "install";

interface PlaygroundState {
  variant: VariantKey;
  theme: Theme;
  locale: Locale;
  accentRgb: string;
  multiple: boolean;
  directory: boolean;
  clipboard: boolean;
  rejectDuplicates: boolean;
  disabled: boolean;
  previewable: boolean;
  editable: boolean;
  showErrorModal: boolean;
  scrollAfter: number;
  maxHeight: string;
  simulateUploads: boolean;
  failRate: number;
  accept: string;
  maxSizeMB: number;
  maxFiles: number;
  mode: "manual" | "instant" | "auto" | "queue";
  strategy: "parallel" | "sequential";
  concurrency: number;
  retries: number;
  chunkSizeMB: number;
  endpoint: string;
  label: string;
  hint: string;
  progressVariant: PV;
  progressSize: number;
  width: string;
  height: string;
}

const defaultState: PlaygroundState = {
  variant: "MinimalModern",
  theme: "auto",
  locale: "en",
  accentRgb: accentPresets[0]!.rgb,
  multiple: true,
  directory: false,
  clipboard: true,
  rejectDuplicates: false,
  disabled: false,
  previewable: true,
  editable: true,
  showErrorModal: true,
  scrollAfter: 3,
  maxHeight: "280px",
  simulateUploads: true,
  failRate: 0,
  accept: "image/*",
  maxSizeMB: 10,
  maxFiles: 10,
  mode: "auto",
  strategy: "parallel",
  concurrency: 3,
  retries: 2,
  chunkSizeMB: 0,
  endpoint: "/api/upload",
  label: "",
  hint: "",
  progressVariant: "striped",
  progressSize: 5,
  width: "",
  height: "",
};

// ────────── Code generation ──────────

function generateCode(s: PlaygroundState): string {
  const props: string[] = [];
  if (s.showErrorModal) {
    props.push(`  onDropRejected={(errs) => setRejected(errs)}`);
  }
  if (s.simulateUploads) {
    props.push(`  cloud={mockAdapter}`);
  } else if (s.endpoint) {
    props.push(`  endpoint="${s.endpoint}"`);
  }
  if (s.accept) props.push(`  accept="${s.accept}"`);
  if (s.maxSizeMB > 0) props.push(`  maxSize={${s.maxSizeMB} * 1024 * 1024}`);
  if (s.maxFiles > 0) props.push(`  maxFiles={${s.maxFiles}}`);
  if (!s.multiple) props.push(`  multiple={false}`);
  if (s.directory) props.push(`  directory`);
  if (!s.clipboard) props.push(`  clipboard={false}`);
  if (s.rejectDuplicates) props.push(`  rejectDuplicates`);
  if (s.disabled) props.push(`  disabled`);
  if (s.previewable) props.push(`  previewable`);
  if (s.editable) props.push(`  editable`);
  if (s.scrollAfter > 0) {
    props.push(`  scrollAfter={${s.scrollAfter}}`);
    if (s.maxHeight !== "280px") props.push(`  maxHeight="${s.maxHeight}"`);
  }
  if (s.progressVariant !== "striped")
    props.push(`  progressVariant="${s.progressVariant}"`);
  if (s.progressSize > 0) props.push(`  progressSize={${s.progressSize}}`);
  if (s.width) props.push(`  width="${s.width}"`);
  if (s.height) props.push(`  height="${s.height}"`);
  if (s.mode !== "manual") props.push(`  mode="${s.mode}"`);
  if (s.strategy !== "parallel") props.push(`  strategy="${s.strategy}"`);
  if (s.concurrency !== 3) props.push(`  concurrency={${s.concurrency}}`);
  if (s.retries !== 2) props.push(`  retries={${s.retries}}`);
  if (s.chunkSizeMB > 0)
    props.push(`  chunkSize={${s.chunkSizeMB} * 1024 * 1024}`);
  if (s.label) props.push(`  label="${s.label}"`);
  const hint = s.hint.trim() || deriveHint(s.accept, s.maxSizeMB);
  if (hint) props.push(`  hint="${hint}"`);
  props.push(`  onUploadSuccess={(file) => console.log('done', file)}`);

  const mockImport = s.simulateUploads
    ? `\n// Playground mock; remove and use a real endpoint or cloud adapter in production.
const mockAdapter = { name: 'mock', upload: async () => ({ url: 'mock://' }) };\n`
    : "";

  const errorImport = s.showErrorModal
    ? `, ValidationErrorsModal, type ValidationError`
    : "";
  const errorStateBlock = s.showErrorModal
    ? `  const [rejected, setRejected] = React.useState<ValidationError[]>([]);\n`
    : "";
  const errorModalRender = s.showErrorModal
    ? `
        <ValidationErrorsModal
          open={rejected.length > 0}
          errors={rejected}
          onClose={() => setRejected([])}
        />`
    : "";

  return `import * as React from 'react';
import { ThemeProvider, I18nProvider${errorImport} } from 'react-upload-pro';
import { ${s.variant} } from 'react-upload-pro/variants';
import 'react-upload-pro/styles.css';
${mockImport}
export function MyUploader() {
${errorStateBlock}  return (
    <ThemeProvider defaultTheme="${s.theme}">
      <I18nProvider locale="${s.locale}">
        <${s.variant}
${props.join("\n")}
        />${errorModalRender}
      </I18nProvider>
    </ThemeProvider>
  );
}
`;
}

const installSnippet = `# pnpm
pnpm add react-upload-pro

# npm
npm install react-upload-pro

# yarn
yarn add react-upload-pro`;

// ────────── Tokens ──────────

const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

// ────────── Form primitives ──────────

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      )}
    </label>
  );
}

function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${className ?? ""}`} />;
}

function NumberInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="number"
      {...props}
      className={`${inputCls} ${className ?? ""}`}
    />
  );
}

function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} ${className ?? ""}`} />;
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`group flex w-full items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-all ${
        checked
          ? "border-indigo-300 bg-indigo-50/60 dark:border-indigo-700/50 dark:bg-indigo-950/30"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
      }`}
    >
      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm font-medium ${
            checked
              ? "text-indigo-900 dark:text-indigo-100"
              : "text-slate-800 dark:text-slate-100"
          }`}
        >
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs leading-snug text-slate-500 dark:text-slate-400">
            {description}
          </span>
        )}
      </span>
      <span
        aria-hidden
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
          checked
            ? "bg-indigo-600 shadow-[inset_0_1px_2px_rgb(0_0_0_/_0.15)]"
            : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`absolute h-5 w-5 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-200 ease-out ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

// ────────── Tabs ──────────

interface TabsProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  tabs: { value: T; label: string; icon?: React.ReactNode }[];
}

function Tabs<T extends string>({ value, onChange, tabs }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className="flex gap-1 rounded-lg border border-slate-200 bg-slate-100/70 p-1 dark:border-slate-800 dark:bg-slate-900/70"
    >
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-xs font-medium transition sm:gap-1.5 sm:px-3 ${
            value === t.value
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          {/* Icons hide at narrow widths to give the label room — at 320px
              with 4 tabs we'd otherwise overflow and clip the last one. */}
          {t.icon && (
            <span className="hidden sm:inline-flex" aria-hidden>
              {t.icon}
            </span>
          )}
          <span className="truncate">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ────────── Code block ──────────

function CodeBlock({
  code,
  filename,
  dm,
}: {
  code: string;
  filename: string;
  dm: DemoMessages;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500/80 sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-amber-500/80 sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-emerald-500/80 sm:h-2.5 sm:w-2.5" />
          <span className="ml-1.5 truncate text-[11px] font-medium text-slate-400 sm:ml-2 sm:text-xs">
            {filename}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition sm:px-2.5 sm:text-xs ${
            copied
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-slate-800 text-slate-200 hover:bg-slate-700"
          }`}
        >
          {copied ? (
            <>
              <Icon name="check" size={12} />
              {dm.copied}
            </>
          ) : (
            <>
              <Icon name="copy" size={12} />
              {dm.copy}
            </>
          )}
        </button>
      </div>
      <pre className="rup-scrollbar overflow-x-auto p-3 text-[12px] leading-relaxed text-slate-100 sm:p-4 sm:text-[13px]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ────────── Icons (inline so we don't pull a deps tree) ──────────

const iconPaths: Record<string, React.ReactNode> = {
  check: <polyline points="20 6 9 17 4 12" />,
  copy: (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  brush: (
    <>
      <path d="M3 21v-4a4 4 0 0 1 4-4h10" />
      <path d="M7 17l5-5 5 5-5 5z" />
      <path d="M19 9l-3-3 3-3 3 3z" />
    </>
  ),
  files: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </>
  ),
  cloud: <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />,
  sliders: (
    <>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </>
  ),
  upload: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </>
  ),
  monitor: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </>
  ),
  tablet: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="12" y1="18" x2="12" y2="18" />
    </>
  ),
  smartphone: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12" y2="18" />
    </>
  ),
  rotate: (
    <>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </>
  ),
  github: null, // rendered via separate filled SVG
};

function Icon({
  name,
  size = 14,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {iconPaths[name]}
    </svg>
  );
}

// ────────── App ──────────

export function App() {
  const [s, setS] = useState<PlaygroundState>(defaultState);
  const set = <K extends keyof PlaygroundState>(
    key: K,
    value: PlaygroundState[K],
  ) => setS((prev) => ({ ...prev, [key]: value }));

  // Empty hint = auto-derive from accept + maxSize. Any non-empty value is
  // treated as a user override and used verbatim.
  const autoHint = deriveHint(s.accept, s.maxSizeMB);
  const effectiveHint = s.hint.trim() || autoHint;

  // Playground UI messages for the active locale (separate from the
  // library's own i18n which translates the dropzone widget internals).
  const dm = getDemoMessages(s.locale);

  const [configTab, setConfigTab] = useState<ConfigTab>("style");
  const [codeTab, setCodeTab] = useState<CodeTab>("component");
  const [viewport, setViewport] = useState<Viewport>("desktop");

  const Variant = variantMap[s.variant].Component;
  const code = useMemo(() => generateCode(s), [s]);

  const mockAdapter = useMemo(
    () => createMockAdapter({ durationMs: 3000, failRate: s.failRate }),
    [s.failRate],
  );

  // Rejected-file modal state
  const [rejectedErrors, setRejectedErrors] = useState<ValidationError[]>([]);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const handleDropRejected = (errors: ValidationError[]) => {
    if (!s.showErrorModal || errors.length === 0) return;
    setRejectedErrors(errors);
    setErrorModalOpen(true);
  };

  const variantProps: Record<string, unknown> = {
    multiple: s.multiple,
    directory: s.directory,
    clipboard: s.clipboard,
    rejectDuplicates: s.rejectDuplicates,
    disabled: s.disabled,
    previewable: s.previewable,
    editable: s.editable,
    scrollAfter: s.scrollAfter > 0 ? s.scrollAfter : undefined,
    maxHeight: s.maxHeight,
    progressVariant: s.progressVariant,
    progressSize: s.progressSize > 0 ? s.progressSize : undefined,
    width: s.width || undefined,
    height: s.height || undefined,
    accept: s.accept || undefined,
    maxSize: s.maxSizeMB > 0 ? s.maxSizeMB * 1024 * 1024 : undefined,
    maxFiles: s.maxFiles > 0 ? s.maxFiles : undefined,
    mode: s.mode,
    strategy: s.strategy,
    concurrency: s.concurrency,
    retries: s.retries,
    chunkSize: s.chunkSizeMB > 0 ? s.chunkSizeMB * 1024 * 1024 : undefined,
    label: s.label || undefined,
    hint: effectiveHint,
    onDrop: (a: unknown, r: unknown) =>
      console.log("drop", { accepted: a, rejected: r }),
    onDropRejected: handleDropRejected,
  };
  if (s.simulateUploads) {
    variantProps.cloud = mockAdapter;
  } else {
    variantProps.endpoint = s.endpoint || undefined;
  }

  const accentStyle = {
    "--rup-accent": s.accentRgb,
    "--rup-accent-fg": pickAccentFg(s.accentRgb),
  } as React.CSSProperties;

  // Mirror the accent + border onto :root so the *body's* native scrollbar
  // (and anything else above the ThemeProvider in the DOM) reads the same
  // values and stays in sync with the accent picker + light/dark theme.
  // Inline style on the wrapper div alone can't reach upward past
  // data-rup-root.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--rup-accent", s.accentRgb);
    root.style.setProperty("--rup-accent-fg", pickAccentFg(s.accentRgb));
    return () => {
      root.style.removeProperty("--rup-accent");
      root.style.removeProperty("--rup-accent-fg");
    };
  }, [s.accentRgb]);

  // Track color follows the resolved theme — light slate-200, dark slate-700.
  // Resolved on the fly because 'auto' depends on prefers-color-scheme and we
  // need to react if the OS theme changes while the user is on 'auto'.
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const isDark =
        s.theme === "dark" ||
        (s.theme === "auto" &&
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.style.setProperty(
        "--rup-border",
        isDark ? "55 65 81" : "229 231 235",
      );
    };
    apply();
    if (s.theme === "auto" && typeof window !== "undefined") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      mql.addEventListener("change", apply);
      return () => mql.removeEventListener("change", apply);
    }
    return undefined;
  }, [s.theme]);

  const viewportWidths: Record<Viewport, string> = {
    mobile: "375px",
    tablet: "768px",
    desktop: "100%",
  };

  return (
    <ThemeProvider theme={s.theme} onThemeChange={(t) => set("theme", t)}>
      <I18nProvider locale={s.locale}>
        <div
          dir={rtlLocales.has(s.locale) ? "rtl" : "ltr"}
          style={accentStyle}
          className="relative isolate min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100"
        >
          {/* Decorative aurora overlay — a soft accent-tinted spotlight at the
              top of the viewport, fixed so it stays present while scrolling.
              `var(--rup-accent)` makes it follow the accent color picker. */}
          <div
            aria-hidden
            className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[700px] opacity-70 dark:opacity-50"
            style={{
              background:
                "radial-gradient(ellipse 70% 40% at 50% 0%, rgb(var(--rup-accent) / 0.22), transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none fixed inset-y-0 right-0 -z-10 w-[40%] opacity-50 dark:opacity-30"
            style={{
              background:
                "radial-gradient(ellipse 80% 40% at 100% 50%, rgb(168 85 247 / 1), transparent 70%)",
            }}
          />
          {/* ───── Header ───── */}
          <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70">
            <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 flex-wrap px-4 py-3 sm:gap-4 sm:px-6 sm:py-3.5">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/20 sm:h-9 sm:w-9 sm:rounded-xl">
                  <Icon name="upload" size={16} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h1 className="truncate text-sm font-bold leading-tight sm:text-base">
                      react-upload-pro
                    </h1>
                    <span className="hidden rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 sm:inline dark:bg-indigo-950 dark:text-indigo-300">
                      V0.1.1
                    </span>
                  </div>
                  <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
                    {dm.tagline}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <Select
                  value={s.theme}
                  onChange={(e) => set("theme", e.target.value as Theme)}
                  className="!w-auto !py-1 text-xs"
                  aria-label={dm.themeAria}
                >
                  <option value="auto">{dm.themeAuto}</option>
                  <option value="light">{dm.themeLight}</option>
                  <option value="dark">{dm.themeDark}</option>
                </Select>
                <Select
                  value={s.locale}
                  onChange={(e) => set("locale", e.target.value as Locale)}
                  className="!w-auto !py-1 text-xs"
                  aria-label={dm.localeAria}
                >
                  <option value="en">EN · English</option>
                  <option value="es">ES · Español</option>
                  <option value="fr">FR · Français</option>
                  <option value="de">DE · Deutsch</option>
                  <option value="it">IT · Italiano</option>
                  <option value="pt">PT · Português</option>
                  <option value="nl">NL · Nederlands</option>
                  <option value="pl">PL · Polski</option>
                  <option value="ru">RU · Русский</option>
                  <option value="tr">TR · Türkçe</option>
                  <option value="zh">ZH · 中文</option>
                  <option value="ja">JA · 日本語</option>
                  <option value="ko">KO · 한국어</option>
                  <option value="vi">VI · Tiếng Việt</option>
                  <option value="th">TH · ไทย</option>
                  <option value="id">ID · Bahasa Indonesia</option>
                  <option value="hi">HI · हिन्दी</option>
                  <option value="gu">GU · ગુજરાતી</option>
                  <option value="bn">BN · বাংলা</option>
                  <option value="ar">AR · العربية</option>
                  <option value="ur">UR · اردو</option>
                  <option value="he">HE · עברית</option>
                  <option value="fa">FA · فارسی</option>
                </Select>
                <a
                  href="https://github.com/react-upload-pro/react-upload-pro"
                  target="_blank"
                  rel="noreferrer"
                  className="hidden items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:inline-flex"
                  aria-label="GitHub"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.03 0 0 .96-.31 3.16 1.18.92-.26 1.9-.39 2.88-.39s1.96.13 2.88.39c2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.74.11 3.03.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.37-5.25 5.65.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
                  </svg>
                  GitHub
                </a>
              </div>
            </div>
          </header>

          {/* ───── Main ───── */}
          <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
            {/* `grid-cols-1` on mobile is critical: without it the grid has no
                explicit column track, so items size to their content width
                instead of stretching to fill the viewport. */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[360px_1fr]">
              {/* ───── Config sidebar ───── */}
              <aside
                className="rup-scrollbar min-w-0 lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-88px)] lg:self-start lg:overflow-y-auto"
                style={{ scrollbarGutter: "stable" }}
              >
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl dark:border-slate-800 dark:bg-slate-900">
                  <div className="border-b border-slate-200 px-4 py-3 sm:px-5 sm:py-4 dark:border-slate-800">
                    <h2 className="text-sm font-semibold">{dm.configuration}</h2>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {dm.configDesc}
                    </p>
                  </div>
                  <div className="px-4 pt-3 sm:px-5 sm:pt-4">
                    <Tabs
                      value={configTab}
                      onChange={setConfigTab}
                      tabs={[
                        {
                          value: "style",
                          label: dm.tabStyle,
                          icon: <Icon name="brush" size={12} />,
                        },
                        {
                          value: "files",
                          label: dm.tabFiles,
                          icon: <Icon name="files" size={12} />,
                        },
                        {
                          value: "upload",
                          label: dm.tabUpload,
                          icon: <Icon name="cloud" size={12} />,
                        },
                        {
                          value: "advanced",
                          label: dm.tabMore,
                          icon: <Icon name="sliders" size={12} />,
                        },
                      ]}
                    />
                  </div>
                  <div className="p-4 sm:p-5">
                    {configTab === "style" && <StyleTab state={s} set={set} dm={dm} />}
                    {configTab === "files" && <FilesTab state={s} set={set} dm={dm} />}
                    {configTab === "upload" && (
                      <UploadTab state={s} set={set} dm={dm} />
                    )}
                    {configTab === "advanced" && (
                      <AdvancedTab state={s} set={set} dm={dm} />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-4 py-2.5 sm:px-5 sm:py-3 dark:border-slate-800">
                    <span className="hidden text-xs text-slate-500 sm:inline dark:text-slate-400">
                      {dm.pressPrefix}{" "}
                      <kbd className="rounded border border-slate-300 bg-slate-100 px-1 text-[10px] font-mono dark:border-slate-700 dark:bg-slate-800">
                        R
                      </kbd>{" "}
                      {dm.toReset}
                    </span>
                    <span className="text-xs text-slate-500 sm:hidden dark:text-slate-400">
                      {dm.tabToSwitch}
                    </span>
                    <button
                      type="button"
                      onClick={() => setS(defaultState)}
                      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {dm.resetBtn}
                    </button>
                  </div>
                </div>
              </aside>

              {/* ───── Right: preview + code ───── */}
              <section className="flex min-w-0 flex-col gap-4 sm:gap-5">
                {/* Preview card */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-2.5 sm:gap-3 sm:px-5 sm:py-3 dark:border-slate-800">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                        <h2 className="text-sm font-semibold">{dm.livePreview}</h2>
                      </div>
                      <span className="hidden text-slate-300 sm:inline dark:text-slate-700">
                        ·
                      </span>
                      <span className="hidden truncate text-xs text-slate-500 sm:inline dark:text-slate-400">
                        {variantMap[s.variant].category} /{" "}
                        {variantMap[s.variant].name}
                      </span>
                    </div>
                    <ViewportSelector value={viewport} onChange={setViewport} dm={dm} />
                  </div>
                  {/* The radial backdrop wraps an overflow-x-auto container so a
                      variant explicitly wider than the card (e.g. width="480px"
                      on a phone) scrolls horizontally inside the preview rather
                      than pushing the whole page wider. */}
                  <div className="relative bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)]">
                    <div className="rup-scrollbar overflow-x-auto">
                      <div
                        className="mx-auto p-4 transition-[max-width] duration-300 sm:p-6 lg:p-8"
                        style={{ maxWidth: viewportWidths[viewport] }}
                      >
                        <div
                          className={
                            s.variant === "MinimalGlass"
                              ? "rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-4 sm:p-6"
                              : ""
                          }
                        >
                          <Variant
                            key={s.variant + s.locale}
                            {...variantProps}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 border-t border-slate-200 px-4 py-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-2.5 dark:border-slate-800 dark:text-slate-400">
                    <span className="truncate">
                      {s.simulateUploads ? (
                        <>
                          <span className="font-medium text-amber-600 dark:text-amber-400">
                            {dm.mockMode}
                          </span>{" "}
                          · {Math.round(s.failRate * 100)}% {dm.failRateSuffix}
                        </>
                      ) : (
                        <>
                          POST →{" "}
                          <code className="font-mono">{s.endpoint || "/"}</code>
                        </>
                      )}
                    </span>
                    <span className="hidden sm:inline">
                      {dm.dropToTest}
                    </span>
                  </div>
                </div>

                {/* Code card */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2 sm:items-center sm:gap-3">
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold">{dm.getTheCode}</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {dm.getTheCodeDesc}
                      </p>
                    </div>
                    <Tabs
                      value={codeTab}
                      onChange={setCodeTab}
                      tabs={[
                        { value: "component", label: dm.componentTab },
                        { value: "install", label: dm.installTab },
                      ]}
                    />
                  </div>
                  {codeTab === "component" && (
                    <CodeBlock code={code} filename="MyUploader.tsx" dm={dm} />
                  )}
                  {codeTab === "install" && (
                    <CodeBlock code={installSnippet} filename="terminal" dm={dm} />
                  )}
                </div>

                {/* Resources */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5 dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="text-sm font-semibold">{dm.resources}</h3>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <ResourceLink
                      href="#"
                      label={dm.apiReference}
                      desc={dm.apiReferenceDesc}
                    />
                    <ResourceLink
                      href="#"
                      label={dm.cloudAdapters}
                      desc={dm.cloudAdaptersDesc}
                    />
                    <ResourceLink
                      href="#"
                      label={dm.nextjsExample}
                      desc={dm.nextjsExampleDesc}
                    />
                  </div>
                </div>
              </section>
            </div>
          </main>

          <VersionHistory />


          <Footer totalCount={variantKeys.length} dm={dm} />

          <SiteStatsStrip />

          <ValidationErrorsModal
            open={errorModalOpen}
            errors={rejectedErrors}
            onClose={() => setErrorModalOpen(false)}
          />

          <ScrollToTop dm={dm} />
        </div>
      </I18nProvider>
    </ThemeProvider>
  );
}

// ────────── Subcomponents ──────────

function ViewportSelector({
  value,
  onChange,
  dm,
}: {
  value: Viewport;
  onChange: (v: Viewport) => void;
  dm: DemoMessages;
}) {
  const options: { value: Viewport; icon: string; label: string }[] = [
    { value: "mobile", icon: "smartphone", label: dm.mobileLabel },
    { value: "tablet", icon: "tablet", label: dm.tabletLabel },
    { value: "desktop", icon: "monitor", label: dm.desktopLabel },
  ];
  return (
    <div className="inline-flex shrink-0 rounded-lg border border-slate-200 bg-slate-100/70 p-0.5 dark:border-slate-800 dark:bg-slate-900/70">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          title={opt.label}
          aria-label={opt.label}
          aria-pressed={value === opt.value}
          className={`inline-flex h-6 w-7 items-center justify-center rounded-md transition sm:h-7 sm:w-8 ${
            value === opt.value
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Icon name={opt.icon} size={13} />
        </button>
      ))}
    </div>
  );
}

function ResourceLink({
  href,
  label,
  desc,
}: {
  href: string;
  label: string;
  desc: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-lg border border-slate-200 bg-white p-3 transition hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
    >
      <div className="flex items-center justify-between text-sm font-medium text-slate-800 dark:text-slate-100">
        <span>{label}</span>
        <span className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-500">
          →
        </span>
      </div>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        {desc}
      </p>
    </a>
  );
}

// ────────── Tab content ──────────

type SetFn = <K extends keyof PlaygroundState>(
  key: K,
  value: PlaygroundState[K],
) => void;

function StyleTab({
  state: s,
  set,
  dm,
}: {
  state: PlaygroundState;
  set: SetFn;
  dm: DemoMessages;
}) {
  const autoHint = deriveHint(s.accept, s.maxSizeMB);
  return (
    <div className="space-y-5">
      <Field label={dm.variant} hint={dm.variantHint}>
        <Select
          value={s.variant}
          onChange={(e) => set("variant", e.target.value as VariantKey)}
        >
          {Object.entries(
            variantKeys.reduce<Record<string, VariantKey[]>>((acc, key) => {
              const cat = variantMap[key].category;
              if (!acc[cat]) acc[cat] = [];
              acc[cat]!.push(key);
              return acc;
            }, {}),
          ).map(([cat, keys]) => (
            <optgroup key={cat} label={cat}>
              {keys.map((k) => (
                <option key={k} value={k}>
                  {variantMap[k].name}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </Field>

      <Field label={dm.accentColor} hint={dm.accentHint}>
        <div className="flex flex-wrap items-center gap-1.5">
          {accentPresets.map((p) => (
            <button
              key={p.rgb}
              type="button"
              title={p.name}
              aria-label={p.name}
              aria-pressed={s.accentRgb === p.rgb}
              onClick={() => set("accentRgb", p.rgb)}
              className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                s.accentRgb === p.rgb
                  ? "border-slate-900 dark:border-white"
                  : "border-transparent ring-1 ring-slate-200 dark:ring-slate-700"
              }`}
              style={{ backgroundColor: p.hex }}
            />
          ))}
          <label className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-full ring-1 ring-slate-200 dark:ring-slate-700">
            <input
              type="color"
              value={rgbTripletToHex(s.accentRgb)}
              onChange={(e) =>
                set("accentRgb", hexToRgbTriplet(e.target.value))
              }
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label={dm.accentCustomAria}
            />
            <div
              aria-hidden
              className="h-full w-full"
              style={{
                background:
                  "conic-gradient(from 90deg, #f43f5e, #f59e0b, #10b981, #06b6d4, #4f46e5, #9333ea, #f43f5e)",
              }}
            />
          </label>
        </div>
      </Field>

      <div className="grid grid-cols-[1fr_88px] gap-2">
        <Field label={dm.progressStyle}>
          <Select
            value={s.progressVariant}
            onChange={(e) => set("progressVariant", e.target.value as PV)}
          >
            {progressVariants.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label={dm.height}
          hint={s.progressVariant === "circle" ? dm.diameter : dm.barHeight}
        >
          <NumberInput
            value={s.progressSize}
            min={1}
            max={64}
            onChange={(e) => set("progressSize", Number(e.target.value))}
          />
        </Field>
      </div>

      <Field label={dm.labelField} hint={dm.labelHint}>
        <TextInput
          value={s.label}
          onChange={(e) => set("label", e.target.value)}
          placeholder={dm.labelPlaceholder}
        />
      </Field>
      <Field label={dm.hintField} hint={dm.hintFieldHint}>
        <TextInput
          value={s.hint}
          onChange={(e) => set("hint", e.target.value)}
          placeholder={autoHint}
        />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label={dm.widthField} hint={dm.cssEmptyAuto}>
          <TextInput
            value={s.width}
            onChange={(e) => set("width", e.target.value)}
            placeholder="400px"
          />
        </Field>
        <Field label={dm.heightField} hint={dm.cssEmptyAuto}>
          <TextInput
            value={s.height}
            onChange={(e) => set("height", e.target.value)}
            placeholder="320px"
          />
        </Field>
      </div>
      <div className="flex flex-wrap gap-1">
        {[
          { label: dm.presetAuto, w: "", h: "" },
          { label: dm.presetSmall, w: "320px", h: "" },
          { label: dm.presetMedium, w: "480px", h: "" },
          { label: dm.presetLarge, w: "640px", h: "" },
          { label: dm.presetFull, w: "100%", h: "" },
        ].map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              set("width", preset.w);
              set("height", preset.h);
            }}
            className={`rounded-full border px-2.5 py-0.5 text-xs transition ${
              s.width === preset.w && s.height === preset.h
                ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FilesTab({
  state: s,
  set,
  dm,
}: {
  state: PlaygroundState;
  set: SetFn;
  dm: DemoMessages;
}) {
  const acceptPresets = buildAcceptPresets(dm);
  const presetValues = new Set(acceptPresets.map((p) => p.value));
  const isCustom = !presetValues.has(s.accept);

  return (
    <div className="space-y-5">
      <Field label={dm.accept} hint={dm.acceptHint}>
        <div className="flex flex-col gap-2">
          <Select
            value={isCustom ? ACCEPT_CUSTOM : s.accept}
            onChange={(e) => {
              const v = e.target.value;
              if (v === ACCEPT_CUSTOM) {
                if (!isCustom) set("accept", ".svg,.webp");
              } else {
                set("accept", v);
              }
            }}
          >
            {acceptPresets.map((p) => (
              <option key={p.label} value={p.value}>
                {p.label}
              </option>
            ))}
            <option value={ACCEPT_CUSTOM}>{dm.acceptCustom}</option>
          </Select>
          {isCustom && (
            <TextInput
              value={s.accept}
              onChange={(e) => set("accept", e.target.value)}
              placeholder=".svg,.webp,image/heic"
              autoFocus
            />
          )}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label={dm.maxSize}>
          <NumberInput
            value={s.maxSizeMB}
            min={0}
            onChange={(e) => set("maxSizeMB", Number(e.target.value))}
          />
        </Field>
        <Field label={dm.maxFiles}>
          <NumberInput
            value={s.maxFiles}
            min={0}
            onChange={(e) => set("maxFiles", Number(e.target.value))}
          />
        </Field>
      </div>

      <div className="space-y-2 pt-1">
        <Toggle
          label={dm.multipleFiles}
          checked={s.multiple}
          onChange={(v) => set("multiple", v)}
        />
        <Toggle
          label={dm.folderUpload}
          checked={s.directory}
          onChange={(v) => set("directory", v)}
        />
        <Toggle
          label={dm.clipboardPaste}
          description={dm.clipboardDesc}
          checked={s.clipboard}
          onChange={(v) => set("clipboard", v)}
        />
        <Toggle
          label={dm.rejectDuplicates}
          description={dm.rejectDuplicatesDesc}
          checked={s.rejectDuplicates}
          onChange={(v) => set("rejectDuplicates", v)}
        />
        <Toggle
          label={dm.disabled}
          checked={s.disabled}
          onChange={(v) => set("disabled", v)}
        />
      </div>
    </div>
  );
}

function UploadTab({
  state: s,
  set,
  dm,
}: {
  state: PlaygroundState;
  set: SetFn;
  dm: DemoMessages;
}) {
  return (
    <div className="space-y-5">
      <Toggle
        label={dm.simulateUploads}
        description={dm.simulateUploadsDesc}
        checked={s.simulateUploads}
        onChange={(v) => set("simulateUploads", v)}
      />
      {s.simulateUploads ? (
        <Field
          label={`${dm.randomFailRate} · ${Math.round(s.failRate * 100)}%`}
          hint={dm.randomFailRateHint}
        >
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={s.failRate}
            onChange={(e) => set("failRate", Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </Field>
      ) : (
        <Field label={dm.endpoint} hint={dm.endpointHint}>
          <TextInput
            value={s.endpoint}
            onChange={(e) => set("endpoint", e.target.value)}
            placeholder="/api/upload"
          />
        </Field>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Field label={dm.mode}>
          <Select
            value={s.mode}
            onChange={(e) =>
              set("mode", e.target.value as PlaygroundState["mode"])
            }
          >
            <option value="manual">{dm.modeManual}</option>
            <option value="instant">{dm.modeInstant}</option>
            <option value="auto">{dm.modeAuto}</option>
            <option value="queue">{dm.modeQueue}</option>
          </Select>
        </Field>
        <Field label={dm.strategy}>
          <Select
            value={s.strategy}
            onChange={(e) =>
              set("strategy", e.target.value as PlaygroundState["strategy"])
            }
          >
            <option value="parallel">{dm.strategyParallel}</option>
            <option value="sequential">{dm.strategySequential}</option>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Field label={dm.concurrency}>
          <NumberInput
            value={s.concurrency}
            min={1}
            max={10}
            onChange={(e) => set("concurrency", Number(e.target.value))}
          />
        </Field>
        <Field label={dm.retries}>
          <NumberInput
            value={s.retries}
            min={0}
            max={10}
            onChange={(e) => set("retries", Number(e.target.value))}
          />
        </Field>
        <Field label={dm.chunkMb} hint={dm.zeroOff}>
          <NumberInput
            value={s.chunkSizeMB}
            min={0}
            onChange={(e) => set("chunkSizeMB", Number(e.target.value))}
          />
        </Field>
      </div>
    </div>
  );
}

function AdvancedTab({
  state: s,
  set,
  dm,
}: {
  state: PlaygroundState;
  set: SetFn;
  dm: DemoMessages;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Toggle
          label={dm.fullscreenPreview}
          description={dm.fullscreenPreviewDesc}
          checked={s.previewable}
          onChange={(v) => set("previewable", v)}
        />
        <Toggle
          label={dm.editMetadata}
          description={dm.editMetadataDesc}
          checked={s.editable}
          onChange={(v) => set("editable", v)}
        />
        <Toggle
          label={dm.showRejectionErrors}
          description={dm.showRejectionErrorsDesc}
          checked={s.showErrorModal}
          onChange={(v) => set("showErrorModal", v)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label={dm.scrollAfter} hint={dm.zeroOff}>
          <NumberInput
            value={s.scrollAfter}
            min={0}
            max={50}
            onChange={(e) => set("scrollAfter", Number(e.target.value))}
          />
        </Field>
        <Field label={dm.maxHeight} hint={dm.cssValue}>
          <TextInput
            value={s.maxHeight}
            onChange={(e) => set("maxHeight", e.target.value)}
            placeholder="280px"
          />
        </Field>
      </div>
    </div>
  );
}

// ────────── Social icons ──────────

interface SocialLink {
  key: string;
  label: string;
  href: string;
  brand: string; // brand color used on hover (light theme / default)
  brandDark?: string; // optional override for dark theme (use when `brand` has poor contrast on dark bg)
  icon: ReactNode;
}

const socialLinks: SocialLink[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    href: import.meta.env.VITE_SOCIAL_WHATSAPP || "",
    brand: "#25D366",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    href: import.meta.env.VITE_SOCIAL_INSTAGRAM || "",
    brand: "#E4405F",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.058 1.646-.07 4.85-.07M12 0C8.741 0 8.332.014 7.052.072 5.197.157 3.355.673 2.014 2.014.673 3.355.157 5.197.072 7.052.014 8.332 0 8.741 0 12s.014 3.668.072 4.948c.085 1.855.601 3.697 1.942 5.038 1.341 1.341 3.183 1.857 5.038 1.942C8.332 23.986 8.741 24 12 24s3.668-.014 4.948-.072c1.855-.085 3.697-.601 5.038-1.942 1.341-1.341 1.857-3.183 1.942-5.038.058-1.28.072-1.689.072-4.948s-.014-3.668-.072-4.948c-.085-1.855-.601-3.697-1.942-5.038C20.645.673 18.803.157 16.948.072 15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324ZM12 16a4 4 0 110-8 4 4 0 010 8Zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881Z" />
      </svg>
    ),
  },
  {
    key: "facebook",
    label: "Facebook",
    href: import.meta.env.VITE_SOCIAL_FACEBOOK || "",
    brand: "#1877F2",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.019 4.388 11.005 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.017 1.792-4.687 4.533-4.687 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.255h3.328l-.532 3.49h-2.796V24C19.612 23.078 24 18.092 24 12.073Z" />
      </svg>
    ),
  },
  {
    key: "youtube",
    label: "YouTube",
    href: import.meta.env.VITE_SOCIAL_YOUTUBE || "",
    brand: "#FF0000",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
      </svg>
    ),
  },
  {
    key: "twitter",
    label: "X (Twitter)",
    href: import.meta.env.VITE_SOCIAL_TWITTER || "",
    brand: "#0F1419",
    brandDark: "#E7E9EA",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
      </svg>
    ),
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    href: import.meta.env.VITE_SOCIAL_LINKEDIN || "",
    brand: "#0A66C2",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
      </svg>
    ),
  },
  {
    key: "github",
    label: "GitHub",
    href: import.meta.env.VITE_SOCIAL_GITHUB || "",
    brand: "#24292F",
    brandDark: "#F0F6FC",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.52 11.52 0 013-.405c1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12Z" />
      </svg>
    ),
  },
];

function SocialIcons({ dm }: { dm: DemoMessages }) {
  // Show every icon, even when its env var is unset. Icons without a link
  // get a subtle amber dot + open a friendly "coming soon" modal on click
  // rather than disappearing — keeps the row's layout consistent and lets
  // the user see what platforms are planned.
  const [unavailable, setUnavailable] = useState<SocialLink | null>(null);

  const base =
    'group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400';

  return (
    <>
      <div className="flex items-center flex-wrap sm:gap-2 gap-3">
        {socialLinks.map((s) => {
          const hasLink = !!s.href;
          const brandStyle = {
            ['--brand']: s.brand,
            ['--brand-dark']: s.brandDark ?? s.brand,
          } as React.CSSProperties;

          if (hasLink) {
            return (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={s.label}
                title={s.label}
                style={brandStyle}
                className={`${base} hover:border-[var(--brand)] hover:text-[var(--brand)] dark:hover:border-[var(--brand-dark)] dark:hover:text-[var(--brand-dark)]`}
              >
                {s.icon}
              </a>
            );
          }

          // Unset link — render as a button + amber indicator + open modal.
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setUnavailable(s)}
              aria-label={`${s.label} ${dm.linkNotAvailable}`}
              title={`${s.label} — ${dm.comingSoonChip}`}
              style={brandStyle}
              className={`${base} opacity-70 hover:border-amber-400/60 hover:text-amber-600 hover:opacity-100 dark:hover:border-amber-500/60 dark:hover:text-amber-400`}
            >
              {s.icon}
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900"
              />
            </button>
          );
        })}
      </div>

      <UnavailableLinkModal social={unavailable} onClose={() => setUnavailable(null)} dm={dm} />
    </>
  );
}

// ────────── Unavailable link modal ──────────

/**
 * Branded "link coming soon" modal that opens when the user clicks a social
 * icon whose env var hasn't been configured. The icon badge, gradient strip
 * and shadow all pick up the platform's own brand color so it stays on-brand.
 */
function UnavailableLinkModal({
  social,
  onClose,
  dm,
}: {
  social: SocialLink | null;
  onClose: () => void;
  dm: DemoMessages;
}) {
  useEffect(() => {
    if (!social) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [social, onClose]);

  if (!social) return null;

  // `${hex}66` / `${hex}44` is a quick way to apply 40% / 27% alpha to a
  // 6-char hex brand color without reaching for color-mix().
  const brand = social.brand;
  const brandShadow = `0 12px 28px ${brand}66, 0 4px 8px ${brand}44`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rup-unavailable-title"
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white text-center shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        {/* Brand-color gradient strip */}
        <div
          aria-hidden
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${brand}, ${brand}80, ${brand})`,
          }}
        />

        <button
          type="button"
          onClick={onClose}
          aria-label={dm.close}
          className="absolute right-3 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="px-7 pb-7 pt-9">
          {/* Brand-colored icon badge */}
          <div
            className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl text-white [&>svg]:h-7 [&>svg]:w-7"
            style={{ backgroundColor: brand, boxShadow: brandShadow }}
          >
            {social.icon}
          </div>

          <h3
            id="rup-unavailable-title"
            className="mt-5 text-base font-bold tracking-tight text-slate-900 dark:text-slate-100"
          >
            {social.label} {dm.comingSoonModal}
          </h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
            {dm.modalIntro}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              VITE_SOCIAL_{social.key.toUpperCase()}
            </code>
            {dm.modalSetVarMiddle}
            <code className="font-mono text-[11px]">.env</code>
            {dm.modalSetVarEnd}
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {dm.close}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-rup-accent px-4 text-sm font-semibold text-rup-accent-fg shadow-sm transition hover:opacity-95"
            >
              {dm.gotIt}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────── Scroll to top ──────────

/**
 * Floating bottom-right button that smooth-scrolls to the page top.
 * Appears after the user scrolls past ~400px, slides in from below.
 */
function ScrollToTop({ dm }: { dm: DemoMessages }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={dm.scrollToTop}
      title={dm.scrollToTop}
      className={`fixed bottom-5 right-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full bg-rup-accent text-rup-accent-fg shadow-lg shadow-black/20 ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95 sm:bottom-6 sm:right-6 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}

// ────────── Version history ──────────

/**
 * Mirror of CHANGELOG.md, surfaced in the demo so visitors can review the
 * release timeline without leaving the playground. Keep this list in sync
 * whenever a new release lands.
 */
interface ReleaseEntry {
  version: string;
  date: string;
  tag?: "latest" | "patch" | "minor" | "major";
  summary: string;
  changes: { label: string; items: string[] }[];
}

const releases: ReleaseEntry[] = [
  {
    version: "0.1.1",
    date: "2026-06-05",
    tag: "latest",
    summary:
      "Self-contained bundled stylesheet — no Tailwind required in consumer apps.",
    changes: [
      {
        label: "Fixed",
        items: [
          "`dist/styles.css` now ships every utility class the components use, so importing it once gives the demo look in any project (Vite, Next.js, CRA, Remix, Astro…).",
          "Disabled Tailwind's preflight reset in the bundled stylesheet — the package no longer overrides your box-sizing, margin, or heading styles.",
        ],
      },
      {
        label: "Internal",
        items: [
          "New `tailwind.lib.config.cjs` + `src/theme/lib.css` drive the bundled CSS build.",
          "`tsup.config.ts` runs Tailwind CLI in its `onSuccess` hook instead of copying the bare variable file.",
        ],
      },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-06-01",
    summary: "Initial public release.",
    changes: [
      {
        label: "Components",
        items: [
          "`Dropzone`, `UploadArea`, `UploadButton`, `UploadGallery`, `UploadProgress`, `UploadPreview`, `UploadModal`, `FilePreviewModal`, `FileEditModal`, `ValidationErrorsModal`.",
        ],
      },
      {
        label: "Hooks",
        items: [
          "`useDropzone`, `useUploader`, `useUploadQueue`, `useUploadProgress`, `useFilePreview`.",
        ],
      },
      {
        label: "Upload engine",
        items: [
          "Four modes: `manual`, `instant`, `auto`, `queue`.",
          "Parallel + sequential strategies with configurable concurrency.",
          "Chunked uploads with pause / resume / retry / cancel + exponential-backoff retries.",
          "EWMA-based speed and ETA tracking.",
        ],
      },
      {
        label: "Validation",
        items: [
          "MIME globs, extension lists, magic-number signature detection.",
          "Min / max size, max file count, duplicate detection.",
          "Custom sync + async validators and a virus-scan hook.",
        ],
      },
      {
        label: "Cloud adapters",
        items: [
          "AWS S3, Cloudinary, Firebase Storage, Supabase Storage, DigitalOcean Spaces, Azure Blob, Google Cloud Storage.",
        ],
      },
      {
        label: "UI variants (20+)",
        items: [
          "Minimal, Business, Creative, Enterprise, and Layouts categories — every option works on every variant.",
        ],
      },
      {
        label: "Internationalization",
        items: [
          "23 built-in locales with RTL-aware rendering for Arabic, Urdu, Hebrew, Farsi.",
        ],
      },
      {
        label: "Theming + a11y",
        items: [
          "Light / dark / auto via `ThemeProvider`; CSS variables for every design token.",
          "ARIA roles, full keyboard navigation, visible focus rings tied to the accent color.",
        ],
      },
      {
        label: "Developer experience",
        items: [
          "TypeScript-first with ESM + CJS dual emit.",
          "Tree-shakable — `framer-motion` and cloud SDKs only load when used.",
          "SSR-safe with a `\"use client\"` banner for Next.js App Router.",
        ],
      },
    ],
  },
];

const tagStyles: Record<NonNullable<ReleaseEntry["tag"]>, string> = {
  latest:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  patch:
    "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  minor:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  major:
    "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

function VersionHistory() {
  // First entry is always the newest; default it open and collapse the rest.
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set([releases[0]?.version].filter(Boolean) as string[]),
  );

  const toggle = (version: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(version)) next.delete(version);
      else next.add(version);
      return next;
    });

  return (
    <section className="px-4 pb-4 pt-8 sm:px-6 sm:pt-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold sm:text-lg">
                Version history
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                Release notes mirrored from{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] dark:bg-slate-800">
                  CHANGELOG.md
                </code>
                . Click a version to expand.
              </p>
            </div>
            {/* <a
              href="https://github.com/react-upload-pro/react-upload-pro/blob/main/CHANGELOG.md"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs font-medium text-rup-accent hover:underline sm:text-sm"
            >
              Full changelog on GitHub →
            </a> */}
          </div>

          <ol className="relative space-y-3 border-l border-slate-200 pl-5 dark:border-slate-800 max-h-[500px] overflow-auto">
            {releases.map((release) => {
              const isOpen = expanded.has(release.version);
              return (
                <li key={release.version} className="relative">
                  {/* Timeline dot */}
                  <span
                    aria-hidden
                    className={`absolute -left-[26px] top-3 h-3 w-3 rounded-full border-2 ${
                      release.tag === "latest"
                        ? "border-emerald-400 bg-emerald-500"
                        : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => toggle(release.version)}
                    aria-expanded={isOpen}
                    className="flex w-full flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-left transition hover:border-rup-accent/40 hover:bg-rup-accent/5 dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                        V{release.version}
                      </span>
                      {release.tag && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tagStyles[release.tag]}`}
                        >
                          {release.tag}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {release.date}
                      </span>
                    </div>
                    <span
                      aria-hidden
                      className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    >
                      ▾
                    </span>
                  </button>

                  {isOpen && (
                    <div className="mt-2 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
                      <p className="mb-3 text-sm text-slate-700 dark:text-slate-200">
                        {release.summary}
                      </p>
                      <div className="space-y-3">
                        {release.changes.map((group) => (
                          <div key={group.label}>
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-rup-accent">
                              {group.label}
                            </h4>
                            <ul className="mt-1.5 space-y-1 pl-4 text-xs text-slate-600 sm:text-[13px] dark:text-slate-300">
                              {group.items.map((item, i) => (
                                <li
                                  key={i}
                                  className="list-disc marker:text-slate-400"
                                  dangerouslySetInnerHTML={{
                                    __html: item.replace(
                                      /`([^`]+)`/g,
                                      '<code class="rounded bg-slate-100 px-1 py-0.5 text-[11px] dark:bg-slate-800">$1</code>',
                                    ),
                                  }}
                                />
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

// ────────── Footer ──────────

function Footer({ totalCount, dm }: { totalCount: number; dm: DemoMessages }) {
  return (
    <footer className="pb-6 pt-12 px-4 sm:pt-16 sm:px-6">
      <div className="mx-auto max-w-[1400px]">
        {/* Gradient outline wrapper */}
        <div className="rounded-[18px] bg-gradient-to-br from-purple-500/50 via-pink-400/30 to-sky-500/50 p-[1.5px]">
          <div className="rounded-[16.5px] bg-white p-4 sm:p-5 dark:bg-slate-950">
            {/* Top row: brand + action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6">
              <div className="flex min-w-0 items-center gap-3">
                {/* Mini logo: 3 colored dots inside a gradient pill */}
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center gap-1 rounded-xl bg-gradient-to-br from-purple-500/25 to-sky-500/25 sm:h-11 sm:w-11">
                  {(["#a855f7", "#ec4899", "#38bdf8"] as const).map((c) => (
                    <span
                      key={c}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: c, boxShadow: `0 0 8px ${c}` }}
                    />
                  ))}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold tracking-tight sm:text-base">
                    react-upload-pro
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500 sm:text-[13px] dark:text-slate-400">
                    {dm.footerTagline}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <FooterAction
                  href="https://github.com/react-upload-pro/react-upload-pro"
                  external
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.03 0 0 .96-.31 3.16 1.18.92-.26 1.9-.39 2.88-.39s1.96.13 2.88.39c2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.74.11 3.03.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.37-5.25 5.65.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
                  </svg>
                  GitHub
                </FooterAction>
                <FooterAction
                  href="https://npmjs.com/package/react-upload-pro"
                  external
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 780 250"
                    fill="currentColor"
                  >
                    <path d="M240,250h100v-50h100V0H240V250z M340,50h50v100h-50V50z M480,0v200h100V50h50v150h50V50h50v150h50V0H480z M0,200h100V50h50v150h50V0H0V200z" />
                  </svg>
                  npm
                </FooterAction>
                <FooterAction
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                  {dm.scrollToTop}
                </FooterAction>
              </div>
            </div>

            {/* Divider */}
            <div className="my-5 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent sm:my-6 dark:via-slate-700" />

            {/* Connect row */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 sm:text-[13px] dark:text-slate-400">
                <span className="bg-gradient-to-br from-purple-500 to-sky-500 bg-clip-text text-transparent">
                  {dm.connectWith}
                </span>
                <span className="opacity-40">—</span>
                <span className="font-normal">
                  {dm.followUpdates}
                </span>
              </div>
              <SocialIcons dm={dm} />
            </div>

            {/* Divider */}
            <div className="mb-5 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent sm:mb-6 dark:via-slate-700" />

            {/* Bottom row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-[13px] dark:text-slate-400">
                  <span className="rounded bg-rup-accent/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-rup-accent sm:text-[11px]">
                    MIT
                  </span>
                  <span className="opacity-50">·</span>
                  <span>© {new Date().getFullYear()} react-upload-pro</span>
                  <span className="opacity-50">·</span>
                  <span>
                    <strong>{totalCount}</strong> {dm.variantsLabel}
                  </span>
                </div>
                <div className="mt-1.5 text-xs text-slate-500 sm:text-[13px] dark:text-slate-400">
                  {dm.craftedPrefix}<span className="text-pink-500">♥</span>{dm.craftedSuffix}
                </div>
              </div>

              <a
                href="https://github.com/yogeshgabani"
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:border-rup-accent/40 hover:shadow-sm sm:text-[13px] dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="text-slate-500 dark:text-slate-400">
                  {dm.builtBy}
                </span>
                <span className="bg-gradient-to-br from-purple-500 to-sky-500 bg-clip-text font-bold text-transparent">
                  Yogesh Gabani
                </span>
                <span className="text-xs text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-rup-accent">
                  ↗
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Small pill button shared between the footer's action row entries. */
function FooterAction({
  href,
  external,
  onClick,
  children,
}: {
  href?: string;
  external?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const cls =
    "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:border-rup-accent/40 hover:text-rup-accent sm:px-4 sm:py-2 sm:text-[13px] dark:border-slate-800 dark:bg-slate-900";
  if (href) {
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
        className={cls}
      >
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}


// ────────── Site stats strip ──────────

// Public counter service. Free, no auth, rate-limited per IP.
// Swap the namespace if you fork the demo — keys must be unique per project.
const STATS_NAMESPACE = "react-upload-pro";
const STATS_HITS_KEY = "playground-hits";
const STATS_VISITORS_KEY = "playground-visitors";
const STATS_VISITOR_FLAG = "rup-visited";
const SITE_LAST_UPDATED = "2026-06-05";

function formatStat(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 10_000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString("en-US");
}

// Animate a number from 0 → target over ~1.5s with ease-out cubic.
function useCountUp(target: number, durationMs = 1500): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target || target <= 0) {
      setValue(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

/**
 * Theme-aware live counters strip. Reads `--rup-accent` for accent color so
 * it automatically follows the playground's accent picker, and uses
 * `dark:` Tailwind variants so it switches with the light/dark theme.
 */
function SiteStatsStrip() {
  const [hits, setHits] = useState(0);
  const [visitors, setVisitors] = useState(0);
  const hitsAnim = useCountUp(hits);
  const visitorsAnim = useCountUp(visitors);

  // Fetch counters on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const base = "https://abacus.jasoncameron.dev";

    // Total hits — increment on every page load
    fetch(`${base}/hit/${STATS_NAMESPACE}/${STATS_HITS_KEY}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setHits(Number(d?.value) || 0))
      .catch(() => {});

    // Total visitors — increment only for new visitors (localStorage flag)
    const isNew = !localStorage.getItem(STATS_VISITOR_FLAG);
    const visitorUrl = isNew
      ? `${base}/hit/${STATS_NAMESPACE}/${STATS_VISITORS_KEY}`
      : `${base}/get/${STATS_NAMESPACE}/${STATS_VISITORS_KEY}`;
    fetch(visitorUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setVisitors(Number(d?.value) || 0);
        if (isNew) {
          try {
            localStorage.setItem(STATS_VISITOR_FLAG, String(Date.now()));
          } catch {
            /* private mode etc. — ignore */
          }
        }
      })
      .catch(() => {});
  }, []);

  const stats: {
    label: string;
    value: string;
    icon: ReactNode;
    highlight?: boolean;
    live?: boolean;
  }[] = [
    {
      label: "Last Updated",
      value: SITE_LAST_UPDATED,
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
    },
    {
      label: "Total Hits",
      value: hits > 0 ? formatStat(hitsAnim) : "—",
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      label: "Total Visitors",
      value: visitors > 0 ? formatStat(visitorsAnim) : "—",
      highlight: true,
      live: true,
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
  ];

  return (
    <section
      role="group"
      aria-label="Site stats"
      className="px-4 pb-4 pt-2 sm:px-6"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* Accent-tinted gradient border — uses the live `--rup-accent` so the
            strip stays in visual lock-step with the accent picker. */}
        <div
          className="rounded-2xl p-[1.5px]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgb(var(--rup-accent) / 0.55), rgb(168 85 247 / 0.45), rgb(var(--rup-accent) / 0.55))",
          }}
        >
          <div className="grid gap-3 rounded-[15px] bg-white p-3 sm:grid-cols-3 sm:p-4 dark:bg-slate-950">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition sm:px-4 ${
                  stat.highlight
                    ? "border-rup-accent/30 bg-rup-accent/5 dark:border-rup-accent/40 dark:bg-rup-accent/10"
                    : "border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    stat.highlight
                      ? "bg-rup-accent text-rup-accent-fg shadow-md shadow-rup-accent/20"
                      : "bg-rup-accent/10 text-rup-accent"
                  }`}
                  aria-hidden="true"
                >
                  {stat.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span className="truncate">{stat.label}</span>
                    {stat.live && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/70" />
                          <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </span>
                        LIVE
                      </span>
                    )}
                  </div>
                  <div
                    className={`mt-0.5 truncate text-lg font-bold tabular-nums sm:text-xl ${
                      stat.highlight
                        ? "text-rup-accent"
                        : "text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
