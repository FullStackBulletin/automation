{{ greeting }}, {% raw %}{{ subscriber.metadata.first_name }}{% endraw %}

TODO: WRITE INTRO

{{ intro_closing }}{% raw %}  {% endraw %}
— [Luciano](https://loige.co)

---

> "{{ quote.text }}"{% raw %}  {% endraw %}
> — {%- if quote.authorUrl %}[{{ quote.author }}]({{ quote.authorUrl }}){%- else -%}{{ quote.author }}{%- endif -%}, {{ quote.authorDescription }}

---

{%- if sponsor.banner_html %}
{{ sponsor.banner_html | safe }}
{%- endif %}


<a href="{{ primary_link.campaignUrls.image }}" target="_blank" rel="noopener noreferrer"><img src="{{ primary_link.image }}" draggable="false" alt="A screenshot from the article {{ primary_link.title | sanitize_js }}"></a>

[**{{ primary_link.title | sanitize_js }}**]({{ primary_link.campaignUrls.title }}) — {{ primary_link.description | sanitize_js }} [**{{ primary_link.action_text }}**]({{ primary_link.campaignUrls.description }})

{% for link in secondary_links -%}
[**{{ link.title | sanitize_js }}**]({{ link.campaignUrls.title }}) — {{ link.description | sanitize_js }} [**{{ link.action_text }}**]({{ link.campaignUrls.description }})

{% endfor -%}

---

# 📕 Book of the week!

[**{{ book.title | sanitize_js }}**, by {{ book.author }}]({{ book.links.us }})

[![{{ book.title | sanitize_js }}]({{ book.coverPicture }})]({{ book.links.us }})

{{ book.description | sanitize_js }}

[**Buy on Amazon.com**]({{ book.links.us }}) - [**Buy on Amazon.co.uk**]({{ book.links.uk }})

---

{% if extra_links -%}
### {{ extra_content_title }}

{% for link in extra_links -%}
- [{{ link.title | sanitize_js }}]({{ link.campaignUrls.title }})
{% endfor -%}

---

{% endif -%}

{% if sponsor.sponsored_article_html -%}

---

{{ sponsor.sponsored_article_html | safe }}

---

{% endif -%}

## {{ closing_title }}

{{ closing_message }}
