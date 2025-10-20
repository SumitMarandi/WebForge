// Code generation utilities for exporting websites

interface Block {
  id: string
  type: string
  content: string
  level?: number
  style?: any
  settings?: any
}

interface Page {
  id: string
  title: string
  slug: string
  content: { blocks: Block[] }
  is_home: boolean
}

interface Site {
  id: string
  name: string
  slug: string
  description: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export const generateHTML = (site: Site, pages: Page[]): string => {
  const homePage = pages.find(p => p.is_home) || pages[0]
  if (!homePage) return ''

  const blocks = homePage.content?.blocks || []

  const htmlContent = blocks.map(block => generateBlockHTML(block)).join('\n    ')

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${site.name}</title>
    <meta name="description" content="${site.description || `Welcome to ${site.name}`}">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        ${htmlContent}
    </div>
    <script src="script.js"></script>
</body>
</html>`
}

export const generateCSS = (site: Site, pages: Page[]): string => {
  const homePage = pages.find(p => p.is_home) || pages[0]
  if (!homePage) return ''

  const blocks = homePage.content?.blocks || []
  
  // Base CSS
  let css = `/* Generated CSS for ${site.name} */

/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #fff;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* Block styles */
.block {
    margin: 16px 0;
}

.heading {
    font-weight: bold;
    margin: 24px 0 16px;
}

.heading.h1 {
    font-size: 2.25rem;
    line-height: 1.2;
}

.heading.h2 {
    font-size: 1.875rem;
    line-height: 1.3;
}

.heading.h3 {
    font-size: 1.5rem;
    line-height: 1.4;
}

.paragraph {
    font-size: 1rem;
    line-height: 1.7;
    margin: 16px 0;
}

.image-block {
    margin: 24px 0;
}

.image-block img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.image-small { max-width: 200px; }
.image-medium { max-width: 400px; }
.image-large { max-width: 600px; }
.image-full { width: 100%; }

.align-left { text-align: left; }
.align-center { text-align: center; }
.align-right { text-align: right; }

.button-block {
    margin: 24px 0;
}

.btn {
    display: inline-block;
    padding: 12px 24px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
    font-size: 1rem;
}

.btn-primary {
    background-color: #3b82f6;
    color: white;
}

.btn-primary:hover {
    background-color: #2563eb;
}

.btn-secondary {
    background-color: #6b7280;
    color: white;
}

.btn-secondary:hover {
    background-color: #4b5563;
}

.btn-outline {
    background-color: transparent;
    color: #3b82f6;
    border: 2px solid #3b82f6;
}

.btn-outline:hover {
    background-color: #3b82f6;
    color: white;
}

.list-block {
    margin: 16px 0;
}

.list-block ul,
.list-block ol {
    padding-left: 24px;
}

.list-block li {
    margin: 8px 0;
}

.navigation {
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    padding: 16px 0;
    margin-bottom: 32px;
}

.nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.nav-logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1f2937;
    text-decoration: none;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 32px;
}

.nav-menu a {
    color: #4b5563;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
}

.nav-menu a:hover {
    color: #1f2937;
}

.video-block {
    margin: 24px 0;
}

.video-container {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    background: #000;
    border-radius: 8px;
    overflow: hidden;
}

.video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.code-block {
    margin: 24px 0;
}

.code-block pre {
    background: #1f2937;
    color: #10b981;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.divider {
    margin: 32px 0;
    border: none;
    height: 2px;
    background: #e5e7eb;
    border-radius: 1px;
}

/* Responsive design */
@media (max-width: 768px) {
    .container {
        padding: 16px;
    }
    
    .heading.h1 {
        font-size: 1.875rem;
    }
    
    .heading.h2 {
        font-size: 1.5rem;
    }
    
    .nav-container {
        flex-direction: column;
        gap: 16px;
    }
    
    .nav-menu {
        gap: 16px;
    }
}

`

  // Add custom styles from blocks
  blocks.forEach(block => {
    if (block.style) {
      css += generateBlockCSS(block)
    }
  })

  return css
}

export const generateJavaScript = (site: Site, pages: Page[]): string => {
  return `// Generated JavaScript for ${site.name}

document.addEventListener('DOMContentLoaded', function() {
    console.log('${site.name} website loaded');
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add loading animation for images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        // Set initial opacity for fade-in effect
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    });
    
    // Add hover effects to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Mobile menu toggle (if navigation exists)
    const nav = document.querySelector('.navigation');
    if (nav && window.innerWidth <= 768) {
        // Add mobile menu functionality here if needed
        console.log('Mobile navigation detected');
    }
    
    // Form handling (if forms exist)
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Form submitted! (This is a demo - implement your form handling)');
        });
    });
});

// Utility functions
function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = performance.now();
    
    function animate(currentTime) {
        let elapsed = currentTime - start;
        let progress = elapsed / duration;
        
        if (progress < 1) {
            element.style.opacity = progress;
            requestAnimationFrame(animate);
        } else {
            element.style.opacity = '1';
        }
    }
    
    requestAnimationFrame(animate);
}

function fadeOut(element, duration = 300) {
    let start = performance.now();
    
    function animate(currentTime) {
        let elapsed = currentTime - start;
        let progress = elapsed / duration;
        
        if (progress < 1) {
            element.style.opacity = 1 - progress;
            requestAnimationFrame(animate);
        } else {
            element.style.opacity = '0';
            element.style.display = 'none';
        }
    }
    
    requestAnimationFrame(animate);
}

// Analytics placeholder (replace with your analytics code)
function trackEvent(eventName, properties = {}) {
    console.log('Event tracked:', eventName, properties);
    // Implement your analytics tracking here
}

