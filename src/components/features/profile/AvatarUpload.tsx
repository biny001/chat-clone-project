"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUploadThing } from "@/lib/uploadthing";

interface AvatarUploadProps {
  currentImage?: string;
  fallback: string;
  onUploadComplete?: (url: string) => void;
}

export const AvatarUpload = ({ currentImage, fallback, onUploadComplete }: AvatarUploadProps) => {
  const [imageUrl, setImageUrl] = useState(currentImage);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("profileAvatar", {
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      if (res && res.length > 0) {
        const url = res[0].ufsUrl;
        setImageUrl(url);
        onUploadComplete?.(url);
      }
    },
    onUploadError: () => {
      setIsUploading(false);
    },
  });

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    await startUpload(Array.from(files));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative inline-block">
      <Avatar className="h-20 w-20">
        <AvatarImage src={imageUrl} />
        <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
          {fallback}
        </AvatarFallback>
      </Avatar>
      <button
        onClick={handleClick}
        disabled={isUploading}
        className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground border-2 border-card hover:opacity-80 transition-opacity disabled:opacity-50"
      >
        {isUploading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Camera size={12} />
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};
