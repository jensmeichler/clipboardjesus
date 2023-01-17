/**
 * Matches for example #00ff00.
 * @returns The regex for valid rgb colors.
 */
export const colorRegex = new RegExp(/^#([a-fA-F\d]{8}|[a-fA-F\d]{6}|[a-fA-F\d]{3})$/);

/**
 * Matches for example www.clipboard.com.
 * @returns The regex for valid hyperlink.
 */
export const hyperlinkRegex = new RegExp(/((\s|^)(http|https):\/\/.*?(\s|$))|(www\..*?(\s|$))/);

/**
 * Matches for example <a href="https://www.clipboard.com">clipboard</a>.
 * @returns The regex which matches elements that contain html code.
 */
export const htmlRegex = new RegExp(/<[a-z]+?(-[a-z]+?)*?(\s.+?)*?>.*?<\/[a-z]+?(-[a-z]+?)*?>/ms);
