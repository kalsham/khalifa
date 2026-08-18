import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { resolveProductFilePath } from "@/lib/storage";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const item = await prisma.orderItem.findUnique({
    where: { downloadToken: token },
    include: { order: true, product: true },
  });

  if (!item) {
    return NextResponse.json({ error: "Download link not found." }, { status: 404 });
  }
  if (item.order.status !== "PAID") {
    return NextResponse.json({ error: "This order has not been paid for yet." }, { status: 403 });
  }
  if (item.downloadCount >= item.maxDownloads) {
    return NextResponse.json({ error: "This download link has reached its limit." }, { status: 403 });
  }

  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(resolveProductFilePath(item.product.filePath));
  } catch {
    return NextResponse.json({ error: "File is missing on the server." }, { status: 500 });
  }

  await prisma.orderItem.update({
    where: { id: item.id },
    data: { downloadCount: { increment: 1 } },
  });

  const filename = `${item.product.slug}.pdf`;
  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
