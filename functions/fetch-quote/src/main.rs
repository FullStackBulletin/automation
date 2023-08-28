use lambda_runtime::{run, service_fn, Error, LambdaEvent};

mod models;
use models::{InputQuote, Quote, Request, Stats};

async fn function_handler(event: LambdaEvent<Request>) -> Result<Quote, Error> {
    // Extract some useful information from the request
    let stats: Stats =
        reqwest::get("https://fullStackbulletin.github.io/tech-quotes/quotes/stats.json")
            .await?
            .json()
            .await?;

    let current_index = event.payload.next_issue.number % stats.total;
    let quote_url = format!("{}/{}.json", stats.url_prefix, current_index);
    let input_quote: InputQuote = reqwest::get(&quote_url).await?.json().await?;
    let output_quote: Quote = input_quote.into();

    Ok(output_quote)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_target(false)
        .without_time()
        .init();

    run(service_fn(function_handler)).await
}
