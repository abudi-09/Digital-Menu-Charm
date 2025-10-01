import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, Phone, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { VerificationState } from '@/types/admin';

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().min(10, 'Phone must be at least 10 digits').max(15, 'Phone too long'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const ProfileManagement = () => {
  const { toast } = useToast();
  const [emailVerification, setEmailVerification] = useState<VerificationState>({ status: 'idle' });
  const [phoneVerification, setPhoneVerification] = useState<VerificationState>({ status: 'idle' });

  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: 'John Doe',
      email: 'admin@grandvista.com',
      phone: '+1234567890',
    },
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    // Simulate email/phone verification requirement
    const emailChanged = data.email !== 'admin@grandvista.com';
    const phoneChanged = data.phone !== '+1234567890';

    if (emailChanged) {
      setEmailVerification({ status: 'pending', message: 'Verification email sent' });
      toast({
        title: 'Email verification required',
        description: 'Please check your email to verify the new address',
      });
    }

    if (phoneChanged) {
      setPhoneVerification({ status: 'pending', message: 'Verification code sent' });
      toast({
        title: 'Phone verification required',
        description: 'Please check your phone for the verification code',
      });
    }

    if (!emailChanged && !phoneChanged) {
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been saved',
      });
    }
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    // Simulate password change
    toast({
      title: 'Password changed',
      description: 'Your password has been updated successfully',
    });
    resetPassword();
  };

  const handleVerifyEmail = () => {
    setEmailVerification({ status: 'confirmed', message: 'Email verified' });
    toast({
      title: 'Email verified',
      description: 'Your new email address has been confirmed',
    });
  };

  const handleVerifyPhone = () => {
    setPhoneVerification({ status: 'confirmed', message: 'Phone verified' });
    toast({
      title: 'Phone verified',
      description: 'Your new phone number has been confirmed',
    });
  };

  const VerificationBadge = ({ state }: { state: VerificationState }) => {
    if (state.status === 'idle') return null;

    const config = {
      pending: { icon: AlertCircle, color: 'bg-yellow-500/10 text-yellow-600', text: 'Pending Verification' },
      confirmed: { icon: CheckCircle2, color: 'bg-green-500/10 text-green-600', text: 'Verified' },
      error: { icon: AlertCircle, color: 'bg-destructive/10 text-destructive', text: 'Verification Failed' },
    };

    const { icon: Icon, color, text } = config[state.status] || config.pending;

    return (
      <Badge className={`${color} gap-1`}>
        <Icon className="w-3 h-3" />
        {text}
      </Badge>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-2">Profile Management</h1>
        <p className="text-muted-foreground">Manage your account information and security settings</p>
      </div>

      {/* Profile Information */}
      <Card className="p-6 bg-gradient-card border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-serif text-foreground">Profile Information</h2>
            <p className="text-sm text-muted-foreground">Update your personal details</p>
          </div>
        </div>

        <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...registerProfile('name')}
              className={profileErrors.name ? 'border-destructive' : ''}
            />
            {profileErrors.name && (
              <p className="text-xs text-destructive">{profileErrors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email">Email Address</Label>
              <VerificationBadge state={emailVerification} />
            </div>
            <Input
              id="email"
              type="email"
              {...registerProfile('email')}
              className={profileErrors.email ? 'border-destructive' : ''}
            />
            {profileErrors.email && (
              <p className="text-xs text-destructive">{profileErrors.email.message}</p>
            )}
            {emailVerification.status === 'pending' && (
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-yellow-600">{emailVerification.message}</p>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={handleVerifyEmail}
                    className="h-auto p-0 text-yellow-600 hover:text-yellow-700"
                  >
                    Click here to verify (demo)
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="phone">Phone Number</Label>
              <VerificationBadge state={phoneVerification} />
            </div>
            <Input
              id="phone"
              type="tel"
              {...registerProfile('phone')}
              className={profileErrors.phone ? 'border-destructive' : ''}
            />
            {profileErrors.phone && (
              <p className="text-xs text-destructive">{profileErrors.phone.message}</p>
            )}
            {phoneVerification.status === 'pending' && (
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-yellow-600">{phoneVerification.message}</p>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={handleVerifyPhone}
                    className="h-auto p-0 text-yellow-600 hover:text-yellow-700"
                  >
                    Click here to verify (demo)
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Save Changes
          </Button>
        </form>
      </Card>

      <Separator />

      {/* Change Password */}
      <Card className="p-6 bg-gradient-card border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-serif text-foreground">Change Password</h2>
            <p className="text-sm text-muted-foreground">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              {...registerPassword('currentPassword')}
              className={passwordErrors.currentPassword ? 'border-destructive' : ''}
            />
            {passwordErrors.currentPassword && (
              <p className="text-xs text-destructive">{passwordErrors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              {...registerPassword('newPassword')}
              className={passwordErrors.newPassword ? 'border-destructive' : ''}
            />
            {passwordErrors.newPassword && (
              <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...registerPassword('confirmPassword')}
              className={passwordErrors.confirmPassword ? 'border-destructive' : ''}
            />
            {passwordErrors.confirmPassword && (
              <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>
            )}
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Password requirements:</strong>
              <br />• Minimum 6 characters
              <br />• Contains letters and numbers (recommended)
              <br />• Different from previous passwords
            </p>
          </div>

          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Change Password
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ProfileManagement;
