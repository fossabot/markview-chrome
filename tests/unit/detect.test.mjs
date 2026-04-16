// Unit tests for detect.js — URL / text detection utilities.
// Run with: node --test unit/detect.test.mjs

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const MODULE_PATH = resolve(here, "../../detect.js");
const detect = require(MODULE_PATH);

// ===========================================================================
// textLooksLikeMarkdown
// ===========================================================================

describe("textLooksLikeMarkdown", () => {
  test("recognises headings + code + list", () => {
    const md = [
      "# Title",
      "",
      "- item one",
      "- item two",
      "",
      "```js",
      "console.log('x');",
      "```",
    ].join("\n");
    assert.equal(detect.textLooksLikeMarkdown(md), true);
  });

  test("recognises GFM table", () => {
    const md = "| a | b | c |\n|---|---|---|\n| 1 | 2 | 3 |\n| 4 | 5 | 6 |";
    assert.equal(detect.textLooksLikeMarkdown(md), true);
  });

  test("recognises blockquote + bold + link combination", () => {
    const md = "> **Important**\n> See [docs](https://example.com)";
    assert.equal(detect.textLooksLikeMarkdown(md), true);
  });

  test("plain prose below threshold returns false", () => {
    const prose = "This is just plain text.\nNothing special here.\nNo markdown at all.";
    assert.equal(detect.textLooksLikeMarkdown(prose), false);
  });

  test("empty string returns false", () => {
    assert.equal(detect.textLooksLikeMarkdown(""), false);
  });

  test("null / undefined / non-string returns false", () => {
    assert.equal(detect.textLooksLikeMarkdown(null), false);
    assert.equal(detect.textLooksLikeMarkdown(undefined), false);
    assert.equal(detect.textLooksLikeMarkdown(123), false);
    assert.equal(detect.textLooksLikeMarkdown({}), false);
  });

  test("very short input returns false (< 10 chars)", () => {
    assert.equal(detect.textLooksLikeMarkdown("# a"), false);
  });

  test("single weak signal (only bold) returns false", () => {
    const text = "This has **bold** text.\nAnd not much else.\nJust prose.";
    assert.equal(detect.textLooksLikeMarkdown(text), false);
  });

  test("heading alone scores 2 — below threshold of 3", () => {
    assert.equal(detect.textLooksLikeMarkdown("# only a heading\nno other signals\nplain text here"), false);
  });

  test("fenced code block alone is sufficient (2 pts + other)", () => {
    const text = "```\nsome code\n```\n- list item\nother text";
    assert.equal(detect.textLooksLikeMarkdown(text), true);
  });

  test("only scans first 30 lines", () => {
    // 30 lines of prose, then markdown after — should still be false
    var padding = Array.from({ length: 35 }, (_, i) => "prose line " + i).join("\n");
    var text = padding + "\n# heading after cutoff\n- list item";
    assert.equal(detect.textLooksLikeMarkdown(text), false);
  });
});

// ===========================================================================
// URL classifiers
// ===========================================================================

describe("isMarkdownUrl", () => {
  test("matches .md extension", () => {
    assert.equal(detect.isMarkdownUrl("https://example.com/file.md"), true);
  });

  test("matches .markdown extension", () => {
    assert.equal(detect.isMarkdownUrl("https://example.com/readme.markdown"), true);
  });

  test("is case-insensitive", () => {
    assert.equal(detect.isMarkdownUrl("https://example.com/README.MD"), true);
    assert.equal(detect.isMarkdownUrl("https://example.com/File.Markdown"), true);
  });

  test("ignores query strings and fragments", () => {
    assert.equal(detect.isMarkdownUrl("https://example.com/a.md?v=2"), true);
    assert.equal(detect.isMarkdownUrl("https://example.com/a.md#section"), true);
  });

  test("rejects non-md extensions", () => {
    assert.equal(detect.isMarkdownUrl("https://example.com/file.txt"), false);
    assert.equal(detect.isMarkdownUrl("https://example.com/file.mdx"), false);
    assert.equal(detect.isMarkdownUrl("https://example.com/mdfile"), false);
  });

  test("rejects malformed URLs", () => {
    assert.equal(detect.isMarkdownUrl("not-a-url"), false);
    assert.equal(detect.isMarkdownUrl(""), false);
    assert.equal(detect.isMarkdownUrl(null), false);
  });

  test("handles file:// URLs", () => {
    assert.equal(detect.isMarkdownUrl("file:///C:/docs/readme.md"), true);
  });
});

