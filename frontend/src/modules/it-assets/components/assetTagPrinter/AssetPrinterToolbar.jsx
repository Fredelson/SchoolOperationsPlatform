// ============================================================
// ARAB UNITY SCHOOL OPERATIONS PLATFORM
// Asset Tag Printer Toolbar
// ============================================================
//
// Purpose:
// Controls asset searching, A4 label layout selection,
// visible label elements, selection clearing, and printing.
//
// Supported layouts come directly from ASSET_LABEL_LAYOUTS.
// This means new layouts automatically appear in the dropdown.
// ============================================================

import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import ClearAllOutlinedIcon from "@mui/icons-material/ClearAllOutlined";

import { AppButton, AppCard } from "../../../../platform/ui";

import { ASSET_LABEL_LAYOUTS } from "../labels/AssetLabelGrid";

export default function AssetPrinterToolbar({
  search = "",
  layoutKey = "4x7",
  options = {},
  selectedCount = 0,
  onSearchChange,
  onLayoutChange,
  onOptionChange,
  onClearSelection,
  onPrint,
}) {
  const currentLayout =
    ASSET_LABEL_LAYOUTS[layoutKey] ||
    ASSET_LABEL_LAYOUTS["4x7"];

  return (
    <AppCard>
      <Stack spacing={2.5}>
        {/* ====================================================
            Search and Layout
        ==================================================== */}

        <Stack
          direction={{
            xs: "column",
            lg: "row",
          }}
          spacing={2}
          alignItems={{
            xs: "stretch",
            lg: "center",
          }}
        >
          <TextField
            size="small"
            fullWidth
            label="Search assets"
            placeholder="Asset tag, serial number, category, model, location..."
            value={search}
            onChange={(event) =>
              onSearchChange?.(event.target.value)
            }
          />

          <FormControl
            size="small"
            fullWidth
            sx={{
              minWidth: {
                xs: "100%",
                lg: 230,
              },
              maxWidth: {
                xs: "100%",
                lg: 280,
              },
            }}
          >
            <InputLabel id="asset-label-layout-label">
              Label layout
            </InputLabel>

            <Select
              labelId="asset-label-layout-label"
              label="Label layout"
              value={layoutKey}
              onChange={(event) =>
                onLayoutChange?.(event.target.value)
              }
            >
              {Object.values(ASSET_LABEL_LAYOUTS).map(
                (layout) => (
                  <MenuItem
                    key={layout.key}
                    value={layout.key}
                  >
                    {layout.label} — {layout.capacity} per page
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
        </Stack>

        {/* ====================================================
            Selected Layout Summary
        ==================================================== */}

        <Box
          sx={{
            px: 1.5,
            py: 1,
            borderRadius: 2,
            bgcolor: "action.hover",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Current layout:{" "}
            <Box
              component="span"
              sx={{
                color: "text.primary",
                fontWeight: 900,
              }}
            >
              {currentLayout.label}
            </Box>
            {" · "}
            {currentLayout.columns} columns ×{" "}
            {currentLayout.rows} rows
            {" · "}
            {currentLayout.capacity} labels per A4 page
          </Typography>
        </Box>

        {/* ====================================================
            Label Options and Actions
        ==================================================== */}

        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          alignItems={{
            xs: "stretch",
            md: "center",
          }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              columnGap: 0.5,
              rowGap: 0.5,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(options.showQrCode)}
                  onChange={(event) =>
                    onOptionChange?.(
                      "showQrCode",
                      event.target.checked
                    )
                  }
                />
              }
              label="QR code"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(options.showBarcode)}
                  onChange={(event) =>
                    onOptionChange?.(
                      "showBarcode",
                      event.target.checked
                    )
                  }
                />
              }
              label="Barcode"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(options.showLogo)}
                  onChange={(event) =>
                    onOptionChange?.(
                      "showLogo",
                      event.target.checked
                    )
                  }
                />
              }
              label="School logo"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(options.showBorder)}
                  onChange={(event) =>
                    onOptionChange?.(
                      "showBorder",
                      event.target.checked
                    )
                  }
                />
              }
              label="Cutting border"
            />
          </Box>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1}
            sx={{
              width: {
                xs: "100%",
                md: "auto",
              },
            }}
          >
            <AppButton
              variant="outlined"
              startIcon={<ClearAllOutlinedIcon />}
              disabled={!selectedCount}
              onClick={onClearSelection}
              sx={{
                width: {
                  xs: "100%",
                  sm: "auto",
                },
              }}
            >
              Clear selection
            </AppButton>

            <AppButton
              startIcon={<PrintOutlinedIcon />}
              disabled={!selectedCount}
              onClick={onPrint}
              sx={{
                width: {
                  xs: "100%",
                  sm: "auto",
                },
              }}
            >
              Print
              {selectedCount
                ? ` ${selectedCount} label${
                    selectedCount === 1 ? "" : "s"
                  }`
                : ""}
            </AppButton>
          </Stack>
        </Stack>
      </Stack>
    </AppCard>
  );
}