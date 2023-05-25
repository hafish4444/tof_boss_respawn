import React from 'react';

interface InputProps {
  id: string;
  onChange?: any;
  value: string | number | undefined;
  label: string;
  type?: string;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({ id, onChange, value, label, type, disabled }) => {
  return (
    <div className={
          `relative w-full ${disabled ? "opacity-80" : ""}`
        }
      >
      <input
        onChange={onChange}
        value={value}
        type={type}
        id={id}
        className={`
          pt-[16px] 
          pb-[3px] 
          px-3
          text-white
          bg-[#6346AA]
          text-md 
          rounded-[4px]
          block
          appearance-none
          focus:outline-none
          focus:ring-0
          peer
          invalid:border-b-1
          w-full
          ${disabled ? "bg-[#6346AA90]" : ""}
        `}
        placeholder=" "
        disabled={disabled}
      />
      <label
        htmlFor={id}
        className="
            absolute 
            text-md
          text-[#CCCCCC]
            duration-150 
            transform 
            -translate-y-2
            scale-75 
            top-2
            z-8
            origin-[0] 
            left-3
            peer-placeholder-shown:scale-100 
            peer-placeholder-shown:translate-y-0 
            peer-focus:scale-75
            peer-focus:-translate-y-2
          "
        >
        {label}
      </label>
    </div>
  )
}

export default Input;