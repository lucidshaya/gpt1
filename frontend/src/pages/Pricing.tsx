import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Rocket, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for getting started",
      price: isAnnual ? 9 : 12,
      credits: "1,000",
      icon: Zap,
      features: [
        "1,000 AI credits per month",
        "Basic chat interface", 
        "Message history",
        "Email support",
        "Mobile responsive"
      ],
      popular: false,
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Pro",
      description: "Best for power users",
      price: isAnnual ? 29 : 35,
      credits: "5,000",
      icon: Crown,
      features: [
        "5,000 AI credits per month",
        "Priority AI responses",
        "Advanced chat features",
        "File attachments",
        "Voice input",
        "Chat export",
        "Priority support"
      ],
      popular: true,
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Enterprise",
      description: "For teams and businesses",
      price: isAnnual ? 99 : 120,
      credits: "Unlimited",
      icon: Rocket,
      features: [
        "Unlimited AI credits",
        "Custom AI models",
        "Team collaboration",
        "Advanced analytics",
        "API access",
        "Custom integrations",
        "24/7 dedicated support"
      ],
      popular: false,
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Link to="/chat" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-smooth mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Chat
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Choose Your AI Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Unlock the full potential of AI with our flexible credit-based pricing. 
            Get more conversations, advanced features, and priority support.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative h-6 w-12 p-0"
            >
              <div className={`absolute inset-0.5 bg-primary rounded-full transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'} w-5 h-5`} />
            </Button>
            <span className={`text-sm ${isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                Save 25%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.name} 
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-primary/50 shadow-xl shadow-primary/10' 
                    : 'border-border/50 hover:border-primary/30'
                }`}
              >
                {plan.popular && (
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${plan.color}`} />
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  {plan.popular && (
                    <Badge className="absolute top-6 right-6 bg-primary">
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground ml-1">
                        /{isAnnual ? 'year' : 'month'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.credits} credits
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="px-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="px-6 pt-4">
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? `bg-gradient-to-r ${plan.color} hover:opacity-90 text-white border-0` 
                        : ''
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">What are AI credits?</h3>
              <p className="text-muted-foreground text-sm">
                AI credits are used for each message you send to our AI assistant. 
                Different message types may consume different amounts of credits.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do credits roll over?</h3>
              <p className="text-muted-foreground text-sm">
                Unused credits from your monthly allocation will roll over to the next month, 
                up to a maximum of 2x your plan limit.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! You can upgrade or downgrade your plan at any time. 
                Changes take effect immediately with prorated billing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground text-sm">
                New users get 100 free credits to try our AI assistant. 
                No credit card required to get started.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;