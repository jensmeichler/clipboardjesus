import {Injectable} from '@angular/core';
import {_blank, hyperlinkRegex} from "../const";

@Injectable({providedIn: 'root'})
export class StringParserService {
  /**
   * Determines whether the text contains an accessible link.
   * @param text The source text.
   */
  containsLink(text?: string): boolean {
    return !!text && hyperlinkRegex.test(text);
  }

  /**
   * Replaces all the links of the given string with html links
   * that are targeting a new browser window.
   * @param text The source text.
   */
  convert(text?: string): string {
    if (!text) return '';

    const placeholder = '{#0#}';
    let linkList: string[] = [];

    while (hyperlinkRegex.test(text)) {
      const link: any = hyperlinkRegex.exec(text)![0];
      linkList.push(link);
      text = text.replace(link, placeholder);
    }

    let i = 0;
    while (text.includes(placeholder)) {
      text = text.replace(placeholder, StringParserService.getAsHref(linkList[i++]))
    }

    return text;
  }

  private static getAsHref(link: string): string {
    const linkRef = link.startsWith('http') ? link : `https://${link}`;
    return `<a href="${linkRef}" target="${_blank}">${link}</a>`;
  }
}
