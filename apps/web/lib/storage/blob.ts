import { put, head } from "@vercel/blob";
import { nanoid } from "nanoid";

export interface UploadAudioResult {
  url: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
  bytes: number;
}

/**
 * Upload audio file to Vercel Blob storage
 * Vercel Blob automatically supports:
 * - HTTP byte-range requests (required for Apple Podcasts)
 * - HEAD requests
 * - CDN caching
 */
export async function uploadAudio(
  buffer: Buffer,
  options: {
    filename?: string;
    contentType?: string;
  } = {}
): Promise<UploadAudioResult> {
  const {
    filename = `episode-${nanoid()}.mp3`,
    contentType = "audio/mpeg",
  } = options;

  try {
    const blob = await put(filename, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false, // We're already using nanoid
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType || contentType,
      contentDisposition: blob.contentDisposition || `attachment; filename="${filename}"`,
      bytes: buffer.length,
    };
  } catch (error) {
    console.error("Failed to upload audio to Blob:", error);
    throw new Error(
      `Failed to upload audio: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Verify that a blob URL supports byte-range requests
 * This is required for Apple Podcasts compatibility
 */
export async function verifyByteRangeSupport(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
    });

    if (!response.ok) {
      return false;
    }

    // Check for Accept-Ranges header
    const acceptRanges = response.headers.get("accept-ranges");
    return acceptRanges === "bytes";
  } catch (error) {
    console.error("Failed to verify byte-range support:", error);
    return false;
  }
}

/**
 * Get metadata about an audio file from Blob storage
 */
export async function getAudioMetadata(url: string) {
  try {
    const response = await head(url);
    return {
      size: response.size,
      uploadedAt: response.uploadedAt,
      contentType: response.contentType,
    };
  } catch (error) {
    console.error("Failed to get audio metadata:", error);
    throw new Error(
      `Failed to get audio metadata: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
