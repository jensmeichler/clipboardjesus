export const getTimeStamp: () => string = () => {
  const setLeadingZero = (value: number): string => {
    return ('0' + value).slice(-2);
  }

  const date = new Date();
  const yyyy = date.getFullYear();
  const MM = setLeadingZero(date.getMonth() + 1);
  const dd = setLeadingZero(date.getDate());
  const HH = setLeadingZero(date.getHours());
  const mm = setLeadingZero(date.getMinutes());
  const ss = setLeadingZero(date.getSeconds());
  return `${yyyy}-${MM}-${dd}_${HH}-${mm}-${ss}`;
}
