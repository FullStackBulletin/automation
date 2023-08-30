use lambda_runtime::{run, service_fn, Error, LambdaEvent};
use std::env;

mod fetcher;
mod models;
use fetcher::fetch_quote;
use models::{Quote, Request};

async fn function_handler(event: LambdaEvent<Request>) -> Result<Quote, Error> {
    let base_url = env::var("BASE_URL")
        .unwrap_or("https://fullstackbulletin.github.io/tech-quotes".to_string());
    let quote = fetch_quote(&base_url, event.payload.next_issue.number).await?;
    Ok(quote)
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
