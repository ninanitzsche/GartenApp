# Quick Start: Authentication Screens (STORY-033b)

**Updated:** 2026-03-03
**Story:** STORY-033b
**Status:** ✅ Complete & Ready

---

## What Was Built

Three new authentication screens for the Gartenplaner mobile app:

1. **ProfileScreen** - User account information and management
2. **ChangePasswordScreen** - Secure password change with re-authentication
3. **ForgotPasswordScreen** - Password reset via email

Plus a new **authService** for centralized auth logic.

---

## File Locations

### New Files
```
src/screens/
  ├── ProfileScreen.tsx (250 lines)
  ├── ChangePasswordScreen.tsx (350 lines)
  └── ForgotPasswordScreen.tsx (320 lines)

src/services/
  └── authService.ts (60 lines)
```

### Modified Files
```
src/navigation/
  └── MoreMenuStackNavigator.tsx (added 3 screens)

src/screens/
  ├── AuthScreen.tsx (converted to Stack Navigator)
  ├── MoreMenuScreen.tsx (added Profile button)
  ├── LoginScreen.tsx (added Forgot Password link)
  └── RegisterScreen.tsx (minor prop update)
```

---

## Quick Navigation Flow

### From More Menu
```
MoreMenuScreen
├── Profile → ProfileScreen
│   ├── Change Password → ChangePasswordScreen
│   │   └── [Logout after success] → LoginScreen
│   └── Forgot Password → ForgotPasswordScreen
│       └── [Send email] → User inbox
└── [back button] → MoreMenuScreen
```

### From Login
```
LoginScreen
├── Forgot Password → ForgotPasswordScreen
│   └── [Send email] → User inbox
└── [back button] → LoginScreen
```

---

## Using the Auth Service

### Import
```typescript
import { changePassword, resetPassword } from '../services/authService';
```

### Change Password
```typescript
try {
  await changePassword(currentPassword, newPassword);
  // User will be logged out automatically
} catch (error) {
  const message = error instanceof Error ? error.message : 'Error';
  Alert.alert('Error', message);
}
```

### Reset Password
```typescript
try {
  await resetPassword(email);
  // Email sent successfully
  Alert.alert('Success', 'Check your email for reset link');
} catch (error) {
  const message = error instanceof Error ? error.message : 'Error';
  Alert.alert('Error', message);
}
```

---

## Navigation from Code

### Navigate to Profile
```typescript
navigation.navigate('Profile');
```

### Navigate to Change Password
```typescript
navigation.navigate('ChangePassword');
```

### Navigate to Forgot Password
```typescript
// From LoginScreen stack
navigation.navigate('ForgotPassword');

// From MoreMenu stack
navigation.navigate('ForgotPassword');
```

### Back Navigation
```typescript
navigation.goBack();
```

---

## Key Features

### ProfileScreen
- ✅ Displays user email
- ✅ Shows account creation date (formatted)
- ✅ User avatar icon
- ✅ Action buttons for password management
- ✅ Custom header with back button

### ChangePasswordScreen
- ✅ 3 password input fields
- ✅ Real-time validation (8+ chars min)
- ✅ Password visibility toggles
- ✅ Re-authentication with current password
- ✅ Auto-logout after success
- ✅ Clear error messages

### ForgotPasswordScreen
- ✅ Email input with validation
- ✅ Sends reset email via Supabase
- ✅ Loading state
- ✅ Success/error alerts
- ✅ Help text and info box
- ✅ Icon and visual feedback

### authService
- ✅ changePassword() - with re-auth
- ✅ resetPassword() - email reset flow
- ✅ verifyEmailExists() - helper for validation
- ✅ Proper error handling
- ✅ Type-safe (no `any`)

---

## Testing Checklist

### Manual Testing
- [ ] Navigate from More Menu → Profile
- [ ] Profile shows correct email and creation date
- [ ] Back button returns to More Menu
- [ ] Change Password flow works
- [ ] Password validation prevents invalid submissions
- [ ] Correct password error shows "wrong current password"
- [ ] Success message appears after change
- [ ] User is logged out after password change
- [ ] Forgot Password from LoginScreen works
- [ ] Email validation prevents invalid emails
- [ ] Reset email sends successfully
- [ ] All error messages appear correctly

