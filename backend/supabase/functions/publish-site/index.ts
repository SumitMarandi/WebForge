import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { siteId } = await req.json()

    // Fetch site and pages
    const { data: site, error: siteError } = await supabaseClient
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .single()

    if (siteError) throw siteError

    const { data: pages, error: pagesError } = await supabaseClient
      .from('pages')
      .select('*')
      .eq('site_id', siteId)

    if (pagesError) throw pagesError

    // Generate HTML for each page
    for (const page of pages) {
      const html = generateHTML(site, page, pages)
      
      // Upload to storage
      const fileName = page.is_home ? 'index.html' : `${page.slug}.html`
      const filePath = `${site.slug}/${fileName}`

      const { error: uploadError } = await supabaseClient.storage
        .from('public-sites')
        .upload(filePath, html, {
          contentType: 'text/html',
          upsert: true
        })

      if (uploadError) throw uploadError
    }

    // Update site status
    await supabaseClient
      .from('sites')
      .update({ is_published: true })
      .eq('id', siteId)

    return new Response(
      JSON.stringify({ success: true, url: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/public-sites/${site.slug}/index.html` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

function generateHTML(site: any, page: any, allPages: any[]) {
  const blocks = page.content?.blocks || []
  
  const navigation = allPages
    .map(p => `<a href="${p.is_home ? 'index.html' : p.slug + '.html'}" class="nav-link">${p.title}</a>`)
    .join('')

  const content = blocks
    .map((block: any) => {
      switch (block.type) {
        case 'heading':
          return `<h${block.level || 1}>${block.content}</h${block.level || 1}>`
        case 'paragraph':
          return `<p>${block.content}</p>`
        case 'image':
          return block.content ? `<img src="${block.content}" alt="Image" />` : ''
        default:
          return ''
      }
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title} - ${site.name}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .nav {
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #eee;
        }
        .nav-link {
            margin-right: 1rem;
            text-decoration: none;
            color: #0066cc;
        }
        .nav-link:hover {
            text-decoration: underline;
        }
        h1, h2, h3 {
            color: #2c3e50;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        .footer {
            margin-top: 3rem;
            padding-top: 1rem;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <nav class="nav">
        ${navigation}
    </nav>
    <main>
        ${content}
    </main>
    <footer class="footer">
        <p>Built with WebForge</p>
    </footer>
</body>
</html>`
}