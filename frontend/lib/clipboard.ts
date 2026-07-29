/**
 * Copies text to the clipboard, falling back to the legacy
 * execCommand('copy') trick when running in an insecure context
 * (plain HTTP — e.g. a captive portal served from 192.168.4.1).
 *
 * navigator.clipboard.writeText only works under a secure context
 * (HTTPS or localhost), so this fallback is required for the AP.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error("Clipboard API failed, falling back:", err);
    }
  }
  return copyWithLegacyFallback(text);
}

function copyWithLegacyFallback(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;

  // keep it off-screen and non-disruptive
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    // @ts-ignore: execCommand está deprecado pero es el único fallback que funciona en HTTP local
    const success = document.execCommand("copy");
    return success;
  } catch (err) {
    console.error("Legacy copy fallback failed:", err);
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}