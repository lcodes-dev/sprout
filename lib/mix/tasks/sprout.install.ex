defmodule Mix.Tasks.Sprout.Install do
  @shortdoc "Installs Sprout - Hotwire Turbo, Alpine.js, and BasecoatUI for Phoenix"

  @moduledoc """
  Installs Sprout into your Phoenix project.

  ```bash
  mix sprout.install
  ```

  ## Options

  - `--examples` - Include example Turbo controller demonstrating all features
  - `--no-auth` - Skip user authentication (auth is included by default)
  - `--no-payments` - Skip Paddle Billing integration (payments is included by default)

  ## What Gets Installed

  This installer will:

  1. Add the Turbo helper module with streaming and broadcasting support
  2. Add WebSocket channels for real-time Turbo Streams
  3. Update your endpoint with the Turbo socket
  4. Replace DaisyUI with BasecoatUI CSS components
  5. Configure Alpine.js for client-side interactivity
  6. Add new layout options (app, simple, dashboard)

  By default (with auth):
  - User registration and login
  - Email confirmation
  - Password reset via email
  - HTML email templates
  - Dashboard layout with user menu

  By default (with payments):
  - Paddle Billing integration
  - Subscription management
  - One-time purchases with gated access
  - Credit/token system

  After installation, run:

  ```bash
  cd assets && npm install
  mix ecto.migrate
  ```
  """

  use Igniter.Mix.Task

  @impl Igniter.Mix.Task
  def info(_argv, _composing_task) do
    %Igniter.Mix.Task.Info{
      group: :sprout,
      example: "mix sprout.install --examples",
      schema: [
        examples: :boolean,
        auth: :boolean,
        payments: :boolean
      ],
      defaults: [
        examples: false,
        auth: true,
        payments: true
      ],
      aliases: [
        e: :examples,
        p: :payments
      ],
      adds_deps: [
        {:bcrypt_elixir, "~> 3.0"}
      ]
    }
  end

  @impl Igniter.Mix.Task
  def igniter(igniter) do
    options = igniter.args.options
    include_examples? = Keyword.get(options, :examples, false)
    include_auth? = Keyword.get(options, :auth, true)
    include_payments? = Keyword.get(options, :payments, true)

    # Get app name from Mix project config (most reliable source)
    app_name = Mix.Project.config()[:app] |> to_string()
    app_module_name = Macro.camelize(app_name)
    web_module_name = app_module_name <> "Web"
    web_path = "lib/#{app_name}_web"
    app_path = "lib/#{app_name}"

    assigns = [
      web_module: web_module_name,
      app_module: app_module_name,
      app_name: app_name,
      web_path: web_path,
      app_path: app_path
    ]

    igniter
    |> configure_igniter_dont_move_controllers(assigns)
    |> Igniter.add_notice("""
    Sprout Installation
    ===================

    Installing Hotwire Turbo, Alpine.js, and BasecoatUI...
    #{if include_auth?, do: "Including user authentication...", else: ""}
    #{if include_payments?, do: "Including Paddle payments integration...", else: ""}
    """)
    # Create agent instruction files
    |> create_agents_md(assigns)
    |> create_claude_md(assigns)
    # Create new Elixir files
    |> create_turbo_module(assigns)
    |> create_turbo_socket(assigns)
    |> create_turbo_stream_channel(assigns)
    # Create JavaScript files
    |> create_turbo_js()
    |> create_app_js(assigns)
    # Create/update CSS files
    |> create_app_css(assigns)
    # Update package.json
    |> update_package_json(assigns)
    # Update existing Elixir files
    |> update_web_module(assigns)
    |> update_endpoint(assigns)
    # Update components
    |> create_core_components(assigns)
    |> create_layouts(assigns)
    |> create_root_layout(assigns)
    # Install announcement banners
    |> create_announcements_context(assigns)
    |> create_banner_schema(assigns)
    |> create_banner_component(assigns)
    |> create_fetch_banners_plug(assigns)
    |> create_announcements_migration(assigns)
    |> create_announcements_tests(assigns)
    |> update_router_for_banners(assigns)
    # Install home controller (replaces default PageController)
    |> create_home_controller(assigns)
    |> update_home_route(assigns)
    |> remove_page_controller(assigns)
    |> copy_logo_image()
    # Remove DaisyUI files
    |> remove_daisyui_files()
    # Optional: Add example controller
    |> maybe_add_examples(include_examples?, assigns)
    # Optional: Add authentication
    |> maybe_add_auth(include_auth?, assigns)
    # Optional: Add payments (requires auth)
    |> maybe_add_payments(include_payments? and include_auth?, assigns)
    |> add_final_notice(include_examples?, include_auth?, include_payments?)
  end

  defp add_final_notice(igniter, include_examples?, include_auth?, include_payments?) do
    Igniter.add_notice(igniter, """

    ✅ Sprout installed successfully!

    Next steps:
    1. Run `cd assets && npm install` to install JavaScript dependencies
    #{if include_auth?, do: "2. Run `mix ecto.migrate` to create database tables", else: ""}
    #{if include_auth?, do: "3. Restart your Phoenix server", else: "2. Restart your Phoenix server"}
    #{if include_examples?, do: "#{if include_auth?, do: "4", else: "3"}. Visit /turbo-example to see Turbo in action", else: ""}
    #{if include_payments?, do: "\n    For payments setup:\n    - Set PADDLE_API_KEY, PADDLE_WEBHOOK_SECRET, and PADDLE_CLIENT_TOKEN environment variables\n    - Configure products in the database\n    - Visit /billing to see the billing dashboard", else: ""}

    Optional cleanup:
    - Remove empty folder: rm -rf lib/*_web/controllers/page_html

    Documentation: https://github.com/yourusername/sprout
    """)
  end

  # ============================================================================
  # Configure Igniter to not relocate controller files
  # ============================================================================

  defp configure_igniter_dont_move_controllers(igniter, assigns) do
    web_path = assigns[:web_path]
    # Add pattern to prevent Igniter from relocating files in controllers folder
    pattern = ~r"#{Regex.escape(web_path)}/controllers/"

    Igniter.Project.IgniterConfig.dont_move_file_pattern(igniter, pattern)
  end

  # ============================================================================
  # Template Helper
  # ============================================================================

  defp template_path(name) do
    Path.join(:code.priv_dir(:sprout), "templates/#{name}")
  end

  defp render_template(name, assigns) do
    template_path(name)
    |> File.read!()
    |> EEx.eval_string(assigns: assigns)
  end

  defp read_template(name) do
    template_path(name)
    |> File.read!()
  end

  # ============================================================================
  # Create Agent Instruction Files
  # ============================================================================

  defp create_agents_md(igniter, _assigns) do
    path = "AGENTS.md"
    content = read_template("AGENTS.md")

    Igniter.create_new_file(igniter, path, content, on_exists: :overwrite)
  end

  defp create_claude_md(igniter, _assigns) do
    path = "CLAUDE.md"
    content = read_template("CLAUDE.md")

    Igniter.create_new_file(igniter, path, content, on_exists: :overwrite)
  end

  # ============================================================================
  # Create New Elixir Files
  # ============================================================================

  defp create_turbo_module(igniter, assigns) do
    path = "#{assigns[:web_path]}/turbo.ex"
    content = render_template("turbo.ex.eex", assigns)

    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_turbo_socket(igniter, assigns) do
    path = "#{assigns[:web_path]}/channels/turbo_socket.ex"
    content = render_template("channels/turbo_socket.ex.eex", assigns)

    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_turbo_stream_channel(igniter, assigns) do
    path = "#{assigns[:web_path]}/channels/turbo_stream_channel.ex"
    content = render_template("channels/turbo_stream_channel.ex.eex", assigns)

    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  # ============================================================================
  # Create JavaScript Files
  # ============================================================================

  defp create_turbo_js(igniter) do
    path = "assets/js/turbo.js"
    content = File.read!(template_path("js/turbo.js"))

    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_app_js(igniter, assigns) do
    path = "assets/js/app.js"
    content = render_template("js/app.js.eex", assigns)

    Igniter.create_new_file(igniter, path, content, on_exists: :overwrite)
  end

  # ============================================================================
  # Create CSS Files
  # ============================================================================

  defp create_app_css(igniter, assigns) do
    path = "assets/css/app.css"
    content = render_template("css/app.css.eex", assigns)

    Igniter.create_new_file(igniter, path, content, on_exists: :overwrite)
  end

  # ============================================================================
  # Update package.json
  # ============================================================================

  defp update_package_json(igniter, assigns) do
    path = "assets/package.json"
    new_content = render_template("js/package.json.eex", assigns)

    Igniter.create_new_file(igniter, path, new_content, on_exists: :overwrite)
  end

  # ============================================================================
  # Update Web Module
  # ============================================================================

  defp update_web_module(igniter, assigns) do
    web_module = Module.concat([assigns[:web_module]])

    igniter
    |> Igniter.Project.Module.find_and_update_module!(web_module, fn zipper ->
      zipper = add_import_to_controller(zipper, assigns[:web_module])
      zipper = add_import_to_html(zipper, assigns[:web_module])
      zipper = add_banner_import_to_html(zipper, assigns[:web_module])
      {:ok, zipper}
    end)
  end

  defp add_import_to_controller(zipper, web_module) do
    import_code = "import #{web_module}.Turbo"

    case Igniter.Code.Function.move_to_def(zipper, :controller, 0) do
      {:ok, def_zipper} ->
        if already_has_import?(def_zipper, "Turbo") do
          Sourceror.Zipper.topmost(zipper)
        else
          add_import_after_plug_conn(def_zipper, import_code)
        end

      :error ->
        zipper
    end
  end

  defp add_import_to_html(zipper, web_module) do
    import_code = "import #{web_module}.Turbo, only: [turbo_frame: 1, turbo_stream: 1]"

    case Igniter.Code.Function.move_to_def(zipper, :html, 0) do
      {:ok, def_zipper} ->
        if already_has_import?(def_zipper, "Turbo") do
          Sourceror.Zipper.topmost(zipper)
        else
          add_import_after_core_components(def_zipper, import_code)
        end

      :error ->
        zipper
    end
  end

  defp add_banner_import_to_html(zipper, web_module) do
    import_code = "import #{web_module}.Components.AnnouncementBanner"

    case Igniter.Code.Function.move_to_def(zipper, :html, 0) do
      {:ok, def_zipper} ->
        if already_has_import?(def_zipper, "AnnouncementBanner") do
          Sourceror.Zipper.topmost(zipper)
        else
          add_import_after_core_components(def_zipper, import_code)
        end

      :error ->
        zipper
    end
  end

  defp already_has_import?(zipper, module_part) do
    zipper
    |> Sourceror.Zipper.topmost()
    |> Sourceror.Zipper.node()
    |> Macro.to_string()
    |> String.contains?("import")
    |> Kernel.and(
      zipper
      |> Sourceror.Zipper.topmost()
      |> Sourceror.Zipper.node()
      |> Macro.to_string()
      |> String.contains?(module_part)
    )
  end

  defp add_import_after_plug_conn(zipper, import_code) do
    case find_import_containing(zipper, "Plug.Conn") do
      {:ok, import_zipper} ->
        import_zipper
        |> Igniter.Code.Common.add_code(import_code, placement: :after)
        |> Sourceror.Zipper.topmost()

      :error ->
        # If no Plug.Conn import found, try after use
        case Igniter.Code.Common.move_to(zipper, fn z ->
          Igniter.Code.Function.function_call?(z, :use, 2)
        end) do
          {:ok, use_zipper} ->
            use_zipper
            |> Igniter.Code.Common.add_code(import_code, placement: :after)
            |> Sourceror.Zipper.topmost()

          :error ->
            Sourceror.Zipper.topmost(zipper)
        end
    end
  end

  defp add_import_after_core_components(zipper, import_code) do
    case find_import_containing(zipper, "CoreComponents") do
      {:ok, import_zipper} ->
        import_zipper
        |> Igniter.Code.Common.add_code(import_code, placement: :after)
        |> Sourceror.Zipper.topmost()

      :error ->
        # Fallback: add after any import
        case Igniter.Code.Common.move_to(zipper, fn z ->
          Igniter.Code.Function.function_call?(z, :import, 1) or
          Igniter.Code.Function.function_call?(z, :import, 2)
        end) do
          {:ok, import_zipper} ->
            import_zipper
            |> Igniter.Code.Common.add_code(import_code, placement: :after)
            |> Sourceror.Zipper.topmost()

          :error ->
            Sourceror.Zipper.topmost(zipper)
        end
    end
  end

  defp find_import_containing(zipper, search_string) do
    Igniter.Code.Common.move_to(zipper, fn z ->
      node = Sourceror.Zipper.node(z)
      node_string = Macro.to_string(node)

      (Igniter.Code.Function.function_call?(z, :import, 1) or
       Igniter.Code.Function.function_call?(z, :import, 2)) and
      String.contains?(node_string, search_string)
    end)
  end

  # ============================================================================
  # Update Endpoint
  # ============================================================================

  defp update_endpoint(igniter, assigns) do
    web_module = assigns[:web_module]
    endpoint_module = Module.concat([web_module, "Endpoint"])

    socket_code = """
    socket "/turbo-socket", #{web_module}.Channels.TurboSocket,
      websocket: true,
      longpoll: true
    """

    igniter
    |> Igniter.Project.Module.find_and_update_module!(endpoint_module, fn zipper ->
      # Check if turbo-socket already exists
      node_string = zipper |> Sourceror.Zipper.topmost() |> Sourceror.Zipper.node() |> Macro.to_string()

      if String.contains?(node_string, "turbo-socket") do
        {:ok, zipper}
      else
        # Find the first socket declaration and add after it
        case Igniter.Code.Common.move_to(zipper, fn z ->
          Igniter.Code.Function.function_call?(z, :socket, 2) or
          Igniter.Code.Function.function_call?(z, :socket, 3)
        end) do
          {:ok, socket_zipper} ->
            {:ok, socket_zipper
            |> Igniter.Code.Common.add_code(socket_code, placement: :after)
            |> Sourceror.Zipper.topmost()}

          :error ->
            # No socket found, add after use statement
            case Igniter.Code.Common.move_to(zipper, fn z ->
              Igniter.Code.Function.function_call?(z, :use, 2)
            end) do
              {:ok, use_zipper} ->
                {:ok, use_zipper
                |> Igniter.Code.Common.add_code(socket_code, placement: :after)
                |> Sourceror.Zipper.topmost()}

              :error ->
                {:ok, zipper}
            end
        end
      end
    end)
  end

  # ============================================================================
  # Create Component Files (overwrite)
  # ============================================================================

  defp create_core_components(igniter, assigns) do
    path = "#{assigns[:web_path]}/components/core_components.ex"
    content = render_template("core_components.ex.eex", assigns)

    # Remove existing file first, then create new one
    igniter
    |> Igniter.include_or_create_file(path, content)
    |> Igniter.update_elixir_file(path, fn _zipper ->
      # Replace entire content by returning zipper for new content
      {:ok, Igniter.Code.Common.parse_to_zipper!(content)}
    end)
  end

  defp create_layouts(igniter, assigns) do
    path = "#{assigns[:web_path]}/components/layouts.ex"
    content = render_template("layouts.ex.eex", assigns)

    igniter
    |> Igniter.include_or_create_file(path, content)
    |> Igniter.update_elixir_file(path, fn _zipper ->
      {:ok, Igniter.Code.Common.parse_to_zipper!(content)}
    end)
  end

  defp create_root_layout(igniter, assigns) do
    path = "#{assigns[:web_path]}/components/layouts/root.html.heex"
    content = render_template("layouts/root.html.heex.eex", assigns)

    Igniter.create_new_file(igniter, path, content, on_exists: :overwrite)
  end

  # ============================================================================
  # Install Home Controller
  # ============================================================================

  defp create_home_controller(igniter, assigns) do
    web_path = assigns[:web_path]

    controller_content = render_template("controllers/home/home_controller.ex.eex", assigns)
    html_content = render_template("controllers/home/home_html.ex.eex", assigns)
    template_content = File.read!(template_path("controllers/home/html/index.html.heex"))

    igniter
    |> Igniter.create_new_file("#{web_path}/controllers/home/home_controller.ex", controller_content, on_exists: :skip)
    |> Igniter.create_new_file("#{web_path}/controllers/home/home_html.ex", html_content, on_exists: :skip)
    |> Igniter.create_new_file("#{web_path}/controllers/home/html/index.html.heex", template_content, on_exists: :skip)
  end

  defp update_home_route(igniter, assigns) do
    web_module = assigns[:web_module]

    igniter
    |> Igniter.Project.Module.find_and_update_module!(Module.concat([web_module, "Router"]), fn zipper ->
      node_string = zipper |> Sourceror.Zipper.topmost() |> Sourceror.Zipper.node() |> Macro.to_string()

      cond do
        String.contains?(node_string, "HomeController") ->
          {:ok, zipper}

        String.contains?(node_string, "PageController, :home") ->
          updated_string = String.replace(node_string, "PageController, :home", "HomeController, :index")
          {:ok, Igniter.Code.Common.parse_to_zipper!(updated_string)}

        true ->
          {:ok, zipper}
      end
    end)
  end

  defp remove_page_controller(igniter, assigns) do
    web_path = assigns[:web_path]

    igniter
    |> Igniter.rm("#{web_path}/controllers/page_controller.ex")
    |> Igniter.rm("#{web_path}/controllers/page_html.ex")
    |> Igniter.rm("#{web_path}/controllers/page_html/home.html.heex")
  end

  defp copy_logo_image(igniter) do
    logo_path = template_path("static/images/logo.png")

    if File.exists?(logo_path) do
      content = File.read!(logo_path)
      Igniter.create_new_file(igniter, "priv/static/images/logo.png", content, on_exists: :skip)
    else
      igniter
    end
  end

  # ============================================================================
  # Remove DaisyUI Files
  # ============================================================================

  defp remove_daisyui_files(igniter) do
    igniter
    |> Igniter.rm("assets/vendor/daisyui.js")
    |> Igniter.rm("assets/vendor/daisyui-theme.js")
  end

  # ============================================================================
  # Announcement Banners
  # ============================================================================

  defp create_announcements_context(igniter, assigns) do
    path = "#{assigns[:app_path]}/announcements.ex"
    content = render_template("announcements/announcements.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_banner_schema(igniter, assigns) do
    path = "#{assigns[:app_path]}/announcements/banner.ex"
    content = render_template("announcements/schemas/banner.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_banner_component(igniter, assigns) do
    path = "#{assigns[:web_path]}/components/announcement_banner.ex"
    content = render_template("announcements/banner_component.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_fetch_banners_plug(igniter, assigns) do
    path = "#{assigns[:web_path]}/plugs/fetch_banners.ex"
    content = render_template("announcements/plugs/fetch_banners.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_announcements_migration(igniter, assigns) do
    timestamp = Calendar.strftime(DateTime.utc_now(), "%Y%m%d%H%M%S")
    path = "priv/repo/migrations/#{timestamp}_create_announcements_table.exs"
    content = render_template("announcements/migrations/create_announcements_table.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_announcements_tests(igniter, assigns) do
    app_name = assigns[:app_name]

    # Create fixtures
    fixtures_content = render_template("announcements/test/support/fixtures/announcements_fixtures.ex.eex", assigns)
    igniter = Igniter.create_new_file(igniter, "test/support/announcements_fixtures.ex", fixtures_content, on_exists: :skip)

    # Create announcements test
    test_content = render_template("announcements/test/announcements_test.exs.eex", assigns)
    Igniter.create_new_file(igniter, "test/#{app_name}/announcements_test.exs", test_content, on_exists: :skip)
  end

  defp update_router_for_banners(igniter, assigns) do
    web_module = assigns[:web_module]

    igniter
    |> Igniter.Project.Module.find_and_update_module!(Module.concat([web_module, "Router"]), fn zipper ->
      node_string = zipper |> Sourceror.Zipper.topmost() |> Sourceror.Zipper.node() |> Macro.to_string()

      if String.contains?(node_string, "FetchBanners") do
        {:ok, zipper}
      else
        # Add plug FetchBanners to the :browser pipeline
        updated_string = String.replace(
          node_string,
          ~r/(pipeline :browser do\s*.+?)(\n\s*end)/s,
          "\\1\n    plug #{web_module}.Plugs.FetchBanners\\2",
          global: false
        )
        {:ok, Igniter.Code.Common.parse_to_zipper!(updated_string)}
      end
    end)
  end

  # ============================================================================
  # Optional Examples
  # ============================================================================

  defp maybe_add_examples(igniter, false, _assigns), do: igniter

  defp maybe_add_examples(igniter, true, assigns) do
    igniter
    |> create_example_controller(assigns)
    |> create_example_html_module(assigns)
    |> create_example_templates(assigns)
    |> add_example_routes(assigns)
    |> create_hotwire_guide(assigns)
  end

  defp create_example_controller(igniter, assigns) do
    path = "#{assigns[:web_path]}/controllers/turbo_example/turbo_example_controller.ex"

    if File.exists?(template_path("controllers/turbo_example/turbo_example_controller.ex.eex")) do
      content = render_template("controllers/turbo_example/turbo_example_controller.ex.eex", assigns)
      Igniter.create_new_file(igniter, path, content, on_exists: :skip)
    else
      igniter
    end
  end

  defp create_example_html_module(igniter, assigns) do
    path = "#{assigns[:web_path]}/controllers/turbo_example/turbo_example_html.ex"

    if File.exists?(template_path("controllers/turbo_example/turbo_example_html.ex.eex")) do
      content = render_template("controllers/turbo_example/turbo_example_html.ex.eex", assigns)
      Igniter.create_new_file(igniter, path, content, on_exists: :skip)
    else
      igniter
    end
  end

  defp create_example_templates(igniter, assigns) do
    templates = [
      "index.html.heex",
      "drive_demo.html.heex",
      "frame_content.html.heex",
      "counter.html.heex"
    ]

    Enum.reduce(templates, igniter, fn template_name, acc ->
      path = "#{assigns[:web_path]}/controllers/turbo_example/html/#{template_name}"
      template_file = template_path("controllers/turbo_example/html/#{template_name}")

      if File.exists?(template_file) do
        content = File.read!(template_file)
        Igniter.create_new_file(acc, path, content, on_exists: :skip)
      else
        acc
      end
    end)
  end

  defp add_example_routes(igniter, assigns) do
    web_module = assigns[:web_module]

    route_content = """
    # Turbo Example Routes
    get "/turbo-example", TurboExampleController, :index
    get "/turbo-example/drive-demo", TurboExampleController, :drive_demo
    get "/turbo-example/frame-content", TurboExampleController, :frame_content
    post "/turbo-example/increment", TurboExampleController, :increment_counter
    post "/turbo-example/messages", TurboExampleController, :create_message
    delete "/turbo-example/messages/:id", TurboExampleController, :delete_message
    delete "/turbo-example/clear", TurboExampleController, :clear_messages
    post "/turbo-example/broadcast", TurboExampleController, :broadcast_message
    post "/turbo-example/server-event", TurboExampleController, :simulate_server_event
    """

    igniter
    |> Igniter.Project.Module.find_and_update_module!(Module.concat([web_module, "Router"]), fn zipper ->
      node_string = zipper |> Sourceror.Zipper.topmost() |> Sourceror.Zipper.node() |> Macro.to_string()

      if String.contains?(node_string, "TurboExampleController") do
        {:ok, zipper}
      else
        # Find the first scope "/" block and add routes there
        updated_string = String.replace(
          node_string,
          ~r/(get "\/", HomeController, :index)/,
          "\\1\n\n    #{String.trim(route_content)}"
        )
        {:ok, Igniter.Code.Common.parse_to_zipper!(updated_string)}
      end
    end)
  end

  defp create_hotwire_guide(igniter, assigns) do
    path = "HOTWIRE.md"

    if File.exists?(template_path("HOTWIRE.md.eex")) do
      content = render_template("HOTWIRE.md.eex", assigns)
      Igniter.create_new_file(igniter, path, content, on_exists: :skip)
    else
      igniter
    end
  end

  # ============================================================================
  # Authentication (--auth)
  # ============================================================================

  defp maybe_add_auth(igniter, false, _assigns), do: igniter

  defp maybe_add_auth(igniter, true, assigns) do
    igniter
    |> add_bcrypt_dependency()
    |> create_accounts_context(assigns)
    |> create_user_schema(assigns)
    |> create_user_token_schema(assigns)
    |> create_scope_module(assigns)
    |> create_user_notifier(assigns)
    |> create_mailer(assigns)
    |> create_email_components(assigns)
    |> create_user_auth(assigns)
    |> create_auth_controllers(assigns)
    |> create_dashboard_controller(assigns)
    |> create_auth_migration(assigns)
    |> create_auth_tests(assigns)
    |> update_router_for_auth(assigns)
    |> add_auth_config(assigns)
    |> copy_small_logo()
  end

  defp add_bcrypt_dependency(igniter) do
    Igniter.Project.Deps.add_dep(igniter, {:bcrypt_elixir, "~> 3.0"})
  end

  defp create_accounts_context(igniter, assigns) do
    path = "#{assigns[:app_path]}/accounts.ex"
    content = render_template("auth/accounts/accounts.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_user_schema(igniter, assigns) do
    path = "#{assigns[:app_path]}/accounts/schemas/user.ex"
    content = render_template("auth/accounts/schemas/user.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_user_token_schema(igniter, assigns) do
    path = "#{assigns[:app_path]}/accounts/schemas/user_token.ex"
    content = render_template("auth/accounts/schemas/user_token.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_scope_module(igniter, assigns) do
    path = "#{assigns[:app_path]}/accounts/schemas/scope.ex"
    content = render_template("auth/accounts/schemas/scope.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_user_notifier(igniter, assigns) do
    path = "#{assigns[:app_path]}/accounts/user_notifier.ex"
    content = render_template("auth/accounts/user_notifier.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_mailer(igniter, assigns) do
    path = "#{assigns[:app_path]}/mailer.ex"
    content = render_template("auth/mailer.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :overwrite)
  end

  defp create_email_components(igniter, assigns) do
    web_path = assigns[:web_path]

    # Create email components module
    path = "#{web_path}/components/email/email_components.ex"
    content = render_template("auth/components/email/email_components.ex.eex", assigns)
    igniter = Igniter.create_new_file(igniter, path, content, on_exists: :skip)

    # Create email_root layout
    layout_path = "#{web_path}/components/email/layouts/email_root.html.heex"
    layout_content = read_template("auth/components/email/layouts/email_root.html.heex")
    Igniter.create_new_file(igniter, layout_path, layout_content, on_exists: :skip)
  end

  defp create_user_auth(igniter, assigns) do
    path = "#{assigns[:web_path]}/user_auth.ex"
    content = render_template("auth/user_auth.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_auth_controllers(igniter, assigns) do
    web_path = assigns[:web_path]

    controllers = [
      {"user_registration", ["new.html.heex", "registration_form.html.heex"]},
      {"user_session", ["new.html.heex", "session_form.html.heex"]},
      {"user_forgot_password", ["new.html.heex", "forgot_password_form.html.heex"]},
      {"user_reset_password", ["edit.html.heex", "reset_password_form.html.heex"]},
      {"user_confirmation", []},
      {"user_settings", ["edit.html.heex", "email_form.html.heex", "password_form.html.heex"]}
    ]

    Enum.reduce(controllers, igniter, fn {controller_name, templates}, acc ->
      controller_path = "#{web_path}/controllers/#{controller_name}/#{controller_name}_controller.ex"
      controller_content = render_template("auth/controllers/#{controller_name}/#{controller_name}_controller.ex.eex", assigns)

      acc = Igniter.create_new_file(acc, controller_path, controller_content, on_exists: :skip)

      # Create HTML module if there are templates
      acc = if templates != [] do
        html_path = "#{web_path}/controllers/#{controller_name}/#{controller_name}_html.ex"
        html_content = render_template("auth/controllers/#{controller_name}/#{controller_name}_html.ex.eex", assigns)
        Igniter.create_new_file(acc, html_path, html_content, on_exists: :skip)
      else
        acc
      end

      # Create templates
      Enum.reduce(templates, acc, fn template, inner_acc ->
        template_path = "#{web_path}/controllers/#{controller_name}/html/#{template}"
        template_file = template_path("auth/controllers/#{controller_name}/html/#{template}")

        if File.exists?(template_file) do
          content = File.read!(template_file)
          Igniter.create_new_file(inner_acc, template_path, content, on_exists: :skip)
        else
          inner_acc
        end
      end)
    end)
  end

  defp create_dashboard_controller(igniter, assigns) do
    web_path = assigns[:web_path]

    controller_content = render_template("auth/controllers/dashboard/dashboard_controller.ex.eex", assigns)
    html_content = render_template("auth/controllers/dashboard/dashboard_html.ex.eex", assigns)
    template_content = File.read!(template_path("auth/controllers/dashboard/html/index.html.heex"))

    igniter
    |> Igniter.create_new_file("#{web_path}/controllers/dashboard/dashboard_controller.ex", controller_content, on_exists: :skip)
    |> Igniter.create_new_file("#{web_path}/controllers/dashboard/dashboard_html.ex", html_content, on_exists: :skip)
    |> Igniter.create_new_file("#{web_path}/controllers/dashboard/html/index.html.heex", template_content, on_exists: :skip)
  end

  defp create_auth_migration(igniter, assigns) do
    timestamp = Calendar.strftime(DateTime.utc_now(), "%Y%m%d%H%M%S")
    path = "priv/repo/migrations/#{timestamp}_create_users_auth_tables.exs"
    content = render_template("auth/migrations/create_users_auth_tables.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_auth_tests(igniter, assigns) do
    app_name = assigns[:app_name]

    # Create fixtures
    fixtures_content = render_template("auth/test/support/fixtures/accounts_fixtures.ex.eex", assigns)
    igniter = Igniter.create_new_file(igniter, "test/support/accounts_fixtures.ex", fixtures_content, on_exists: :skip)

    # Create accounts test
    accounts_test_content = render_template("auth/test/accounts_test.exs.eex", assigns)
    igniter = Igniter.create_new_file(igniter, "test/#{app_name}/accounts_test.exs", accounts_test_content, on_exists: :skip)

    # Create user_auth test
    user_auth_test_content = render_template("auth/test/user_auth_test.exs.eex", assigns)
    Igniter.create_new_file(igniter, "test/#{app_name}_web/user_auth_test.exs", user_auth_test_content, on_exists: :skip)
  end

  defp update_router_for_auth(igniter, assigns) do
    web_module = assigns[:web_module]

    igniter
    |> Igniter.Project.Module.find_and_update_module!(Module.concat([web_module, "Router"]), fn zipper ->
      node_string = zipper |> Sourceror.Zipper.topmost() |> Sourceror.Zipper.node() |> Macro.to_string()

      if String.contains?(node_string, "UserAuth") do
        {:ok, zipper}
      else
        # Add import and plugs
        auth_code = """
        import #{web_module}.UserAuth
        """

        routes_code = """
        # Public auth routes
        scope "/", #{web_module} do
          pipe_through [:browser]

          get "/users/log-in", UserSessionController, :new
          post "/users/log-in", UserSessionController, :create
          delete "/users/log-out", UserSessionController, :destroy
        end

        # Routes for non-authenticated users
        scope "/", #{web_module} do
          pipe_through [:browser, :redirect_if_user_is_authenticated]

          get "/users/register", UserRegistrationController, :new
          post "/users/register", UserRegistrationController, :create
          get "/users/forgot-password", UserForgotPasswordController, :new
          post "/users/forgot-password", UserForgotPasswordController, :create
          get "/users/reset-password/:token", UserResetPasswordController, :edit
          put "/users/reset-password/:token", UserResetPasswordController, :update
          get "/users/confirm/:token", UserConfirmationController, :confirm
        end

        # Routes for authenticated users
        scope "/", #{web_module} do
          pipe_through [:browser, :require_authenticated_user]

          get "/dashboard", DashboardController, :index
          get "/users/settings", UserSettingsController, :edit
          put "/users/settings", UserSettingsController, :update
          get "/users/settings/confirm-email/:token", UserSettingsController, :confirm_email
        end
        """

        # Apply all transformations to the router string
        updated_string =
          node_string
          |> maybe_add_fetch_current_scope()
          |> maybe_add_auth_import(web_module, auth_code)
          |> maybe_add_auth_routes(routes_code)

        {:ok, Igniter.Code.Common.parse_to_zipper!(updated_string)}
      end
    end)
  end

  defp maybe_add_fetch_current_scope(string) do
    if String.contains?(string, "fetch_current_scope_for_user") do
      string
    else
      # Add plug :fetch_current_scope_for_user before the end of the :browser pipeline
      String.replace(
        string,
        ~r/(pipeline :browser do\s*.+?)(\n  end)/s,
        "\\1\n    plug :fetch_current_scope_for_user\\2"
      )
    end
  end

  defp maybe_add_auth_import(string, web_module, auth_code) do
    if String.contains?(string, "import #{web_module}.UserAuth") do
      string
    else
      String.replace(
        string,
        ~r/(use #{web_module}, :router\s*\n)/,
        "\\1\n#{auth_code}\n"
      )
    end
  end

  defp maybe_add_auth_routes(string, routes_code) do
    if String.contains?(string, "UserSessionController") do
      string
    else
      String.replace(string, ~r/(\nend\s*)$/, "\n#{routes_code}\n\\1")
    end
  end

  defp add_auth_config(igniter, assigns) do
    app_name = String.to_atom(assigns[:app_name])

    igniter
    # Production defaults in config.exs
    |> Igniter.Project.Config.configure("config.exs", app_name, [:password_min_length], 8)
    |> Igniter.Project.Config.configure("config.exs", app_name, [:password_validate_complexity], true)
    # Development settings (relaxed)
    |> Igniter.Project.Config.configure("dev.exs", app_name, [:password_min_length], 6)
    |> Igniter.Project.Config.configure("dev.exs", app_name, [:password_validate_complexity], false)
    # Test settings (relaxed)
    |> Igniter.Project.Config.configure("test.exs", app_name, [:password_min_length], 6)
    |> Igniter.Project.Config.configure("test.exs", app_name, [:password_validate_complexity], false)
    # Production settings (strict) - these will override config.exs
    |> Igniter.Project.Config.configure("prod.exs", app_name, [:password_min_length], 8)
    |> Igniter.Project.Config.configure("prod.exs", app_name, [:password_validate_complexity], true)
  end

  defp copy_small_logo(igniter) do
    logo_path = template_path("static/images/logo.png")

    if File.exists?(logo_path) do
      content = File.read!(logo_path)
      Igniter.create_new_file(igniter, "priv/static/images/logo_small.png", content, on_exists: :skip)
    else
      igniter
    end
  end

  # ============================================================================
  # Payments (--payments)
  # ============================================================================

  defp maybe_add_payments(igniter, false, _assigns), do: igniter

  defp maybe_add_payments(igniter, true, assigns) do
    igniter
    |> add_req_dependency()
    |> add_oban_dependency()
    |> create_billing_context(assigns)
    |> create_billing_schemas(assigns)
    |> create_paddle_modules(assigns)
    |> create_billing_worker(assigns)
    |> create_billing_controllers(assigns)
    |> create_billing_plugs(assigns)
    |> create_billing_migration(assigns)
    |> create_oban_migration(assigns)
    |> create_billing_tests(assigns)
    |> create_additional_billing_tests(assigns)
    |> update_user_schema_for_billing(assigns)
    |> update_router_for_payments(assigns)
    |> update_application_for_oban(assigns)
    |> update_endpoint_for_billing(assigns)
    |> add_payments_config(assigns)
    |> add_oban_config(assigns)
  end

  defp add_req_dependency(igniter) do
    Igniter.Project.Deps.add_dep(igniter, {:req, "~> 0.5"})
  end

  defp create_billing_context(igniter, assigns) do
    app_path = assigns[:app_path]

    # Main billing context
    billing_content = render_template("billing/billing.ex.eex", assigns)
    igniter = Igniter.create_new_file(igniter, "#{app_path}/billing.ex", billing_content, on_exists: :skip)

    # Sub-modules
    customers_content = render_template("billing/customers.ex.eex", assigns)
    igniter = Igniter.create_new_file(igniter, "#{app_path}/billing/customers.ex", customers_content, on_exists: :skip)

    subscriptions_content = render_template("billing/subscriptions.ex.eex", assigns)
    igniter = Igniter.create_new_file(igniter, "#{app_path}/billing/subscriptions.ex", subscriptions_content, on_exists: :skip)

    purchases_content = render_template("billing/purchases.ex.eex", assigns)
    igniter = Igniter.create_new_file(igniter, "#{app_path}/billing/purchases.ex", purchases_content, on_exists: :skip)

    credits_content = render_template("billing/credits.ex.eex", assigns)
    igniter = Igniter.create_new_file(igniter, "#{app_path}/billing/credits.ex", credits_content, on_exists: :skip)

    billable_content = render_template("billing/billable.ex.eex", assigns)
    Igniter.create_new_file(igniter, "#{app_path}/billing/billable.ex", billable_content, on_exists: :skip)
  end

  defp create_billing_schemas(igniter, assigns) do
    app_path = assigns[:app_path]

    schemas = [
      "billable_customer",
      "product",
      "subscription",
      "purchase",
      "credit_spend"
    ]

    Enum.reduce(schemas, igniter, fn schema_name, acc ->
      path = "#{app_path}/billing/schemas/#{schema_name}.ex"
      content = render_template("billing/schemas/#{schema_name}.ex.eex", assigns)
      Igniter.create_new_file(acc, path, content, on_exists: :skip)
    end)
  end

  defp create_paddle_modules(igniter, assigns) do
    app_path = assigns[:app_path]

    modules = [
      {"client", "billing/paddle/client.ex.eex"},
      {"signature", "billing/paddle/signature.ex.eex"},
      {"webhook_handler", "billing/paddle/webhook_handler.ex.eex"}
    ]

    Enum.reduce(modules, igniter, fn {name, template}, acc ->
      path = "#{app_path}/billing/paddle/#{name}.ex"
      content = render_template(template, assigns)
      Igniter.create_new_file(acc, path, content, on_exists: :skip)
    end)
  end

  defp create_billing_controllers(igniter, assigns) do
    web_path = assigns[:web_path]

    # Billing controller
    billing_controller = render_template("billing/controllers/billing/billing_controller.ex.eex", assigns)
    igniter = Igniter.create_new_file(igniter, "#{web_path}/controllers/billing/billing_controller.ex", billing_controller, on_exists: :skip)

    billing_html = render_template("billing/controllers/billing/billing_html.ex.eex", assigns)
    igniter = Igniter.create_new_file(igniter, "#{web_path}/controllers/billing/billing_html.ex", billing_html, on_exists: :skip)

    billing_template = read_template("billing/controllers/billing/html/index.html.heex")
    igniter = Igniter.create_new_file(igniter, "#{web_path}/controllers/billing/html/index.html.heex", billing_template, on_exists: :skip)

    # Paddle webhook controller
    webhook_controller = render_template("billing/controllers/paddle_webhook/paddle_webhook_controller.ex.eex", assigns)
    Igniter.create_new_file(igniter, "#{web_path}/controllers/paddle_webhook/paddle_webhook_controller.ex", webhook_controller, on_exists: :skip)
  end

  defp create_billing_plugs(igniter, assigns) do
    web_path = assigns[:web_path]

    plugs = [
      "cache_raw_body",
      "require_subscription",
      "require_purchase",
      "require_credits"
    ]

    Enum.reduce(plugs, igniter, fn plug_name, acc ->
      path = "#{web_path}/plugs/#{plug_name}.ex"
      content = render_template("billing/plugs/#{plug_name}.ex.eex", assigns)
      Igniter.create_new_file(acc, path, content, on_exists: :skip)
    end)
  end

  defp create_billing_migration(igniter, assigns) do
    timestamp = Calendar.strftime(DateTime.utc_now(), "%Y%m%d%H%M%S")
    # Add 1 second to ensure it's after the auth migration
    timestamp = String.to_integer(timestamp) + 1 |> to_string()

    path = "priv/repo/migrations/#{timestamp}_create_billing_tables.exs"
    content = render_template("billing/migrations/create_billing_tables.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_billing_tests(igniter, assigns) do
    app_name = assigns[:app_name]

    # Create fixtures
    fixtures_content = render_template("billing/test/support/fixtures/billing_fixtures.ex.eex", assigns)
    igniter = Igniter.create_new_file(igniter, "test/support/billing_fixtures.ex", fixtures_content, on_exists: :skip)

    # Create billing test
    billing_test_content = render_template("billing/test/billing_test.exs.eex", assigns)
    igniter = Igniter.create_new_file(igniter, "test/#{app_name}/billing_test.exs", billing_test_content, on_exists: :skip)

    # Create credits test
    credits_test_content = render_template("billing/test/credits_test.exs.eex", assigns)
    Igniter.create_new_file(igniter, "test/#{app_name}/credits_test.exs", credits_test_content, on_exists: :skip)
  end

  defp update_user_schema_for_billing(igniter, assigns) do
    app_path = assigns[:app_path]

    # Replace the user schema with billing-aware version
    path = "#{app_path}/accounts/schemas/user.ex"
    content = render_template("billing/accounts/schemas/user_with_billing.ex.eex", assigns)

    igniter
    |> Igniter.include_or_create_file(path, content)
    |> Igniter.update_elixir_file(path, fn _zipper ->
      {:ok, Igniter.Code.Common.parse_to_zipper!(content)}
    end)
  end

  defp update_router_for_payments(igniter, assigns) do
    web_module = assigns[:web_module]

    igniter
    |> Igniter.Project.Module.find_and_update_module!(Module.concat([web_module, "Router"]), fn zipper ->
      node_string = zipper |> Sourceror.Zipper.topmost() |> Sourceror.Zipper.node() |> Macro.to_string()

      if String.contains?(node_string, "BillingController") do
        {:ok, zipper}
      else
        webhook_routes = """
        # Paddle Webhook (no auth, raw body for signature verification)
        scope "/webhooks", #{web_module} do
          pipe_through [:api]

          post "/paddle", PaddleWebhookController, :webhook
        end
        """

        billing_routes = """
        # Billing routes (require auth)
        scope "/billing", #{web_module} do
          pipe_through [:browser, :require_authenticated_user]

          get "/", BillingController, :index
          get "/portal", BillingController, :portal
          get "/checkout/:price_id", BillingController, :checkout
        end
        """

        # Add routes before the final end of the module
        # Match the last `end` in the file which closes the module
        updated_string = String.replace(
          node_string,
          ~r/(\n\s*)end\s*$/,
          "\n\n  #{String.trim(webhook_routes)}\n\n  #{String.trim(billing_routes)}\\1end"
        )

        {:ok, Igniter.Code.Common.parse_to_zipper!(updated_string)}
      end
    end)
  end

  defp add_payments_config(igniter, assigns) do
    app_name = String.to_atom(assigns[:app_name])
    app_module = Module.concat([assigns[:app_module]])
    billing_module = Module.concat([app_module, "Billing"])
    user_module = Module.concat([app_module, "Accounts", "Schemas", "User"])

    igniter
    # Base config
    |> Igniter.Project.Config.configure("config.exs", app_name, [billing_module, :paddle, :environment], :sandbox)
    |> Igniter.Project.Config.configure("config.exs", app_name, [billing_module, :allow_multiple_subscriptions], false)
    # Runtime config (env vars)
    |> Igniter.Project.Config.configure("runtime.exs", app_name, [billing_module, :paddle, :api_key],
      {:code, Sourceror.parse_string!("System.get_env(\"PADDLE_API_KEY\")")})
    |> Igniter.Project.Config.configure("runtime.exs", app_name, [billing_module, :paddle, :webhook_secret],
      {:code, Sourceror.parse_string!("System.get_env(\"PADDLE_WEBHOOK_SECRET\")")})
    |> Igniter.Project.Config.configure("runtime.exs", app_name, [billing_module, :paddle, :client_token],
      {:code, Sourceror.parse_string!("System.get_env(\"PADDLE_CLIENT_TOKEN\")")})
    # Production uses production environment
    |> Igniter.Project.Config.configure("prod.exs", app_name, [billing_module, :paddle, :environment], :production)
    # Billable types configuration
    |> Igniter.Project.Config.configure("config.exs", app_name, [billing_module, :billable_types],
      [{:user, user_module}])
  end

  # ============================================================================
  # Oban Integration for Payments
  # ============================================================================

  defp add_oban_dependency(igniter) do
    Igniter.Project.Deps.add_dep(igniter, {:oban, "~> 2.0"})
  end

  defp create_billing_worker(igniter, assigns) do
    path = "#{assigns[:app_path]}/billing/workers/sync_products.ex"
    content = render_template("billing/workers/sync_products.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_oban_migration(igniter, assigns) do
    timestamp = Calendar.strftime(DateTime.utc_now(), "%Y%m%d%H%M%S")
    # Add 2 seconds to ensure it's after the billing migration
    timestamp = String.to_integer(timestamp) + 2 |> to_string()

    path = "priv/repo/migrations/#{timestamp}_add_oban.exs"
    content = render_template("billing/migrations/add_oban.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_additional_billing_tests(igniter, assigns) do
    app_name = assigns[:app_name]

    # Create billing context tests
    context_tests = [
      {"billing/test/customers_test.exs.eex", "test/#{app_name}/billing/customers_test.exs"},
      {"billing/test/subscriptions_test.exs.eex", "test/#{app_name}/billing/subscriptions_test.exs"},
      {"billing/test/purchases_test.exs.eex", "test/#{app_name}/billing/purchases_test.exs"}
    ]

    # Create paddle tests
    paddle_tests = [
      {"billing/test/paddle/signature_test.exs.eex", "test/#{app_name}/billing/paddle/signature_test.exs"},
      {"billing/test/paddle/webhook_handler_test.exs.eex", "test/#{app_name}/billing/paddle/webhook_handler_test.exs"}
    ]

    # Create controller tests (placed directly in _web folder, not in controllers/ subdirectory)
    controller_tests = [
      {"billing/test/controllers/billing_controller_test.exs.eex", "test/#{app_name}_web/billing_controller_test.exs"},
      {"billing/test/controllers/paddle_webhook_controller_test.exs.eex", "test/#{app_name}_web/paddle_webhook_controller_test.exs"}
    ]

    igniter
    |> create_test_files_from_templates(context_tests, assigns)
    |> create_test_files_from_templates(paddle_tests, assigns)
    |> create_test_files_from_templates(controller_tests, assigns)
  end

  defp create_test_files_from_templates(igniter, tests, assigns) do
    Enum.reduce(tests, igniter, fn {template_name, output_path}, acc ->
      content = render_template(template_name, assigns)
      Igniter.create_new_file(acc, output_path, content, on_exists: :skip)
    end)
  end

  defp update_application_for_oban(igniter, assigns) do
    app_module = Module.concat([assigns[:app_module], "Application"])
    app_name = assigns[:app_name]

    oban_child = "{Oban, Application.fetch_env!(:#{app_name}, Oban)}"

    igniter
    |> Igniter.Project.Module.find_and_update_module!(app_module, fn zipper ->
      node_string = zipper |> Sourceror.Zipper.topmost() |> Sourceror.Zipper.node() |> Macro.to_string()

      if String.contains?(node_string, "Oban") do
        {:ok, zipper}
      else
        # Add Oban to children list after the Repo
        updated_string = String.replace(
          node_string,
          ~r/(#{assigns[:app_module]}\.Repo,)/,
          "\\1\n      #{oban_child},"
        )
        {:ok, Igniter.Code.Common.parse_to_zipper!(updated_string)}
      end
    end)
  end

  defp update_endpoint_for_billing(igniter, assigns) do
    web_module = assigns[:web_module]
    endpoint_module = Module.concat([web_module, "Endpoint"])

    igniter
    |> Igniter.Project.Module.find_and_update_module!(endpoint_module, fn zipper ->
      node_string = zipper |> Sourceror.Zipper.topmost() |> Sourceror.Zipper.node() |> Macro.to_string()

      if String.contains?(node_string, "CacheRawBody") do
        {:ok, zipper}
      else
        # Update Plug.Parsers to include body_reader
        # Handle multiple formats:
        # - plug Plug.Parsers, (no parens)
        # - plug(Plug.Parsers, (with parens)
        # The pattern captures everything up to and including pass: ["*/*"],
        # and inserts body_reader after it
        updated_string = String.replace(
          node_string,
          ~r/(plug\s*\(?\s*Plug\.Parsers,\s*parsers:\s*\[:urlencoded,\s*:multipart,\s*:json\],\s*pass:\s*\["\*\/\*"\],)/s,
          "\\1\n    body_reader: {#{web_module}.Plugs.CacheRawBody, :read_body, []},"
        )

        # If the first pattern didn't match, try an alternative pattern that looks for
        # the json_decoder line and inserts body_reader before it
        updated_string =
          if updated_string == node_string do
            String.replace(
              node_string,
              ~r/(plug\s*\(?\s*Plug\.Parsers,\s*[^)]*?pass:\s*\["\*\/\*"\],?\s*\n)(\s*json_decoder:)/s,
              "\\1    body_reader: {#{web_module}.Plugs.CacheRawBody, :read_body, []},\n\\2"
            )
          else
            updated_string
          end

        # If still no match, try a more general pattern
        updated_string =
          if updated_string == node_string do
            # Match any Plug.Parsers with pass option, insert body_reader before json_decoder
            String.replace(
              node_string,
              ~r/(plug\(?\s*Plug\.Parsers,)([^)]*?)(json_decoder:)/s,
              fn _, plug_start, middle, json_decoder ->
                if String.contains?(middle, "body_reader") do
                  # Already has body_reader, don't modify
                  "#{plug_start}#{middle}#{json_decoder}"
                else
                  # Add body_reader before json_decoder
                  "#{plug_start}#{String.trim_trailing(middle)}\n    body_reader: {#{web_module}.Plugs.CacheRawBody, :read_body, []},\n    #{json_decoder}"
                end
              end
            )
          else
            updated_string
          end

        {:ok, Igniter.Code.Common.parse_to_zipper!(updated_string)}
      end
    end)
  end

  defp add_oban_config(igniter, assigns) do
    app_name = String.to_atom(assigns[:app_name])
    repo_module = Module.concat([assigns[:app_module], "Repo"])

    igniter
    # config.exs - Oban base config
    |> Igniter.Project.Config.configure("config.exs", app_name, [Oban, :engine],
        {:code, Sourceror.parse_string!("Oban.Engines.Lite")})
    |> Igniter.Project.Config.configure("config.exs", app_name, [Oban, :notifier],
        {:code, Sourceror.parse_string!("Oban.Notifiers.PG")})
    |> Igniter.Project.Config.configure("config.exs", app_name, [Oban, :queues],
        [default: 10])
    |> Igniter.Project.Config.configure("config.exs", app_name, [Oban, :repo],
        {:code, Sourceror.parse_string!("#{repo_module}")})
    # test.exs - Oban testing mode
    |> Igniter.Project.Config.configure("test.exs", app_name, [Oban, :testing], :manual)
  end
end
