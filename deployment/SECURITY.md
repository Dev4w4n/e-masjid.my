# 🛡️ Security Guide for E-Masjid.My Deployment

This document outlines critical security practices for deploying E-Masjid.My safely in production environments.

## 🚨 Critical Security Rules

### 1. **NEVER** Commit Secrets to Git

- ❌ No API keys, passwords, or tokens in any committed files
- ❌ No real Supabase URLs or keys in configuration files
- ❌ No production environment variables in the repository
- ✅ Use placeholders and configure actual values in dashboards

### 2. Environment Separation

- 🔐 **Production**: Real data, strict security, no debug tools
- 🧪 **Staging**: Test data, moderate security, debug tools enabled
- 💻 **Development**: Local data, relaxed security, full debug access

### 3. Access Control

- Use different Supabase projects for each environment
- Implement proper Row Level Security (RLS) policies
- Configure environment-specific admin accounts
- Enable MFA for all admin accounts

## 🔑 Secret Management Strategy

### Supabase Secrets

**Configure these in Supabase project dashboard only:**

```bash
# ❌ NEVER in git - Configure in Supabase dashboard
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=your-strong-password
SUPER_ADMIN_ID=generated-uuid
```

### Cloudflare Pages Secrets

**Configure these in Cloudflare Pages dashboard only:**

```bash
# ❌ NEVER in git - Configure in Cloudflare dashboard
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
OAUTH_CLIENT_SECRET=your-oauth-secret
```

### Public Configuration (Safe to expose)

```bash
# ✅ Safe for client-side (these can be in git as placeholders)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🏗️ Secure Configuration Checklist

### Supabase Security

#### Database Security

- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Proper RLS policies for multi-tenant isolation
- [ ] Service role key never exposed to client-side
- [ ] API rate limiting configured
- [ ] Database connection pooling enabled

#### Authentication Security

- [ ] Email confirmation enabled for production
- [ ] Strong password requirements enforced
- [ ] Session timeout configured appropriately
- [ ] Refresh token rotation enabled
- [ ] OAuth providers properly configured

#### API Security

- [ ] CORS configured for specific domains only
- [ ] API key usage monitored
- [ ] Request logging enabled
- [ ] Abuse detection configured

### Cloudflare Pages Security

#### Build Security

- [ ] Build environment variables secured
- [ ] No secrets in build logs
- [ ] Source code access restricted
- [ ] Build artifacts secured

#### Runtime Security

- [ ] Security headers configured
- [ ] SSL/TLS certificates active
- [ ] DDoS protection enabled
- [ ] CDN security rules configured

#### Access Control

- [ ] GitHub repository access restricted
- [ ] Branch protection rules enabled
- [ ] Deployment access controlled
- [ ] Admin accounts secured with MFA

## 🔒 Environment-Specific Security Settings

### Production Environment

**Supabase Configuration:**

```toml
[auth]
site_url = "https://yourdomain.com"
additional_redirect_urls = ["https://yourdomain.com"]
enable_confirmations = true
jwt_expiry = 3600

