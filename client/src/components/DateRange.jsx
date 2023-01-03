import { useState, forwardRef } from 'react';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DateRange(props) {

    const [range, setRange] = useState([null, null]);
    const [startDate, endDate] = range;

    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    const currDate = new Date().toLocaleDateString(undefined, options);

    const handleDateChange = e => {
        let dateRange = {};
        setRange(e);

        if (e[0] && e[1]) e.forEach((date, i) => {
            const yyyy1 = date.toString().split(' ')[3];
            const mmStr1 = date.toString().split(' ')[1];
            const mm1 = new Date(Date.parse(mmStr1 + "1,2023")).getMonth() + 1;
            const dd1 = date.toString().split(' ')[2];
            if (i === 0) dateRange.minDate = `${yyyy1}-${mm1}-${dd1}`;
            if (i === 1) dateRange.maxDate = `${yyyy1}-${mm1}-${dd1}`;
        });
        props.handleDateSelect(dateRange);
    };


    const DateButtonInput = forwardRef(({ value, onClick }, ref) => (
        <button className="date-button-input"
            onClick={onClick}
            ref={ref}
        >
            {value ? value : currDate + ' - set range'}
        </button>
    ));
    return (
        <DatePicker
            dateFormat="yyyy-MM-dd"
            selectsRange={true}
            // selected={new Date()}
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
            // onSelect={props.handleDateSelect}
            customInput={<DateButtonInput />}
        />
    );
}