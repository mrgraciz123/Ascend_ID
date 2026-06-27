import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

function validateMagicBytes(buffer: Buffer, extension: string): boolean {
  if (buffer.length < 4) return false;
  
  if (extension === "pdf") {
    return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46; // %PDF
  }
  if (extension === "png") {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47; // PNG header
  }
  if (extension === "jpg" || extension === "jpeg") {
    return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF; // JPEG SOI
  }
  if (extension === "webp") {
    if (buffer.length < 12) return false;
    const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46; // RIFF
    const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50; // WEBP
    return isRiff && isWebp;
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Double extension checks
    const parts = file.name.split(".");
    if (parts.length > 2) {
      return NextResponse.json({ error: "Invalid filename: Double extensions are prohibited." }, { status: 400 });
    }

    // 2. Reject banned extensions
    const extension = parts[parts.length - 1].toLowerCase();
    const bannedExtensions = ["exe", "js", "php", "zip", "html", "sh", "bat"];
    if (bannedExtensions.includes(extension)) {
      return NextResponse.json({ error: `Prohibited file extension: .${extension}` }, { status: 400 });
    }

    // 3. MIME and Extension mismatch check
    const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid MIME type" }, { status: 415 });
    }

    if (extension === "pdf" && file.type !== "application/pdf") {
      return NextResponse.json({ error: "MIME type and file extension mismatch" }, { status: 400 });
    }
    if (["png", "jpg", "jpeg", "webp"].includes(extension) && !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "MIME type and file extension mismatch" }, { status: 400 });
    }

    // 4. File size check (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 413 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 5. Magic Bytes validation (prevent extension spoofing)
    if (!validateMagicBytes(buffer, extension)) {
      return NextResponse.json({ error: "Security Alert: File signature (magic bytes) mismatch detected." }, { status: 400 });
    }

    // Upload to Cloudinary using a stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "ascendid_proofs" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(buffer);
    });

    return NextResponse.json({ 
      success: true, 
      url: (uploadResult as any).secure_url 
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
