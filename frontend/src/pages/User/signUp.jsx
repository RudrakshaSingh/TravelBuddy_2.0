import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-6xl flex shadow-2xl rounded-2xl overflow-hidden bg-white min-h-[600px]">
        {/* Left Side - Branding & Visuals */}
        <div className="hidden lg:flex flex-col justify-center items-center w-1/2 relative bg-gradient-to-br from-orange-200 via-orange-300 to-orange-500 text-white p-12">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

          <div className="relative z-10 text-center">
            <h1 className="text-5xl font-bold mb-6 tracking-tight">TravelBuddy</h1>
            <p className="text-xl font-light opacity-90 leading-relaxed mb-8">
              Discover new destinations, meet fellow travelers, and create unforgettable memories.
            </p>
            <div className="flex gap-4 justify-center">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
              <div className="h-2 w-2 rounded-full bg-white/60"></div>
              <div className="h-2 w-2 rounded-full bg-white/60"></div>
            </div>
          </div>

          <div className="absolute bottom-8 text-sm opacity-60">
            © 2025 TravelBuddy Inc.
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl="/complete-registration"
          />
        </div>
      </div>
    </div>
  );
}
