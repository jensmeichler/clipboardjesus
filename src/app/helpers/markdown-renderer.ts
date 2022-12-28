import {Renderer} from "marked";
import {_blank} from "@clipboardjesus/helpers";

export function getMarkdownRenderer(): Renderer {
  const renderer = new Renderer();

  renderer.link = (href: string | null, title: string | null, text: string) => {
    if (!title) {
      return `<a href="${href}" target="${_blank}">${text}</a>`;
    }
    return `<a title="${title}" href="${href}" target="${_blank}">${text}</a>`;
  };
  renderer.options.breaks = true;
  renderer.text = (text: string) => {
    while (text.match(/^(&nbsp;)*?\s+/)) {
      text = text.replace(' ', '&nbsp;');
    }
    return text;
  }

  return renderer;
}