describe("isSharePointUrl", () => {
  test("matches *.sharepoint.com subdomains", () => {
    assert.equal(detect.isSharePointUrl("https://tenant-my.sharepoint.com/x"), true);
    assert.equal(detect.isSharePointUrl("https://tenant.sharepoint.com/y"), true);
  });

  test("matches case-insensitive host", () => {
    assert.equal(detect.isSharePointUrl("https://TENANT.SHAREPOINT.COM/x"), true);
  });

  test("rejects other domains", () => {
    assert.equal(detect.isSharePointUrl("https://drive.google.com/x"), false);
    assert.equal(detect.isSharePointUrl("https://example.com/x"), false);
  });

  test("does not match sharepoint-lookalike domains", () => {
    assert.equal(detect.isSharePointUrl("https://notsharepoint.com/x"), false);
    assert.equal(detect.isSharePointUrl("https://sharepoint.com.evil.com/x"), false);
  });

  test("rejects malformed URLs", () => {
    assert.equal(detect.isSharePointUrl("not-a-url"), false);
  });
});

describe("isGoogleDriveUrl", () => {
  test("matches drive.google.com", () => {
    assert.equal(detect.isGoogleDriveUrl("https://drive.google.com/file/d/123/view"), true);
  });

  test("matches docs.google.com", () => {
    assert.equal(detect.isGoogleDriveUrl("https://docs.google.com/document/d/456"), true);
  });

  test("rejects subdomain attacks", () => {
    assert.equal(detect.isGoogleDriveUrl("https://drive.google.com.evil.com/x"), false);
  });

  test("rejects other google services", () => {
    assert.equal(detect.isGoogleDriveUrl("https://www.google.com/x"), false);
    assert.equal(detect.isGoogleDriveUrl("https://mail.google.com/x"), false);
  });
});

describe("isDropboxUrl", () => {
  test("matches www.dropbox.com", () => {
    assert.equal(detect.isDropboxUrl("https://www.dropbox.com/s/abc/file.md"), true);
  });

  test("rejects dropbox subdomains that aren't www", () => {
    assert.equal(detect.isDropboxUrl("https://api.dropbox.com/x"), false);
  });
});

describe("isBoxUrl", () => {
  test("matches app.box.com", () => {
    assert.equal(detect.isBoxUrl("https://app.box.com/s/abc"), true);
  });

  test("rejects other box.com subdomains", () => {
    assert.equal(detect.isBoxUrl("https://www.box.com/x"), false);
  });
});

describe("isGitHubRawUrl", () => {
  test("matches raw.githubusercontent.com", () => {
    assert.equal(detect.isGitHubRawUrl("https://raw.githubusercontent.com/o/r/main/README.md"), true);
  });

  test("rejects github.com main site", () => {
    assert.equal(detect.isGitHubRawUrl("https://github.com/o/r/blob/main/README.md"), false);
  });
});

// ===========================================================================
// detectSharePointMarkdown
// ===========================================================================

describe("detectSharePointMarkdown — path type (Teams/OneDrive)", () => {
  const base =
    "https://tenant-my.sharepoint.com/personal/user_example_com/_layouts/15/onedrive.aspx";

  test("matches Teams Open in Browser URL shape", () => {
    const url =
      base +
      "?id=%2Fpersonal%2Fuser%5Fexample%5Fcom%2FDocuments%2FMicrosoft%20Teams%20Chat%20Files%2Fdoc%2Emd" +
      "&parent=%2Fpersonal%2Fuser%5Fexample%5Fcom%2FDocuments";
    const result = detect.detectSharePointMarkdown(url);
    assert.equal(result.type, "path");
    assert.ok(result.path.endsWith(".md"));
    assert.equal(result.fileName, "doc.md");
  });

  test("decodes fileName from URL-encoded id", () => {
    const url =
      base +
      "?id=%2Fpersonal%2Fuser_example_com%2FDocuments%2Fmy%20file.md";
    const result = detect.detectSharePointMarkdown(url);
    assert.equal(result.fileName, "my file.md");
  });

  test("handles .markdown extension", () => {
    const url = base + "?id=/personal/user_example_com/Documents/doc.markdown";
    const result = detect.detectSharePointMarkdown(url);
    assert.equal(result.type, "path");
    assert.equal(result.fileName, "doc.markdown");
  });

  test("returns null for non-md file", () => {
    const url = base + "?id=/personal/user_example_com/Documents/notes.txt";
    assert.equal(detect.detectSharePointMarkdown(url), null);
  });

  test("normalises backslashes to forward slashes", () => {
    const url = base + "?id=%2Fpersonal%5Cuser%5Cfile.md";
    const result = detect.detectSharePointMarkdown(url);
    assert.equal(result.type, "path");
    assert.equal(result.fileName, "file.md");
  });
});

