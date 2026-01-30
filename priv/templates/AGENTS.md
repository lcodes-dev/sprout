# Phoenix + Hotwire + Alpine.js Project Instructions

This is a Phoenix web application using a **deadview-first architecture** with Hotwire Turbo for SPA-like navigation and Alpine.js for client-side interactivity.

## Quick Reference

| Need | Solution |
|------|----------|
| Fast page navigation | Turbo Drive (automatic) |
| Partial page updates | Turbo Frames |
| Multiple DOM updates | Turbo Streams |
| Client-side interactivity | Alpine.js |
| Real-time updates | Turbo Streams over WebSocket |

## Project Guidelines

- Use `mix precommit` alias when you are done with all changes and fix any pending issues
- Use the already included `:req` (`Req`) library for HTTP requests, **avoid** `:httpoison`, `:tesla`, and `:httpc`

---

## Controller & View Conventions

### Module Naming

Controllers and HTML modules use **flat naming** (no nested modules):

```elixir
# CORRECT - flat module name
defmodule MyAppWeb.PostController do
  use MyAppWeb, :controller
end

defmodule MyAppWeb.PostHTML do
  use MyAppWeb, :html
  embed_templates "html/*"
end

# INCORRECT - do not nest modules
defmodule MyAppWeb.Post.PostController do  # WRONG
```

### File Structure

```
lib/my_app_web/
├── controllers/
│   └── post/                        # Directory per resource
│       ├── post_controller.ex       # Module: MyAppWeb.PostController
│       ├── post_html.ex             # Module: MyAppWeb.PostHTML
│       └── html/
│           ├── index.html.heex      # List view
│           ├── show.html.heex       # Detail view
│           ├── new.html.heex        # New form page (uses partial)
│           ├── edit.html.heex       # Edit form page (uses partial)
│           └── post_form.html.heex  # Form partial for Turbo Stream updates
```

### Action Naming (Rails Convention)

Use standard RESTful action names:

| Action | HTTP Method | Path | Purpose |
|--------|-------------|------|---------|
| `index` | GET | /posts | List all resources |
| `new` | GET | /posts/new | Display new form |
| `create` | POST | /posts | Create resource |
| `show` | GET | /posts/:id | Display single resource |
| `edit` | GET | /posts/:id/edit | Display edit form |
| `update` | PUT/PATCH | /posts/:id | Update resource |
| `destroy` | DELETE | /posts/:id | Delete resource |

Custom actions are allowed for specific needs (e.g., `confirm_email` for email verification).

### Router Configuration

```elixir
scope "/", MyAppWeb do
  pipe_through :browser

  get "/", HomeController, :index

  # RESTful routes
  get "/posts", PostController, :index
  get "/posts/new", PostController, :new
  post "/posts", PostController, :create
  get "/posts/:id", PostController, :show
  get "/posts/:id/edit", PostController, :edit
  put "/posts/:id", PostController, :update
  delete "/posts/:id", PostController, :destroy
end
```

---

## Template Partials

### Purpose

Partials are extracted template fragments that can be:
1. **Reused** across multiple views
2. **Replaced via Turbo Streams** for dynamic form updates

### Naming Convention

Use descriptive names that **avoid conflicts** with Phoenix.Component functions:

```
# CORRECT - descriptive partial names
post_form.html.heex
registration_form.html.heex
email_form.html.heex

# INCORRECT - conflicts with Phoenix.Component.form/1
form.html.heex  # Will cause compilation error!
```

### Creating Partials

1. Extract the form into a partial file:

```heex
<%!-- html/post_form.html.heex --%>
<.form for={@form} id="post-form" action={~p"/posts"} class="space-y-4">
  <.input field={@form[:title]} label="Title" />
  <.input field={@form[:body]} type="textarea" label="Body" />
  <.button type="submit">Save</.button>
</.form>
```

2. Call from the main template:

```heex
<%!-- html/new.html.heex --%>
<Layouts.app flash={@flash}>
  <.header>New Post</.header>
  <.post_form form={@form} />
</Layouts.app>
```

### Turbo Stream Form Updates

Partials enable granular form replacement on validation errors:

```elixir
def create(conn, %{"post" => params}) do
  case Blog.create_post(params) do
    {:ok, post} ->
      conn
      |> put_flash(:info, "Post created!")
      |> redirect(to: ~p"/posts/#{post}")

    {:error, changeset} ->
      form = to_form(changeset)

      conn
      |> put_status(:unprocessable_entity)
      |> stream(:replace, "post-form", PostHTML.post_form(%{form: form}))
      |> send_turbo_stream()
  end
end
```

