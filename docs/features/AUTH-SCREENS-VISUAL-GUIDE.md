# Authentication Screens: Visual & Interaction Guide

**Story:** STORY-033b
**Date:** 2026-03-03
**Status:** ✅ Complete

---

## Screen 1: ProfileScreen

### Visual Layout

```
┌─────────────────────────────────┐
│ [<] Profil                      │  ← Custom Green Header
├─────────────────────────────────┤
│                                 │
│          [User Icon]            │  ← Large Account Icon
│        user@example.com         │  ← Email from AuthContext
│                                 │
├─────────────────────────────────┤
│ KONTOINFORMATIONEN              │  ← Section Title
├─────────────────────────────────┤
│  [📅] Konto erstellt am        │
│       3. März 2026             │  ← Formatted Date
├─────────────────────────────────┤
│ KONTO VERWALTEN                 │  ← Section Title
├─────────────────────────────────┤
│  [🔒] Passwort ändern      [>]  │  ← Button
│       Ihr Passwort aktualisieren│
├─────────────────────────────────┤
│  [❓] Passwort zurücksetzen [>] │  ← Button
│       Passwort vergessen?       │
├─────────────────────────────────┤
│                                 │
│                                 │
└─────────────────────────────────┘
```

### Interactions
- **Back Button** → Returns to MoreMenuScreen
- **"Passwort ändern"** → Navigates to ChangePasswordScreen
- **"Passwort zurücksetzen"** → Navigates to ForgotPasswordScreen
- **Scrollable** if content exceeds screen height

