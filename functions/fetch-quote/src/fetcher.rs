use crate::models::{InputQuote, Quote, Stats};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum FetchQuoteError {
    #[error("Failed to fetch quote")]
    FailedRequest(#[from] reqwest::Error),
}

pub async fn fetch_quote(base_url: &str, _issue_number: u32) -> Result<Quote, FetchQuoteError> {
    // Extract some useful information from the request
    let stats: Stats = reqwest::get(format!("{}/quotes/stats.json", base_url))
        .await?
        .json()
        .await?;

    // Generate a random quote index in the range [0, stats.total)
    let random_index = rand::random_range(0..stats.total);
    let quote_url = format!("{}/quotes/{}.json", base_url, random_index);
    let input_quote: InputQuote = reqwest::get(&quote_url).await?.json().await?;
    let output_quote: Quote = input_quote.into();

    Ok(output_quote)
}

#[cfg(test)]
mod tests {
    use super::*;
    use httpmock::prelude::*;

    #[tokio::test]
    async fn test_fetch_quote_random() {
        // Start a lightweight mock server.
        let server = MockServer::start();

        // Create a mock on the server that can be called multiple times
        server.mock_async(|when, then| {
            when.method(GET).path("/quotes/stats.json");
            then.status(200)
                .header("content-type", "application/json")
                .body(
                    r#"
            {
                "total": 3,
                "all": "https://fullStackbulletin.github.io/tech-quotes/quotes/all.json",
                "first": "https://fullStackbulletin.github.io/tech-quotes/quotes/0.json",
                "last": "https://fullStackbulletin.github.io/tech-quotes/quotes/2.json",
                "urlPrefix": "https://fullStackbulletin.github.io/tech-quotes/quotes"
            }
            "#,
                );
        }).await;

        // Mock all possible quote IDs (0, 1, 2) since we're using a small total
        server.mock_async(|when, then| {
            when.method(GET).path("/quotes/0.json");
            then.status(200)
                .header("content-type", "application/json")
                .body(r#"
            {
                "id": 0,
                "text": "Test quote 0",
                "author": {
                  "id": "test-author",
                  "name": "Test Author",
                  "description": "Author",
                  "wiki": "https://en.wikipedia.org/wiki/Test",
                  "url": "https://fullStackbulletin.github.io/tech-quotes/authors/test.json"
                },
                "url": "https://fullStackbulletin.github.io/tech-quotes/quotes/0.json"
            }
            "#);
        }).await;

        server.mock_async(|when, then| {
            when.method(GET).path("/quotes/1.json");
            then.status(200)
                .header("content-type", "application/json")
                .body(r#"
            {
                "id": 1,
                "text": "Test quote 1",
                "author": {
                  "id": "test-author",
                  "name": "Test Author",
                  "description": "Author",
                  "url": "https://fullStackbulletin.github.io/tech-quotes/authors/test.json"
                },
                "url": "https://fullStackbulletin.github.io/tech-quotes/quotes/1.json"
            }
            "#);
        }).await;

        server.mock_async(|when, then| {
            when.method(GET).path("/quotes/2.json");
            then.status(200)
                .header("content-type", "application/json")
                .body(r#"
            {
                "id": 2,
                "text": "Test quote 2",
                "author": {
                  "id": "test-author",
                  "name": "Test Author",
                  "description": "Author",
                  "wiki": "https://en.wikipedia.org/wiki/Test2",
                  "url": "https://fullStackbulletin.github.io/tech-quotes/authors/test.json"
                },
                "url": "https://fullStackbulletin.github.io/tech-quotes/quotes/2.json"
            }
            "#);
        }).await;

        // Test that the function successfully fetches a random quote
        let response = fetch_quote(&server.base_url(), 0).await;

        assert!(response.is_ok(), "Failed to fetch quote: {:?}", response.err());

        let quote = response.unwrap();
        // Verify the quote ID is in the valid range
        assert!(quote.id < 3, "Quote ID {} is out of range [0, 3)", quote.id);
        assert_eq!(quote.author, "Test Author");
    }
}
