import { createUploadthing, UploadThingError, type FileRouter } from "uploadthing/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

async function authenticate() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new UploadThingError("Unauthorized");
  return session.user.id;
}

export const ourFileRouter = {
  chatAttachment: f({
    image: { maxFileSize: "16MB", maxFileCount: 4 },
    video: { maxFileSize: "64MB", maxFileCount: 1 },
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    blob: { maxFileSize: "32MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const userId = await authenticate();
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl, name: file.name, size: file.size };
    }),

  profileAvatar: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const userId = await authenticate();
      return { userId };
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
