import moment from 'moment';
import { useState, useEffect } from 'react';

export default function NowDate() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => {
      clearInterval(interval);
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div>
        <div className="text-white">Now: {moment(time).format("hh:mm:ss")}</div>
    </div>
  )
}