import {
  useController,
  Control,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  TextFieldProps,
  SelectProps,
  Autocomplete,
  Box,
} from "@mui/material";
import type { Database, MalaysianState } from "@masjid-suite/shared-types";

// Malaysian states for dropdown
const MALAYSIAN_STATES: MalaysianState[] = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Kuala Lumpur",
  "Labuan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Pulau Pinang",
  "Perak",
  "Perlis",
  "Putrajaya",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
];

// Address types
const ADDRESS_TYPES: Database["public"]["Enums"]["address_type"][] = [
  "home",
  "work",
  "other",
];

// User roles (for admin use)
const USER_ROLES: Database["public"]["Enums"]["user_role"][] = [
  "public",
  "registered",
  "masjid_admin",
  "super_admin",
];

// Generic form field props
interface BaseFormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
}

// Text field component with form integration
interface FormTextFieldProps<T extends FieldValues>
  extends BaseFormFieldProps<T> {
  type?: "text" | "email" | "tel" | "password" | "number";
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  textFieldProps?: Partial<TextFieldProps>;
}

export function FormTextField<T extends FieldValues>({
  name,
  control,
  label,
  required = false,
  disabled = false,
  helperText,
  type = "text",
  multiline = false,
  rows = 4,
  placeholder,
  textFieldProps,
}: FormTextFieldProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    ...(required && { rules: { required: `${label} is required` } }),
  });

  const textFieldPropsToPass = {
    ...field,
    label,
    type,
    required: required || false,
    disabled: disabled || false,
    error: !!error,
    helperText: error?.message || helperText,
    fullWidth: true,
    variant: "outlined" as const,
    ...(multiline && {
      multiline: true,
      ...(rows && { rows }),
    }),
    ...(placeholder && { placeholder }),
    ...textFieldProps,
  };

  return <TextField {...textFieldPropsToPass} />;
}

// Select field component with form integration
interface FormSelectFieldProps<T extends FieldValues>
  extends BaseFormFieldProps<T> {
  options: Array<{ value: string; label: string }>;
  selectProps?: Partial<SelectProps>;
}

export function FormSelectField<T extends FieldValues>({
  name,
  control,
  label,
  required = false,
  disabled = false,
  helperText,
  options,
  selectProps,
}: FormSelectFieldProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    ...(required && { rules: { required: `${label} is required` } }),
  });

  return (
    <FormControl fullWidth variant="outlined" error={!!error}>
      <InputLabel required={required}>{label}</InputLabel>
      <Select
        {...field}
        label={label}
        required={required}
        disabled={disabled}
        {...selectProps}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {(error?.message || helperText) && (
        <FormHelperText>{error?.message || helperText}</FormHelperText>
      )}
    </FormControl>
  );
}

// Autocomplete field component with form integration
interface FormAutocompleteFieldProps<T extends FieldValues>
  extends BaseFormFieldProps<T> {
  options: Array<{ value: string; label: string }>;
  freeSolo?: boolean;
}

export function FormAutocompleteField<T extends FieldValues>({
  name,
  control,
  label,
  required = false,
  disabled = false,
  helperText,
  options,
  freeSolo = false,
}: FormAutocompleteFieldProps<T>) {
  const {
    field: { onChange, value, ...field },
    fieldState: { error },
  } = useController({
    name,
    control,
    ...(required && { rules: { required: `${label} is required` } }),
  });

  return (
    <Autocomplete
      {...field}
      options={options}
      getOptionLabel={(option: { value: string; label: string } | string) =>
        typeof option === "string" ? option : option.label
      }
      value={options.find((option) => option.value === value) || null}
      onChange={(
        _,
        newValue: { value: string; label: string } | string | null
      ) => {
        onChange(
          typeof newValue === "string" ? newValue : newValue?.value || ""
        );
      }}
      freeSolo={freeSolo}
      disabled={disabled}
      renderInput={(params: any) => (
        <TextField
          {...(params as any)}
          label={label}
          required={required}
          error={!!error}
          helperText={error?.message || helperText}
          variant="outlined"
          fullWidth
        />
      )}
    />
  );
}

// Malaysian state selector
interface StateSelectProps<T extends FieldValues>
  extends BaseFormFieldProps<T> {}

export function StateSelect<T extends FieldValues>(props: StateSelectProps<T>) {
  const stateOptions = MALAYSIAN_STATES.map((state) => ({
    value: state,
    label: state,
  }));

  return <FormSelectField {...props} options={stateOptions} />;
}

// Address type selector
interface AddressTypeSelectProps<T extends FieldValues>
  extends BaseFormFieldProps<T> {}

export function AddressTypeSelect<T extends FieldValues>(
  props: AddressTypeSelectProps<T>
) {
  const addressTypeOptions = ADDRESS_TYPES.map((type) => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
  }));

  return <FormSelectField {...props} options={addressTypeOptions} />;
}

// User role selector (for admin use)
interface RoleSelectProps<T extends FieldValues>
  extends BaseFormFieldProps<T> {}

export function RoleSelect<T extends FieldValues>(props: RoleSelectProps<T>) {
  const roleOptions = USER_ROLES.map((role) => ({
    value: role,
    label: role
      .split("_")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  }));

  return <FormSelectField {...props} options={roleOptions} />;
}

// Phone number field with Malaysian formatting
interface PhoneFieldProps<T extends FieldValues>
  extends BaseFormFieldProps<T> {}

export function PhoneField<T extends FieldValues>(props: PhoneFieldProps<T>) {
  return (
    <FormTextField
      {...props}
      type="tel"
      placeholder="+60123456789 or 0123456789"
      textFieldProps={{
        inputProps: {
          pattern: "^(\\+60|0)[1-9][0-9]{7,9}$",
        },
      }}
    />
  );
}

// Postcode field with Malaysian formatting
interface PostcodeFieldProps<T extends FieldValues>
  extends BaseFormFieldProps<T> {}

export function PostcodeField<T extends FieldValues>(
  props: PostcodeFieldProps<T>
) {
  return (
    <FormTextField
      {...props}
      placeholder="50100"
      textFieldProps={{
        inputProps: {
          pattern: "^[0-9]{5}$",
          maxLength: 5,
        },
      }}
    />
  );
}

// Profile form component
interface ProfileFormData {
  full_name: string;
  phone_number?: string;
  email?: string;
}

interface ProfileFormProps {
  control: Control<ProfileFormData>;
}

export function ProfileForm({ control }: ProfileFormProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <FormTextField
        name="full_name"
        control={control}
        label="Full Name"
        required
      />
      <FormTextField
        name="email"
        control={control}
        label="Email Address"
        type="email"
      />
      <PhoneField name="phone_number" control={control} label="Phone Number" />
    </Box>
  );
}

// Address form component
interface AddressFormData {
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: MalaysianState;
  postcode: string;
  address_type: Database["public"]["Enums"]["address_type"];
}

interface AddressFormProps {
  control: Control<AddressFormData>;
}

export function AddressForm({ control }: AddressFormProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <FormTextField
        name="address_line_1"
        control={control}
        label="Address Line 1"
        required
      />
      <FormTextField
        name="address_line_2"
        control={control}
        label="Address Line 2"
      />
      <FormTextField name="city" control={control} label="City" required />
      <StateSelect name="state" control={control} label="State" required />
      <PostcodeField
        name="postcode"
        control={control}
        label="Postcode"
        required
      />
      <AddressTypeSelect
        name="address_type"
        control={control}
        label="Address Type"
        required
      />
    </Box>
  );
}