### ID Conventions for Turbo Streams

Every form and streamable element needs a unique ID:

| Element | ID Pattern | Example |
|---------|------------|---------|
| Forms | `{resource}-form` | `post-form`, `registration-form` |
| List containers | `{resources}-list` | `posts-list` |
| Individual items | `{resource}-{id}` | `post-42` |
| Counts/Badges | `{resources}-count` | `posts-count` |

---

## Elixir Guidelines

- Elixir lists **do not support index-based access**. Use `Enum.at/2`, pattern matching, or `List` functions
- Elixir variables are immutable but can be rebound. Block expressions (`if`, `case`, `cond`) must bind results:

  ```elixir
  # VALID
  socket = if connected?(socket), do: assign(socket, :val, val), else: socket

  # INVALID - rebinding inside the if doesn't work
  if connected?(socket), do: socket = assign(socket, :val, val)
  ```

- **Never** nest multiple modules in the same file
- **Never** use map access syntax (`changeset[:field]`) on structs - use `struct.field` or `Ecto.Changeset.get_field/2`
- Don't use `String.to_atom/1` on user input (memory leak risk)
- Predicate functions should end in `?` (e.g., `valid?/1`), not start with `is_`
- Use `Task.async_stream/3` for concurrent enumeration with back-pressure

---

## Phoenix Guidelines

### Router Scopes

Router `scope` blocks include an optional alias prefixed to all routes:

```elixir
scope "/admin", MyAppWeb.Admin do
  pipe_through :browser
  get "/users", UserController, :index  # Points to MyAppWeb.Admin.UserController
end
```

**Never** create your own alias for routes - the scope provides it.

### Controllers (Deadview Pattern)

This project uses **controllers with traditional views** (deadviews), not LiveView:

```elixir
defmodule MyAppWeb.PostController do
  use MyAppWeb, :controller

  def index(conn, _params) do
    posts = Blog.list_posts()
    render(conn, :index, posts: posts)
  end
end
```

### Templates

Controllers use an associated HTML module with `embed_templates`:

```elixir
defmodule MyAppWeb.PostHTML do
  use MyAppWeb, :html
  embed_templates "html/*"

  # Function components for reuse
  attr :post, :map, required: true
  def post_card(assigns) do
    ~H"""
    <article id={"post-#{@post.id}"}>
      {@post.title}
    </article>
    """
  end
end
```

---

## Ecto Guidelines

- **Always** preload associations when they'll be accessed in templates
- Remember `import Ecto.Query` in `seeds.exs`
- `Ecto.Schema` fields use `:string` type even for `:text` columns
- Use `Ecto.Changeset.get_field(changeset, :field)` to access changeset fields
- Fields set programmatically (`user_id`) must NOT be in `cast` calls - set them explicitly
- **Always** use `mix ecto.gen.migration migration_name` for migrations

---

## HEEx Template Guidelines

### Interpolation Rules

- Use `{...}` for attribute interpolation and simple value interpolation
- Use `<%= ... %>` for block constructs (`if`, `case`, `cond`, `for`)

```heex
<%!-- CORRECT --%>
<div id={@id} class={["base", @active && "active"]}>
  {@content}
  <%= if @show_extra do %>
    {render_slot(@extra)}
  <% end %>
</div>

<%!-- INCORRECT - will cause syntax errors --%>
<div id="<%= @id %>">  <%!-- Wrong: use {..} in attributes --%>
  {if @condition do}   <%!-- Wrong: blocks need <%= %> --%>
```

### Class Lists

**Always** use list syntax for conditional classes:

```heex
<a class={[
  "px-2 text-white",
  @active && "font-bold",
  if(@error, do: "border-red-500", else: "border-gray-200")
]}>
```

### Comments

Use HEEx comment syntax: `<%!-- comment --%>`

### Curly Braces in Code Blocks

For literal `{` or `}` in `<pre>` or `<code>`, use `phx-no-curly-interpolation`:

```heex
<code phx-no-curly-interpolation>
  let obj = {key: "val"}
</code>
```

### For Comprehensions

**Always** use `<%= for item <- @items do %>`, **never** `<% Enum.each %>`:

```heex
<%= for post <- @posts do %>
  <.post_card post={post} />
<% end %>
```

---

## Layouts

This project provides three layout components. Wrap your template content with the appropriate layout:

### App Layout (Marketing/Public Pages)

```heex
<Layouts.app flash={@flash}>
  <h1>Welcome</h1>
</Layouts.app>
```

