import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';
import { SectionTitle } from '@/components/ui/section-title';
import { Picture } from '@/components/ui/picture';
import { CheckCircle2, ArrowDown, Zap, Target, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitLeadForm } from '@/api/client';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const formSchema = z.object({
  email: z.string().email(),
  company: z.string().min(1),
});

type FormData = z.infer<typeof formSchema>;

// SEO Meta component
const SEOMeta: React.FC = () => {
  const { t, i18n } = useTranslation('marketing');
  
  useEffect(() => {
    // Set page title
    document.title = `${t('hero.title')} | Reservaro`;
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('hero.subtitle'));
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = t('hero.subtitle');
      document.head.appendChild(meta);
    }

    // Set Open Graph tags
    const setMetaProperty = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMetaProperty('og:title', t('hero.title'));
    setMetaProperty('og:description', t('hero.subtitle'));
    setMetaProperty('og:image', '/images/hero.jpg');
    setMetaProperty('og:type', 'website');

    // JSON-LD structured data
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Reservaro",
      "description": t('hero.subtitle'),
      "url": window.location.origin,
      "logo": `${window.location.origin}/favicon.ico`,
      "sameAs": [],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "email": "contact@reservaro.com"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [t, i18n.language]);

  return null;
};

export const Landing: React.FC = () => {
  const { t } = useTranslation(['marketing', 'common']);
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!shouldReduceMotion) {
        setParallaxOffset(window.scrollY * 0.5);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      await submitLeadForm({ email: data.email, company: data.company });
      setIsSubmitted(true);
      reset();
      toast({
        title: t('marketing:form.success'),
        description: `${t('marketing:form.email')}: ${data.email}`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const channels = [
    { name: 'Airbnb', logo: '/images/logos/airbnb.svg' },
    { name: 'Booking.com', logo: '/images/logos/booking.svg' },
    { name: 'Vrbo', logo: '/images/logos/vrbo.svg' },
    { name: 'Expedia', logo: '/images/logos/expedia.svg' },
    { name: 'Agoda', logo: '/images/logos/agoda.svg' },
  ];

  const features = [
    {
      icon: Zap,
      title: t('marketing:features.1.title'),
      description: t('marketing:features.1.desc'),
    },
    {
      icon: Target,
      title: t('marketing:features.2.title'),
      description: t('marketing:features.2.desc'),
    },
    {
      icon: BarChart3,
      title: t('marketing:features.3.title'),
      description: t('marketing:features.3.desc'),
    },
  ];

  const showcases = [
    {
      image: '/images/showcase-1.jpg',
      caption: t('marketing:show.caption.1'),
    },
    {
      image: '/images/showcase-2.jpg',
      caption: t('marketing:show.caption.2'),
    },
    {
      image: '/images/showcase-3.jpg',
      caption: t('marketing:show.caption.3'),
    },
  ];

  const testimonials = [
    {
      quote: t('marketing:testi.1.quote'),
      author: t('marketing:testi.1.author'),
    },
    {
      quote: t('marketing:testi.2.quote'),
      author: t('marketing:testi.2.author'),
    },
  ];

  return (
    <>
      <SEOMeta />
      <div className="min-h-screen">
        {/* Language Switcher - Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSwitcher />
        </div>

        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          {/* Background Image with Parallax */}
          <div 
            className="absolute inset-0 z-0"
            style={{ transform: `translateY(${parallaxOffset}px)` }}
          >
            <Picture
              src="/images/hero.jpg"
              alt={t('marketing:hero.title')}
              blurDataUrl="/images/hero-blur.jpg"
              loading="eager"
              decoding="sync"
              className="w-full h-[120vh] object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center text-white">
            <div className="max-w-5xl mx-auto">
              <Badge 
                variant="secondary" 
                className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm"
              >
                {t('marketing:hero.badge')}
              </Badge>
              
              <SectionTitle 
                level="h1" 
                size="xl" 
                className="mb-6 text-white"
              >
                {t('marketing:hero.title')}
              </SectionTitle>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
                {t('marketing:hero.subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-3"
                  onClick={() => scrollToSection('contact-form')}
                >
                  {t('marketing:cta.primary')}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-3"
                  onClick={() => scrollToSection('features')}
                >
                  {t('marketing:cta.secondary')}
                  <ArrowDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Logos Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <p className="text-center text-muted-foreground font-medium mb-12">
              {t('marketing:logos.title')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
              {channels.map((channel, index) => (
                <div 
                  key={index}
                  className="group flex items-center gap-3 transition-all duration-300 grayscale hover:grayscale-0"
                >
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    className="h-8 w-8 text-muted-foreground group-hover:text-foreground transition-colors"
                  />
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {channel.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <SectionTitle className="mb-6">
                {t('marketing:features.title')}
              </SectionTitle>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="text-center group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Showcase Images Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <SectionTitle className="mb-6">
                {t('marketing:show.title')}
              </SectionTitle>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {showcases.map((showcase, index) => (
                <Card 
                  key={index}
                  className="overflow-hidden group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Picture
                      src={showcase.image}
                      alt={showcase.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardContent className="p-6">
                    <p className="text-center font-medium text-foreground">
                      {showcase.caption}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <SectionTitle className="mb-6">
                {t('marketing:testi.title')}
              </SectionTitle>
            </div>

            <div className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 max-w-4xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card 
                  key={index}
                  className="min-w-[300px] md:min-w-[400px] snap-start"
                >
                  <CardContent className="p-8 text-center">
                    <blockquote className="text-lg italic text-foreground mb-4">
                      "{testimonial.quote}"
                    </blockquote>
                    <cite className="text-sm font-medium text-muted-foreground">
                      — {testimonial.author}
                    </cite>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Teaser Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <GlassCard className="p-8">
                <SectionTitle level="h3" size="md" className="mb-4">
                  {t('marketing:pricing.title')}
                </SectionTitle>
                <p className="text-3xl font-bold text-primary mb-6">
                  {t('marketing:pricing.from')}
                </p>
                <Button 
                  size="lg"
                  onClick={() => scrollToSection('contact-form')}
                >
                  {t('marketing:pricing.cta')}
                </Button>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact-form" className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl">
                    {isSubmitted ? t('marketing:form.success') : t('marketing:form.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8" role="status" aria-live="polite">
                      <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {t('marketing:form.success')}
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setIsSubmitted(false)}
                      >
                        Submit Another Request
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div>
                        <Input
                          {...register('email')}
                          placeholder={t('marketing:form.email')}
                          type="email"
                          className={errors.email ? 'border-destructive' : ''}
                          aria-label={t('marketing:form.email')}
                          disabled={isSubmitting}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive mt-1" role="alert">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Input
                          {...register('company')}
                          placeholder={t('marketing:form.company')}
                          className={errors.company ? 'border-destructive' : ''}
                          aria-label={t('marketing:form.company')}
                          disabled={isSubmitting}
                        />
                        {errors.company && (
                          <p className="text-sm text-destructive mt-1" role="alert">
                            {errors.company.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                        aria-label={isSubmitting ? t('common:status.loading') : t('marketing:form.submit')}
                      >
                        {isSubmitting ? t('common:status.loading') : t('marketing:form.submit')}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-muted/30 py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
                {t('common:brand')}
              </div>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};