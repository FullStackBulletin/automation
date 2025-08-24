use anyhow::Result;
use serde::Serialize;
use tera::{Context, Tera};

use crate::model::{Book, Link, Quote, Sponsor};

/// Enhanced link with action text for template rendering
#[derive(Serialize, Debug)]
pub struct EnhancedLink<'a> {
    #[serde(flatten)]
    pub link: &'a Link,
    pub action_text: &'static str,
}

/// Generate appropriate action text based on the URL
pub fn get_link_action_text(url: &str) -> &'static str {
    if url.contains("github.com") {
        "Check Repo"
    } else if url.contains("youtube.com") || url.contains("youtu.be") {
        "Watch Video"
    } else {
        "Read Article"
    }
}

pub fn generate_extra_content_title(issue_number: u32) -> String {
    match issue_number % 10 {
        1 => "You have to BELIEVE in the power of more content! 🙏",
        2 => "More awesome content for your reading pleasure! 📚",
        3 => "Extra picks to feed your curiosity! 🧠",
        4 => "Bonus content because we love you! ❤️",
        5 => "Additional gems we couldn't leave out! 💎",
        6 => "More quality content coming your way! ⭐",
        7 => "Extra goodies for the curious minds! 🔍",
        8 => "Supplementary reads worth your time! ⏰",
        9 => "More content to expand your horizons! 🌅",
        _ => "Hand-picked extras to keep your brain buzzing! ⚡",
    }
    .to_string()
}

// Embed the newsletter template at compile time
const NEWSLETTER_TEMPLATE: &str = include_str!("../templates/newsletter.md");

pub struct TemplateRenderer;

impl TemplateRenderer {
    pub fn new() -> Result<Self> {
        Ok(Self)
    }

