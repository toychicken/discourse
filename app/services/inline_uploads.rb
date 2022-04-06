# frozen_string_literal: true

class InlineUploads
  PLACEHOLDER = "__replace__"
  PATH_PLACEHOLDER = "__replace_path__"

  UPLOAD_REGEXP_PATTERN = "/original/(\\dX/(?:\\h/)*\\h{40}[a-zA-Z0-9.]*)(\\?v=\\d+)?"
  private_constant :UPLOAD_REGEXP_PATTERN

  HASH_REGEXP_PATTERN = "/original/(?:\\dX/(?:\\h/)*(\\h{40})[a-zA-Z0-9.]*)(\\?v=\\d+)?"
  private_constant :HASH_REGEXP_PATTERN

  def self.process(markdown, on_missing: nil)
    markdown = markdown.dup

    match_md_reference(markdown) do |match, src, replacement, index|
      if upload = Upload.get_from_url(src)
        markdown = markdown.sub(match, replacement.sub!(PATH_PLACEHOLDER, "__#{upload.sha1}__"))
      end
    end

    cooked_fragment = Nokogiri::HTML5::fragment(PrettyText.cook(markdown, disable_emojis: true))
    link_occurrences = []

    cooked_fragment.traverse do |node|
      if node.name == "img"
        # Do nothing
      elsif !(node.children.count == 1 && (node.children[0].name != "img" && node.children[0].children.blank?)) &&
        !(node.name == "a" && node.children.count > 1 && !node_children_names(node).include?("img"))
        next
      end

      if seen_link = matched_uploads(node).first
        if (actual_link = (node.attributes["href"]&.value || node.attributes["src"]&.value))
          link_occurrences << { link: actual_link, is_valid: true }
        elsif node.name != "p"
          link_occurrences << { link: seen_link, is_valid: false }
        end
      end
    end

    raw_matches = []

    match_bbcode_img(markdown) do |match, src, replacement, index|
      raw_matches << [match, src, replacement, index]
    end

    match_md_inline_img(markdown) do |match, src, replacement, index|
      raw_matches << [match, src, replacement, index]
    end

    match_img(markdown) do |match, src, replacement, index|
      raw_matches << [match, src, replacement, index]
    end

    match_anchor(markdown) do |match, href, replacement, index|
      raw_matches << [match, href, replacement, index]
    end

    regexps = [
      /(https?:\/\/[a-zA-Z0-9\.\/-]+\/#{Discourse.store.upload_path}#{UPLOAD_REGEXP_PATTERN})/,
    ]

    if Discourse.store.external?
      regexps << /((?:https?:)?#{SiteSetting.Upload.s3_base_url}#{UPLOAD_REGEXP_PATTERN})/
      regexps << /(#{SiteSetting.Upload.s3_cdn_url}#{UPLOAD_REGEXP_PATTERN})/
    end

    regexps.each do |regexp|
      indexes = Set.new

      markdown.scan(/(\n{2,}|\A)#{regexp}$/) do |match|
        if match[1].present? && match[2].present?
          extension = match[2].split(".")[-1].downcase
          index = $~.offset(2)[0]
          indexes << index
          if FileHelper.supported_images.include?(extension)
            raw_matches << [match[1], match[1], +"![](#{PLACEHOLDER})", index]
          else
            raw_matches << [match[1], match[1], +"#{Discourse.base_url}#{PATH_PLACEHOLDER}", index]
          end
        end
      end

      markdown.scan(/^#{regexp}(\s)/) do |match|
        if match[0].present?
          index = $~.offset(0)[0]
          next if !indexes.add?(index)
          raw_matches << [match[0], match[0], +"#{Discourse.base_url}#{PATH_PLACEHOLDER}", index]
        end
      end

      markdown.scan(/\[[^\[\]]*\]: #{regexp}/) do |match|
        indexes.add($~.offset(1)[0]) if match[0].present?
      end

      markdown.scan(/(([\n\s\)\]\<])+)#{regexp}/) do |match|
        if matched_uploads(match[2]).present?
          next if !indexes.add?($~.offset(3)[0])
          index = $~.offset(0)[0]
          raw_matches << [match[2], match[2], +"#{Discourse.base_url}#{PATH_PLACEHOLDER}", index]
        end
      end
    end

    raw_matches
      .sort { |a, b| a[3] <=> b[3] }
      .each do |match, link, replace_with, _index|

      node_info = link_occurrences.shift
      next unless node_info&.dig(:is_valid)

      if link.include?(node_info[:link])
        begin
          uri = URI(link)
        rescue URI::Error
        end

        if !Discourse.store.external?
          host = uri&.host

          hosts = [Discourse.current_hostname]

          if cdn_url = GlobalSetting.cdn_url
            hosts << URI(GlobalSetting.cdn_url).hostname
          end

          if host && !hosts.include?(host)
            next
          end
        end

        upload = Upload.get_from_url(link)

        if upload
          replace_with.sub!(PLACEHOLDER, upload.short_url)
          replace_with.sub!(PATH_PLACEHOLDER, upload.short_path)
          markdown.sub!(match, replace_with)
        else
          on_missing.call(link) if on_missing
        end
      end
    end

    markdown.scan(/(__(\h{40})__)/) do |match|
      upload = Upload.find_by(sha1: match[1])
      markdown = markdown.sub(match[0], upload.short_path)
    end

    markdown
  end

  def self.match_md_inline_img(markdown, external_src: false)
    markdown.scan(/(!?\[([^\[\]]*)\]\(([^\s\)]+)([ ]*['"]{1}[^\)]*['"]{1}[ ]*)?\))/) do |match|
      if (external_src || matched_uploads(match[2]).present?) && block_given?
        yield(
          match[0],
          match[2],
          +"#{match[0].start_with?("!") ? "!" : ""}[#{match[1]}](#{PLACEHOLDER}#{match[3]})",
          $~.offset(0)[0]
        )
      end
    end
  end

  def self.match_bbcode_img(markdown, external_src: false)
    markdown.scan(/(\[img\]\s*([^\[\]\s]+)\s*\[\/img\])/i) do |match|
      if (external_src || (matched_uploads(match[1]).present?)) && block_given?
        yield(match[0], match[1], +"![](#{PLACEHOLDER})", $~.offset(0)[0])
      end
    end
  end

  def self.match_md_reference(markdown)
    markdown.scan(/(\[([^\]]+)\]:([ ]+)(\S+))/) do |match|
      if match[3] && matched_uploads(match[3]).present? && block_given?
        yield(
          match[0],
          match[3],
          +"[#{match[1]}]:#{match[2]}#{Discourse.base_url}#{PATH_PLACEHOLDER}",
          $~.offset(0)[0]
        )
      end
    end
  end

  def self.match_anchor(markdown, external_href: false)
    markdown.scan(/((<a[^<]+>)([^<\a>]*?)<\/a>)/i) do |match|
      node = Nokogiri::HTML5::fragment(match[0]).children[0]
      href =  node.attributes["href"]&.value

      if href && (external_href || matched_uploads(href).present?)
        has_attachment = node.attributes["class"]&.value
        index = $~.offset(0)[0]
        text = match[2].strip.gsub("\n", "").gsub(/ +/, " ")
        text = "#{text}|attachment" if has_attachment

        yield(match[0], href, +"[#{text}](#{PLACEHOLDER})", index) if block_given?
      end
    end
  end

  def self.match_img(markdown, external_src: false, uploads: nil)
    markdown.scan(/(<(?!img)[^<>]+\/?>)?(\s*)(<img [^>\n]+>)/i) do |match|
      node = Nokogiri::HTML5::fragment(match[2].strip).children[0]
      src = node&.attributes&.[]("src")&.value

      if src && (external_src || matched_uploads(src).present?)
        upload = uploads&.[](src)
        node["src"] = upload&.short_url || PLACEHOLDER

        spaces_before = match[1].present? ? match[1][/ +$/].size : 0
        replacement = +"#{" " * spaces_before}#{node.to_s}"

        yield(match[2], src, replacement, $~.offset(0)[0]) if block_given?
      end
    end
  end

  def self.url_regexps
    upload_path = Discourse.store.upload_path
    base_url = Discourse.base_url.sub(/https?:\/\//, "(https?://)")

    regexps = [
      /(upload:\/\/([a-zA-Z0-9]+)[a-zA-Z0-9\.]*)/,
      /(\/uploads\/short-url\/([a-zA-Z0-9]+)[a-zA-Z0-9\.]*)/,
      /(#{base_url}\/uploads\/short-url\/([a-zA-Z0-9]+)[a-zA-Z0-9\.]*)/,
      /(#{GlobalSetting.relative_url_root}\/#{upload_path}#{HASH_REGEXP_PATTERN})/,
      /(#{base_url}\/#{upload_path}#{HASH_REGEXP_PATTERN})/,
    ]

    if GlobalSetting.cdn_url && (cdn_url = GlobalSetting.cdn_url.sub(/https?:\/\//, "(https?://)"))
      regexps << /(#{cdn_url}\/#{upload_path}#{HASH_REGEXP_PATTERN})/
      if GlobalSetting.relative_url_root.present?
        regexps << /(#{cdn_url}#{GlobalSetting.relative_url_root}\/#{upload_path}#{HASH_REGEXP_PATTERN})/
      end
    end

    if Discourse.store.external?
      if Rails.configuration.multisite
        regexps << /((https?:)?#{SiteSetting.Upload.s3_base_url}\/#{upload_path}#{HASH_REGEXP_PATTERN})/
        regexps << /(#{SiteSetting.Upload.s3_cdn_url}\/#{upload_path}#{HASH_REGEXP_PATTERN})/
      else
        regexps << /((https?:)?#{SiteSetting.Upload.s3_base_url}#{HASH_REGEXP_PATTERN})/
        regexps << /(#{SiteSetting.Upload.s3_cdn_url}#{HASH_REGEXP_PATTERN})/
      end
    end

    regexps
  end

  def self.matched_uploads(node)
    matches = []
    node = node.to_s

    url_regexps.each do |regexp|
      node.scan(/(^|[\n\s"'\(>])#{regexp}($|[\n\s"'\)<])/) do |matched|
        matches << matched[1]
      end
    end

    matches
  end
  private_class_method :matched_uploads

  def self.node_children_names(node, names = Set.new)
    if node.children.blank?
      names << node.name
      return names
    end

    node.children.each do |child|
      names = node_children_names(child, names)
    end

    names
  end
  private_class_method :node_children_names
end
