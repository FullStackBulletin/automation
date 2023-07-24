use lambda_runtime::{run, service_fn, Error, LambdaEvent};

async fn function_handler(
    event: LambdaEvent<serde_json::Value>,
) -> Result<serde_json::Value, Error> {
    Ok(serde_json::json!({
        "issue_number": 22,
        "event": event.payload,
    }))
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        // disable printing the name of the module in every log line.
        .with_target(false)
        // disabling time is handy because CloudWatch will add the ingestion time.
        .without_time()
        .init();

    run(service_fn(function_handler)).await
}
