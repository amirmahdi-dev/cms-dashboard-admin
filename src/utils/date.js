import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

// get milady date
const normalizeDate = input => {
  if (!input) return moment();

  if (typeof input === "number") {
    return input.toString().length === 10
      ? moment.unix(input)
      : moment(input);
  }

  return moment(input);
};

// to jalali
export const formatJalali = date => normalizeDate(date).format("jYYYY/jMM/jDD");

// to jalali withe time
export const formatJalaliDateTime = date => normalizeDate(date).format("jYYYY/jMM/jDD HH:mm");

// full jalali date
export const formatFullJalali = date => normalizeDate(date).format("dddd jD jMMMM jYYYY");

// jalali to milady
export const jalaliToGregorian = jalaliDate => moment(jalaliDate, "jYYYY/jMM/jDD").format("YYYY/MM/DD");

// to timeStamp
export const jalaliToTimestamp = (date, withTime = false) => {
  const format = withTime
    ? "jYYYY/jMM/jDD HH:mm"
    : "jYYYY/jMM/jDD";

  return moment(date, format).valueOf();
};
