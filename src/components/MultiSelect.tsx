import { useState, useEffect, useRef } from "react";

export default function MultiSelectDropdown({
  options,
  onChange,
  prompt = "Select one or more options",
}: any) {
  const [selectedOptions, setSelectedOptions] = useState<any>([]);
  const optionsListRef = useRef(null);

  const handleChange = (e: any) => {
    const isChecked = e.target.checked;
    const option = e.target.value;

    const selectedOptionSet = new Set<any>(selectedOptions);

    if (isChecked) {
      selectedOptionSet.add(option);
    } else {
      selectedOptionSet.delete(option);
    }

    const newSelectedOptions = Array.from(selectedOptionSet);

    setSelectedOptions(newSelectedOptions);
    onChange(newSelectedOptions);
  };

  return (
    <label className="relative text-2xl pt-4 pl-2">
      <input type="checkbox" className="hidden peer" />

      <div className="cursor-pointer after:content-['▼'] after:text-xs after:ml-1 after:inline-flex after:items-center peer-checked:after:-rotate-180 after:transition-transform inline-flex border rounded px-5 py-2">
        {prompt}
      </div>

      <div className="absolute bg-white border transition-opacity opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto w-full max-h-60 overflow-y-scroll">
        <ul ref={optionsListRef}>
          {options.map((option: any) => {
            return (
              <li key={option} className="!mb-0">
                <label
                  className={`!m-0 flex gap-3 whitespace-nowrap cursor-pointer px-2 py-1 transition-colors hover:bg-blue-100 [&:has(input:checked)]:bg-blue-200`}
                >
                  <input
                    defaultChecked
                    type="checkbox"
                    value={option}
                    className="!m-0 cursor-pointer"
                    onChange={handleChange}
                    checked={!selectedOptions.includes(option)}
                  />
                  <span className="ml-1">{option}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </label>
  );
}
