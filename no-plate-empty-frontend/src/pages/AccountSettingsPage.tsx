import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  KeyRound,
  LogOut,
  Save,
  Settings,
  Trash2,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage, getRoleHomePath, getRoleLabel } from "@/lib/auth";
import {
  deleteCurrentUserAccount,
  resetCurrentUserPassword,
  updateCurrentUser,
} from "@/lib/account-api";

const AccountSettingsPage = () => {
  const navigate = useNavigate();
  const { clearSession, logout, refreshUser, token, user } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfileForm({
      name: user.name || "",
      email: user.email || "",
    });
  }, [user]);

  if (!token || !user) {
    return null;
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await logout();
    navigate("/login", { replace: true });
  };

  const handleProfileUpdate = async () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileMessage({
        type: "error",
        text: "Name and email are required.",
      });
      return;
    }

    setIsSavingProfile(true);
    setProfileMessage(null);

    try {
      const response = await updateCurrentUser(token, {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
      });
      await refreshUser();
      setProfileMessage({
        type: "success",
        text: response.message || "Account details updated successfully.",
      });
    } catch (error) {
      setProfileMessage({
        type: "error",
        text: getErrorMessage(error, "Unable to update your account details."),
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordMessage({
        type: "error",
        text: "Fill in all password fields first.",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "New password and confirm password do not match.",
      });
      return;
    }

    setIsSavingPassword(true);
    setPasswordMessage(null);

    try {
      const response = await resetCurrentUserPassword(token, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMessage({
        type: "success",
        text: response.message || "Password updated successfully.",
      });
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: getErrorMessage(error, "Unable to update your password."),
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteMessage({
        type: "error",
        text: "Enter your password to delete the account.",
      });
      return;
    }

    setIsDeletingAccount(true);
    setDeleteMessage(null);

    try {
      await deleteCurrentUserAccount(token, deletePassword);
      clearSession();
      navigate("/", { replace: true });
    } catch (error) {
      setDeleteMessage({
        type: "error",
        text: getErrorMessage(error, "Unable to delete your account."),
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const roleHomePath = getRoleHomePath(user.role);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.14),_transparent_30%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.3))]">
      <header className="border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Heart className="h-5 w-5 fill-current text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">
              NoPlate<span className="text-secondary">Empty</span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{getRoleLabel(user.role)}</Badge>
            <Button variant="outline" asChild>
              <Link to={roleHomePath}>Back to Workspace</Link>
            </Button>
            <Button onClick={() => void handleSignOut()} disabled={isSigningOut}>
              <LogOut className="mr-2 h-4 w-4" />
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="rounded-[2rem] border border-border/60 bg-background/92 p-8 shadow-xl">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">
            Account Settings
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight font-display text-foreground sm:text-5xl">
            Manage your profile, password, and account access.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            This page is wired to the backend account endpoints for updating your
            profile, changing your password, and deleting your account.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Badge variant="outline">{user.email}</Badge>
            <Badge variant={user.isApproved ? "secondary" : "outline"}>
              {user.isApproved ? "Approved" : "Pending Approval"}
            </Badge>
            <Badge variant={user.isBlocked ? "destructive" : "outline"}>
              {user.isBlocked ? "Blocked" : "Active"}
            </Badge>
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-border/60 bg-background/92 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5 text-primary" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Connected to `PATCH /api/auth/me`.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileMessage && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    profileMessage.type === "success"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {profileMessage.text}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="settings-name">Name</Label>
                <Input
                  id="settings-name"
                  value={profileForm.name}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-email">Email</Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={profileForm.email}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </div>

              <Button onClick={() => void handleProfileUpdate()} disabled={isSavingProfile}>
                <Save className="mr-2 h-4 w-4" />
                {isSavingProfile ? "Saving..." : "Save Profile Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/92 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Account Summary
              </CardTitle>
              <CardDescription>
                Current session details loaded from your backend-authenticated user.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Signed In As
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {user.name}
                </p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Role
                  </p>
                  <p className="mt-2 font-semibold text-foreground">
                    {getRoleLabel(user.role)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Status
                  </p>
                  <p className="mt-2 font-semibold text-foreground">
                    {user.isBlocked ? "Blocked" : "Active"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/92 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                Change Password
              </CardTitle>
              <CardDescription>
                Connected to `PATCH /api/auth/reset-password`.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordMessage && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    passwordMessage.type === "success"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                />
              </div>

              <Button
                onClick={() => void handlePasswordUpdate()}
                disabled={isSavingPassword}
              >
                {isSavingPassword ? "Updating..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/25 bg-background/92 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Delete Account
              </CardTitle>
              <CardDescription>
                Connected to `DELETE /api/auth/me`. This action permanently removes
                the signed-in user.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {deleteMessage && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {deleteMessage.text}
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                Enter your current password to confirm permanent account deletion.
              </p>
              <div className="space-y-2">
                <Label htmlFor="delete-password">Password Confirmation</Label>
                <Input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                />
              </div>

              <Button
                variant="destructive"
                onClick={() => void handleDeleteAccount()}
                disabled={isDeletingAccount}
              >
                {isDeletingAccount ? "Deleting..." : "Delete My Account"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AccountSettingsPage;
