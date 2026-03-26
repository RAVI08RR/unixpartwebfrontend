"use client";

import React from "react";
import { ShieldAlert, Lock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PermissionAlert({ isOpen, onClose, action = "perform this action", resource = "this resource" }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Alert Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-red-200 dark:border-red-900/50"
            >
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Access Denied</h3>
                    <p className="text-red-100 text-sm">Insufficient Permissions</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Permission Required
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      You don't have permission to <span className="font-semibold text-red-600 dark:text-red-400">{action}</span> for {resource}.
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-3">
                      Please contact your administrator to request access.
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
