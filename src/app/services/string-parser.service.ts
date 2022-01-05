import {Injectable} from '@angular/core';
import {hyperlinkRegex} from "../const/regexes";

@Injectable({
  providedIn: 'root'
})
export class StringParserService {
  convert(rawText?: string): string {
    if (!rawText) {
      return '';
    }

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
    return '<a href="' + link + '" target="_blank">' + link + '</a>';
  }
}