[api]
max_rows = 1000  # Prevent large data dumps
```

**Cloudflare Pages Headers:**

```toml
[headers]
for = "/*"
[headers.values]
X-Frame-Options = "DENY"
X-Content-Type-Options = "nosniff"
X-XSS-Protection = "1; mode=block"
Strict-Transport-Security = "max-age=31536000; includeSubDomains"
Content-Security-Policy = "default-src 'self'; ..."
```

### Staging Environment

**More permissive for testing but still secure:**

```toml
[auth]
site_url = "https://staging.yourdomain.com"
additional_redirect_urls = [
  "https://staging.yourdomain.com",
  "http://localhost:3000"  # For local testing
]
enable_confirmations = false  # Easier testing
jwt_expiry = 3600
```

## 🚨 Security Incident Response

### If Secrets Are Compromised

**Immediate Actions:**

1. 🚨 **Rotate all affected keys immediately**
2. 🔍 **Check git history for exposed secrets**
3. 📝 **Document the incident**
4. 🔧 **Update security procedures**

**Supabase Key Rotation:**

1. Generate new service role key in Supabase dashboard
2. Update Cloudflare Pages environment variables
3. Invalidate old key in Supabase
4. Test all applications

**OAuth Secret Rotation:**

1. Generate new client secret in OAuth provider
2. Update Supabase auth configuration
3. Update any stored secrets
4. Test authentication flows

### If Git History Contains Secrets

**Clean up git history (removing secrets):**

> ⚠️ **WARNING:** Rewriting git history is disruptive. All team members will need to re-clone the repository or perform complex rebasing operations. Coordinate with your team before proceeding.
>
> **Use modern tools:** The `git filter-branch` command is deprecated. Use [`git filter-repo`](https://github.com/newren/git-filter-repo) or [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) for safer, faster history rewriting.

**Option 1: Using `git filter-repo` (recommended)**

1. Install `git-filter-repo` ([installation guide](https://github.com/newren/git-filter-repo/blob/main/INSTALL.md))
2. Run:

```bash
git filter-repo --path path/to/secret/file --invert-paths
```

3. Force push to update remote (dangerous!):

```bash
git push origin --force --all
```

**Option 2: Using BFG Repo-Cleaner**

1. Download BFG Repo-Cleaner ([BFG homepage](https://rtyley.github.io/bfg-repo-cleaner/))
2. Run:

```bash
java -jar bfg.jar --delete-files path/to/secret/file
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push origin --force --all
```

> **After rewriting history:** All team members must re-clone the repository. See [GitHub's Removing sensitive data from a repository](https://docs.github.com/en/github/authenticating-to-github/removing-sensitive-data-from-a-repository) for more details.

## 🔍 Security Monitoring

### What to Monitor

**Supabase Metrics:**

- Unusual API usage patterns
- Failed authentication attempts
- Database query patterns
- Storage usage spikes

**Cloudflare Metrics:**

- Traffic patterns
- Error rates
- Geographic access patterns
- Bot traffic

### Alerting Setup

**Critical Alerts:**

- Multiple failed admin logins
- Unusual data access patterns
- API rate limit exceeded
- SSL certificate expiration
- Deployment failures

**Monitoring Tools:**

- Supabase dashboard metrics
- Cloudflare Analytics
- GitHub security alerts
- Custom monitoring scripts

## 🛡️ Additional Security Measures

### Code Security

- Regular dependency updates via Dependabot
- Security scanning in CI/CD pipeline
- Code review requirements for all changes
- Static analysis tools integration

### Infrastructure Security

- Regular security assessments
- Penetration testing (if required)
- Backup and disaster recovery plans
- Incident response procedures

### Team Security

- Security training for all developers
- Secure development guidelines
- Regular security reviews
- Access management procedures

## 📋 Security Validation Checklist

Before going live, validate:

### Pre-Production Security Check

- [ ] All secrets configured in dashboards (not git)
- [ ] RLS policies tested with different user roles
- [ ] Authentication flows working correctly
- [ ] SSL certificates active and valid
- [ ] Security headers configured
- [ ] Rate limiting functional
- [ ] Backup procedures tested
- [ ] Monitoring and alerting active

### Post-Production Security Check

- [ ] Monitor logs for unusual activity
- [ ] Verify all security configurations
- [ ] Test incident response procedures
- [ ] Review access logs regularly
- [ ] Update security documentation

## 🚨 Emergency Contacts

**Security Issues:**

- Technical Lead: [Contact information]
- Infrastructure Team: [Contact information]
- Security Team: [Contact information]

**Platform-Specific Support:**

- Supabase Support: support@supabase.io
- Cloudflare Support: [Enterprise support if available]
- GitHub Security: security@github.com

---

## ⚠️ Remember

**The Three Rules of Deployment Security:**

1. **Never commit secrets** - Use dashboards for configuration
2. **Separate environments** - Production ≠ Staging ≠ Development
3. **Monitor everything** - Know when something goes wrong

**When in doubt, choose the more secure option.**