### Colors & Styling
- Header: Green (#4CAF50)
- Text: Dark gray (#424242)
- Icons: Green (#4CAF50)
- Background: Light gray (#FAFAFA)
- Surface: White (#FFFFFF)

---

## Screen 2: ChangePasswordScreen

### Visual Layout

```
┌─────────────────────────────────┐
│ [<] Passwort ändern             │  ← Custom Green Header
├─────────────────────────────────┤
│ Geben Sie Ihr aktuelles         │  ← Instructions
│ Passwort ein und wählen Sie ein │
│ neues Passwort.                 │
├─────────────────────────────────┤
│ AKTUELLES PASSWORT              │  ← Label
│ ┌─────────────────────────────┐ │
│ │ ••••••••          [👁]      │ │  ← Input + Eye Toggle
│ └─────────────────────────────┘ │
│ ❌ Error message (if any)       │
├─────────────────────────────────┤
│ NEUES PASSWORT                  │  ← Label
│ ┌─────────────────────────────┐ │
│ │ ••••••••          [👁]      │ │  ← Input + Eye Toggle
│ └─────────────────────────────┘ │
│ ℹ️ Mindestens 8 Zeichen erforderlich
├─────────────────────────────────┤
│ PASSWORT BESTÄTIGEN             │  ← Label
│ ┌─────────────────────────────┐ │
│ │ ••••••••          [👁]      │ │  ← Input + Eye Toggle
│ └─────────────────────────────┘ │
│ ❌ Error message (if any)       │
├─────────────────────────────────┤
│  [ Passwort ändern ]            │  ← Green Button
│  [ Abbrechen ]                  │  ← Border Button
├─────────────────────────────────┤
│                                 │
└─────────────────────────────────┘
```

### Form Validation Flow

```
User Enters Data
    ↓
Click "Passwort ändern"
    ↓
Validate Form:
  ├─ Current Password Empty? → Error: "erforderlich"
  ├─ New Password Empty? → Error: "erforderlich"
  ├─ New Password < 8 chars? → Error: "mindestens 8"
  ├─ Confirm Password Empty? → Error: "erforderlich"
  ├─ Passwords Don't Match? → Error: "stimmen nicht"
  └─ Same as Current? → Error: "unterscheiden"
    ↓
All Valid?
  ├─ NO → Show Errors (Stop)
  └─ YES → Continue
    ↓
Loading State (Spinner)
    ↓
Call authService.changePassword()
    ↓
Success:
  ├─ Alert: "Passwort erfolgreich geändert"
  ├─ Call signOut()
  └─ Navigate to LoginScreen
    ↓
Error:
  ├─ Alert: Error Message
  └─ Stop (User can try again)
```

### Password Visibility Toggle
- User can click eye icon to toggle visibility
- Works independently on each field
- State updates without validation

### Interactions
- **Eye Icons** → Toggle password visibility (●●●●●●●● ↔ password)
- **"Passwort ändern"** → Submit form (validates, then changes)
- **"Abbrechen"** → Go back to ProfileScreen
- **Back Gesture** → Also returns to ProfileScreen

---

## Screen 3: ForgotPasswordScreen

### Visual Layout

```
┌─────────────────────────────────┐
│ [<] Passwort zurücksetzen       │  ← Custom Green Header
├─────────────────────────────────┤
│                                 │
│            [🔐↻]                │  ← Large Icon
│                                 │
│      Passwort vergessen?        │  ← Title
│                                 │
│ Geben Sie die E-Mail-Adresse    │  ← Instructions
│ ein, die mit Ihrem Konto        │  ← (multiple lines)
│ verknüpft ist, und wir senden   │
│ Ihnen einen Link zum            │
│ Zurücksetzen Ihres Passworts.   │
│                                 │
├─────────────────────────────────┤
│ E-MAIL-ADRESSE                  │  ← Label
│ ┌─────────────────────────────┐ │
│ │ [✉] email@example.com  [✕]  │ │  ← Input with icons
│ └─────────────────────────────┘ │
│ ❌ Error message (if any)       │
├─────────────────────────────────┤
│ ℹ️ Sie erhalten einen Link per  │  ← Info Box (blue)
│    E-Mail, um Ihr Passwort      │
│    sicher zurückzusetzen.       │
├─────────────────────────────────┤
│  [📨 Passwort-Link senden]      │  ← Green Button
│  [ Abbrechen ]                  │  ← Border Button
│                                 │
│ Falls Sie die E-Mail nicht      │  ← Help Text
│ erhalten haben, überprüfen Sie  │
│ Ihren Spam-Ordner.              │
│                                 │
└─────────────────────────────────┘
```

### Email Validation Flow

```
User Types Email
    ↓
Click "Passwort-Link senden"
    ↓
Validate Email:
  ├─ Empty? → Error: "erforderlich"
  ├─ Invalid Format? → Error: "gültige E-Mail"
  └─ Valid? → Continue
    ↓
Loading State (Spinner)
    ↓
Call resetPassword(email)
    ↓
Success:
  ├─ Alert: "Link zum Zurücksetzen..."
  └─ Navigate back to LoginScreen
    ↓
Error:
  ├─ Alert: Error Message
  ├─ Show error below email field
  └─ Stop (User can try again)
```

### Clear Button Behavior
- Only shows when email field has text
- Clears email and removes error message
- Restores initial state

### Interactions
- **Email Input** → Type email address (clears errors)
- **Clear Button [✕]** → Clears email field
- **"Passwort-Link senden"** → Validates and sends (loading state)
- **"Abbrechen"** → Returns to LoginScreen
- **Back Gesture** → Also returns to LoginScreen

---

## Navigation Flow Diagram

### From More Menu
```
MoreMenuScreen
    │
    ├─ [Profile]
    │    │
    │    ├─ [Passwort ändern]
    │    │    │
    │    │    └─ [Success] → Logout → LoginScreen
    │    │
    │    └─ [Passwort zurücksetzen]
    │         │
    │         └─ [Success] → Back to ProfileScreen
    │
    └─ [Back] → TabNavigator
```

### From Login (Auth Stack)
```
LoginScreen
    │
    ├─ [Passwort vergessen?]
    │    │
    │    └─ ForgotPasswordScreen
    │         │
    │         └─ [Success/Back] → LoginScreen
    │
    └─ [Registrieren] → RegisterScreen
```

---

## User Experience Details

### Loading States
- Spinner appears during async operations
- Buttons disabled during loading
- Input fields disabled (prevent re-submission)
- Text remains readable during loading

### Error Handling
**Real-time Validation:**
- Show errors only after user interaction
- Clear errors when user starts correcting
- Field-level error messages

**Submission Errors:**
- Alert popup for serious errors
- Field-level text for validation errors
- Non-blocking (user can try again)

### Success Feedback
- Toast/Alert with confirmation message
- Auto-navigation to next screen
- Clear message in user language (German)

### Accessibility
- Proper labels for all inputs
- Icon + Text for clarity
- Good contrast ratios
- Touch targets ≥ 44px
- Error messages clearly visible

---

## Color Scheme

| Element | Color | Code |
|---------|-------|------|
| Headers | Green | #4CAF50 |
| Buttons | Green | #4CAF50 |
| Text | Dark Gray | #424242 |
| Secondary Text | Light Gray | #757575 |
| Borders | Light Gray | #E0E0E0 |
| Background | Off-White | #FAFAFA |
| Surface | White | #FFFFFF |
| Error | Red | #F44336 |
| Info | Blue | #2196F3 |
| Success | Green | #4CAF50 |

---

## Input Fields

### Style Specification
```typescript
Input Container: {
  borderWidth: 1,
  borderColor: #E0E0E0,
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 12,
  flexDirection: 'row',
  alignItems: 'center',
}

Input Text: {
  fontSize: 16,
  color: #424242,
}

Placeholder: {
  color: #BDBDBD,
}

Error State: {
  borderColor: #F44336,
}
```

### Error Field Example
```
CURRENT PASSWORD                          ← Label (Error Color)
┌─────────────────────────────────────────┐
│ ••••••••          [👁]                  │ ← Red Border
└─────────────────────────────────────────┘
❌ Aktuelles Passwort ist falsch        ← Error Message
```

---

## Button States

### Primary Buttons (Green)
```
Normal State:
  ┌──────────────────────────┐
  │ Passwort ändern          │ (Green)
  └──────────────────────────┘

Active/Pressed:
  ┌──────────────────────────┐
  │ Passwort ändern          │ (Green, slight highlight)
  └──────────────────────────┘

Disabled State:
  ┌──────────────────────────┐
  │ Passwort ändern          │ (Green, 60% opacity)
  └──────────────────────────┘

Loading State:
  ┌──────────────────────────┐
  │ [⟳ spinning]             │ (Spinner, disabled)
  └──────────────────────────┘
```

### Secondary Buttons (Border)
```
Normal State:
  ┌──────────────────────────┐
  │ Abbrechen                │ (Border, gray text)
  └──────────────────────────┘

Active/Pressed:
  ┌──────────────────────────┐
  │ Abbrechen                │ (Border, slight background)
  └──────────────────────────┘

Disabled State:
  ┌──────────────────────────┐
  │ Abbrechen                │ (Border, low opacity)
  └──────────────────────────┘
```

---

## Responsive Design

### Portrait (Mobile)
- Full width inputs
- Stacked layout
- Touch-friendly spacing
- Scrollable if needed

### Landscape (Tablet)
- Same layout (scales well)
- Larger touch targets
- Proper safe areas

### All Devices
- Safe area insets respected
- Keyboard avoiding view
- Consistent padding/margins

---

## Success Alerts

### Change Password Success
```
┌─────────────────────────────────┐
│            Erfolg               │
├─────────────────────────────────┤
│ Passwort erfolgreich geändert.  │
│ Sie werden abgemeldet.          │
├─────────────────────────────────┤
│              [ OK ]             │
└─────────────────────────────────┘
↓ (User clicks OK)
User is logged out
Navigate to LoginScreen
```

### Forgot Password Success
```
┌─────────────────────────────────┐
│     Passwort zurücksetzen       │
├─────────────────────────────────┤
│ Ein Link zum Zurücksetzen       │
│ Ihres Passworts wurde an Ihre   │
│ E-Mail-Adresse gesendet.        │
├─────────────────────────────────┤
│              [ OK ]             │
└─────────────────────────────────┘
↓ (User clicks OK)
Navigate back to previous screen
```

---

## Summary

This visual guide covers:
- Screen layouts and structure
- Form validation flows
- User interactions
- Navigation patterns
- Styling and colors
- Error handling
- Loading states
- Success feedback

All screens follow the same design patterns for consistency and usability.

**Status:** ✅ Production Ready
**Last Updated:** 2026-03-03
