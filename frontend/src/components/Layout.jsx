import { Truck } from "lucide-react";

const TABS = [
  { id: "matches", label: "Matches" },
  { id: "post-leg", label: "For Carriers" },
  { id: "post-load", label: "For Shippers" },
];

export default function Layout({ active, onChange, children }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Truck size={18} />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900">RouteShare</h1>
              <p className="text-xs text-slate-500">Empty miles, matched with real loads</p>
            </div>
          </div>
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  active === tab.id
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
