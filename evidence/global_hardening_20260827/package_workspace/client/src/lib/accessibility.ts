export function focusMainContent() {
  const content = document.getElementById("main-content");
  if (!(content instanceof HTMLElement)) return false;
  content.focus();
  return document.activeElement === content;
}
