"use client";

import React from "react";
import Link from "next/link";
import { 
  User, 
  Shield, 
  Settings as SettingsIcon, 
  ChevronRight,
  Bell,
  Lock,
  Globe,
  Palette,
  CreditCard,
  MessageSquare,
  Building2
} from "lucide-react";

export default function SettingsHubPage() {
  const settingsGroups = [
    {
      title: "Account & Profile",
      description: "Manage your personal information and account security",
      items: [
        {
          title: "My Profile",
          description: "View and edit your personal details, email and avatar",
          href: "/dashboard/settings/profile",
          icon: <User className="w-5 h-5 text-blue-600" />,
          color: "blue"
        },
        {
          title: "Login & Security",
          description: "Change your password and manage two-factor authentication",
          href: "/dashboard/settings/security",
          icon: <Lock className="w-5 h-5 text-red-600" />,
          color: "red"
        },
      ]
    },
    {
      title: "System & Governance",
      description: "Access control and organization-wide configurations",
      items: [
        {
          title: "Permissions",
          description: "Define system roles and granular access permissions",
          href: "/dashboard/settings/permissions",
          icon: <Shield className="w-5 h-5 text-purple-600" />,
          color: "purple"
        },
        {
          title: "Branch Management",
          description: "Configure branches and local operational settings",
          href: "/dashboard/administration/branches",
          icon: <Building2 className="w-5 h-5 text-orange-600" />,
          color: "orange"
        },
      ]
    },
    {
      title: "Preferences",
      description: "Customize your dashboard experience",
      items: [
        {
          title: "Notifications",
          description: "Control which alerts and emails you receive",
          href: "/dashboard/settings/notifications",
          icon: <Bell className="w-5 h-5 text-yellow-600" />,
          color: "yellow"
        },
        {
          title: "Appearance",
          description: "Switch between light/dark mode and choose accent colors",
          href: "/dashboard/settings/appearance",
          icon: <Palette className="w-5 h-5 text-teal-600" />,
          color: "teal"
        },
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black dark:text-white tracking-tight">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Central control panel for your account and the system</p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {settingsGroups.map((group, i) => (
          <div key={i} className="space-y-6">
            <div className="px-2">
              <h2 className="text-xl font-black dark:text-white">{group.title}</h2>
              <p className="text-sm text-gray-400 font-medium mt-1">{group.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.items.map((item, j) => (
                <Link 
                  key={j}
                  href={item.href}
                  className="group bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-[28px] shadow-sm hover:shadow-xl hover:border-red-600/20 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-[20px] bg-${item.color}-50 dark:bg-${item.color}-900/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-black text-gray-900 dark:text-white group-hover:text-red-600 transition-colors uppercase tracking-tight text-sm">
                          {item.title}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-medium leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Help Banner */}
      <div className="bg-black dark:bg-white rounded-[32px] p-10 text-white dark:text-black relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-1000">
            <SettingsIcon className="w-32 h-32" />
         </div>
         <div className="relative z-10 space-y-4">
            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Need Assistance?</h3>
            <p className="text-gray-400 dark:text-gray-500 max-w-lg font-medium">If you need help configuring system-wide settings or have questions about your access level, please contact the IT Administrator.</p>
            <button className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
               <MessageSquare className="w-4 h-4" />
               Contact Support
            </button>
         </div>
      </div>
    </div>
  );
}
