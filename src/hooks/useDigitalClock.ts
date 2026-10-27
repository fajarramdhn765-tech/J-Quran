import { useEffect, useState } from 'react';

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function useDigitalClock(timezone: string = 'Asia/Jakarta') {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time in target timezone
  let hours = '00';
  let minutes = '00';
  let seconds = '00';
  let dayName = 'Senin';
  let dateNumber = 1;
  let monthName = 'Januari';
  let yearNumber = 2026;

  try {
    const formatter = new Intl.DateTimeFormat('id-ID', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const parts = formatter.formatToParts(time);
    for (const part of parts) {
      if (part.type === 'hour') hours = part.value.padStart(2, '0');
      if (part.type === 'minute') minutes = part.value.padStart(2, '0');
      if (part.type === 'second') seconds = part.value.padStart(2, '0');
      if (part.type === 'weekday') dayName = part.value;
      if (part.type === 'day') dateNumber = parseInt(part.value, 10);
      if (part.type === 'month') monthName = part.value;
      if (part.type === 'year') yearNumber = parseInt(part.value, 10);
    }
  } catch {
    hours = time.getHours().toString().padStart(2, '0');
    minutes = time.getMinutes().toString().padStart(2, '0');
    seconds = time.getSeconds().toString().padStart(2, '0');
    dayName = DAYS_ID[time.getDay()];
    dateNumber = time.getDate();
    monthName = MONTHS_ID[time.getMonth()];
    yearNumber = time.getFullYear();
  }

  const timeString = `${hours}:${minutes}:${seconds}`;
  const timeShort = `${hours}:${minutes}`;
  const fullDateString = `${dayName}, ${dateNumber} ${monthName} ${yearNumber}`;

  return {
    rawDate: time,
    timeString,
    timeShort,
    fullDateString,
    dayName,
    dateNumber,
    monthName,
    yearNumber,
    hours,
    minutes,
    seconds,
  };
}
