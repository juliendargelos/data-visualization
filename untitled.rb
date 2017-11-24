Dir["/Users/Julien/Developer/Web/microclimex/source/templates/*.html.erb"].each do |file|
  basename = File.basename file

  if basename != '_character.html.erb'
    content = File.read file
    content.scan(/\.(cls-[0-9]+)\{fill:#([0-9a-f]{3}|[0-9a-f]{6});\}/).each do |(class_name, color)|
      content.gsub! /class="#{class_name}"/, "fill=\"##{color}\""
    end

    File.write file, content
  end
end
