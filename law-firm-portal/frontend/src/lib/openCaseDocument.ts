/** Open a signed storage URL in a new tab (works on mobile; avoids async popup blocking). */
export function openCaseDocumentUrl(url: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Reserve a tab during the click gesture, then navigate after async signing. */
export async function openCaseDocumentAfterSign(
  sign: () => Promise<string>,
): Promise<void> {
  const preOpened = window.open("about:blank", "_blank");
  try {
    const url = await sign();
    if (preOpened && !preOpened.closed) {
      preOpened.location.href = url;
      preOpened.focus();
      return;
    }
    openCaseDocumentUrl(url);
  } catch (e) {
    preOpened?.close();
    throw e;
  }
}
