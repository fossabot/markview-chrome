// MarkView — URL / text detection utilities (pure functions, no DOM access)
//
// Extracted from content-script.js to enable unit testing and reuse.
// Every function here accepts primitives (strings/URLs) and returns primitives
// or plain objects, so tests don't need jsdom or a browser.
//
// Loaded as a content script before content-script.js. Attaches to
// `window.markviewDetect` so the main content script can call into it.
// Also exports via CommonJS when loaded from Node test runner.

(function (global) {
  "use strict";

  // ---------------------------------------------------------------------------
  // Markdown text heuristic
  // ---------------------------------------------------------------------------

  /**
   * Does this text look like markdown?
   *
   * Scans up to the first 30 lines, scoring markdown-style patterns
   * (headings, lists, links, code fences, blockquotes, tables, bold).
   * Returns true if the total score >= 3.
   *
   * @param {string} text
   * @returns {boolean}
   */
  function textLooksLikeMarkdown(text) {
    if (!text || typeof text !== "string" || text.length < 10) return false;
    var lines = text.split("\n").slice(0, 30);
    var mdSignals = 0;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (/^#{1,6}\s/.test(line)) mdSignals += 2;       // headings
      if (/^\s*[-*+]\s/.test(line)) mdSignals++;         // unordered list
      if (/^\s*\d+\.\s/.test(line)) mdSignals++;         // ordered list
      if (/\[.*\]\(.*\)/.test(line)) mdSignals++;         // links
      if (/```/.test(line)) mdSignals += 2;               // fenced code
      if (/^\s*>\s/.test(line)) mdSignals++;              // blockquote
      if (/\|.*\|.*\|/.test(line)) mdSignals++;           // tables
      if (/\*\*.*\*\*/.test(line)) mdSignals++;           // bold
    }
    return mdSignals >= 3;
  }

  // ---------------------------------------------------------------------------
  // URL classifiers
  // ---------------------------------------------------------------------------

  /**
   * True when the URL's pathname ends in `.md` or `.markdown`
   * (case-insensitive, query string and fragment ignored).
   *
   * @param {string} url
   * @returns {boolean}
   */
  function isMarkdownUrl(url) {
    try {
      var u = new URL(url);
      return /\.(?:md|markdown)$/i.test(u.pathname);
    } catch (_) {
      return false;
    }
  }

  /** @param {string} url */
  function isSharePointUrl(url) {
    try {
      return new URL(url).hostname.toLowerCase().endsWith(".sharepoint.com");
    } catch (_) {
      return false;
    }
  }

  /** @param {string} url */
  function isGoogleDriveUrl(url) {
    try {
      var h = new URL(url).hostname.toLowerCase();
      return h === "drive.google.com" || h === "docs.google.com";
    } catch (_) {
      return false;
    }
  }

  /** @param {string} url */
  function isDropboxUrl(url) {
    try {
      return new URL(url).hostname.toLowerCase() === "www.dropbox.com";
    } catch (_) {
      return false;
    }
  }

  /** @param {string} url */
  function isBoxUrl(url) {
    try {
      return new URL(url).hostname.toLowerCase() === "app.box.com";
    } catch (_) {
      return false;
    }
  }

  /** @param {string} url */
  function isGitHubRawUrl(url) {
    try {
      return new URL(url).hostname.toLowerCase() === "raw.githubusercontent.com";
    } catch (_) {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // SharePoint detection
  // ---------------------------------------------------------------------------

  /**
   * Parse a SharePoint URL for a markdown file reference.
   *
   * Recognized shapes:
   *  - `/_layouts/15/onedrive.aspx?id=/personal/.../file.md`
   *    (Teams "Open in Browser", OneDrive personal)
   *  - `/sites/.../AllItems.aspx?id=/sites/.../file.md`
   *    (SharePoint document library)
   *  - `/:t:/...`  text sharing link (opaque token, no path)
   *
   * Returns one of:
   *  - `{ type: "path", path, fileName }` for id-based URLs
   *  - `{ type: "sharing", url }` for `/:t:/` sharing links
   *  - `null` if not a markdown SharePoint URL
   *
   * @param {string} url - full URL string
   * @returns {{type: "path", path: string, fileName: string} | {type: "sharing", url: string} | null}
   */
  function detectSharePointMarkdown(url) {
    if (!isSharePointUrl(url)) return null;

    var u = new URL(url);
    var id = u.searchParams.get("id");
    if (id && /\.(?:md|markdown)$/i.test(id)) {
      var normalized = id.replace(/\\/g, "/");
      var parts = normalized.split("/");
      var fileName = decodeURIComponent(parts[parts.length - 1]);
      return { type: "path", path: id, fileName: fileName };
    }

    if (/^\/:t:\//.test(u.pathname)) {
      return { type: "sharing", url: url };
    }

    return null;
  }

  /**
   * Derive the SharePoint sub-web URL root from a server-relative file path.
   *
   * `/personal/user_example_com/Documents/file.md` with origin
   * `https://tenant-my.sharepoint.com` produces
   * `https://tenant-my.sharepoint.com/personal/user_example_com`.
   *
   * When the path doesn't start with `/personal/`, `/sites/`, or `/teams/`,
   * returns the bare origin.
   *
   * @param {string} origin - e.g. "https://tenant-my.sharepoint.com"
   * @param {string} serverRelativePath - e.g. "/personal/user/Documents/a.md"
   * @returns {string}
   */
  function getSharePointSiteUrl(origin, serverRelativePath) {
    if (typeof origin !== "string" || typeof serverRelativePath !== "string") {
      return String(origin || "");
    }
    var match = serverRelativePath.match(/^(\/(?:personal|sites|teams)\/[^/]+)\//);
    return match ? origin + match[1] : origin;
  }

  /**
   * Build the SharePoint REST API URL to fetch a markdown file by path.
   *
   * @param {string} origin
   * @param {string} serverRelativePath
   * @returns {string}
   */
  function buildSharePointFileFetchUrl(origin, serverRelativePath) {
    var siteUrl = getSharePointSiteUrl(origin, serverRelativePath);
    var escapedPath = serverRelativePath.replace(/'/g, "''");
    return (
      siteUrl +
      "/_api/web/GetFileByServerRelativePath(decodedUrl='" +
      escapedPath +
      "')/$value"
    );
  }

  /**
   * Encode a SharePoint sharing URL for the Graph `/shares/{encoded}` endpoint.
   * Format: `u!` + base64url(url)
   *
   * @param {string} sharingUrl
   * @returns {string}
   */
  function encodeSharePointSharingUrl(sharingUrl) {
    // Node + modern browsers both have btoa / Buffer-based base64.
    var b64;
    if (typeof btoa === "function") {
      b64 = btoa(unescape(encodeURIComponent(sharingUrl)));
    } else if (typeof Buffer !== "undefined") {
      b64 = Buffer.from(sharingUrl, "utf8").toString("base64");
    } else {
      throw new Error("No base64 encoder available");
    }
    return "u!" + b64.replace(/=+$/, "").replace(/\//g, "_").replace(/\+/g, "-");
  }

  // ---------------------------------------------------------------------------
  // Google Drive / Docs ID extraction
  // ---------------------------------------------------------------------------

  /**
   * Extract a Google Drive file ID from URL path or query string.
   *
   * Handles:
   *  - `/file/d/{fileId}/view`
   *  - `?id={fileId}`
   *  - `#id={fileId}` (resourcekey hash form)
   *
   * @param {string} url
   * @returns {string | null}
   */
  function extractDriveFileId(url) {
    try {
      var u = new URL(url);
      var pathMatch = u.pathname.match(/\/file\/d\/([^/]+)/);
      if (pathMatch) return pathMatch[1];

      var idParam = u.searchParams.get("id");
      if (idParam) return idParam;

      var hashMatch = (u.hash || "").match(/id=([^&]+)/);
      if (hashMatch) return hashMatch[1];
    } catch (_) {
      // invalid URL — fall through
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------

  var api = {
    textLooksLikeMarkdown: textLooksLikeMarkdown,
    isMarkdownUrl: isMarkdownUrl,
    isSharePointUrl: isSharePointUrl,
    isGoogleDriveUrl: isGoogleDriveUrl,
    isDropboxUrl: isDropboxUrl,
    isBoxUrl: isBoxUrl,
    isGitHubRawUrl: isGitHubRawUrl,
    detectSharePointMarkdown: detectSharePointMarkdown,
    getSharePointSiteUrl: getSharePointSiteUrl,
    buildSharePointFileFetchUrl: buildSharePointFileFetchUrl,
    encodeSharePointSharingUrl: encodeSharePointSharingUrl,
    extractDriveFileId: extractDriveFileId,
  };

  global.markviewDetect = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : this);
