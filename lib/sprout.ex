defmodule Sprout do
  @moduledoc """
  Phoenix starter kit installer with Hotwire Turbo, Alpine.js, and BasecoatUI.

  Sprout transforms a fresh Phoenix project into a production-ready application
  with a deadview-first architecture, featuring:

  - **Hotwire Turbo** - SPA-like navigation without the SPA complexity
  - **Alpine.js** - Lightweight JavaScript framework for client-side interactivity
  - **BasecoatUI** - Framework-agnostic CSS component library

  ## Installation

  Add `sprout` to your dependencies:

      {:sprout, "~> 0.1.0", only: :dev, runtime: false}

  Then run the installer:

      mix sprout.install

  ## Options

  - `--examples` - Include example Turbo controller demonstrating all features

  ## What Gets Installed

  ### New Files
  - `lib/my_app_web/turbo.ex` - Turbo helpers (request detection, streaming, broadcasting)
  - `lib/my_app_web/channels/turbo_socket.ex` - WebSocket endpoint
  - `lib/my_app_web/channels/turbo_stream_channel.ex` - Stream channel handlers
  - `assets/js/turbo.js` - Frontend Turbo initialization

  ### Modified Files
  - `lib/my_app_web.ex` - Turbo imports added
  - `lib/my_app_web/endpoint.ex` - Turbo socket endpoint added
  - `lib/my_app_web/components/core_components.ex` - BasecoatUI components
  - `lib/my_app_web/components/layouts.ex` - New layouts (app, simple, dashboard)
  - `lib/my_app_web/components/layouts/root.html.heex` - Theme toggle updates
  - `assets/js/app.js` - Turbo + Alpine initialization
  - `assets/css/app.css` - BasecoatUI imports
  - `assets/package.json` - npm dependencies

  ### Removed Files
  - `assets/vendor/daisyui.js` - Replaced by BasecoatUI
  - `assets/vendor/daisyui-theme.js` - Replaced by BasecoatUI
  """

  @doc """
  Returns the path to the priv/templates directory.
  """
  def templates_path do
    Application.app_dir(:sprout, "priv/templates")
  end

  @doc """
  Returns the path to a specific template file.
  """
  def template_path(name) do
    Path.join(templates_path(), name)
  end
end
