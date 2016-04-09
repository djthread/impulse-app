import moment from "moment";

export class DateFormatValueConverter {
  toView(dt) {
    return moment(dt).format("YYYY-MM-DD");
  }
}
