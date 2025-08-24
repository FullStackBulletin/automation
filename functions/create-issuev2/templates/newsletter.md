Hello, {% raw %}{{ subscriber.metadata.first_name }}{% endraw %}

TODO: WRITE INTRO

Happy reading and coding!{% raw %}  {% endraw %}
— [Luciano](https://loige.co)

---

> "{{ quote.text }}"{% raw %}  {% endraw %}
> — [{{ quote.author }}]({{ quote.authorUrl }}), {{ quote.authorDescription }}

---

{%- if sponsor.banner_html %}
{{ sponsor.banner_html | safe }}
{%- endif %}


<a href="{{ primary_link.campaignUrls.image }}" target="_blank" rel="noopener noreferrer"><img src="{{ primary_link.image }}" draggable="false" alt="A screenshot from the article {{ primary_link.title }}"></a>

[**{{ primary_link.title }}**]({{ primary_link.campaignUrls.title }}) — {{ primary_link.description }} [**{{ primary_link.action_text }}**]({{ primary_link.campaignUrls.description }})

{% for link in secondary_links -%}
[**{{ link.title }}**]({{ link.campaignUrls.title }}) — {{ link.description }} [**{{ link.action_text }}**]({{ link.campaignUrls.description }})

{% endfor -%}

---

# 📕 Book of the week!

[**{{ book.title }}**, by {{ book.author }}]({{ book.links.us }})

[![{{ book.title }}]({{ book.coverPicture }})]({{ book.links.us }})

{{ book.description }}

[**Buy on Amazon.com**]({{ book.links.us }}) - [**Buy on Amazon.co.uk**]({{ book.links.uk }})

---

{% if extra_links -%}
### {{ extra_content_title }}

{% for link in extra_links -%}
- [{{ link.title }}]({{ link.campaignUrls.title }})
{% endfor -%}

---

{% endif -%}

{% if sponsor.sponsored_article_html -%}

---

{{ sponsor.sponsored_article_html | safe }}

---

{% endif -%}

## That's all folks!  

Thank you for getting to the end of this issue!  
If you enjoyed it or simply want to suggest something, hit reply and let us know! We'd love to hear from you! ❤️

{% raw %}{{ subscribe_form }}{% endraw %}
