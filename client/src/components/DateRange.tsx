import { useState, useEffect, forwardRef } from "react";
import { DateRangeProps, DateButtonInputProps } from "../datatypes/props";
import { handleDateSelect } from "../helpers/eventHandlers";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//////    Assign Current Date and maxDate Default
const currDate = new Date();
const minDate = `${currDate.getFullYear()}-${
  currDate.getMonth() + 1
}-${currDate.getDate()}`;
const maxDate = `${currDate.getFullYear()}-${
  currDate.getMonth() + 1
}-${currDate.getDate()}`;

export default function DateRange({ setUserData }: DateRangeProps) {
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = range;

  const options: object = { year: "numeric", month: "short", day: "2-digit" };
  const currDate = new Date().toLocaleDateString(undefined, options);

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
        if (i === 0) dateRange.minDate = `${yyyy1}-${mm1}-${dd1}`;
        if (i === 1) dateRange.maxDate = `${yyyy1}-${mm1}-${dd1}`;
      });
    handleDateSelect(dateRange, setUserData);
  };

  const DateButtonInput = forwardRef<HTMLButtonElement, DateButtonInputProps>(
    ({ value, onClick }, ref) => (
      <button className="date-button-input" onClick={onClick} ref={ref}>
        {value ? value : currDate + " - set range"}
      </button>
    ),
  );

  return (
    <DatePicker
      dateFormat="yyyy-MM-dd"
      selectsRange={true}
      startDate={startDate}
      endDate={endDate}
      onChange={handleDateChange}
      customInput={<DateButtonInput />}
    />
  );
}
