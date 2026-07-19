import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import type { TierId } from "@masjid-suite/shared-types";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  language?: "ms" | "en";
  currentTier?: TierId;
  onSelectTier: (tier: Exclude<TierId, "asas">) => void;
}

const targetTiers: Array<Exclude<TierId, "asas">> = ["maju", "gemilang", "istimewa"];

const copy = {
  ms: {
    title: "Naik Taraf Pelan",
    subtitle: "Pilih pelan yang sesuai untuk keperluan masjid anda.",
    cancel: "Batal",
    select: "Pilih",
    labels: {
      maju: "Maju",
      gemilang: "Gemilang",
      istimewa: "Istimewa",
    },
  },
  en: {
    title: "Upgrade Plan",
    subtitle: "Choose the plan that fits your mosque needs.",
    cancel: "Cancel",
    select: "Select",
    labels: {
      maju: "Maju",
      gemilang: "Gemilang",
      istimewa: "Istimewa",
    },
  },
};

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  open,
  onClose,
  language = "ms",
  currentTier = "asas",
  onSelectTier,
}) => {
  const content = copy[language];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="upgrade-modal-title"
    >
      <DialogTitle id="upgrade-modal-title">{content.title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {content.subtitle}
        </Typography>
        <Stack spacing={1.5}>
          {targetTiers.map((tier) => (
            <Box
              key={tier}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography fontWeight={600}>{content.labels[tier]}</Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => onSelectTier(tier)}
                disabled={currentTier === tier}
              >
                {content.select}
              </Button>
            </Box>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{content.cancel}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpgradeModal;
