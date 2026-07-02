export function getElementInfo(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const area = {
    ox: Math.ceil(el.offsetLeft),
    oy: Math.ceil(el.offsetTop),
    width: Math.ceil(el.clientWidth),
    height: Math.ceil(el.clientHeight),
    rect: {
      width: Math.max(0, Math.floor(rect.width)),
      height: Math.max(0, Math.floor(rect.height)),
    },
  };
  const horizontal = {
    distanceFromTop: 0,
    distanceFromBottom: 0,
    distanceFromLeft: Math.ceil(el.scrollLeft),
    distanceFromRight: Math.ceil(el.scrollWidth - el.clientWidth - el.scrollLeft),
    width: Math.ceil(el.scrollWidth),
    height: Math.ceil(el.scrollHeight),
    isScrollStart: Math.ceil(el.scrollLeft) === 0,
    isScrollEnd: Math.ceil(el.clientWidth + el.scrollLeft) >= Math.ceil(el.scrollWidth),
    isScrollingLeft: false,
    isScrollingRight: false,
  };
  const vertical = {
    distanceFromTop: Math.ceil(el.scrollTop),
    distanceFromBottom: Math.ceil(el.scrollHeight - el.clientHeight - el.scrollTop),
    distanceFromLeft: 0,
    distanceFromRight: 0,
    height: Math.ceil(el.scrollHeight),
    width: Math.ceil(el.scrollWidth),
    isScrollStart: Math.ceil(el.scrollTop) === 0,
    isScrollEnd: Math.ceil(el.scrollTop + el.clientHeight) >= Math.ceil(el.scrollHeight),
    isScrollingTop: false,
    isScrollingBottom: false,
  };

  return {
    area,
    horizontal,
    vertical,
  };
}
