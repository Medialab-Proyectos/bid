/**
 * Remove the asterisk from the label
 */
export function removeRequired(classToRemove: string): void {
  const labels = document.querySelectorAll(classToRemove);
  Array.from(labels).forEach((label) => {
    label.classList.remove('fi-kendo-label--required');
  });
}
