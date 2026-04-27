import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const brands = await prisma.product.findMany({
      where: { brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    });
    return NextResponse.json({
      success: true,
      data: brands.flatMap((b: { brand: string | null }) => b.brand ? [b.brand] : []),
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch brands" }, { status: 500 });
  }
}
