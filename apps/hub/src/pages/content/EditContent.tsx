import React from "react";
import { Navigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import { LoginOutlined, HowToReg } from "@mui/icons-material";
import { useUser } from "@masjid-suite/auth";
import { useTranslation } from "@masjid-suite/i18n";

/**
 * EditContent component
 * Redirects unauthenticated users with helpful message per T042 [US1]
 *
 * Task: T042 [US1] - Add "Please register/login to manage content" redirect
 * when unauthenticated users attempt edit
 */
const EditContent: React.FC = () => {
  const user = useUser();
  const { t } = useTranslation();

  // If authenticated, proceed to edit (actual implementation would go here)
  if (user) {
    // TODO: Implement actual edit functionality when needed
    // For now, redirect to My Content page
    return <Navigate to="/content/my-content" replace />;
  }

  // Unauthenticated: Show helpful message per T042 requirements
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: "primary.main",
              mb: 2,
            }}
          >
            {t("content.auth_required_title")}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            paragraph
            sx={{ mb: 3 }}
          >
            {t("content.auth_required_message")}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Stack
            spacing={2}
            direction={{ xs: "column", sm: "row" }}
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<HowToReg />}
              href="/auth/signup"
              sx={{
                minWidth: 180,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {t("auth.register")}
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<LoginOutlined />}
              href="/auth/signin"
              sx={{
                minWidth: 180,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {t("auth.login")}
            </Button>
          </Stack>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.disabled">
              {t("content.auth_required_benefits")}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default EditContent;
