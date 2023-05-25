import React from 'react';
import chroma from 'chroma-js';

import Select, { StylesConfig, PropsValue } from 'react-select'

interface optionParentProps {
  label: string
  options: optionProps[]
}
interface optionProps {
  label: string
  value: string
}

interface InputProps {
    id: string
    onChange: any
    value: PropsValue<optionProps>
    label: string
    isMulti?: boolean
    options: Array<optionParentProps>
}

const dot = (color = 'transparent') => ({
    alignItems: 'center',
    display: 'flex'
});

const colorData = "#6346AA";
const color = chroma(colorData);

const colourStyles: StylesConfig<optionProps> = {
    control: (styles) => ({ ...styles, backgroundColor: '#6346AA', border: 0 }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
        return {
            ...styles,
            backgroundColor: isDisabled
                ? undefined
                : isSelected
                    ? colorData
                    : isFocused
                        ? color.alpha(0.1).css()
                        : undefined,
            color: isDisabled
                ? '#ccc'
                : isSelected
                    ? chroma.contrast(color, 'white') > 2
                        ? 'white'
                        : 'black'
                    : colorData,
            cursor: isDisabled ? 'not-allowed' : 'default',
            ':active': {
                ...styles[':active'],
                backgroundColor: !isDisabled
                    ? isSelected
                        ? colorData
                        : color.alpha(0.3).css()
                    : undefined,
            },
        };
    },
    input: (styles) => ({ ...styles, ...dot(), color: "#FFFFFF" }),
    placeholder: (styles) => ({ ...styles, color: "#CCCCCC" }),
    singleValue: (styles, { data }) => ({ ...styles, color: "#FFFFFF" }),
    dropdownIndicator: base => ({
      ...base,
      "svg": {
        fill: "#FFFFFF"
      }
    }),
    groupHeading: (provided) => ({
      ...provided,
      fontSize: '16px',
      color: 'purple',
    })
};

const SelectComponent: React.FC<InputProps> = ({ id, onChange, value, label, isMulti, options }) => {
    return (
        <div className='w-full'>
            <Select
                id={id}
                isMulti={isMulti}
                instanceId={id}
                defaultValue={value}
                onChange={onChange}
                options={options}
                placeholder={label}
                styles={colourStyles}
            />
        </div>
    )
}

export default SelectComponent;