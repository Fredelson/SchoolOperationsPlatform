import { useEffect, useRef, useState } from "react";
import { Box, alpha, useTheme } from "@mui/material";
import { useLocation } from "react-router-dom";

import { usePermissions } from "../../context/PermissionContext";
import useBranding from "../../modules/system/hooks/useBranding";
import { updateSystemBranding } from "../../modules/system/services/brandingService";
import { normalizeFloatingLogoLayout } from "../../modules/system/utils/floatingLogoLayout";
import buildFileUrl from "../utils/buildFileUrl";

export default function FloatingBrandLogo() {
  const theme = useTheme();
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const { branding, setBranding } = useBranding();
  const interactionRef = useRef(null);
  const draftRef = useRef(null);
  const [draft, setDraft] = useState(() =>
    normalizeFloatingLogoLayout(branding?.branding)
  );

  const canEdit =
    location.pathname.startsWith("/system/branding");
  const brand = branding?.branding || {};
  const logoUrl = buildFileUrl(brand.logoPath || brand.smallLogoPath || "");

  const setDraftLayout = (layout) => {
    const normalized = normalizeFloatingLogoLayout(layout);
    draftRef.current = normalized;
    setDraft(normalized);
    return normalized;
  };

  useEffect(() => {
    if (interactionRef.current) return;
    setDraftLayout({
      floatingLogoX: brand.floatingLogoX,
      floatingLogoY: brand.floatingLogoY,
      floatingLogoSize: brand.floatingLogoSize,
    });
  }, [brand.floatingLogoSize, brand.floatingLogoX, brand.floatingLogoY]);

  useEffect(() => {
    const handleResize = () => {
      if (interactionRef.current) return;
      setDraftLayout({
        floatingLogoX: draftRef.current?.x ?? draft.x,
        floatingLogoY: draftRef.current?.y ?? draft.y,
        floatingLogoSize: draftRef.current?.size ?? draft.size,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [draft.size, draft.x, draft.y]);

  const persistLayout = async (layout) => {
    if (!branding) return;

    const previousBranding = branding;
    const nextBrand = {
      ...brand,
      floatingLogoX: layout.x,
      floatingLogoY: layout.y,
      floatingLogoSize: layout.size,
    };

    setBranding({
      ...branding,
      branding: nextBrand,
    });

    try {
      const saved = await updateSystemBranding({
        school: branding.school,
        branding: nextBrand,
      });

      if (saved) setBranding(saved);
    } catch (error) {
      console.error("Failed to save floating logo layout.", error);
      setBranding(previousBranding);
      setDraftLayout({
        floatingLogoX: previousBranding.branding?.floatingLogoX,
        floatingLogoY: previousBranding.branding?.floatingLogoY,
        floatingLogoSize: previousBranding.branding?.floatingLogoSize,
      });
    }
  };

  const beginInteraction = (event) => {
    if (!canEdit || (event.button !== undefined && event.button !== 0)) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    interactionRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startLayout: draftRef.current || draft,
    };
  };

  const handlePointerMove = (event) => {
    const interaction = interactionRef.current;
    if (!interaction || interaction.pointerId !== event.pointerId) return;

    event.preventDefault();
    event.stopPropagation();

    const deltaX = event.clientX - interaction.startClientX;
    const deltaY = event.clientY - interaction.startClientY;
    const start = interaction.startLayout;

    setDraftLayout({
      floatingLogoX: start.x + deltaX,
      floatingLogoY: start.y + deltaY,
      floatingLogoSize: start.size,
    });
  };

  const finishInteraction = (event) => {
    if (interactionRef.current?.pointerId !== event.pointerId) return;

    interactionRef.current = null;
    persistLayout(draftRef.current || draft);
  };

  const handleKeyDown = (event) => {
    if (!canEdit) return;

    const step = event.shiftKey ? 10 : 2;
    const offsets = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const offset = offsets[event.key];

    if (offset) {
      event.preventDefault();
      const next = setDraftLayout({
        floatingLogoX: draft.x + offset[0],
        floatingLogoY: draft.y + offset[1],
        floatingLogoSize: draft.size,
      });
      persistLayout(next);
    }
  };

  if (!logoUrl) return null;

  return (
    <Box
      role={canEdit ? "button" : undefined}
      tabIndex={canEdit ? 0 : -1}
      aria-label={canEdit ? "Move floating school logo" : undefined}
      onKeyDown={handleKeyDown}
      onPointerDown={beginInteraction}
      onPointerMove={handlePointerMove}
      onPointerUp={finishInteraction}
      onPointerCancel={finishInteraction}
      sx={{
        position: "fixed",
        left: draft.x,
        top: draft.y,
        width: draft.size,
        height: draft.size,
        zIndex: 1301,
        boxSizing: "border-box",
        bgcolor: "background.paper",
        border: "2px solid",
        borderColor: alpha(theme.palette.text.primary, 0.16),
        borderRadius: "50%",
        boxShadow: theme.shadows[4],
        cursor: canEdit ? "grab" : "default",
        touchAction: "none",
        userSelect: "none",
        pointerEvents: canEdit ? "auto" : "none",
        outline: "none",
        "&:active": {
          cursor: canEdit ? "grabbing" : "default",
        },
        "&:focus-visible": {
          boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.25)}, ${theme.shadows[4]}`,
        },
      }}
    >
      <Box
        component="img"
        src={logoUrl}
        alt="School logo"
        draggable={false}
        sx={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "contain",
          boxSizing: "border-box",
          borderRadius: "50%",
          p: 0.75,
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}
