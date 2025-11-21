# CLAUDE.md - AI Assistant Guide for mwrd Marketplace

## Project Overview

**mwrd** is a managed B2B marketplace platform that connects clients (buyers) with suppliers (sellers) through an anonymous quotation system. The platform features three distinct portals with role-based access control and multilingual support.

### Core Business Model
- **Three-Portal System**: Admin, Client (Buyer), Supplier (Seller)
- **Anonymized Transactions**: Users see each other as randomized names (e.g., "Client-9760", "Supplier-7659")
- **RFQ-Based Workflow**: Clients submit RFQs → Suppliers quote → Clients accept → Orders created
- **Managed Marketplace**: Admin approves users/items and configures margin rules
- **Privacy-First**: Only admins can see real identities and contact information

## Tech Stack

### Frontend
- **Framework**: React 18.3+ with TypeScript
- **Build Tool**: Vite 5.4+
- **Routing**: React Router DOM v7.9+
- **Styling**: Tailwind CSS 3.4+ with PostCSS and Autoprefixer
- **Icons**: lucide-react (v0.344+)
- **State Management**: React Context API (AuthContext, LanguageContext)

### Backend & Database
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Database Client**: @supabase/supabase-js v2.57+
- **Type Safety**: Auto-generated database types in `src/lib/database.types.ts`
- **Authentication**: Supabase Auth with Row Level Security (RLS)

### Development Tools
- **Linting**: ESLint v9+ with TypeScript and React plugins
- **Type Checking**: TypeScript 5.5+ with strict mode
- **Code Quality**: typescript-eslint v8.3+

## Project Structure

```
mwrd-1/
├── src/
│   ├── App.tsx                      # Main app with route definitions
│   ├── main.tsx                     # Application entry point
│   ├── index.css                    # Global styles & Tailwind imports
│   │
│   ├── components/
│   │   ├── ProtectedRoute.tsx       # Route guard with role-based access
│   │   ├── LanguageSwitcher.tsx     # EN/AR language toggle
│   │   ├── layouts/
│   │   │   └── PortalLayout.tsx     # Shared portal layout with sidebar
│   │   └── ui/                      # Reusable UI components
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── Modal.tsx
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx          # Authentication & user profile state
│   │   └── LanguageContext.tsx      # i18n with EN/AR translations
│   │
│   ├── pages/
│   │   ├── Landing.tsx              # Public homepage
│   │   ├── Login.tsx                # Login page
│   │   ├── Signup.tsx               # Registration page
│   │   ├── Portal.tsx               # Role-based portal router
│   │   ├── PendingApproval.tsx      # Pending account status page
│   │   ├── Unauthorized.tsx         # Access denied page
│   │   ├── admin/
│   │   │   └── AdminDashboard.tsx   # Admin dashboard (monitoring & approvals)
│   │   ├── client/
│   │   │   ├── ClientDashboard.tsx  # Client overview
│   │   │   └── ClientCatalog.tsx    # Product browsing
│   │   └── supplier/
│   │       └── SupplierDashboard.tsx # Supplier overview
│   │
│   └── lib/
│       ├── supabase.ts              # Supabase client configuration
│       └── database.types.ts        # Auto-generated DB types
│
├── supabase/
│   └── migrations/                  # Database schema migrations
│       ├── 20251118182931_create_initial_schema.sql
│       ├── 20251118184629_fix_rls_infinite_recursion.sql
│       └── 20251118193415_fix_all_rls_policies.sql
│
├── package.json                     # Dependencies & scripts
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript base config
├── tsconfig.app.json                # App-specific TS config
├── tsconfig.node.json               # Node-specific TS config
├── tailwind.config.js               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS configuration
├── eslint.config.js                 # ESLint configuration
├── setup-test-accounts.js           # Script to seed test data
├── README.md                        # Project readme
└── TEST-ACCOUNTS.md                 # Test account credentials & workflows
```

## Database Schema Overview

### Core Tables

**user_profiles** - Extended user information
- `role`: 'admin' | 'client' | 'supplier'
- `random_name`: Anonymized display name (e.g., "Client-9760")
- `real_name`: Actual user/business name (admin-only visibility)
- `status`: 'pending' | 'approved' | 'rejected' | 'suspended'
- `rating`: Average rating (suppliers only)
- `total_orders`: Completed order count

**categories** - Product categories with margin rules
- Electronics, Raw Materials, Office Supplies, Machinery

**items** - Supplier product listings
- Must be admin-approved before appearing in catalog
- `cost_price`: Supplier's base price
- Final price = cost_price + mwrd margin

**rfqs** (Request for Quotations) - Client purchase requests
- `status`: 'pending' | 'quoted' | 'accepted' | 'expired' | 'cancelled'

**rfq_items** - Individual items within an RFQ

**quotes** - Supplier responses to RFQs
- `base_price`: Supplier's quoted price
- `final_price`: Price after mwrd margin (shown to client)

