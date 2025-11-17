import type { FC } from "hono/jsx"

interface BaseLayoutProps {
  title?: string
  children: any
}

export const BaseLayout: FC<BaseLayoutProps> = ({
  title = "Sprout - Hono + Deno + Tailwind",
  children
}) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <link rel="stylesheet" href="/static/css/main.css" />
        <script type="module" src="/static/js/main.js"></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
