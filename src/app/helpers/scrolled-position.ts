/**
 * Gets the scrolled position of the tab within the page.
 */
export const scrolledPosition = (): {top: number, left: number} => {
  const tabBody = document.documentElement.getElementsByClassName('mat-tab-body-active')[0];
  const top = tabBody.scrollTop ?? 0;
  const left = tabBody.scrollLeft ?? 0;
  return {top, left};
}
