/**
 * RSS feed validation utilities
 * Validates feeds against Apple Podcasts and RSS 2.0 requirements
 */

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  severity: "error";
}

export interface ValidationWarning {
  code: string;
  message: string;
  severity: "warning";
}

/**
 * Validate an RSS feed XML string
 */
export function validateRSSFeed(xml: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check for required RSS 2.0 elements
  if (!xml.includes("<rss")) {
    errors.push({
      code: "MISSING_RSS_TAG",
      message: "Missing <rss> root element",
      severity: "error",
    });
  }

  if (!xml.includes("<channel>")) {
    errors.push({
      code: "MISSING_CHANNEL",
      message: "Missing <channel> element",
      severity: "error",
    });
  }

  // Check for required channel elements
  const requiredChannelElements = [
    "title",
    "description",
    "language",
    "link",
  ];

  for (const element of requiredChannelElements) {
    if (!xml.includes(`<${element}>`)) {
      errors.push({
        code: `MISSING_${element.toUpperCase()}`,
        message: `Missing required <${element}> element in channel`,
        severity: "error",
      });
    }
  }

  // Check for iTunes required tags
  const requiredITunesElements = [
    "itunes:author",
    "itunes:category",
    "itunes:explicit",
    "itunes:image",
  ];

  for (const element of requiredITunesElements) {
    if (!xml.includes(`<${element}`)) {
      warnings.push({
        code: `MISSING_${element.toUpperCase().replace(":", "_")}`,
        message: `Missing recommended <${element}> tag for iTunes`,
        severity: "warning",
      });
    }
  }

  // Check for proper enclosure tags in items
  const itemMatches = xml.match(/<item>/g);
  if (itemMatches) {
    const enclosureMatches = xml.match(/<enclosure[^>]*>/g);

    if (!enclosureMatches || enclosureMatches.length === 0) {
      warnings.push({
        code: "NO_ENCLOSURES",
        message: "No <enclosure> tags found in any items",
        severity: "warning",
      });
    } else {
      // Validate each enclosure has required attributes
      for (const enclosure of enclosureMatches) {
        if (!enclosure.includes('url="')) {
          errors.push({
            code: "ENCLOSURE_MISSING_URL",
            message: "Enclosure missing required 'url' attribute",
            severity: "error",
          });
        }
        if (!enclosure.includes('length="')) {
          errors.push({
            code: "ENCLOSURE_MISSING_LENGTH",
            message: "Enclosure missing required 'length' attribute (bytes)",
            severity: "error",
          });
        }
        if (!enclosure.includes('type="')) {
          errors.push({
            code: "ENCLOSURE_MISSING_TYPE",
            message: "Enclosure missing required 'type' attribute (MIME type)",
            severity: "error",
          });
        }
      }
    }
  }

  // Check for GUIDs
  if (itemMatches && !xml.includes("<guid")) {
    warnings.push({
      code: "NO_GUIDS",
      message: "Items should include <guid> tags for better client compatibility",
      severity: "warning",
    });
  }

  // Check for pubDate in items
  if (itemMatches && !xml.includes("<pubDate>")) {
    warnings.push({
      code: "NO_PUBDATES",
      message: "Items should include <pubDate> tags",
      severity: "warning",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Test if a URL supports HTTP byte-range requests
 * This is required for Apple Podcasts compatibility
 */
export async function testByteRangeSupport(url: string): Promise<boolean> {
  try {
    // Test HEAD request
    const headResponse = await fetch(url, { method: "HEAD" });
    if (!headResponse.ok) {
      return false;
    }

    const acceptRanges = headResponse.headers.get("accept-ranges");
    if (acceptRanges !== "bytes") {
      return false;
    }

    // Test actual range request
    const rangeResponse = await fetch(url, {
      headers: { Range: "bytes=0-1023" }, // Request first 1KB
    });

    // Should return 206 Partial Content
    if (rangeResponse.status !== 206) {
      return false;
    }

    // Should include Content-Range header
    const contentRange = rangeResponse.headers.get("content-range");
    return contentRange !== null;
  } catch (error) {
    console.error("Byte-range test failed:", error);
    return false;
  }
}
