import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
} from "@mui/material";
import { Image, PlayArrow, Announcement, Schedule } from "@mui/icons-material";

interface ContentPreviewProps {
  content: {
    id: string;
    title: string;
    description?: string | null;
    type: "image" | "youtube_video" | "text_announcement" | "event_poster";
    url: string;
    duration: number;
    start_date: string;
    end_date: string;
    status: string;
    submitted_by?: string;
    submitted_at?: string;
    sponsorship_amount: number;
  };
  showMetadata?: boolean;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({
  content,
  showMetadata = true,
}) => {
  const getTypeIcon = () => {
    switch (content.type) {
      case "image":
      case "event_poster":
        return <Image />;
      case "youtube_video":
        return <PlayArrow />;
      case "text_announcement":
        return <Announcement />;
      default:
        return null;
    }
  };

  const getTypeLabel = () => {
    switch (content.type) {
      case "image":
        return "Image";
      case "event_poster":
        return "Event Poster";
      case "youtube_video":
        return "YouTube Video";
      case "text_announcement":
        return "Text Announcement";
      default:
        return content.type;
    }
  };

  const getStatusColor = () => {
    switch (content.status) {
      case "pending":
        return "warning";
      case "active":
        return "success";
      case "rejected":
        return "error";
      case "expired":
        return "default";
      default:
        return "default";
    }
  };

  const renderContentPreview = () => {
    switch (content.type) {
      case "image":
      case "event_poster":
        return (
          <Box
            sx={{
              width: "100%",
              height: 200,
              backgroundColor: "#f5f5f5",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {content.url ? (
              <img
                src={content.url}
                alt={content.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.parentElement!.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; color: #666;">
                      <Image style="font-size: 48px; margin-bottom: 8px;" />
                      <span>Image preview not available</span>
                    </div>
                  `;
                }}
              />
            ) : (
              <Box sx={{ textAlign: "center", color: "text.secondary" }}>
                <Image sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body2">Image preview</Typography>
              </Box>
            )}
          </Box>
        );

      case "youtube_video":
        const videoId = extractYouTubeVideoId(content.url);
        const thumbnailUrl = videoId
          ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
          : null;

        return (
          <Box
            sx={{
              width: "100%",
              height: 200,
              backgroundColor: "#f5f5f5",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {thumbnailUrl ? (
              <>
                <img
                  src={thumbnailUrl}
                  alt={content.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "rgba(0,0,0,0.7)",
                    borderRadius: "50%",
                    width: 60,
                    height: 60,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PlayArrow sx={{ color: "white", fontSize: 30 }} />
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: "center", color: "text.secondary" }}>
                <PlayArrow sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body2">YouTube Video</Typography>
                <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                  {content.url}
                </Typography>
              </Box>
            )}
          </Box>
        );

      case "text_announcement":
        return (
          <Box
            sx={{
              width: "100%",
              minHeight: 150,
              backgroundColor: "#f8f9fa",
              border: "2px dashed #ddd",
              borderRadius: 1,
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Announcement sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
            <Typography
              variant="body1"
              sx={{
                textAlign: "center",
                whiteSpace: "pre-wrap",
                maxHeight: 120,
                overflowY: "auto",
                width: "100%",
              }}
            >
              {content.url || "No announcement text"}
            </Typography>
          </Box>
        );

      default:
        return (
          <Box
            sx={{
              width: "100%",
              height: 200,
              backgroundColor: "#f5f5f5",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Preview not available
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Card>
      <CardContent>
        {/* Header with title and type */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
            {getTypeIcon()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
              {content.title}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Chip
                label={getTypeLabel()}
                size="small"
                variant="outlined"
                color="primary"
              />
              <Chip
                label={content.status}
                size="small"
                color={getStatusColor() as any}
              />
            </Box>
          </Box>
        </Box>

        {/* Description */}
        {content.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {content.description}
          </Typography>
        )}

        {/* Content Preview */}
        <Box sx={{ mb: showMetadata ? 2 : 0 }}>{renderContentPreview()}</Box>

        {/* Metadata */}
        {showMetadata && (
          <Box sx={{ pt: 2, borderTop: "1px solid #eee" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Schedule sx={{ fontSize: 16 }} />
                <Typography variant="caption">
                  {content.duration}s duration
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {content.start_date} - {content.end_date}
              </Typography>
              {content.sponsorship_amount > 0 && (
                <Typography variant="caption" color="primary">
                  RM {content.sponsorship_amount.toFixed(2)} sponsored
                </Typography>
              )}
            </Box>
            {content.submitted_at && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                Submitted: {new Date(content.submitted_at).toLocaleDateString("ms-MY")}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to extract YouTube video ID
function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match && match[1] ? match[1] : null;
}

export default ContentPreview;
