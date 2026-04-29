import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { UserLayout } from "../components/user-layout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COMPANY_CHANGE_PASSWORD, USER_PROFILE, USER_UPDATE_PROFILE } from "@/config/api";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";
import { getImageUrl } from "@/lib/image-utils";
import {
  User,
  ShieldCheck,
  Mail,
  Phone,
  LoaderCircle,
  Eye,
  EyeOff,
  Upload,
  X,
  Camera,
  Pencil,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [imgError, setImgError] = useState(false);
  const hasSyncedRef = useRef(false);

  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await apiClient.get(USER_PROFILE, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      if (response.data?.data) return response.data.data;
      if (response.data?.user) return response.data.user;
      return response.data;
    },
    enabled: !!session?.accessToken,
  });

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    mobile_number: "",
    address: "",
    image: null,
  });

  useEffect(() => {
    if (userProfile && !hasSyncedRef.current) {
      // Sync the fetched profile data with the session store to update the UI globally
      const currentName = session?.full_name || session?.name;
      const currentImage = session?.profile_image || session?.image;

      const newName = userProfile.full_name || userProfile.name;
      const newImage = userProfile.profile_image || userProfile.image;

      if (newName !== currentName || newImage !== currentImage) {
        setSession({ ...session, ...userProfile });
      }
      hasSyncedRef.current = true;
    }

    const data = userProfile || session;
    if (data) {
      setProfileForm({
        full_name: data.full_name || data.name || "",
        mobile_number: data.mobile_number || data.phone || data.phone_number || "",
        address: data.address || "",
        image: null,
      });
      if (data.image || data.profile_image) {
        setImagePreview(getImageUrl(data.image || data.profile_image));
      }
    }
  }, [userProfile, session, setSession]);

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      const formData = new FormData();
      formData.append("full_name", payload.full_name.trim());
      formData.append("mobile_number", payload.mobile_number.trim());
      formData.append("address", payload.address.trim());
      if (payload.image) {
        formData.append("profile_image", payload.image);
      }

      const userId = userProfile?.id || session?.id || session?.user_id;
      const response = await apiClient.put(
        USER_UPDATE_PROFILE(userId),
        formData,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Profile updated successfully.");
      setIsEditingProfile(false);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });

      // Update session with the new user data if available
      const updatedUser = data.user || data.data || data.profile || data;
      if (updatedUser && typeof updatedUser === 'object') {
        setSession({ ...session, ...updatedUser });
      }
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Unable to update profile right now.";
      toast.error(message);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.post(COMPANY_CHANGE_PASSWORD, null, {
        params: {
          old_password: payload.current_password,
          new_password: payload.new_password,
          confirm_password: payload.confirm_password,
        },
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Password changed successfully.");
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Unable to change password right now.";
      toast.error(message);
    },
  });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!profileForm.full_name.trim()) {
      toast.error("Full name is required.");
      return;
    }
    updateProfileMutation.mutate(profileForm);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB.");
        return;
      }
      setProfileForm(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImgError(false); // Reset error state for new upload
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileForm(prev => ({ ...prev, image: null }));
    const data = userProfile || session;
    setImagePreview(getImageUrl(data?.image || data?.profile_image || ""));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.current_password) {
      toast.error("Current password is required.");
      return;
    }
    if (passwordForm.new_password.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("Passwords do not match.");
      return;
    }
    changePasswordMutation.mutate(passwordForm);
  };

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "security", label: "Change Password", icon: ShieldCheck },
  ];

  return (
    <UserLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-ink">Account Settings</h1>
          <p className="text-brand-secondary">Manage your profile and security preferences.</p>
        </div>

        <div className="flex flex-col space-y-6">
          <nav className="flex items-center gap-1.5 p-1.5 bg-brand-neutral/50 border border-brand-line/50 rounded-[28px] w-fit overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex items-center gap-2.5 px-6 py-3 text-sm font-bold transition-all duration-300 rounded-[22px] whitespace-nowrap",
                    isActive
                      ? "bg-white text-brand-primary shadow-sm ring-1 ring-brand-line/50"
                      : "text-brand-ink/50 hover:text-brand-ink hover:bg-white/50"
                  )}
                >
                  <Icon className={cn(
                    "size-4.5 transition-colors",
                    isActive ? "text-brand-primary" : "text-brand-ink/40"
                  )} />
                  {tab.label}
                  {isActive && (
                    <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-primary rounded-full hidden" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="rounded-[40px] border border-brand-line bg-white shadow-xl shadow-brand-primary/5 overflow-hidden text-left">
            <div className="border-b border-brand-line px-10 py-8 bg-brand-soft/10">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                  {(() => {
                    const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon;
                    return ActiveIcon ? <ActiveIcon className="size-6 text-brand-primary" /> : null;
                  })()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-ink">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </h2>
                  <p className="text-sm text-brand-secondary mt-1">
                    Configure your {activeTab.toLowerCase()} settings and preferences.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {activeTab === "profile" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-brand-line/50">
                    <div className="relative group">
                      <div className="flex size-32 items-center justify-center rounded-full bg-brand-soft ring-4 ring-white shadow-inner overflow-hidden transition-transform">
                        {imagePreview && !imgError ? (
                          <img
                            src={imagePreview}
                            alt="Profile"
                            className="size-full object-cover"
                            onError={() => setImgError(true)}
                          />
                        ) : (
                          <User className="size-12 text-brand-primary/40" />
                        )}
                      </div>
                      
                      {isEditingProfile && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-1 right-1 size-9 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg hover:bg-brand-primary/90 transition-all hover:scale-110 border-4 border-white"
                        >
                          <Pencil className="size-4.5" />
                        </button>
                      )}

                      {profileForm.image && isEditingProfile && (
                        <button
                          onClick={removeImage}
                          className="absolute -top-1 -right-1 size-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10 border-2 border-white"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                    <div className="text-center sm:text-left space-y-1">
                      <div>
                        <h4 className="font-bold text-brand-ink">Profile Image</h4>
                        <p className="text-xs text-brand-secondary">PNG, JPG or GIF. Max size 2MB.</p>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        disabled={!isEditingProfile}
                      />
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2.5 md:col-span-1">
                      <Label className="text-brand-ink font-semibold">Full Name</Label>
                      <Input
                        disabled={!isEditingProfile}
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Enter your full name"
                        className="h-12 rounded-xl bg-brand-neutral/50 border-brand-line/50 focus:bg-white disabled:opacity-70"
                      />
                    </div>

                    <div className="space-y-2.5 md:col-span-1">
                      <Label className="text-brand-ink font-semibold">Email Address</Label>
                      <Input defaultValue={session?.email} disabled className="h-12 rounded-xl bg-brand-neutral/50 opacity-70 border-brand-line/50" />
                    </div>

                    <div className="space-y-2.5 md:col-span-1">
                      <Label className="text-brand-ink font-semibold">Phone Number</Label>
                      <Input
                        disabled={!isEditingProfile}
                        value={profileForm.mobile_number}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, mobile_number: e.target.value }))}
                        placeholder="Enter your phone number"
                        className="h-12 rounded-xl bg-brand-neutral/50 border-brand-line/50 focus:bg-white disabled:opacity-70"
                      />
                    </div>

                    <div className="space-y-2.5 md:col-span-1">
                      <Label className="text-brand-ink font-semibold">Address</Label>
                      <Input
                        disabled={!isEditingProfile}
                        value={profileForm.address}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter your address"
                        className="h-12 rounded-xl bg-brand-neutral/50 border-brand-line/50 focus:bg-white disabled:opacity-70"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 md:col-span-2">
                      {!isEditingProfile ? (
                        <Button
                          type="button"
                          onClick={() => setIsEditingProfile(true)}
                          className="rounded-2xl h-11 px-8 bg-brand-neutral/80 text-brand-ink hover:bg-brand-neutral shadow-sm"
                        >
                          Edit Profile
                        </Button>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setIsEditingProfile(false);
                              const data = userProfile || session;
                              setProfileForm({
                                full_name: data?.full_name || data?.name || "",
                                mobile_number: data?.mobile_number || data?.phone || data?.phone_number || "",
                                address: data?.address || "",
                                image: null,
                              });
                              setImagePreview(getImageUrl(data?.image || data?.profile_image || ""));
                            }}
                            className="rounded-2xl h-11 px-6 text-brand-secondary hover:text-brand-ink"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                            className="rounded-2xl h-11 px-8 bg-brand-primary text-white hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20"
                          >
                            {updateProfileMutation.isPending ? (
                              <span className="flex items-center gap-2">
                                <LoaderCircle className="size-4 animate-spin" />
                                Saving...
                              </span>
                            ) : "Save Changes"}
                          </Button>
                        </>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <form onSubmit={handleChangePassword} className="space-y-6 pt-2">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2.5">
                        <Label className="text-brand-ink font-semibold">Current Password</Label>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordForm.current_password}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                            placeholder="••••••••"
                            className="h-12 rounded-xl bg-brand-neutral/50 border-brand-line/50 focus:bg-white pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-secondary/50 hover:text-brand-primary transition-colors"
                          >
                            {showCurrentPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-brand-ink font-semibold">New Password</Label>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordForm.new_password}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                            placeholder="••••••••"
                            className="h-12 rounded-xl bg-brand-neutral/50 border-brand-line/50 focus:bg-white pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-secondary/50 hover:text-brand-primary transition-colors"
                          >
                            {showNewPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-brand-ink font-semibold">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordForm.confirm_password}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                            placeholder="••••••••"
                            className="h-12 rounded-xl bg-brand-neutral/50 border-brand-line/50 focus:bg-white pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-secondary/50 hover:text-brand-primary transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <Button
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                        className="rounded-2xl h-11 px-8 bg-brand-primary text-white hover:bg-brand-primary/90"
                      >
                        {changePasswordMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <LoaderCircle className="size-4 animate-spin" />
                            Updating...
                          </span>
                        ) : "Update Password"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
