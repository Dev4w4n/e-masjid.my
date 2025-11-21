import {
  Alert,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import { getDisplaysByMasjid } from "@masjid-suite/supabase-client";
import { Tables, getTvDisplayUrlForDisplay } from "@masjid-suite/shared-types";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type TvDisplay = Tables<"tv_displays">;

export const TvDisplayList = () => {
  const { id: masjidId } = useParams<{ id: string }>();
  const [displays, setDisplays] = useState<TvDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!masjidId) return;

    const fetchDisplays = async () => {
      try {
        setLoading(true);
        const data = await getDisplaysByMasjid(masjidId);
        setDisplays(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error("Failed to fetch displays:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDisplays();
  }, [masjidId]);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          TV Displays
        </Typography>
        {loading ? (
          <CircularProgress size={24} />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : displays.length > 0 ? (
          <List dense>
            {displays.map((display) => (
              <ListItem
                key={display.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="open"
                    component="a"
                    href={getTvDisplayUrlForDisplay(display.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <OpenInNew />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={display.display_name}
                  secondary={display.description}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No TV displays found for this masjid.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
