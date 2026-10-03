import {
  Bell,
  BookOpen,
  ChevronDown,
  FolderOpen,
  LogOut,
  Menu,
  Star,
  UserRound,
  X,
} from "lucide-react";

import { getStoredUser, logout } from "../utils/auth";

import { useState } from "react";

const WORLDS = {
  USER: {
    role: "Operator",
    world: "The Operator's Chronicle",
    Icon: BookOpen,
    accent: "#7b2d2d",
    gold: "#a8832f",
    tone: "#f0e2c4",
    mark: "✦",
  },
  REVIEWER: {
    role: "Reviewer",
    world: "The Reviewer's Observatory",
    Icon: Star,
    accent: "#2f3a6b",
    gold: "#8f7a3a",
    tone: "#ebe5d3",
    mark: "☆",
  },
  ADMIN: {
    role: "Administrator",
    world: "The Case Archive",
    Icon: FolderOpen,
    accent: "#6b2a2a",
    gold: "#8a7554",
    tone: "#f0e4ca",
    mark: "§",
  },
};

function Navbar() {
  const user = getStoredUser();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const w = WORLDS[user?.role] || WORLDS.USER;
  const Icon = w.Icon;

  const goTo = (path) => {
    window.location.href = path;
  };

  const dashboardPath = "/";

  const serif = { fontFamily: 'Georgia, "Times New Roman", serif' };
  const mono = { fontFamily: '"Courier New", monospace' };

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: w.tone,
        borderBottom: `1px solid ${w.gold}`,
        boxShadow: `0 1px 0 ${w.tone}, 0 3px 0 ${w.gold}55, 0 6px 14px rgba(40,26,16,.18)`,
        color: "#2b211a",
        transition: "background .4s ease",
        ...serif,
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand — the index emblem */}
        <button
          type="button"
          onClick={() => goTo(dashboardPath)}
          className="group flex min-w-0 items-center gap-3"
        >
          <div
            className="relative flex h-10 w-9 items-center justify-center transition-transform duration-300 group-hover:translate-y-0.5"
            style={{
              background: w.accent,
              color: "#f6ecd4",
              borderRadius: "2px 2px 0 0",
              clipPath: "polygon(0 0,100% 0,100% 100%,50% 82%,0 100%)",
              transition: "background .4s ease",
            }}
          >
            <Icon size={16} strokeWidth={1.7} style={{ marginTop: -4 }} />
          </div>

          <div className="min-w-0 text-left">
            <div
              className="truncate text-[17px] font-bold leading-none"
              style={{ letterSpacing: ".04em" }}
            >
              IntelliFlow
            </div>
            <div
              className="mt-1 hidden truncate text-[9px] uppercase sm:block"
              style={{ ...mono, letterSpacing: ".22em", color: w.accent }}
            >
              The Index
            </div>
          </div>
        </button>

        {/* Center — current world tab */}
        <nav className="hidden flex-1 items-center justify-center md:flex">
          <button
            type="button"
            onClick={() => goTo(dashboardPath)}
            className="group relative px-3 py-2 text-[14px] italic"
            style={{ color: "#3b2d22" }}
          >
            <span className="mr-2 not-italic" style={{ color: w.gold }}>
              {w.mark}
            </span>
            {w.world}
            <span
              className="absolute bottom-0.5 left-3 right-3 h-[2px] origin-left scale-x-100 transition-transform duration-500 group-hover:scale-x-100"
              style={{ background: w.accent, opacity: 0.85 }}
            />
          </button>
        </nav>

        {/* Right controls */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="relative hidden h-9 w-9 items-center justify-center transition-opacity duration-200 hover:opacity-70 sm:flex"
            style={{ border: `1px solid ${w.gold}`, color: "#4a3b2c", background: "#faf3e1" }}
          >
            <Bell size={15} />
            <span
              className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
              style={{ background: w.accent }}
            />
          </button>

          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 px-2.5 py-1.5 transition-opacity duration-200 hover:opacity-80"
              style={{ border: `1px solid ${w.gold}`, background: "#faf3e1" }}
            >
              <div
                className="flex h-7 w-7 items-center justify-center"
                style={{ background: w.accent, color: "#f6ecd4" }}
              >
                <UserRound size={14} />
              </div>

              <div className="hidden text-left lg:block">
                <div className="max-w-[140px] truncate text-[12px] font-semibold">
                  {user?.name || "Operator"}
                </div>
                <div
                  className="text-[8px] uppercase"
                  style={{ ...mono, letterSpacing: ".16em", color: w.accent }}
                >
                  {w.role}
                </div>
              </div>

              <ChevronDown
                size={13}
                style={{ color: "#6b5a46" }}
                className={`transition-transform ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 top-12 w-64 p-2"
                style={{
                  background: "#faf3e1",
                  border: `1px solid ${w.gold}`,
                  boxShadow: "0 10px 20px rgba(40,26,16,.3)",
                }}
              >
                <div className="px-3 py-3" style={{ borderBottom: "2px double #b9a37a" }}>
                  <div className="text-[13px] font-semibold">
                    {user?.name || "Operator"}
                  </div>
                  <div
                    className="mt-1 break-all text-[11px]"
                    style={{ ...mono, color: "#6b5a46" }}
                  >
                    {user?.email || ""}
                  </div>
                </div>

                <div className="mt-1 px-1">
                  <div
                    className="flex items-center gap-2 px-2 py-2 text-[10px] uppercase"
                    style={{ ...mono, letterSpacing: ".12em", color: w.accent }}
                  >
                    <Icon size={13} />
                    {w.role}
                  </div>

                  <button
                    type="button"
                    onClick={logout}
                    className="mt-1 flex w-full items-center gap-2 px-2 py-2 text-left text-[13px] transition-opacity hover:opacity-70"
                    style={{ color: "#7b2d2d" }}
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center sm:hidden"
            style={{ border: `1px solid ${w.gold}`, background: "#faf3e1", color: "#4a3b2c" }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="px-4 py-4 sm:hidden"
          style={{ borderTop: `1px solid ${w.gold}`, background: "#f6ecd4" }}
        >
          <button
            type="button"
            onClick={() => goTo(dashboardPath)}
            className="mb-4 flex w-full items-center gap-2 text-left text-[15px] italic"
          >
            <span style={{ color: w.gold }}>{w.mark}</span>
            {w.world}
          </button>

          <div className="pt-3" style={{ borderTop: "2px double #b9a37a" }}>
            <div className="mb-3 flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center"
                style={{ background: w.accent, color: "#f6ecd4" }}
              >
                <UserRound size={15} />
              </div>

              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold">
                  {user?.name || "Operator"}
                </div>
                <div
                  className="mt-0.5 text-[9px] uppercase"
                  style={{ ...mono, letterSpacing: ".16em", color: w.accent }}
                >
                  {w.role}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px]"
              style={{ border: "1px dashed #7b2d2d", color: "#7b2d2d", background: "#faf3e1" }}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;