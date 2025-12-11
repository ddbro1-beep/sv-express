# SV Express Roadmap

## Current Version: 1.0.0 (Production)

### ✅ Completed Features

- [x] Backend API with authentication
- [x] Admin Dashboard with lead management
- [x] Landing page with form integration
- [x] Database schema and migrations
- [x] Production deployment on Vercel
- [x] Documentation (API, DATABASE, SETUP, DEPLOYMENT)

---

## Version 1.1.0 - User Portal (Личный кабинет пользователя)

**Target:** Next sprint (2-3 weeks)

### Phase 1: Authentication & Registration

#### 1.1 User Registration Flow
- [ ] Registration page (`/register`)
  - [ ] Form fields: email, password, confirm password, first name, last name, phone
  - [ ] Email validation
  - [ ] Password strength requirements
  - [ ] Terms of service checkbox
  - [ ] reCAPTCHA integration
- [ ] Registration API endpoint
  - [ ] Email uniqueness check
  - [ ] Password hashing (bcrypt)
  - [ ] Send verification email
- [ ] Email verification
  - [ ] Verification token generation
  - [ ] Verification email template
  - [ ] Verification page (`/verify/:token`)
  - [ ] Update `email_verified` field

#### 1.2 User Login & Authentication
- [ ] Login page (`/login`)
  - [ ] Email/password form
  - [ ] "Remember me" checkbox
  - [ ] "Forgot password" link
- [ ] Login API integration
  - [ ] JWT token storage (localStorage)
  - [ ] Automatic token refresh
  - [ ] Redirect to dashboard after login
- [ ] Password reset flow
  - [ ] "Forgot password" page
  - [ ] Reset token generation
  - [ ] Reset email with link
  - [ ] Reset password page (`/reset-password/:token`)
  - [ ] Update password API endpoint

#### 1.3 Protected Routes
- [ ] AuthContext for Portal
  - [ ] useAuth hook
  - [ ] Auto-redirect to /login if not authenticated
  - [ ] Store user data in context
- [ ] Private route wrapper
  - [ ] Check authentication status
  - [ ] Loading state during auth check

### Phase 2: User Dashboard

#### 2.1 Dashboard Layout
- [ ] Header component
  - [ ] Logo with link to home
  - [ ] User menu dropdown (profile, settings, logout)
  - [ ] Notifications bell icon
- [ ] Sidebar navigation
  - [ ] Dashboard (главная)
  - [ ] My Shipments (мои посылки)
  - [ ] New Request (новая заявка)
  - [ ] Track Package (отследить)
  - [ ] Profile (профиль)
  - [ ] Settings (настройки)
- [ ] Main content area
  - [ ] Breadcrumbs
  - [ ] Page title and description

#### 2.2 Dashboard Home (`/dashboard`)
- [ ] Welcome message with user name
- [ ] Statistics cards
  - [ ] Total shipments count
  - [ ] In transit count
  - [ ] Delivered count
  - [ ] Pending payment count
- [ ] Recent shipments table (last 5)
  - [ ] Tracking number
  - [ ] Route (from → to)
  - [ ] Status badge
  - [ ] Estimated delivery date
  - [ ] Quick actions (view details, track)
- [ ] Quick actions section
  - [ ] "Create new request" button
  - [ ] "Track package" input
  - [ ] "Calculate cost" link

### Phase 3: Shipment Management

#### 3.1 My Shipments Page (`/shipments`)
- [ ] Shipments list view
  - [ ] Table with all user's shipments
  - [ ] Columns: tracking number, route, status, created date, delivery date
  - [ ] Sortable columns
  - [ ] Pagination (20 per page)
- [ ] Filters
  - [ ] Filter by status (all, created, in_transit, delivered, cancelled)
  - [ ] Filter by date range
  - [ ] Search by tracking number
- [ ] Status badges with color coding
  - [ ] Created (blue)
  - [ ] In Transit (orange)
  - [ ] Delivered (green)
  - [ ] Cancelled (red)

