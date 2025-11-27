#!/bin/bash

# E-Masjid.My Cloudflare Deployment Script
# Automates deployment validation and monitoring
#
# Usage: ./deploy-cloudflare.sh [environment] [app] [action]
# Examples:
#   ./deploy-cloudflare.sh staging hub validate
#   ./deploy-cloudflare.sh production all deploy
#   ./deploy-cloudflare.sh staging tv-display logs

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APPS=("hub" "public" "tv-display")
ENVIRONMENTS=("production" "staging")

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
    echo "  E-Masjid.My Cloudflare Deployment"
    echo "=============================================="
    echo -e "${NC}"
}

print_usage() {
    echo "Usage: $0 [environment] [app] [action]"
    echo ""
    echo "Arguments:"
    echo "  environment: production | staging"
    echo "  app:         hub | public | tv-display | all"
    echo "  action:      validate | deploy | logs | status"
    echo ""
    echo "Examples:"
    echo "  $0 staging hub validate      # Validate hub app staging config"
    echo "  $0 production all deploy     # Deploy all apps to production"
    echo "  $0 staging tv-display logs   # View TV display staging logs"
    echo "  $0 production hub status     # Check hub production status"
}

# Validate environment argument
validate_environment() {
    local env=$1
    for valid_env in "${ENVIRONMENTS[@]}"; do
        if [ "$env" = "$valid_env" ]; then
            return 0
        fi
    done
    log_error "Invalid environment: $env"
    log_info "Valid environments: ${ENVIRONMENTS[*]}"
    exit 1
}

# Validate app argument
validate_app() {
    local app=$1
    if [ "$app" = "all" ]; then
        return 0
    fi
    
    for valid_app in "${APPS[@]}"; do
        if [ "$app" = "$valid_app" ]; then
            return 0
        fi
    done
    log_error "Invalid app: $app"
    log_info "Valid apps: ${APPS[*]} all"
    exit 1
}

# Get Cloudflare project name
get_cf_project_name() {
    local app=$1
    local env=$2
    echo "${app}-emasjid-${env}"
}

# Get build command for app
get_build_command() {
    local app=$1
    echo "cd apps/${app} && pnpm install --frozen-lockfile && pnpm build"
}

# Get build output directory
get_build_output() {
    local app=$1
    case $app in
        hub)
            echo "apps/hub/dist"
            ;;
        public|tv-display)
            echo "apps/${app}/.next"
            ;;
        *)
            log_error "Unknown app: $app"
            exit 1
            ;;
    esac
}

# Validate configuration for specific app
validate_app_config() {
    local app=$1
    local env=$2
    
    log_info "Validating $app configuration for $env..."
    
    # Check if package.json exists
    if [ ! -f "apps/${app}/package.json" ]; then
        log_error "Package.json not found for $app"
        return 1
    fi
    
    # Check if build script exists
    if ! grep -q '"build"' "apps/${app}/package.json"; then
        log_error "Build script not found in $app package.json"
        return 1
    fi
    
    # Check if config file exists
    local config_file="deployment/cloudflare/pages-config/${app}-${env}.toml"
    if [ ! -f "$config_file" ]; then
        log_error "Config file not found: $config_file"
        return 1
    fi
    
    # Test build locally (optional but recommended)
    log_info "Testing build command locally..."
    local build_cmd=$(get_build_command "$app")
    
    if eval "$build_cmd" > /dev/null 2>&1; then
        log_success "Local build test passed for $app"
    else
        log_warning "Local build test failed for $app (check dependencies)"
    fi
    
    log_success "Configuration validation passed for $app ($env)"
    return 0
}

# Validate all required files exist
validate_deployment_files() {
    local env=$1
    
    log_info "Validating deployment files for $env..."
    
    # Check config files
    for app in "${APPS[@]}"; do
        local config_file="deployment/cloudflare/pages-config/${app}-${env}.toml"
        if [ -f "$config_file" ]; then
            log_success "Config exists: $config_file"
        else
            log_error "Missing config: $config_file"
            return 1
        fi
    done
    
    # Check environment template
    local env_template="deployment/env-templates/${env}.env"
    if [ -f "$env_template" ]; then
        log_success "Environment template exists: $env_template"
    else
        log_warning "Environment template missing: $env_template"
    fi
    
    # Check checklist
    local checklist="deployment/checklists/${env}-checklist.md"
    if [ -f "$checklist" ]; then
        log_success "Deployment checklist exists: $checklist"
    else
        log_warning "Deployment checklist missing: $checklist"
    fi
    
    return 0
}

