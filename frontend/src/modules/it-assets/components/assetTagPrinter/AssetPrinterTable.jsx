// ============================================================
// ARAB UNITY SCHOOL OPERATIONS PLATFORM
// Asset Tag Printer Asset Selection Table
// ============================================================

import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { AppCard, AppEmptyState, AppLoadingState } from "../../../../platform/ui";

const valueFrom = (row, ...keys) => {
  for (const key of keys) {
    const value = row?.[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return "—";
};

export default function AssetPrinterTable({
  assets = [],
  selectedIds = [],
  loading = false,
  onToggle,
  onToggleAll,
}) {
  if (loading) {
    return <AppLoadingState title="Loading IT assets..." />;
  }

  if (!assets.length) {
    return (
      <AppCard>
        <AppEmptyState
          title="No assets found"
          message="Try changing your search or filters."
        />
      </AppCard>
    );
  }

  const pageIds = assets.map((asset) =>
    String(valueFrom(asset, "AssetId", "assetId"))
  );

  const allSelected =
    pageIds.length > 0 &&
    pageIds.every((assetId) => selectedIds.includes(assetId));

  return (
    <AppCard noPadding sx={{ overflowX: "auto" }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={allSelected}
                  indeterminate={
                    !allSelected &&
                    pageIds.some((assetId) => selectedIds.includes(assetId))
                  }
                  onChange={(event) =>
                    onToggleAll(pageIds, event.target.checked)
                  }
                />
              </TableCell>

              <TableCell>Asset Tag</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Brand / Model</TableCell>
              <TableCell>Serial Number</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {assets.map((asset) => {
              const assetId = String(
                valueFrom(asset, "AssetId", "assetId")
              );

              const assetTag = valueFrom(
                asset,
                "AssetTag",
                "assetTag",
                "AssetCode",
                "assetCode"
              );

              return (
                <TableRow
                  hover
                  key={assetId}
                  selected={selectedIds.includes(assetId)}
                  onClick={() => onToggle(asset)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(assetId)}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => onToggle(asset)}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={900}>
                      {assetTag}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {valueFrom(asset, "CategoryName", "categoryName")}
                  </TableCell>

                  <TableCell>
                    {valueFrom(asset, "BrandName", "brandName")}{" "}
                    {valueFrom(asset, "ModelName", "modelName")}
                  </TableCell>

                  <TableCell>
                    {valueFrom(
                      asset,
                      "SerialNumber",
                      "serialNumber",
                      "SerialIpMac",
                      "serialIpMac"
                    )}
                  </TableCell>

                  <TableCell>
                    {valueFrom(
                      asset,
                      "LocationName",
                      "locationName",
                      "RoomName",
                      "roomName"
                    )}
                  </TableCell>

                  <TableCell>
                    {valueFrom(asset, "StatusName", "statusName")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </AppCard>
  );
}