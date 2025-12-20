#!/bin/bash

# E-Masjid.My Deployment Setup Script
# This script helps set up deployment environments for Cloudflare Pages and Supabase
# 
# Usage: ./setup-environments.sh [production|staging|both]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GITHUB_REPO="Dev4w4n/e-masjid.my"
MAIN_BRANCH="main"
DEV_BRANCH="dev"

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}"
    echo "=============================================="
    echo "  E-Masjid.My Deployment Setup"
    echo "=============================================="
    echo -e "${NC}"
}

print_section() {
    echo -e "\n${GREEN}>> $1${NC}\n"
}

# Check prerequisites
check_prerequisites() {
    print_section "Checking Prerequisites"
    
    local missing_deps=false
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        log_error "git is required but not installed"
        missing_deps=true
    else
        log_success "git is available"
    fi
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository"
        missing_deps=true
    else
        log_success "In git repository"
    fi
    
    # Check if pnpm is installed
    if ! command -v pnpm &> /dev/null; then
        log_warning "pnpm is not installed - you'll need it for building locally"
    else
        log_success "pnpm is available"
    fi
    
    if [ "$missing_deps" = true ]; then
        log_error "Missing required dependencies. Please install them before continuing."
        exit 1
    fi
}

# Generate environment variables template
generate_env_template() {
    local environment=$1
    local supabase_url_placeholder="https://YOUR_$(echo ${environment} | tr '[:lower:]' '[:upper:]')_SUPABASE_PROJECT_ID.supabase.co"
    local anon_key_placeholder="YOUR_$(echo ${environment} | tr '[:lower:]' '[:upper:]')_SUPABASE_ANON_KEY"
    local service_key_placeholder="YOUR_$(echo ${environment} | tr '[:lower:]' '[:upper:]')_SUPABASE_SERVICE_ROLE_KEY"
    
    cat > "deployment/env-templates/${environment}.env" << EOF
# E-Masjid.My $(echo ${environment} | sed 's/./\U&/') Environment Variables
# Generated on $(date)
# 
# SECURITY WARNING: These are templates with placeholder values
# NEVER commit real secrets to git!
# Configure actual values in:
# - Cloudflare Pages dashboard for client-side variables
# - Supabase project settings for server-side variables

# ===========================================
# SUPABASE CONFIGURATION
# ===========================================
SUPABASE_URL=${supabase_url_placeholder}
SUPABASE_ANON_KEY=${anon_key_placeholder}
SUPABASE_SERVICE_ROLE_KEY=${service_key_placeholder}

# Hub App (Vite React) - Client-side variables
VITE_SUPABASE_URL=${supabase_url_placeholder}
VITE_SUPABASE_ANON_KEY=${anon_key_placeholder}
VITE_APP_URL=https://hub-emasjid-${environment}.pages.dev
VITE_ENABLE_DEV_TOOLS=$( [ "$environment" = "staging" ] && echo "true" || echo "false" )
VITE_SHOW_LOGGER=$( [ "$environment" = "staging" ] && echo "true" || echo "false" )

# Papan Info App (Next.js) - Client and server variables  
NEXT_PUBLIC_SUPABASE_URL=${supabase_url_placeholder}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon_key_placeholder}
NEXT_PUBLIC_BASE_URL=https://papan-info-emasjid-${environment}.pages.dev

# TV Display App (Next.js) - Client and server variables
NEXT_PUBLIC_APP_URL=https://tv-emasjid-${environment}.pages.dev
NEXT_PUBLIC_AUTO_REFRESH=true
NEXT_PUBLIC_REFRESH_INTERVAL=$( [ "$environment" = "staging" ] && echo "1800000" || echo "3600000" )
NEXT_PUBLIC_PRAYER_UPDATE_INTERVAL=$( [ "$environment" = "staging" ] && echo "60000" || echo "300000" )
NEXT_PUBLIC_CONTENT_REFRESH_INTERVAL=$( [ "$environment" = "staging" ] && echo "30000" || echo "60000" )
NEXT_PUBLIC_APP_ENV=${environment}
NEXT_PUBLIC_ENABLE_DEV_TOOLS=$( [ "$environment" = "staging" ] && echo "true" || echo "false" )
NEXT_PUBLIC_SHOW_LOGGER=$( [ "$environment" = "staging" ] && echo "true" || echo "false" )

