/**
 * Gets the material icon name from the file type.
 */
export function getMatIconFromFileType(fileType: string | null): string {
  switch (fileType) {
    // pdf documents
    case 'application/pdf':
      return 'picture_as_pdf';
    // word documents
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
    case 'application/vnd.oasis.opendocument.text':
      return 'description';
    // excel documents
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.ms-excel':
    case 'application/vnd.oasis.opendocument.spreadsheet':
      return 'grid_on';
    // powerpoint presentations
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    case 'application/vnd.ms-powerpoint':
    case 'application/vnd.oasis.opendocument.presentation':
      return 'slideshow';
    // audio files
    case 'audio/mpeg':
    case 'audio/ogg':
    case 'audio/wav':
    case 'audio/x-wav':
    case 'audio/x-pn-wav':
    case 'audio/webm':
    case 'audio/aac':
    case 'audio/aacp':
      return 'audiotrack';
    // video files
    case 'video/mp4':
    case 'video/ogg':
    case 'video/webm':
    case 'video/quicktime':
      return 'video_library';
    // archive files
    case 'application/zip':
    case 'application/x-7z-compressed':
    case 'application/x-rar-compressed':
    case 'application/x-tar':
    case 'application/x-gzip':
      return 'archive';
    // code files
    case 'text/css':
    case 'text/html':
    case 'text/javascript':
    case 'text/plain':
    case 'text/xml':
    case 'application/json':
    case 'application/xml':
    case 'application/x-httpd-php':
    case 'application/x-sh':
    case 'application/x-shellscript':
    case 'application/x-perl':
    case 'application/x-ruby':
    case 'application/x-python':
    case 'application/x-java':
    case 'application/x-c':
    case 'application/x-c++':
    case 'application/x-csharp':
    case 'application/x-go':
    case 'application/x-rust':
    case 'application/x-sql':
    case 'application/x-yaml':
      return 'code';
    // text files
    case 'text/rtf':
    case 'text/richtext':
    case 'text/csv':
    case 'text/tab-separated-values':
      return 'text_fields';
    // executable files
    case 'application/x-msdownload':
    case 'application/x-msdos-program':
    case 'application/x-msi':
    case 'application/x-ms-shortcut':
    case 'application/x-ms-wmd':
    case 'application/x-ms-wmz':
    case 'application/x-ms-xbap':
    case 'application/x-msaccess':
    case 'application/x-msbinder':
    case 'application/x-mscardfile':
    case 'application/x-msclip':
    case 'application/x-msmediaview':
    case 'application/x-msmetafile':
    case 'application/x-mspublisher':
    case 'application/x-msschedule':
    case 'application/x-msterminal':
    case 'application/x-mswrite':
      return 'build';
    // image files
    case 'image/bmp':
    case 'image/gif':
    case 'image/jpeg':
    case 'image/png':
    case 'image/svg+xml':
    case 'image/tiff':
    case 'image/webp':
      return 'image';
    // font files
    case 'application/font-woff':
    case 'application/font-woff2':
    case 'application/vnd.ms-fontobject':
    case 'application/x-font-ttf':
    case 'application/x-font-opentype':
    case 'application/x-font-truetype':
    case 'application/x-font-type1':
    case 'application/x-font-pcf':
    case 'application/x-font-bdf':
    case 'application/x-font-linux-psf':
    case 'application/x-font-snf':
    case 'application/x-font-speedo':
    case 'application/x-font-sunos-news':
    case 'application/x-font-ghostscript':
    case 'application/x-font-otf':
    case 'application/x-font-afm':
      return 'font_download';
    // other files
    default:
      return 'insert_drive_file';
  }
}
