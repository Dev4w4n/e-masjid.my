import { ReactNode } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

interface DatePickerProviderProps {
  children: ReactNode;
}

/**
 * Date picker localization provider component
 * Wraps children with MUI X Date Pickers LocalizationProvider
 * Uses date-fns as the date adapter
 *
 * Usage:
 * ```tsx
 * import { DatePickerProvider } from './components/DatePickerProvider';
 * import { DatePicker } from '@mui/x-date-pickers/DatePicker';
 *
 * function MyComponent() {
 *   return (
 *     <DatePickerProvider>
 *       <DatePicker label="Select date" />
 *     </DatePickerProvider>
 *   );
 * }
 * ```
 */
export function DatePickerProvider({ children }: DatePickerProviderProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {children}
    </LocalizationProvider>
  );
}

export default DatePickerProvider;
