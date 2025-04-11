"use client"
import React, { Suspense } from 'react';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import AuthProvider from './AuthProvider';
import { Loader2Icon } from 'lucide-react';

const Provider = ({children}) => {
    const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);
  return (
      <Suspense fallback={<div className="h-screen w-screen flex justify-center items-center">
          <Loader2Icon size={50} className="animate-spin text-primary" />
        </div>}>
          <ConvexProvider client={convex}>
              <AuthProvider>
                  {children}
                </AuthProvider>
          </ConvexProvider>
      </Suspense>
  )
}

export default Provider