# Display deployment instructions
show_deployment_instructions() {
    local app=$1
    local env=$2
    local project_name=$(get_cf_project_name "$app" "$env")
    
    echo -e "\n${GREEN}Deployment Instructions for ${app} (${env}):${NC}"
    echo "1. Go to Cloudflare Pages dashboard"
    echo "2. Create new project: ${project_name}"
    echo "3. Connect to GitHub repository: Dev4w4n/e-masjid.my"
    echo "4. Configure build settings:"
    echo "   - Production branch: $([ "$env" = "production" ] && echo "main" || echo "dev")"
    echo "   - Build command: $(get_build_command "$app")"
    echo "   - Build output: $(get_build_output "$app")"
    echo "5. Add environment variables from: deployment/env-templates/${env}.env"
    echo "6. Deploy and test!"
    echo ""
}

# Show deployment status summary
show_deployment_status() {
    local env=$1
    
    echo -e "\n${BLUE}${env^} Environment Deployment Status:${NC}"
    echo "=============================================="
    
    for app in "${APPS[@]}"; do
        local project_name=$(get_cf_project_name "$app" "$env")
        echo -e "${YELLOW}$app${NC} → ${project_name}"
        echo "  Config: deployment/cloudflare/pages-config/${app}-${env}.toml"
        echo "  Build: $(get_build_command "$app")"
        echo "  Output: $(get_build_output "$app")"
        echo ""
    done
}

# Validate environment variables template
validate_env_template() {
    local env=$1
    local template_file="deployment/env-templates/${env}.env"
    
    if [ ! -f "$template_file" ]; then
        log_warning "Environment template not found: $template_file"
        log_info "Run ./deployment/scripts/setup-environments.sh to generate it"
        return 1
    fi
    
    log_info "Validating environment template..."
    
    # Check for placeholder values (which should NOT be used in production)
    local placeholders_found=false
    
    if grep -q "YOUR_.*_SUPABASE" "$template_file"; then
        log_warning "Placeholder values found in $template_file"
        log_warning "Make sure to replace with actual values in Cloudflare Pages dashboard"
        placeholders_found=true
    fi
    
    if [ "$placeholders_found" = true ]; then
        echo ""
        echo -e "${YELLOW}Remember:${NC}"
        echo "• Never commit real secrets to git"
        echo "• Configure actual values in Cloudflare Pages dashboard"
        echo "• Use different values for staging and production"
    fi
    
    log_success "Environment template validation complete"
    return 0
}

# Main action dispatcher
perform_action() {
    local env=$1
    local app=$2
    local action=$3
    
    case $action in
        validate)
            if [ "$app" = "all" ]; then
                log_info "Validating all apps for $env..."
                validate_deployment_files "$env"
                validate_env_template "$env"
                for single_app in "${APPS[@]}"; do
                    validate_app_config "$single_app" "$env"
                done
                log_success "All validations passed for $env environment"
            else
                validate_app_config "$app" "$env"
            fi
            ;;
            
        deploy)
            if [ "$app" = "all" ]; then
                log_info "Showing deployment instructions for all apps in $env..."
                for single_app in "${APPS[@]}"; do
                    show_deployment_instructions "$single_app" "$env"
                done
            else
                show_deployment_instructions "$app" "$env"
            fi
            ;;
            
        status)
            if [ "$app" = "all" ]; then
                show_deployment_status "$env"
            else
                local project_name=$(get_cf_project_name "$app" "$env")
                echo -e "${GREEN}Status for ${app} (${env}):${NC}"
                echo "Project name: ${project_name}"
                echo "Config file: deployment/cloudflare/pages-config/${app}-${env}.toml"
                echo "Build command: $(get_build_command "$app")"
                echo "Build output: $(get_build_output "$app")"
            fi
            ;;
            
        logs)
            log_info "To view deployment logs:"
            log_info "1. Go to Cloudflare Pages dashboard"
            log_info "2. Select project: $(get_cf_project_name "$app" "$env")"
            log_info "3. Navigate to 'Functions' or 'Deployments' tab"
            log_info "4. View logs in the dashboard"
            ;;
            
        *)
            log_error "Invalid action: $action"
            log_info "Valid actions: validate, deploy, logs, status"
            exit 1
            ;;
    esac
}

# Main script
main() {
    print_header
    
    # Check arguments
    if [ $# -ne 3 ]; then
        print_usage
        exit 1
    fi
    
    local environment=$1
    local app=$2
    local action=$3
    
    # Validate arguments
    validate_environment "$environment"
    validate_app "$app"
    
    # Perform the requested action
    perform_action "$environment" "$app" "$action"
    
    # Show helpful reminders
    echo -e "\n${BLUE}Helpful Resources:${NC}"
    echo "• Deployment guide: deployment/README.md"
    echo "• Environment variables: deployment/ENVIRONMENT-VARIABLES.md"
    echo "• Cloudflare Pages docs: https://developers.cloudflare.com/pages/"
    echo "• Supabase docs: https://supabase.com/docs"
}

# Run main function
main "$@"