import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "machinery-store";

    if (!file)
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type))
      return NextResponse.json({ success: false, error: "Invalid file type. Use JPEG, PNG, WEBP, or GIF." }, { status: 400 });

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ success: false, error: "File too large. Maximum size is 5MB." }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder,
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    return NextResponse.json({
      success: true,
      data: { url: result.secure_url, publicId: result.public_id },
    });
  } catch (error) {
    console.error("[UPLOAD_POST]", error);
    return NextResponse.json({ success: false, error: "Failed to upload image" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { publicId } = await req.json();
    if (!publicId)
      return NextResponse.json({ success: false, error: "Public ID is required" }, { status: 400 });

    await cloudinary.uploader.destroy(publicId);
    return NextResponse.json({ success: true, message: "Image deleted" });
  } catch (error) {
    console.error("[UPLOAD_DELETE]", error);
    return NextResponse.json({ success: false, error: "Failed to delete image" }, { status: 500 });
  }
}
