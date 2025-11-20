import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Upload, Sparkles, QrCode, Eye, TrendingUp, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PRICING, MIN_PHOTOS, MAX_PHOTOS } from "@/config/pricing";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/app/dishes/new");
    } else {
      navigate("/signup");
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const faqs = [
    {
      question: "What's the turnaround time for a 3D dish?",
      answer: "Typically 5-7 business days from photo submission to delivery. Rush orders may be available upon request.",
    },
    {
      question: "What kind of photos do I need to provide?",
      answer: `We need ${MIN_PHOTOS}-${MAX_PHOTOS} high-quality photos of your dish from different angles, with good lighting and preferably on a neutral background. The more variety in angles, the better the final 3D model.`,
    },
    {
      question: "Who owns the 3D assets?",
      answer: "You own the 3D models and AR experiences we create for your dishes. You can use them however you like - on your website, in your restaurant, or on social media.",
    },
    {
      question: "Can I update the 3D model later?",
      answer: "Yes! If your dish presentation changes, you can request updates. Updates are handled as new orders with special pricing for existing customers.",
    },
    {
      question: "Do customers need to download an app?",
      answer: "No! The AR experience works directly in the web browser on smartphones. No app downloads required - just scan the QR code or click the link.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Menublend
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Button size="sm" className="shadow-elegant" onClick={handleGetStarted}>Get Started</Button>
          </nav>
          <div className="md:hidden">
            <Button size="sm" onClick={handleGetStarted}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-subtle">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <div className="inline-block mb-4">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                Premium 3D & AR visuals for restaurants
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-primary bg-clip-text text-transparent leading-tight">
              Turn your signature dishes into 3D & AR-ready visuals
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Order one 3D dish as a paid demo. If you like the result, scale to your full menu.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="shadow-elegant text-lg px-8" onClick={handleGetStarted}>
                Get your first 3D dish
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection("how-it-works")}>
                See how it works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">How it Works</h2>
            <p className="text-xl text-muted-foreground">
              From your photos to 3D/AR in three simple steps
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 mx-auto max-w-5xl">
            <Card className="relative overflow-hidden shadow-elegant hover:shadow-2xl transition-shadow">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>1. Upload {MIN_PHOTOS}–{MAX_PHOTOS} photos of your dish</CardTitle>
                <CardDescription className="text-base">
                  Take photos from different angles with good lighting. The more variety, the better the final result.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative overflow-hidden shadow-elegant hover:shadow-2xl transition-shadow">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>2. Our team creates a production-ready 3D / AR model</CardTitle>
                <CardDescription className="text-base">
                  Our specialists transform your photos into an immersive 3D model optimized for web and AR viewing.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative overflow-hidden shadow-elegant hover:shadow-2xl transition-shadow">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>3. You receive the 3D/AR assets + a shareable viewer link</CardTitle>
                <CardDescription className="text-base">
                  Get your model files, viewer link, and QR code ready for menus, websites, and marketing.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-32 bg-gradient-subtle border-y">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">Why 3D/AR for Your Menu?</h2>
            <p className="text-xl text-muted-foreground">
              Visual clarity that drives decisions and increases revenue
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 mx-auto max-w-5xl">
            <Card className="shadow-elegant">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Higher conversion on high-margin dishes</CardTitle>
                <CardDescription className="text-base">
                  Premium dishes deserve premium presentation. 3D/AR helps justify higher prices and increases order value.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="shadow-elegant">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Visual clarity for guests</CardTitle>
                <CardDescription className="text-base">
                  Let guests preview dishes before ordering, reducing uncertainty and increasing satisfaction.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="shadow-elegant">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Social media / marketing assets</CardTitle>
                <CardDescription className="text-base">
                  Use your 3D models across social media, your website, and marketing campaigns to stand out.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">
              Start with one dish, scale when you're ready
            </p>
          </div>
          <div className="mx-auto max-w-lg">
            <Card className="shadow-elegant border-primary/20">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">{PRICING.DEMO_DISH.DESCRIPTION}</CardTitle>
                <CardDescription className="text-base">Perfect for testing the waters</CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-bold">{PRICING.DEMO_DISH.DISPLAY}</span>
                  <span className="text-muted-foreground ml-2">/ dish</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {PRICING.DEMO_DISH.FEATURES.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" className="w-full shadow-elegant" onClick={handleGetStarted}>
                  Start with one dish
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
            <p className="text-center text-sm text-muted-foreground mt-8">
              Multi-dish plans and full-menu workflows are available on request.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-32 bg-gradient-subtle border-y">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about getting started
            </p>
          </div>
          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-background rounded-lg border px-6 shadow-sm">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-semibold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-gradient-subtle border-t">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to Transform Your Menu?
            </h2>
            <p className="text-xl text-muted-foreground">
              Start with one dish. See the quality. Then scale to your full menu.
            </p>
            <Button size="lg" className="shadow-elegant text-lg px-8" onClick={handleGetStarted}>
              Get your first 3D dish
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Menublend
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Menublend. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
