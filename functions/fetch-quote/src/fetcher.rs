use crate::models::{InputQuote, Quote, Stats};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum FetchQuoteError {
    #[error("Failed to fetch quote")]
    FailedRequest(#[from] reqwest::Error),
}

pub async fn fetch_quote(base_url: &str, issue_number: u32) -> Result<Quote, FetchQuoteError> {
    // Extract some useful information from the request
    let stats: Stats = reqwest::get(format!("{}/quotes/stats.json", base_url))
        .await?
        .json()
        .await?;

    let current_index = issue_number % stats.total;
    let quote_url = format!("{}/quotes/{}.json", base_url, current_index);
    let input_quote: InputQuote = reqwest::get(&quote_url).await?.json().await?;
    let output_quote: Quote = input_quote.into();

    Ok(output_quote)
}

#[cfg(test)]
mod tests {
    use super::*;
    use httpmock::prelude::*;

    #[tokio::test]
    async fn test_fetch_quote_with_wiki() {
        // Start a lightweight mock server.
        let server = MockServer::start();

        // Create a mock on the server.
        let stats_mock = server
            .mock_async(|when, then| {
                when.method(GET).path("/quotes/stats.json");
                then.status(200)
                    .header("content-type", "application/json")
                    .body(
                        r#"
                {
                    "total": 53,
                    "all": "https://fullStackbulletin.github.io/tech-quotes/quotes/all.json",
                    "first": "https://fullStackbulletin.github.io/tech-quotes/quotes/0.json",
                    "last": "https://fullStackbulletin.github.io/tech-quotes/quotes/52.json",
                    "urlPrefix": "https://fullStackbulletin.github.io/tech-quotes/quotes"
                }
                "#,
                    );
            })
            .await;
        let quote_mock = server.mock_async(|when, then| {
            when.method(GET).path("/quotes/14.json");
            then.status(200)
                .header("content-type", "application/json")
                .body(r#"
                {
                    "id": 14,
                    "text": "The art challenges the technology, and the technology inspires the art",
                    "author": {
                      "id": "john-lasseter",
                      "name": "John Lasseter",
                      "description": "Director",
                      "wiki": "https://en.wikipedia.org/wiki/John_Lasseter",
                      "url": "https://fullStackbulletin.github.io/tech-quotes/authors/john-lasseter.json"
                    },
                    "url": "https://fullStackbulletin.github.io/tech-quotes/quotes/17.json"
                }
                "#);
        }).await;

        let response = fetch_quote(&server.base_url(), 67).await; // 67 % 53 = 14 -> should fetch "/quotes/14.json"

        let _expected_quote = Quote {
            id: 14,
            text: "The art challenges the technology, and the technology inspires the art"
                .to_string(),
            author: "John Lasseter".to_string(),
            author_description: "Director".to_string(),
            author_url: Some("https://en.wikipedia.org/wiki/John_Lasseter".to_string()),
        };

        assert!(matches!(response, Ok(_expected_quote)));
        stats_mock.assert_async().await;
        quote_mock.assert_async().await;
    }
}
