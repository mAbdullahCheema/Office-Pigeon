import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownMenuProps {
  value?: string;
  onChange?: (value: string) => void;
  options?: string[];
  placeholder?: string;
  className?: string;
}

const App = ({
  value,
  onChange,
  options = ["Germany", "Canada", "United States", "Russia", "India"],
  placeholder = "Select",
  className = ""
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState(placeholder);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = value !== undefined ? value : internalSelected;

  const handleSelect = (option: string) => {
    if (onChange) {
      onChange(option);
    } else {
      setInternalSelected(option);
    }
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={`flex flex-col text-xs relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-4 py-3 border border-gray-100 bg-white text-gray-800 rounded-2xl shadow-xs hover:bg-gray-50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all flex items-center justify-between cursor-pointer"
      >
        <span className="font-medium">{selected}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {isOpen && (
        <ul className="absolute z-50 w-full bg-white border border-gray-100 rounded-2xl shadow-lg mt-1.5 py-1.5 overflow-hidden animate-fade-in max-h-60 overflow-y-auto">
          {options.map((option) => (
            <li
              key={option}
              className={`px-4 py-2.5 cursor-pointer transition-colors ${
                selected === option
                  ? "bg-cyan-600 text-white font-semibold"
                  : "text-gray-700 hover:bg-cyan-50 hover:text-cyan-900"
              }`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default App;
