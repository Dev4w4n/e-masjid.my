# Deployment Scripts

This directory contains automation scripts to help with E-Masjid.My deployment setup and management.

## 🚀 Available Scripts

### 1. Environment Setup Script

**File**: `setup-environments.sh`

Automatically generates deployment configurations, environment templates, and checklists.

```bash
# Set up both staging and production
./deployment/scripts/setup-environments.sh both

# Set up production only
./deployment/scripts/setup-environments.sh production

# Set up staging only
./deployment/scripts/setup-environments.sh staging
```

**What it does:**

- Validates your project structure
- Generates environment variable templates
- Creates deployment checklists
- Provides guided setup instructions

### 2. Cloudflare Deployment Script

**File**: `deploy-cloudflare.sh`

Helps validate configurations and provides deployment guidance.

```bash
# Validate all apps for staging
./deployment/scripts/deploy-cloudflare.sh staging all validate

# Get deployment instructions for hub app
./deployment/scripts/deploy-cloudflare.sh production hub deploy

# Check status of TV display app
./deployment/scripts/deploy-cloudflare.sh staging tv-display status

# View logs instructions
./deployment/scripts/deploy-cloudflare.sh production public logs
```

**Available actions:**

- `validate`: Check configurations and test builds
- `deploy`: Show step-by-step deployment instructions
- `status`: Display project information
- `logs`: Guide for viewing deployment logs

## 🔧 Usage Examples

### First-Time Setup

```bash
# 1. Generate all deployment configurations
./deployment/scripts/setup-environments.sh both

# 2. Validate your setup
./deployment/scripts/deploy-cloudflare.sh staging all validate
./deployment/scripts/deploy-cloudflare.sh production all validate

# 3. Follow the generated checklists
# - deployment/checklists/staging-checklist.md
# - deployment/checklists/production-checklist.md
```

### Deploying Specific Apps

```bash
# Deploy hub app to staging
./deployment/scripts/deploy-cloudflare.sh staging hub deploy

# Deploy all apps to production
./deployment/scripts/deploy-cloudflare.sh production all deploy
```

### Troubleshooting

```bash
# Validate configuration before deployment
./deployment/scripts/deploy-cloudflare.sh staging hub validate

# Check project status
./deployment/scripts/deploy-cloudflare.sh production tv-display status

# Get logs viewing instructions
./deployment/scripts/deploy-cloudflare.sh staging public logs
```

## 📁 Generated Files

### Environment Templates

Located in `deployment/env-templates/`:

- `production.env` - Production environment variables template
- `staging.env` - Staging environment variables template

**⚠️ Security Note**: These contain placeholder values only. Configure actual secrets in platform dashboards.

### Deployment Checklists

Located in `deployment/checklists/`:

- `production-checklist.md` - Step-by-step production deployment guide
- `staging-checklist.md` - Step-by-step staging deployment guide

## 🔍 Script Features

### Environment Setup Script Features

- ✅ Project structure validation
- ✅ Git repository checks
- ✅ Dependency verification
- ✅ Environment-specific configuration generation
- ✅ Security best practices enforcement

### Cloudflare Deployment Script Features

- ✅ Configuration validation
- ✅ Local build testing
- ✅ Step-by-step deployment instructions
- ✅ Project status reporting
- ✅ Logs access guidance

## 🛠️ Prerequisites

Before running these scripts:

1. **Git**: Repository must be properly initialized
2. **Node.js & pnpm**: For local build testing
3. **Project Structure**: All app directories must exist
4. **Permissions**: Scripts must be executable (`chmod +x`)

## 🔐 Security Considerations

These scripts follow security best practices:

- Never generate or store real secrets
- Use placeholder values in all templates
- Validate that no secrets are committed to git
- Provide clear guidance on where to configure actual values
- Separate client-side and server-side environment variables

## 📋 Common Issues & Solutions

### "Permission denied" error

```bash
chmod +x deployment/scripts/*.sh
```

### "pnpm: command not found" during validation

```bash
npm install -g pnpm
# or use npm commands in Cloudflare Pages build settings
```

### Build failures during local testing

```bash
# Install dependencies first
pnpm install

# Build packages
pnpm build:clean

# Then test individual app builds
cd apps/hub && pnpm build
```

### Missing configuration files

```bash
# Re-run setup script to regenerate
./deployment/scripts/setup-environments.sh both
```

## 📞 Support

For script-related issues:

1. Check script output for specific error messages
2. Verify prerequisites are installed
3. Ensure you're in the project root directory
4. Check file permissions on scripts
5. Refer to the main deployment guide: `../README.md`

## 🔄 Script Updates

When updating these scripts:

1. Test with both staging and production configurations
2. Verify all generated files are valid
3. Update this README if new features are added
4. Maintain backward compatibility when possible

---

**Next Steps**: Run `./deployment/scripts/setup-environments.sh both` to get started with your deployment setup.
