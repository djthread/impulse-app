import moment from "moment";

export class DateFormatValueConverter {
  toView(value, format) {
    if (!format) format = "YYYY-MM-DD";
    return moment(value).format(format);
  }
}
