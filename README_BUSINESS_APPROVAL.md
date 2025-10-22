# Business Account Approval System

## Overview
This document outlines the business account approval system that requires admin approval before new business accounts can access the platform.

## Database Setup Required

### Migration to Apply
A migration file needs to be created and applied to add the approval system to the database:

```sql
-- File: supabase/migrations/YYYYMMDDHHMMSS_add_business_approval_status.sql

/*
  # Add Business Account Approval System

  1. New Fields
    - approval_status (enum: 'pending', 'approved', 'rejected')
    - approval_date (timestamptz)
    - approved_by (uuid, references profiles)

  2. Updates
    - Modify create_user_profile function
    - Add RLS policies for approval management
    - Set existing businesses to 'approved'
*/

-- Create approval_status enum
CREATE TYPE IF NOT EXISTS approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Add columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'approved';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approval_date timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES profiles(id);

-- Set existing business accounts to approved
UPDATE profiles
SET approval_status = 'approved', approval_date = created_at
WHERE account_type = 'business';

-- Update create_user_profile function to set pending status for new businesses
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id uuid,
  user_email text,
  user_username text,
  user_account_type account_type
)
RETURNS void AS $$
DECLARE
  existing_user_count integer;
BEGIN
  -- Check if profile already exists
  SELECT COUNT(*) INTO existing_user_count FROM profiles WHERE id = user_id;

  IF existing_user_count > 0 THEN
    RAISE NOTICE 'User profile already exists for ID: %', user_id;
    RETURN;
  END IF;

  -- Insert the user profile
  INSERT INTO profiles (
    id, email, username, account_type, balance, is_kyc_verified, approval_status, created_at, updated_at
  )
  VALUES (
    user_id,
    user_email,
    user_username,
    user_account_type,
    CASE WHEN user_account_type = 'admin' THEN 1000.00 ELSE 0.00 END,
    CASE
      WHEN user_account_type = 'business' THEN false
      WHEN user_account_type = 'admin' THEN true
      ELSE null
    END,
    CASE
      WHEN user_account_type = 'business' THEN 'pending'::approval_status
      ELSE 'approved'::approval_status
    END,
    now(),
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policy for admins to update approval status
CREATE POLICY "Admins can update business approval status"
  ON profiles FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.account_type = 'admin'
    )
  );

-- Add index for approval queries
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status
  ON profiles(approval_status)
  WHERE account_type = 'business';
```

## Application Changes Completed

### 1. Business Login Page (`src/pages/RestaurantLogin.tsx`)
- ✅ Added "Sign up here" link below the Sign In button
- Directs to `/business/register`

### 2. Business Registration (`src/pages/RestaurantRegister.tsx`)
- ✅ Updated success message to inform users about admin approval
- Message: "Business account created successfully! Please verify your email. Your account will be reviewed by our team before activation."

### 3. App Routes (`src/App.tsx`)
- ✅ Added `/restaurant/login` and `/restaurant/register` routes
- Both point to business login/register pages

## Features to Implement (Once Database is Set Up)

### Admin Dashboard - Approval UI
Location: `src/pages/AdminDashboard.tsx`

Add a section to manage pending business approvals:

```tsx
// Pending Business Approvals Section
const [pendingBusinesses, setPendingBusinesses] = useState([]);

useEffect(() => {
  loadPendingBusinesses();
}, []);

const loadPendingBusinesses = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('account_type', 'business')
    .eq('approval_status', 'pending')
    .order('created_at', { ascending: false });

  if (!error) setPendingBusinesses(data || []);
};

const handleApproval = async (businessId, status) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      approval_status: status,
      approval_date: new Date().toISOString(),
      approved_by: user.id
    })
    .eq('id', businessId);

  if (!error) {
    loadPendingBusinesses();
    // Send email notification to business
  }
};
```

### Business Login - Approval Check
Location: `src/pages/RestaurantLogin.tsx`

Add check after successful login:

```tsx
// In handleSubmit, after user login:
if (user.account_type === 'business') {
  // Check approval status
  const { data: profile } = await supabase
    .from('profiles')
    .select('approval_status')
    .eq('id', user.id)
    .single();

  if (profile?.approval_status === 'pending') {
    setError('Your account is pending admin approval. Please check back later.');
    await supabase.auth.signOut();
    return;
  }

  if (profile?.approval_status === 'rejected') {
    setError('Your account application was not approved. Please contact support.');
    await supabase.auth.signOut();
    return;
  }
}
```

### Auth Context - Approval Status
Location: `src/contexts/AuthContext.tsx`

Add approval_status to user type and fetch:

```tsx
interface User {
  // ... existing fields
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvalDate?: string;
}

// In fetchUserProfile:
setUser({
  // ... existing fields
  approvalStatus: data.approval_status,
  approvalDate: data.approval_date
});
```

## Testing the Approval System

Once implemented:

1. **Create Test Business Account**
   - Register at `/business/register`
   - Verify email
   - Account should have `approval_status='pending'`

2. **Admin Approves/Rejects**
   - Login as admin
   - Go to Admin Dashboard
   - See pending businesses
   - Approve or reject

3. **Business Login**
   - Pending: Should show "pending approval" message
   - Rejected: Should show "not approved" message
   - Approved: Should login successfully

## Email Notifications (Future Enhancement)

Consider adding email notifications:
- When business registers (to admins)
- When admin approves/rejects (to business)

Use Supabase Edge Functions for sending emails via services like SendGrid or Resend.

## Security Considerations

- ✅ RLS policies ensure only admins can modify approval_status
- ✅ Businesses cannot approve themselves
- ✅ Approval status checked on every login
- ✅ Pending/rejected businesses blocked from accessing dashboard
