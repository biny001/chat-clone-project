import { createUploadthing, type FileRouter } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

export const ourFileRouter = {
  chatAttachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 4 },
    video: { maxFileSize: "16MB", maxFileCount: 1 },
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
    blob: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl, name: file.name, size: file.size };
    }),

  profileAvatar: f({
    image: { maxFileSize: "2MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.user.update({
        where: { id: metadata.userId },
        data: { image: file.ufsUrl },
      });
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
