import {Injectable} from '@angular/core';
import {_blank, hyperlinkRegex} from "../const";

@Injectable({providedIn: 'root'})
export class StringParserService {
  /**
   * Replaces all the links of the given string with html links
   * that are targeting a new browser window.
   * @param rawText The source text.
   */
  convert(rawText?: string): string {
    if (!rawText) return '';

    const placeholder = '{#0#}';
    let linkList: string[] = [];

    while (hyperlinkRegex.test(rawText)) {
      const link: any = hyperlinkRegex.exec(rawText)![0];
      linkList.push(link);
      rawText = rawText.replace(link, placeholder);
    }

    let i = 0;
    while (rawText.includes(placeholder)) {
      rawText = rawText.replace(placeholder, StringParserService.getAsHref(linkList[i++]))
    }

    return rawText;
  }

  private static getAsHref(link: string): string {
    const linkRef = link.startsWith('http') ? link : `https://${link}`;
    return `<a href="${linkRef}" target="${_blank}">${link}</a>`;
  }
}