### Simple Layout (Auth Pages)

```heex
<Layouts.simple flash={@flash}>
  <h1>Sign In</h1>
  <.form for={@form} action={~p"/login"}>...</.form>
</Layouts.simple>
```

### Dashboard Layout (Authenticated Sections)

```heex
<Layouts.dashboard flash={@flash} current_user={@current_user}>
  <h1>Dashboard</h1>
</Layouts.dashboard>
```

---

## Turbo Integration

### Turbo Module API

The `Turbo` module is imported in controllers. Use these helpers:

```elixir
# Request detection
turbo_request?(conn)           # Any Turbo request
turbo_stream_request?(conn)    # Accepts Turbo Stream
turbo_frame_request?(conn)     # From Turbo Frame
turbo_frame_id(conn)           # Get frame ID

# Streaming responses
conn
|> stream(:prepend, "posts", PostHTML.post(%{post: post}))
|> stream(:remove, "post-#{id}")
|> stream(:update, "count", "#{count}")
|> send_turbo_stream()

# Turbo-aware redirect (uses 303 for Turbo requests)
turbo_redirect(conn, to: ~p"/posts")
```

### Turbo Stream Actions

| Action | Description |
|--------|-------------|
| `:append` | Add to end of target |
| `:prepend` | Add to beginning |
| `:replace` | Replace entire element |
| `:update` | Replace inner HTML |
| `:remove` | Remove element |
| `:before` | Insert before target |
| `:after` | Insert after target |

### Turbo Frames in Templates

```heex
<%!-- Basic frame --%>
<.turbo_frame id="content">
  <p>Content here</p>
</.turbo_frame>

<%!-- Lazy loading --%>
<.turbo_frame id="comments" src={~p"/posts/#{@post}/comments"} loading="lazy">
  <.spinner />
</.turbo_frame>
```

### Turbo Data Attributes

```heex
<%!-- Break out of frame --%>
<a href={~p"/posts/#{@post}"} data-turbo-frame="_top">View Full</a>

<%!-- DELETE with confirmation --%>
<a href={~p"/posts/#{@post}"} data-turbo-method="delete" data-turbo-confirm="Delete?">
  Delete
</a>

<%!-- Target specific frame --%>
<.form action={~p"/search"} data-turbo-frame="results">
```

### Controller Pattern with Turbo Streams

```elixir
def create(conn, %{"post" => params}) do
  case Blog.create_post(params) do
    {:ok, post} ->
      conn
      |> put_flash(:info, "Created!")
      |> stream(:prepend, "posts-list", PostHTML.post_card(%{post: post}))
      |> stream(:replace, "post-form", PostHTML.post_form(%{form: to_form(Blog.change_post(%Post{}))}))
      |> send_turbo_stream()

    {:error, changeset} ->
      conn
      |> put_status(:unprocessable_entity)
      |> stream(:replace, "post-form", PostHTML.post_form(%{form: to_form(changeset)}))
      |> send_turbo_stream()
  end
end
```

### WebSocket Broadcasting

```elixir
# Subscribe in template
<meta name="turbo-stream-source" content="posts">

# Broadcast from server
MyAppWeb.Turbo.broadcast("posts", [{:prepend, "posts-list", post_html}])
```

---

## Alpine.js Integration

Alpine.js provides client-side interactivity. It's initialized in `app.js` and works with Turbo automatically.

### Basic Patterns

```heex
<%!-- Toggle --%>
<div x-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <div x-show="open" x-transition>Content</div>
</div>

<%!-- Dropdown --%>
<div x-data="{ open: false }">
  <button @click="open = !open">Menu</button>
  <div x-show="open" @click.outside="open = false">
    <a href="/profile">Profile</a>
  </div>
</div>

<%!-- Loading state --%>
<form x-data="{ loading: false }" @submit="loading = true" @turbo:submit-end.window="loading = false">
  <button :disabled="loading">
    <span x-show="!loading">Submit</span>
    <span x-show="loading">Loading...</span>
  </button>
</form>

<%!-- Tabs --%>
<div x-data="{ tab: 'one' }">
  <button @click="tab = 'one'" :class="{ 'active': tab === 'one' }">Tab 1</button>
  <button @click="tab = 'two'" :class="{ 'active': tab === 'two' }">Tab 2</button>
  <div x-show="tab === 'one'">Content 1</div>
  <div x-show="tab === 'two'">Content 2</div>
</div>
```

### Key Alpine Directives

