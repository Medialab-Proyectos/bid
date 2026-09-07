export function getFieldValue(
  name: string,
  container: ContainerType = document
): string {
  return (
    container.querySelector(
      `[data-testid="${name}"] .k-input`
    ) as HTMLInputElement
  ).value;
}

export function getDropDownFieldValue(
  name: string,
  container: ContainerType = document
): string {
  return container
    .querySelector(`[data-testid="${name}"] .k-input`)
    ?.textContent?.trim();
}

export function getTextAreaFieldValue(
  name: string,
  container: ContainerType = document
): string {
  return (
    container.querySelector(`[data-testid="${name}"]`) as HTMLInputElement
  ).value;
}

export function getRadioFieldValue(
  name: string,
  container: ContainerType = document
): boolean {
  return (
    container.querySelector(`[data-testid="${name}"]`) as HTMLInputElement
  ).checked;
}

type ContainerType = Document | HTMLElement;