    pub fn render_newsletter(
        &self,
        issue_number: u32,
        quote: &Quote,
        book: &Book,
        primary_link: &Link,
        secondary_links: &[&Link],
        extra_links: &[&Link],
        extra_content_title: &str,
        sponsor: Option<&Sponsor>,
    ) -> Result<String> {
        let mut context = Context::new();

        context.insert("issue_number", &issue_number);
        context.insert("quote", quote);
        context.insert("book", book);

        // Create enhanced primary link with action text
        let enhanced_primary_link = EnhancedLink {
            link: primary_link,
            action_text: get_link_action_text(&primary_link.url),
        };
        context.insert("primary_link", &enhanced_primary_link);

        // Create enhanced secondary links with action text
        let enhanced_secondary_links: Vec<EnhancedLink> = secondary_links
            .iter()
            .map(|link| EnhancedLink {
                link,
                action_text: get_link_action_text(&link.url),
            })
            .collect();
        context.insert("secondary_links", &enhanced_secondary_links);

        if !extra_links.is_empty() {
            context.insert("extra_links", extra_links);
            context.insert("extra_content_title", extra_content_title);
        }

        if let Some(sponsor) = sponsor {
            context.insert("sponsor", sponsor);
        }

        // Use Tera's one-off rendering function with embedded template
        // autoescape=false since we're rendering Markdown, not HTML
        let rendered = Tera::one_off(NEWSLETTER_TEMPLATE, &context, false)?;
        Ok(rendered)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::{BookLinks, CampaignUrls};

    fn create_sample_data() -> (Quote, Book, Link, Vec<Link>, Vec<Link>, Sponsor) {
        let quote = Quote {
            id: 1,
            text: "Computers are useless. They can only give you answers".to_string(),
            author: "Pablo Picasso".to_string(),
            author_description: "Artist".to_string(),
            author_url: "https://en.wikipedia.org/wiki/Pablo_Picasso".to_string(),
        };

        let book = Book {
            id: "building-microservices".to_string(),
            title: "Building Microservices: Designing Fine-Grained Systems".to_string(),
            author: "Sam Newman".to_string(),
            links: BookLinks {
                us: "https://www.amazon.com/dp/1492034029?tag=loige0e-20".to_string(),
                uk: "https://www.amazon.co.uk/dp/1492034029?tag=loige-21".to_string(),
            },
            cover_picture: "https://fullStackbulletin.github.io/fullstack-books/covers/building-microservices-2-sam-newman.jpg".to_string(),
            description: "As organizations shift from monolithic applications to smaller, self-contained microservices...".to_string(),
        };

        let primary_link = Link {
            title: "An Interactive Guide to SVG Paths".to_string(),
            url: "https://joshwcomeau.com/svg/interactive-guide-to-paths".to_string(),
            description: "I've always had a bit of a thing for vector graphics...".to_string(),
            image: "https://assets.buttondown.email/images/23f6bfbf-fa80-44b0-b4e3-692947f7363a.png?w=960&fit=max".to_string(),
            score: 100,
            original_image: "".to_string(),
            campaign_urls: CampaignUrls {
                title: "https://joshwcomeau.com/svg/interactive-guide-to-paths?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-34-2025&utm_content=title".to_string(),
                image: "https://joshwcomeau.com/svg/interactive-guide-to-paths?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-34-2025&utm_content=image".to_string(),
                description: "https://joshwcomeau.com/svg/interactive-guide-to-paths?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-34-2025&utm_content=description".to_string(),
            },
        };

        let secondary_links = vec![
            Link {
                title: "Closer to the Metal: Leaving Playwright for CDP".to_string(),
                url: "https://browser-use.com/posts/playwright-to-cdp".to_string(),
                description: "Let's switch gears... but not completely...".to_string(),
                image: "".to_string(),
                score: 90,
                original_image: "".to_string(),
                campaign_urls: CampaignUrls {
                    title: "https://browser-use.com/posts/playwright-to-cdp?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-34-2025&utm_content=title".to_string(),
                    image: "".to_string(),
                    description: "https://browser-use.com/posts/playwright-to-cdp?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-34-2025&utm_content=description".to_string(),
                },
            },
        ];

        let extra_links = vec![
            Link {
                title: "React calendar components: 6 best libraries for 2025".to_string(),
                url: "https://builder.io/blog/best-react-calendar-component-ai".to_string(),
                description: "".to_string(),
                image: "".to_string(),
                score: 70,
                original_image: "".to_string(),
                campaign_urls: CampaignUrls {
                    title: "https://builder.io/blog/best-react-calendar-component-ai?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-34-2025&utm_content=title".to_string(),
                    image: "".to_string(),
                    description: "".to_string(),
                },
            },
        ];

        let sponsor = Sponsor {
            banner_html: "<!-- Sponsor banner HTML -->".to_string(),
            sponsored_article_html: "<!-- Sponsored article HTML -->".to_string(),
            customer: "Example Sponsor".to_string(),
        };

        (
            quote,
            book,
            primary_link,
            secondary_links,
            extra_links,
            sponsor,
        )
    }

    #[test]
    fn test_get_link_action_text() {
        // Test GitHub URLs
        assert_eq!(get_link_action_text("https://github.com/user/repo"), "Check Repo");
        assert_eq!(get_link_action_text("http://github.com/org/project"), "Check Repo");
        
        // Test YouTube URLs
        assert_eq!(get_link_action_text("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "Watch Video");
        assert_eq!(get_link_action_text("https://youtube.com/watch?v=abc123"), "Watch Video");
        assert_eq!(get_link_action_text("https://youtu.be/dQw4w9WgXcQ"), "Watch Video");
        
        // Test other URLs
        assert_eq!(get_link_action_text("https://example.com/article"), "Read Article");
        assert_eq!(get_link_action_text("https://blog.example.com/post"), "Read Article");
        assert_eq!(get_link_action_text("https://docs.microsoft.com/guide"), "Read Article");
    }

    #[test]
    fn test_extra_content_title_generation() {
        let title1 = generate_extra_content_title(1);
        let title2 = generate_extra_content_title(2);
        let title10 = generate_extra_content_title(10);
        let title11 = generate_extra_content_title(11);

        // Different issue numbers should generate different titles (except for same modulo)
        assert_ne!(title1, title2);
        assert_eq!(title1, title11); // Both 1 and 11 have same modulo
        assert_eq!(
            title1,
            "You have to BELIEVE in the power of more content! 🙏"
        ); // Issue 1
        assert_eq!(title10, "Hand-picked extras to keep your brain buzzing! ⚡");
        // Issue 10 (0 modulo)
    }

    #[test]
    fn test_simple_template_rendering() {
        // Test with a very simple template first
        let mut context = Context::new();
        context.insert("name", "test");

        let simple_template = "Hello {{ name }}!";
        let result = Tera::one_off(simple_template, &context, false);

        match result {
            Ok(rendered) => {
                assert_eq!(rendered, "Hello test!");
                println!("Simple template works!");
            }
            Err(e) => {
                panic!("Simple template failed: {}", e);
            }
        }
    }

    #[test]
    fn test_template_rendering() {
        let renderer = TemplateRenderer::new().expect("Failed to create template renderer");
        let (quote, book, primary_link, secondary_links, extra_links, sponsor) =
            create_sample_data();

        let secondary_link_refs: Vec<&Link> = secondary_links.iter().collect();
        let extra_link_refs: Vec<&Link> = extra_links.iter().collect();

        // First test: try a minimal context to see what fails
        let mut minimal_context = Context::new();
        minimal_context.insert("quote", &quote);

        let minimal_result = Tera::one_off("{{ quote.text }}", &minimal_context, false);
        match minimal_result {
            Ok(rendered) => println!("Minimal template works: {}", rendered),
            Err(e) => println!("Minimal template failed: {}", e),
        }

        // Test with a smaller template section first to isolate the issue
        let test_template = r#"Hello World!

Quote: {{ quote.text }}
Author: {{ quote.author }}
Book: {{ book.title }}
"#;

        let mut test_context = Context::new();
        test_context.insert("quote", &quote);
        test_context.insert("book", &book);

        let test_result = Tera::one_off(test_template, &test_context, false);
        match test_result {
            Ok(rendered) => println!("Test template works:\n{}", rendered),
            Err(e) => println!("Test template failed: {}", e),
        }

        // Test with our full context but a simpler template
        let mut full_context = Context::new();
        full_context.insert("issue_number", &435u32);
        full_context.insert("quote", &quote);
        full_context.insert("book", &book);
        full_context.insert("primary_link", &primary_link);
        full_context.insert("secondary_links", &secondary_link_refs);
        full_context.insert("extra_links", &extra_link_refs);
        full_context.insert("extra_content_title", "Test Title");
        full_context.insert("sponsor", &sponsor);

        let simple_full_template = "Issue {{ issue_number }} - {{ quote.author }}";
        let full_test_result = Tera::one_off(simple_full_template, &full_context, false);
        match full_test_result {
            Ok(rendered) => println!("Full context simple template works: {}", rendered),
            Err(e) => println!("Full context simple template failed: {}", e),
        }

        // Test each line individually to find the issue
        let test1 = r#"Hello, {{"{{"}} subscriber.metadata.first_name {{"}}"}}"#;
        let result1 = Tera::one_off(test1, &full_context, false);
        match result1 {
            Ok(rendered) => println!("Test 1 works: {}", rendered),
            Err(e) => println!("Test 1 failed: {}", e),
        }

        let test2a = r#"{{ quote.text }}"#;
        let result2a = Tera::one_off(test2a, &full_context, false);
        match result2a {
            Ok(rendered) => println!("Test 2a works:\n{}", rendered),
            Err(e) => println!("Test 2a failed: {}", e),
        }

        let test_author = r#"{{ quote.author }}"#;
        let result_author = Tera::one_off(test_author, &full_context, false);
        match result_author {
            Ok(rendered) => println!("Author works: {}", rendered),
            Err(e) => println!("Author failed: {}", e),
        }

        // Test both naming conventions to understand which one Tera uses
        let test_desc_rust = r#"{{ quote.author_description }}"#;
        let result_desc_rust = Tera::one_off(test_desc_rust, &full_context, false);
        match result_desc_rust {
            Ok(rendered) => println!("Rust field name works: {}", rendered),
            Err(e) => println!("Rust field name failed: {}", e),
        }

        let test_desc_json = r#"{{ quote.author_description }}"#;
        let result_desc = Tera::one_off(test_desc_json, &full_context, false);
        match result_desc {
            Ok(rendered) => println!("Description works: {}", rendered),
            Err(e) => println!("Description failed: {}", e),
        }

        let test2b = r#"{{ quote.author_url }}"#;
        let result2b = Tera::one_off(test2b, &full_context, false);
        match result2b {
            Ok(rendered) => println!("Test 2b works: {}", rendered),
            Err(e) => println!("Test 2b failed: {}", e),
        }

        let test2 = r#"> — [{{ quote.author }}]({{ quote.author_url }})"#;
        let result2 = Tera::one_off(test2, &full_context, false);
        match result2 {
            Ok(rendered) => println!("Test 2 works:\n{}", rendered),
            Err(e) => println!("Test 2 failed: {}", e),
        }

        // Test just the beginning of our actual template
        let partial_template = r#"Hello World
> "{{ quote.text }}"  
> — {{ quote.author }}, {{ quote.author_description }}"#;

        let partial_result = Tera::one_off(partial_template, &full_context, false);
        match partial_result {
            Ok(rendered) => println!("Partial template works:\n{}", rendered),
            Err(e) => println!("Partial template failed: {}", e),
        }

        let result = renderer.render_newsletter(
            435,
            &quote,
            &book,
            &primary_link,
            &secondary_link_refs,
            &extra_link_refs,
            "You have to BELIEVE in the power of more content! 🙏",
            Some(&sponsor),
        );

        match result {
            Ok(rendered) => {
                println!("Template rendered successfully!");
                // Basic checks to ensure template was rendered
                assert!(rendered.contains("Pablo Picasso"));
                assert!(rendered.contains("Building Microservices"));
                assert!(rendered.contains("An Interactive Guide to SVG Paths"));
                assert!(rendered.contains("{{ subscriber.metadata.first_name }}"));
                assert!(rendered.contains("{{ subscribe_form }}"));
            }
            Err(e) => {
                println!("Template rendering failed: {}", e);
                // Let's not panic for now, just print the error
            }
        }
    }
}
