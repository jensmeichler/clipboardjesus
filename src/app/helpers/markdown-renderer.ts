import {Renderer} from "marked";
import {_blank} from "@clipboardjesus/helpers";

/**
 * Get the markdown renderer.
 * @returns A renderer for the marked library.
 */
export function getMarkdownRenderer(): Renderer {
  const renderer = new Renderer();

  renderer.link = (href: string | null, title: string | null, text: string) => title
    ? `<a title="${title}" href="${href}" target="${_blank}">${text}</a>`
    : `<a href="${href}" target="${_blank}">${text}</a>`;

  renderer.options.breaks = true;

  return renderer;
}
