// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Shared UI - AppFormField
// ============================================
//
// Purpose:
// Reusable enterprise form field component.
//
// Supports:
// • Text
// • Multiline
// • Select
// • Single Autocomplete
// • Multiple Autocomplete
//
// Used by:
// • IT Assets
// • Users
// • Widgets
// • Menus
// • Buttons
// • Feature Flags
// • Future enterprise modules
//
// ============================================

import { Autocomplete, MenuItem, TextField } from "@mui/material";

/**
 * Safely returns the option value.
 */
const getOptionValue = (option, valueKey) => {
  if (!option) return "";
  return option[valueKey];
};

/**
 * Safely returns the option label.
 */
const getOptionLabel = (option, labelKey) => {
  if (!option) return "";
  return option[labelKey] ?? "";
};

export default function AppFormField({
  type = "text",
  label,
  value = "",
  onChange,
  options = [],
  valueKey = "id",
  labelKey = "name",
  required = false,
  disabled = false,
  multiline = false,
  minRows = 3,
  full = false,
  helperText = "",
  multiple = false,
  inputType = "text",
  size = "medium",
}) {
  // Full-width field inside AppDialogForm grid
  const gridColumn = full
    ? {
        xs: "1",
        md: "1 / -1",
      }
    : undefined;

  // ============================================
  // SELECT
  // ============================================

  if (type === "select") {
    return (
      <TextField
        select
        fullWidth
        label={label}
        value={value}
        size={size}
        required={required}
        disabled={disabled}
        helperText={helperText}
        sx={{ gridColumn }}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => {
          const optionValue = getOptionValue(option, valueKey);
          const optionLabel = getOptionLabel(option, labelKey);

          return (
            <MenuItem key={optionValue} value={optionValue}>
              {optionLabel || optionValue}
            </MenuItem>
          );
        })}
      </TextField>
    );
  }

  // ============================================
  // AUTOCOMPLETE
  // ============================================

  if (type === "autocomplete") {
    /**
     * Resolve selected value(s)
     * from IDs stored in the model.
     */

    const selected = multiple
      ? options.filter((option) =>
          (value || [])
            .map(String)
            .includes(String(getOptionValue(option, valueKey)))
        )
      : options.find(
          (option) =>
            String(getOptionValue(option, valueKey)) === String(value)
        ) || null;

    return (
      <Autocomplete
        multiple={multiple}
        size={size}
        options={options}
        value={selected}
        disabled={disabled}
        filterSelectedOptions
        isOptionEqualToValue={(option, selectedOption) =>
          String(getOptionValue(option, valueKey)) ===
          String(getOptionValue(selectedOption, valueKey))
        }
        getOptionLabel={(option) => getOptionLabel(option, labelKey)}
        sx={{ gridColumn }}
        onChange={(_, selectedOption) => {
          if (multiple) {
            const ids = (selectedOption || []).map((item) =>
              getOptionValue(item, valueKey)
            );

            onChange(ids, selectedOption);
            return;
          }

          onChange(
            selectedOption
              ? getOptionValue(selectedOption, valueKey)
              : "",
            selectedOption
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            size={size}
            required={required}
            helperText={helperText}
          />
        )}
      />
    );
  }

  // ============================================
  // DEFAULT TEXT FIELD
  // ============================================

  return (
    <TextField
      type={inputType}
      fullWidth
      label={label}
      value={value}
      size={size}
      required={required}
      disabled={disabled}
      multiline={multiline}
      minRows={multiline ? minRows : undefined}
      helperText={helperText}
      sx={{ gridColumn }}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