# ===========================================
# ADMIN CONFIGURATION (Set in Supabase dashboard)
# ===========================================
# SUPER_ADMIN_EMAIL=admin@emasjid.my
# SUPER_ADMIN_PASSWORD=GENERATE_STRONG_PASSWORD
# SUPER_ADMIN_ID=GENERATED_UUID_AFTER_USER_CREATION

# ===========================================
# OPTIONAL: OAUTH PROVIDERS
# ===========================================
# SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your-google-client-id
# SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your-google-client-secret
EOF
}

# Create deployment checklist
create_deployment_checklist() {
    local environment=$1
    
    cat > "deployment/checklists/${environment}-checklist.md" << EOF
# $(echo ${environment} | sed 's/./\U&/') Deployment Checklist

Generated on $(date)

## 🎯 $(echo ${environment} | sed 's/./\U&/') Environment Setup

$( [ "$environment" = "production" ] && cat << 'PROD'
### Supabase Project Setup
- [ ] Create Supabase project: \`e-masjid-my\`
- [ ] Link to GitHub repository: \`${GITHUB_REPO}\`
- [ ] Configure branch deployment: \`${MAIN_BRANCH}\`
- [ ] Apply database migrations
- [ ] Load seed data (minimal)
- [ ] Configure authentication settings
- [ ] Set environment variables in Supabase dashboard
PROD
 || cat << 'STAGING'
### Supabase Branch Setup
- [ ] Ensure main Supabase project \`e-masjid-my\` exists
- [ ] Navigate to Database → Branches in Supabase dashboard
- [ ] Create preview branch: \`staging\`
- [ ] Connect branch to GitHub repository: \`${GITHUB_REPO}\`, branch: \`${DEV_BRANCH}\`
- [ ] Apply database migrations (automatically from GitHub)
- [ ] Load seed data (full test data) to staging branch
- [ ] Configure authentication settings for staging branch
- [ ] Set environment variables in Supabase dashboard for staging branch
- [ ] Note down staging branch URL and API keys (different from production)
STAGING
)

### Cloudflare Pages Setup

#### Hub App: \`hub-emasjid-${environment}\`
- [ ] Create Cloudflare Pages project
- [ ] Connect to GitHub: \`${GITHUB_REPO}\`
- [ ] Set production branch: \`$( [ "$environment" = "production" ] && echo "$MAIN_BRANCH" || echo "$DEV_BRANCH" )\`
- [ ] Configure build command: \`cd apps/hub && pnpm install --frozen-lockfile && pnpm build\`
- [ ] Set build output: \`apps/hub/dist\`
- [ ] Add environment variables from template

#### Papan Info App: \`papan-info-emasjid-${environment}\`  
- [ ] Create Cloudflare Pages project
- [ ] Connect to GitHub: \`${GITHUB_REPO}\`
- [ ] Set production branch: \`$( [ "$environment" = "production" ] && echo "$MAIN_BRANCH" || echo "$DEV_BRANCH" )\`
- [ ] Configure build command: \`cd apps/papan-info && pnpm install --frozen-lockfile && pnpm build\`
- [ ] Set build output: \`apps/papan-info/.next\`
- [ ] Add environment variables from template

#### TV Display App: \`tv-emasjid-${environment}\`
- [ ] Create Cloudflare Pages project  
- [ ] Connect to GitHub: \`${GITHUB_REPO}\`
- [ ] Set production branch: \`$( [ "$environment" = "production" ] && echo "$MAIN_BRANCH" || echo "$DEV_BRANCH" )\`
- [ ] Configure build command: \`cd apps/tv-display && pnpm install --frozen-lockfile && pnpm build\`
- [ ] Set build output: \`apps/tv-display/.next\`
- [ ] Add environment variables from template

### Environment Variables
- [ ] Hub app variables configured in Cloudflare Pages
- [ ] Papan Info app variables configured in Cloudflare Pages  
- [ ] TV Display variables configured in Cloudflare Pages
- [ ] Super admin credentials set in Supabase
- [ ] OAuth providers configured (if needed)

### Testing & Validation
- [ ] All applications deploy successfully
- [ ] Database connectivity verified
- [ ] Authentication flows tested
- [ ] Cross-app navigation works
- [ ] Real-time features functional
- [ ] File uploads working
- [ ] Performance acceptable

### Security Review
- [ ] No secrets committed to git
- [ ] RLS policies verified
- [ ] CORS settings configured
- [ ] Rate limiting enabled
- [ ] SSL certificates active
- [ ] Security headers configured

## 🔗 Quick Links

- **Environment Variables**: \`deployment/env-templates/${environment}.env\`
- **Cloudflare Config**: \`deployment/cloudflare/pages-config/\`
- **Supabase Config**: \`deployment/supabase/${environment}-config.toml\`

## 📞 Support Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Supabase Docs](https://supabase.com/docs)
- [Deployment Guide](../README.md)
EOF
}

# Main setup function
setup_environment() {
    local environment=$1
    
    print_section "Setting up $(echo ${environment} | sed 's/.*/\L&/' | sed 's/^./\U&/') Environment"
    
    # Create directories if they don't exist
    mkdir -p "deployment/env-templates"
    mkdir -p "deployment/checklists"
    
    # Generate environment template
    log_info "Generating environment variables template..."
    generate_env_template "$environment"
    log_success "Environment template created: deployment/env-templates/${environment}.env"
    
    # Create deployment checklist
    log_info "Creating deployment checklist..."
    create_deployment_checklist "$environment"
    log_success "Deployment checklist created: deployment/checklists/${environment}-checklist.md"
    
    # Show next steps
    echo -e "\n${GREEN}Next Steps for $(echo ${environment} | sed 's/./\U&/'):${NC}"
    echo "1. Review the environment template: deployment/env-templates/${environment}.env"
    echo "2. Follow the deployment checklist: deployment/checklists/${environment}-checklist.md"
    echo "3. Configure actual values in Cloudflare Pages and Supabase dashboards"
    echo "4. Test the deployment thoroughly"
}

# Validate current setup
validate_setup() {
    print_section "Validating Current Setup"
    
    local validation_passed=true
    
    # Check if we're on the right branch structure
    if git branch -r | grep -q "origin/${MAIN_BRANCH}"; then
        log_success "Main branch (${MAIN_BRANCH}) exists"
    else
        log_error "Main branch (${MAIN_BRANCH}) not found"
        validation_passed=false
    fi
    
    if git branch -r | grep -q "origin/${DEV_BRANCH}"; then
        log_success "Dev branch (${DEV_BRANCH}) exists"
    else
        log_error "Dev branch (${DEV_BRANCH}) not found"
        validation_passed=false
    fi
    
    # Check if required directories exist
    if [ -d "apps/hub" ] && [ -d "apps/papan-info" ] && [ -d "apps/tv-display" ]; then
        log_success "All application directories exist"
    else
        log_error "Missing application directories"
        validation_passed=false
    fi
    
    # Check if package.json files exist
    for app in hub papan-info tv-display; do
        if [ -f "apps/${app}/package.json" ]; then
            log_success "apps/${app}/package.json exists"
        else
            log_error "apps/${app}/package.json not found"
            validation_passed=false
        fi
    done
    
    if [ "$validation_passed" = false ]; then
        log_error "Validation failed. Please fix the issues before proceeding."
        exit 1
    fi
    
    log_success "All validation checks passed!"
}

# Main script execution
main() {
    print_header
    
    local environment=${1:-"both"}
    
    # Show usage if invalid argument
    if [ "$environment" != "production" ] && [ "$environment" != "staging" ] && [ "$environment" != "both" ]; then
        echo "Usage: $0 [production|staging|both]"
        echo ""
        echo "Examples:"
        echo "  $0 production   # Set up production environment only"
        echo "  $0 staging     # Set up staging environment only"  
        echo "  $0 both        # Set up both environments (default)"
        exit 1
    fi
    
    check_prerequisites
    validate_setup
    
    if [ "$environment" = "both" ] || [ "$environment" = "production" ]; then
        setup_environment "production"
    fi
    
    if [ "$environment" = "both" ] || [ "$environment" = "staging" ]; then
        setup_environment "staging"
    fi
    
    print_section "Setup Complete!"
    echo "Your deployment configuration has been generated."
    echo ""
    echo "Important reminders:"
    echo "• Never commit real secrets to git"
    echo "• Use the generated templates to configure actual values"
    echo "• Follow the checklists for systematic deployment"
    echo "• Test staging environment before production"
    echo ""
    echo "Next steps:"
    echo "1. Review generated files in deployment/ directory"
    echo "2. Create Supabase projects and configure them"
    echo "3. Create Cloudflare Pages projects using the configs"
    echo "4. Set environment variables in respective dashboards"
}

# Run main function with all arguments
main "$@"