#### 3.2 Shipment Details Page (`/shipments/:id`)
- [ ] Shipment information card
  - [ ] Tracking number (large, copyable)
  - [ ] Current status with icon
  - [ ] Estimated delivery date
  - [ ] Origin and destination details
  - [ ] Package details (weight, dimensions, type)
  - [ ] Price and payment status
- [ ] Tracking timeline
  - [ ] Vertical timeline with events
  - [ ] Event date/time, location, description
  - [ ] Icons for each event type
  - [ ] Latest event highlighted
  - [ ] Real-time updates
- [ ] Documents section
  - [ ] Download invoice (PDF)
  - [ ] Download customs declaration (PDF)
  - [ ] Download receipt (if paid)
- [ ] Actions
  - [ ] "Track on map" button (if available)
  - [ ] "Contact support" button
  - [ ] "Cancel shipment" button (if applicable)

#### 3.3 Create Shipment Request (`/request`)
- [ ] Multi-step form wizard
  - **Step 1: Sender Information**
    - [ ] Auto-fill from user profile
    - [ ] Name, phone, address, city, country
    - [ ] Save as default checkbox
  - **Step 2: Recipient Information**
    - [ ] Name, phone, address, city, country
    - [ ] Address validation
    - [ ] Save to address book checkbox
  - **Step 3: Package Details**
    - [ ] Package type (documents, small parcel, large parcel)
    - [ ] Weight (kg)
    - [ ] Dimensions (length, width, height in cm)
    - [ ] Content description
    - [ ] Estimated value (for insurance)
    - [ ] Special handling (fragile, urgent)
  - **Step 4: Shipping Options**
    - [ ] Calculate cost based on details
    - [ ] Show available pricing tiers
    - [ ] Select delivery speed (standard, express)
    - [ ] Add insurance (optional)
    - [ ] Pickup date selector
  - **Step 5: Review & Confirm**
    - [ ] Summary of all details
    - [ ] Total cost breakdown
    - [ ] Terms and conditions checkbox
    - [ ] Submit button
- [ ] Form validation
  - [ ] Client-side validation with error messages
  - [ ] Server-side validation
- [ ] Success page
  - [ ] Confirmation message
  - [ ] Request ID
  - [ ] Next steps instructions
  - [ ] Link to view request status

### Phase 4: Tracking Features

#### 4.1 Track Package (`/track`)
- [ ] Tracking number input
  - [ ] Large search input
  - [ ] Validation (format check)
  - [ ] Recent searches dropdown
- [ ] Public tracking (no login required)
  - [ ] Show basic tracking info
  - [ ] Timeline of events
  - [ ] Current location on map
- [ ] Tracking results
  - [ ] Display shipment details
  - [ ] Show timeline
  - [ ] Estimated delivery date
  - [ ] Current status
  - [ ] Contact info if issues

#### 4.2 Tracking Notifications
- [ ] Real-time notifications
  - [ ] WebSocket connection for live updates
  - [ ] Push notifications (browser)
  - [ ] Email notifications
  - [ ] SMS notifications (optional)
- [ ] Notification settings
  - [ ] Enable/disable by channel
  - [ ] Select which events to notify
  - [ ] Quiet hours settings

#### 4.3 Tracking Map Integration
- [ ] Interactive map view
  - [ ] Show shipment route on map
  - [ ] Mark origin, destination, current location
  - [ ] Timeline overlay on map
  - [ ] Estimated path visualization
- [ ] Map provider integration
  - [ ] Google Maps or Mapbox
  - [ ] Geolocation for tracking events
  - [ ] Auto-update current location

### Phase 5: User Profile & Settings

#### 5.1 Profile Page (`/profile`)
- [ ] Personal information section
  - [ ] Display current info
  - [ ] Edit mode toggle
  - [ ] Update name, phone, photo
  - [ ] Email change (with verification)
- [ ] Password change section
  - [ ] Current password input
  - [ ] New password with strength indicator
  - [ ] Confirm new password
