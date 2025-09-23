import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArrowLeft, Lock, Shield, Check, Users, CreditCard, Crown, Fish, Dog, Telescope } from "lucide-react";

// Mock Stripe setup for development - will be replaced with real keys later
const MOCK_STRIPE_KEY = 'pk_test_mock_key_for_development';
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : loadStripe(MOCK_STRIPE_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome to Premium!",
        description: "You now have access to all characters and features!",
      });
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <PaymentElement />
      </div>
      <Button 
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-treasure-500 text-treasure-50 hover:bg-treasure-600 py-3 text-lg font-bold"
        data-testid="button-subscribe"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-treasure-50 border-t-transparent rounded-full mr-2" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Start Premium Adventure
          </>
        )}
      </Button>
      <p className="text-center text-muted-foreground text-sm">
        <Shield className="w-4 h-4 mr-1" />
        Secure payment • Cancel anytime • 7-day free trial
      </p>
    </form>
  );
};

export default function Subscribe() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Check if user is already premium
    if ((user as any).isPremium) {
      toast({
        title: "Already Premium",
        description: "You already have access to all premium features!",
      });
      setLocation("/");
      return;
    }

    // Create subscription
    apiRequest("POST", "/api/get-or-create-subscription")
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        if (isUnauthorizedError(error)) {
          toast({
            title: "Unauthorized",
            description: "You are logged out. Logging in again...",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = "/";
          }, 500);
          return;
        }
        toast({
          title: "Error",
          description: "Failed to initialize subscription. Please try again.",
          variant: "destructive",
        });
        setLocation("/");
      });
  }, [user, toast, setLocation]);

  if (isLoading || !clientSecret) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b border-border px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Button 
              variant="ghost"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-bold" data-testid="text-page-title">
              Premium Subscription
            </h1>
          </div>
        </div>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground" data-testid="text-loading">
              Preparing your premium adventure...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold" data-testid="text-page-title">
            Premium Subscription
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-fun text-foreground mb-4" data-testid="text-subscription-title">
            Unlock the Full Adventure
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="text-subscription-subtitle">
            Join the premium crew and access all characters and features
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Details */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-treasure-400 to-treasure-600 text-treasure-50 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-white text-treasure-600 px-3 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>
              <CardHeader>
                <CardTitle className="text-2xl mb-2" data-testid="text-plan-title">
                  Premium Adventure
                </CardTitle>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold" data-testid="text-plan-price">$2.99</span>
                  <span className="text-treasure-100 ml-2">per month</span>
                </div>
                <p className="text-treasure-100" data-testid="text-trial-info">
                  7-day free trial • Cancel anytime
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-white mr-3" />
                    <span>All 4 characters (Red Boot, Ray Ray, Salty, Ocean Blue)</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-white mr-3" />
                    <span>Unlimited word lists</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-white mr-3" />
                    <span>Advanced progress analytics</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-white mr-3" />
                    <span>Photo word list capture</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-white mr-3" />
                    <span>Test simulator with voice recording</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-white mr-3" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Character Showcase */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center" data-testid="text-characters-title">
                  <Users className="w-4 h-4 mr-2 text-secondary" />
                  Meet Your Crew
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-pirate-50 rounded-lg">
                    <div className="w-12 h-12 bg-pirate-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-pirate-50" />
                    </div>
                    <div className="font-bold text-sm">Red Boot</div>
                    <div className="text-xs text-muted-foreground">Free • Wild Captain</div>
                  </div>
                  <div className="text-center p-3 bg-ocean-50 rounded-lg border-2 border-accent">
                    <div className="w-12 h-12 bg-ocean-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Fish className="w-6 h-6 text-ocean-50" />
                    </div>
                    <div className="font-bold text-sm">Ray Ray</div>
                    <div className="text-xs text-accent font-medium">Premium • Gentle Guide</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg border-2 border-accent">
                    <div className="w-12 h-12 bg-amber-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Dog className="w-6 h-6 text-amber-50" />
                    </div>
                    <div className="font-bold text-sm">Salty</div>
                    <div className="text-xs text-accent font-medium">Premium • Puppy Friend</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg border-2 border-accent">
                    <div className="w-12 h-12 bg-blue-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Telescope className="w-6 h-6 text-blue-50" />
                    </div>
                    <div className="font-bold text-sm">Ocean Blue</div>
                    <div className="text-xs text-accent font-medium">Premium • Smart Explorer</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center" data-testid="text-payment-title">
                  <CreditCard className="w-4 h-4 mr-2 text-treasure-500" />
                  Payment Information
                </CardTitle>
                <p className="text-center text-muted-foreground text-sm">
                  Start your 7-day free trial today
                </p>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <SubscribeForm />
                </Elements>
              </CardContent>
            </Card>

            {/* Security Badges */}
            <div className="flex justify-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                <Shield className="w-4 h-4 mr-1" />
                SSL Secured
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <i className="fab fa-stripe mr-1"></i>
                Stripe Protected
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <i className="fas fa-lock mr-1"></i>
                PCI Compliant
              </Badge>
            </div>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg" data-testid="text-faq-title">
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm mb-1">Can I cancel anytime?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! Cancel your subscription anytime from your account settings. No commitments.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">What happens during the free trial?</h4>
                  <p className="text-sm text-muted-foreground">
                    You get full access to all premium features for 7 days. You won't be charged until after the trial ends.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">How many children can use one account?</h4>
                  <p className="text-sm text-muted-foreground">
                    You can add unlimited children to your parent account. Each child gets their own progress tracking.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
