import { useState, useEffect, forwardRef } from "react";
import { DateRangeProps, DateButtonInputProps } from "../datatypes/props";
import { handleDateSelect } from "../helpers/eventHandlers";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//////    Max selectable window, mirroring the server's clamp
const MAX_WINDOW_DAYS = 14;

const ymd = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

//////    Assign Current Date and maxDate Default
const today = new Date();
const minDate = ymd(today);
const maxDate = minDate;

//////    Latest selectable end date
const maxSelectableDate = new Date(today);
maxSelectableDate.setDate(maxSelectableDate.getDate() + MAX_WINDOW_DAYS);

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
    setRange(e);

    if (e[0] && e[1])
      e.forEach((date, i) => {
        const yyyy1 = date.toString().split(" ")[3];
        const mmStr1 = date.toString().split(" ")[1];
        const mm1 = new Date(Date.parse(mmStr1 + "1,2023")).getMonth() + 1;
        const dd1 = date.toString().split(" ")[2];
        if (i === 0) {
          dateRange.minDate = `${yyyy1}-${mm1}-${dd1}`;
        }
        if (i === 1) {
          dateRange.maxDate = `${yyyy1}-${mm1}-${dd1}`;
        }
      });
    handleDateSelect(dateRange, setUserData);
  };

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
      minDate={today}
      maxDate={maxSelectableDate}
      onChange={handleDateChange}
      customInput={<DateButtonInput />}
    />
  );
}