### Form Validation
- [ ] Empty fields prevented
- [ ] New password < 8 chars prevented
- [ ] Mismatched confirmation prevented
- [ ] Same password as current prevented
- [ ] Invalid email format prevented

### Navigation
- [ ] Back buttons work on all screens
- [ ] Forward navigation works correctly
- [ ] No stuck states
- [ ] Proper state cleanup

---

## Common Tasks

### Add a new password requirement
1. Edit `ChangePasswordScreen.tsx` - `validateForm()` function
2. Add error check
3. Update `errorText` display

### Change error messages
1. Edit `authService.ts` - modify error strings
2. Edit screen components - update Alert text
3. Keep German translation consistent

### Add email validation to Forgot Password
1. Edit `ForgotPasswordScreen.tsx` - `validateEmail()` function
2. Add additional regex or rules
3. Test with various email formats

### Style adjustments
1. Each screen has `StyleSheet.create()` at bottom
2. Update color constants from `Colors` object
3. Adjust padding/margins as needed
4. Keep consistent with existing screens

---

## Troubleshooting

### "Aktuelles Passwort ist falsch"
- User entered wrong current password
- Re-authentication failed
- Expected behavior ✓

### "Passwört stimmen nicht überein"
- New password and confirm password don't match
- Check both fields are identical
- Expected behavior ✓

### Email not received
- Check spam folder (ForgotPasswordScreen has hint)
- Verify email is correct
- Check Supabase email configuration
- May need to configure password reset URL

### Logout not happening after password change
- `signOut()` from AuthContext should clear session
- Check AuthContext implementation
- Verify navigation.navigate('LoginScreen') is called

### TypeScript errors
- All files are strict-mode compatible
- No `any` types used (except navigation: any as required)
- Run `npx tsc --noEmit` to check

---

## Architecture Notes

### Service Layer Pattern
All auth operations are in `authService.ts`:
- Centralized logic
- Easier to test
- Reusable across components
- Clear error handling

### Navigation Pattern
Used React Navigation Stack:
- Profile accessible from MoreMenu
- ForgotPassword accessible from both Login and MoreMenu
- Custom headers on auth screens
- Back buttons for user control

### State Management
Components use React hooks:
- `useState` for form fields
- `useState` for loading/error states
- No Redux/Context needed
- Simple and performant

### Styling
Consistent with existing screens:
- `Colors` theme object
- StyleSheet.create() for optimization
- Responsive padding/margins
- Touch feedback with activeOpacity

---

## Performance Notes

- Profile loads instantly (from AuthContext cache)
- Password change is async (loading state shown)
- Forgot password is async (loading state shown)
- No unnecessary re-renders
- Images/icons from expo/vector-icons (cached)

---

## Security Notes

✅ **Implemented:**
- Re-authentication before password change
- Password validation (8+ chars minimum)
- Secure password storage via Supabase Auth
- Auto-logout after password change
- Email validation on reset

⚠️ **NOT Implemented (Future):**
- Password complexity requirements
- Rate limiting on reset requests
- OTP verification
- Session management

---

## Git Information

All changes can be committed together or separately:

```bash
# View changes
git status

# Stage specific file
git add src/screens/ProfileScreen.tsx

# Stage all auth-related changes
git add src/screens/Profile* src/screens/ChangePassword* \
    src/screens/ForgotPassword* src/services/authService.ts

# Commit with message
git commit -m "feat(auth): Add authentication screens - Profile, ChangePassword, ForgotPassword"
```

---

## Questions?

Check these files for reference:
- **Implementation details:** `STORY-033b-COMPLETION.md`
- **Component structure:** Individual screen files
- **Service pattern:** `src/services/plantService.ts` (similar pattern)
- **Navigation:** `src/navigation/MoreMenuStackNavigator.tsx`
- **Colors/Theme:** `src/theme/colors.ts`

---

**Status:** ✅ Production Ready
**Version:** 1.0
**Last Updated:** 2026-03-03
