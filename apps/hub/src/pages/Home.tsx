import { Link } from "react-router-dom";
import {
  ArrowRight,
  User,
  MapPin,
  Plus,
  List,
  Tv as TvIcon,
  Building2,
} from "lucide-react";
import { useUser, useProfile, usePermissions } from "@masjid-suite/auth";
import { useTranslation } from "@masjid-suite/i18n";
import { LandingPage } from "../components/LandingPage";
import { useLanguagePreference } from "../components/LanguageToggle";

/**
 * Home/Dashboard page component - Legacy-inspired modern design
 */
function Home() {
  const user = useUser();
  const profile = useProfile();
  const permissions = usePermissions();
  const { t } = useTranslation();
  const [language, setLanguage] = useLanguagePreference();

  const quickActions = [
    {
      title: t("profile.my_profile"),
      description: t("home.view_edit_info"),
      icon: User,
      link: "/profile",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: t("masjid.browse"),
      description: t("home.discover_masjids"),
      icon: MapPin,
      link: "/masjids",
      gradient: "from-teal-500 to-teal-600",
    },
  ];

  // Add content creation actions
  if (user) {
    quickActions.push(
      {
        title: t("nav.create_content"),
        description: "Cipta kandungan baru untuk paparan",
        icon: Plus,
        link: "/content/create",
        gradient: "from-primary to-blue-600",
      },
      {
        title: t("nav.my_content"),
        description: "Lihat kandungan saya",
        icon: List,
        link: "/content/my-content",
        gradient: "from-secondary to-teal-600",
      }
    );
  }

  // Add admin-specific actions
  if (permissions.hasAdminPrivileges()) {
    quickActions.push({
      title: t("nav.manage_displays"),
      description: "Uruskan paparan TV masjid",
      icon: TvIcon,
      link: "/admin/display-management",
      gradient: "from-purple-500 to-purple-600",
    });
  }

  // Add super admin actions
  if (permissions.isSuperAdmin()) {
    quickActions.push({
      title: t("masjid.create"),
      description: t("home.add_new_masjid"),
      icon: Building2,
      link: "/masjids/new",
      gradient: "from-indigo-500 to-indigo-600",
    });
  }

  // Show different layout for authenticated vs non-authenticated users
  if (!user) {
    // Public landing page with tier comparison
    return <LandingPage language={language} onLanguageToggle={setLanguage} />;
  }

  // Authenticated user dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-teal-50/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            {t("common.welcome")},{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-500">
              {profile?.full_name || user?.email?.split("@")[0] || "User"}
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("home.subtitle")}
          </p>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t("home.quick_actions")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Link
                  key={index}
                  to={action.link}
                  className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`p-3 bg-gradient-to-br ${action.gradient} rounded-xl text-white`}
                    >
                      <IconComponent size={24} />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {action.description}
                  </p>
                  <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                    Pergi{" "}
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