describe("detectSharePointMarkdown — sharing link type", () => {
  test("matches /:t:/ sharing URL", () => {
    const url = "https://tenant-my.sharepoint.com/:t:/g/personal/user_example/abc123";
    const result = detect.detectSharePointMarkdown(url);
    assert.equal(result.type, "sharing");
    assert.equal(result.url, url);
  });

  test("does not match other shortlink types (:x:/, :w:/, :p:/)", () => {
    assert.equal(detect.detectSharePointMarkdown("https://tenant.sharepoint.com/:x:/g/abc"), null);
    assert.equal(detect.detectSharePointMarkdown("https://tenant.sharepoint.com/:w:/g/abc"), null);
    assert.equal(detect.detectSharePointMarkdown("https://tenant.sharepoint.com/:p:/g/abc"), null);
  });
});

describe("detectSharePointMarkdown — rejection cases", () => {
  test("returns null for non-SharePoint hosts", () => {
    assert.equal(detect.detectSharePointMarkdown("https://drive.google.com/x?id=/foo.md"), null);
    assert.equal(detect.detectSharePointMarkdown("https://example.com/x"), null);
  });

  test("returns null when id param is missing", () => {
    assert.equal(detect.detectSharePointMarkdown("https://tenant.sharepoint.com/_layouts/15/onedrive.aspx"), null);
  });

  test("returns null for malformed URL", () => {
    assert.equal(detect.detectSharePointMarkdown("not-a-url"), null);
  });

  test("returns null for empty string", () => {
    assert.equal(detect.detectSharePointMarkdown(""), null);
  });
});

// ===========================================================================
// getSharePointSiteUrl
// ===========================================================================

describe("getSharePointSiteUrl", () => {
  const origin = "https://tenant-my.sharepoint.com";

  test("resolves /personal/ path", () => {
    assert.equal(
      detect.getSharePointSiteUrl(origin, "/personal/user_example_com/Documents/a.md"),
      origin + "/personal/user_example_com"
    );
  });

  test("resolves /sites/ path", () => {
    assert.equal(
      detect.getSharePointSiteUrl(origin, "/sites/engineering/Shared Documents/a.md"),
      origin + "/sites/engineering"
    );
  });

  test("resolves /teams/ path", () => {
    assert.equal(
      detect.getSharePointSiteUrl(origin, "/teams/platform/Docs/a.md"),
      origin + "/teams/platform"
    );
  });

  test("falls back to origin for unmatched shapes", () => {
    assert.equal(detect.getSharePointSiteUrl(origin, "/something/else.md"), origin);
  });

  test("returns origin when path is a single segment", () => {
    assert.equal(detect.getSharePointSiteUrl(origin, "/file.md"), origin);
  });

  test("handles non-string inputs defensively", () => {
    assert.equal(detect.getSharePointSiteUrl(origin, null), origin);
    assert.equal(detect.getSharePointSiteUrl(null, "/personal/u/a.md"), "");
  });
});

// ===========================================================================
// buildSharePointFileFetchUrl
// ===========================================================================

describe("buildSharePointFileFetchUrl", () => {
  const origin = "https://tenant-my.sharepoint.com";

  test("builds REST URL for a personal path", () => {
    const path = "/personal/user_example_com/Documents/doc.md";
    const url = detect.buildSharePointFileFetchUrl(origin, path);
    assert.ok(url.startsWith(origin + "/personal/user_example_com/_api/web/GetFileByServerRelativePath"));
    assert.ok(url.endsWith("/$value"));
    assert.ok(url.includes("decodedUrl='" + path + "'"));
  });

  test("escapes single quotes in path by doubling them", () => {
    const path = "/personal/user/it's.md";
    const url = detect.buildSharePointFileFetchUrl(origin, path);
    assert.ok(url.includes("it''s.md"));
  });

  test("leaves spaces unencoded inside decodedUrl literal", () => {
    const path = "/personal/user_example_com/Microsoft Teams Chat Files/doc.md";
    const url = detect.buildSharePointFileFetchUrl(origin, path);
    assert.ok(url.includes("Microsoft Teams Chat Files"));
  });
});

