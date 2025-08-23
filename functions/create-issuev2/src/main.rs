use lambda_runtime::{run, service_fn, tracing, Error};

mod event_handler;
mod model;
mod template;
mod datetime_utils;
use event_handler::function_handler;


#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing::init_default_subscriber();

    run(service_fn(function_handler)).await
}
