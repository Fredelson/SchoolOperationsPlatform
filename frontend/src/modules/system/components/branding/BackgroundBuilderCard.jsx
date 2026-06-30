// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Background Builder Card
// ============================================
//
// Purpose:
// Builds solid, linear, radial, and conic
// background settings for topbar/sidebar.
// ============================================

import {
  Box,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ColorPickerField from "./ColorPickerField";
import BackgroundPreview from "./BackgroundPreview";

const BACKGROUND_TYPES = [
  { value: "solid", label: "Solid Color" },
  { value: "linear", label: "Linear Gradient" },
  { value: "radial", label: "Radial Gradient" },
  { value: "conic", label: "Conic Gradient" },
];

const buildPreviewBackground = ({
  type,
  color,
  start,
  middle,
  end,
  direction,
  position,
}) => {
  if (type === "linear") {
    return middle
      ? `linear-gradient(${direction || "90deg"}, ${start}, ${middle}, ${end})`
      : `linear-gradient(${direction || "90deg"}, ${start}, ${end})`;
  }

  if (type === "radial") {
    return middle
      ? `radial-gradient(circle at ${position || "center"}, ${start}, ${middle}, ${end})`
      : `radial-gradient(circle at ${position || "center"}, ${start}, ${end})`;
  }

  if (type === "conic") {
    return middle
      ? `conic-gradient(from ${direction || "0deg"} at ${position || "center"}, ${start}, ${middle}, ${end}, ${start})`
      : `conic-gradient(from ${direction || "0deg"} at ${position || "center"}, ${start}, ${end}, ${start})`;
  }

  return color;
};

export default function BackgroundBuilderCard({
  title,
  description,
  typeField,
  colorField,
  startField,
  middleField,
  endField,
  directionField,
  positionField,
  form,
  updateBrandingField,
}) {
  const type = form.branding[typeField] || "solid";

  const previewBackground = buildPreviewBackground({
    type,
    color: form.branding[colorField],
    start: form.branding[startField],
    middle: form.branding[middleField],
    end: form.branding[endField],
    direction: form.branding[directionField],
    position: form.branding[positionField],
  });

  return (
    <Box>
      <Stack spacing={0.4}>
        <Typography variant="h6" fontWeight={900}>
          {title}
        </Typography>

        {description && (
          <Typography fontSize={14} color="text.secondary">
            {description}
          </Typography>
        )}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={2}>
        <TextField
          select
          label="Background Type"
          value={type}
          onChange={(e) => updateBrandingField(typeField, e.target.value)}
        >
          {BACKGROUND_TYPES.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <ColorPickerField
          label="Solid Color"
          value={form.branding[colorField]}
          onChange={(value) => updateBrandingField(colorField, value)}
        />

        {type !== "solid" && (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              <ColorPickerField
                label="Gradient Start"
                value={form.branding[startField]}
                onChange={(value) => updateBrandingField(startField, value)}
              />

              <ColorPickerField
                label="Gradient Middle Optional"
                value={form.branding[middleField]}
                onChange={(value) => updateBrandingField(middleField, value)}
              />

              <ColorPickerField
                label="Gradient End"
                value={form.branding[endField]}
                onChange={(value) => updateBrandingField(endField, value)}
              />

              <TextField
                label="Direction"
                value={form.branding[directionField] || ""}
                onChange={(e) =>
                  updateBrandingField(directionField, e.target.value)
                }
                helperText="Linear: 90deg / 180deg. Conic: 0deg / 180deg."
              />

              <TextField
                label="Position"
                value={form.branding[positionField] || ""}
                onChange={(e) =>
                  updateBrandingField(positionField, e.target.value)
                }
                helperText="Radial/Conic: center, top left, bottom right."
              />
            </Box>
          </>
        )}

        <BackgroundPreview label={`${title} Preview`} background={previewBackground} />
      </Stack>
    </Box>
  );
}
