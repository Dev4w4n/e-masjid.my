import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardMedia,
  CardActionArea,
  Chip,
} from "@mui/material";
import {
  FormatBold,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
} from "@mui/icons-material";
import {
  BACKGROUND_TEMPLATES,
  BackgroundTemplate,
  getBackgroundsByCategory,
} from "../../config/backgrounds";

interface TextOverlayEditorProps {
  onGenerate: (canvas: HTMLCanvasElement) => void;
  initialText?: string;
}

/**
 * Text Overlay Editor Component
 * Allows users to create text announcements with customizable backgrounds
 */
export const TextOverlayEditor: React.FC<TextOverlayEditorProps> = ({
  onGenerate,
  initialText = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState(initialText);
  const [selectedBackground, setSelectedBackground] =
    useState<BackgroundTemplate>(BACKGROUND_TEMPLATES[0]!);
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState("#ffffff");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(
    "center"
  );
  const [fontWeight, setFontWeight] = useState<"normal" | "bold">("bold");
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  const [activeCategory, setActiveCategory] =
    useState<BackgroundTemplate["category"]>("islamic");

  // Load background image
  useEffect(() => {
    if (selectedBackground && selectedBackground.file) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setBackgroundImage(img);
      };
      img.src = selectedBackground.file;
    } else {
      setBackgroundImage(null);
    }
  }, [selectedBackground]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size (16:9 aspect ratio, TV display standard)
    canvas.width = 1920;
    canvas.height = 1080;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (backgroundImage && selectedBackground?.file) {
      // Draw image background
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else if (selectedBackground?.primaryColor) {
      // Draw solid or gradient background
      if (selectedBackground.primaryColor.includes("gradient")) {
        // Parse gradient string
        const match = selectedBackground.primaryColor.match(
          /linear-gradient\((\d+)deg,\s*(#[0-9a-f]+)\s+\d+%,\s*(#[0-9a-f]+)\s+\d+%\)/i
        );
        if (match) {
          const angle = parseInt(match[1] || "135");
          const color1 = match[2];
          const color2 = match[3];

          // Create gradient based on angle
          const angleRad = (angle * Math.PI) / 180;
          const x1 = canvas.width / 2 - (Math.cos(angleRad) * canvas.width) / 2;
          const y1 =
            canvas.height / 2 - (Math.sin(angleRad) * canvas.height) / 2;
          const x2 = canvas.width / 2 + (Math.cos(angleRad) * canvas.width) / 2;
          const y2 =
            canvas.height / 2 + (Math.sin(angleRad) * canvas.height) / 2;

          const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          gradient.addColorStop(0, color1!);
          gradient.addColorStop(1, color2!);
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = "#008080";
        }
      } else {
        // Solid color
        ctx.fillStyle = selectedBackground.primaryColor;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw text
    if (text.trim()) {
      ctx.fillStyle = textColor;
      ctx.font = `${fontWeight === "bold" ? "bold" : "normal"} ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = textAlign;
      ctx.textBaseline = "middle";

      // Calculate text position
      const x =
        textAlign === "center"
          ? canvas.width / 2
          : textAlign === "right"
            ? canvas.width - 100
            : 100;

      // Split text into lines to handle wrapping
      const maxWidth = canvas.width - 200;
      const lines = wrapText(ctx, text, maxWidth);
      const lineHeight = fontSize * 1.2;
      const totalHeight = lines.length * lineHeight;
      const startY = (canvas.height - totalHeight) / 2 + lineHeight / 2;

      // Draw each line with shadow for better readability
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        ctx.fillText(line, x, y);
      });
    }
  }, [
    text,
    selectedBackground,
    fontSize,
    textColor,
    textAlign,
    fontWeight,
    backgroundImage,
  ]);

  // Helper function to wrap text
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word!;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const handleGenerate = () => {
    if (canvasRef.current) {
      onGenerate(canvasRef.current);
    }
  };

  const filteredBackgrounds = getBackgroundsByCategory(activeCategory);

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Canvas Preview */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, bgcolor: "grey.100" }}>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                paddingBottom: "56.25%", // 16:9 aspect ratio
                bgcolor: "black",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Controls */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Text Settings
            </Typography>

            {/* Text Input */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Announcement Text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 500 }}
              helperText={`${text.length}/500 characters`}
            />

            {/* Font Size */}
            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>Font Size: {fontSize}px</Typography>
              <Slider
                value={fontSize}
                onChange={(_, value) => setFontSize(value as number)}
                min={24}
                max={120}
                step={4}
              />
            </Box>

            {/* Text Color */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Text Color</InputLabel>
              <Select
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                label="Text Color"
              >
                <MenuItem value="#ffffff">White</MenuItem>
                <MenuItem value="#000000">Black</MenuItem>
                <MenuItem value="#ffd700">Gold</MenuItem>
                <MenuItem value="#c0c0c0">Silver</MenuItem>
                <MenuItem value="#008080">Teal</MenuItem>
              </Select>
            </FormControl>

            {/* Text Alignment */}
            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>Text Alignment</Typography>
              <ToggleButtonGroup
                value={textAlign}
                exclusive
                onChange={(_, value) => value && setTextAlign(value)}
                fullWidth
              >
                <ToggleButton value="left">
                  <FormatAlignLeft />
                </ToggleButton>
                <ToggleButton value="center">
                  <FormatAlignCenter />
                </ToggleButton>
                <ToggleButton value="right">
                  <FormatAlignRight />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Font Weight */}
            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>Font Weight</Typography>
              <ToggleButtonGroup
                value={fontWeight}
                exclusive
                onChange={(_, value) => value && setFontWeight(value)}
                fullWidth
              >
                <ToggleButton value="normal">Normal</ToggleButton>
                <ToggleButton value="bold">
                  <FormatBold sx={{ mr: 1 }} />
                  Bold
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Paper>
        </Grid>

        {/* Background Selection */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Select Background
            </Typography>

            {/* Category Tabs */}
            <Box sx={{ mb: 2 }}>
              <Chip
                label="Islamic"
                onClick={() => setActiveCategory("islamic")}
                color={activeCategory === "islamic" ? "primary" : "default"}
                sx={{ mr: 1 }}
              />
              <Chip
                label="Solid Colors"
                onClick={() => setActiveCategory("solid")}
                color={activeCategory === "solid" ? "primary" : "default"}
                sx={{ mr: 1 }}
              />
              <Chip
                label="Gradients"
                onClick={() => setActiveCategory("gradient")}
                color={activeCategory === "gradient" ? "primary" : "default"}
              />
            </Box>

            {/* Background Grid */}
            <Grid container spacing={2}>
              {filteredBackgrounds.map((bg) => (
                <Grid item xs={6} sm={4} md={3} key={bg.id}>
                  <Card
                    sx={{
                      border:
                        selectedBackground?.id === bg.id
                          ? "3px solid"
                          : "1px solid",
                      borderColor:
                        selectedBackground?.id === bg.id
                          ? "primary.main"
                          : "divider",
                    }}
                  >
                    <CardActionArea onClick={() => setSelectedBackground(bg)}>
                      {bg.thumbnail ? (
                        <CardMedia
                          component="img"
                          height="140"
                          image={bg.thumbnail}
                          alt={bg.name}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 140,
                            background: bg.primaryColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography variant="body2" sx={{ color: "white" }}>
                            {bg.name}
                          </Typography>
                        </Box>
                      )}
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Generate Button */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGenerate}
              disabled={!text.trim()}
            >
              Use This Design
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
