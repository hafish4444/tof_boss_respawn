import React from 'react';

interface optionProps {
    label: string;
    value: string;
}

interface InputProps {
    id: string;
    onChange: any;
    value: string;
    label: string;
    options: Array<optionProps>;
}

const Input: React.FC<InputProps> = ({ id, onChange, value, label, options }) => {
    return (
        <div>
            <select
                id={id}
                value={value}
                onChange={onChange}
            >
                {options.map((option, index) => {
                    return <option key={index} value={option.value}>{option.label}</option>
                })}
            </select>
        </div>
    )
}

export default Input;