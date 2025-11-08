use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct Stats {
    pub total: u32,
    pub all: String,
    pub first: String,
    pub last: String,
    #[serde(rename = "urlPrefix")]
    pub url_prefix: String,
}

#[derive(Deserialize)]
pub struct Author {
    pub id: String,
    pub name: String,
    pub description: String,
    pub wiki: Option<String>,
    pub url: String,
}

#[derive(Deserialize)]
pub struct InputQuote {
    pub id: u32,
    pub text: String,
    pub author: Author,
    pub url: String,
}

#[derive(Deserialize, Serialize)]
pub struct Quote {
    pub id: u32,
    pub text: String,
    pub author: String,
    #[serde(rename = "authorDescription")]
    pub author_description: String,
    #[serde(rename = "authorUrl", skip_serializing_if = "Option::is_none")]
    pub author_url: Option<String>,
}

impl From<InputQuote> for Quote {
    fn from(input: InputQuote) -> Self {
        Quote {
            id: input.id,
            text: input.text,
            author: input.author.name,
            author_description: input.author.description,
            author_url: input.author.wiki,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deserialize_input_quote_without_wiki() {
        let json = r#"
        {
            "id": 22,
            "text": "Good programmers use their brains, but good guidelines save us having to think out every case",
            "author": {
              "id": "francis-glassborow",
              "name": "Francis Glassborow",
              "description": "Author",
              "url": "https://fullStackbulletin.github.io/tech-quotes/authors/francis-glassborow.json"
            },
            "url": "https://fullStackbulletin.github.io/tech-quotes/quotes/22.json"
        }
        "#;

        let result: Result<InputQuote, _> = serde_json::from_str(json);

        match result {
            Ok(quote) => {
                assert_eq!(quote.id, 22);
                assert_eq!(quote.text, "Good programmers use their brains, but good guidelines save us having to think out every case");
                assert_eq!(quote.author.name, "Francis Glassborow");
                assert_eq!(quote.author.description, "Author");
                assert_eq!(quote.author.wiki, None);
            }
            Err(e) => panic!("Failed to deserialize: {:?}", e),
        }
    }

    #[test]
    fn test_deserialize_quote_with_null_author_url() {
        // This tests the Quote struct deserialization with null authorUrl
        let json = r#"
        {
            "id": 22,
            "text": "Good programmers use their brains, but good guidelines save us having to think out every case",
            "author": "Francis Glassborow",
            "authorDescription": "Author",
            "authorUrl": null
        }
        "#;

        let result: Result<Quote, _> = serde_json::from_str(json);

        match result {
            Ok(quote) => {
                assert_eq!(quote.id, 22);
                assert_eq!(quote.author, "Francis Glassborow");
                assert_eq!(quote.author_description, "Author");
                assert_eq!(quote.author_url, None);
            }
            Err(e) => panic!("Failed to deserialize Quote with null authorUrl: {:?}", e),
        }
    }

    #[test]
    fn test_serialize_and_deserialize_quote_without_wiki() {
        // Test the full cycle: InputQuote -> Quote -> JSON -> Quote
        let input_json = r#"
        {
            "id": 22,
            "text": "Good programmers use their brains, but good guidelines save us having to think out every case",
            "author": {
              "id": "francis-glassborow",
              "name": "Francis Glassborow",
              "description": "Author",
              "url": "https://fullStackbulletin.github.io/tech-quotes/authors/francis-glassborow.json"
            },
            "url": "https://fullStackbulletin.github.io/tech-quotes/quotes/22.json"
        }
        "#;

        let input_quote: InputQuote =
            serde_json::from_str(input_json).expect("Failed to deserialize InputQuote");
        let quote: Quote = input_quote.into();

        // Serialize to JSON
        let serialized = serde_json::to_string(&quote).expect("Failed to serialize Quote");
        println!("Serialized Quote: {}", serialized);

        // Verify that authorUrl field is omitted (not null) when None
        assert!(
            !serialized.contains("authorUrl"),
            "authorUrl field should be omitted when None, but found in: {}",
            serialized
        );

        // Deserialize back
        let deserialized: Quote =
            serde_json::from_str(&serialized).expect("Failed to deserialize Quote");

        assert_eq!(deserialized.id, 22);
        assert_eq!(deserialized.author, "Francis Glassborow");
        assert_eq!(deserialized.author_url, None);
    }

    #[test]
    fn test_serialize_quote_with_author_url() {
        // Test that authorUrl IS included when Some
        let quote = Quote {
            id: 1,
            text: "Test quote".to_string(),
            author: "Test Author".to_string(),
            author_description: "Tester".to_string(),
            author_url: Some("https://example.com".to_string()),
        };

        let serialized = serde_json::to_string(&quote).expect("Failed to serialize Quote");
        println!("Serialized Quote with URL: {}", serialized);

        // Verify that authorUrl field IS included when Some
        assert!(
            serialized.contains("authorUrl"),
            "authorUrl field should be included when Some, but not found in: {}",
            serialized
        );
        assert!(
            serialized.contains("https://example.com"),
            "authorUrl value should be in serialized output"
        );
    }
}
