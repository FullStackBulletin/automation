Hello, {{"{{"}} subscriber.metadata.first_name {{"}}"}}  

TODO: WRITE INTRO

Happy reading and coding!    
— [Luciano](https://loige.co)

---

> "{{ quote.text }}"  
> — [{{ quote.author }}]({{ quote.author_url }}), {{ quote.author_description }}

---

<a href="{{ primary_link.campaign_urls.image }}" target="_blank" rel="noopener noreferrer"><img src="{{ primary_link.image }}" draggable="false" alt="A screenshot from the article {{ primary_link.title }}"></a>

[**{{ primary_link.title }}**]({{ primary_link.campaign_urls.title }}) — {{ primary_link.description }} [**Read article**]({{ primary_link.campaign_urls.description }})

{% for link in secondary_links -%}
[**{{ link.title }}**]({{ link.campaign_urls.title }}) — {{ link.description }} [**Read article**]({{ link.campaign_urls.description }})

{% endfor -%}

---

# 📕 Book of the week!

[**{{ book.title }}**, by {{ book.author }}]({{ book.links.us }})

[![{{ book.title }}]({{ book.cover_picture }})]({{ book.links.us }})

{{ book.description }}

[**Buy on Amazon.com**]({{ book.links.us }}) - [**Buy on Amazon.co.uk**]({{ book.links.uk }})

---

{% if extra_links -%}
### {{ extra_content_title }}

{% for link in extra_links -%}
- [{{ link.title }}]({{ link.campaign_urls.title }})
{% endfor -%}

---

{% endif -%}

{% if sponsor -%}
{{ sponsor.banner_html | safe }}

{{ sponsor.sponsored_article_html | safe }}

---

{% endif -%}

## That's all folks!  

Thank you for getting to the end of this issue!  
If you enjoyed it or simply want to suggest something, hit reply and let us know! We'd love to hear from you! ❤️

{{"{{"}} subscribe_form {{"}}"}}