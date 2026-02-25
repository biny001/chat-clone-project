"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AvatarUpload } from "./AvatarUpload";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/adapters";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileModal = ({ open, onOpenChange }: ProfileModalProps) => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || name.trim() === user?.name) return;
    setIsSaving(true);
    try {
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      // Reload to refresh session data
      window.location.reload();
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          <AvatarUpload
            currentImage={user.image ?? undefined}
            fallback={getInitials(user.name)}
            onUploadComplete={() => {
              // Avatar is saved server-side by UploadThing onUploadComplete
              window.location.reload();
            }}
          />

          <div className="w-full space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-9 rounded-lg border border-border px-3 text-sm bg-transparent text-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <p className="text-sm text-foreground">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim() || name.trim() === user.name}
            className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
