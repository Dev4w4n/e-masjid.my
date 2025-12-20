import { Link } from "react-router-dom";
import {
  ArrowRight,
  User,
  MapPin,
  Plus,
  List,
  Tv as TvIcon,
  Building2,
  Github,
  Facebook,
  Mail,
  Zap,
  MessageSquare,
} from "lucide-react";
import { useUser, useProfile, usePermissions } from "@masjid-suite/auth";
import { useTranslation } from "@masjid-suite/i18n";

/**
 * Home/Dashboard page component - Legacy-inspired modern design
 */
function Home() {
  const user = useUser();
  const profile = useProfile();
  const permissions = usePermissions();
  const { t } = useTranslation();

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
    // Public landing page (legacy-inspired)
    return (
      <div className="min-h-screen">
        {/* Hero Section - Legacy Inspired */}
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-teal-50/30">
          {/* Background Gradients with Blob Animation */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 order-2 md:order-1">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs text-primary font-medium tracking-wide uppercase">
                Sumber Terbuka
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1]">
                Sistem Masjid <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-500">
                  Untuk Semua
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                Inisiatif Perisian Sumber Terbuka untuk Transformasi Pengurusan
                Masjid. Kebebasan, Inovasi dan Kawalan Penuh di dalam Genggaman
                Anda.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/auth/signin"
                  className="px-8 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors flex items-center gap-2 justify-center"
                >
                  Log Masuk <ArrowRight size={18} />
                </Link>
                <div className="flex items-center gap-4 justify-center sm:justify-start px-4">
                  <a
                    href="https://github.com/Dev4w4n/e-masjid.my"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-primary transition-colors"
                  >
                    <Github size={20} />
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61557025656004"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-primary transition-colors"
                  >
                    <Facebook size={20} />
                  </a>
                  <a
                    href="mailto:support@e-masjid.my"
                    className="text-gray-500 hover:text-primary transition-colors"
                  >
                    <Mail size={20} />
                  </a>
                </div>
              </div>
            </div>

            {/* Video showcase */}
            <div className="relative h-[300px] md:h-[400px] w-full flex items-center justify-center order-1 md:order-2">
              <div className="relative w-full h-full rounded-3xl border border-gray-200 overflow-hidden shadow-2xl">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/Zj8RRV7JqPA?autoplay=1&mute=1&loop=1&playlist=Zj8RRV7JqPA&rel=0&modestbranding=1"
                  title="Open E Masjid Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Bento Grid Style */}
        <section id="projects" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Modul Open E Masjid
              </h2>
              <p className="text-gray-600 max-w-xl">
                Koleksi modul pengurusan masjid yang direka untuk memudahkan
                pentadbiran dan meningkatkan kecekapan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-auto md:auto-rows-[280px]">
              {/* Featured Module - Large - TV Display */}
              <div className="md:col-span-2 lg:col-span-2 md:row-span-2 relative group overflow-hidden rounded-3xl border border-gray-200 shadow-lg min-h-[300px] md:min-h-0">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-teal-500/90"></div>
                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md text-white">
                      Digital
                    </span>
                    <span className="text-xs font-mono bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md text-white">
                      Paparan
                    </span>
                    <span className="text-xs font-mono bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md text-white">
                      TV
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    Paparan TV Masjid
                  </h3>
                  <p className="text-gray-100 mb-4 line-clamp-2">
                    Paparan digital untuk TV masjid dengan pengumuman, jadual solat
                    dan info komuniti. Sistem paparan yang moden dan mudah diurus.
                  </p>
                </div>
              </div>

              {/* Stat Card - 100% Open Source */}
              <div className="md:col-span-1 bg-gradient-to-br from-primary to-primary/80 border border-primary/20 rounded-3xl p-6 flex flex-col justify-between shadow-lg min-h-[200px] md:min-h-0">
                <div className="p-3 bg-white/20 w-fit rounded-xl text-white">
                  <Zap size={24} />
                </div>
                <div>
                  <h4 className="text-4xl font-bold text-white mb-1">100%</h4>
                  <p className="text-sm text-white/80">Sumber Terbuka</p>
                </div>
              </div>

              {/* Chatbot AI Card */}
              <div className="md:col-span-1 relative group overflow-hidden rounded-3xl border border-gray-200 shadow-lg min-h-[280px] md:min-h-0">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/90 to-teal-600/90"></div>
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="p-3 bg-white/20 w-fit rounded-xl text-white mb-3">
                    <MessageSquare size={24} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md text-white">
                      AI
                    </span>
                    <span className="text-xs font-mono bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md text-white">
                      Chatbot
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Chatbot AI Masjid
                  </h3>
                  <p className="text-gray-100 text-sm line-clamp-2">
                    Pembantu AI pintar untuk menjawab soalan jemaah tentang masjid.
                  </p>
                </div>
              </div>

              {/* Browse Masjids Card */}
              <div className="md:col-span-1 bg-white rounded-3xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-h-[200px] md:min-h-0">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="p-3 bg-purple-500/10 w-fit rounded-xl text-purple-500 mb-4">
                      <MapPin size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Lihat Masjid
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Jelajahi senarai masjid yang terdaftar.
                    </p>
                  </div>
                  <Link
                    to="/masjids"
                    className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                  >
                    Lihat <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Content Management Card */}
              <div className="md:col-span-1 bg-white rounded-3xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-h-[200px] md:min-h-0">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="p-3 bg-indigo-500/10 w-fit rounded-xl text-indigo-500 mb-4">
                      <List size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Pengurusan Kandungan
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Cipta dan urus kandungan untuk paparan masjid.
                    </p>
                  </div>
                  <Link
                    to="/auth/signin"
                    className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                  >
                    Log Masuk <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
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
                    Pergi <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
