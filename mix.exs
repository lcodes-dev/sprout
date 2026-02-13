defmodule Sprout.MixProject do
  use Mix.Project

  @version "0.1.0"
  @source_url "https://github.com/yourusername/sprout"

  def project do
    [
      app: :sprout,
      version: @version,
      elixir: "~> 1.15",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      package: package(),
      docs: docs(),
      description: """
      Phoenix starter kit installer with Hotwire Turbo, Alpine.js, and BasecoatUI.
      Transforms a fresh Phoenix project into a production-ready deadview-first application.
      """
    ]
  end

  def application do
    [
      extra_applications: [:logger]
    ]
  end

  defp deps do
    [
      {:igniter, "~> 0.7", optional: true},
      {:ex_doc, "~> 0.31", only: :dev, runtime: false}
    ]
  end

  defp package do
    [
      name: "sprout",
      licenses: ["MIT"],
      links: %{"GitHub" => @source_url},
      files: ~w(lib priv .formatter.exs mix.exs README.md LICENSE)
    ]
  end

  defp docs do
    [
      main: "readme",
      source_url: @source_url,
      extras: ["README.md"]
    ]
  end
end