- [ ] Address book
  - [ ] Saved addresses list
  - [ ] Add new address
  - [ ] Edit/delete addresses
  - [ ] Set default address

#### 5.2 Settings Page (`/settings`)
- [ ] Account settings
  - [ ] Language preference (Russian/English)
  - [ ] Timezone
  - [ ] Currency display
- [ ] Notification preferences
  - [ ] Email notifications (on/off per event)
  - [ ] SMS notifications (on/off)
  - [ ] Push notifications (on/off)
- [ ] Privacy settings
  - [ ] Profile visibility
  - [ ] Data sharing preferences
  - [ ] Download my data
  - [ ] Delete account

#### 5.3 Billing & Payments
- [ ] Payment methods
  - [ ] Saved credit cards list
  - [ ] Add new card
  - [ ] Set default payment method
  - [ ] Remove card
- [ ] Payment history
  - [ ] List of all payments
  - [ ] Filter by date, amount, status
  - [ ] Download receipts
- [ ] Invoices
  - [ ] List of all invoices
  - [ ] Download PDF invoices
  - [ ] Email invoice to accountant

### Phase 6: API Endpoints for Portal

#### 6.1 User Management APIs
- [ ] `POST /api/auth/register` - Register new user
- [ ] `POST /api/auth/verify-email` - Verify email
- [ ] `POST /api/auth/forgot-password` - Request password reset
- [ ] `POST /api/auth/reset-password` - Reset password
- [ ] `GET /api/users/me` - Get current user
- [ ] `PUT /api/users/me` - Update user profile
- [ ] `PUT /api/users/me/password` - Change password
- [ ] `DELETE /api/users/me` - Delete account

#### 6.2 Shipment APIs for Users
- [ ] `GET /api/shipments` - Get user's shipments (filtered)
- [ ] `GET /api/shipments/:id` - Get shipment details
- [ ] `POST /api/shipments` - Create shipment request
- [ ] `PUT /api/shipments/:id` - Update shipment (if allowed)
- [ ] `DELETE /api/shipments/:id` - Cancel shipment
- [ ] `GET /api/shipments/:id/tracking` - Get tracking events
- [ ] `GET /api/shipments/:id/documents` - Get documents (invoice, etc.)

#### 6.3 Tracking APIs
- [ ] `GET /api/tracking/:trackingNumber` - Public tracking
- [ ] `POST /api/tracking/subscribe` - Subscribe to notifications
- [ ] `DELETE /api/tracking/unsubscribe` - Unsubscribe

#### 6.4 Address Book APIs
- [ ] `GET /api/addresses` - Get saved addresses
- [ ] `POST /api/addresses` - Add new address
- [ ] `PUT /api/addresses/:id` - Update address
- [ ] `DELETE /api/addresses/:id` - Delete address
- [ ] `PUT /api/addresses/:id/default` - Set default

#### 6.5 Payment APIs
- [ ] `GET /api/payments/methods` - Get payment methods
- [ ] `POST /api/payments/methods` - Add payment method
- [ ] `DELETE /api/payments/methods/:id` - Remove payment method
- [ ] `GET /api/payments/history` - Get payment history
- [ ] `POST /api/payments/charge` - Process payment

### Phase 7: UI/UX Enhancements

#### 7.1 Design System
- [ ] Consistent color scheme with landing
- [ ] Custom Tailwind theme
- [ ] Reusable component library
  - [ ] Buttons (primary, secondary, danger)
  - [ ] Inputs (text, select, textarea, date)
  - [ ] Cards
  - [ ] Modals
  - [ ] Toasts/Notifications
  - [ ] Loading spinners
  - [ ] Empty states
  - [ ] Error states

#### 7.2 Responsive Design
- [ ] Mobile-first approach
- [ ] Tablet breakpoints
- [ ] Desktop optimization
- [ ] Touch-friendly interactions
- [ ] Hamburger menu for mobile

#### 7.3 Accessibility
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] High contrast mode
- [ ] Focus indicators

### Phase 8: Advanced Features (Future)

