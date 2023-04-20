import React from 'react';

interface InputProps {
  id: string;
  onChange: any;
  value: string | number;
  label: string;
  type?: string;
}

const Input: React.FC<InputProps> = ({ id, onChange, value, label, type }) => {
  return (
    <div className="relative w-full">
      <input
        onChange={onChange}
        value={value}
        type={type}
        id={id}
        className="
          pt-[14px] 
          pb-[2px] 
          px-3
          text-[#EFEFEF]
          bg-[#785CBC]
          text-md 
          rounded-[4px]
          block
          appearance-none
          focus:outline-none
          focus:ring-0
          peer
          invalid:border-b-1
          w-full
        "
        placeholder=" "
      />
      <label
        htmlFor={id}
        className="
            absolute 
            text-md
          text-[#CCCCCC]
            duration-150 
            transform 
            -translate-y-3 
            scale-75 
            top-2
            z-8
            origin-[0] 
            left-3
            peer-placeholder-shown:scale-100 
            peer-placeholder-shown:translate-y-0 
            peer-focus:scale-75
            peer-focus:-translate-y-3
          "
        >
        {label}
      </label>
    </div>
  )
}

export default Input;