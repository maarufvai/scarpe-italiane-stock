import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin-api";
import { prisma } from "@/lib/prisma";
import { parseProductInput, prismaErrorResponse } from "@/lib/product-input";

// PATCH /api/admin/products/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const parsed = parseProductInput(await req.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { variants, images, ...fields } = parsed.data;

  // Only variants that already belong to this product may be updated by id
  const ownIds = new Set(
    (await prisma.productVariant.findMany({ where: { productId: id }, select: { id: true } })).map((v) => v.id)
  );
  if (variants.some((v) => v.id && !ownIds.has(v.id))) {
    return NextResponse.json({ error: "Variante non valida / Invalid variant" }, { status: 400 });
  }

  try {
    const product = await prisma.$transaction(
      async (tx) => {
        // Remove dropped variants first so a re-added size/colour doesn't hit the unique key
        const keepIds = variants.flatMap((v) => (v.id ? [v.id] : []));
        await tx.productVariant.deleteMany({ where: { productId: id, id: { notIn: keepIds } } });

        for (const { id: variantId, size, color, colorCode, price, qty } of variants) {
          if (variantId) {
            await tx.productVariant.update({ where: { id: variantId }, data: { size, color, colorCode, price, qty } });
          } else {
            await tx.productVariant.create({ data: { productId: id, size, color, colorCode, price, qty } });
          }
        }

        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length) {
          await tx.productImage.createMany({
            data: images.map((url, i) => ({ productId: id, url, position: i })),
          });
        }

        return tx.product.update({
          where: { id },
          data: fields,
          include: {
            images: { orderBy: { position: "asc" } },
            variants: { orderBy: [{ size: "asc" }, { color: "asc" }] },
          },
        });
      },
      { timeout: 20000 }
    );
    return NextResponse.json(product);
  } catch (e) {
    return prismaErrorResponse(e);
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;

  // Find all order items referencing this product's variants, joined to their order status
  const variantIds = await prisma.productVariant
    .findMany({ where: { productId: id }, select: { id: true } })
    .then((vs) => vs.map((v) => v.id));

  if (variantIds.length > 0) {
    // Check for any active (non-completed) orders
    const activeOrder = await prisma.orderItem.findFirst({
      where: {
        variantId: { in: variantIds },
        order: { status: { notIn: ["DELIVERED", "CANCELLED"] } },
      },
      select: { order: { select: { status: true } } },
    });

    if (activeOrder) {
      return NextResponse.json(
        { error: `Cannot delete — has an active order (${activeOrder.order.status})` },
        { status: 409 }
      );
    }

    // All referencing orders are DELIVERED or CANCELLED — remove order items so FK is clear
    await prisma.orderItem.deleteMany({ where: { variantId: { in: variantIds } } });
  }

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