// ===========================================================================
// encodeSharePointSharingUrl
// ===========================================================================

describe("encodeSharePointSharingUrl", () => {
  test("produces u! prefix", () => {
    const encoded = detect.encodeSharePointSharingUrl("https://tenant.sharepoint.com/:t:/g/abc");
    assert.ok(encoded.startsWith("u!"));
  });

  test("is URL-safe base64 (no +, /, =)", () => {
    const encoded = detect.encodeSharePointSharingUrl("https://tenant.sharepoint.com/:t:/g/abc?p=q&r=s");
    assert.ok(!encoded.includes("+"));
    assert.ok(!encoded.includes("/"));
    assert.ok(!encoded.includes("="));
  });

  test("is deterministic for the same input", () => {
    const a = detect.encodeSharePointSharingUrl("https://tenant.sharepoint.com/:t:/g/xyz");
    const b = detect.encodeSharePointSharingUrl("https://tenant.sharepoint.com/:t:/g/xyz");
    assert.equal(a, b);
  });

  test("handles unicode characters", () => {
    const encoded = detect.encodeSharePointSharingUrl("https://tenant.sharepoint.com/:t:/g/café");
    assert.ok(encoded.startsWith("u!"));
    assert.ok(encoded.length > 3);
  });
});

// ===========================================================================
// extractDriveFileId
// ===========================================================================

describe("extractDriveFileId", () => {
  test("extracts ID from /file/d/ path", () => {
    assert.equal(
      detect.extractDriveFileId("https://drive.google.com/file/d/1AbCdEfGhIjK/view"),
      "1AbCdEfGhIjK"
    );
  });

  test("extracts ID from ?id= query", () => {
    assert.equal(
      detect.extractDriveFileId("https://drive.google.com/uc?id=1AbCdEfGhIjK"),
      "1AbCdEfGhIjK"
    );
  });

  test("extracts ID from #id= hash fragment", () => {
    assert.equal(
      detect.extractDriveFileId("https://drive.google.com/open#id=1AbCdEfGhIjK"),
      "1AbCdEfGhIjK"
    );
  });

  test("returns null when no recognisable ID", () => {
    assert.equal(detect.extractDriveFileId("https://drive.google.com/drive/my-drive"), null);
  });

  test("returns null for malformed URL", () => {
    assert.equal(detect.extractDriveFileId("not-a-url"), null);
  });
});

// ===========================================================================
// Defensive / regression tests
// ===========================================================================

describe("regression — the SharePoint URL from the session diagnosis", () => {
  // The actual URL shape used during the MarkView session that debugged
  // Teams "Open in Browser" against a live tenant.
  const url =
    "https://tenant-my.sharepoint.com/personal/user_example_com/_layouts/15/onedrive.aspx" +
    "?id=%2Fpersonal%2Fuser%5Fexample%5Fcom%2FDocuments%2FMicrosoft%20Teams%20Chat%20Files%2FBIT%5FCase%5FStudy%5FSocial%5FSelling%5FDocumentation%2Emd" +
    "&parent=%2Fpersonal%2Fuser%5Fexample%5Fcom%2FDocuments%2FMicrosoft%20Teams%20Chat%20Files" +
    "&ga=1";

  test("is recognised as SharePoint", () => {
    assert.equal(detect.isSharePointUrl(url), true);
  });

  test("detectSharePointMarkdown returns path type", () => {
    const result = detect.detectSharePointMarkdown(url);
    assert.equal(result.type, "path");
  });

  test("fileName decodes correctly from percent encoding", () => {
    const result = detect.detectSharePointMarkdown(url);
    assert.equal(result.fileName, "BIT_Case_Study_Social_Selling_Documentation.md");
  });

  test("buildSharePointFileFetchUrl produces the REST path MarkView uses", () => {
    const result = detect.detectSharePointMarkdown(url);
    const origin = "https://tenant-my.sharepoint.com";
    const apiUrl = detect.buildSharePointFileFetchUrl(origin, result.path);
    assert.ok(apiUrl.includes("/_api/web/GetFileByServerRelativePath"));
    assert.ok(apiUrl.endsWith("/$value"));
  });
});
