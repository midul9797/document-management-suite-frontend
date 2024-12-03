"use client";

// ===========================
// Imports
// ===========================
import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { countries } from "@/lib/countries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/zustand/store";
import { ApiGateway } from "@/shared/axios";
import { useAuth } from "@clerk/nextjs";
import { Loading } from "@/components/Loading";

// ===========================
// Form Schema
// ===========================
const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: "First name must be at least 2 characters.",
    })
    .max(30, {
      message: "First name must not be longer than 30 characters.",
    }),
  lastName: z
    .string()
    .min(2, {
      message: "Last name must be at least 2 characters.",
    })
    .max(30, {
      message: "Last name must not be longer than 30 characters.",
    }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(11, {
    message: "Please enter a valid phone.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  country: z.string({
    required_error: "Please select a country.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

function ProfilePage() {
  // ===========================
  // State & Hooks
  // ===========================
  const { user } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(user?.profileImage || undefined);
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  // ===========================
  // Form Configuration
  // ===========================
  const defaultValues: Partial<ProfileFormValues> = {
    firstName: user?.name.split(" ")[0],
    lastName: user?.name.split(" ")[1],
    email: user?.email,
    address: user?.address || "",
    country: user?.country || "",
    phone: user?.phone || "",
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // ===========================
  // Event Handlers
  // ===========================
  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true);
    const fullName = data.firstName + " " + data.lastName;
    const payload = {
      name: fullName,
      address: data.address || "",
      country: data.country || "",
      phone: data.phone || "",
      profileImage: avatar || "",
    };
    const token = await getToken();

    const res = await ApiGateway.patch("/user", payload, {
      headers: { Authorization: token },
    });

    if (res) {
      alert("Profile updated successfully!");
    }
    setLoading(false);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // ===========================
  // Render Component
  // ===========================

  return (
    <div className="container mx-auto py-10">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-5 text-center">Your Profile</h1>
      {/* Profile Card */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Profile Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar
                  className="w-32 h-32 cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <AvatarImage src={avatar} alt="Profile picture" />
                  <AvatarFallback>
                    {form.watch("firstName")?.[0]}
                    {form.watch("lastName")?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                <p className="text-sm text-muted-foreground">
                  Click on the avatar to change your profile picture
                </p>
              </div>
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john.doe@example.com"
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormDescription>
                      Your email address cannot be changed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Phone Field */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+8801811111111" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Address Field */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Main St, Anytown, AN 12345"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Country Field */}
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Update profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
export default ProfilePage;
