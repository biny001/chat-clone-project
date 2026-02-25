UploadThing

Type-safe file uploads for Next.js and React. Define file routes, get pre-built components, automatic CDN delivery.
Quick Start

npm install uploadthing @uploadthing/react

Get API Key

    Sign up at uploadthing.com
    Create a new app
    Copy your UPLOADTHING_TOKEN

# .env
UPLOADTHING_TOKEN=your_token_here

File Router Setup

Define upload endpoints with validation and callbacks.

// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // Upload images up to 4MB
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 4 } })
    .middleware(async ({ req }) => {
      // Authenticate user
      const user = await auth(req);
      if (!user) throw new Error("Unauthorized");

      // Return data accessible in onUploadComplete
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete:", file.url);
      console.log("User:", metadata.userId);

      // Return data to client
      return { uploadedBy: metadata.userId };
    }),

  // Upload PDFs
  pdfUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(async () => ({ timestamp: Date.now() }))
    .onUploadComplete(async ({ file }) => {
      console.log("PDF uploaded:", file.url);
    }),

  // Any file type
  fileUploader: f(["image", "video", "audio", "pdf", "text"])
    .middleware(async () => ({}))
    .onUploadComplete(async ({ file }) => {
      console.log("File:", file.name, file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

Route Handler

// app/api/uploadthing/route.ts
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});

React Components
Generate Typed Components

// lib/uploadthing.ts
import {
  generateUploadButton,
  generateUploadDropzone,
  generateUploader,
} from "@uploadthing/react";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
export const Uploader = generateUploader<OurFileRouter>();

UploadButton

"use client";

import { UploadButton } from "@/lib/uploadthing";

export function ImageUpload() {
  return (
    <UploadButton
      endpoint="imageUploader"
      onClientUploadComplete={(res) => {
        console.log("Files:", res);
        // res = [{ url, name, size, key, serverData }]
      }}
      onUploadError={(error) => {
        console.error("Error:", error.message);
      }}
      onUploadBegin={(name) => {
        console.log("Uploading:", name);
      }}
      onUploadProgress={(progress) => {
        console.log("Progress:", progress);
      }}
    />
  );
}

UploadDropzone

"use client";

import { UploadDropzone } from "@/lib/uploadthing";

export function FileDropzone() {
  return (
    <UploadDropzone
      endpoint="fileUploader"
      onClientUploadComplete={(res) => {
        console.log("Uploaded:", res);
      }}
      onUploadError={(error) => {
        alert(Error: ${error.message});
      }}
      config={{
        mode: "auto",  // or "manual"
      }}
    />
  );
}

Custom Styling

<UploadButton
  endpoint="imageUploader"
  appearance={{
    button: "bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded",
    container: "w-max flex-row gap-4",
    allowedContent: "text-gray-500 text-sm",
  }}
  content={{
    button: ({ ready, isUploading }) => {
      if (isUploading) return "Uploading...";
      if (ready) return "Upload Image";
      return "Getting ready...";
    },
    allowedContent: "Images up to 4MB",
  }}
  onClientUploadComplete={(res) => console.log(res)}
/>

useUploadThing Hook

Full control over upload process.

"use client";

import { useUploadThing } from "@uploadthing/react";
import { useState, useCallback } from "react";
export function CustomUploader() {
  const [files, setFiles] = useState<File[]>([]);

  const { startUpload, isUploading, permittedFileInfo } = useUploadThing(
    "imageUploader",
    {
      onClientUploadComplete: (res) => {
        console.log("Uploaded:", res);
        setFiles([]);
      },
      onUploadError: (error) => {
        console.error("Error:", error);
      },
      onUploadProgress: (progress) => {
        console.log("Progress:", progress);
      },
    }
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const handleUpload = () => {
    if (files.length > 0) {
      startUpload(files);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
        accept={permittedFileInfo?.config?.image?.accept}
      />
      <p>
        Max size: {permittedFileInfo?.config?.image?.maxFileSize}
      </p>
      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}

Server-Side API (UTApi)

Manage files from your server.

// lib/uploadthing-server.ts
import { UTApi } from "uploadthing/server";

export const utapi = new UTApi();

Upload from Server

import { utapi } from "@/lib/uploadthing-server";

// Upload from URL
const response = await utapi.uploadFilesFromUrl([
  "https://example.com/image.jpg",
  { url: "https://example.com/doc.pdf", name: "custom-name.pdf" }
]);

// Upload from File/Blob
const file = new File(["content"], "hello.txt", { type: "text/plain" });
const response = await utapi.uploadFiles([file]);

Delete Files

// Delete by key
await utapi.deleteFiles("fileKey123");

// Delete multiple
await utapi.deleteFiles(["key1", "key2"]);

List & Get Files

// List all files
const files = await utapi.listFiles();

// Get file URLs
const urls = await utapi.getFileUrls(["key1", "key2"]);

// Rename file
await utapi.renameFiles({
  fileKey: "oldName.jpg",
  newName: "newName.jpg"
});

File Route Configuration
File Types

// Specific types
f({ image: { maxFileSize: "4MB" } })
f({ video: { maxFileSize: "256MB" } })
f({ audio: { maxFileSize: "16MB" } })
f({ pdf: { maxFileSize: "8MB" } })
f({ text: { maxFileSize: "1MB" } })
f({ blob: { maxFileSize: "8MB" } })  // Any binary

// Multiple types
f(["image", "video"])

// Custom MIME types
f({
  "application/json": { maxFileSize: "1MB" },
  "image/png": { maxFileSize: "4MB" }
})

Limits

f({
  image: {
    maxFileSize: "4MB",
    maxFileCount: 10,
    minFileCount: 1,
  }
})

Input Validation

const f = createUploadthing();

f({ image: { maxFileSize: "4MB" } })
  .input(z.object({
    postId: z.string(),
    caption: z.string().optional(),
  }))
  .middleware(async ({ input }) => {
    // Access validated input
    console.log("Post ID:", input.postId);
    return { postId: input.postId };
  })
  .onUploadComplete(async ({ metadata, file }) => {
    // Save to database with postId
    await db.postImage.create({
      data: {
        postId: metadata.postId,
        url: file.url,
      },
    });
  });

Use with Input

<UploadButton
  endpoint="imageUploader"
  input={{ postId: "123", caption: "My photo" }}
  onClientUploadComplete={(res) => console.log(res)}
/>

Integration with React Hook Form

import { useForm } from "react-hook-form";
import { UploadButton } from "@/lib/uploadthing";

function PostForm() {
  const form = useForm({
    defaultValues: {
      title: "",
      imageUrl: "",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("title")} />

      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          form.setValue("imageUrl", res[0].url);
        }}
      />

      {form.watch("imageUrl") && (
        <img src={form.watch("imageUrl")} alt="Preview" />
      )}

      <button type="submit">Submit</button>
    </form>
  );
}

Next.js Pages Router// pages/api/uploadthing.ts
import { createRouteHandler } from "uploadthing/next-legacy";
import { ourFileRouter } from "../../server/uploadthing";

const handler = createRouteHandler({
  router: ourFileRouter,
});

export default handler;

SSR Plugin (App Router)

Improve initial load by including file route config in SSR.

// app/layout.tsx
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NextSSRPlugin
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
        {children}
      </body>
    </html>
  );
}

Best Practices

    Validate in middleware - Check auth before upload
    Use typed components - Generate from your FileRouter
    Handle errors - Always provide onUploadError
    Include SSR plugin - Faster initial load
    Use UTApi for server operations - Delete old files, etc.
    Set appropriate limits - Match your use case