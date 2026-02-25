"use client";

import { useRef } from "react";
import { ArrowLeft, Pencil, Gift, Sun, LogOut } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useAuth } from "@/hooks/use-auth";

interface LogoMenuProps {
  open: boolean;
  onClose: () => void;
}

export const LogoMenu = ({ open, onClose }: LogoMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, onClose, open);
  const { user, signOut } = useAuth();

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      className="absolute left-4 top-[74px] z-50 flex w-[307px] flex-col items-start gap-1 rounded-2xl bg-popover py-1"
      style={{ boxShadow: "0px 1px 13.8px 1px rgba(18, 18, 18, 0.1)" }}
    >
      {/* Section 1: Go back + Rename */}
      <div className="flex w-full flex-col items-start px-1 gap-1">
        <div className="w-full rounded-xl p-1">
          <MenuButton icon={<ArrowLeft className="h-4 w-4 text-[#09090B]" />} label="Go back to dashboard" onClick={onClose} />
          <MenuButton icon={<Pencil className="h-4 w-4 text-[#28303F]" />} label="Rename file" highlighted />
        </div>
      </div>

      <MenuDivider />

      {/* Section 2: User info */}
      <div className="flex w-full flex-col items-start px-1">
        <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#F8F8F5] transition-colors">
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-sm font-semibold tracking-[-0.01em] text-[#1C1C1C]">{user?.name || "User"}</span>
            <span className="text-xs tracking-[-0.01em] text-[#8B8B8B]">{user?.email || ""}</span>
          </div>
        </button>
      </div>

      {/* Section 3: Credits box */}
      <div className="flex w-full flex-col items-start">
        <div className="w-full px-2.5">
          <div className="flex w-full flex-col gap-2 rounded-lg bg-[#F8F8F5] p-2">
            <div className="flex w-full items-start gap-2">
              <div className="flex flex-1 flex-col items-start gap-0.5">
                <span className="text-xs text-[#8B8B8B]">Credits</span>
                <span className="text-sm font-medium text-[#09090B]">20 left</span>
              </div>
              <div className="flex flex-1 flex-col items-end gap-0.5">
                <span className="text-xs text-[#8B8B8B]">Renews in</span>
                <span className="text-sm font-medium text-[#09090B]">6h 24m</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-2 w-full rounded-full bg-[#E8E5DF]">
                <div className="h-2 rounded-full bg-primary" style={{ width: "62.4%" }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs tracking-[-0.01em] text-[#5F5F5D]">5 of 25 used today</span>
                <span className="text-xs text-primary">+25 tomorrow</span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-2.5 w-full mt-1">
          <div className="h-px w-full bg-[#E8E5DF]" />
        </div>
      </div>

      {/* Section 4: Win free credits + Theme */}
      <div className="flex w-full flex-col items-start px-1">
        <div className="w-full rounded-xl p-1">
          <MenuButton icon={<Gift className="h-4 w-4 text-[#28303F]" />} label="Win free credits" />
          <MenuButton icon={<Sun className="h-4 w-4 text-[#28303F]" />} label="Theme Style" />
        </div>
      </div>

      <MenuDivider />

      {/* Section 5: Log out */}
      <div className="flex w-full flex-col items-start px-1">
        <div className="w-full rounded-xl p-1">
          <MenuButton icon={<LogOut className="h-4 w-4 text-[#28303F]" />} label="Log out" onClick={signOut} />
        </div>
      </div>
    </div>
  );
};

function MenuButton({ icon, label, onClick, highlighted }: { icon: React.ReactNode; label: string; onClick?: () => void; highlighted?: boolean }) {
  return (
    <button
      className={`flex w-[287px] items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors ${highlighted ? "bg-[#F8F8F5] hover:bg-[#F0F0EB]" : "hover:bg-[#F8F8F5]"}`}
      onClick={onClick}
    >
      <div className={`flex h-7 w-7 items-center justify-center rounded-md ${highlighted ? "bg-popover" : "bg-[#F3F3EE]"}`}>
        {icon}
      </div>
      <span className="text-sm font-medium tracking-[-0.01em] text-[#09090B]">{label}</span>
    </button>
  );
}

function MenuDivider() {
  return (
    <div className="px-2.5 w-full">
      <div className="h-px w-full bg-[#E8E5DF]" />
    </div>
  );
}
