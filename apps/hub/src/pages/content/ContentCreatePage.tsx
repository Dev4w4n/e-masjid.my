/**
 * ContentCreatePage Component
 *
 * Page for creating new content submissions with form validation,
 * file upload support, and integration with content management services.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Alert,
  Breadcrumbs,
  Link,
  Container,
  Button,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { useAuth } from "@masjid-suite/auth";

// Import directly from the package dist
// import {
//   ContentForm,
//   type ContentFormData,
// } from '@masjid-suite/content-management';

// Temporary placeholder for form data
interface ContentFormData {
  title: string;
  description?: string;
  type: string;
  url: string;
  masjidId: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Content creation page with form integration
 */
const ContentCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle form submission (placeholder)
  const handleSubmit = async (formData: ContentFormData) => {
    if (!user) {
      setError("You must be logged in to create content");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // TODO: Implement actual content creation with content-management package
      console.log("Content submission:", formData);

      setSuccess(true);

      // Redirect to content list after successful creation
      setTimeout(() => {
        navigate("/content/my-content");
      }, 2000);
    } catch (err) {
      console.error("Content creation failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while creating content"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle form cancellation
  const handleCancel = () => {
    navigate("/content/my-content");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs>
          <Link
            color="inherit"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Link
            color="inherit"
            href="/content/my-content"
            onClick={(e) => {
              e.preventDefault();
              navigate("/content/my-content");
            }}
          >
            My Content
          </Link>
          <Typography color="text.primary">Create New Content</Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleCancel}
            sx={{ mr: 2 }}
          >
            Back to My Content
          </Button>
        </Box>

        <Typography variant="h4" component="h1" gutterBottom>
          Create New Content
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Submit new content for approval and display at your masjid. All
          content will be reviewed by masjid administrators before being
          displayed.
        </Typography>
      </Box>

      {/* Success Message */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Content created successfully! You will be redirected to your content
          list.
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Content Creation Form */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create New Content
        </Typography>
        <Typography color="text.secondary">
          Content form will be integrated here once the content-management
          package import is resolved.
        </Typography>

        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() =>
              handleSubmit({
                title: "Test Content",
                type: "image",
                url: "test.jpg",
                masjidId: "test-masjid",
              })
            }
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Content"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ContentCreatePage;
