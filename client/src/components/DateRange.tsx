import { useState, useEffect, forwardRef } from "react";
import { DateRangeProps, DateButtonInputProps } from "../datatypes/props";
import { handleDateSelect } from "../helpers/eventHandlers";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//////    Max window span, mirroring the server's clamp
const MAX_WINDOW_DAYS = 14;

const ymd = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

//////    Assign Current Date and maxDate Default
const currDate = new Date();
const minDate = ymd(currDate);
const maxDate = minDate;

export default function DateRange({ setUserData }: DateRangeProps) {
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = range;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  const options: object = { year: "numeric", month: "short", day: "2-digit" };
  const currDate = new Date().toLocaleDateString(undefined, options);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //////    Set Default Date Range State
  useEffect(() => {
    setUserData((prev) => ({
      ...prev,
      dateRange: { minDate, maxDate },
    }));
  }, [setUserData]);

  const handleDateChange = (e: [Date, Date]) => {
    let dateRange = {
      maxDate: "",
      minDate: "",
    };
    let next: [Date | null, Date | null] = e;

    // Clamp the span. The calendar also narrows its bounds as you pick, but
    // this covers click orders the bounds cannot (e.g. later date first).
    if (e[0] && e[1]) {
      const lo = e[0] <= e[1] ? e[0] : e[1];
      const hi = e[0] <= e[1] ? e[1] : e[0];
      const limit = addDays(lo, MAX_WINDOW_DAYS);
      if (hi > limit) next = [lo, limit];
    }

    setRange(next);

    if (next[0] && next[1])
      next.forEach((date, i) => {
        if (!date) return;
        if (i === 0) dateRange.minDate = ymd(date);
        if (i === 1) dateRange.maxDate = ymd(date);
      });
    handleDateSelect(dateRange, setUserData);
  };

  // Bounds follow the selection so any date stays reachable while the span
  // cannot exceed MAX_WINDOW_DAYS.
  const pickerMinDate = endDate ? addDays(endDate, -MAX_WINDOW_DAYS) : undefined;
  const pickerMaxDate = startDate ? addDays(startDate, MAX_WINDOW_DAYS) : undefined;

  const DateButtonInput = forwardRef<HTMLButtonElement, DateButtonInputProps>(
    ({ value, onClick }, ref) => (
      <button className="date-button-input" onClick={onClick} ref={ref}>
        {value ? value : currDate + " - set range"}
      </button>
    )
  );

  return (
    <DatePicker
      dateFormat={isMobile ? "yy-MM-dd" : "yyyy-MM-dd"}
      selectsRange={true}
      startDate={startDate}
      endDate={endDate}
      minDate={pickerMinDate}
      maxDate={pickerMaxDate}
      onChange={handleDateChange}
      customInput={<DateButtonInput />}
    />
  );
}
