export interface Template {
  id: string
  name: string
  description: string
  category: 'business' | 'portfolio' | 'blog' | 'landing' | 'ecommerce'
  preview: string
  blocks: any[]
}

export const templates: Template[] = [
  {
    id: 'business-professional',
    name: 'Professional Business',
    description: 'Clean and professional layout perfect for businesses and services',
    category: 'business',
    preview: '/templates/business-professional.jpg',
    blocks: [
      {
        id: 'nav-1',
        type: 'navigation',
        content: '',
        settings: {
          navigationItems: [
            { id: '1', text: 'Home', url: '/', isExternal: false },
            { id: '2', text: 'About', url: '/about', isExternal: false },
            { id: '3', text: 'Services', url: '/services', isExternal: false },
            { id: '4', text: 'Contact', url: '/contact', isExternal: false }
          ],
          navigationStyle: 'horizontal',
          navigationAlignment: 'center',
          showLogo: true,
          logoText: 'Your Business',
          headerBackgroundColor: '#ffffff',
          headerTextColor: '#374151',
          headerShadow: true,
          headerPadding: '16px'
        },
        style: {
          textAlign: 'left',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: '#ffffff',
          textColor: '#374151',
          padding: '16px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '1rem',
          lineHeight: '1.5',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'hero-1',
        type: 'heading',
        content: 'Welcome to Our Professional Services',
        level: 1,
        style: {
          textAlign: 'center',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#1f2937',
          padding: '32px 16px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '3rem',
          lineHeight: '1.2',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'hero-subtitle',
        type: 'paragraph',
        content: 'We provide exceptional services to help your business grow and succeed in today\'s competitive market.',
        style: {
          textAlign: 'center',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#6b7280',
          padding: '0 16px 32px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '1.25rem',
          lineHeight: '1.6',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'cta-button',
        type: 'button',
        content: 'Get Started Today',
        settings: {
          buttonText: 'Get Started Today',
          buttonUrl: '/contact',
          buttonStyle: 'primary'
        },
        style: {
          textAlign: 'center',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#000000',
          padding: '16px',
          margin: '16px 0',
          fontFamily: 'inherit',
          fontSize: '1rem',
          lineHeight: '1.5',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'services-heading',
        type: 'heading',
        content: 'Our Services',
        level: 2,
        style: {
          textAlign: 'center',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#1f2937',
          padding: '48px 16px 24px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '2.5rem',
          lineHeight: '1.3',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'services-list',
        type: 'list',
        content: 'Consulting Services\nProject Management\nDigital Solutions\nCustomer Support',
        settings: {
          listType: 'bullet'
        },
        style: {
          textAlign: 'left',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#374151',
          padding: '16px 32px',
          margin: '16px 0',
          fontFamily: 'inherit',
          fontSize: '1.125rem',
          lineHeight: '1.7',
          letterSpacing: 'normal'
        }
      }
    ]
  },
  {
    id: 'portfolio-creative',
    name: 'Creative Portfolio',
    description: 'Showcase your work with this modern portfolio template',
    category: 'portfolio',
    preview: '/templates/portfolio-creative.jpg',
    blocks: [
      {
        id: 'portfolio-nav',
        type: 'navigation',
        content: '',
        settings: {
          navigationItems: [
            { id: '1', text: 'Home', url: '/', isExternal: false },
            { id: '2', text: 'Portfolio', url: '/portfolio', isExternal: false },
            { id: '3', text: 'About', url: '/about', isExternal: false },
            { id: '4', text: 'Contact', url: '/contact', isExternal: false }
          ],
          navigationStyle: 'horizontal',
          navigationAlignment: 'center',
          showLogo: true,
          logoText: 'Creative Studio',
          headerBackgroundColor: '#000000',
          headerTextColor: '#ffffff',
          headerShadow: false,
          headerPadding: '20px'
        },
        style: {
          textAlign: 'left',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: '#000000',
          textColor: '#ffffff',
          padding: '20px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '1rem',
          lineHeight: '1.5',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'portfolio-hero',
        type: 'heading',
        content: 'Creative Designer & Developer',
        level: 1,
        style: {
          textAlign: 'center',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#000000',
          padding: '64px 16px 24px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '3.5rem',
          lineHeight: '1.1',
          letterSpacing: '-0.02em'
        }
      },
      {
        id: 'portfolio-subtitle',
        type: 'paragraph',
        content: 'I create beautiful digital experiences that inspire and engage users.',
        style: {
          textAlign: 'center',
          fontWeight: 'normal',
          fontStyle: 'italic',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#6b7280',
          padding: '0 16px 48px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '1.5rem',
          lineHeight: '1.5',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'portfolio-work',
        type: 'heading',
        content: 'Featured Work',
        level: 2,
        style: {
          textAlign: 'left',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#1f2937',
          padding: '32px 16px 16px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '2rem',
          lineHeight: '1.3',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'portfolio-description',
        type: 'paragraph',
        content: 'Here are some of my recent projects that showcase my skills in design and development.',
        style: {
          textAlign: 'left',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#374151',
          padding: '0 16px 32px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '1.125rem',
          lineHeight: '1.6',
          letterSpacing: 'normal'
        }
      }
    ]
  },
  {
    id: 'blog-minimal',
    name: 'Minimal Blog',
    description: 'Clean and focused blog template for writers and content creators',
    category: 'blog',
    preview: '/templates/blog-minimal.jpg',
    blocks: [
      {
        id: 'blog-nav',
        type: 'navigation',
        content: '',
        settings: {
          navigationItems: [
            { id: '1', text: 'Home', url: '/', isExternal: false },
            { id: '2', text: 'Articles', url: '/articles', isExternal: false },
            { id: '3', text: 'About', url: '/about', isExternal: false },
            { id: '4', text: 'Subscribe', url: '/subscribe', isExternal: false }
          ],
          navigationStyle: 'horizontal',
          navigationAlignment: 'left',
          showLogo: true,
          logoText: 'My Blog',
          headerBackgroundColor: '#f9fafb',
          headerTextColor: '#111827',
          headerShadow: false,
          headerPadding: '16px'
        },
        style: {
          textAlign: 'left',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: '#f9fafb',
          textColor: '#111827',
          padding: '16px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '1rem',
          lineHeight: '1.5',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'blog-title',
        type: 'heading',
        content: 'Welcome to My Blog',
        level: 1,
        style: {
          textAlign: 'left',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#111827',
          padding: '48px 24px 16px',
          margin: '0',
          fontFamily: 'serif',
          fontSize: '2.75rem',
          lineHeight: '1.2',
          letterSpacing: '-0.01em'
        }
      },
      {
        id: 'blog-intro',
        type: 'paragraph',
        content: 'Thoughts, stories, and ideas about technology, design, and life.',
        style: {
          textAlign: 'left',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#6b7280',
          padding: '0 24px 32px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '1.25rem',
          lineHeight: '1.6',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'blog-latest',
        type: 'heading',
        content: 'Latest Articles',
        level: 2,
        style: {
          textAlign: 'left',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#111827',
          padding: '32px 24px 16px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '1.875rem',
          lineHeight: '1.3',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'blog-sample',
        type: 'paragraph',
        content: 'Your latest blog posts will appear here. Start writing to share your thoughts with the world.',
        style: {
          textAlign: 'left',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#374151',
          padding: '0 24px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '1rem',
          lineHeight: '1.7',
          letterSpacing: 'normal'
        }
      }
    ]
  },
  {
    id: 'landing-startup',
    name: 'Startup Landing',
    description: 'High-converting landing page template for startups and products',
    category: 'landing',
    preview: '/templates/landing-startup.jpg',
    blocks: [
      {
        id: 'startup-nav',
        type: 'navigation',
        content: '',
        settings: {
          navigationItems: [
            { id: '1', text: 'Features', url: '#features', isExternal: false },
            { id: '2', text: 'Pricing', url: '#pricing', isExternal: false },
            { id: '3', text: 'About', url: '#about', isExternal: false },
            { id: '4', text: 'Contact', url: '#contact', isExternal: false }
          ],
          navigationStyle: 'horizontal',
          navigationAlignment: 'right',
          showLogo: true,
          logoText: 'StartupName',
          headerBackgroundColor: '#ffffff',
          headerTextColor: '#1f2937',
          headerShadow: true,
          headerPadding: '12px'
        },
        style: {
          textAlign: 'left',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          padding: '12px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '1rem',
          lineHeight: '1.5',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'startup-hero',
        type: 'heading',
        content: 'Build Something Amazing',
        level: 1,
        style: {
          textAlign: 'center',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#1f2937',
          padding: '80px 16px 24px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '4rem',
          lineHeight: '1.1',
          letterSpacing: '-0.02em'
        }
      },
      {
        id: 'startup-subtitle',
        type: 'paragraph',
        content: 'The ultimate solution for modern businesses. Get started today and transform your workflow.',
        style: {
          textAlign: 'center',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#6b7280',
          padding: '0 16px 40px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '1.5rem',
          lineHeight: '1.5',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'startup-cta',
        type: 'button',
        content: 'Start Free Trial',
        settings: {
          buttonText: 'Start Free Trial',
          buttonUrl: '/signup',
          buttonStyle: 'primary'
        },
        style: {
          textAlign: 'center',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#000000',
          padding: '16px',
          margin: '16px 0 64px',
          fontFamily: 'inherit',
          fontSize: '1.125rem',
          lineHeight: '1.5',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'startup-features',
        type: 'heading',
        content: 'Why Choose Us?',
        level: 2,
        style: {
          textAlign: 'center',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#1f2937',
          padding: '48px 16px 32px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '2.5rem',
          lineHeight: '1.3',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'startup-benefits',
        type: 'list',
        content: 'Lightning-fast performance\nEnterprise-grade security\n24/7 customer support\nEasy integration',
        settings: {
          listType: 'bullet'
        },
        style: {
          textAlign: 'center',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#374151',
          padding: '16px 32px',
          margin: '16px 0',
          fontFamily: 'inherit',
          fontSize: '1.25rem',
          lineHeight: '1.8',
          letterSpacing: 'normal'
        }
      }
    ]
  },
  {
    id: 'restaurant-menu',
    name: 'Restaurant & Menu',
    description: 'Perfect template for restaurants, cafes, and food businesses',
    category: 'business',
    preview: '/templates/restaurant-menu.jpg',
    blocks: [
      {
        id: 'restaurant-nav',
        type: 'navigation',
        content: '',
        settings: {
          navigationItems: [
            { id: '1', text: 'Home', url: '/', isExternal: false },
            { id: '2', text: 'Menu', url: '/menu', isExternal: false },
            { id: '3', text: 'About', url: '/about', isExternal: false },
            { id: '4', text: 'Reservations', url: '/reservations', isExternal: false },
            { id: '5', text: 'Contact', url: '/contact', isExternal: false }
          ],
          navigationStyle: 'horizontal',
          navigationAlignment: 'center',
          showLogo: true,
          logoText: 'Bistro Delicious',
          headerBackgroundColor: '#7c2d12',
          headerTextColor: '#ffffff',
          headerShadow: true,
          headerPadding: '16px'
        },
        style: {
          textAlign: 'left',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: '#7c2d12',
          textColor: '#ffffff',
          padding: '16px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '1rem',
          lineHeight: '1.5',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'restaurant-hero',
        type: 'heading',
        content: 'Welcome to Bistro Delicious',
        level: 1,
        style: {
          textAlign: 'center',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#7c2d12',
          padding: '48px 16px 24px',
          margin: '0',
          fontFamily: 'serif',
          fontSize: '3rem',
          lineHeight: '1.2',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'restaurant-tagline',
        type: 'paragraph',
        content: 'Experience culinary excellence with our chef-crafted dishes made from the finest local ingredients.',
        style: {
          textAlign: 'center',
          fontWeight: 'normal',
          fontStyle: 'italic',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#6b7280',
          padding: '0 16px 32px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '1.25rem',
          lineHeight: '1.6',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'restaurant-hours',
        type: 'heading',
        content: 'Hours & Location',
        level: 2,
        style: {
          textAlign: 'center',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#1f2937',
          padding: '32px 16px 16px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '2rem',
          lineHeight: '1.3',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'restaurant-info',
        type: 'paragraph',
        content: 'Open Tuesday - Sunday, 5:00 PM - 10:00 PM\n123 Culinary Street, Food District\nReservations: (555) 123-FOOD',
        style: {
          textAlign: 'center',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#374151',
          padding: '0 16px 32px',
          margin: '0',
          fontFamily: 'inherit',
          fontSize: '1.125rem',
          lineHeight: '1.8',
          letterSpacing: 'normal'
        }
      },
      {
        id: 'restaurant-cta',
        type: 'button',
        content: 'Make a Reservation',
        settings: {
          buttonText: 'Make a Reservation',
          buttonUrl: '/reservations',
          buttonStyle: 'primary'
        },
        style: {
          textAlign: 'center',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          backgroundColor: 'transparent',
          textColor: '#000000',
          padding: '16px',
          margin: '16px 0',
          fontFamily: 'inherit',
          fontSize: '1rem',
          lineHeight: '1.5',
          letterSpacing: 'normal'
        }
      }
    ]
  }
]

export const getTemplatesByCategory = (category?: string) => {
  if (!category) return templates
  return templates.filter(template => template.category === category)
}

export const getTemplateById = (id: string) => {
  return templates.find(template => template.id === id)
}