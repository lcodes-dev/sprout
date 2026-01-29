# Sprout

Phoenix starter kit installer with Hotwire Turbo, Alpine.js, and BasecoatUI.

Sprout transforms a fresh Phoenix project into a production-ready application with a deadview-first architecture.

## Features

- **Hotwire Turbo** - SPA-like navigation without the SPA complexity
- **Alpine.js** - Lightweight JavaScript framework for client-side interactivity
- **BasecoatUI** - Framework-agnostic CSS component library
- **Three Layout Options** - App, Simple, and Dashboard layouts
- **Turbo Streams** - Real-time updates via HTTP and WebSocket
- **Dark Mode** - Built-in theme toggle with system preference detection

## Installation

Add `sprout` to your dependencies in `mix.exs`:

```elixir
def deps do
  [
    {:sprout, "~> 0.1.0", only: :dev, runtime: false}
  ]
end
```

Then run the installer:

```bash
mix deps.get
mix sprout.install
```

After installation, install JavaScript dependencies:

```bash
cd assets && npm install
```

## Options

- `--examples` - Include example Turbo controller demonstrating all features

```bash
mix sprout.install --examples
```

## What Gets Installed

### New Files

| File | Description |
|------|-------------|
| `lib/*_web/turbo.ex` | Turbo helpers (request detection, streaming, broadcasting) |
| `lib/*_web/channels/turbo_socket.ex` | WebSocket endpoint for Turbo Streams |
| `lib/*_web/channels/turbo_stream_channel.ex` | Public/private channel handlers |
| `assets/js/turbo.js` | Frontend Turbo initialization |

### Modified Files

| File | Changes |
|------|---------|
| `lib/*_web.ex` | Turbo imports added to controller and html |
| `lib/*_web/endpoint.ex` | Turbo socket endpoint added |
| `lib/*_web/components/core_components.ex` | BasecoatUI components |
| `lib/*_web/components/layouts.ex` | New layouts (app, simple, dashboard) |
| `lib/*_web/components/layouts/root.html.heex` | Theme toggle and flash container |
| `assets/js/app.js` | Turbo + Alpine initialization |
| `assets/css/app.css` | BasecoatUI imports |
| `assets/package.json` | npm dependencies |

### Removed Files

| File | Reason |
|------|--------|
| `assets/vendor/daisyui.js` | Replaced by BasecoatUI |
| `assets/vendor/daisyui-theme.js` | Replaced by BasecoatUI |

## Usage

### Layouts

Sprout provides three layout options:

#### App Layout
For marketing/landing pages with topbar and footer:

```heex
<Layouts.app flash={@flash}>
  <h1>Welcome to our app</h1>
</Layouts.app>
```

#### Simple Layout
For focused pages like login/signup with centered card:

```heex
<Layouts.simple flash={@flash}>
  <h1>Sign In</h1>
  <.form for={@form} action={~p"/login"}>...</.form>
</Layouts.simple>
```

#### Dashboard Layout
For authenticated sections with sidebar navigation:

```heex
<Layouts.dashboard flash={@flash} current_user={@current_user}>
  <h1>Dashboard</h1>
</Layouts.dashboard>
```

### Turbo Streams

#### Detecting Turbo Requests

```elixir
def create(conn, params) do
  if turbo_stream_request?(conn) do
    # Return Turbo Stream response
  else
    # Return normal HTML response
  end
end
```

#### Streaming Updates

```elixir
conn
|> put_flash(:info, "Created!")
|> stream(:prepend, "posts", PostHTML.post(%{post: post}))
|> send_turbo_stream()
```

#### Broadcasting via WebSocket

```elixir
# Subscribe in JavaScript
window.turboStreams.subscribe("posts")

# Broadcast from server
MyAppWeb.Turbo.broadcast("posts", [{:append, "posts", post_html}])
```

### Turbo Frames

```heex
<.turbo_frame id="comments" src={~p"/posts/#{@post}/comments"} loading="lazy">
  <p>Loading comments...</p>
</.turbo_frame>
```

### Alpine.js

```heex
<div x-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <div x-show="open">Content</div>
</div>
```

## License

MIT License - See LICENSE file for details.
