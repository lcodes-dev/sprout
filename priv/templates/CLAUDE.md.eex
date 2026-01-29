# Claude Code Instructions

This file provides Claude-specific instructions for this Phoenix project. For complete project guidelines, see AGENTS.md.

## Project Overview

This is a **Phoenix deadview application** using:
- **Hotwire Turbo** for SPA-like navigation and partial page updates
- **Alpine.js** for client-side interactivity
- **BasecoatUI** for CSS components
- **Tailwind CSS v4** for styling

**This is NOT a LiveView application.** Use controllers and traditional views (deadviews) with Turbo for interactivity.

## Critical Rules

### Architecture

1. **Use Controllers, Not LiveView**: This project uses controllers with Turbo for interactivity
2. **Wrap Templates in Layouts**: Always use `<Layouts.app>`, `<Layouts.simple>`, or `<Layouts.dashboard>`
3. **Turbo Streams for Updates**: Use `stream/4` and `send_turbo_stream/1` for partial page updates
4. **Alpine.js for Client State**: Use Alpine for dropdowns, modals, tabs, loading states

### Templates (HEEx)

```heex
<%!-- CORRECT: Use {...} for attributes and simple values --%>
<div id={@id} class={["base", @active && "active"]}>
  {@content}
</div>

<%!-- CORRECT: Use <%= %> for block constructs --%>
<%= if @show do %>
  {render_slot(@inner_block)}
<% end %>

<%!-- INCORRECT: Never use <%= %> in attributes --%>
<div id="<%= @id %>">  <%!-- WRONG --%>

<%!-- INCORRECT: Never use {...} for blocks --%>
{if @condition do}  <%!-- WRONG --%>
```

### Turbo Controller Pattern

```elixir
def create(conn, %{"post" => params}) do
  case Blog.create_post(params) do
    {:ok, post} ->
      conn
      |> put_flash(:info, "Created!")
      |> stream(:prepend, "posts", PostHTML.post(%{post: post}))
      |> send_turbo_stream()

    {:error, changeset} ->
      conn
      |> put_status(:unprocessable_entity)
      |> stream(:replace, "form", PostHTML.form(%{changeset: changeset}))
      |> send_turbo_stream()
  end
end
```

### Alpine.js Pattern

```heex
<%!-- Toggle/Dropdown --%>
<div x-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <div x-show="open" @click.outside="open = false" x-transition>
    Content
  </div>
</div>

<%!-- Loading state with Turbo --%>
<form x-data="{ loading: false }" @submit="loading = true" @turbo:submit-end.window="loading = false">
  <button :disabled="loading">
    <span x-show="!loading">Submit</span>
    <span x-show="loading">Loading...</span>
  </button>
</form>
```

## Common Mistakes to Avoid

### ❌ Don't Do This

```elixir
# Don't use LiveView
defmodule MyAppWeb.PostLive do
  use MyAppWeb, :live_view  # WRONG for this project
end

# Don't access changesets directly in templates
<.form for={@changeset}>  # WRONG

# Don't use phx-* bindings (those are for LiveView)
<button phx-click="save">  # WRONG
```

### ✅ Do This Instead

```elixir
# Use controllers
defmodule MyAppWeb.PostController do
  use MyAppWeb, :controller
end

# Use to_form() for forms
<.form for={@form} action={~p"/posts"}>  # CORRECT

# Use Turbo data attributes
<a data-turbo-method="delete" data-turbo-confirm="Sure?">  # CORRECT
```

## Quick Reference

### Turbo Stream Actions

```elixir
conn
|> stream(:append, "target-id", content)   # Add to end
|> stream(:prepend, "target-id", content)  # Add to beginning
|> stream(:replace, "target-id", content)  # Replace element
|> stream(:update, "target-id", content)   # Replace inner HTML
|> stream(:remove, "target-id")            # Remove element
|> send_turbo_stream()
```

### Turbo Request Detection

```elixir
turbo_request?(conn)         # Any Turbo request
turbo_stream_request?(conn)  # Accepts Turbo Stream
turbo_frame_request?(conn)   # From Turbo Frame
```

### Turbo Frame Component

```heex
<.turbo_frame id="content">...</.turbo_frame>
<.turbo_frame id="lazy" src={~p"/content"} loading="lazy">Loading...</.turbo_frame>
```

### BasecoatUI Classes

```heex
<button class="btn">Primary</button>
<button class="btn-secondary">Secondary</button>
<button class="btn-destructive">Danger</button>
<button class="btn-outline">Outline</button>
<button class="btn-ghost">Ghost</button>
<input class="input" />
<div class="card"><section>Content</section></div>
<span class="badge">Badge</span>
<div class="alert">Info</div>
<div class="alert-destructive">Error</div>
```

### Layout Components

```heex
<%!-- Public/marketing pages --%>
<Layouts.app flash={@flash}>...</Layouts.app>

<%!-- Auth pages (login, signup) --%>
<Layouts.simple flash={@flash}>...</Layouts.simple>

<%!-- Authenticated dashboard --%>
<Layouts.dashboard flash={@flash} current_user={@current_user}>...</Layouts.dashboard>
```

## File Structure

```
lib/<%= @app_name %>_web/
├── turbo.ex                      # Turbo helpers (stream, broadcast, etc.)
├── channels/
│   ├── turbo_socket.ex           # WebSocket for Turbo Streams
│   └── turbo_stream_channel.ex   # Channel handlers
├── controllers/
│   └── post/
│       ├── post_controller.ex    # Controller
│       ├── post_html.ex          # HTML module with components
│       └── html/
│           ├── index.html.heex
│           ├── show.html.heex
│           └── form.html.heex
├── components/
│   ├── core_components.ex        # BasecoatUI components
│   ├── layouts.ex                # Layout components
│   └── layouts/
│       └── root.html.heex
```

## When in Doubt

1. **Check AGENTS.md** for detailed guidelines
2. **Use Turbo Streams** for server-driven updates, **Alpine.js** for client-side UI state
3. **Test with Turbo headers**: `put_req_header("accept", "text/vnd.turbo-stream.html")`
4. **Every streamable element needs a unique DOM ID**
5. **Use `422` status for validation errors** in Turbo Stream responses