**orders** - Accepted quotes converted to orders
- Tracks order status, logistics, and payments

**margin_rules** - Platform margin configuration per category

### Security Model
- **Row Level Security (RLS)** enforced on all tables
- Users can only see data relevant to their role
- Anonymization handled at database level
- Admin has read access to all tables

## Key Architectural Patterns

### 1. Context-Based State Management

**AuthContext** (`src/contexts/AuthContext.tsx`)
- Manages user authentication state
- Provides user profile data
- Handles sign up, sign in, sign out
- Auto-refreshes profile data on auth state changes

**LanguageContext** (`src/contexts/LanguageContext.tsx`)
- Manages EN/AR language switching
- Provides `t()` translation function
- Handles RTL/LTR layout switching
- Persists language preference to localStorage

### 2. Role-Based Access Control

**ProtectedRoute Component** (`src/components/ProtectedRoute.tsx`)
- Guards routes based on user role
- Checks authentication status
- Validates account approval status
- Redirects unauthorized users

Usage example:
```tsx
<ProtectedRoute allowedRoles={['client']}>
  <ClientDashboard />
</ProtectedRoute>
```

### 3. Portal-Based Architecture

Each role has a dedicated portal with specific routes:

- **Client Portal**: `/portal/client/*`
  - Dashboard, Catalog, RFQs, Orders

- **Supplier Portal**: `/portal/supplier/*`
  - Dashboard, Inventory, RFQs, Orders

- **Admin Portal**: `/portal/admin/*`
  - Dashboard, Users, Items, RFQs, Settings

### 4. Internationalization (i18n)

- **Languages**: English (EN) and Arabic (AR)
- **RTL Support**: Automatic layout direction switching
- **Translation Keys**: Namespaced by feature (e.g., `landing.hero.title`)
- **Access**: Use `const { t, language, isRTL } = useLanguage()`

## Development Workflow

### Prerequisites
1. Node.js 18+ installed
2. Supabase project created
3. Environment variables configured

### Environment Setup

Create `.env` or `.env.local` with:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Available Scripts

```bash
# Development server (hot reload)
npm run dev

# Type checking (no emit)
npm run typecheck

# Linting
npm run lint

# Production build
npm run build

# Preview production build
npm run preview
```

### Database Migrations

Migrations are in `supabase/migrations/` and should be applied in order:
1. `create_initial_schema.sql` - Core tables and triggers
2. `fix_rls_infinite_recursion.sql` - RLS policy fixes
3. `fix_all_rls_policies.sql` - Final RLS adjustments

Apply migrations via Supabase CLI or dashboard.

### Test Accounts

See `TEST-ACCOUNTS.md` for pre-configured test accounts:
- Admin: admin@mwrd.com / admin123
- Client: client@test.com / client123
- Supplier 1: supplier@test.com / supplier123
- Supplier 2: supplier2@test.com / supplier123

## Code Conventions & Best Practices

### TypeScript
- **Strict Mode**: Enabled in tsconfig
- **Type Imports**: Use `import type` for type-only imports
- **Database Types**: Always use types from `database.types.ts`
- **Component Props**: Define interfaces for all component props

### React Components
- **Functional Components**: Use function declarations, not arrow functions
- **Hooks**: Follow React hooks rules (order, conditional usage)
- **Context**: Use custom hooks (`useAuth()`, `useLanguage()`) instead of direct context
- **Error Boundaries**: Consider adding for production

### Styling
- **Tailwind First**: Use Tailwind utility classes
- **Consistent Spacing**: Use Tailwind spacing scale (px, py, mx, my)
- **Responsive Design**: Mobile-first approach with responsive utilities
- **Dark Mode**: Not currently implemented but consider planning

### File Naming
- **Components**: PascalCase (e.g., `ClientDashboard.tsx`)
- **Utilities**: camelCase (e.g., `supabase.ts`)
- **Contexts**: PascalCase with "Context" suffix (e.g., `AuthContext.tsx`)

### Supabase Queries
- **Always handle errors**: Check `error` object in responses
- **Use type safety**: Leverage auto-generated types
- **RLS-aware**: Remember all queries respect RLS policies
- **Performance**: Use `.select()` to limit returned columns

Example:
```typescript
const { data, error } = await supabase
  .from('items')
  .select('id, name, cost_price, category_id')
  .eq('status', 'approved')
  .order('created_at', { ascending: false });

if (error) {
  console.error('Error fetching items:', error);
  return;
}
```

## Common Development Tasks

### Adding a New Page

1. Create component in appropriate `pages/` subdirectory
2. Add route to `App.tsx` in relevant portal section
3. Update navigation in portal's `PortalLayout` configuration
4. Add i18n keys to both `en` and `ar` translations
5. Implement data fetching with Supabase client
6. Handle loading and error states

### Adding Translation Keys

1. Add key to both `translations.en` and `translations.ar` in `LanguageContext.tsx`
2. Use namespaced keys (e.g., `feature.section.element`)
3. Access via `const { t } = useLanguage(); t('your.key')`
4. Test in both EN and AR modes

