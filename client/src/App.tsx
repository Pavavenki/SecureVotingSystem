import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Page imports
import Welcome from "@/pages/welcome";
import AadhaarLogin from "@/pages/aadhaar-login";
import AadhaarDashboard from "@/pages/aadhaar-dashboard";
import AadhaarSimple from "@/pages/aadhaar-simple";
import VotingLogin from "@/pages/voting-login";
import VoterVerification from "@/pages/voter-verification";
import BiometricVerification from "@/pages/biometric-verification";
import VotingInterface from "@/pages/voting-interface";
import VoteConfirmation from "@/pages/vote-confirmation";
import VotingAdminDashboard from "@/pages/voting-admin-dashboard";
import VoterProfile from "@/pages/voter-profile";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();

  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/aadhaar/login" component={AadhaarLogin} />
      <Route path="/aadhaar/dashboard" component={AadhaarSimple} />
      <Route path="/voting/login" component={VotingLogin} />
      <Route path="/voting/verification" component={VoterVerification} />
      <Route path="/voting/biometric" component={BiometricVerification} />
      <Route path="/voting/vote" component={VotingInterface} />
      <Route path="/voting/confirmation" component={VoteConfirmation} />
      <Route path="/voting/admin" component={VotingAdminDashboard} />
      <Route path="/voter/profile" component={VoterProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
