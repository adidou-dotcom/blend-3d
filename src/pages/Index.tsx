import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Upload, Sparkles, QrCode, Eye, TrendingUp, Zap, Check } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Upload,
      title: "Upload Your Dish Photos",
      description: "Simply upload 8-20 high-quality photos of your signature dish from different angles.",
    },
    {
      icon: Sparkles,
      title: "We Create the 3D/AR Experience",
      description: "Our team and 3D specialists transform your photos into an immersive experience.",
    },
    {
      icon: QrCode,
      title: "Get Your Link & QR Code",
      description: "Receive a Web AR link and QR code ready for menus, websites, and displays.",
    },
  ];

  const benefits = [
    {
      icon: Eye,
      title: "Build Trust & Confidence",
      description: "Let guests preview dishes before ordering, reducing uncertainty and increasing satisfaction.",
    },
    {
      icon: TrendingUp,
      title: "Boost Average Check Size",
      description: "Premium dishes deserve premium presentation. 3D/AR helps justify higher prices.",
    },
    {
      icon: Zap,
      title: "Zero Technical Complexity",
      description: "No apps to download, no tech team needed. We handle everything from start to finish.",
    },
  ];

  const faqs = [
    {
      question: "What's the turnaround time for a 3D dish?",
      answer: "Typically 5-7 business days from photo submission to delivery. Rush orders may be available upon request.",
    },
    {
      question: "What kind of photos do I need to provide?",
      answer: "We need 8-20 high-quality photos of your dish from different angles, with good lighting and preferably on a neutral background. The more variety in angles, the better the final 3D model.",
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
            <Link to="/signup">
              <Button size="sm" className="shadow-elegant">Get Started</Button>
            </Link>
          </nav>
          <div className="md:hidden">
            <Link to="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Turn Your Dishes Into
              <span className="block bg-gradient-primary bg-clip-text text-transparent mt-2">
                Immersive 3D/AR Experiences
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Menublend helps restaurants showcase their signature dishes in 3D/AR through a simple online workflow. No apps. No tech headaches.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="shadow-glow text-lg px-8">
                  Start with One 3D Dish
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                View How It Works
              </Button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>No long-term contracts</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Pay per dish</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Ready in 5-7 days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transform your dishes into 3D/AR experiences
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-elegant hover:shadow-glow transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Step {index + 1}: {feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Restaurants Love Menublend</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Elevate your restaurant's dining experience
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="shadow-elegant">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle>{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">
              Pay per dish, no hidden fees
            </p>
          </div>
          <Card className="max-w-md mx-auto shadow-elegant">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Single 3D Dish</CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-bold">$99</span>
                <span className="text-muted-foreground ml-2">per dish</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Professional 3D model of your dish</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Web AR experience (no app needed)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Custom QR code for menus</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Shareable web link</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>5-7 day delivery</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Status tracking dashboard</span>
                </li>
              </ul>
              <Link to="/signup" className="block">
                <Button className="w-full mt-6" size="lg">
                  Get Started Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Dishes?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join restaurants worldwide showcasing their cuisine in stunning 3D/AR
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="shadow-glow text-lg px-8">
              Create Your First 3D Dish
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
                Menublend
              </div>
              <p className="text-sm text-muted-foreground">
                Transform your dishes into immersive 3D/AR experiences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/login" className="hover:text-foreground transition-colors">Login</Link></li>
                <li><Link to="/signup" className="hover:text-foreground transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-muted-foreground">
                <a href="mailto:hello@menublend.com" className="hover:text-foreground transition-colors">
                  hello@menublend.com
                </a>
              </p>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Menublend. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
