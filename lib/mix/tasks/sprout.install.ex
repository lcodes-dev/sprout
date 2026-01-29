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
        auth: :boolean
      ],
      defaults: [
        examples: false,
        auth: true
      ],
      aliases: [
        e: :examples
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

    # Get app name from Mix project config (most reliable source)
    app_name = Mix.Project.config()[:app] |> to_string()
    app_module = app_name |> Macro.camelize() |> then(&Module.concat([&1]))
    web_module = Module.concat([app_module, Web])
    web_path = "lib/#{app_name}_web"
    app_path = "lib/#{app_name}"

    assigns = [
      web_module: web_module,
      app_module: app_module,
      app_name: app_name,
      web_path: web_path,
      app_path: app_path
    ]

    igniter
    |> Igniter.add_notice("""
    Sprout Installation
    ===================

    Installing Hotwire Turbo, Alpine.js, and BasecoatUI...
    #{if include_auth?, do: "Including user authentication...", else: ""}
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
    |> add_final_notice(include_examples?, include_auth?)
  end

  defp add_final_notice(igniter, include_examples?, include_auth?) do
    Igniter.add_notice(igniter, """

    ✅ Sprout installed successfully!

    Next steps:
    1. Run `cd assets && npm install` to install JavaScript dependencies
    #{if include_auth?, do: "2. Run `mix ecto.migrate` to create database tables", else: ""}
    #{if include_auth?, do: "3. Restart your Phoenix server", else: "2. Restart your Phoenix server"}
    #{if include_examples?, do: "#{if include_auth?, do: "4", else: "3"}. Visit /turbo-example to see Turbo in action", else: ""}

    Documentation: https://github.com/yourusername/sprout
    """)
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
    web_module = assigns[:web_module]

    igniter
    |> Igniter.Project.Module.find_and_update_module!(web_module, fn zipper ->
      zipper = add_import_to_controller(zipper, web_module)
      zipper = add_import_to_html(zipper, web_module)
      {:ok, zipper}
    end)
  end

  defp add_import_to_controller(zipper, web_module) do
    import_code = "import #{inspect(web_module)}.Turbo"

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
    import_code = "import #{inspect(web_module)}.Turbo, only: [turbo_frame: 1, turbo_stream: 1]"

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
    endpoint_module = Module.concat(web_module, Endpoint)

    socket_code = """
    socket "/turbo-socket", #{inspect(web_module)}.Channels.TurboSocket,
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

    Igniter.create_or_update_file(igniter, path, content, fn _source ->
      {:ok, Igniter.Code.Common.parse_to_zipper!(content)}
    end)
  end

  defp create_layouts(igniter, assigns) do
    path = "#{assigns[:web_path]}/components/layouts.ex"
    content = render_template("layouts.ex.eex", assigns)

    Igniter.create_or_update_file(igniter, path, content, fn _source ->
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
    |> Igniter.Project.Module.find_and_update_module!(Module.concat(web_module, Router), fn zipper ->
      node_string = zipper |> Sourceror.Zipper.topmost() |> Sourceror.Zipper.node() |> Macro.to_string()

      cond do
        String.contains?(node_string, "Home.HomeController") ->
          {:ok, zipper}

        String.contains?(node_string, "PageController, :home") ->
          updated_string = String.replace(node_string, "PageController, :home", "Home.HomeController, :index")
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
    scope "/turbo-example", #{inspect(web_module)}.TurboExample do
      pipe_through :browser

      get "/", TurboExampleController, :index
      get "/drive-demo", TurboExampleController, :drive_demo
      get "/frame-content", TurboExampleController, :frame_content
      post "/increment", TurboExampleController, :increment_counter
      post "/messages", TurboExampleController, :create_message
      delete "/messages/:id", TurboExampleController, :delete_message
      delete "/clear", TurboExampleController, :clear_messages
      post "/broadcast", TurboExampleController, :broadcast_message
      post "/server-event", TurboExampleController, :simulate_server_event
    end
    """

    Igniter.Libs.Phoenix.add_scope(
      igniter,
      "/turbo-example",
      route_content,
      arg2: Module.concat(web_module, TurboExample)
    )
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
    path = "#{assigns[:app_path]}/accounts/user.ex"
    content = render_template("auth/accounts/user.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_user_token_schema(igniter, assigns) do
    path = "#{assigns[:app_path]}/accounts/user_token.ex"
    content = render_template("auth/accounts/user_token.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_scope_module(igniter, assigns) do
    path = "#{assigns[:app_path]}/accounts/scope.ex"
    content = render_template("auth/accounts/scope.ex.eex", assigns)
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
    path = "#{assigns[:web_path]}/components/email/email_components.ex"
    content = render_template("auth/components/email/email_components.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_user_auth(igniter, assigns) do
    path = "#{assigns[:web_path]}/user_auth.ex"
    content = render_template("auth/user_auth.ex.eex", assigns)
    Igniter.create_new_file(igniter, path, content, on_exists: :skip)
  end

  defp create_auth_controllers(igniter, assigns) do
    web_path = assigns[:web_path]

    controllers = [
      {"user_registration", ["new.html.heex"]},
      {"user_session", ["new.html.heex"]},
      {"user_forgot_password", ["index.html.heex"]},
      {"user_reset_password", ["show.html.heex"]},
      {"user_confirmation", []},
      {"user_settings", ["edit.html.heex"]}
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
    igniter = Igniter.create_new_file(igniter, "test/support/fixtures/accounts_fixtures.ex", fixtures_content, on_exists: :skip)

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
    |> Igniter.Project.Module.find_and_update_module!(Module.concat(web_module, Router), fn zipper ->
      node_string = zipper |> Sourceror.Zipper.topmost() |> Sourceror.Zipper.node() |> Macro.to_string()

      if String.contains?(node_string, "UserAuth") do
        {:ok, zipper}
      else
        # Add import and plugs
        auth_code = """
        import #{inspect(web_module)}.UserAuth

        pipeline :require_authenticated_user do
          plug :require_authenticated_user
        end

        pipeline :redirect_if_authenticated do
          plug :redirect_if_user_is_authenticated
        end
        """

        routes_code = """
        # Public auth routes
        scope "/", #{inspect(web_module)} do
          pipe_through [:browser]

          get "/users/log-in", UserSession.UserSessionController, :new
          post "/users/log-in", UserSession.UserSessionController, :create
          delete "/users/log-out", UserSession.UserSessionController, :delete
        end

        # Routes for non-authenticated users
        scope "/", #{inspect(web_module)} do
          pipe_through [:browser, :redirect_if_authenticated]

          get "/users/register", UserRegistration.UserRegistrationController, :new
          post "/users/register", UserRegistration.UserRegistrationController, :create
          get "/users/forgot-password", UserForgotPassword.UserForgotPasswordController, :index
          post "/users/forgot-password", UserForgotPassword.UserForgotPasswordController, :create
          get "/users/reset-password/:token", UserResetPassword.UserResetPasswordController, :show
          put "/users/reset-password/:token", UserResetPassword.UserResetPasswordController, :update
          get "/users/confirm/:token", UserConfirmation.UserConfirmationController, :confirm
        end

        # Routes for authenticated users
        scope "/", #{inspect(web_module)} do
          pipe_through [:browser, :require_authenticated_user]

          get "/dashboard", Dashboard.DashboardController, :index
          get "/users/settings", UserSettings.UserSettingsController, :edit
          put "/users/settings", UserSettings.UserSettingsController, :update
          get "/users/settings/confirm-email/:token", UserSettings.UserSettingsController, :confirm_email
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
      String.replace(
        string,
        ~r/(pipeline :browser do\s*plug :accepts.*?\n)/,
        "\\1    plug :fetch_current_scope_for_user\n"
      )
    end
  end

  defp maybe_add_auth_import(string, web_module, auth_code) do
    if String.contains?(string, "import #{inspect(web_module)}.UserAuth") do
      string
    else
      String.replace(
        string,
        ~r/(use #{inspect(web_module)}, :router\s*\n)/,
        "\\1\n#{auth_code}\n"
      )
    end
  end

  defp maybe_add_auth_routes(string, routes_code) do
    if String.contains?(string, "UserSession.UserSessionController") do
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
end
