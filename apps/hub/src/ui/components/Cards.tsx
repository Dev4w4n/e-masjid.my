import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Avatar,
  Divider,
} from "@mui/material";
import {
  LocationOn,
  Phone,
  Email,
  Edit,
  Delete,
  Mosque,
  AdminPanelSettings,
} from "@mui/icons-material";
import type { Database, MasjidAddress } from "@masjid-suite/shared-types";
import type { ProfileWithRole } from "@masjid-suite/auth";

// Profile card component
interface ProfileCardProps {
  profile: ProfileWithRole;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function ProfileCard({
  profile,
  onEdit,
  onDelete,
  showActions = true,
}: ProfileCardProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "error";
      case "masjid_admin":
        return "warning";
      case "community_member":
        return "primary";
      default:
        return "default";
    }
  };

  const getRoleLabel = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            sx={{ width: 56, height: 56, mr: 2 }}
            {...(profile.avatar_url && { src: profile.avatar_url })}
          >
            {profile.full_name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div">
              {profile.full_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile.email}
            </Typography>
            <Chip
              label={getRoleLabel(profile.role || "public")}
              color={getRoleColor(profile.role || "public") as any}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>

        {profile.phone_number && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Phone sx={{ mr: 1, fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2">{profile.phone_number}</Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Email sx={{ mr: 1, fontSize: 16, color: "text.secondary" }} />
          <Typography variant="body2">{profile.email}</Typography>
        </Box>

        {profile.created_at && (
          <Typography variant="caption" color="text.secondary">
            Member since {new Date(profile.created_at).toLocaleDateString("ms-MY")}
          </Typography>
        )}
      </CardContent>

      {showActions && (onEdit || onDelete) && (
        <>
          <Divider />
          <CardActions>
            {onEdit && (
              <Button size="small" startIcon={<Edit />} onClick={onEdit}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                size="small"
                color="error"
                startIcon={<Delete />}
                onClick={onDelete}
              >
                Delete
              </Button>
            )}
          </CardActions>
        </>
      )}
    </Card>
  );
}

// Masjid card component
interface MasjidCardProps {
  masjid: Database["public"]["Tables"]["masjids"]["Row"];
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
  showActions?: boolean;
}

export function MasjidCard({
  masjid,
  onEdit,
  onDelete,
  onViewDetails,
  showActions = true,
}: MasjidCardProps) {
  const formatAddress = () => {
    try {
      // Parse the JSON address
      const address =
        typeof masjid.address === "string"
          ? (JSON.parse(masjid.address) as MasjidAddress)
          : (masjid.address as unknown as MasjidAddress);

      if (!address || typeof address !== "object")
        return "Address not available";

      const parts = [
        address.address_line_1,
        address.address_line_2,
        address.city,
        `${address.postcode} ${address.state}`,
      ].filter(Boolean);

      return parts.join(", ");
    } catch {
      return "Address not available";
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              mr: 2,
              bgcolor: "primary.main",
            }}
          >
            <Mosque />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div">
              {masjid.name}
            </Typography>
            <Chip
              label={
                masjid.status === "active"
                  ? "Active"
                  : masjid.status === "inactive"
                    ? "Inactive"
                    : "Pending"
              }
              color={masjid.status === "active" ? "success" : "default"}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
          <LocationOn
            sx={{ mr: 1, fontSize: 16, color: "text.secondary", mt: 0.5 }}
          />
          <Typography variant="body2">{formatAddress()}</Typography>
        </Box>

        {masjid.phone_number && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Phone sx={{ mr: 1, fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2">{masjid.phone_number}</Typography>
          </Box>
        )}

        {masjid.email && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Email sx={{ mr: 1, fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2">{masjid.email}</Typography>
          </Box>
        )}

        {masjid.registration_number && (
          <Typography variant="caption" color="text.secondary">
            Reg. No: {masjid.registration_number}
          </Typography>
        )}
      </CardContent>

      {showActions && (onEdit || onDelete || onViewDetails) && (
        <>
          <Divider />
          <CardActions>
            {onViewDetails && (
              <Button size="small" onClick={onViewDetails}>
                View Details
              </Button>
            )}
            {onEdit && (
              <Button size="small" startIcon={<Edit />} onClick={onEdit}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                size="small"
                color="error"
                startIcon={<Delete />}
                onClick={onDelete}
              >
                Delete
              </Button>
            )}
          </CardActions>
        </>
      )}
    </Card>
  );
}

// Admin assignment card component
interface AdminAssignmentCardProps {
  assignment: Database["public"]["Tables"]["masjid_admins"]["Row"] & {
    profiles: Pick<
      Database["public"]["Tables"]["profiles"]["Row"],
      "user_id" | "full_name" | "phone_number"
    > | null;
  };
  onRemove?: () => void;
  showActions?: boolean;
}

export function AdminAssignmentCard({
  assignment,
  onRemove,
  showActions = true,
}: AdminAssignmentCardProps) {
  if (!assignment.profiles) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "suspended":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              mr: 2,
              bgcolor: "warning.main",
            }}
          >
            <AdminPanelSettings />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div">
              {assignment.profiles.full_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Masjid Administrator
            </Typography>
            <Chip
              label={getStatusLabel(assignment.status)}
              color={getStatusColor(assignment.status) as any}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <AdminPanelSettings
            sx={{ mr: 1, fontSize: 16, color: "text.secondary" }}
          />
          <Typography variant="body2">
            Admin ID: {assignment.id.slice(0, 8)}...
          </Typography>
        </Box>

        {assignment.profiles.phone_number && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Phone sx={{ mr: 1, fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2">
              {assignment.profiles.phone_number}
            </Typography>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary">
          Approved on {new Date(assignment.approved_at).toLocaleDateString("ms-MY")}
        </Typography>
      </CardContent>

      {showActions && onRemove && (
        <>
          <Divider />
          <CardActions>
            <Button
              size="small"
              color="error"
              startIcon={<Delete />}
              onClick={onRemove}
            >
              Remove Assignment
            </Button>
          </CardActions>
        </>
      )}
    </Card>
  );
}
