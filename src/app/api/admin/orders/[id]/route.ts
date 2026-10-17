import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin-api";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const { status, trackingNumber, shippingCarrier } = await req.json();

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(trackingNumber !== undefined && { trackingNumber }),
      ...(shippingCarrier !== undefined && { shippingCarrier }),
    },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  return NextResponse.json(order);
}