### Modifying Database Schema

1. Create new migration file in `supabase/migrations/`
2. Use timestamp naming: `YYYYMMDDHHMMSS_description.sql`
3. Include RLS policies for new tables
4. Update `database.types.ts` by regenerating types
5. Test RLS policies for each role

### Adding Authentication Logic

1. Extend `AuthContext` if needed
2. Use `useAuth()` hook in components
3. Check `user`, `profile`, and `loading` states
4. Handle authentication redirects appropriately
5. Update `ProtectedRoute` for new access patterns

## Security Considerations

### Authentication
- Passwords are handled by Supabase Auth (bcrypt hashing)
- Session tokens stored securely in localStorage
- Auto-refresh tokens enabled

### Authorization
- Row Level Security (RLS) enforced on all tables
- Never bypass RLS with service role key in frontend
- Always use anon key for client-side queries

### Data Privacy
- Real identities (`real_name`, `company_name`) only visible to admins
- Clients and suppliers see each other via `random_name` only
- Phone numbers and emails protected by RLS

### Input Validation
- Client-side validation for UX
- Server-side validation via database constraints
- Sanitize user inputs before database insertion

## Feature Status & Roadmap

### Completed Features
- User registration and authentication
- Role-based portal routing
- Admin, Client, and Supplier dashboards
- Multilingual support (EN/AR)
- Category and item management foundation
- User profile management
- Database schema with RLS

### In Progress / Coming Soon
- RFQ submission workflow
- Quote submission and comparison
- Order placement and tracking
- Real-time notifications
- File uploads (KYC documents, product images)
- Email notifications
- Rating and review submission
- Payment integration
- Logistics tracking

## Troubleshooting

### Common Issues

**Build Errors**
- Run `npm install` to ensure dependencies are updated
- Check `tsconfig.json` paths and includes
- Verify Vite config doesn't have conflicting plugins

**Supabase Connection Issues**
- Verify environment variables are set correctly
- Check Supabase project status in dashboard
- Ensure anon key has proper permissions

**RLS Policy Errors**
- Review policies in migration files
- Test queries in Supabase SQL editor with different roles
- Check for infinite recursion in policies

**Type Errors**
- Regenerate `database.types.ts` after schema changes
- Ensure TypeScript version matches project requirements
- Run `npm run typecheck` to identify issues

**Translation Missing**
- Check key exists in both EN and AR objects
- Verify key spelling and casing
- Fallback: translation function returns key if not found

## Testing Strategy

### Manual Testing
- Use test accounts from `TEST-ACCOUNTS.md`
- Test each portal independently
- Verify role-based access restrictions
- Test language switching in all views
- Verify data isolation between users

### Automated Testing (Future)
- Consider adding Jest + React Testing Library
- Test critical user flows (signup, RFQ, quote)
- Test component rendering and interactions
- Mock Supabase client for unit tests

## Deployment

### Build Process
```bash
npm run build
```
Outputs to `dist/` directory.

### Environment Variables
Ensure production environment has:
- `VITE_SUPABASE_URL`: Production Supabase URL
- `VITE_SUPABASE_ANON_KEY`: Production anon key

### Hosting Recommendations
- **Vercel**: Automatic deployments from git
- **Netlify**: Easy setup with continuous deployment
- **Cloudflare Pages**: Fast global CDN
- All support Vite/React projects out of the box

### Pre-Deployment Checklist
- [ ] Run type check: `npm run typecheck`
- [ ] Run linter: `npm run lint`
- [ ] Test build locally: `npm run build && npm run preview`
- [ ] Verify environment variables in hosting platform
- [ ] Test authentication flow in production
- [ ] Verify Supabase RLS policies are production-ready
- [ ] Check CORS settings in Supabase dashboard

## Working with AI Assistants

### When Adding Features
1. Describe the feature and affected portal(s)
2. Ask AI to check existing patterns in similar components
3. Request type-safe implementations using database types
4. Ensure i18n keys are added for all user-facing text
5. Request testing guidance for the new feature

### When Debugging
1. Provide complete error messages and stack traces
2. Mention which portal/page the issue occurs in
3. Include relevant code snippets
4. Specify browser console errors if applicable
5. Share Supabase error responses

### Best Practices for AI Collaboration
- Reference specific file paths (e.g., `src/pages/client/ClientCatalog.tsx:42`)
- Ask for explanations of existing patterns before modifying
- Request code reviews before committing significant changes
- Verify database queries respect RLS policies
- Ensure new code follows established conventions

## Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Router Docs**: https://reactrouter.com/
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Vite Docs**: https://vitejs.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

## Change Log

| Date | Author | Changes |
|------|--------|---------|
| 2025-11-19 | AI Assistant | Initial CLAUDE.md creation with comprehensive codebase documentation |

---

**Last Updated**: 2025-11-19
**Project Version**: 0.0.0
**Maintained By**: mwrd Development Team
