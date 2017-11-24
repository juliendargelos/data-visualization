ROOT = Pathname.new __dir__
SOURCE = ROOT + 'source'
TEMPLATES = SOURCE + 'templates'
IMAGES = SOURCE + 'images'

# Activate and configure extensions
# https://middlemanapp.com/advanced/configuration/#configuring-extensions

activate :autoprefixer do |prefix|
  prefix.browsers = "last 2 versions"
end

activate :directory_indexes
activate :sprockets
activate :relative_assets

activate :deploy do |deploy|
  deploy.deploy_method = :git
  deploy.branch = :master
end

# Layouts
# https://middlemanapp.com/basics/layouts/

# Per-page layout changes
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

ignore '/templates/*.{svg}'

# With alternative layout
# page '/path/to/file.html', layout: 'other_layout'

# Proxy pages
# https://middlemanapp.com/advanced/dynamic-pages/

# proxy(
#   '/this-page-has-no-template.html',
#   '/template-file.html',
#   locals: {
#     which_fake_page: 'Rendering a fake page with a local variable'
#   },
# )

# Helpers
# Methods defined in the helpers block are available in templates
# https://middlemanapp.com/basics/helper-methods/

helpers do
  def svg *parts
    File.read IMAGES + (parts.join('/').sub(/\.svg\z/, '') + '.svg')
  end

  def template *parts, name: nil
    path = ([:templates] + parts).join '/'
    name = parts.join '-' if name.nil?

    content_tag :script, partial(path).html_safe, name: name, type: 'text/template'
  end

  def templates
    Dir[TEMPLATES + '**' + '*'].map do |t|
      template File.basename(t).sub(/\A_/, '').gsub(/(?:\.[^\.]+)+\z/, '')
    end.join.html_safe
  end

  def embed_data *parts, name: nil
    name = parts.join '-' if name.nil?

    content = data[parts.first]
    content = content.dig *(parts[1..-1]) if parts.length > 1

    content_tag :script, content.to_json.html_safe, name: name, type: 'text/json'
  end

  def character_part name, direction = nil, modifiers = nil

    if direction.is_a? Array
      modifiers = direction
      direction = nil
    end

    if modifiers.present?
      @character_part ||= {}
      @character_part["#{name}--#{direction}"] = modifiers.length

      direction = ([direction].flatten - [nil]).map do |modifier|
        "character__#{name}--#{direction}"
      end.join ' '

      modifiers.map do |modifier|
        <<-HTML.html_safe
          <g class="character__#{name} character__#{name}--#{modifier} #{direction}">
        HTML
      end.join.html_safe

    else
      '</g>'*@character_part["#{name}--#{direction}"]
    end

  end
end

# Build-specific configuration
# https://middlemanapp.com/advanced/configuration/#environment-specific-settings

configure :build do
  activate :minify_css
  # activate :minify_javascript
end
