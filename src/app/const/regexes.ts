export const colorRegex = new RegExp(/^#([a-fA-F0-9]{8}|[a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/);
export const hyperlinkRegex = new RegExp(/((\s|^)(http|https):\/\/.*?(\s|$))|(www\..*?(\s|$))/);
export const htmlRegex = new RegExp(/<[a-z]+?(-[a-z]+?)*?(\s.+?)*?>.*?<\/[a-z]+?(-[a-z]+?)*?>/ms);