// Track page view
trackEvent('page_view', {
    page: '${pages.find(p => p.is_home)?.title || 'Home'}',
    site: '${site.name}'
});`
}

const generateBlockHTML = (block: Block): string => {
  const style = block.style || {}
  const settings = block.settings || {}
  
  const blockStyle = `
    text-align: ${style.textAlign || 'left'};
    font-weight: ${style.fontWeight || 'normal'};
    font-style: ${style.fontStyle || 'normal'};
    text-decoration: ${style.textDecoration || 'none'};
    background-color: ${style.backgroundColor || 'transparent'};
    color: ${style.textColor || 'inherit'};
    padding: ${style.padding || '8px'};
    margin: ${style.margin || '8px 0'};
    font-family: ${style.fontFamily || 'inherit'};
    font-size: ${style.fontSize || 'inherit'};
    line-height: ${style.lineHeight || '1.5'};
    letter-spacing: ${style.letterSpacing || 'normal'};
  `.trim()

  switch (block.type) {
    case 'heading':
      const level = block.level || 1
      return `<h${level} class="block heading h${level}" style="${blockStyle}">${block.content || 'Heading'}</h${level}>`

    case 'paragraph':
      return `<p class="block paragraph" style="${blockStyle}">${block.content || 'Paragraph text'}</p>`

    case 'image':
      if (!block.content) return ''
      const imageSize = settings.imageSize || 'medium'
      const imageAlt = settings.imageAlt || 'Image'
      const alignment = settings.imageAlignment || 'center'
      return `<div class="block image-block align-${alignment}" style="${blockStyle}">
        <img src="${block.content}" alt="${imageAlt}" class="image-${imageSize}">
      </div>`

    case 'button':
      const buttonText = settings.buttonText || block.content || 'Button'
      const buttonUrl = settings.buttonUrl || '#'
      const buttonStyle = settings.buttonStyle || 'primary'
      return `<div class="block button-block" style="${blockStyle}">
        <a href="${buttonUrl}" class="btn btn-${buttonStyle}">${buttonText}</a>
      </div>`

    case 'list':
      const listType = settings.listType || 'bullet'
      const items = block.content.split('\n').filter(item => item.trim())
      const listItems = items.map(item => `<li>${item}</li>`).join('\n        ')
      const listTag = listType === 'numbered' ? 'ol' : 'ul'
      return `<div class="block list-block" style="${blockStyle}">
        <${listTag}>
        ${listItems}
        </${listTag}>
      </div>`

    case 'link':
      const linkText = settings.linkText || block.content || 'Link'
      const linkUrl = settings.linkUrl || '#'
      return `<div class="block" style="${blockStyle}">
        <a href="${linkUrl}">${linkText}</a>
      </div>`

    case 'video':
      const videoUrl = settings.videoUrl || ''
      if (!videoUrl) return ''
      
      // Convert YouTube/Vimeo URLs to embed URLs
      let embedUrl = videoUrl
      const youtubeMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
      if (youtubeMatch) {
        embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`
      }
      
      return `<div class="block video-block" style="${blockStyle}">
        <div class="video-container">
          <iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
        </div>
      </div>`

    case 'code':
      return `<div class="block code-block" style="${blockStyle}">
        <pre><code>${block.content || '// Your code here'}</code></pre>
      </div>`

    case 'divider':
      return `<hr class="block divider" style="${blockStyle}">`

    case 'navigation':
      const navItems = settings.navigationItems || []
      const logoText = settings.logoText || 'Logo'
      const menuItems = navItems.map((item: any) => 
        `<li><a href="${item.url}">${item.text}</a></li>`
      ).join('\n            ')
      
      return `<nav class="navigation" style="${blockStyle}">
        <div class="nav-container">
          <a href="/" class="nav-logo">${logoText}</a>
          <ul class="nav-menu">
            ${menuItems}
          </ul>
        </div>
      </nav>`

    default:
      return `<div class="block" style="${blockStyle}">${block.content || ''}</div>`
  }
}

const generateBlockCSS = (block: Block): string => {
  if (!block.style) return ''
  
  const blockId = `block-${block.id}`
  let css = `\n/* Custom styles for block ${block.id} */\n`
  
  css += `#${blockId} {\n`
  
  Object.entries(block.style).forEach(([key, value]) => {
    if (value && value !== 'inherit' && value !== 'normal') {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      css += `  ${cssKey}: ${value};\n`
    }
  })
  
  css += `}\n`
  
  return css
}

export const downloadAsZip = async (site: Site, pages: Page[]) => {
  // We'll use JSZip for creating the zip file
  const JSZip = (await import('jszip')).default
  
  const zip = new JSZip()
  
  // Generate files
  const html = generateHTML(site, pages)
  const css = generateCSS(site, pages)
  const js = generateJavaScript(site, pages)
  
  // Add files to zip
  zip.file('index.html', html)
  zip.file('styles.css', css)
  zip.file('script.js', js)
  
  // Add a README file
  const readme = `# ${site.name}

This website was generated using WebForge.

## Files included:
- index.html - Main HTML file
- styles.css - Stylesheet
- script.js - JavaScript functionality

## To use:
1. Upload all files to your web server
2. Open index.html in a web browser
3. Customize as needed

Generated on: ${new Date().toLocaleDateString()}
`
  
  zip.file('README.md', readme)
  
  // Generate and download zip
  const content = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(content)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `${site.slug || 'website'}-code.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  
  URL.revokeObjectURL(url)
}

export const downloadIndividualFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  
  URL.revokeObjectURL(url)
}