| Directive | Purpose |
|-----------|---------|
| `x-data` | Define reactive state |
| `x-show` | Toggle visibility |
| `x-if` | Conditional rendering |
| `x-for` | Loop rendering |
| `x-model` | Two-way binding |
| `x-bind:` / `:` | Bind attributes |
| `x-on:` / `@` | Event listeners |
| `x-transition` | Animate show/hide |
| `@click.outside` | Click outside handler |

---

## CSS & Styling

### Tailwind CSS v4

This project uses Tailwind CSS v4 with the new import syntax in `app.css`:

```css
@import "tailwindcss" source(none);
@import "basecoat-css";
@source "../css";
@source "../js";
@source "../../lib/my_app_web";
```

**Rules:**
- **Never** use `@apply`
- **Never** modify the import structure
- Use Tailwind utility classes directly in templates
- BasecoatUI provides semantic component classes (`btn`, `card`, `input`, etc.)

### BasecoatUI Components

The project includes BasecoatUI CSS components. Common classes:

```heex
<button class="btn">Primary</button>
<button class="btn-secondary">Secondary</button>
<button class="btn-destructive">Delete</button>
<button class="btn-outline">Outline</button>
<button class="btn-ghost">Ghost</button>
<button class="btn-sm">Small</button>

<input class="input" />
<textarea class="textarea"></textarea>

<div class="card">
  <header>Title</header>
  <section>Content</section>
  <footer>Actions</footer>
</div>

<span class="badge">Badge</span>
<div class="alert">Alert message</div>
<div class="alert-destructive">Error message</div>
```

### Dark Mode

Dark mode uses class-based approach (`.dark` on `<html>`). The theme toggle dispatches `basecoat:theme` event:

```heex
<button onclick="document.dispatchEvent(new CustomEvent('basecoat:theme'))">
  Toggle Theme
</button>
```

---

## Form Handling

### Standard Form

```heex
<.form for={@form} action={~p"/posts"} id="post-form">
  <.input field={@form[:title]} label="Title" />
  <.input field={@form[:body]} type="textarea" label="Body" />
  <button type="submit" class="btn">Save</button>
</.form>
```

### Form with Turbo Frame Target

```heex
<.form for={@form} action={~p"/search"} method="get" data-turbo-frame="results">
  <input type="search" name="q" class="input" />
</form>

<.turbo_frame id="results">
  <%!-- Results appear here --%>
</.turbo_frame>
```

### Creating Forms in Controllers

```elixir
# From params
def new(conn, _params) do
  render(conn, :new, form: to_form(%{}))
end

# From changeset
def edit(conn, %{"id" => id}) do
  post = Blog.get_post!(id)
  changeset = Blog.change_post(post)
  render(conn, :edit, form: to_form(changeset), post: post)
end
```

---

## Testing

### Controller Tests with Turbo Streams

```elixir
test "creates post with turbo stream", %{conn: conn} do
  conn =
    conn
    |> put_req_header("accept", "text/vnd.turbo-stream.html")
    |> post(~p"/posts", post: %{title: "Test"})

  assert response(conn, 200)
  assert get_resp_header(conn, "content-type") |> hd() =~ "text/vnd.turbo-stream.html"
  assert response(conn, 200) =~ "turbo-stream"
end

test "returns 422 for invalid data", %{conn: conn} do
  conn =
    conn
    |> put_req_header("accept", "text/vnd.turbo-stream.html")
    |> post(~p"/posts", post: %{title: ""})

  assert response(conn, 422)
end
```

### Testing Guidelines

- Use `start_supervised!/1` to start processes in tests
- Avoid `Process.sleep/1` - use `Process.monitor/1` and assert on `:DOWN` message
- **Always** add unique DOM IDs to elements for testing
- Test outcomes, not implementation details

---

## Key Principles

1. **Flat Module Names**: Use `AppWeb.PostController`, not `AppWeb.Post.PostController`
2. **Rails Action Names**: `index`, `new`, `create`, `show`, `edit`, `update`, `destroy`
3. **Descriptive Partial Names**: Use `post_form`, not `form` (avoids conflicts)
4. **Semantic IDs**: Every streamable element needs a unique ID (`post-#{id}`)
5. **HTTP Status Codes**: Use `422 :unprocessable_entity` for validation errors
6. **Granular Updates**: Stream only what changed, not entire lists
7. **Turbo Frames for Scoping**: Use frames to scope navigation to page sections
8. **Alpine for UI State**: Use Alpine.js for dropdowns, modals, tabs, client-side validation
9. **Turbo for Server Communication**: Use Turbo Streams for server-driven updates
