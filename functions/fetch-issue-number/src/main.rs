use lambda_runtime::{run, service_fn, tracing, Error, LambdaEvent};
use std::env;
mod fetcher;

async fn function_handler(
    _event: LambdaEvent<serde_json::Value>,
) -> Result<serde_json::Value, Error> {
    let url = env::var("URL")?;
    let last_number = fetcher::fetch_last_issue_number(&url).await?;
    Ok(serde_json::json!({
        "number": last_number + 1
    }))
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing::init_default_subscriber();

    run(service_fn(function_handler)).await
}
