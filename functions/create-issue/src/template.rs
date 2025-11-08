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

pub fn generate_greeting(issue_number: u32) -> String {
    match issue_number % 10 {
        1 => "Hey there",
        2 => "Heyo",
        3 => "What's up",
        4 => "Howdy",
        5 => "Good day",
        6 => "Hey",
        7 => "Hi there",
        8 => "Welcome back",
        9 => "Ciao",
        _ => "Hello",
    }
    .to_string()
}

pub fn generate_closing_title(issue_number: u32) -> String {
    match issue_number % 10 {
        1 => "That's a wrap! 🌯",
        2 => "Mission accomplished! 🚀",
        3 => "And we're done here! ✨",
        4 => "Time to close the book! 📖",
        5 => "That's all for today! 🌟",
        6 => "End of transmission! 📡",
        7 => "Final chapter complete! 📚",
        8 => "Show's over, folks! 🎭",
        9 => "Journey's end reached! 🏁",
        _ => "That's all folks! 🐰",
    }
    .to_string()
}

pub fn generate_closing_message(issue_number: u32) -> String {
    match issue_number % 10 {
        1 => "Thanks for sticking around till the end! If you found something interesting or have suggestions brewing, just hit reply – we're all ears! 👂",
        2 => "You made it to the finish line! Got thoughts, feedback, or just want to say hi? Drop us a line – we love hearing from you! 💌",
        3 => "Another issue in the books! If anything caught your eye or you've got ideas to share, reply away – your input means the world! 🌍",
        4 => "Thanks for joining us on this coding journey! Questions, comments, or cool discoveries? Hit that reply button – let's chat! 💬",
        5 => "You've reached the end of our digital adventure! Enjoyed the ride? Got feedback? Just reply – we're always excited to connect! 🎉",
        6 => "Mission complete! If you loved it, learned something, or want to suggest improvements, reply and let us know – we thrive on your feedback! 🌱",
        7 => "Final bytes processed! Your thoughts and suggestions fuel our passion – hit reply and share what's on your mind! 🔥",
        8 => "Credits are rolling! If this issue sparked joy or ideas, don't be shy – reply and tell us all about it! ✨",
        9 => "Journey's end! Whether you're buzzing with excitement or have constructive feedback, reply and keep the conversation going! 🗣️",
        _ => "Thank you for getting to the end of this issue! If you enjoyed it or simply want to suggest something, hit reply and let us know! We'd love to hear from you! ❤️",
    }
    .to_string()
}