#### 8.1 Real-time Features
- [ ] WebSocket connection for live tracking
- [ ] Real-time notifications
- [ ] Live chat with support
- [ ] Typing indicators

#### 8.2 Multi-language Support
- [ ] i18n integration (react-i18next)
- [ ] Russian translations
- [ ] English translations
- [ ] Language switcher

#### 8.3 Analytics
- [ ] Google Analytics integration
- [ ] Custom events tracking
- [ ] User behavior analysis
- [ ] Conversion tracking

#### 8.4 Performance Optimization
- [ ] Code splitting
- [ ] Lazy loading for routes
- [ ] Image optimization
- [ ] Caching strategies
- [ ] Service worker for offline support

---

## Version 1.2.0 - Admin Enhancements

**Target:** 4-6 weeks

### Enhanced Admin Features

#### Shipment Management
- [ ] Create shipments from leads (convert lead to shipment)
- [ ] Edit shipment details
- [ ] Assign tracking numbers
- [ ] Update shipment status
- [ ] Add tracking events
- [ ] Upload documents (invoices, declarations)

#### User Management
- [ ] View all users (customers and admins)
- [ ] Edit user details
- [ ] Deactivate/reactivate users
- [ ] Reset user passwords
- [ ] View user's shipments

#### Analytics Dashboard
- [ ] Revenue charts (daily, weekly, monthly)
- [ ] Shipments by status (pie chart)
- [ ] Popular routes (bar chart)
- [ ] Conversion rate (leads to shipments)
- [ ] Performance metrics

#### Reporting
- [ ] Generate reports (PDF, Excel)
- [ ] Custom date ranges
- [ ] Filter by various parameters
- [ ] Export data

---

## Version 1.3.0 - Business Features

**Target:** 6-8 weeks

### Payment Integration
- [ ] Stripe integration
- [ ] PayPal integration
- [ ] Bank transfer option
- [ ] Payment status tracking
- [ ] Automatic invoice generation

### Email Notifications
- [ ] SendGrid/Mailgun integration
- [ ] Email templates
  - [ ] Welcome email
  - [ ] Email verification
  - [ ] Password reset
  - [ ] Shipment created
  - [ ] Status updates
  - [ ] Delivery confirmation
- [ ] Email scheduling

### Document Generation
- [ ] Invoice PDF generation
- [ ] Customs declaration forms
- [ ] Packing lists
- [ ] Shipping labels
- [ ] Receipts

---

## Version 2.0.0 - Mobile App

**Target:** 8-12 weeks

### React Native Mobile App
- [ ] iOS app
- [ ] Android app
- [ ] Push notifications
- [ ] QR code scanning
- [ ] Camera integration for documents
- [ ] Offline mode

---

## Technical Debt & Improvements

### Code Quality
- [ ] Fix TypeScript errors in token.ts
- [ ] Add unit tests for API
- [ ] Add integration tests
- [ ] E2E tests with Playwright
- [ ] Code coverage > 80%

### Performance
- [ ] Database query optimization
- [ ] API response caching
- [ ] CDN for static assets
- [ ] Image optimization
- [ ] Lazy loading

### Security
- [ ] Security audit
- [ ] Penetration testing
- [ ] OWASP top 10 compliance
- [ ] Regular dependency updates
- [ ] SSL/TLS certificate monitoring

### DevOps
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated testing in CI
- [ ] Staging environment
- [ ] Database backup automation
- [ ] Monitoring and alerting (Sentry)

---

## Success Metrics

### Phase 1-2 (Portal MVP)
- [ ] 100+ registered users
- [ ] 50+ shipments created through portal
- [ ] <5% bounce rate on registration
- [ ] >80% users verify email

### Phase 3-4 (Full Portal)
- [ ] 500+ active users
- [ ] 200+ shipments/month
- [ ] 4.5+ star rating
- [ ] <2s average page load time

### Long-term
- [ ] 5000+ users
- [ ] 1000+ shipments/month
- [ ] Profitable revenue
- [ ] 95%+ customer satisfaction

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Last Updated: 2025-12-11
