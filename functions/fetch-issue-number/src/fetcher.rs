use nom::{
    bytes::complete::{tag, take_until, take_while},
    IResult,
};
use scraper::selector;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ScrapeError {
    #[error("Request failed: {0}")]
    RequestFailed(#[from] reqwest::Error),
    #[error("Could not find a title with the current selector")]
    CannotFindCampaignTitle,
    #[error("Could not parse the issue number from the title: {0}")]
    CannotParseIssueNumber(String),
}

fn parse_number_from_title(title: &str) -> IResult<&str, u32> {
    let (input, _) = take_until("#")(title)?;
    let (input, _) = tag("#")(input)?;
    let (input, number) = take_while(|c: char| c.is_ascii_digit())(input)?;

    if number.is_empty() {
        return Err(nom::Err::Error(nom::error::Error::new(
            input,
            nom::error::ErrorKind::Digit,
        )));
    }

    // safe to unwrap because we will have at least a digit
    Ok((input, number.parse().unwrap()))
}

pub async fn fetch_last_issue_number(url: &str) -> Result<u32, ScrapeError> {
    let resp = reqwest::get(url).await?;
    let body = resp.text().await?;
    let document = scraper::Html::parse_document(&body);
    // safe to unwrap because we are hardcoding the selector
    let selector = selector::Selector::parse(".campaign a[title]").unwrap();

    // Title looks like: "🤓 #331: Putting the "You" in CPU"
    let last_link_title = document
        .select(&selector)
        .next()
        .ok_or(ScrapeError::CannotFindCampaignTitle)?
        .value()
        .attr("title")
        .unwrap(); // safe to unwrap because we are hardcoding the selector to have a title!

    let (_, issue_number) = parse_number_from_title(last_link_title)
        .map_err(|_| ScrapeError::CannotParseIssueNumber(last_link_title.to_string()))?;

    Ok(issue_number)
}

#[cfg(test)]
mod tests {
    use super::*;
    use httpmock::prelude::*;

    #[test]
    fn test_parse_number_from_title() {
        let title = "🤓 #331: Putting the \"You\" in CPU";
        let result = parse_number_from_title(title);
        assert!(matches!(result, Ok((_, 331))));
    }

    #[test]
    fn test_parse_number_from_title_without_number() {
        let title = "🤓 #: Putting the \"You\" in CPU";
        let result = parse_number_from_title(title);
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_with_empty_page() {
        // Start a lightweight mock server.
        let server = MockServer::start();

        // Create a mock on the server.
        let hello_mock = server.mock(|when, then| {
            when.method(GET).path("/test");
            then.status(200)
                .header("content-type", "text/html")
                .body("<html><body></body></html>");
        });

        let server_url = server.url("/test");
        let response = fetch_last_issue_number(&server_url).await;

        assert!(matches!(
            response,
            Err(ScrapeError::CannotFindCampaignTitle)
        ));
        hello_mock.assert();
    }

    // TODO: is there a way to simulate a dropped connection?
}