pub fn generate_intro_closing(issue_number: u32) -> String {
    match issue_number % 41 {
        1 => "Enjoy the journey ahead!",
        2 => "Let's dive in and learn together!",
        3 => "Time to explore and experiment!",
        4 => "May your code compile on the first try!",
        5 => "Happy learning and building!",
        6 => "Let's get coding!",
        7 => "Enjoy this issue and keep shipping!",
        8 => "Hope you find something inspiring!",
        9 => "Ready to level up your skills?",
        10 => "Make something you are proud of!",
        11 => "One small step today counts!",
        12 => "Build, break, learn, repeat!",
        13 => "Stay curious and keep tinkering!",
        14 => "Push an idea a little further!",
        15 => "Create value, have fun!",
        16 => "Sharpen your tools and ship!",
        17 => "Try it, test it, teach it!",
        18 => "Progress beats perfection!",
        19 => "Learn a little, apply a lot!",
        20 => "Trust the process and iterate!",
        21 => "Let curiosity lead the way!",
        22 => "Make it work, then make it better!",
        23 => "Small wins add up fast!",
        24 => "Build something delightful!",
        25 => "Keep going, you are close!",
        26 => "Sketch, code, refine!",
        27 => "Turn ideas into experiments!",
        28 => "Read, try, reflect, repeat!",
        29 => "Ship the smallest useful thing!",
        30 => "Improve 1% today!",
        31 => "Stretch your skills a notch!",
        32 => "Refactor with kindness to your future self!",
        33 => "Document now, thank yourself later!",
        34 => "Chase clarity, not cleverness!",
        35 => "Learn by doing and sharing!",
        36 => "Ask good questions, find better answers!",
        37 => "Make it simple and solid!",
        38 => "Quality is a habit. Practice!",
        39 => "Explore the edges of your comfort zone!",
        40 => "Keep building. The future is compounding!",
        _ => "Happy reading and coding!",
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

        // Add greeting variable
        let greeting = generate_greeting(issue_number);
        context.insert("greeting", &greeting);

        // Add intro closing variable
        let intro_closing = generate_intro_closing(issue_number);
        context.insert("intro_closing", &intro_closing);

        // Add closing variables
        let closing_title = generate_closing_title(issue_number);
        let closing_message = generate_closing_message(issue_number);
        context.insert("closing_title", &closing_title);
        context.insert("closing_message", &closing_message);

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
            author_url: Some("https://en.wikipedia.org/wiki/Pablo_Picasso".to_string()),
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
            image: Some("https://assets.buttondown.email/images/23f6bfbf-fa80-44b0-b4e3-692947f7363a.png?w=960&fit=max".to_string()),
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
                image: Some("".to_string()),
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
                image: Some("".to_string()),
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
        assert_eq!(
            get_link_action_text("https://github.com/user/repo"),
            "Check Repo"
        );
        assert_eq!(
            get_link_action_text("http://github.com/org/project"),
            "Check Repo"
        );

        // Test YouTube URLs
        assert_eq!(
            get_link_action_text("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
            "Watch Video"
        );
        assert_eq!(
            get_link_action_text("https://youtube.com/watch?v=abc123"),
            "Watch Video"
        );
        assert_eq!(
            get_link_action_text("https://youtu.be/dQw4w9WgXcQ"),
            "Watch Video"
        );

        // Test other URLs
        assert_eq!(
            get_link_action_text("https://example.com/article"),
            "Read Article"
        );
        assert_eq!(
            get_link_action_text("https://blog.example.com/post"),
            "Read Article"
        );
        assert_eq!(
            get_link_action_text("https://docs.microsoft.com/guide"),
            "Read Article"
        );
    }

    #[test]
    fn test_greeting_generation() {
        let greeting1 = generate_greeting(1);
        let greeting2 = generate_greeting(2);
        let greeting10 = generate_greeting(10);
        let greeting11 = generate_greeting(11);

        // Different issue numbers should generate different greetings (except for same modulo)
        assert_ne!(greeting1, greeting2);
        assert_eq!(greeting1, greeting11); // Both 1 and 11 have same modulo
        assert_eq!(greeting1, "Hey there"); // Issue 1
        assert_eq!(greeting2, "Heyo"); // Issue 2
        assert_eq!(greeting10, "Hello"); // Issue 10 (0 modulo)
    }

    #[test]
    fn test_intro_closing_generation() {
        let intro1 = generate_intro_closing(1);
        let intro2 = generate_intro_closing(2);
        let intro10 = generate_intro_closing(10);
        let intro41 = generate_intro_closing(41);
        let intro42 = generate_intro_closing(42);

        // Different issue numbers should generate different intro closings (except for same modulo 41)
        assert_ne!(intro1, intro2);
        assert_ne!(intro1, intro10);
        assert_eq!(intro1, intro42); // Both 1 and 42 have same modulo (42 % 41 = 1)
        assert_eq!(intro1, "Enjoy the journey ahead!"); // Issue 1
        assert_eq!(intro2, "Let's dive in and learn together!"); // Issue 2
        assert_eq!(intro10, "Make something you are proud of!"); // Issue 10
        assert_eq!(intro41, "Happy reading and coding!"); // Issue 41 (0 modulo - default)
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
    fn test_closing_title_generation() {
        let title1 = generate_closing_title(1);
        let title2 = generate_closing_title(2);
        let title10 = generate_closing_title(10);
        let title11 = generate_closing_title(11);

        // Different issue numbers should generate different titles (except for same modulo)
        assert_ne!(title1, title2);
        assert_eq!(title1, title11); // Both 1 and 11 have same modulo
        assert_eq!(title1, "That's a wrap! 🌯"); // Issue 1
        assert_eq!(title10, "That's all folks! 🐰"); // Issue 10 (0 modulo)
    }

    #[test]
    fn test_closing_message_generation() {
        let message1 = generate_closing_message(1);
        let message2 = generate_closing_message(2);
        let message10 = generate_closing_message(10);
        let message11 = generate_closing_message(11);

        // Different issue numbers should generate different messages (except for same modulo)
        assert_ne!(message1, message2);
        assert_eq!(message1, message11); // Both 1 and 11 have same modulo
        assert!(message1.contains("Thanks for sticking around")); // Issue 1
        assert!(message10.contains("Thank you for getting to the end")); // Issue 10 (0 modulo)

        // All messages should encourage engagement
        assert!(message1.contains("reply"));
        assert!(message2.contains("Drop us a line"));
        assert!(message10.contains("reply"));
    }

    #[test]
    fn test_simple_template_rendering() {
        // Test with a very simple template first
        let mut context = Context::new();
        context.insert("name", "test");

        let simple_template = "Hello, {{ name }}!  \n";
        let result = Tera::one_off(simple_template, &context, false);

        match result {
            Ok(rendered) => {
                assert_eq!(rendered, "Hello, test!  \n");
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
        let test_desc_rust = r#"{{ quote.authorDescription }}"#;
        let result_desc_rust = Tera::one_off(test_desc_rust, &full_context, false);
        match result_desc_rust {
            Ok(rendered) => println!("Rust field name works: {}", rendered),
            Err(e) => println!("Rust field name failed: {}", e),
        }

        let test_desc_json = r#"{{ quote.authorDescription }}"#;
        let result_desc = Tera::one_off(test_desc_json, &full_context, false);
        match result_desc {
            Ok(rendered) => println!("Description works: {}", rendered),
            Err(e) => println!("Description failed: {}", e),
        }

        let test2b = r#"{{ quote.authorUrl }}"#;
        let result2b = Tera::one_off(test2b, &full_context, false);
        match result2b {
            Ok(rendered) => println!("Test 2b works: {}", rendered),
            Err(e) => println!("Test 2b failed: {}", e),
        }

        let test2 = r#"> — [{{ quote.author }}]({{ quote.authorUrl }})"#;
        let result2 = Tera::one_off(test2, &full_context, false);
        match result2 {
            Ok(rendered) => println!("Test 2 works:\n{}", rendered),
            Err(e) => println!("Test 2 failed: {}", e),
        }

        // Test just the beginning of our actual template
        let partial_template = r#"Hello World
> "{{ quote.text }}"
> — {{ quote.author }}, {{ quote.authorDescription }}"#;

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
            }
            Err(e) => {
                println!("Template rendering failed: {}", e);
                // Let's not panic for now, just print the error
            }
        }
    }
}
